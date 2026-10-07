export function formatINR(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPct(n: number): string {
  const s = Math.abs(n).toFixed(1);
  if (n > 0) return `+${s}%`;
  if (n < 0) return `-${s}%`;
  return `${s}%`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${iso}T00:00:00Z`));
}
