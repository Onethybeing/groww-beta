"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, Sprout } from "lucide-react";
import { BeginnerTip } from "@/components/beginner-tip";
import { useApp } from "@/lib/store";
import { personaFor } from "@/lib/engine/persona";
import { MIN_SIP } from "@/lib/engine/instalments";
import type { Instrument } from "@/lib/market/instruments";
import { formatINR } from "@/lib/format";

const PICKS = [
  { value: 100, note: "Lowest" },
  { value: 250, note: "Chhoti SIP" },
  { value: 500, note: "Build faster" },
];
const DAYS = [1, 5, 10, 15, 20, 25];
const ordinal = (d: number) => `${d}${d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}`;

export function SipOrder({ instrument }: { instrument: Instrument }) {
  const { answers, goal, hintsOn, sipPlan, startSip } = useApp();
  const [amount, setAmount] = useState(String(answers ? personaFor(answers).suggestedAmount : 250));
  const [day, setDay] = useState(5);
  const [done, setDone] = useState(false);
  const value = Number(amount) || 0;
  const valid = value >= MIN_SIP;

  const header = (
    <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
      <Link href={`/funds/${instrument.symbol}`} aria-label="Back" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></Link>
      <div className="flex flex-col">
        <h1 className="text-base font-bold">{instrument.name}</h1>
        <span className="text-xs text-muted-ink">Direct · Growth</span>
      </div>
    </header>
  );
  const primary = "flex h-[52px] w-full items-center justify-center rounded-[14px] bg-groww text-base font-bold text-white disabled:opacity-50";

  if (done || sipPlan) {
    const plan = sipPlan!;
    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <div className="flex flex-1 flex-col items-center gap-4 px-6 py-10 text-center">
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="flex size-20 items-center justify-center rounded-full bg-groww text-white">
            {done ? <Check className="size-10" strokeWidth={2.6} aria-hidden /> : <Sprout className="size-9" aria-hidden />}
          </motion.span>
          <h2 className="text-2xl font-bold">{done ? "SIP started" : "Your SIP is running"}</h2>
          <p className="text-[15px] text-muted-ink">{formatINR(plan.amount)} on the {ordinal(plan.day)} of every month, on autopilot.{done && " The hardest step was starting."}</p>
          {!done && <p className="text-xs text-muted-ink">This concept demo supports one SIP.</p>}
        </div>
        <footer className="px-5 pb-[22px]"><Link href="/holdings" className={primary}>See it in Holdings</Link></footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="flex flex-1 flex-col gap-[18px] px-5 py-4">
        <div role="tablist" aria-label="Order type" className="grid grid-cols-2 gap-1 rounded-xl bg-[#F1F2F4] p-1">
          <button role="tab" aria-selected className="h-10 rounded-[9px] bg-white text-sm font-bold shadow-[0_1px_3px_rgba(27,29,41,0.1)]">Monthly SIP</button>
          <button role="tab" aria-selected={false} disabled className="h-10 rounded-[9px] text-sm font-semibold text-muted-ink">One-time</button>
        </div>

        <label className="flex flex-col items-center gap-1.5 py-2">
          <span className="text-[13px] font-semibold text-muted-ink">SIP amount</span>
          <span className="flex items-baseline border-b-2 border-groww">
            <span className="text-[40px] font-bold">₹</span>
            <input data-testid="sip-amount" inputMode="numeric" aria-label="SIP amount" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
              className="w-[150px] bg-transparent text-center text-[40px] font-bold outline-none" />
          </span>
          {!valid && <span role="alert" className="text-xs font-semibold text-loss">Minimum SIP is {formatINR(MIN_SIP)}</span>}
        </label>

        {hintsOn && (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-groww"><Sprout className="size-4" aria-hidden />Start small</span>
            <div className="grid grid-cols-3 gap-2">
              {PICKS.map((p) => {
                const on = value === p.value;
                return (
                  <button key={p.value} type="button" aria-pressed={on} onClick={() => setAmount(String(p.value))}
                    className={`flex h-14 flex-col items-center justify-center rounded-xl ${on ? "border-2 border-groww bg-mint" : "border-[1.5px] border-line"}`}>
                    <b className="text-base">{formatINR(p.value)}</b>
                    <span className={`text-[11px] ${on || p.value === 250 ? "font-bold text-groww" : "text-muted-ink"}`}>{p.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-[14px] border border-line px-3.5 py-3">
          <span className="text-sm text-muted-ink">Monthly SIP date <span className="text-ink">· first one today</span></span>
          <div className="grid grid-cols-6 gap-1.5">
            {DAYS.map((d) => (
              <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)}
                className={`h-9 rounded-lg text-sm ${day === d ? "border-[1.5px] border-groww bg-mint font-bold text-groww" : "border border-line"}`}>{d}</button>
            ))}
          </div>
        </div>
        {goal && (
          <div className="flex min-h-[52px] items-center justify-between rounded-[14px] border border-line px-3.5">
            <span className="text-sm text-muted-ink">Counts towards goal</span><b className="text-[15px]">{goal.name}</b>
          </div>
        )}
        <BeginnerTip title="Your first SIP.">It runs automatically each month. Pause or stop anytime with no penalty. Past returns don&apos;t guarantee future returns.</BeginnerTip>
      </main>
      <footer className="border-t border-line px-5 pb-[22px] pt-3">
        <button type="button" disabled={!valid} className={primary}
          onClick={() => { startSip({ category: instrument.category ?? "index", symbol: instrument.symbol, amount: value, day }); setDone(true); }}>
          Start SIP · UPI AutoPay (demo)
        </button>
      </footer>
    </div>
  );
}
