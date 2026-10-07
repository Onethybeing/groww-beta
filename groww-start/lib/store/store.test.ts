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

describe("store", () => {
  it("computes today in IST with offset", () => {
    expect(mod.todayFor(0)).toBe("2026-10-07");
    expect(mod.todayFor(31)).toBe("2026-11-07");
  });

  it("starts a SIP once, even when confirm is double-tapped", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().startSip({ category: "index", symbol: "MF120716", amount: 500, day: 7 });
    expect(s().sipPlan?.amount).toBe(100);
    expect(s().instalments).toEqual([{ date: "2026-10-07", amount: 100 }]);
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
    expect(s().sipPlan).toBeNull();
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
