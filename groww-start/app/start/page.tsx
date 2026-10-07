"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft, Clock, GraduationCap, Landmark, Layers, Lightbulb, Plane, Plus, ShieldCheck, Sparkles, Sprout, Target,
  TrendingDown, TrendingUp, type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { GOAL_DEFAULTS, personaFor, type Answers } from "@/lib/engine/persona";
import { FIRST_LESSON_ID } from "@/lib/journey";
import { formatINR } from "@/lib/format";

type Option = { value: string; label: string; Icon?: LucideIcon; tone?: string };
const QUESTIONS: { key: keyof Answers; title: string; options: Option[] }[] = [
  { key: "goal", title: "What are you investing for?", options: [
    { value: "emergency", label: "Emergency fund", Icon: ShieldCheck },
    { value: "trip", label: "A trip or gadget", Icon: Plane },
    { value: "studies", label: "Higher studies", Icon: GraduationCap },
    { value: "wealth", label: "Long-term wealth", Icon: Sprout },
    { value: "learning", label: "Just want to learn", Icon: Lightbulb },
  ] },
  { key: "experience", title: "Have you invested before?", options: [
    { value: "never", label: "Never", Icon: Sparkles },
    { value: "fd", label: "FD or RD", Icon: Landmark },
    { value: "mf", label: "Mutual funds / SIP", Icon: Layers },
    { value: "stocks", label: "Stocks", Icon: TrendingUp },
  ] },
  { key: "budget", title: "How much can you set aside each month without stress?", options: [
    { value: "100-500", label: "₹100 – ₹500" },
    { value: "500-2k", label: "₹500 – ₹2,000" },
    { value: "2k-5k", label: "₹2,000 – ₹5,000" },
    { value: "5k+", label: "₹5,000+" },
  ] },
  { key: "reaction", title: "Your ₹1,000 becomes ₹800 in a month. What would you do?", options: [
    { value: "sell", label: "Sell before it falls more", Icon: TrendingDown, tone: "bg-[#FDECEA] text-loss" },
    { value: "wait", label: "Wait it out", Icon: Clock },
    { value: "buy", label: "Buy a little more", Icon: Plus, tone: "bg-[#EAF1FD] text-[#2457C5]" },
  ] },
  { key: "horizon", title: "When will you need this money?", options: [
    { value: "lt1", label: "Within a year" },
    { value: "1to3", label: "In 1–3 years" },
    { value: "3plus", label: "3+ years from now" },
  ] },
];

