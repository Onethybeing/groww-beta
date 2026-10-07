import type { PricePoint } from "@/lib/types";
import { addDays } from "./dates";
import { round2 } from "./num";

/** Trailing return to the last point: absolute % for ≤1 year, annualised (CAGR) % beyond. Null if history is too short. */
export function trailingReturn(points: PricePoint[], years: number): number | null {
  if (points.length < 2) return null;
  const end = points[points.length - 1];
  const startDate = addDays(end.date, -Math.round(365.25 * years));
  if (points[0].date > startDate) return null;
  let start = points[0];
  for (const p of points) {
    if (p.date > startDate) break;
    start = p;
  }
  const growth = end.close / start.close;
  return round2((years > 1 ? growth ** (1 / years) - 1 : growth - 1) * 100);
}

/** Lowest and highest close over the last `days` days. */
export function rangeOver(points: PricePoint[], days: number): { low: number; high: number } {
  const from = addDays(points[points.length - 1].date, -days);
  const closes = points.filter((p) => p.date >= from).map((p) => p.close);
  return { low: Math.min(...closes), high: Math.max(...closes) };
}
