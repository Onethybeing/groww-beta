import { describe, it, expect } from "vitest";
import { sipReplay } from "./sip";

const prices = [
  { date: "2024-01-01", close: 100 },
  { date: "2024-01-15", close: 80 },
  { date: "2024-02-02", close: 50 },  // 1 Feb is a holiday, so the SIP buys here
  { date: "2024-03-01", close: 100 },
  { date: "2024-03-10", close: 120 },
];

describe("sipReplay", () => {
  it("buys on the first trading day on/after the SIP day each month", () => {
    const r = sipReplay(prices, { monthlyAmount: 1000, startDate: "2024-01-01", endDate: "2024-03-10", sipDay: 1 });
    expect(r.series).toEqual([
      { date: "2024-01-01", invested: 1000, value: 1000 },
      { date: "2024-02-02", invested: 2000, value: 1500 },
      { date: "2024-03-01", invested: 3000, value: 4000 },
      { date: "2024-03-10", invested: 3000, value: 4800 },
    ]);
    expect(r.invested).toBe(3000);
    expect(r.finalValue).toBe(4800);
    expect(r.returnPct).toBe(60);
    expect(r.worstDipPct).toBe(-25);
  });

  it("returns zeros for an empty range", () => {
    const r = sipReplay(prices, { monthlyAmount: 1000, startDate: "2025-01-01", endDate: "2025-12-31", sipDay: 1 });
    expect(r).toEqual({ series: [], invested: 0, finalValue: 0, returnPct: 0, worstDipPct: 0 });
  });

  it("starts at the first available price when startDate precedes the data", () => {
    const r = sipReplay(prices, { monthlyAmount: 1000, startDate: "2020-01-01", endDate: "2024-03-10", sipDay: 1 });
    expect(r.series[0]).toEqual({ date: "2024-01-01", invested: 1000, value: 1000 });
    expect(r.invested).toBe(3000);
  });

  it("never reports a positive worst dip", () => {
    const up = [{ date: "2024-01-01", close: 10 }, { date: "2024-02-01", close: 20 }];
    const r = sipReplay(up, { monthlyAmount: 100, startDate: "2024-01-01", endDate: "2024-02-01", sipDay: 1 });
    expect(r.worstDipPct).toBe(0);
  });
});
