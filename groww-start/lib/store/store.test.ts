import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key() { return null; }
  get length() { return this.m.size; }
}

let mod: typeof import("./index");

beforeAll(async () => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-07T06:00:00Z"));
  mod = await import("./index");
});

beforeEach(() => mod.useApp.getState().reset());

const s = () => mod.useApp.getState();
const useApp = () => mod.useApp;

describe("store", () => {
  it("computes today in IST with offset", () => {
    expect(mod.todayFor(0)).toBe("2026-10-07");
    expect(mod.todayFor(31)).toBe("2026-11-07");
  });

  it("starts one SIP per fund, even when confirm is double-tapped; first instalment debits the demo balance", () => {
    const first = s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    const again = s().startSip({ category: "index", symbol: "MF120716", amount: 500, day: 7 });
    expect(first.ok).toBe(true);
    expect(again).toEqual({ ok: false, error: "You already have a SIP in this fund" });
    expect(s().sips).toHaveLength(1);
    expect(s().sips[0]).toMatchObject({ amount: 100, status: "active" });
    expect(s().instalments).toEqual([{ date: "2026-10-07", amount: 100, sipId: s().sips[0].id }]);
    expect(s().wallet).toBe(24900);
    expect(s().milestones.first_sip).toBe("2026-10-07");
    expect(s().newMilestone).toBe("first_sip");
  });

  it("advances months, adds instalments and earns the 3-month streak", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(false);
    s().advanceMonth(false);
    expect(s().instalments.map((i) => i.date)).toEqual(["2026-10-07", "2026-11-07", "2026-12-07"]);
    expect(s().milestones.streak_3).toBe("2026-12-07");
  });

  it("skip-month records a skip and adds no instalment", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(true);
    expect(s().skippedMonths).toEqual(["2026-11"]);
    expect(s().instalments).toHaveLength(1);
  });

  it("runs several SIPs, pauses one, and stops paying when the demo balance runs out", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    const b = s().startSip({ category: "liquid", symbol: "MF143269", amount: 500, day: 7 });
    if (!b.ok) throw new Error(b.error);
    expect(s().updateSip(b.id, { status: "paused" })).toEqual({ ok: true });
    s().advanceMonth(false);
    expect(s().instalments.filter((i) => i.sipId === b.id)).toHaveLength(1);
    expect(s().wallet).toBe(25000 - 100 - 500 - 100);
    useApp().setState({ wallet: 50 });
    s().advanceMonth(false);
    expect(s().missed).toHaveLength(1);
  });

  it("resuming a paused SIP does not charge the paused months", () => {
    const a = s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().startSip({ category: "liquid", symbol: "MF143269", amount: 100, day: 7 });
    if (!a.ok) throw new Error();
    s().updateSip(a.id, { status: "paused" });
    s().advanceMonth(false);
    s().advanceMonth(false);
    s().updateSip(a.id, { status: "active" });
    s().advanceMonth(false);
    expect(s().instalments.filter((i) => i.sipId === a.id).map((i) => i.date)).toEqual(["2026-10-07", "2027-01-07"]);
  });

  it("migration never leaves a negative demo balance", async () => {
    localStorage.setItem(mod.STORE_KEY, JSON.stringify({ version: 1, state: {
      sipPlan: { category: "index", symbol: "MF120716", amount: 20000, day: 5, startDate: "2026-10-01" },
      instalments: [{ date: "2026-10-01", amount: 20000 }, { date: "2026-11-05", amount: 20000 }],
    } }));
    await mod.useApp.persist.rehydrate();
    expect(s().wallet).toBe(0);
  });

  it("rejects a SIP below the minimum or without demo balance", () => {
    expect(s().startSip({ category: "index", symbol: "MF120716", amount: 50, day: 7 })).toEqual({ ok: false, error: "Minimum SIP is ₹100" });
    useApp().setState({ wallet: 10 });
    expect(s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 }).ok).toBe(false);
    expect(s().sips).toHaveLength(0);
  });

  it("real-demo orders use the demo balance, separate from practice cash", () => {
    expect(s().placeOrder({ symbol: "TCS.NS", side: "buy", qty: 2, price: 2000 }, false)).toEqual({ ok: true });
    expect(s().wallet).toBe(21000);
    expect(s().orders).toHaveLength(1);
    expect(s().cash).toBe(10000);
    expect(s().transactions).toHaveLength(0);
    expect(s().placeOrder({ symbol: "TCS.NS", side: "buy", qty: 100, price: 2000 }, false).ok).toBe(false);
  });

  it("adds demo money and toggles the watchlist", () => {
    s().addMoney(5000);
    expect(s().wallet).toBe(30000);
    s().toggleWatch("TCS.NS");
    expect(s().watchlist).toEqual(["TCS.NS"]);
    s().toggleWatch("TCS.NS");
    expect(s().watchlist).toEqual([]);
  });

  it("migrates v1 saved data (single sipPlan) to v2", async () => {
    localStorage.setItem(mod.STORE_KEY, JSON.stringify({ version: 1, state: {
      cash: 9000, sipPlan: { category: "index", symbol: "MF120716", amount: 250, day: 5, startDate: "2026-10-01" },
      instalments: [{ date: "2026-10-01", amount: 250 }], milestones: { first_sip: "2026-10-01" },
    } }));
    await mod.useApp.persist.rehydrate();
    expect(s().cash).toBe(9000);
    expect(s().sips).toEqual([{ id: "sip-1", category: "index", symbol: "MF120716", amount: 250, day: 5, startDate: "2026-10-01", status: "active" }]);
    expect(s().instalments).toEqual([{ date: "2026-10-01", amount: 250, sipId: "sip-1" }]);
    expect(s().wallet).toBe(24750);
    expect((s() as unknown as Record<string, unknown>).sipPlan).toBeUndefined();
  });

  it("rejects an invalid trade without changing state", () => {
    const r = s().trade({ symbol: "TCS.NS", side: "buy", qty: 1000, price: 4000 }, false);
    expect(r.ok).toBe(false);
    expect(s().cash).toBe(10000);
    expect(s().transactions).toHaveLength(0);
  });

  it("a valid buy earns first_mock_buy", () => {
    expect(s().trade({ symbol: "TCS.NS", side: "buy", qty: 1, price: 4000 }, false)).toEqual({ ok: true });
    expect(s().cash).toBe(6000);
    expect(s().milestones.first_mock_buy).toBeDefined();
  });

  it("completeLesson is idempotent", () => {
    s().completeLesson("mutual-funds-sip", true);
    s().completeLesson("mutual-funds-sip", false);
    expect(s().lessons["mutual-funds-sip"].quizCorrect).toBe(true);
  });

  it("reset after time travel returns to real today and clears instalments", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(false);
    s().reset();
    expect(s().clockOffsetDays).toBe(0);
    expect(s().instalments).toEqual([]);
    expect(s().sips).toEqual([]);
    expect(s().wallet).toBe(25000);
  });

  it("referrals: own code, accept once, reject own/invalid codes", () => {
    expect(s().myCode()).toMatch(/^GROW-/);
    expect(s().acceptReferral("GROW-AB0C")).toEqual({ ok: false, error: "That invite code isn't valid" });
    expect(s().acceptReferral(s().myCode())).toEqual({ ok: false, error: "That's your own invite code" });
    expect(s().acceptReferral("grow-ab2c")).toEqual({ ok: true });
    expect(s().referredBy).toBe("GROW-AB2C");
    expect(s().acceptReferral("GROW-XY3Z")).toEqual({ ok: false, error: "You've already joined with an invite" });
    expect(s().totalFreezes()).toBe(2);
  });

  it("referrals: each friend adds a streak freeze, which keeps a streak alive through missed months", () => {
    s().simulateFriendJoined();
    s().simulateFriendJoined();
    expect(s().referrals).toHaveLength(2);
    expect(s().totalFreezes()).toBe(3);
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(true);
    s().advanceMonth(true);
    s().advanceMonth(false);
    expect(s().instalments).toHaveLength(2);
    expect(s().streakNow().current).toBe(2);
  });

  it("discards persisted state from an older schema version", async () => {

    localStorage.setItem(mod.STORE_KEY, JSON.stringify({ state: { cash: "oops", answers: 42 }, version: 0 }));
    await mod.useApp.persist.rehydrate();
    expect(s().cash).toBe(10000);
    expect(s().answers).toBeNull();
  });

  it("welcome prompt: answers turn hints on and derive a full profile", () => {
    expect(s().hintsOn).toBe(true);
    expect(s().welcomeSeen).toBe(false);
    s().setWelcome({ goal: "studies", experience: "never", budget: "500-2k", horizon: "3plus" });
    expect(s().welcomeSeen).toBe(true);
    expect(s().hintsOn).toBe(true);
    expect(s().answers).toEqual({ goal: "studies", experience: "never", budget: "500-2k", reaction: "wait", horizon: "3plus" });
    expect(s().goal).toEqual({ name: "Higher studies", target: 100000 });
  });

  it("welcome prompt: the chosen goal sets the goal tracker", () => {
    s().setWelcome({ goal: "trip", experience: "fd", budget: "100-500", horizon: "lt1" });
    expect(s().goal).toEqual({ name: "Trip or gadget", target: 15000 });
  });

  it("welcome prompt: skipping turns hints off", () => {
    s().setWelcome(null);
    expect(s().welcomeSeen).toBe(true);
    expect(s().hintsOn).toBe(false);
    expect(s().answers).toBeNull();
  });

  it("survives corrupted JSON in storage", async () => {
    localStorage.setItem(mod.STORE_KEY, "{not json");
    await mod.useApp.persist.rehydrate();
    expect(s().cash).toBe(10000);
  });
});
