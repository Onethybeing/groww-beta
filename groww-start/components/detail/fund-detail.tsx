"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { DetailHeader } from "./detail-header";
import { useTrade } from "./practice-trade";
import { useApp } from "@/lib/store";
import { heldQty } from "@/lib/engine/portfolio";
import { Explain } from "@/components/explain";
import { PriceChart } from "@/components/charts/lazy";
import { useHistory } from "@/lib/market/client";
import { addDays } from "@/lib/engine/dates";
import { trailingReturn } from "@/lib/engine/returns";
import { sipReplay } from "@/lib/engine/sip";
import { fundUnits } from "@/lib/engine/portfolio";
import type { Instrument } from "@/lib/market/instruments";
import type { PricePoint } from "@/lib/types";
import { formatDate, formatINR, formatPct } from "@/lib/format";

const CATEGORY: Record<string, string> = { index: "Index fund", flexi: "Flexi cap", largecap: "Large cap", elss: "Tax saver (ELSS)", gold: "Gold", liquid: "Liquid" };
const RANGES = [["1Y", 365], ["3Y", 1096], ["5Y", 1827]] as const;
const monthYear = (iso: string) => new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

const NO_POINTS: PricePoint[] = [];

export function FundDetail({ instrument }: { instrument: Instrument }) {
  const { data } = useHistory(instrument.symbol);
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("5Y");
  const points = data?.points ?? NO_POINTS;
  const last = points.at(-1);
  const trade = useTrade(instrument, last?.close ?? 0, last?.date, "practice");
  const real = useTrade(instrument, last?.close ?? 0, last?.date, "real");
  const heldReal = useApp((s) => heldQty(s.orders, instrument.symbol));

  const view = useMemo(() => {
    if (!last) return [];
    const from = addDays(last.date, -RANGES.find(([r]) => r === range)![1]);
    return points.filter((p) => p.date >= from);
  }, [points, last, range]);

  const whatIf = useMemo(() => {
    if (!last) return null;
    const r = sipReplay(points, { monthlyAmount: 500, startDate: addDays(last.date, -1096), endDate: last.date, sipDay: 1 });
    if (r.series.length < 2) return null;
    const best = r.series.reduce((b, p) => ((p.value - p.invested) / p.invested > (b.value - b.invested) / b.invested ? p : b), r.series[0]);
    return { ...r, bestPct: Math.round(((best.value - best.invested) / best.invested) * 100), bestDate: best.date };
  }, [points, last]);

  if (!last) return (<><DetailHeader back="/funds" symbol={instrument.symbol} /><div className="mx-5 h-64 animate-pulse rounded-2xl bg-surface" /></>);

  const returns = ([1, 3, 5] as const).map((y) => ({ y, v: trailingReturn(points, y) }));

  return (
    <div className="flex min-h-dvh flex-col">
      <DetailHeader back="/funds" symbol={instrument.symbol} />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-28">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold leading-[1.25]">{instrument.name}</h1>
          <span className="text-[13px] text-muted-ink">Direct · Growth · {CATEGORY[instrument.category ?? ""] ?? "Fund"}</span>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <Explain term="nav" icon className="text-[13px] font-semibold"
              forYou={`A ₹500 SIP today buys about ${fundUnits(500, last.close).toFixed(1)} units at ${formatINR(last.close, 2)}. If the NAV dips next month, the same ₹500 buys more units.`}>
              NAV · {formatDate(last.date)}
            </Explain>
            <b data-testid="nav" className="text-[26px]">{formatINR(last.close, 2)}</b>
          </div>
          <div className="flex gap-1.5">
            {returns.map(({ y, v }) => v !== null && (
              <span key={y} className={`flex flex-col items-center rounded-[10px] px-2 py-1.5 ${v < 0 ? "bg-loss-soft" : "bg-surface"}`}>
                <span className="text-[11px] text-muted-ink">{y === 1 ? "1Y" : <Explain term="returns_pa" className="!text-muted-ink">{y}Y p.a.</Explain>}</span>
                <b className={`text-[13px] ${v < 0 ? "text-loss" : "text-groww"}`}>{formatPct(v)}</b>
              </span>
            ))}
          </div>
        </div>

        <PriceChart points={view} height={130} />
        <div className="flex gap-1.5 text-xs font-semibold text-muted-ink">
          {RANGES.map(([r]) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 ${range === r ? "bg-mint text-groww" : ""}`}>{r}</button>
          ))}
        </div>

        {whatIf && (
          <Link href={`/practice/time-machine?symbol=${instrument.symbol}`} data-testid="what-if"
            className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-tip-line bg-tip p-3.5">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-groww"><Clock className="size-4" aria-hidden />What if you&apos;d started a SIP?</span>
            <span className="text-sm leading-[1.45]">
              ₹500/month for the last 3 years: <b>{formatINR(whatIf.invested)}</b> invested, worth <b>{formatINR(whatIf.finalValue)}</b> today{" "}
              <span className={`font-semibold ${whatIf.returnPct >= 0 ? "text-groww" : "text-loss"}`}>({formatPct(whatIf.returnPct)})</span>.
              {whatIf.bestPct > whatIf.returnPct + 3 && <> It was up {whatIf.bestPct}% in {monthYear(whatIf.bestDate)}.</>}
            </span>
            <span className="text-[13px] font-bold text-groww">Replay month by month in Practice →</span>
          </Link>
        )}
        {heldReal > 0 && (
          <div className="flex items-center justify-between rounded-[14px] border border-line px-3.5 py-3 text-sm">
            <span>You hold <b>{heldReal}</b> units (one-time, demo)</span>
            <button type="button" onClick={() => real.openSheet("sell")} className="font-bold text-loss">Sell</button>
          </div>
        )}
        {trade.notice}
        {real.notice}
        <p className="text-xs text-muted-ink">Real past NAVs from AMFI via mfapi.in, as of {formatDate(last.date)}. Past performance doesn&apos;t guarantee future returns.</p>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[430px] grid-cols-2 gap-2.5 border-t border-line bg-card px-5 pb-[22px] pt-3">
        <button type="button" onClick={() => trade.openSheet()}
          className="flex h-[52px] flex-col items-center justify-center rounded-[14px] border-[1.5px] border-groww text-groww">
          <b className="text-[15px]">Try with virtual ₹</b><span className="text-[11px] text-ink-2">No real money</span>
        </button>
        <Link href={`/funds/${instrument.symbol}/sip`} className="flex h-[52px] items-center justify-center rounded-[14px] bg-brand-surface text-base font-bold text-white">Start SIP</Link>
      </footer>
      {trade.sheet}
      {real.sheet}
    </div>
  );
}
