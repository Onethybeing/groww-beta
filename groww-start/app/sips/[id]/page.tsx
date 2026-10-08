"use client";
import { SavedData } from "@/components/saved-data";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useApp, useToday } from "@/lib/store";
import { getInstrument } from "@/lib/market/instruments";
import { forSip, nextSipDate } from "@/lib/engine/sips";
import { DayPicker } from "@/components/detail/day-picker";
import { MIN_SIP } from "@/lib/engine/instalments";
import { formatDate, formatINR, ordinal } from "@/lib/format";


function ManageSipPageBody() {
  const { id } = useParams<{ id: string }>();
  const today = useToday();
  const { sips, instalments, missed, updateSip } = useApp();
  const sip = sips.find((s) => s.id === id);
  const [amount, setAmount] = useState(String(sip?.amount ?? ""));
  const [day, setDay] = useState(sip?.day ?? 5);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!sip) {
    return (<><PageHeader title="SIP" back="/holdings" /><p className="p-6 text-sm text-muted-ink">This SIP doesn&apos;t exist. <Link href="/holdings" className="text-groww underline">Back to Holdings</Link></p></>);
  }
  const fund = getInstrument(sip.symbol);
  const history = [...forSip(instalments, sip.id).map((i) => ({ ...i, ok: true })), ...forSip(missed, sip.id).map((i) => ({ ...i, ok: false }))]
    .sort((a, b) => b.date.localeCompare(a.date));
  const run = (patch: Parameters<typeof updateSip>[1], text: string) => {
    const r = updateSip(sip.id, patch);
    setMsg(r.ok ? { ok: true, text } : { ok: false, text: r.error });
  };
  const statusTone = sip.status === "active" ? "bg-mint text-groww" : sip.status === "paused" ? "bg-warn text-warn-ink" : "bg-chip text-muted-ink";

  return (
    <>
      <PageHeader title="Manage SIP" back="/holdings" />
      <div className="flex flex-col gap-4 px-5 py-4">
        <section className="flex flex-col gap-1.5 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between gap-2">
            <b className="text-base">{fund?.name ?? sip.symbol}</b>
            <span data-testid="sip-status" className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusTone}`}>{sip.status}</span>
          </div>
          <span className="text-sm text-ink-2">{formatINR(sip.amount)} on the {ordinal(sip.day)} of every month · since {formatDate(sip.startDate)}</span>
          {sip.status === "active" && <span className="text-xs text-muted-ink">Next instalment: {formatDate(nextSipDate(sip, instalments, today))}</span>}
        </section>

        {sip.status !== "cancelled" && (
          <section className="flex flex-col gap-3 rounded-2xl border border-line p-4">
            <h2 className="text-[15px] font-bold">Modify</h2>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-ink">Monthly amount (₹)
              <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
                className="h-12 rounded-xl border border-line px-3 text-lg font-bold text-ink" />
            </label>
            <DayPicker value={day} onChange={setDay} />
            <button type="button" onClick={() => run({ amount: Number(amount), day }, "SIP updated")}
              className="h-12 rounded-[14px] bg-brand-surface text-[15px] font-bold text-white">Save changes</button>
            <span className="text-xs text-muted-ink">Minimum {formatINR(MIN_SIP)}. Changes apply from the next instalment.</span>
          </section>
        )}

        {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-groww" : "text-loss"}`}>{msg.text}</p>}

        {sip.status !== "cancelled" && (
          <div className="grid grid-cols-2 gap-2.5">
            {sip.status === "active" ? (
              <button type="button" onClick={() => run({ status: "paused" }, "SIP paused. Your streak freeze can cover a skipped month.")}
                className="h-12 rounded-[14px] border-[1.5px] border-line text-[15px] font-bold">Pause SIP</button>
            ) : (
              <button type="button" onClick={() => run({ status: "active" }, "SIP resumed")}
                className="h-12 rounded-[14px] border-[1.5px] border-groww text-[15px] font-bold text-groww">Resume SIP</button>
            )}
            {confirmCancel ? (
              <button type="button" onClick={() => { run({ status: "cancelled" }, "SIP cancelled. Units you already own stay in Holdings."); setConfirmCancel(false); }}
                className="h-12 rounded-[14px] bg-loss-surface text-[15px] font-bold text-white">Confirm cancel</button>
            ) : (
              <button type="button" onClick={() => setConfirmCancel(true)} className="h-12 rounded-[14px] border-[1.5px] border-loss text-[15px] font-bold text-loss">Cancel SIP</button>
            )}
          </div>
        )}

        <section className="flex flex-col">
          <h2 className="mb-1 text-[15px] font-bold">Instalments</h2>
          {history.length === 0 && <p className="text-sm text-muted-ink">None yet.</p>}
          {history.map((i) => (
            <div key={`${i.date}-${i.ok}`} className="flex min-h-12 items-center justify-between border-b border-line-soft text-sm">
              <span>{formatDate(i.date)}</span>
              <span className={i.ok ? "font-semibold" : "font-semibold text-loss"}>{i.ok ? formatINR(i.amount) : "Missed · low demo balance"}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default function ManageSipPage() {
  return <SavedData><ManageSipPageBody /></SavedData>;
}