export default function StartPage() {
  const setOnboarding = useApp((s) => s.setOnboarding);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const total = QUESTIONS.length + 1;

  const choose = (key: keyof Answers, value: string) => {
    setAnswers({ ...answers, [key]: value } as Partial<Answers>);
    if (key === "goal") {
      const d = GOAL_DEFAULTS[value as Answers["goal"]];
      setGoalName(d.name);
      setGoalTarget(String(d.target));
    }
    setStep(step + 1);
  };

  if (step === total) {
    const p = personaFor(answers as Answers);
    const target = Math.max(100, Number(goalTarget) || 5000);
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="flex flex-1 flex-col gap-5 px-5 pb-3 pt-7">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5 rounded-3xl bg-groww px-[22px] py-6 text-white">
            <span className="flex size-[52px] items-center justify-center rounded-2xl bg-[#138A63]"><Sprout className="size-7" aria-hidden /></span>
            <span className="text-sm text-[#BFF0DE]">You&apos;re a</span>
            <h1 data-testid="persona-title" className="text-[32px] font-bold leading-[1.1] tracking-tight">{p.title}</h1>
            <p className="text-[15px] leading-[1.45] text-[#E3F7EF]">{p.tagline}</p>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-[#138A63] px-3 py-2.5 text-sm">
              <Target className="size-[18px]" aria-hidden />
              <span>Goal: <b>{goalName.trim() || "My goal"}</b> · {formatINR(target)}</span>
            </div>
          </motion.section>
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[17px] font-bold">Your 3-step path</h2>
            <ol className="flex flex-col gap-2.5">
              {p.path.map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-[14px] border border-line p-3.5">
                  <span className={`flex size-8 items-center justify-center rounded-full font-bold ${i === 0 ? "bg-mint text-groww" : "bg-[#F1F2F4] text-muted-ink"}`}>{i + 1}</span>
                  <span className="flex-1 text-[15px] font-medium">{s}</span>
                </li>
              ))}
            </ol>
          </section>
          <p className="text-[13px] leading-[1.45] text-muted-ink">This is a learning path, not investment advice. No risk score, and no KYC needed yet.</p>
        </div>
        <footer className="flex flex-col gap-2 px-5 pb-6 pt-3">
          <Link href={`/learn/${FIRST_LESSON_ID}`} className="flex h-[52px] items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white">Start lesson 1</Link>
          <Link href="/journey" className="flex h-12 items-center justify-center rounded-[14px] text-[15px] font-semibold text-groww">See my journey</Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-4 pb-2.5 pt-3.5">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} aria-label="Back" className="flex size-11 items-center justify-center rounded-xl"><ChevronLeft className="size-[22px]" aria-hidden /></button>
        ) : (
          <Link href="/" aria-label="Back to home" className="flex size-11 items-center justify-center rounded-xl"><ChevronLeft className="size-[22px]" aria-hidden /></Link>
        )}
        <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step} aria-label="Quiz progress" className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF0F2]">
          <div className="h-full rounded-full bg-groww transition-all" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <span className="w-11 text-right text-[13px] font-semibold text-muted-ink">{Math.min(step + 1, QUESTIONS.length)}/{QUESTIONS.length}</span>
      </header>

      {step < QUESTIONS.length ? (
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-[22px] px-5 py-[18px]">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-groww">Question {step + 1} of {QUESTIONS.length} · no wrong answers</span>
            <h1 className="text-[26px] font-bold leading-[1.2] tracking-tight">{QUESTIONS[step].title}</h1>
          </div>
          <div className="flex flex-col gap-3">
            {QUESTIONS[step].options.map(({ value, label, Icon, tone }) => {
              const selected = answers[QUESTIONS[step].key] === value;
              return (
                <button key={value} onClick={() => choose(QUESTIONS[step].key, value)}
                  className={`flex min-h-16 items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left text-base font-semibold ${selected ? "border-2 border-groww bg-mint" : "border-[1.5px] border-line hover:border-groww"}`}>
                  {Icon && (
                    <span className={`flex size-9 items-center justify-center rounded-[10px] ${tone ?? "bg-mint text-groww"}`}><Icon className="size-5" aria-hidden /></span>
                  )}
                  {label}
                </button>
              );
            })}
          </div>
          <p className="rounded-[14px] bg-surface px-4 py-3.5 text-sm leading-[1.45] text-muted-ink">This helps us pick what to teach first. It isn&apos;t a risk score, and we won&apos;t ask for KYC or money here.</p>
        </motion.div>
      ) : (
        <form className="flex flex-col gap-4 px-5 py-[18px]" onSubmit={(e) => {
          e.preventDefault();
          setOnboarding(answers as Answers, { name: goalName.trim() || "My goal", target: Math.max(100, Number(goalTarget) || 5000) });
          setStep(total);
        }}>
          <h1 className="text-[26px] font-bold leading-[1.2] tracking-tight">Name your first goal</h1>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-ink">Goal
            <Input value={goalName} onChange={(e) => setGoalName(e.target.value)} maxLength={40} className="h-12 text-base text-ink" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-ink">Target (₹)
            <Input inputMode="numeric" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value.replace(/\D/g, ""))} className="h-12 text-base text-ink" />
          </label>
          <button type="submit" className="mt-2 flex h-[52px] items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white">Save my goal</button>
        </form>
      )}
    </div>
  );
}
