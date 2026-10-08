# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: desktop.spec.ts >> desktop: sidebar nav, no tab bar, order panel beside the chart, no overflow
- Location: e2e\desktop.spec.ts:6:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('navigation', { name: 'Sidebar' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('navigation', { name: 'Sidebar' }) with timeout 5000ms
  - waiting for getByRole('navigation', { name: 'Sidebar' })

```

```yaml
- banner:
  - button "GROW Beta": GROW Beta · Demo
  - 'button "Theme: system"'
  - link "Search":
    - /url: /search
- text: Explore
- link "Holdings":
  - /url: /holdings
- text: NIFTY 50 22,603.05 -0.8% GOLDBEES ₹121.08 -0.4%
- link "New here? Try anything with ₹10,000 virtual money Beginner hints are on · Practice tab":
  - /url: /practice
- heading "Popular large caps" [level=2]
- link "RI Reliance Industries ₹1,207.70 -0.8%":
  - /url: /stocks/RELIANCE.NS
- link "TC TCS ₹2,080.30 -0.9%":
  - /url: /stocks/TCS.NS
- link "HB HDFC Bank ₹702.75 -1.2%":
  - /url: /stocks/HDFCBANK.NS
- link "I ITC ₹265.70 -0.4%":
  - /url: /stocks/ITC.NS
- heading "Mutual fund collections" [level=2]
- link "Start with ₹100":
  - /url: /funds/MF120716
- link "Index funds":
  - /url: /funds
- link "Tax saver":
  - /url: /funds
- link "Gold":
  - /url: /funds
- paragraph: GROW Beta is a concept demo inspired by Groww · not affiliated with Groww · demo money only. Prices are real past data (stocks to 7 Oct 2026, fund NAVs to 6 Oct 2026) · not investment advice.
- navigation "Primary":
  - link "Home":
    - /url: /
  - link "Stocks":
    - /url: /stocks
  - link "Mutual Funds":
    - /url: /funds
  - link "NEW Practice":
    - /url: /practice
  - link "Holdings":
    - /url: /holdings
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { ROUTES } from "./routes";
  3  | 
  4  | test.use({ viewport: { width: 1280, height: 800 } });
  5  | 
  6  | test("desktop: sidebar nav, no tab bar, order panel beside the chart, no overflow", async ({ page }) => {
  7  |   test.setTimeout(180_000);
  8  |   await page.addInitScript(() => localStorage.setItem("groww-genz", JSON.stringify({ version: 3, state: { welcomeSeen: true } })));
  9  |   await page.goto("/");
> 10 |   await expect(page.getByRole("navigation", { name: "Sidebar" })).toBeVisible();
     |                                                                   ^ Error: expect(locator).toBeVisible() failed
  11 |   await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  12 |   await page.goto("/stocks/RELIANCE.NS");
  13 |   await expect(page.getByTestId("price")).toBeVisible({ timeout: 20_000 });
  14 |   const price = await page.getByTestId("price").boundingBox();
  15 |   const panel = await page.getByTestId("order-panel").boundingBox();
  16 |   expect(panel!.x).toBeGreaterThan(price!.x + 300);
  17 |   for (const r of ROUTES) {
  18 |     await page.goto(r, { waitUntil: "networkidle" });
  19 |     const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  20 |     expect(o, r).toBe(0);
  21 |   }
  22 | });
  23 | 
```