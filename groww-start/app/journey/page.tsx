"use client";
import Link from "next/link";
import { Check, ChevronRight, Lock, Sprout } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { journeyStatus } from "@/lib/journey";
import { personaFor } from "@/lib/engine/persona";

export default function JourneyPage() {
  const state = useApp();
  const j = journeyStatus(state);
  const persona = state.answers ? personaFor(state.answers) : null;
  const steps = [
    { n: 1, title: "Learn", desc: `${j.lessonsDone} of 3 lessons done`, href: "/learn", locked: false, done: j.lessonsDone >= 1 },
    { n: 2, title: "Practice", desc: "Virtual ₹10,000 + Time Machine", href: "/practice", locked: !j.practiceUnlocked, done: state.timeMachineRuns > 0 || state.transactions.length > 0 },
    { n: 3, title: "Invest", desc: "Start Small from ₹100 a month", href: "/invest", locked: !j.investUnlocked, done: j.hasSip },
    { n: 4, title: "Build", desc: "Streaks, milestones, your goal", href: "/progress", locked: false, done: state.instalments.length >= 3 },
    { n: 5, title: "Share", desc: j.shareUnlocked ? "Celebrate a milestone (no ₹ shown)" : "Unlocks with your first milestone", href: "/progress#milestones", locked: !j.shareUnlocked, done: false },
  ];
  const next = steps.find((s) => !s.done && !s.locked);

  return (
    <>
      <PageHeader title="My journey" back="/" />
      <div className="flex flex-col gap-4 px-5 py-4">
        {persona ? (
          <section className="flex items-center gap-3.5 rounded-[18px] bg-mint p-4">
            <span className="flex size-12 items-center justify-center rounded-[14px] bg-groww text-white"><Sprout className="size-[26px]" aria-hidden /></span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-groww">You&apos;re a</span>
              <span className="text-lg font-bold">{persona.title}</span>
              {next && <span className="text-[13px] text-[#3D4050]">Step {next.n} of 5 · next: {next.title.toLowerCase()}</span>}
            </div>
          </section>
        ) : (
          <Link href="/start" className="flex items-center justify-between rounded-[18px] border border-line p-4 text-sm font-semibold">
            Take the 1-minute quiz to personalise your path <ChevronRight className="size-5 text-muted-ink" aria-hidden />
          </Link>
        )}

        <ol className="flex flex-col gap-2.5">
          {steps.map((s) => {
            const isNext = s === next;
            const inner = (
              <>
                <span className={`flex size-10 items-center justify-center rounded-full font-bold ${s.done ? "bg-groww text-white" : isNext ? "bg-mint text-groww" : "bg-[#F1F2F4] text-muted-ink"}`}>
                  {s.done ? <Check className="size-5" strokeWidth={2.4} aria-hidden /> : s.locked ? <Lock className="size-[18px]" aria-hidden /> : s.n}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <b className="text-base">{s.title}</b>
                  <span className="text-[13px] text-muted-ink">{s.desc}</span>
                </span>
                {isNext ? (
                  <span className="rounded-full bg-groww px-2.5 py-1 text-xs font-bold text-white">Up next</span>
                ) : !s.locked && <ChevronRight className="size-5 text-[#8A8D9B]" aria-hidden />}
              </>
            );
            return (
              <li key={s.n}>
                {s.locked ? (
                  <div className="flex min-h-[72px] items-center gap-3.5 rounded-2xl border border-dashed border-[#D5D8DE] px-3.5 py-3 text-[#6B6E7D]">{inner}</div>
                ) : (
                  <Link href={s.href} className={`flex min-h-[72px] items-center gap-3.5 rounded-2xl px-3.5 py-3 ${isNext ? "border-2 border-groww" : "border border-line"}`}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
