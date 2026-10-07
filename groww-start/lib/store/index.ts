import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toISTDate, dateInMonth, monthKey, nextMonthKey, daysBetween } from "@/lib/engine/dates";
import { applyTrade, type Txn } from "@/lib/engine/portfolio";
import { MIN_SIP, type SipPlan } from "@/lib/engine/instalments";
import { collectDue, updateSip, type Sip, type SipInstalment, type SipPatch } from "@/lib/engine/sips";
import { evaluateMilestones, type MilestoneKey } from "@/lib/engine/milestones";
import { GOAL_DEFAULTS, PRESET_ANSWERS, type Answers, type PersonaId } from "@/lib/engine/persona";
import { round2 } from "@/lib/engine/num";
import { computeStreak as streakOf, type StreakResult } from "@/lib/engine/streak";
import { isValidCode, normaliseCode, referralCode, referralFreezes } from "@/lib/engine/referrals";

export const STORE_KEY = "groww-genz";
export const STORE_VERSION = 3;
/** Practice (virtual) money. */
export const START_CASH = 10000;
/** Real-demo balance used for Buy/Sell and SIPs. */
export const START_WALLET = 25000;
export const MAX_ADD_MONEY = 100000;

export interface GoalInfo { name: string; target: number }
export interface Reflection { prompt: string; answer: string; date: string }
export interface LessonDone { quizCorrect: boolean; completedAt: string }
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export interface AppData {
  answers: Answers | null;
  goal: GoalInfo | null;
  lessons: Record<string, LessonDone>;
  /** Practice: virtual cash and trades. */
  cash: number;
  transactions: Txn[];
  reflections: Reflection[];
  timeMachineRuns: number;
  /** Real-demo: balance, orders, SIPs. */
  wallet: number;
  orders: Txn[];
  sips: Sip[];
  instalments: SipInstalment[];
  missed: SipInstalment[];
  skippedMonths: string[];
  watchlist: string[];
  milestones: Partial<Record<MilestoneKey, string>>;
  clockOffsetDays: number;
  newMilestone: MilestoneKey | null;
  /** Beginner hints (explainers, tips, Start-small picks) shown across the app. */
  hintsOn: boolean;
  welcomeSeen: boolean;
  /** Referrals (post-MVP): rewards are streak freezes only. */
  userId: string;
  referrals: { name: string; joinedAt: string }[];
  referredBy: string | null;
}

/** Every user has one streak freeze; referrals add more (capped). */
export const BASE_FREEZES = 1;
export const totalFreezesOf = (s: Pick<AppData, "referrals" | "referredBy">) =>
  BASE_FREEZES + referralFreezes(s.referrals.length, s.referredBy !== null);
export const myCodeOf = (s: Pick<AppData, "userId">) => referralCode(s.userId);
/** The one place the SIP streak (with all earned freezes) is computed. */
export const streakFor = (s: Pick<AppData, "instalments" | "referrals" | "referredBy">, today: string): StreakResult =>
  streakOf(s.instalments.map((i) => i.date), today, totalFreezesOf(s));
export const MAX_DEMO_FRIENDS = 5;

export type WelcomeAnswers = Pick<Answers, "goal" | "experience" | "budget" | "horizon">;
type OrderInput = { symbol: string; side: "buy" | "sell"; qty: number; price: number };

export interface AppActions {
  setOnboarding(answers: Answers, goal: GoalInfo): void;
  /** The optional new-user prompt; `null` means skipped. */
  setWelcome(answers: WelcomeAnswers | null): void;
  setHintsOn(on: boolean): void;
  completeLesson(id: string, quizCorrect: boolean): void;
  recordTimeMachineRun(): void;
  /** Practice trade with virtual cash. */
  trade(t: OrderInput, fractional: boolean): Result;
  /** Real-demo order paid from the demo balance. */
  placeOrder(t: OrderInput, fractional: boolean): Result;
  addMoney(amount: number): Result;
  toggleWatch(symbol: string): void;
  addReflection(prompt: string, answer: string): void;
  /** Starts a SIP and debits its first instalment today. */
  startSip(p: Omit<SipPlan, "startDate">): Result<{ id: string }>;
  updateSip(id: string, patch: SipPatch): Result;
  advanceMonth(skipSip: boolean): void;
  applyPreset(id: PersonaId): void;
  /** Invites are for new investors only (no SIPs or orders yet). */
  acceptReferral(code: string): Result;
  /** Demo control: pretend a friend joined with your code. */
  simulateFriendJoined(): void;
  /** Writes the generated user id to storage so the invite code stays stable across reloads. */
  persistIdentity(): void;
  dismissMilestone(): void;
  reset(): void;
}

