"use client";
import { useMemo, useState } from "react";
import { DetailHeader } from "./detail-header";
import { useTrade } from "./practice-trade";
import { useApp } from "@/lib/store";
import { heldQty } from "@/lib/engine/portfolio";
import { Monogram } from "@/components/instrument-row";
import { Explain } from "@/components/explain";
import { BeginnerTip } from "@/components/beginner-tip";
import { PriceChart } from "@/components/charts/price-chart";
import { useHistory } from "@/lib/market/client";
import { addDays } from "@/lib/engine/dates";
import { rangeOver, trailingReturn } from "@/lib/engine/returns";
import type { Instrument } from "@/lib/market/instruments";
import type { PricePoint } from "@/lib/types";
import { formatDate, formatINR, formatPct } from "@/lib/format";

const RANGES = [["1M", 31], ["1Y", 365], ["5Y", 1827]] as const;

const NO_POINTS: PricePoint[] = [];

export function StockDetail({ instrument }: { instrument: Instrument }) {
  const { data } = useHistory(instrument.symbol);
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("1Y");
  const points = data?.points ?? NO_POINTS;
  const last = points.at(-1);
  const prev = points.at(-2);
  const practice = useTrade(instrument, last?.close ?? 0, last?.date, "practice");
  const real = useTrade(instrument, last?.close ?? 0, last?.date, "real");
  const heldReal = useApp((s) => heldQty(s.orders, instrument.symbol));

  const view = useMemo(() => {
    if (!last) return [];
    const days = RANGES.find(([r]) => r === range)![1];
    const from = addDays(last.date, -days);
    return points.filter((p) => p.date >= from);
  }, [points, last, range]);

  if (!last || !prev) {
    return (<><DetailHeader back="/stocks" symbol={instrument.symbol} /><div className="mx-5 h-64 animate-pulse rounded-2xl bg-surface" /></>);
  }
  const change = last.close - prev.close;
  const yr = rangeOver(points, 365);
  const oneYear = trailingReturn(points, 1);
  const pos = ((last.close - yr.low) / (yr.high - yr.low)) * 100;

  return (
    <div className="flex min-h-dvh flex-col">
      <DetailHeader back="/stocks" symbol={instrument.symbol} />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pb-28">
        <div className="flex items-center gap-3">
          <Monogram i={instrument} size="size-10" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{instrument.name}</h1>
            <span className="text-[13px] text-muted-ink">{instrument.kind === "etf" ? "Gold ETF" : `NSE: ${instrument.short}`}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <b data-testid="price" className="text-[28px]">{formatINR(last.close, 2)}</b>
          <span className={`text-sm font-semibold ${change >= 0 ? "text-groww" : "text-loss"}`}>
            {change >= 0 ? "+" : "−"}{Math.abs(change).toFixed(2)} ({formatPct((change / prev.close) * 100)})
            <span className="font-medium text-muted-ink"> · last close {formatDate(last.date)}</span>
          </span>
        </div>

        <PriceChart points={view} height={160} />
        <div className="flex gap-1.5 text-xs font-semibold text-muted-ink">
          {RANGES.map(([r]) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}
              className={`rounded-full px-2.5 py-1 ${range === r ? "bg-mint text-groww" : ""}`}>{r}</button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Explain term="week52" icon className="self-start text-[13px] font-semibold"
            forYou={`${instrument.short} closed at ${formatINR(last.close, 2)}, ${Math.round(pos)}% of the way from its 1-year low to its high.`}>
            52-week range
          </Explain>
          <div className="relative h-1.5 rounded-full bg-[#EEF0F2]">
            <div className="absolute -top-1 h-3.5 w-1 rounded-sm bg-ink" style={{ left: `${Math.min(98, Math.max(0, pos))}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-ink"><span>Low {formatINR(yr.low, 2)}</span><span>High {formatINR(yr.high, 2)}</span></div>
        </div>

        {oneYear !== null && (
          <BeginnerTip title="First stock?">
            Single stocks swing more than funds. {instrument.short} is {oneYear >= 0 ? "up" : "down"} {Math.abs(oneYear).toFixed(1)}% over the past year. Try a practice buy first and watch how it moves.
          </BeginnerTip>
        )}
        {heldReal > 0 && (
          <div className="flex items-center justify-between rounded-[14px] border border-line px-3.5 py-3 text-sm">
            <span>You hold <b>{heldReal}</b> {heldReal === 1 ? "share" : "shares"} (demo)</span>
            <button type="button" onClick={() => real.openSheet("sell")} className="font-bold text-loss">Sell</button>
          </div>
        )}
        {practice.notice}
        {real.notice}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[430px] grid-cols-2 gap-2.5 border-t border-line bg-white px-5 pb-[22px] pt-3">
        <button type="button" onClick={() => practice.openSheet()}
          className="flex h-[52px] flex-col items-center justify-center rounded-[14px] border-[1.5px] border-groww text-groww">
          <b className="text-[15px]">Practice buy</b><span className="text-[11px] text-[#3D4050]">Virtual ₹10,000</span>
        </button>
        <button type="button" onClick={() => real.openSheet()} className="h-[52px] rounded-[14px] bg-groww text-base font-bold text-white">Buy</button>
      </footer>
      {practice.sheet}
      {real.sheet}
    </div>
  );
}
