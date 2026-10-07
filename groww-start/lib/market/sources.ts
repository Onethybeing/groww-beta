import type { PricePoint } from "@/lib/types";
import type { Instrument } from "./instruments";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseYahooChart(json: any): PricePoint[] {
  const r = json?.chart?.result?.[0];
  if (!r || !Array.isArray(r.timestamp)) throw new Error("Empty Yahoo chart result");
  const off: number = r.meta?.gmtoffset ?? 19800;
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
  const byDate = new Map<string, number>();
  r.timestamp.forEach((t: number, i: number) => {
    const c = closes[i];
    if (typeof c === "number" && c > 0) byDate.set(new Date((t + off) * 1000).toISOString().slice(0, 10), c);
  });
  return [...byDate].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date));
}

export function parseMfapi(json: any): PricePoint[] {
  if (!Array.isArray(json?.data)) throw new Error("Bad mfapi payload");
  return json.data
    .map((d: { date: string; nav: string }) => {
      const [dd, mm, yyyy] = d.date.split("-");
      return { date: `${yyyy}-${mm}-${dd}`, close: Number.parseFloat(d.nav) };
    })
    .filter((p: PricePoint) => p.close > 0)
    .sort((a: PricePoint, b: PricePoint) => a.date.localeCompare(b.date));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const UA = { "User-Agent": "Mozilla/5.0 (compatible; groww-start-demo/1.0)" };

export async function fetchLive(inst: Instrument, signal?: AbortSignal): Promise<PricePoint[]> {
  const url = inst.mfCode
    ? `https://api.mfapi.in/mf/${inst.mfCode}`
    : `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(inst.symbol)}?range=5y&interval=1d`;
  const res = await fetch(url, { headers: UA, signal, next: { revalidate: 900 } } as RequestInit);
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const json = await res.json();
  return inst.mfCode ? parseMfapi(json) : parseYahooChart(json);
}
