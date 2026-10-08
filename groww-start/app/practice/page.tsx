"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Check, ChevronRight, Clock, Sprout } from "lucide-react";
import { instrumentHref } from "@/components/instrument-row";
import { useApp, useHasActiveSip } from "@/lib/store";
import { useQuotes } from "@/lib/market/client";
import { getInstrument } from "@/lib/market/instruments";
import { starterFund, starterSipHref } from "@/lib/starter";
import { MIN_SIP } from "@/lib/engine/instalments";
import { holdings } from "@/lib/engine/portfolio";
import { LESSONS } from "@/lib/content";
import { formatINR, formatPct } from "@/lib/format";

export default function PracticePage() {
  const cash = useApp((s) => s.cash);
  const txns = useApp((s) => s.transactions);
  const lessons = useApp((s) => s.lessons);
  const practised = useApp((s) => s.transactions.length > 0 || s.timeMachineRuns > 0);
  const hasSip = useHasActiveSip();
  const answers = useApp((s) => s.answers);
  const starter = starterFund(answers);
  const held = useMemo(() => [...new Set(txns.map((t) => t.symbol))], [txns]);
  const { data: quotes } = useQuotes(held);
  const prices = useMemo(() => Object.fromEntries((quotes ?? []).map((q) => [q.symbol, q.price])), [quotes]);
  const hs = holdings(txns, prices);
  const value = hs.reduce((a, h) => a + h.value, 0);
  const invested = hs.reduce((a, h) => a + h.invested, 0);
  const pnl = value - invested;

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2.5 pt-4">
        <h1 className="text-[22px] font-bold">Practice</h1>
        <span className="rounded-full bg-warn px-2.5 py-[5px] text-xs font-semibold text-warn-ink">Virtual money · Prices delayed</span>
      </header>
      <div className="flex flex-col gap-4 px-5 pb-4 pt-1">
        <section className="flex flex-col gap-3 rounded-[18px] bg-inverse p-4 text-on-inverse">
          <span className="text-[13px] text-on-inverse-muted">Virtual portfolio</span>
          <b data-testid="virtual-total" className="text-[28px]">{formatINR(cash + value, 2)}</b>
          <div className="grid grid-cols-3 gap-2.5 text-[13px]">
            <div className="flex flex-col gap-0.5"><span className="text-on-inverse-muted">Cash</span><b data-testid="cash">{formatINR(cash, 2)}</b></div>
            <div className="flex flex-col gap-0.5"><span className="text-on-inverse-muted">Invested</span><b>{formatINR(invested, 2)}</b></div>
            <div className="flex flex-col gap-0.5"><span className="text-on-inverse-muted">P&amp;L</span><b className={pnl >= 0 ? "text-accent-soft" : "text-loss"}>{pnl >= 0 ? "+" : "−"}{formatINR(Math.abs(pnl), 2)}</b></div>
          </div>
        </section>

        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Your practice holdings</h2>
          {hs.length === 0 && <p className="py-2 text-sm text-muted-ink">Nothing yet. Open any stock or fund and tap Practice buy.</p>}
          {hs.map((h) => {
            const i = getInstrument(h.symbol)!;
            return (
              <Link key={h.symbol} href={instrumentHref(i)} data-testid={`holding-${h.symbol}`} className="flex min-h-14 items-center justify-between border-b border-line-soft">
                <span className="flex flex-col"><b className="text-[15px]">{i.name}</b><span className="text-xs text-muted-ink">{h.qty} {i.kind === "fund" ? "units" : h.qty === 1 ? "share" : "shares"} · avg {formatINR(h.avgPrice, 2)}</span></span>
                <span className="flex flex-col text-right"><b className="text-[15px]">{formatINR(h.value, 2)}</b><span className={`text-xs ${h.pnl >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(h.pnlPct)}</span></span>
              </Link>
            );
          })}
          <Link href="/stocks" className="flex min-h-11 items-center text-sm font-bold text-groww">+ Practise with any stock or fund</Link>
        </section>

        {practised && !hasSip && (
          <Link href={starterSipHref(answers)} data-testid="go-real"
            className="flex items-center gap-3 rounded-2xl bg-brand-surface p-4 text-white">
            <Sprout className="size-7 flex-none" aria-hidden />
            <span className="flex flex-1 flex-col gap-0.5">
              <b className="text-[15px]">Ready to go real?</b>
              <span className="text-[13px] text-white">You&apos;ve practised. Start a SIP from just {formatINR(MIN_SIP)} a month in a {starter.short} fund.</span>
            </span>
            <ChevronRight className="size-5" aria-hidden />
          </Link>
        )}

        <Link href="/practice/time-machine" className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
          <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-mint text-groww"><Clock className="size-[22px]" aria-hidden /></span>
          <span className="flex flex-1 flex-col gap-0.5"><b className="text-[15px]">Time Machine</b><span className="text-[13px] text-muted-ink">Replay a monthly SIP on real past prices</span></span>
          <ChevronRight className="size-[18px] text-faint" aria-hidden />
        </Link>

        <section className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold">Basics in 2 minutes</h2>
            <span className="text-xs text-muted-ink">{Object.keys(lessons).length} of {LESSONS.length} done</span>
          </div>
          {LESSONS.map((l) => (
            <Link key={l.id} href={`/learn/${l.id}`} className="flex min-h-12 items-center gap-2.5">
              <span className={`flex size-7 items-center justify-center rounded-full text-[13px] font-bold ${lessons[l.id] ? "bg-brand-surface text-white" : "bg-mint text-groww"}`}>
                {lessons[l.id] ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : l.order}
              </span>
              <span className="flex-1 text-sm font-semibold">{l.title}</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
