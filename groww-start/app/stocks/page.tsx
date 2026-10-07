"use client";
import { InstrumentRow } from "@/components/instrument-row";
import { useQuotes } from "@/lib/market/client";
import { INSTRUMENTS } from "@/lib/market/instruments";

const LIST = INSTRUMENTS.filter((i) => i.kind === "stock" || i.kind === "etf");

export default function StocksPage() {
  const { data: quotes } = useQuotes(LIST.map((i) => i.symbol));
  return (
    <div className="flex flex-col px-5 py-4">
      <h1 className="text-[22px] font-bold">Stocks</h1>
      <p className="mb-2 text-sm text-muted-ink">Large caps on NSE · last close</p>
      {LIST.map((i, idx) => (
        <InstrumentRow key={i.symbol} i={i} index={idx} q={quotes?.find((q) => q.symbol === i.symbol)} sub={i.kind === "etf" ? "Gold ETF" : `NSE: ${i.short}`} />
      ))}
    </div>
  );
}
