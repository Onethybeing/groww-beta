"use client";
import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Flame, Plus, ReceiptText, Share, Wallet } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { GoalRing } from "@/components/goal-ring";
import { MilestoneIcon } from "@/components/milestone-icon";
import { useShareHref } from "@/components/milestone-toast";
import { instrumentHref } from "@/components/instrument-row";
import { streakFor, totalFreezesOf, useApp, useToday } from "@/lib/store";
import { useHistories, useQuotes } from "@/lib/market/client";
import { getInstrument } from "@/lib/market/instruments";
import { valueInstalments } from "@/lib/engine/instalments";
import { forSip, nextSipDate } from "@/lib/engine/sips";
import { holdings } from "@/lib/engine/portfolio";
import { starterSipHref } from "@/lib/starter";
import { MILESTONES, MILESTONE_ORDER, type MilestoneKey } from "@/lib/engine/milestones";
import { formatDate, formatINR, formatPct, ordinal } from "@/lib/format";

const shortDate = (iso: string) => formatDate(iso).replace(/ \d{4}$/, "");
const ADD_STEP = 5000;

function MilestoneChip({ k, highlight }: { k: MilestoneKey; highlight: boolean }) {
  const href = useShareHref(k);
  const m = MILESTONES[k];
  return (
    <Link href={href} data-testid={`milestone-${k}`} data-achieved="true" aria-label={`${m.title}, share`}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-semibold ${highlight ? "bg-streak text-white" : "border border-habit-line bg-card"}`}>
      <MilestoneIcon name={m.icon} className="size-3.5" />
      {m.title}
      {highlight && <Share className="size-3" aria-hidden />}
    </Link>
  );
}

function Pnl({ value }: { value: number }) {
  return <span className={value > 0 ? "text-groww" : value < 0 ? "text-loss" : ""}>{value < 0 ? "−" : value > 0 ? "+" : ""}{formatINR(Math.abs(value), 2)}</span>;
}

export default function HoldingsPage() {
  const state = useApp();
  const { sips, instalments, goal, milestones, answers, wallet, orders, addMoney } = state;
  const today = useToday();

  const orderSymbols = useMemo(() => [...new Set(orders.map((o) => o.symbol))], [orders]);
  const sipSymbols = useMemo(() => [...new Set(sips.map((s) => s.symbol))], [sips]);
  const { data: quotes } = useQuotes(orderSymbols);
  const navs = useHistories(sipSymbols);
  const prices = useMemo(() => Object.fromEntries((quotes ?? []).map((q) => [q.symbol, q.price])), [quotes]);

  const held = holdings(orders, prices);
  const stocks = held.filter((h) => getInstrument(h.symbol)?.kind !== "fund");
  const lumpsumFunds = held.filter((h) => getInstrument(h.symbol)?.kind === "fund");
  const sipRows = sips.map((s) => ({ sip: s, ...valueInstalments(forSip(instalments, s.id), navs[s.symbol] ?? []) }));

  const sipInvested = sipRows.reduce((a, r) => a + r.invested, 0);
  const invested = held.reduce((a, h) => a + h.invested, 0) + sipInvested;
  const value = held.reduce((a, h) => a + h.value, 0) + sipRows.reduce((a, r) => a + r.value, 0);
  const pnl = value - invested;

  const active = sips.filter((s) => s.status === "active");
  const freezes = totalFreezesOf(state);
  const streak = streakFor(state, today);
  const freezesLeft = freezes - streak.freezesUsed;
  const nextSip = active.map((s) => nextSipDate(s, instalments, today)).sort()[0];
  const earned = MILESTONE_ORDER.filter((k) => milestones[k]).sort((a, b) => (milestones[b]! > milestones[a]! ? 1 : -1));

  return (
    <>
      <AppHeader active="holdings" />
      <div className="flex flex-col gap-3.5 px-5 py-3.5">
        <section className="flex items-center gap-3 rounded-2xl bg-inverse px-4 py-3.5 text-on-inverse">
          <Wallet className="size-6 flex-none text-accent-soft" aria-hidden />
          <div className="flex flex-1 flex-col">
            <span className="text-xs text-on-inverse-muted">Demo balance · not real money</span>
            <b data-testid="wallet" className="text-lg">{formatINR(wallet, 2)}</b>
          </div>
          <button type="button" onClick={() => addMoney(ADD_STEP)} className="flex h-10 items-center gap-1 rounded-xl bg-on-inverse/10 px-3 text-sm font-semibold">
            <Plus className="size-4" aria-hidden />{formatINR(ADD_STEP)}
          </button>
        </section>

        <section className="flex flex-col gap-2.5 rounded-2xl border border-line px-4 py-3.5">
          <div className="flex justify-between text-[13px] text-muted-ink"><span>Current value</span><span>Invested</span></div>
          <div className="flex items-end justify-between"><b data-testid="current-value" className="text-[22px]">{formatINR(value, 2)}</b><b className="text-base">{formatINR(invested, 2)}</b></div>
          <div className="flex justify-between border-t border-line-soft pt-2 text-[13px]">
            <span className="text-muted-ink">Total returns</span>
            <b><Pnl value={pnl} /> ({formatPct(invested ? (pnl / invested) * 100 : 0)})</b>
          </div>
        </section>

        <section aria-label="Your habit" data-testid="habit-card" className="flex flex-col gap-3 rounded-[18px] border border-habit-line bg-habit px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-warn-ink">Your habit</span>
            {sips.length > 0 && <span className="text-xs text-habit-ink">{freezesLeft} streak freeze{freezesLeft === 1 ? "" : "s"} ready</span>}
          </div>
          {sips.length > 0 ? (
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 flex-none items-center justify-center rounded-[14px] bg-streak text-white"><Flame className="size-[26px]" aria-hidden /></span>
              <div className="flex flex-1 flex-col">
                <b className="text-xl"><span data-testid="streak-count">{streak.current}</span>-month SIP streak</b>
                <span className="text-[13px] text-habit-ink">{nextSip ? `Next SIP on ${shortDate(nextSip)}` : sips.some((x) => x.status === "paused") ? "SIPs paused · resume anytime" : "No active SIP · start a new one anytime"}</span>
              </div>
              {goal && <GoalRing pct={(sipInvested / goal.target) * 100} size={56} />}
            </div>
          ) : (
            <p className="text-sm text-habit-ink">Start a SIP to build a streak. Even ₹100 a month counts. <Link href={starterSipHref(answers)} className="font-bold text-groww underline">Start small</Link></p>
          )}
          {goal && sips.length > 0 && <span className="text-xs text-habit-ink">Goal: {goal.name} · {formatINR(sipInvested)} of {formatINR(goal.target)} via SIPs</span>}
          {earned.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {earned.map((k, idx) => <MilestoneChip key={k} k={k} highlight={idx === 0} />)}
            </div>
          )}
          <Link href="/refer" data-testid="refer-link" className="flex items-center justify-between rounded-xl bg-card px-3 py-2.5 text-[13px] font-semibold text-warn-ink">
            Invite friends · earn streak freezes
            <ChevronRight className="size-4" aria-hidden />
          </Link>
          <span className="text-[11px] text-habit-ink">Milestones reward consistency and learning, never trading more.</span>
        </section>

        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Stocks ({stocks.length})</h2>
          {stocks.length === 0 && <p className="py-1 text-sm text-muted-ink">No stocks yet. <Link href="/stocks" className="font-semibold text-groww">Explore stocks</Link></p>}
          {stocks.map((h) => {
            const i = getInstrument(h.symbol)!;
            return (
              <Link key={h.symbol} href={instrumentHref(i)} data-testid={`real-${h.symbol}`} className="flex min-h-[60px] items-center justify-between border-b border-line-soft">
                <span className="flex flex-col gap-0.5"><b className="text-[15px]">{i.name}</b><span className="text-xs text-muted-ink">{h.qty} {h.qty === 1 ? "share" : "shares"} · avg {formatINR(h.avgPrice, 2)}</span></span>
                <span className="flex flex-col text-right"><b className="text-[15px]">{formatINR(h.value, 2)}</b><span className="text-xs"><Pnl value={h.pnl} /></span></span>
              </Link>
            );
          })}
        </section>

        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Mutual funds ({lumpsumFunds.length + sipRows.length})</h2>
          {lumpsumFunds.length + sipRows.length === 0 && <p className="py-1 text-sm text-muted-ink">No funds yet.</p>}
          {sipRows.map(({ sip, invested: inv, value: val }) => {
            const f = getInstrument(sip.symbol);
            return (
              <Link key={sip.id} href={`/sips/${sip.id}`} data-testid={sip.status === "cancelled" ? `sip-cancelled-${sip.id}` : `sip-${sip.symbol}`} className="flex min-h-[60px] items-center justify-between border-b border-line-soft">
                <span className="flex flex-col gap-0.5">
                  <b className="text-[15px]">{f?.name ?? sip.symbol}</b>
                  <span className="text-xs text-muted-ink">
                    SIP {formatINR(sip.amount)} · {ordinal(sip.day)}
                    {sip.status !== "active" && <span className={`ml-1 font-bold capitalize ${sip.status === "paused" ? "text-warn-ink" : "text-muted-ink"}`}>· {sip.status}</span>}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex flex-col text-right"><b className="text-[15px]">{formatINR(val, 2)}</b><span className="text-xs"><Pnl value={val - inv} /></span></span>
                  <ChevronRight className="size-4 text-faint" aria-hidden />
                </span>
              </Link>
            );
          })}
          {lumpsumFunds.map((h) => {
            const i = getInstrument(h.symbol)!;
            return (
              <Link key={h.symbol} href={instrumentHref(i)} className="flex min-h-[60px] items-center justify-between border-b border-line-soft">
                <span className="flex flex-col gap-0.5"><b className="text-[15px]">{i.name}</b><span className="text-xs text-muted-ink">One-time · {h.qty} units</span></span>
                <span className="flex flex-col text-right"><b className="text-[15px]">{formatINR(h.value, 2)}</b><span className="text-xs"><Pnl value={h.pnl} /></span></span>
              </Link>
            );
          })}
        </section>

        <div className="flex flex-col gap-1">
          <Link href="/orders" className="flex min-h-11 items-center gap-2 text-sm font-semibold text-groww"><ReceiptText className="size-4" aria-hidden />Order history</Link>
          <Link href="/practice" className="flex min-h-11 items-center text-sm font-semibold text-groww">See your Practice portfolio →</Link>
        </div>
      </div>
    </>
  );
}
