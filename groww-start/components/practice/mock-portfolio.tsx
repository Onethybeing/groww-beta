"use client";
import { useMemo, useState } from "react";
import { TradeSheet } from "./trade-sheet";
import { ReflectionPrompt } from "@/components/reflection-prompt";
import { useQuotes } from "@/lib/market/client";
import { INSTRUMENTS, getInstrument, type Instrument } from "@/lib/market/instruments";
import { holdings } from "@/lib/engine/portfolio";
import { useApp } from "@/lib/store";
import { formatDate, formatINR, formatPct } from "@/lib/format";

const UNIVERSE = INSTRUMENTS.filter((i) => i.kind !== "index");
const kindLabel = (i: Instrument) => (i.kind === "fund" ? "Mutual fund · NAV" : i.kind === "etf" ? "Gold ETF" : "Stock");

export function MockPortfolio() {
  const cash = useApp((s) => s.cash);
  const txns = useApp((s) => s.transactions);
  const { data: quotes, isLoading } = useQuotes(UNIVERSE.map((i) => i.symbol));
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [reflect, setReflect] = useState(false);

  const prices = useMemo(() => Object.fromEntries((quotes ?? []).map((q) => [q.symbol, q.price])), [quotes]);
  const hs = holdings(txns, prices);
  const value = hs.reduce((a, h) => a + h.value, 0);
  const pnl = hs.reduce((a, h) => a + h.pnl, 0);
  const snapshot = quotes?.some((q) => q.source === "snapshot");
  const selectedQuote = quotes?.find((q) => q.symbol === selected?.symbol);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-0.5 rounded-[14px] border border-line px-3.5 py-3">
          <span className="text-xs text-muted-ink">Virtual cash</span>
          <b data-testid="cash" className="text-lg">{formatINR(cash, 2)}</b>
        </div>
        <div className="flex flex-col gap-0.5 rounded-[14px] border border-line px-3.5 py-3">
          <span className="text-xs text-muted-ink">Holdings</span>
          <b className="text-lg">{formatINR(value, 2)}</b>
          {hs.length > 0 && <span className={`text-xs font-semibold ${pnl >= 0 ? "text-groww" : "text-loss"}`}>{pnl >= 0 ? "+" : "-"}{formatINR(Math.abs(pnl), 2)}</span>}
        </div>
      </div>

      {reflect && <ReflectionPrompt prompt="Why did you pick this?" onDone={() => setReflect(false)} />}

      {hs.length > 0 && (
        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Your practice holdings</h2>
          {hs.map((h) => (
            <button key={h.symbol} data-testid={`holding-${h.symbol}`} onClick={() => setSelected(getInstrument(h.symbol) ?? null)}
              className="flex min-h-14 items-center justify-between border-b border-[#F1F2F4] text-left">
              <span className="flex flex-col"><b className="text-[15px]">{getInstrument(h.symbol)?.name}</b><span className="text-xs text-muted-ink">{h.qty} @ {formatINR(h.avgPrice, 2)}</span></span>
              <span className="flex flex-col text-right"><b className="text-[15px]">{formatINR(h.value, 2)}</b><span className={`text-xs ${h.pnl >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(h.pnlPct)}</span></span>
            </button>
          ))}
        </section>
      )}

      <section className="flex flex-col">
        <h2 className="mb-1 text-[15px] font-bold">Pick something to practise with</h2>
        {isLoading && <p className="py-3 text-sm text-muted-ink">Loading prices…</p>}
        {UNIVERSE.map((i) => {
          const q = quotes?.find((x) => x.symbol === i.symbol);
          return (
            <button key={i.symbol} data-testid={`instrument-${i.symbol}`} disabled={!q} onClick={() => setSelected(i)}
              className="flex min-h-14 items-center justify-between border-b border-[#F1F2F4] text-left disabled:opacity-50">
              <span className="flex flex-col"><b className="text-[15px]">{i.name}</b><span className="text-xs text-muted-ink">{kindLabel(i)}</span></span>
              {q && (
                <span className="flex flex-col text-right">
                  <b className="text-[15px]">{formatINR(q.price, 2)}</b>
                  <span className={`text-xs ${q.changePct >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(q.changePct)}</span>
                </span>
              )}
            </button>
          );
        })}
        <p className="mt-2 text-xs text-muted-ink">
          Last close / NAV{quotes?.[0] ? ` as of ${formatDate(quotes[0].date)}` : ""}{snapshot ? " (showing saved prices)" : ""}. Trades fill at these prices.
        </p>
      </section>

      <TradeSheet instrument={selected} price={selectedQuote?.price ?? 0} priceDate={selectedQuote?.date} open={!!selected}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        onTraded={(side) => { if (side === "buy" && txns.filter((t) => t.side === "buy").length === 0) setReflect(true); }} />
    </div>
  );
}
