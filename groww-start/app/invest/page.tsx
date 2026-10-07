"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, Lock, ShieldCheck, Sprout } from "lucide-react";
import { useApp } from "@/lib/store";
import { FIRST_LESSON_ID, journeyStatus } from "@/lib/journey";
import { personaFor } from "@/lib/engine/persona";
import { fundForCategory } from "@/lib/market/instruments";
import { useHistory } from "@/lib/market/client";
import { sipReplay } from "@/lib/engine/sip";
import { addDays } from "@/lib/engine/dates";
import { formatINR, formatDate } from "@/lib/format";

const AMOUNTS = [
  { value: 100, note: "Lowest to start" },
  { value: 250, note: "Chhoti SIP size", badge: true },
  { value: 500, note: "Build faster" },
];
const DAYS = [1, 5, 10, 15, 20, 25];
const WHY: Record<"index" | "liquid", { title: string; body: string }> = {
  index: { title: "Nifty 50 index fund", body: "It spreads your money across India's 50 largest companies, with low fees and no stock-picking." },
  liquid: { title: "Liquid fund", body: "For money you'll need within about a year, a liquid fund aims for stability rather than growth, so short-term dips are small." },
};
type Step = "amount" | "date" | "review" | "done";
const STEP_NO: Record<Step, number> = { amount: 1, date: 2, review: 3, done: 3 };

