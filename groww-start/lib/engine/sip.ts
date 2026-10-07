import type { PricePoint } from "@/lib/types";
import { round2 } from "./num";
import { dateInMonth, monthKey, nextMonthKey } from "./dates";

export interface SipPoint { date: string; invested: number; value: number }
export interface SipReplayResult {
  series: SipPoint[]; invested: number; finalValue: number; returnPct: number; worstDipPct: number;
}
export interface SipReplayOptions { monthlyAmount: number; startDate: string; endDate: string; sipDay: number }

const EMPTY: SipReplayResult = { series: [], invested: 0, finalValue: 0, returnPct: 0, worstDipPct: 0 };

export function sipReplay(prices: PricePoint[], o: SipReplayOptions): SipReplayResult {
  const inRange = prices.filter((p) => p.date >= o.startDate && p.date <= o.endDate);
  if (inRange.length === 0 || o.monthlyAmount <= 0) return { ...EMPTY, series: [] };

  let units = 0;
  let invested = 0;
  const series: SipPoint[] = [];
  const endKey = monthKey(inRange[inRange.length - 1].date);
  let i = 0;

  for (let key = monthKey(inRange[0].date); key <= endKey; key = nextMonthKey(key)) {
    const target = dateInMonth(key, o.sipDay);
    while (i < inRange.length && inRange[i].date < target) i++;
    if (i >= inRange.length) break;
    const p = inRange[i];
    if (monthKey(p.date) !== key) continue; // no trading day left this month
    units += o.monthlyAmount / p.close;
    invested += o.monthlyAmount;
    series.push({ date: p.date, invested, value: round2(units * p.close) });
  }

  if (series.length === 0) return { ...EMPTY, series: [] };
  const last = inRange[inRange.length - 1];
  const finalValue = round2(units * last.close);
  if (series[series.length - 1].date !== last.date) series.push({ date: last.date, invested, value: finalValue });

  const worst = Math.min(0, ...series.map((s) => (s.value - s.invested) / s.invested));
  return {
    series,
    invested,
    finalValue,
    returnPct: round2(((finalValue - invested) / invested) * 100),
    worstDipPct: round2(worst * 100) || 0,
  };
}
