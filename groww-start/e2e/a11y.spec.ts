import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "./routes";

for (const theme of ["light", "dark"] as const) {
  test(`axe: no serious/critical violations (${theme})`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.addInitScript((t) => {
      localStorage.setItem("grow-ui", JSON.stringify({ version: 1, state: { theme: t, lang: "en", anonId: "axe-anon-id" } }));
      localStorage.setItem("groww-genz", JSON.stringify({ version: 3, state: {
        welcomeSeen: true,
        // One SIP so /sips/axe-sip renders its manage screen rather than "not found"
        sips: [{ id: "axe-sip", status: "active", category: "index", symbol: "MF120716", amount: 500, day: 5, startDate: "2026-09-05" }],
        instalments: [{ sipId: "axe-sip", date: "2026-09-05", amount: 500 }],
      } }));
    }, theme);
    const failures: string[] = [];
    for (const r of ROUTES) {
      await page.goto(r, { waitUntil: "networkidle" });
      const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      for (const v of res.violations.filter((x) => x.impact === "serious" || x.impact === "critical"))
        failures.push(`${r}: ${v.id} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
    }
    expect(failures).toEqual([]);
  });
}
