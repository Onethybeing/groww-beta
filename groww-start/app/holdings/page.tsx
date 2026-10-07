"use client";
import Link from "next/link";
import { Flame, Share } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { GoalRing } from "@/components/goal-ring";
import { MilestoneIcon } from "@/components/milestone-icon";
import { useShareHref } from "@/components/milestone-toast";
import { useApp, useToday } from "@/lib/store";
import { useHistory } from "@/lib/market/client";
import { getInstrument, fundForCategory } from "@/lib/market/instruments";
import { computeStreak } from "@/lib/engine/streak";
import { valueInstalments } from "@/lib/engine/instalments";
import { starterSipHref } from "@/lib/starter";
import { dateInMonth, monthKey, nextMonthKey } from "@/lib/engine/dates";
import { MILESTONES, MILESTONE_ORDER, type MilestoneKey } from "@/lib/engine/milestones";
import { formatDate, formatINR, formatPct } from "@/lib/format";

const shortDate = (iso: string) => formatDate(iso).replace(/ \d{4}$/, "");
const ordinal = (d: number) => `${d}${d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}`;

function MilestoneChip({ k, highlight }: { k: MilestoneKey; highlight: boolean }) {
  const href = useShareHref(k);
  const m = MILESTONES[k];
  return (
    <Link href={href} data-testid={`milestone-${k}`} data-achieved="true" aria-label={`${m.title}, share`}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-semibold ${highlight ? "bg-streak text-white" : "border border-[#F0DCC3] bg-white"}`}>
      <MilestoneIcon name={m.icon} className="size-3.5" />
      {m.title}
      {highlight && <Share className="size-3" aria-hidden />}
    </Link>
  );
}

export default function HoldingsPage() {
  const { sipPlan, instalments, goal, milestones, answers } = useApp();
  const today = useToday();
  const fund = sipPlan ? getInstrument(sipPlan.symbol) ?? fundForCategory(sipPlan.category) : null;
  const { data } = useHistory(sipPlan?.symbol ?? "MF120716");
  const { invested, value } = valueInstalments(instalments, sipPlan ? data?.points ?? [] : []);
  const pnl = value - invested;
  const pnlPct = invested ? (pnl / invested) * 100 : 0;
  const streak = computeStreak(instalments.map((i) => i.date), today);
  const earned = MILESTONE_ORDER.filter((k) => milestones[k]).sort((a, b) => (milestones[b]! > milestones[a]! ? 1 : -1));
  const paidThisMonth = instalments.some((i) => monthKey(i.date) === monthKey(today));
  const thisMonth = sipPlan ? dateInMonth(monthKey(today), sipPlan.day) : null;
  const nextSip = !sipPlan ? null : thisMonth! > today && !paidThisMonth ? thisMonth! : dateInMonth(nextMonthKey(monthKey(today)), sipPlan.day);

  return (
    <>
      <AppHeader active="holdings" />
      <div className="flex flex-col gap-3.5 px-5 py-3.5">
        <section className="flex flex-col gap-2.5 rounded-2xl border border-line px-4 py-3.5">
          <div className="flex justify-between text-[13px] text-muted-ink"><span>Current value</span><span>Invested</span></div>
          <div className="flex items-end justify-between"><b className="text-[22px]">{formatINR(value, 2)}</b><b className="text-base">{formatINR(invested, 2)}</b></div>
          <div className="flex justify-between border-t border-[#F1F2F4] pt-2 text-[13px]">
            <span className="text-muted-ink">Total returns</span>
            <b className={pnl > 0 ? "text-groww" : pnl < 0 ? "text-loss" : ""}>{pnl < 0 ? "−" : ""}{formatINR(Math.abs(pnl), 2)} ({formatPct(pnlPct)})</b>
          </div>
        </section>

        <section aria-label="Your habit" data-testid="habit-card" className="flex flex-col gap-3 rounded-[18px] border border-[#F6DDBE] bg-[#FFF8EF] px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8A4B00]">Your habit</span>
            {sipPlan && <span className="text-xs text-[#7A4A12]">{streak.freezesUsed > 0 ? "Streak freeze used" : "1 streak freeze ready"}</span>}
          </div>
          {sipPlan ? (
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 flex-none items-center justify-center rounded-[14px] bg-streak text-white"><Flame className="size-[26px]" aria-hidden /></span>
              <div className="flex flex-1 flex-col">
                <b className="text-xl"><span data-testid="streak-count">{streak.current}</span>-month SIP streak</b>
                {nextSip && <span className="text-[13px] text-[#5C3A10]">Next SIP on {shortDate(nextSip)}</span>}
              </div>
              {goal && <GoalRing pct={(invested / goal.target) * 100} size={56} />}
            </div>
          ) : (
            <p className="text-sm text-[#5C3A10]">Start a SIP to build a streak. Even ₹100 a month counts. <Link href={starterSipHref(answers)} className="font-bold text-groww underline">Start small</Link></p>
          )}
          {goal && sipPlan && <span className="text-xs text-[#5C3A10]">Goal: {goal.name} · {formatINR(invested)} of {formatINR(goal.target)}</span>}
          {earned.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {earned.map((k, idx) => <MilestoneChip key={k} k={k} highlight={idx === 0} />)}
            </div>
          )}
          <span className="text-[11px] text-[#7A4A12]">Milestones reward consistency and learning, never trading more.</span>
        </section>

        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Mutual funds ({sipPlan ? 1 : 0})</h2>
          {sipPlan && fund ? (
            <Link href={`/funds/${fund.symbol}`} className="flex min-h-[60px] items-center justify-between border-b border-[#F1F2F4]">
              <span className="flex flex-col gap-0.5"><b className="text-[15px]">{fund.name}</b><span className="text-xs text-muted-ink">SIP {formatINR(sipPlan.amount)} · {ordinal(sipPlan.day)} of every month</span></span>
              <span className="flex flex-col text-right"><b className="text-[15px]">{formatINR(value, 2)}</b><span className={`text-xs ${pnl >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(pnlPct)}</span></span>
            </Link>
          ) : <p className="py-2 text-sm text-muted-ink">No real investments yet.</p>}
          <Link href="/practice" className="mt-2 text-sm font-semibold text-groww">See your Practice portfolio →</Link>
        </section>
      </div>
    </>
  );
}
