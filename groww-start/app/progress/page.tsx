"use client";
import Link from "next/link";
import { Flame, Lock } from "lucide-react";
import { GoalRing } from "@/components/goal-ring";
import { MilestoneIcon } from "@/components/milestone-icon";
import { useShareHref } from "@/components/milestone-toast";
import { useApp, useToday } from "@/lib/store";
import { computeStreak } from "@/lib/engine/streak";
import { dateInMonth, monthKey, nextMonthKey } from "@/lib/engine/dates";
import { MILESTONES, MILESTONE_ORDER, type MilestoneKey } from "@/lib/engine/milestones";
import { formatINR, formatDate } from "@/lib/format";

const shortDate = (iso: string) => formatDate(iso).replace(/ \d{4}$/, "");

function MilestoneTile({ k, achievedAt, highlight, progress }: { k: MilestoneKey; achievedAt?: string; highlight: boolean; progress?: string }) {
  const href = useShareHref(k);
  const m = MILESTONES[k];
  const body = (
    <>
      {achievedAt ? <MilestoneIcon name={m.icon} className={`size-[22px] ${highlight ? "text-[#C4620A]" : "text-groww"}`} /> : <Lock className="size-[22px]" aria-hidden />}
      <b className="text-[13px] leading-tight">{m.title}</b>
      {achievedAt ? (
        <span className="text-[11px] text-muted-ink">{shortDate(achievedAt)} · <span className="font-bold text-groww">Share</span></span>
      ) : (
        <span className="text-[11px]">{progress ?? m.description}</span>
      )}
    </>
  );
  const base = "flex flex-col gap-1 rounded-[14px] p-2.5";
  return achievedAt ? (
    <Link href={href} data-testid={`milestone-${k}`} data-achieved="true" aria-label={`${m.title}, share`}
      className={`${base} ${highlight ? "border-2 border-streak" : "border border-line"}`}>{body}</Link>
  ) : (
    <div data-testid={`milestone-${k}`} data-achieved="false" className={`${base} border border-dashed border-[#D5D8DE] text-[#6B6E7D]`}>{body}</div>
  );
}

export default function ProgressPage() {
  const s = useApp();
  const today = useToday();
  const streak = computeStreak(s.instalments.map((i) => i.date), today);
  const invested = s.instalments.reduce((a, i) => a + i.amount, 0);
  const goalPct = s.goal ? (invested / s.goal.target) * 100 : 0;
  const lessonsDone = Object.keys(s.lessons).length;
  const earned = MILESTONE_ORDER.filter((k) => s.milestones[k]).length;
  const thisMonthSip = s.sipPlan ? dateInMonth(monthKey(today), s.sipPlan.day) : null;
  const paidThisMonth = s.instalments.some((i) => monthKey(i.date) === monthKey(today));
  const nextSip = !s.sipPlan ? null
    : thisMonthSip! > today && !paidThisMonth ? thisMonthSip : dateInMonth(nextMonthKey(monthKey(today)), s.sipPlan.day);
  const latest = MILESTONE_ORDER.filter((k) => s.milestones[k]).sort((a, b) => (s.milestones[b]! > s.milestones[a]! ? 1 : -1))[0];

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold">My progress</h1>
        {s.clockOffsetDays > 0 && <span className="text-xs text-muted-ink">Demo date: {formatDate(today)}</span>}
      </header>

      <div className="flex flex-col gap-3 px-5 pb-3 pt-2">
        <section className="flex items-center gap-3.5 rounded-[18px] bg-[#FFF4E6] p-4">
          <span className="flex size-[54px] items-center justify-center rounded-2xl bg-streak text-white"><Flame className="size-[30px]" aria-hidden /></span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[13px] text-[#7A4A12]">SIP streak</span>
            <b className="text-[26px]"><span data-testid="streak-count">{streak.current}</span> month{streak.current === 1 ? "" : "s"}</b>
            <span className="text-[13px] leading-[1.4] text-[#5C3A10]">
              {!s.sipPlan ? (
                <>No SIP yet. <Link href="/invest" className="font-semibold underline">Start with ₹100</Link></>
              ) : streak.freezesUsed > 0 ? (
                "Streak freeze used for a skipped month. Your streak is safe."
              ) : (
                "1 streak freeze ready. Skip a month when money's tight and keep your streak."
              )}
            </span>
          </div>
        </section>

        {s.goal && (
          <section className="flex items-center gap-4 rounded-[18px] border border-line px-4 py-3.5">
            <GoalRing pct={goalPct} />
            <div className="flex flex-1 flex-col gap-0.5">
              <b className="text-base">{s.goal.name}</b>
              <span className="text-sm text-[#3D4050]">{formatINR(invested)} of {formatINR(s.goal.target)} invested</span>
              <span className="text-[13px] text-muted-ink">
                {s.instalments.length} SIP instalment{s.instalments.length === 1 ? "" : "s"}{nextSip ? ` · next on ${shortDate(nextSip)}` : ""}
              </span>
            </div>
          </section>
        )}

        <section id="milestones" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold">Milestones</h2>
            <span className="text-xs text-muted-ink">{earned} of {MILESTONE_ORDER.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MILESTONE_ORDER.map((k) => (
              <MilestoneTile key={k} k={k} achievedAt={s.milestones[k]} highlight={k === latest && k === "streak_3"}
                progress={k === "three_lessons" ? `${lessonsDone} of 3 lessons` : k === "streak_3" && s.sipPlan ? `${streak.current} of 3 months` : undefined} />
            ))}
          </div>
          <span className="text-xs text-muted-ink">Milestones reward learning and consistency, never trading more.</span>
        </section>

        {s.reflections.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold">Your notes to self</h2>
            {s.reflections.slice(-3).reverse().map((r, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-[14px] bg-surface px-3.5 py-3">
                <span className="text-xs text-muted-ink">{r.prompt} · {shortDate(r.date)}</span>
                <span className="text-sm">&ldquo;{r.answer}&rdquo;</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
