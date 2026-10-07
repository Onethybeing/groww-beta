import { safeDecode } from "@/lib/safe-decode";
import { notFound } from "next/navigation";
import { StockDetail } from "@/components/detail/stock-detail";
import { getInstrument } from "@/lib/market/instruments";

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const instrument = getInstrument(safeDecode(symbol));
  if (!instrument || instrument.kind === "fund" || instrument.kind === "index") notFound();
  return <StockDetail instrument={instrument} />;
}
