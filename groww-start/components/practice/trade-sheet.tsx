"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/lib/store";
import { fundUnits, heldQty } from "@/lib/engine/portfolio";
import type { Instrument } from "@/lib/market/instruments";
import { formatDate, formatINR } from "@/lib/format";

export type TradeMode = "practice" | "real";

interface Props {
  instrument: Instrument | null;
  price: number;
  priceDate?: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onTraded: (side: "buy" | "sell") => void;
  /** practice = virtual ₹10,000; real = the demo balance (orders show in Holdings). */
  mode?: TradeMode;
  initialSide?: "buy" | "sell";
}

export function TradeSheet({ instrument, price, priceDate, open, onOpenChange, onTraded, mode = "practice", initialSide = "buy" }: Props) {
  const real = mode === "real";
  const act = useApp((s) => (real ? s.placeOrder : s.trade));
  const balance = useApp((s) => (real ? s.wallet : s.cash));
  const txns = useApp((s) => (real ? s.orders : s.transactions));
  // State resets per instrument because the parent keys this component
  const isFund = instrument?.kind === "fund";
  const held = instrument ? heldQty(txns, instrument.symbol) : 0;
  const [side, setSide] = useState<"buy" | "sell">(initialSide === "sell" && held > 0 ? "sell" : "buy");
  const [input, setInput] = useState(isFund ? (side === "sell" ? String(held) : "500") : "1");
  const [error, setError] = useState<string | null>(null);

  const qty = isFund && side === "buy" ? fundUnits(Number(input), price) : Number(input);
  const value = Number.isFinite(qty) ? qty * price : 0;
  const label = isFund ? (side === "buy" ? "Amount (₹)" : "Units") : "Shares";
  const after = side === "buy" ? balance - value : balance + value;
  const balanceLabel = real ? "Demo balance" : "Virtual cash";

  const pickSide = (s: "buy" | "sell") => {
    setSide(s);
    setInput(isFund && s === "buy" ? "500" : isFund ? String(held) : "1");
    setError(null);
  };
  const step = (d: number) => setInput(String(Math.max(0, (Number(input) || 0) + d)));

  const submit = () => {
    if (!instrument) return;
    const r = act({ symbol: instrument.symbol, side, qty, price }, isFund);
    if (!r.ok) { setError(r.error); return; }
    onOpenChange(false);
    onTraded(side);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" data-testid={`trade-sheet-${mode}`} className="mx-auto max-w-[430px] gap-3.5 rounded-t-3xl px-[22px] pb-[26px] pt-5">
        {instrument && (
          <>
            <span className={`self-start rounded-full px-2.5 py-1 text-xs font-bold ${real ? "bg-mint text-groww" : "bg-warn text-warn-ink"}`}>
              {real ? "Demo balance · no real money" : "Practice · virtual money"}
            </span>
            <div className="flex flex-col gap-0.5">
              <SheetTitle className="text-xl font-bold text-ink">{real ? "" : "Practice "}{side === "buy" ? (real ? "Buy" : "buy") : real ? "Sell" : "sell"} · {instrument.short}</SheetTitle>
              <SheetDescription className="text-sm text-muted-ink">
                Fills at {isFund ? "NAV" : "last close"} {formatINR(price, 2)}{priceDate ? ` · ${formatDate(priceDate)}` : ""}
              </SheetDescription>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} type="button" aria-pressed={side === s} onClick={() => pickSide(s)} disabled={s === "sell" && held <= 0}
                  className={`h-11 rounded-xl text-[15px] capitalize disabled:text-faint ${side === s ? (s === "buy" ? "border-2 border-groww bg-mint font-bold text-groww" : "border-2 border-loss bg-loss-soft font-bold text-loss") : "border-[1.5px] border-line font-semibold"}`}>{s}</button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-ink">{label}
              <div className="flex items-center gap-2">
                {!isFund && <button type="button" aria-label="Fewer shares" onClick={() => step(-1)} className="flex size-12 items-center justify-center rounded-xl border border-line text-ink"><Minus className="size-5" aria-hidden /></button>}
                <input inputMode="decimal" aria-label={label} value={input} onChange={(e) => { setInput(e.target.value.replace(/[^\d.]/g, "")); setError(null); }}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-line text-center text-lg font-bold text-ink" />
                {!isFund && <button type="button" aria-label="More shares" onClick={() => step(1)} className="flex size-12 items-center justify-center rounded-xl border border-line text-ink"><Plus className="size-5" aria-hidden /></button>}
              </div>
            </label>
            <div className="flex justify-between text-sm text-ink-2"><span>{isFund && side === "buy" ? `≈ ${qty} units` : "Order value"}</span><b>{formatINR(value, 2)}</b></div>
            <div className="flex justify-between text-sm text-ink-2"><span>{balanceLabel} after</span><b>{formatINR(Math.max(0, after), 2)}</b></div>
            {held > 0 && <p className="text-xs text-muted-ink">You hold {held} {isFund ? "units" : held === 1 ? "share" : "shares"}</p>}
            {error && <p role="alert" className="text-sm font-semibold text-loss">{error}</p>}
            <button type="button" onClick={submit}
              className={`flex h-[52px] items-center justify-center rounded-[14px] text-base font-bold ${real ? (side === "sell" ? "bg-loss-surface text-white" : "bg-brand-surface text-white") : "bg-inverse text-on-inverse"}`}>
              Confirm {real ? "" : "practice "}{side}
            </button>
            <span className="text-center text-xs text-muted-ink">
              {real ? "Demo money only · no real order is placed. See it in Holdings." : "Nothing real is bought or sold. Track it in the Practice tab."}
            </span>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
