"use client";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/lib/store";
import { fundUnits, heldQty } from "@/lib/engine/portfolio";
import type { Instrument } from "@/lib/market/instruments";
import { formatDate, formatINR } from "@/lib/format";

interface Props {
  instrument: Instrument | null;
  price: number;
  priceDate?: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onTraded: (side: "buy" | "sell") => void;
}

export function TradeSheet({ instrument, price, priceDate, open, onOpenChange, onTraded }: Props) {
  const trade = useApp((s) => s.trade);
  const cash = useApp((s) => s.cash);
  const txns = useApp((s) => s.transactions);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [input, setInput] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const isFund = instrument?.kind === "fund";

  useEffect(() => {
    setSide("buy");
    setInput(isFund ? "500" : "1");
    setError(null);
  }, [instrument, isFund]);

  const held = instrument ? heldQty(txns, instrument.symbol) : 0;
  const qty = isFund && side === "buy" ? fundUnits(Number(input), price) : Number(input);
  const value = Number.isFinite(qty) ? qty * price : 0;
  const label = isFund ? (side === "buy" ? "Amount (₹)" : "Units") : "Shares";
  const cashAfter = side === "buy" ? cash - value : cash + value;

  const pickSide = (s: "buy" | "sell") => {
    setSide(s);
    setInput(isFund && s === "buy" ? "500" : isFund ? String(held) : "1");
    setError(null);
  };
  const step = (d: number) => setInput(String(Math.max(0, (Number(input) || 0) + d)));

  const submit = () => {
    if (!instrument) return;
    const r = trade({ symbol: instrument.symbol, side, qty, price }, isFund);
    if (!r.ok) { setError(r.error); return; }
    onOpenChange(false);
    onTraded(side);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-[430px] gap-3.5 rounded-t-3xl px-[22px] pb-[26px] pt-5">
        {instrument && (
          <>
            <div className="flex flex-col gap-0.5">
              <SheetTitle className="text-xl font-bold text-ink">{instrument.name}</SheetTitle>
              <SheetDescription className="text-sm text-muted-ink">
                {isFund ? "NAV" : "Last close"} {formatINR(price, 2)}{priceDate ? ` · ${formatDate(priceDate)}` : ""} · virtual money
              </SheetDescription>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} type="button" aria-pressed={side === s} onClick={() => pickSide(s)} disabled={s === "sell" && held <= 0}
                  className={`h-11 rounded-xl text-[15px] capitalize disabled:text-[#A3A6B2] ${side === s ? (s === "buy" ? "border-2 border-groww bg-mint font-bold text-groww" : "border-2 border-loss bg-[#FDECEA] font-bold text-loss") : "border-[1.5px] border-line font-semibold"}`}>{s}</button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-ink">{label}
              <div className="flex items-center gap-2">
                {!isFund && <button type="button" aria-label="Fewer shares" onClick={() => step(-1)} className="flex size-12 items-center justify-center rounded-xl border border-line text-ink"><Minus className="size-5" aria-hidden /></button>}
                <input inputMode="decimal" value={input} onChange={(e) => { setInput(e.target.value.replace(/[^\d.]/g, "")); setError(null); }}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-line text-center text-lg font-bold text-ink" />
                {!isFund && <button type="button" aria-label="More shares" onClick={() => step(1)} className="flex size-12 items-center justify-center rounded-xl border border-line text-ink"><Plus className="size-5" aria-hidden /></button>}
              </div>
            </label>
            <div className="flex justify-between text-sm text-[#3D4050]"><span>{isFund && side === "buy" ? `≈ ${qty} units` : "Order value"}</span><b>{formatINR(value, 2)}</b></div>
            <div className="flex justify-between text-sm text-[#3D4050]"><span>Virtual cash after</span><b>{formatINR(Math.max(0, cashAfter), 2)}</b></div>
            {held > 0 && <p className="text-xs text-muted-ink">You hold {held} {isFund ? "units" : held === 1 ? "share" : "shares"}</p>}
            {error && <p role="alert" className="text-sm font-semibold text-loss">{error}</p>}
            <button type="button" onClick={submit}
              className={`flex h-[52px] items-center justify-center rounded-[14px] text-base font-bold text-white ${side === "sell" ? "bg-loss" : "bg-groww"}`}>Confirm {side}</button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
