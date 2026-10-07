"use client";
import Link from "next/link";
import { ChevronRight, Coins, Layers, Search, TrendingUp } from "lucide-react";
import { GrowwHeader } from "@/components/groww-header";
import { useApp } from "@/lib/store";
import { useQuotes } from "@/lib/market/client";
import { formatDate, formatINR, formatPct } from "@/lib/format";

const STEPS = ["Learn", "Practice", "Invest", "Build", "Share"];
const EXPLORE = [
  { label: "Stocks", Icon: TrendingUp },
  { label: "Mutual Funds", Icon: Layers },
  { label: "Gold", Icon: Coins },
];

export default function Home() {
  const started = useApp((s) => s.answers !== null);
  const { data: quotes } = useQuotes(["^NSEI", "GOLDBEES.NS"]);

  return (
    <>
      <GrowwHeader />
      <div className="flex flex-col gap-5 px-5 py-4">
        <label className="flex h-12 items-center gap-2.5 rounded-xl border border-line px-3.5 text-muted-ink">
          <Search className="size-[18px]" aria-hidden />
          <input type="search" placeholder="Search Groww…" aria-label="Search Groww" className="flex-1 bg-transparent text-[15px] text-ink outline-none" />
        </label>

        <section className="flex flex-col gap-3.5 rounded-[20px] bg-groww p-5 text-white">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#BFF0DE]">{started ? "Your beginner journey" : "New to investing?"}</span>
          <h1 className="text-[26px] font-bold leading-[1.15] tracking-tight">
            {started ? "Pick up where you left off." : "Start here. Learn first, then begin with ₹100."}
          </h1>
          <p className="text-[15px] leading-[1.45] text-[#E3F7EF]">2-minute lessons, practice with virtual money, then a small SIP when you feel ready.</p>
          <div className="flex flex-wrap gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={`rounded-full px-2.5 py-[5px] text-xs font-semibold ${i === 0 ? "bg-white text-groww" : "bg-[#138A63] text-white"}`}>{s}</span>
            ))}
          </div>
          <Link href={started ? "/journey" : "/start"} className="flex h-[50px] items-center justify-center gap-2 rounded-xl bg-white text-base font-bold text-groww">
            {started ? "Continue my journey" : "Start here: 1-minute quiz"}
            <ChevronRight className="size-[18px]" aria-hidden />
          </Link>
        </section>

        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold">Market today</h2>
            {quotes?.[0] && <span className="text-xs text-muted-ink">Last close · {formatDate(quotes[0].date)}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {(quotes ?? []).map((q) => (
              <div key={q.symbol} className="flex flex-col gap-1 rounded-[14px] border border-line px-3.5 py-3">
                <span className="text-xs font-semibold text-muted-ink">{q.symbol === "^NSEI" ? "NIFTY 50" : "GOLDBEES"}</span>
                <span className="text-[17px] font-bold">{q.symbol === "^NSEI" ? q.price.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : formatINR(q.price, 2)}</span>
                <span className={`text-[13px] font-semibold ${q.changePct >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(q.changePct)}</span>
              </div>
            ))}
            {!quotes && [0, 1].map((i) => <div key={i} className="h-[86px] animate-pulse rounded-[14px] bg-surface" />)}
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[17px] font-bold">Explore</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {EXPLORE.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-[14px] bg-surface px-1.5 py-3 text-[13px] font-medium text-muted-ink">
                <Icon className="size-[22px]" aria-hidden />
                {label}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-ink">The rest of the Groww app is out of scope for this concept.</p>
        </section>
      </div>
    </>
  );
}
