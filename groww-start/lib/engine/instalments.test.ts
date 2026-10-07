import { describe, it, expect } from "vitest";
import { dueInstalments, valueInstalments, type SipPlan } from "./instalments";

const plan: SipPlan = { category: "index", symbol: "MF120716", amount: 100, day: 7, startDate: "2026-10-07" };

describe("valueInstalments", () => {
  const navs = [{ date: "2026-10-01", close: 100 }, { date: "2026-11-02", close: 125 }];
  it("buys units at the NAV on or before each instalment and values them at the latest NAV", () => {
    const r = valueInstalments([{ date: "2026-10-07", amount: 100 }, { date: "2026-11-07", amount: 125 }], navs);
    expect(r).toEqual({ invested: 225, value: 250, units: 2 });
  });
  it("uses the latest NAV for demo dates beyond the data", () => {
    expect(valueInstalments([{ date: "2027-01-05", amount: 250 }], navs)).toEqual({ invested: 250, value: 250, units: 2 });
  });
  it("is zero without instalments or prices", () => {
    expect(valueInstalments([], navs)).toEqual({ invested: 0, value: 0, units: 0 });
    expect(valueInstalments([{ date: "2026-10-07", amount: 100 }], [])).toEqual({ invested: 100, value: 100, units: 0 });
  });
});

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
