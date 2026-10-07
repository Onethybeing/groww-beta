import type { FundCategory } from "@/lib/types";
import { dateInMonth, monthKey, nextMonthKey } from "./dates";

export interface SipPlan { category: FundCategory; symbol: string; amount: number; day: number; startDate: string }
export interface Instalment { date: string; amount: number }

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
