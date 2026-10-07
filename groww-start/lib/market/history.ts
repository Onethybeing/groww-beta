import type { HistoryResult, PricePoint, Quote } from "@/lib/types";
import { addDays } from "@/lib/engine/dates";
import { round2 } from "@/lib/engine/num";
import { getInstrument, type Instrument } from "./instruments";

export interface HistoryDeps {
  fetchLive: (inst: Instrument, signal: AbortSignal) => Promise<PricePoint[]>;
  readSnapshot: (symbol: string) => Promise<PricePoint[]>;
}

export class UnknownSymbolError extends Error {
  constructor(symbol: string) { super(`Unknown symbol: ${symbol}`); }
}

export function trimToYears(points: PricePoint[], years: number): PricePoint[] {
  if (points.length === 0) return points;
  const cutoff = addDays(points[points.length - 1].date, -Math.round(365.25 * years));
  return points.filter((p) => p.date >= cutoff);
}

export async function getHistory(symbol: string, deps: HistoryDeps): Promise<HistoryResult> {
  const inst = getInstrument(symbol);
  if (!inst) throw new UnknownSymbolError(symbol);
  try {
    const points = await deps.fetchLive(inst, AbortSignal.timeout(4000));
    if (points.length < 2) throw new Error("Too few points");
    return { symbol, points: trimToYears(points, 5), source: "live" };
  } catch {
    return { symbol, points: await deps.readSnapshot(symbol), source: "snapshot" };
  }
}

export async function getQuotes(symbols: string[], deps: HistoryDeps): Promise<Quote[]> {
  return Promise.all(symbols.map(async (symbol) => {
    const { points, source } = await getHistory(symbol, deps);
    const last = points[points.length - 1];
    const prev = points[points.length - 2] ?? last;
    return { symbol, date: last.date, price: last.close, changePct: round2(((last.close - prev.close) / prev.close) * 100), source };
  }));
}
