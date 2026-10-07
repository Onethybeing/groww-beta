import { safeDecode } from "@/lib/safe-decode";
import { notFound } from "next/navigation";
import { SipOrder } from "@/components/detail/sip-order";
import { getInstrument } from "@/lib/market/instruments";

export default async function SipPage({ params, searchParams }: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { symbol } = await params;
  const mode = (await searchParams).mode === "lumpsum" ? "lumpsum" : "sip";
  const instrument = getInstrument(safeDecode(symbol));
  if (!instrument || instrument.kind !== "fund") notFound();
  return <SipOrder instrument={instrument} initialMode={mode} />;
}
