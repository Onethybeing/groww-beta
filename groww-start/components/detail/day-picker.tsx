import { SIP_DAYS } from "@/lib/engine/instalments";

/** Picks the monthly SIP date (shared by Start SIP and Manage SIP). */
export function DayPicker({ value, onChange }: { value: number; onChange: (d: number) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="SIP date">
      {SIP_DAYS.map((d) => (
        <button key={d} type="button" aria-pressed={value === d} onClick={() => onChange(d)}
          className={`h-9 rounded-lg text-sm ${value === d ? "border-[1.5px] border-groww bg-mint font-bold text-groww" : "border border-line"}`}>{d}</button>
      ))}
    </div>
  );
}
