"use client";

/**
 * Hex colour plus alpha → rgba() (charts need concrete colours, not CSS variables).
 * Theme tokens used by charts must stay 3/6-digit hex; anything else is returned unchanged.
 */
export function withAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "").trim();
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) return hex;
  const n = Number.parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Reads the current theme tokens from :root so charts follow light/dark mode. */
export function chartColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return { brand: v("--brand", "#0b7a55"), loss: v("--loss", "#c0392b"), text: v("--muted-ink", "#5b5e6e"), grid: v("--line-soft", "#f1f2f4"), faint: v("--faint", "#8a8d9b") };
}