export type AppState = AppData & AppActions;

export const initialData: AppData = {
  answers: null, goal: null, lessons: {}, cash: START_CASH, transactions: [], reflections: [], timeMachineRuns: 0,
  wallet: START_WALLET, orders: [], sips: [], instalments: [], missed: [], skippedMonths: [], watchlist: [],
  milestones: {}, clockOffsetDays: 0, newMilestone: null, hintsOn: true, welcomeSeen: false,
  userId: "local", referrals: [], referredBy: null,
};

const newUserId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `u-${Date.now()}`);

export function todayFor(offsetDays: number, now: Date = new Date()): string {
  return toISTDate(new Date(now.getTime() + offsetDays * 86_400_000));
}

function settle(s: AppData): Partial<AppData> {
  const today = todayFor(s.clockOffsetDays);
  const fresh = evaluateMilestones({
    lessonsCompleted: Object.keys(s.lessons).length,
    timeMachineRuns: s.timeMachineRuns,
    mockBuys: s.transactions.filter((t) => t.side === "buy").length,
    instalments: s.instalments.length,
    streak: streakFor(s, today).current,
  }, s.milestones, today);
  const keys = Object.keys(fresh) as MilestoneKey[];
  if (keys.length === 0) return {};
  return { milestones: { ...s.milestones, ...fresh }, newMilestone: keys[keys.length - 1] };
}

