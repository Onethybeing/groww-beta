import { safeDecode } from "@/lib/safe-decode";
import { notFound } from "next/navigation";
import { FundDetail } from "@/components/detail/fund-detail";
import { getInstrument } from "@/lib/market/instruments";

export default async function FundPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const instrument = getInstrument(safeDecode(symbol));
  if (!instrument || instrument.kind !== "fund") notFound();
  return <FundDetail instrument={instrument} />;
}