export default function InvestPage() {
  const state = useApp();
  const persona = state.answers ? personaFor(state.answers) : null;
  const category = persona?.suggestedCategory ?? "index";
  const fund = fundForCategory(category);
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number>(persona?.suggestedAmount ?? 100);
  const [day, setDay] = useState(5);
  const { data } = useHistory(fund.symbol);

  const pastFive = useMemo(() => {
    if (!data || data.points.length < 2) return null;
    const end = data.points[data.points.length - 1].date;
    return sipReplay(data.points, { monthlyAmount: amount, startDate: addDays(end, -1826), endDate: end, sipDay: day });
  }, [data, amount, day]);

  if (!journeyStatus(state).investUnlocked) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-muted-ink"><Lock className="size-6" aria-hidden /></span>
        <p className="text-lg font-bold">Finish lesson 1 first</p>
        <Link href={`/learn/${FIRST_LESSON_ID}`} className="font-semibold text-groww underline">Start the 2-minute lesson</Link>
      </div>
    );
  }

  if (state.sipPlan && step !== "done") {
    const p = state.sipPlan;
    return (
      <div className="flex flex-col gap-4 px-5 py-5">
        <h1 className="flex items-center gap-2 text-[22px] font-bold"><Sprout className="size-6 text-groww" aria-hidden />Your SIP is running</h1>
        <section className="flex flex-col items-center gap-1 rounded-[20px] bg-mint px-4 py-5">
          <b className="text-4xl tracking-tight">{formatINR(p.amount)}</b>
          <span className="text-sm text-[#3D4050]">every month on day {p.day}</span>
        </section>
        <p className="text-sm text-muted-ink">{fundForCategory(p.category).name} · started {formatDate(p.startDate)} · {state.instalments.length} instalment{state.instalments.length === 1 ? "" : "s"} so far</p>
        <Link href="/progress" className="flex h-[52px] items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white">See my progress</Link>
      </div>
    );
  }

  const back = step === "date" ? "amount" : step === "review" ? "date" : null;
  const primary = "flex h-[52px] w-full items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white";

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3.5">
        {back ? (
          <button onClick={() => setStep(back)} aria-label="Back" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></button>
        ) : (
          <Link href="/journey" aria-label="Back" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></Link>
        )}
        <h1 className="flex-1 text-lg font-bold">{step === "review" ? "Review your SIP" : "Start Small"}</h1>
        {step !== "done" && <span className="text-[13px] font-semibold text-muted-ink">Step {STEP_NO[step]} of 3</span>}
      </header>

      <main className="flex flex-1 flex-col gap-4 px-5 py-[18px]">
        {step === "amount" && (
          <>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-bold leading-[1.2]">Pick an amount you won&apos;t miss</h2>
              <p className="text-[15px] text-muted-ink">Every month. Pause or stop anytime, no penalty.</p>
            </div>
            <div role="radiogroup" aria-label="Monthly amount" className="flex flex-col gap-2.5">
              {AMOUNTS.map((a) => {
                const on = amount === a.value;
                return (
                  <button key={a.value} role="radio" aria-checked={on} onClick={() => setAmount(a.value)}
                    className={`flex min-h-16 items-center justify-between rounded-2xl px-[18px] ${on ? "border-2 border-groww bg-mint" : "border-[1.5px] border-line"}`}>
                    <b className="text-[22px]">{formatINR(a.value)}</b>
                    <span className="flex items-center gap-2">
                      {a.badge && <span className="rounded-full bg-groww px-2 py-1 text-xs font-bold text-white">{a.note}</span>}
                      <span className="text-[13px] text-muted-ink">{a.badge ? (persona?.suggestedAmount === a.value ? "Suggested for you" : "per month") : a.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <section className="flex flex-col gap-2.5 rounded-[18px] border border-line p-4">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-ink">A common starting point</span>
              <b className="text-base">{WHY[category].title}</b>
              <p className="text-sm leading-[1.5] text-[#3D4050]">{WHY[category].body}</p>
              {pastFive && pastFive.series.length > 0 && (
                <p className="rounded-xl bg-surface px-3 py-2.5 text-sm leading-[1.5] text-[#3D4050]">
                  {formatINR(amount)} a month over the last 5 years: <b>{formatINR(pastFive.invested)}</b> invested would be worth about <b>{formatINR(pastFive.finalValue)}</b> today.
                </p>
              )}
              <span className="text-xs leading-[1.45] text-muted-ink">Education, not a recommendation: everyone with your answers sees this. Past performance doesn&apos;t guarantee future returns.</span>
            </section>
          </>
        )}

        {step === "date" && (
          <>
            <h2 className="text-2xl font-bold leading-[1.2]">Which day of the month?</h2>
            <div className="grid grid-cols-3 gap-2">
              {DAYS.map((d) => (
                <button key={d} aria-pressed={day === d} onClick={() => setDay(d)}
                  className={`h-12 rounded-xl text-base ${day === d ? "border-2 border-groww bg-mint font-bold text-groww" : "border-[1.5px] border-line"}`}>{d}</button>
              ))}
            </div>
            <p className="text-sm text-muted-ink">Tip: pick a day just after your stipend or salary arrives.</p>
          </>
        )}

        {step === "review" && (
          <>
            <section className="flex flex-col items-center gap-1 rounded-[20px] bg-mint px-4 py-[22px]">
              <span className="text-sm text-[#3D4050]">You&apos;ll invest</span>
              <b className="text-[40px] tracking-tight">{formatINR(amount)}</b>
              <span className="text-sm text-[#3D4050]">every month, on autopilot</span>
            </section>
            <dl className="flex flex-col rounded-2xl border border-line">
              {[
                ["Fund", `${fund.name} · Direct Growth`],
                ["SIP date", `${day}${day === 1 ? "st" : "th"} of every month`],
                ["First instalment", "Today"],
                ["Goal it counts towards", state.goal?.name ?? "My goal"],
              ].map(([k, v], idx, arr) => (
                <div key={k} className={`flex justify-between gap-4 px-4 py-3.5 ${idx < arr.length - 1 ? "border-b border-[#F1F2F4]" : ""}`}>
                  <dt className="text-sm text-muted-ink">{k}</dt><dd className="text-right text-sm font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2.5 rounded-[14px] bg-surface px-3.5 py-3 text-[13px] leading-[1.5] text-[#3D4050]">
              <ShieldCheck className="mt-0.5 size-[18px] flex-none text-muted-ink" aria-hidden />
              <span>Demo only: no real money moves. In the real app this hands off to Groww&apos;s SIP flow with UPI AutoPay, and KYC happens here, not before.</span>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="flex size-20 items-center justify-center rounded-full bg-groww text-white"><Check className="size-10" strokeWidth={2.6} aria-hidden /></motion.span>
            <h2 className="text-2xl font-bold">First investment done</h2>
            <p className="text-[15px] text-muted-ink">{formatINR(amount)} every month, on autopilot. The hardest step was starting.</p>
          </div>
        )}
      </main>

      <footer className="px-5 pb-[22px] pt-3">
        {step === "amount" && <button onClick={() => setStep("date")} className={primary}>Continue</button>}
        {step === "date" && <button onClick={() => setStep("review")} className={primary}>Continue</button>}
        {step === "review" && (
          <button onClick={() => { state.startSip({ category, symbol: fund.symbol, amount, day }); setStep("done"); }} className={primary}>Confirm with UPI (demo)</button>
        )}
        {step === "done" && <Link href="/progress" className={primary}>See my progress</Link>}
      </footer>
    </div>
  );
}
