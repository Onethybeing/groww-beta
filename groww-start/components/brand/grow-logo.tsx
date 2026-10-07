/** The wave stroke of the GROW mark (shared by the header, favicon and share card). */
export const GROW_WAVE_PATH = "M5 20.5c3.2 0 4.6-5.5 8-5.5s4 3.5 7 3.5 4.4-6 7-8";

/** GROW Beta mark: a green disc with a rising wave. A recreated look-alike, not the official Groww logo. */
export function GrowMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#0B7A55" />
      <path d={GROW_WAVE_PATH} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="10.5" r="2.2" fill="#7BE0BC" />
    </svg>
  );
}

export function GrowLogo({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <GrowMark size={size} />
      <span className="text-[21px] font-extrabold tracking-[0.04em] text-ink">GROW</span>
      <span className="rounded-full bg-mint px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.06em] text-groww">Beta · Demo</span>
    </span>
  );
}
