const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 86_400_000;

export function toISTDate(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const monthKey = (date: string) => date.slice(0, 7);

function parseKey(key: string): [number, number] {
  const [y, m] = key.split("-").map(Number);
  return [y, m];
}
const fmtKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

export function prevMonthKey(key: string): string {
  const [y, m] = parseKey(key);
  return m === 1 ? fmtKey(y - 1, 12) : fmtKey(y, m - 1);
}

export function nextMonthKey(key: string): string {
  const [y, m] = parseKey(key);
  return m === 12 ? fmtKey(y + 1, 1) : fmtKey(y, m + 1);
}

export function daysInMonth(key: string): number {
  const [y, m] = parseKey(key);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function dateInMonth(key: string, day: number): string {
  const d = Math.min(Math.max(1, day), daysInMonth(key));
  return `${key}-${String(d).padStart(2, "0")}`;
}

export function addMonths(date: string, n: number): string {
  let key = monthKey(date);
  for (let i = 0; i < n; i++) key = nextMonthKey(key);
  return dateInMonth(key, Number(date.slice(8, 10)));
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}
