import { monthKey, nextMonthKey, prevMonthKey } from "./dates";

export interface StreakResult { current: number; longest: number; freezesUsed: number }

export function computeStreak(dates: string[], today: string, freezes = 1): StreakResult {
  if (dates.length === 0) return { current: 0, longest: 0, freezesUsed: 0 };
  const months = new Set(dates.map(monthKey));
  const first = [...months].sort()[0];
  const todayKey = monthKey(today);

  let key = months.has(todayKey) ? todayKey : prevMonthKey(todayKey); // the current month is still open
  let current = 0;
  let used = 0;
  while (key >= first) {
    if (months.has(key)) current++;
    else if (used < freezes) used++;
    else break;
    key = prevMonthKey(key);
  }

  let longest = 0;
  let run = 0;
  for (let k = first; k <= todayKey; k = nextMonthKey(k)) {
    run = months.has(k) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { current, longest, freezesUsed: current === 0 ? 0 : used };
}
