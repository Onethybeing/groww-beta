import { describe, it, expect } from "vitest";
import { collectDue, updateSip, nextSipDate, type Sip } from "./sips";

const sip = (p: Partial<Sip>): Sip => ({ id: "a", category: "index", symbol: "MF120716", amount: 250, day: 5, startDate: "2026-10-08", status: "active", ...p });

describe("collectDue", () => {
  it("pays every active SIP's due instalments from the wallet", () => {
    const r = collectDue([sip({}), sip({ id: "b", amount: 100, day: 10 })], [], [], "2026-11-10", 1000);
    expect(r.paid).toEqual([
      { date: "2026-10-08", amount: 250, sipId: "a" },
      { date: "2026-10-08", amount: 100, sipId: "b" },
      { date: "2026-11-05", amount: 250, sipId: "a" },
      { date: "2026-11-10", amount: 100, sipId: "b" },
    ]);
    expect(r.wallet).toBe(300);
    expect(r.missed).toEqual([]);
  });
  it("skips paused and cancelled SIPs", () => {
    const r = collectDue([sip({ status: "paused" }), sip({ id: "c", status: "cancelled" })], [], [], "2026-11-10", 1000);
    expect(r.paid).toEqual([]);
  });
  it("records a missed instalment when the wallet can't cover it", () => {
    const r = collectDue([sip({ amount: 250 })], [{ date: "2026-10-08", amount: 250, sipId: "a" }], [], "2026-11-05", 100);
    expect(r.paid).toEqual([]);
    expect(r.missed).toEqual([{ date: "2026-11-05", amount: 250, sipId: "a" }]);
    expect(r.wallet).toBe(100);
  });
  it("does not re-collect a month already missed", () => {
    const r = collectDue([sip({})], [{ date: "2026-10-08", amount: 250, sipId: "a" }], [], "2026-11-05", 100, [{ date: "2026-11-05", amount: 250, sipId: "a" }]);
    expect(r.missed).toEqual([]);
  });
});

describe("pause and resume", () => {
  it("never back-charges the months a SIP was paused", () => {
    const paused = updateSip([sip({ day: 5, startDate: "2026-10-05" })], "a", { status: "paused" }, "2026-10-20");
    if (!paused.ok) throw new Error();
    const resumed = updateSip(paused.sips, "a", { status: "active", amount: 5000 }, "2026-12-20");
    if (!resumed.ok) throw new Error();
    const r = collectDue(resumed.sips, [{ date: "2026-10-05", amount: 250, sipId: "a" }], [], "2027-01-05", 100000);
    expect(r.paid).toEqual([{ date: "2027-01-05", amount: 5000, sipId: "a" }]);
  });
});

describe("updateSip", () => {
  it("modifies amount and day", () => {
    const r = updateSip([sip({})], "a", { amount: 500, day: 15 });
    expect(r.ok && r.sips[0]).toMatchObject({ amount: 500, day: 15 });
  });
  it("rejects amounts below the minimum and invalid days", () => {
    expect(updateSip([sip({})], "a", { amount: 50 })).toEqual({ ok: false, error: "Minimum SIP is ₹100" });
    expect(updateSip([sip({})], "a", { day: 31 }).ok).toBe(false);
  });
  it("pauses, resumes and cancels; cancelled is final", () => {
    const paused = updateSip([sip({})], "a", { status: "paused" });
    expect(paused.ok && paused.sips[0].status).toBe("paused");
    const cancelled = updateSip([sip({})], "a", { status: "cancelled" });
    if (!cancelled.ok) throw new Error();
    expect(updateSip(cancelled.sips, "a", { status: "active" })).toEqual({ ok: false, error: "This SIP is cancelled" });
  });
  it("errors on unknown id", () => {
    expect(updateSip([sip({})], "zzz", { amount: 300 })).toEqual({ ok: false, error: "SIP not found" });
  });
});

describe("nextSipDate", () => {
  it("is this month's date if not yet paid, else next month", () => {
    expect(nextSipDate(sip({ day: 15 }), [], "2026-11-10")).toBe("2026-11-15");
    expect(nextSipDate(sip({ day: 5 }), [], "2026-11-10")).toBe("2026-12-05");
    expect(nextSipDate(sip({ day: 15 }), [{ date: "2026-11-02", amount: 250, sipId: "a" }], "2026-11-10")).toBe("2026-12-15");
  });
});
