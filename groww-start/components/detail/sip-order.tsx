"use client";
import { SavedData } from "@/components/saved-data";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft, Sprout } from "lucide-react";
import { BeginnerTip } from "@/components/beginner-tip";
import { useApp } from "@/lib/store";
import { personaFor } from "@/lib/engine/persona";
import { MIN_SIP } from "@/lib/engine/instalments";
import { DayPicker } from "./day-picker";
import { fundUnits } from "@/lib/engine/portfolio";
import { useHistory } from "@/lib/market/client";
import type { Instrument } from "@/lib/market/instruments";
import { formatDate, formatINR, ordinal } from "@/lib/format";

const PICKS = [
  { value: 100, note: "Lowest" },
  { value: 250, note: "Chhoti SIP" },
  { value: 500, note: "Build faster" },
];

function SipOrderBody({ instrument, initialMode = "sip" }: { instrument: Instrument; initialMode?: "sip" | "lumpsum" }) {
  const { answers, goal, hintsOn, sips, wallet, startSip, placeOrder } = useApp();
  const { data } = useHistory(instrument.symbol);
  const nav = data?.points.at(-1);
  const [mode, setMode] = useState<"sip" | "lumpsum">(initialMode);
  const [amount, setAmount] = useState(String(answers ? personaFor(answers).suggestedAmount : 250));
  const [day, setDay] = useState(5);
  const [done, setDone] = useState<null | { kind: "sip" | "lumpsum"; amount: number; day: number }>(null);
  const [error, setError] = useState<string | null>(null);
  const value = Number(amount) || 0;
  const existing = sips.find((s) => s.symbol === instrument.symbol && s.status !== "cancelled");
  const valid = value >= MIN_SIP;

  const header = (
    <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
      <Link href={`/funds/${instrument.symbol}`} aria-label="Back" className="flex size-11 items-center justify-center"><ChevronLeft className="size-[22px]" aria-hidden /></Link>
      <div className="flex flex-col">
        <h1 className="text-base font-bold">{instrument.name}</h1>
        <span className="text-xs text-muted-ink">Direct · Growth{nav ? ` · NAV ${formatINR(nav.close, 2)} (${formatDate(nav.date)})` : ""}</span>
      </div>
    </header>
  );
  const primary = "flex h-[52px] w-full items-center justify-center rounded-[14px] bg-brand-surface text-base font-bold text-white disabled:opacity-50";

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col">
        {header}
        <div className="flex flex-1 flex-col items-center gap-4 px-6 py-10 text-center">
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="flex size-20 items-center justify-center rounded-full bg-brand-surface text-white"><Check className="size-10" strokeWidth={2.6} aria-hidden /></motion.span>
          <h2 className="text-2xl font-bold">{done.kind === "sip" ? "SIP started" : "Order placed"}</h2>
          <p className="text-[15px] text-muted-ink">
            {done.kind === "sip"
              ? `${formatINR(done.amount)} on the ${ordinal(done.day)} of every month, on autopilot. The hardest step was starting.`
              : `${formatINR(done.amount)} invested at NAV ${nav ? formatINR(nav.close, 2) : ""}.`}
          </p>
          <p className="text-xs text-muted-ink">Paid from your demo balance · {formatINR(wallet, 2)} left</p>
        </div>
        <footer className="px-5 pb-[22px]"><Link href="/holdings" className={primary}>See it in Holdings</Link></footer>
      </div>
    );
  }

  const submit = () => {
    setError(null);
    if (mode === "sip") {
      const r = startSip({ category: instrument.category ?? "index", symbol: instrument.symbol, amount: value, day });
      if (!r.ok) return setError(r.error);
      setDone({ kind: "sip", amount: value, day });
    } else {
      if (!nav) return;
      const r = placeOrder({ symbol: instrument.symbol, side: "buy", qty: fundUnits(value, nav.close), price: nav.close }, true);
      if (!r.ok) return setError(r.error);
      setDone({ kind: "lumpsum", amount: value, day });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="flex flex-1 flex-col gap-[18px] px-5 py-4">
        <div role="tablist" aria-label="Order type" className="grid grid-cols-2 gap-1 rounded-xl bg-chip p-1">
          {(["sip", "lumpsum"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(null); }}
              className={`h-10 rounded-[9px] text-sm ${mode === m ? "bg-card font-bold shadow-[0_1px_3px_rgba(27,29,41,0.1)]" : "font-semibold text-muted-ink"}`}>
              {m === "sip" ? "Monthly SIP" : "One-time"}
            </button>
          ))}
        </div>

        {mode === "sip" && existing ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-mint p-4 text-sm">
            <b className="text-base">You already have a SIP in this fund</b>
            <span>{formatINR(existing.amount)} on the {ordinal(existing.day)} · {existing.status}</span>
            <Link href={`/sips/${existing.id}`} className="font-bold text-groww">Manage this SIP →</Link>
          </div>
        ) : (
          <>
            <label className="flex flex-col items-center gap-1.5 py-2">
              <span className="text-[13px] font-semibold text-muted-ink">{mode === "sip" ? "SIP amount" : "Investment amount"}</span>
              <span className="flex items-baseline border-b-2 border-groww">
                <span className="text-[40px] font-bold">₹</span>
                <input data-testid="sip-amount" inputMode="numeric" aria-label={mode === "sip" ? "SIP amount" : "Investment amount"} value={amount}
                  onChange={(e) => { setAmount(e.target.value.replace(/\D/g, "").slice(0, 7)); setError(null); }}
                  className="w-[150px] bg-transparent text-center text-[40px] font-bold outline-none" />
              </span>
              {!valid && <span role="alert" className="text-xs font-semibold text-loss">Minimum is {formatINR(MIN_SIP)}</span>}
              {mode === "lumpsum" && valid && nav && <span className="text-xs text-muted-ink">≈ {fundUnits(value, nav.close)} units</span>}
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

            {mode === "sip" && (
              <div className="flex flex-col gap-2 rounded-[14px] border border-line px-3.5 py-3">
                <span className="text-sm text-muted-ink">Monthly SIP date <span className="text-ink">· first one today</span></span>
                <DayPicker value={day} onChange={setDay} />
              </div>
            )}
            {goal && mode === "sip" && (
              <div className="flex min-h-[52px] items-center justify-between rounded-[14px] border border-line px-3.5">
                <span className="text-sm text-muted-ink">Counts towards goal</span><b className="text-[15px]">{goal.name}</b>
              </div>
            )}
            <div className="flex items-center justify-between text-sm"><span className="text-muted-ink">Demo balance</span><b>{formatINR(wallet, 2)}</b></div>
            {mode === "sip"
              ? <BeginnerTip title="Your first SIP.">It runs automatically each month. Pause or stop anytime with no penalty. Past returns don&apos;t guarantee future returns.</BeginnerTip>
              : <BeginnerTip title="One-time vs SIP.">A one-time buy invests at today&apos;s NAV. A SIP spreads buys over months, so dips can work in your favour.</BeginnerTip>}
            {error && <p role="alert" className="text-sm font-semibold text-loss">{error}</p>}
          </>
        )}
      </main>
      {!(mode === "sip" && existing) && (
        <footer className="border-t border-line px-5 pb-[22px] pt-3">
          <button type="button" disabled={!valid || (mode === "lumpsum" && !nav)} className={primary} onClick={submit}>
            {mode === "sip" ? "Start SIP · UPI AutoPay (demo)" : "Invest now (demo)"}
          </button>
        </footer>
      )}
    </div>
  );
}

export function SipOrder(props: { instrument: Instrument; initialMode?: "sip" | "lumpsum" }) {
  return <SavedData><SipOrderBody {...props} /></SavedData>;
}
