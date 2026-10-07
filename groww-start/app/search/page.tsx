"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { InstrumentRow } from "@/components/instrument-row";
import { useQuotes } from "@/lib/market/client";
import { INSTRUMENTS } from "@/lib/market/instruments";

const SEARCHABLE = INSTRUMENTS.filter((i) => i.kind !== "index");
const sub = (kind: string) => (kind === "fund" ? "Mutual fund" : kind === "etf" ? "Gold ETF" : "Stock");

export default function SearchPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? SEARCHABLE.filter((i) => `${i.name} ${i.short} ${i.category ?? ""}`.toLowerCase().includes(t)) : SEARCHABLE;
  }, [q]);
  const { data: quotes } = useQuotes(SEARCHABLE.map((i) => i.symbol));
  return (
    <>
      <PageHeader title="Search" back="/" />
      <div className="flex flex-col px-5 py-3">
        <label className="mb-2 flex h-12 items-center gap-2.5 rounded-xl border border-line px-3.5 text-muted-ink">
          <Search className="size-[18px]" aria-hidden />
          <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stocks and mutual funds"
            aria-label="Search stocks and mutual funds" className="flex-1 bg-transparent text-[15px] text-ink outline-none" />
        </label>
        {results.length === 0 && <p className="py-4 text-sm text-muted-ink">No matches for &ldquo;{q}&rdquo;. This demo covers 12 large caps, a gold ETF and 6 funds.</p>}
        {results.map((i, idx) => (
          <InstrumentRow key={i.symbol} i={i} index={idx} q={quotes?.find((x) => x.symbol === i.symbol)} sub={sub(i.kind)} />
        ))}
      </div>
    </>
  );
}
