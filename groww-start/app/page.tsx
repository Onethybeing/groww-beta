"use client";
import Link from "next/link";
import { ChevronRight, FlaskConical } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { InstrumentRow, Monogram, instrumentHref } from "@/components/instrument-row";
import { WelcomeSheet } from "@/components/welcome-sheet";
import { TwoCol } from "@/components/two-col";
import { useApp } from "@/lib/store";
import { useQuotes } from "@/lib/market/client";
import { getInstrument } from "@/lib/market/instruments";
import { starterFund } from "@/lib/starter";
import { formatINR, formatPct } from "@/lib/format";

const POPULAR = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ITC.NS"];
const INDICES = ["^NSEI", "GOLDBEES.NS"];

export default function Home() {
  const hintsOn = useApp((s) => s.hintsOn);
  const watchlist = useApp((s) => s.watchlist);
  const { data: quotes } = useQuotes([...new Set([...INDICES, ...POPULAR, ...watchlist])]);
  const q = (s: string) => quotes?.find((x) => x.symbol === s);
  const answers = useApp((s) => s.answers);
  const starter = starterFund(answers);

  return (
    <>
      <AppHeader active="explore" />
      <div className="flex flex-col gap-4 px-5 py-3.5">
        <TwoCol left={<>
        <div className="flex gap-2.5">
          {INDICES.map((s) => {
            const quote = q(s);
            return (
              <div key={s} className="flex flex-1 flex-col gap-0.5 rounded-xl border border-line px-3 py-2.5">
                <span className="text-xs font-semibold text-muted-ink">{s === "^NSEI" ? "NIFTY 50" : "GOLDBEES"}</span>
                {quote ? (
                  <span className="text-[15px] font-bold">
                    {s === "^NSEI" ? quote.price.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : formatINR(quote.price, 2)}{" "}
                    <span className={`text-xs ${quote.changePct >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(quote.changePct)}</span>
                  </span>
                ) : <span className="h-5 w-24 animate-pulse rounded bg-surface" />}
              </div>
            );
          })}
        </div>

        {hintsOn && (
          <Link href="/practice" data-testid="practice-banner" className="flex items-center gap-3 rounded-[14px] bg-mint px-3.5 py-3">
            <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-brand-surface text-white"><FlaskConical className="size-5" aria-hidden /></span>
            <span className="flex flex-1 flex-col gap-px">
              <b className="text-sm">New here? Try anything with ₹10,000 virtual money</b>
              <span className="text-xs text-ink-2">Beginner hints are on · Practice tab</span>
            </span>
            <ChevronRight className="size-[18px] text-groww" aria-hidden />
          </Link>
        )}

        {watchlist.length > 0 && (
          <section data-testid="watchlist" className="flex flex-col">
            <h2 className="mb-1 text-[17px] font-bold">Your watchlist</h2>
            {watchlist.map((sym, idx) => {
              const i = getInstrument(sym);
              return i ? <InstrumentRow key={sym} i={i} index={idx} q={q(sym)} sub={i.kind === "fund" ? "Mutual fund" : `NSE: ${i.short}`} /> : null;
            })}
          </section>
        )}

        </>} right={<>
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[17px] font-bold">Popular large caps</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {POPULAR.map((s, idx) => {
              const i = getInstrument(s)!;
              const quote = q(s);
              return (
                <Link key={s} href={instrumentHref(i)} className="flex flex-col gap-1.5 rounded-[14px] border border-line p-3">
                  <Monogram i={i} index={idx} />
                  <b className="text-sm">{i.short === "TCS" ? "TCS" : i.name}</b>
                  {quote ? (
                    <span className="text-sm font-semibold">{formatINR(quote.price, 2)} <span className={`text-xs ${quote.changePct >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(quote.changePct)}</span></span>
                  ) : <span className="h-5 w-24 animate-pulse rounded bg-surface" />}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[17px] font-bold">Mutual fund collections</h2>
          <div className="flex flex-wrap gap-2">
            {hintsOn && (
              <Link href={`/funds/${starter.symbol}`} className="rounded-full border-[1.5px] border-groww bg-mint px-3 py-2 text-[13px] font-bold text-groww">Start with ₹100</Link>
            )}
            <Link href="/funds" className="rounded-full border border-line px-3 py-2 text-[13px] font-semibold">Index funds</Link>
            <Link href="/funds" className="rounded-full border border-line px-3 py-2 text-[13px] font-semibold">Tax saver</Link>
            <Link href="/funds" className="rounded-full border border-line px-3 py-2 text-[13px] font-semibold">Gold</Link>
          </div>
        </section>
        </>} />
        <p data-testid="disclaimer" className="border-t border-line pt-3 text-center text-[11px] leading-[1.5] text-muted-ink">
          GROW Beta is a concept demo inspired by Groww · not affiliated with Groww · demo money only.<br />
          Prices are real past data (stocks to 7 Oct 2026, fund NAVs to 6 Oct 2026) · not investment advice.
        </p>
      </div>
      <WelcomeSheet />
    </>
  );
}
