import { round2, round3 } from "./num";

export interface Txn { id: string; symbol: string; side: "buy" | "sell"; qty: number; price: number; date: string }
export interface PortfolioState { cash: number; transactions: Txn[] }
export type TradeResult = { ok: true; state: PortfolioState } | { ok: false; error: string };
export interface Holding {
  symbol: string; qty: number; avgPrice: number; invested: number; value: number; pnl: number; pnlPct: number;
}

const EPS = 1e-6;

export function heldQty(txns: Txn[], symbol: string): number {
  const q = txns.filter((t) => t.symbol === symbol).reduce((acc, t) => acc + (t.side === "buy" ? t.qty : -t.qty), 0);
  return round3(q);
}

export function applyTrade(state: PortfolioState, t: Txn, opts: { fractional: boolean; balanceLabel?: string }): TradeResult {
  if (!Number.isFinite(t.qty) || t.qty <= 0) return { ok: false, error: "Enter a quantity greater than 0" };
  if (!opts.fractional && !Number.isInteger(t.qty)) return { ok: false, error: "Stocks can only be bought in whole shares" };
  if (!(t.price > 0)) return { ok: false, error: "Price unavailable right now" };
  const amount = round2(t.qty * t.price);

  if (t.side === "buy") {
    if (amount > state.cash + EPS) {
      return { ok: false, error: `Not enough ${opts.balanceLabel ?? "virtual cash"} (₹${state.cash.toFixed(2)} available)` };
    }
    return { ok: true, state: { cash: round2(state.cash - amount), transactions: [...state.transactions, t] } };
  }

  if (t.qty > heldQty(state.transactions, t.symbol) + EPS) return { ok: false, error: "You can't sell more than you hold" };
  return { ok: true, state: { cash: round2(state.cash + amount), transactions: [...state.transactions, t] } };
}

export function holdings(txns: Txn[], prices: Record<string, number>): Holding[] {
  const acc = new Map<string, { qty: number; invested: number }>();
  for (const t of txns) {
    const h = acc.get(t.symbol) ?? { qty: 0, invested: 0 };
    if (t.side === "buy") {
      h.qty += t.qty;
      h.invested += t.qty * t.price;
    } else {
      h.invested -= h.qty > 0 ? h.invested * (t.qty / h.qty) : 0;
      h.qty -= t.qty;
    }
    acc.set(t.symbol, h);
  }
  const out: Holding[] = [];
  for (const [symbol, h] of acc) {
    const qty = round3(h.qty);
    if (qty <= EPS) continue;
    const invested = round2(h.invested);
    const avgPrice = round2(invested / qty);
    const value = round2(qty * (prices[symbol] ?? avgPrice));
    const pnl = round2(value - invested);
    out.push({ symbol, qty, avgPrice, invested, value, pnl, pnlPct: invested ? round2((pnl / invested) * 100) : 0 });
  }
  return out;
}

export function fundUnits(amount: number, nav: number): number {
  return Math.floor((amount / nav) * 1000) / 1000;
}
