"use client";
import { InstrumentRow } from "@/components/instrument-row";
import { useQuotes } from "@/lib/market/client";
import { INSTRUMENTS } from "@/lib/market/instruments";

const LIST = INSTRUMENTS.filter((i) => i.kind === "fund");
const CATEGORY: Record<string, string> = { index: "Index fund", flexi: "Flexi cap", largecap: "Large cap", elss: "Tax saver (ELSS)", gold: "Gold", liquid: "Liquid" };

export default function FundsPage() {
  const { data: quotes } = useQuotes(LIST.map((i) => i.symbol));
  return (
    <div className="flex flex-col px-5 py-4">
      <h1 className="text-[22px] font-bold">Mutual Funds</h1>
      <p className="mb-2 text-sm text-muted-ink">Direct · Growth · latest NAV</p>
      {LIST.map((i, idx) => (
        <InstrumentRow key={i.symbol} i={i} index={idx} q={quotes?.find((q) => q.symbol === i.symbol)} sub={CATEGORY[i.category ?? ""] ?? "Fund"} />
      ))}
    </div>
  );
}
