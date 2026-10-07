import { describe, it, expect } from "vitest";
import { dueInstalments, type SipPlan } from "./instalments";

const plan: SipPlan = { category: "index", symbol: "MF120716", amount: 100, day: 7, startDate: "2026-10-07" };

describe("dueInstalments", () => {
  it("creates the first instalment on the start date", () => {
    expect(dueInstalments(plan, [], [], "2026-10-07")).toEqual([{ date: "2026-10-07", amount: 100 }]);
  });
  it("creates missing months up to today", () => {
    const r = dueInstalments(plan, [{ date: "2026-10-07", amount: 100 }], [], "2026-12-07");
    expect(r).toEqual([{ date: "2026-11-07", amount: 100 }, { date: "2026-12-07", amount: 100 }]);
  });
  it("respects skipped months", () => {
    const r = dueInstalments(plan, [{ date: "2026-10-07", amount: 100 }], ["2026-11"], "2026-12-07");
    expect(r).toEqual([{ date: "2026-12-07", amount: 100 }]);
  });
  it("clamps SIP day to month length and waits for the SIP day", () => {
    const p31 = { ...plan, day: 31 };
    expect(dueInstalments(p31, [{ date: "2026-10-07", amount: 100 }], [], "2026-11-30")).toEqual([{ date: "2026-11-30", amount: 100 }]);
    const p25 = { ...plan, day: 25 };
    expect(dueInstalments(p25, [{ date: "2026-10-07", amount: 100 }], [], "2026-11-20")).toEqual([]);
  });
});
