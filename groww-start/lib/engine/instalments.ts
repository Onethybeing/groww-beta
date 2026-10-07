import type { FundCategory, PricePoint } from "@/lib/types";
import { round2, round3 } from "./num";
import { dateInMonth, monthKey, nextMonthKey } from "./dates";

/** Minimum SIP instalment in this demo (many AMCs accept ₹100). */
export const MIN_SIP = 100;

export interface SipPlan { category: FundCategory; symbol: string; amount: number; day: number; startDate: string }
export interface Instalment { date: string; amount: number }

/**
 * Units bought at the NAV on or before each instalment, valued at the latest NAV.
 * Demo-clock dates beyond the data use the latest NAV. With no prices, value equals invested.
 */
export function valueInstalments(instalments: Instalment[], navs: PricePoint[]): { invested: number; value: number; units: number } {
  const invested = round2(instalments.reduce((a, i) => a + i.amount, 0));
  if (navs.length === 0) return { invested, value: invested, units: 0 };
  let units = 0;
  for (const inst of instalments) {
    let nav = navs[0].close;
    for (const p of navs) {
      if (p.date > inst.date) break;
      nav = p.close;
    }
    units += inst.amount / nav;
  }
  return { invested, value: round2(units * navs[navs.length - 1].close), units: round3(units) };
}

export function dueInstalments(plan: SipPlan, existing: Instalment[], skippedMonths: string[], today: string): Instalment[] {
  const have = new Set(existing.map((i) => monthKey(i.date)));
  const startKey = monthKey(plan.startDate);
  const out: Instalment[] = [];
  for (let key = startKey; key <= monthKey(today); key = nextMonthKey(key)) {
    if (have.has(key) || skippedMonths.includes(key)) continue;
    const date = key === startKey ? plan.startDate : dateInMonth(key, plan.day);
    if (date <= today) out.push({ date, amount: plan.amount });
  }
  return out;
}
