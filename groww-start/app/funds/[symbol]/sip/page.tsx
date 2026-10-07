import { notFound } from "next/navigation";
import { SipOrder } from "@/components/detail/sip-order";
import { getInstrument } from "@/lib/market/instruments";

export default async function SipPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const instrument = getInstrument(decodeURIComponent(symbol));
  if (!instrument || instrument.kind !== "fund") notFound();
  return <SipOrder instrument={instrument} />;
}
