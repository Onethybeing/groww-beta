"use client";
import { useMemo, useState } from "react";
import { SipChart } from "@/components/charts/lazy";
import { ReflectionPrompt } from "@/components/reflection-prompt";
import { useHistory } from "@/lib/market/client";
import { INSTRUMENTS } from "@/lib/market/instruments";
import { sipReplay, type SipReplayResult } from "@/lib/engine/sip";
import { addDays } from "@/lib/engine/dates";
import { formatINR, formatPct, formatDate } from "@/lib/format";
import { useApp } from "@/lib/store";

const YEARS = [1, 2, 3, 5];
const OPTIONS = INSTRUMENTS.filter((i) => i.kind !== "index");
const monthYear = (iso: string) => new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

function takeaway(r: SipReplayResult): string {
  const now = r.returnPct >= 0 ? `Right now you'd be up ${formatPct(r.returnPct).slice(1)}.` : `Right now you'd be down ${formatPct(r.returnPct).slice(1)}.`;
  const worst = r.series.reduce((w, p) => ((p.value - p.invested) / p.invested < (w.value - w.invested) / w.invested ? p : w), r.series[0]);
  const best = r.series.reduce((b, p) => ((p.value - p.invested) / p.invested > (b.value - b.invested) / b.invested ? p : b), r.series[0]);
  const dip = r.worstDipPct < 0 ? ` At its lowest, in ${monthYear(worst.date)}, you were down ${formatPct(r.worstDipPct).slice(1)}.` : " It never dipped below what you put in.";
  const bestPct = ((best.value - best.invested) / best.invested) * 100;
  const peak = r.returnPct < bestPct - 3 ? ` In ${monthYear(best.date)} you were up ${Math.round(bestPct)}%.` : "";
  return `${now}${dip}${peak} Short-term swings like this are normal. Time in the market is what counts.`;
}

export function TimeMachine({ initialSymbol = "MF120716" }: { initialSymbol?: string }) {
  const runs = useApp((s) => s.timeMachineRuns);
  const recordRun = useApp((s) => s.recordTimeMachineRun);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [amount, setAmount] = useState(500);
  const [years, setYears] = useState(3);
  const [run, setRun] = useState<{ symbol: string; amount: number; years: number } | null>(null);
  const [reflect, setReflect] = useState(false);
  const { data, isLoading } = useHistory(run?.symbol ?? symbol);

  const result = useMemo(() => {
    if (!run || !data || data.symbol !== run.symbol || data.points.length < 2) return null;
    const endDate = data.points[data.points.length - 1].date;
    return sipReplay(data.points, { monthlyAmount: run.amount, startDate: addDays(endDate, -Math.round(365.25 * run.years)), endDate, sipDay: 1 });
  }, [run, data]);

  const name = OPTIONS.find((o) => o.symbol === (run?.symbol ?? symbol))?.name;
  const instalments = result ? result.series.length - (result.series.at(-1)?.invested === result.series.at(-2)?.invested ? 1 : 0) : 0;

  return (
    <div className="flex flex-col gap-3.5">
      <p className="text-sm text-muted-ink">What if you&apos;d started a SIP back then? Replay real past prices, month by month.</p>
      <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-ink">Invest in
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="h-[46px] rounded-xl border border-line bg-card px-3 text-[15px] font-semibold text-ink">
          <optgroup label="Mutual funds">{OPTIONS.filter((o) => o.kind === "fund").map((o) => <option key={o.symbol} value={o.symbol}>{o.name}</option>)}</optgroup>
          <optgroup label="Stocks & ETFs">{OPTIONS.filter((o) => o.kind !== "fund").map((o) => <option key={o.symbol} value={o.symbol}>{o.name}</option>)}</optgroup>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-muted-ink">Every month</span>
          <span className="text-xl font-bold">{formatINR(amount)}</span>
          <input type="range" min={100} max={2000} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Monthly amount" className="w-full accent-groww" />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-muted-ink">Started</span>
          <div className="grid grid-cols-4 gap-1">
            {YEARS.map((y) => (
              <button key={y} type="button" aria-pressed={years === y} onClick={() => setYears(y)}
                className={`h-9 rounded-full text-[13px] ${years === y ? "border-[1.5px] border-groww bg-mint font-bold text-groww" : "border border-line text-ink-2"}`}>{y}y</button>
            ))}
          </div>
        </div>
      </div>
      <button type="button" disabled={isLoading && !data} onClick={() => {
        setRun({ symbol, amount, years });
        if (runs === 0) setReflect(true);
        recordRun();
      }} className="flex h-12 items-center justify-center rounded-[14px] bg-brand-surface text-base font-bold text-white disabled:opacity-50">Replay</button>

      {result && result.series.length > 0 && run && (
        <section data-testid="tm-result" className="flex flex-col gap-3 rounded-[18px] border border-line p-4">
          <span className="text-[13px] text-muted-ink">{formatINR(run.amount)}/month in {name} since {formatDate(result.series[0].date)} · {instalments} instalments</span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-0.5"><span className="text-xs text-muted-ink">You&apos;d have invested</span><b className="text-xl">{formatINR(result.invested)}</b></div>
            <div className="flex flex-col gap-0.5 text-right"><span className="text-xs text-muted-ink">Worth today</span>
              <b className="text-xl">{formatINR(result.finalValue)} <span className={`text-sm ${result.returnPct >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(result.returnPct)}</span></b>
            </div>
          </div>
          <SipChart series={result.series} />
          <div className="flex items-center justify-end gap-3 text-xs text-muted-ink">
            <span className="flex items-center gap-1"><span className="w-3.5 border-t-2 border-dashed border-faint" />Invested</span>
            <span className="flex items-center gap-1"><span className="h-[3px] w-3.5 rounded bg-brand-surface" />Value</span>
          </div>
          <p className="rounded-xl bg-surface p-3 text-sm leading-[1.5] text-ink-2">{takeaway(result)}</p>
          <span className="text-xs text-muted-ink">
            Real past {run.symbol.startsWith("MF") ? "NAVs from AMFI via mfapi.in" : "prices"}, as of {formatDate(result.series[result.series.length - 1].date)}. Past performance doesn&apos;t guarantee future returns.
          </span>
        </section>
      )}
      {result && result.series.length === 0 && <p className="text-sm text-muted-ink">Not enough data for that period. Try a shorter one.</p>}
      {reflect && result && <ReflectionPrompt prompt="Why did you pick this one to replay?" onDone={() => setReflect(false)} />}
    </div>
  );
}
