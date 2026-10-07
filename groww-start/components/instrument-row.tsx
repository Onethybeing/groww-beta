import Link from "next/link";
import type { Instrument } from "@/lib/market/instruments";
import type { Quote } from "@/lib/types";
import { formatINR, formatPct } from "@/lib/format";

const TINTS = ["bg-[#EAF1FD] text-[#2457C5]", "bg-[#F3EEFD] text-[#6B3FC9]", "bg-[#FFF4E0] text-[#8A4B00]", "bg-mint text-groww"];

export const instrumentHref = (i: Instrument) => (i.kind === "fund" ? `/funds/${i.symbol}` : `/stocks/${encodeURIComponent(i.symbol)}`);

export function Monogram({ i, index = 0, size = "size-8" }: { i: Instrument; index?: number; size?: string }) {
  const letters = i.name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <span className={`flex ${size} flex-none items-center justify-center rounded-lg text-xs font-bold ${TINTS[index % TINTS.length]}`}>{letters}</span>;
}

export function InstrumentRow({ i, q, index, sub }: { i: Instrument; q?: Quote; index: number; sub: string }) {
  return (
    <Link href={instrumentHref(i)} data-testid={`row-${i.symbol}`} className="flex min-h-16 items-center gap-3 border-b border-[#F1F2F4]">
      <Monogram i={i} index={index} />
      <span className="flex flex-1 flex-col"><b className="text-[15px]">{i.name}</b><span className="text-xs text-muted-ink">{sub}</span></span>
      {q ? (
        <span className="flex flex-col text-right">
          <b className="text-[15px]">{formatINR(q.price, 2)}</b>
          <span className={`text-xs ${q.changePct >= 0 ? "text-groww" : "text-loss"}`}>{formatPct(q.changePct)}</span>
        </span>
      ) : <span className="h-9 w-16 animate-pulse rounded bg-surface" />}
    </Link>
  );
}
