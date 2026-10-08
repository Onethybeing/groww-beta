export function GoalRing({ pct, size = 84 }: { pct: number; size?: number }) {
  const stroke = 9;
  const r = (size - stroke - 5) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const label = clamped > 0 && clamped < 1 ? "<1%" : `${Math.round(clamped)}%`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} of goal`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-chip" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-groww" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - clamped / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="16" fontWeight="700" className="fill-ink">{label}</text>
    </svg>
  );
}
