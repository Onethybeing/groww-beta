import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toISTDate, dateInMonth, monthKey, nextMonthKey, daysBetween } from "@/lib/engine/dates";
import { applyTrade, type Txn } from "@/lib/engine/portfolio";
import { computeStreak } from "@/lib/engine/streak";
import { dueInstalments, type Instalment, type SipPlan } from "@/lib/engine/instalments";
import { evaluateMilestones, type MilestoneKey } from "@/lib/engine/milestones";
import { GOAL_DEFAULTS, PRESET_ANSWERS, type Answers, type PersonaId } from "@/lib/engine/persona";

export const STORE_KEY = "groww-genz";
export const STORE_VERSION = 1;
export const START_CASH = 10000;

export interface GoalInfo { name: string; target: number }
export interface Reflection { prompt: string; answer: string; date: string }
export interface LessonDone { quizCorrect: boolean; completedAt: string }

export interface AppData {
  answers: Answers | null;
  goal: GoalInfo | null;
  lessons: Record<string, LessonDone>;
  cash: number;
  transactions: Txn[];
  reflections: Reflection[];
  timeMachineRuns: number;
  sipPlan: SipPlan | null;
  instalments: Instalment[];
  skippedMonths: string[];
  milestones: Partial<Record<MilestoneKey, string>>;
  clockOffsetDays: number;
  newMilestone: MilestoneKey | null;
  /** Beginner hints (explainers, tips, Start-small picks) shown across the app. */
  hintsOn: boolean;
  welcomeSeen: boolean;
}

export type WelcomeAnswers = Pick<Answers, "experience" | "budget" | "horizon">;

export interface AppActions {
  setOnboarding(answers: Answers, goal: GoalInfo): void;
  /** The optional new-user prompt; `null` means skipped. */
  setWelcome(answers: WelcomeAnswers | null): void;
  setHintsOn(on: boolean): void;
  completeLesson(id: string, quizCorrect: boolean): void;
  recordTimeMachineRun(): void;
  trade(t: { symbol: string; side: "buy" | "sell"; qty: number; price: number }, fractional: boolean): { ok: true } | { ok: false; error: string };
  addReflection(prompt: string, answer: string): void;
  startSip(p: Omit<SipPlan, "startDate">): void;
  advanceMonth(skipSip: boolean): void;
  applyPreset(id: PersonaId): void;
  dismissMilestone(): void;
  reset(): void;
}

export type AppState = AppData & AppActions;

export const initialData: AppData = {
  answers: null, goal: null, lessons: {}, cash: START_CASH, transactions: [], reflections: [], timeMachineRuns: 0,
  sipPlan: null, instalments: [], skippedMonths: [], milestones: {}, clockOffsetDays: 0, newMilestone: null,
  hintsOn: true, welcomeSeen: false,
};

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
    streak: computeStreak(s.instalments.map((i) => i.date), today).current,
  }, s.milestones, today);
  const keys = Object.keys(fresh) as MilestoneKey[];
  if (keys.length === 0) return {};
  return { milestones: { ...s.milestones, ...fresh }, newMilestone: keys[keys.length - 1] };
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
        setOnboarding: (answers, goal) => update({ answers, goal }),
        setWelcome: (w) => {
          if (!w) return update({ welcomeSeen: true, hintsOn: false });
          const goalKey = w.horizon === "lt1" ? "trip" : "wealth";
          update({
            answers: { goal: goalKey, reaction: "wait", ...w },
            goal: get().goal ?? GOAL_DEFAULTS[goalKey],
            welcomeSeen: true,
            hintsOn: true,
          });
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
        addReflection: (prompt, answer) => update({ reflections: [...get().reflections, { prompt, answer, date: today() }] }),
        startSip: (p) => {
          if (get().sipPlan) return;
          const plan: SipPlan = { ...p, startDate: today() };
          update({ sipPlan: plan, instalments: dueInstalments(plan, [], [], plan.startDate) });
        },
        advanceMonth: (skipSip) => {
          const s = get();
          const cur = today();
          const day = s.sipPlan?.day ?? Number(cur.slice(8, 10));
          const next = dateInMonth(nextMonthKey(monthKey(cur)), day);
          const skippedMonths = skipSip && s.sipPlan ? [...s.skippedMonths, monthKey(next)] : s.skippedMonths;
          const extra = s.sipPlan ? dueInstalments(s.sipPlan, s.instalments, skippedMonths, next) : [];
          update({ clockOffsetDays: s.clockOffsetDays + daysBetween(cur, next), skippedMonths, instalments: [...s.instalments, ...extra] });
        },
        applyPreset: (id) => update({ answers: PRESET_ANSWERS[id], goal: GOAL_DEFAULTS[PRESET_ANSWERS[id].goal], welcomeSeen: true, hintsOn: true }),
        dismissMilestone: () => set({ newMilestone: null }),
        reset: () => set({ ...initialData }),
      };
    },
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({ ...initialData }) as AppState,
    },
  ),
);

export const useToday = () => useApp((s) => todayFor(s.clockOffsetDays));
