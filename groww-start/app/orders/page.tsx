"use client";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/lib/store";
import { getInstrument } from "@/lib/market/instruments";
import { formatDate, formatINR } from "@/lib/format";

type Row = { key: string; date: string; title: string; detail: string; amount: number; tone: "buy" | "sell" | "sip" | "missed" };

export default function OrdersPage() {
  const { orders, instalments, missed, sips } = useApp();
  const name = (symbol: string) => getInstrument(symbol)?.name ?? symbol;
  const sipName = (id: string) => name(sips.find((s) => s.id === id)?.symbol ?? "");
  const rows: Row[] = [
    ...orders.map((o) => ({
      key: o.id, date: o.date, title: name(o.symbol), amount: o.qty * o.price, tone: o.side,
      detail: `${o.side === "buy" ? "Bought" : "Sold"} ${o.qty} ${getInstrument(o.symbol)?.kind === "fund" ? "units" : o.qty === 1 ? "share" : "shares"} @ ${formatINR(o.price, 2)}`,
    }) as Row),
    ...instalments.map((i) => ({ key: `i-${i.sipId}-${i.date}`, date: i.date, title: sipName(i.sipId), detail: "SIP instalment", amount: i.amount, tone: "sip" }) as Row),
    ...missed.map((i) => ({ key: `m-${i.sipId}-${i.date}`, date: i.date, title: sipName(i.sipId), detail: "SIP missed · low demo balance", amount: i.amount, tone: "missed" }) as Row),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader title="Order history" back="/holdings" />
      <div className="flex flex-col px-5 py-3">
        <p className="mb-2 text-xs text-muted-ink">Demo orders only. Nothing here touched real money.</p>
        {rows.length === 0 && <p className="py-4 text-sm text-muted-ink">No orders yet.</p>}
        {rows.map((r) => (
          <div key={r.key} data-testid="order-row" className="flex min-h-16 items-center justify-between gap-3 border-b border-line-soft">
            <span className="flex flex-col gap-0.5">
              <b className="text-[15px]">{r.title}</b>
              <span className={`text-xs ${r.tone === "missed" ? "text-loss" : "text-muted-ink"}`}>{r.detail} · {formatDate(r.date)}</span>
            </span>
            <b className={`text-[15px] ${r.tone === "sell" ? "text-groww" : r.tone === "missed" ? "text-muted-ink line-through" : ""}`}>
              {r.tone === "sell" ? "+" : r.tone === "missed" ? "" : "−"}{formatINR(r.amount, 2)}
            </b>
          </div>
        ))}
      </div>
    </>
  );
}
