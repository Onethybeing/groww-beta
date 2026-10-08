"use client";
import Link from "next/link";
import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { TradeSheet, type TradeMode } from "@/components/practice/trade-sheet";
import { ReflectionPrompt } from "@/components/reflection-prompt";
import { useApp } from "@/lib/store";
import type { Instrument } from "@/lib/market/instruments";

/** A trade sheet (practice or real-demo) plus the confirmation shown on a detail page after a trade. */
export function useTrade(instrument: Instrument, price: number, priceDate: string | undefined, mode: TradeMode) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [done, setDone] = useState<"buy" | "sell" | null>(null);
  const [reflect, setReflect] = useState(false);
  const practiceBuys = useApp((s) => s.transactions.filter((t) => t.side === "buy").length);
  const real = mode === "real";

  const sheet = (
    <TradeSheet key={`${mode}-${open}-${side}`} instrument={instrument} price={price} priceDate={priceDate} open={open} mode={mode} initialSide={side}
      onOpenChange={setOpen}
      onTraded={(s) => { setDone(s); if (!real && s === "buy" && practiceBuys === 0) setReflect(true); }} />
  );
  const notice = (
    <>
      {done && (
        <Link href={real ? "/holdings" : "/practice"} data-testid={real ? "order-done" : "practice-done"}
          className="flex items-center gap-2.5 rounded-[14px] bg-inverse px-3.5 py-3 text-sm text-on-inverse">
          <CircleCheck className="size-5 text-accent-soft" aria-hidden />
          <span className="flex-1">{real ? `${done === "buy" ? "Bought" : "Sold"} with demo balance` : "Added to your Practice portfolio"}</span>
          <b className="text-accent-soft">View</b>
        </Link>
      )}
      {reflect && <ReflectionPrompt prompt="Why did you pick this?" onDone={() => setReflect(false)} />}
    </>
  );
  return { openSheet: (s: "buy" | "sell" = "buy") => { setSide(s); setOpen(true); }, sheet, notice };
}
