import { PageHeader } from "@/components/page-header";
import { TimeMachine } from "@/components/practice/time-machine";
import { getInstrument } from "@/lib/market/instruments";

export default async function TimeMachinePage({ searchParams }: { searchParams: Promise<{ symbol?: string | string[] }> }) {
  const raw = (await searchParams).symbol;
  const symbol = typeof raw === "string" && getInstrument(raw) ? raw : "MF120716";
  return (
    <>
      <PageHeader title="Time Machine" back="/practice"
        right={<span className="rounded-full bg-[#FFF4E0] px-2.5 py-[5px] text-xs font-semibold text-[#8A4B00]">Past data</span>} />
      <div className="px-5 py-3.5"><TimeMachine initialSymbol={symbol} /></div>
    </>
  );
}
