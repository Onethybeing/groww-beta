# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> axe: no serious/critical violations (light)
- Location: e2e\a11y.spec.ts:6:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "/refer: color-contrast — .text-white\\/85",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f14e1]:
  - generic [ref=f14e4]:
    - banner [ref=f14e5]:
      - link "Back" [ref=f14e6] [cursor=pointer]:
        - /url: /holdings
      - heading "Share your milestone" [level=1] [ref=f14e9]
    - main [ref=f14e10]:
      - 'img "Story card: First investment" [ref=f14e11]'
      - paragraph [ref=f14e12]: Your card shows habits only, never amounts or returns.
    - contentinfo [ref=f14e13]:
      - generic [ref=f14e15]:
        - button "Share" [ref=f14e16]
        - button "Download" [ref=f14e20]
      - link "Invite friends · you both get a streak freeze" [ref=f14e24] [cursor=pointer]:
        - /url: /refer
  - alert [ref=f14e25]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | import { ROUTES } from "./routes";
  4  | 
  5  | for (const theme of ["light", "dark"] as const) {
  6  |   test(`axe: no serious/critical violations (${theme})`, async ({ page }) => {
  7  |     test.setTimeout(180_000);
  8  |     await page.addInitScript((t) => {
  9  |       localStorage.setItem("grow-ui", JSON.stringify({ version: 1, state: { theme: t, lang: "en", anonId: "axe-anon-id" } }));
  10 |       localStorage.setItem("groww-genz", JSON.stringify({ version: 3, state: { welcomeSeen: true } }));
  11 |     }, theme);
  12 |     const failures: string[] = [];
  13 |     for (const r of ROUTES) {
  14 |       await page.goto(r, { waitUntil: "networkidle" });
  15 |       const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  16 |       for (const v of res.violations.filter((x) => x.impact === "serious" || x.impact === "critical"))
  17 |         failures.push(`${r}: ${v.id} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  18 |     }
> 19 |     expect(failures).toEqual([]);
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
  20 |   });
  21 | }
  22 | 
```