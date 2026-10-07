"use client";
import Link from "next/link";
import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { TradeSheet } from "@/components/practice/trade-sheet";
import { ReflectionPrompt } from "@/components/reflection-prompt";
import { useApp } from "@/lib/store";
import type { Instrument } from "@/lib/market/instruments";

/** Practice-trade sheet plus the confirmation and first-buy reflection shown on a detail page. */
export function usePracticeTrade(instrument: Instrument, price: number, priceDate?: string) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reflect, setReflect] = useState(false);
  const buysSoFar = useApp((s) => s.transactions.filter((t) => t.side === "buy").length);

  const sheet = (
    <TradeSheet key={open ? "open" : "closed"} instrument={instrument} price={price} priceDate={priceDate} open={open}
      onOpenChange={setOpen}
      onTraded={(side) => { setDone(true); if (side === "buy" && buysSoFar === 0) setReflect(true); }} />
  );
  const notice = (
    <>
      {done && (
        <Link href="/practice" data-testid="practice-done" className="flex items-center gap-2.5 rounded-[14px] bg-ink px-3.5 py-3 text-sm text-white">
          <CircleCheck className="size-5 text-[#7BE0BC]" aria-hidden />
          <span className="flex-1">Added to your Practice portfolio</span>
          <b className="text-[#7BE0BC]">View</b>
        </Link>
      )}
      {reflect && <ReflectionPrompt prompt="Why did you pick this?" onDone={() => setReflect(false)} />}
    </>
  );
  return { openSheet: () => setOpen(true), sheet, notice };
}
