import { describe, it, expect } from "vitest";
import { applyTrade, holdings, heldQty, fundUnits, type PortfolioState, type Txn } from "./portfolio";

const base: PortfolioState = { cash: 10000, transactions: [] };
const t = (p: Partial<Txn>): Txn => ({ id: "x", symbol: "TCS.NS", side: "buy", qty: 1, price: 100, date: "2026-10-07", ...p });

describe("applyTrade", () => {
  it("buys and debits cash", () => {
    const r = applyTrade(base, t({ qty: 2 }), { fractional: false });
    expect(r.ok && r.state.cash).toBe(9800);
  });
  it("rejects fractional stock quantities", () => {
    const r = applyTrade(base, t({ qty: 1.5 }), { fractional: false });
    expect(r).toEqual({ ok: false, error: "Stocks can only be bought in whole shares" });
  });
  it("rejects zero, negative and NaN quantities", () => {
    for (const qty of [0, -1, Number.NaN]) {
      expect(applyTrade(base, t({ qty }), { fractional: false }).ok).toBe(false);
    }
  });
  it("rejects buys beyond cash", () => {
    const r = applyTrade(base, t({ qty: 101 }), { fractional: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Not enough virtual cash/);
  });
  it("rejects selling more than held", () => {
    const r = applyTrade(base, t({ side: "sell", qty: 1 }), { fractional: false });
    expect(r).toEqual({ ok: false, error: "You can't sell more than you hold" });
  });
  it("allows selling an entire fractional holding without dust", () => {
    const units = fundUnits(100, 30); // 3.333
    let s = base;
    const b = applyTrade(s, t({ symbol: "MF120716", qty: units, price: 30 }), { fractional: true });
    if (!b.ok) throw new Error(b.error);
    s = b.state;
    const sell = applyTrade(s, t({ symbol: "MF120716", side: "sell", qty: heldQty(s.transactions, "MF120716"), price: 31 }), { fractional: true });
    expect(sell.ok).toBe(true);
    if (sell.ok) expect(holdings(sell.state.transactions, { MF120716: 31 })).toEqual([]);
  });
});

describe("holdings", () => {
  it("uses average cost and computes P&L", () => {
    const txns = [t({ qty: 2, price: 100 }), t({ qty: 2, price: 200 }), t({ side: "sell", qty: 2, price: 300 })];
    const [h] = holdings(txns, { "TCS.NS": 250 });
    expect(h).toEqual({ symbol: "TCS.NS", qty: 2, avgPrice: 150, invested: 300, value: 500, pnl: 200, pnlPct: 66.67 });
  });
  it("falls back to average price when no quote is available", () => {
    const [h] = holdings([t({ qty: 1, price: 100 })], {});
    expect(h.value).toBe(100);
  });
});

describe("fundUnits", () => {
  it("rounds down to 3 decimals", () => expect(fundUnits(100, 30)).toBe(3.333));
});