/** v1 had a single `sipPlan` and no demo balance. */
export function migrateV1(old: Record<string, unknown>): AppData {
  const { sipPlan, ...rest } = old as { sipPlan?: SipPlan | null } & Partial<AppData> & { instalments?: { date: string; amount: number }[] };
  const sips: Sip[] = sipPlan ? [{ id: "sip-1", ...sipPlan, status: "active" }] : [];
  const instalments: SipInstalment[] = sipPlan ? (rest.instalments ?? []).map((i) => ({ ...i, sipId: "sip-1" })) : [];
  const spent = instalments.reduce((a, i) => a + i.amount, 0);
  return { ...initialData, userId: newUserId(), ...rest, sips, instalments, wallet: Math.max(0, round2(START_WALLET - spent)) };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const update = (patch: Partial<AppData>) => {
        set(patch);
        set(settle(get()));
      };
      const today = () => todayFor(get().clockOffsetDays);
      return {
        ...initialData,
        userId: newUserId(),
        setOnboarding: (answers, goal) => update({ answers, goal }),
        setWelcome: (w) => {
          if (!w) return update({ welcomeSeen: true, hintsOn: false });
          update({ answers: { reaction: "wait", ...w }, goal: GOAL_DEFAULTS[w.goal], welcomeSeen: true, hintsOn: true });
        },
        setHintsOn: (hintsOn) => set({ hintsOn }),
        completeLesson: (id, quizCorrect) => {
          if (get().lessons[id]) return;
          update({ lessons: { ...get().lessons, [id]: { quizCorrect, completedAt: today() } } });
        },
        recordTimeMachineRun: () => update({ timeMachineRuns: get().timeMachineRuns + 1 }),
        trade: (t, fractional) => {
          const s = get();
          const r = applyTrade({ cash: s.cash, transactions: s.transactions }, { ...t, id: crypto.randomUUID(), date: today() }, { fractional });
          if (!r.ok) return r;
          update(r.state);
          return { ok: true };
        },
        placeOrder: (t, fractional) => {
          const s = get();
          const r = applyTrade({ cash: s.wallet, transactions: s.orders }, { ...t, id: crypto.randomUUID(), date: today() }, { fractional, balanceLabel: "demo balance" });
          if (!r.ok) return r;
          update({ wallet: r.state.cash, orders: r.state.transactions });
          return { ok: true };
        },
        addMoney: (amount) => {
          if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_ADD_MONEY) return { ok: false, error: "Add between ₹1 and ₹1,00,000" };
          update({ wallet: round2(get().wallet + amount) });
          return { ok: true };
        },
        toggleWatch: (symbol) => {
          const w = get().watchlist;
          set({ watchlist: w.includes(symbol) ? w.filter((x) => x !== symbol) : [...w, symbol] });
        },
        addReflection: (prompt, answer) => update({ reflections: [...get().reflections, { prompt, answer, date: today() }] }),
        startSip: (p) => {
          const s = get();
          if (!(p.amount >= MIN_SIP)) return { ok: false, error: `Minimum SIP is ₹${MIN_SIP}` };
          if (s.sips.some((x) => x.symbol === p.symbol && x.status !== "cancelled")) return { ok: false, error: "You already have a SIP in this fund" };
          const sip: Sip = { ...p, id: crypto.randomUUID(), startDate: today(), status: "active" };
          const r = collectDue([sip], [], [], sip.startDate, s.wallet);
          if (r.paid.length === 0) return { ok: false, error: "Not enough demo balance for the first instalment" };
          update({ sips: [...s.sips, sip], instalments: [...s.instalments, ...r.paid], wallet: r.wallet });
          return { ok: true, id: sip.id };
        },
        updateSip: (id, patch) => {
          const r = updateSip(get().sips, id, patch, today());
          if (!r.ok) return r;
          update({ sips: r.sips });
          return { ok: true };
        },
        advanceMonth: (skipSip) => {
          const s = get();
          const cur = today();
          const firstActive = s.sips.find((x) => x.status === "active");
          const next = dateInMonth(nextMonthKey(monthKey(cur)), firstActive?.day ?? Number(cur.slice(8, 10)));
          const skippedMonths = skipSip && firstActive ? [...s.skippedMonths, monthKey(next)] : s.skippedMonths;
          const r = collectDue(s.sips, s.instalments, skippedMonths, next, s.wallet, s.missed);
          update({
            clockOffsetDays: s.clockOffsetDays + daysBetween(cur, next),
            skippedMonths,
            instalments: [...s.instalments, ...r.paid],
            missed: [...s.missed, ...r.missed],
            wallet: r.wallet,
          });
        },
        applyPreset: (id) => update({ answers: PRESET_ANSWERS[id], goal: GOAL_DEFAULTS[PRESET_ANSWERS[id].goal], welcomeSeen: true, hintsOn: true }),
        acceptReferral: (code) => {
          const c = normaliseCode(code);
          const s = get();
          if (!isValidCode(c)) return { ok: false, error: "That invite code isn't valid" };
          if (c === referralCode(s.userId)) return { ok: false, error: "That's your own invite code" };
          if (s.referredBy) return { ok: false, error: "You've already joined with an invite" };
          if (s.instalments.length > 0 || s.orders.length > 0) return { ok: false, error: "Invites are for new investors only" };
          update({ referredBy: c });
          return { ok: true };
        },
        simulateFriendJoined: () => {
          const r = get().referrals;
          if (r.length >= MAX_DEMO_FRIENDS) return;
          update({ referrals: [...r, { name: `Friend ${r.length + 1}`, joinedAt: today() }] });
        },
        persistIdentity: () => set({ userId: get().userId }),
        dismissMilestone: () => set({ newMilestone: null }),
        reset: () => set({ ...initialData, userId: newUserId() }),
      };
    },
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const old = persisted && typeof persisted === "object" ? (persisted as Record<string, unknown>) : null;
        if (old && version === 1) return migrateV1(old) as AppState;
        if (old && version === 2) return { ...initialData, ...old, userId: typeof old.userId === "string" ? old.userId : newUserId() } as AppState;
        return { ...initialData, userId: newUserId() } as AppState;
      },
      onRehydrateStorage: () => (state) => state?.persistIdentity(),
    },
  ),
);

export const useToday = () => useApp((s) => todayFor(s.clockOffsetDays));
/** True when at least one SIP is running (active). */
export const useHasActiveSip = () => useApp((s) => s.sips.some((x) => x.status === "active"));
