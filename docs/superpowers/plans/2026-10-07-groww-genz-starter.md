# Groww "Start Here" Gen Z Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Next.js demo that runs the LEARN → PRACTICE → INVEST → BUILD → SHARE journey for Indian
first-time investors inside a Groww-like shell, using real (delayed or historical) market data.

**Architecture:**
- Next.js 16 App Router app in `groww-start/`.
- All money, streak and milestone logic lives in pure, unit-tested functions in `lib/engine`.
- User progress is a single persisted Zustand store in the browser.
- Market data comes from server route handlers (`/api/history`, `/api/quote`). They call Yahoo Finance and mfapi.in
  and fall back to a committed JSON snapshot.
- Share cards are PNGs rendered by `next/og` from URL query params.

**Tech Stack:** Next.js 16.3.x, React 19, TypeScript, Tailwind v4, shadcn/ui, Zustand 5, TanStack Query 5, Zod,
Motion, lightweight-charts 5, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-07-groww-genz-starter-design.md`

## Global Constraints

- **Visual source of truth:** the design canvas https://claude.ai/artifact/UPYpc2fEhadZcqxT3ebh2c (13 boards). It overrides
  the plan's sample class names wherever they differ:
  - Font: DM Sans (not Inter).
  - Colours: CTA/brand `#0B7A55` (hover `#075C40`), mint wash `#E8F8F2`, ink `#1B1D29`, muted `#5B5E6E`,
    line `#E6E8EC`, surface `#F6F7F9`, loss `#C0392B`, streak `#F08A24`.
  - Shape: radii of 12/14/16/24, primary buttons 52px tall.
  - Icons: Lucide line icons via `lucide-react`. The UI uses **no emoji**, so the `emoji` fields in lessons and milestones
    map to Lucide icon names instead.
  - Navigation: a bottom tab bar (Home · Learn · Practice · Invest · Progress) on non-flow screens.

- The app lives in `groww-start/`. Run every `npm`/`npx` command from `groww-start/` unless a step says otherwise.
  The git repo root is the parent folder `nikhil_groww_task/`.
- Next.js `16.3.x` or newer, because of the Aug 2026 security patch.
- Mobile-first: 390px design width. On desktop the app sits in a centred frame with `max-width: 430px`.
- Mock investing never uses real-time prices. Trades fill at the **last close or NAV**, and Practice always shows the
  label `Virtual money · Prices delayed · Not a prediction`.
- Reward consistency and learning only. No confetti on trades, no leaderboards, no "act now" copy, and no
  loss-aversion copy.
- Fund suggestions are **category education**, identical for identical answers, and always shown with
  `Past performance doesn't guarantee future returns.`
- Share cards and share URLs never contain ₹ amounts or returns.
- Use a text wordmark "Groww" only (no logo files), with a visible `Concept demo` pill.
- Dates are `YYYY-MM-DD` strings in IST. "Today" always comes from `todayFor(clockOffsetDays)`, never `new Date()`, in UI or store code.
- Curated universe:
  - Stocks: RELIANCE, TCS, HDFCBANK, INFY, ITC, MARUTI, ICICIBANK, SBIN, BHARTIARTL, HINDUNILVR, ASIANPAINT, TITAN (all `.NS`)
  - Index and gold ETF: `^NSEI`, `GOLDBEES.NS`
  - Funds (mfapi codes): 120716, 122639, 118825, 120503, 119132, 143269
- Starting virtual cash: ₹10,000. SIP amounts: ₹100 / ₹250 / ₹500.

## Review Focus

1. **Yahoo returns 200 OK but the payload is useless** (empty `result`, all-null closes, or HTML from throttling).
   Expected: the user silently gets snapshot data with a "showing saved prices" note. Pinned in Task 7.
2. **Saved browser state is from an older schema version or is corrupted.** Expected: the app resets to a clean
   state instead of crashing. Pinned in Task 9.
3. **The Time Machine start date is before the instrument's first data point.** Expected: the replay starts at the
   first available price, not an empty chart. Pinned in Task 3.
4. **Selling all of a fractional fund holding** (e.g. 3.333 units) leaves floating-point dust. Expected: the holding
   disappears and the sale is allowed. Pinned in Task 4.
5. **Double-tapping "Confirm" on the SIP, or resetting after demo time travel.** Expected: no duplicate plan or
   instalments, and reset returns the clock to real today. Pinned in Task 9.

---

## File Map

```
groww-start/
  app/layout.tsx                 fonts, providers, AppChrome
  app/providers.tsx              TanStack QueryClientProvider
  app/globals.css                Tailwind v4 + Groww tokens
  app/page.tsx                   Groww-like home with "Start here" card
  app/journey/page.tsx           5-step path hub
  app/start/page.tsx             onboarding → goal → persona
  app/learn/page.tsx             lesson list
  app/learn/[lessonId]/page.tsx  lesson player (server wrapper)
  app/practice/page.tsx          Time Machine + Mock portfolio tabs
  app/invest/page.tsx            Start Small SIP flow
  app/progress/page.tsx          streak, goal ring, milestones, reflections
  app/share/[key]/page.tsx       share page + metadata
  app/api/history/route.ts       GET ?symbol=
  app/api/quote/route.ts         GET ?symbols=a,b
  app/api/card/route.tsx         PNG share card (next/og)
  components/app-chrome.tsx      top bar, demo panel, milestone toast
  components/demo-panel.tsx
  components/milestone-toast.tsx
  components/charts/price-chart.tsx
  components/charts/sip-chart.tsx
  components/goal-ring.tsx
  components/reflection-prompt.tsx
  components/learn/lesson-player.tsx
  components/learn/rich-text.tsx
  components/practice/time-machine.tsx
  components/practice/mock-portfolio.tsx
  components/practice/trade-sheet.tsx
  components/share/share-actions.tsx
  lib/types.ts  lib/format.ts  lib/journey.ts  lib/share.ts
  lib/engine/{num,dates,sip,portfolio,streak,instalments,persona,milestones}.ts (+ .test.ts)
  lib/market/{instruments,sources,history,server-deps,client}.ts (+ tests)
  lib/content/{schema,index}.ts (+ test)
  lib/store/{index,use-hydrated}.ts (+ test)
  content/lessons/*.json  content/glossary.json
  data/snapshot/*.json
  scripts/fetch-snapshot.ts
  e2e/happy-path.spec.ts
  vitest.config.ts  playwright.config.ts  next.config.ts  README.md
```

---

### Task 1: Scaffold, tooling, theme

**Files:**
- Create: `groww-start/` (via create-next-app), `groww-start/vitest.config.ts`, `groww-start/lib/format.ts`, `groww-start/lib/format.test.ts`
- Modify: `groww-start/app/globals.css`, `groww-start/next.config.ts`, `groww-start/app/layout.tsx`, `groww-start/package.json`

**Interfaces:**
- Produces: `formatINR(n: number, decimals?: number): string`, `formatPct(n: number): string`, `formatDate(iso: string): string`

- [ ] **Step 1: Init the repo and scaffold** (run from `nikhil_groww_task/`)

```bash
git init
npx create-next-app@16 groww-start --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --turbopack --yes
cd groww-start
npm i zustand @tanstack/react-query zod motion lightweight-charts
npm i -D vitest vite-tsconfig-paths @playwright/test tsx
npx shadcn@latest init -d
npx shadcn@latest add button sheet slider tabs input
npx playwright install chromium
npm pkg set scripts.test="vitest run" scripts.e2e="playwright test" scripts.snapshot="tsx scripts/fetch-snapshot.ts"
npm ls next
```
Expected: `next@16.3.x` or newer. If it is older, run `npm i next@latest`.

- [ ] **Step 2: Add the Vitest config** at `groww-start/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: "node", include: ["**/*.test.ts"], exclude: ["node_modules/**", "e2e/**", ".next/**"] },
});
```

- [ ] **Step 3: Write the failing test** at `groww-start/lib/format.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { formatINR, formatPct, formatDate } from "./format";

describe("format", () => {
  it("formats rupees with Indian grouping", () => {
    expect(formatINR(1234567.8)).toBe("₹12,34,568");
    expect(formatINR(99.5, 2)).toBe("₹99.50");
  });
  it("formats signed percentages", () => {
    expect(formatPct(12.345)).toBe("+12.3%");
    expect(formatPct(-4)).toBe("-4.0%");
    expect(formatPct(0)).toBe("0.0%");
  });
  it("formats dates", () => {
    expect(formatDate("2026-10-07")).toBe("7 Oct 2026");
  });
});
```

- [ ] **Step 4: Run it to check it fails**

Run: `npx vitest run lib/format.test.ts`
Expected: FAIL, `Cannot find module './format'`.

- [ ] **Step 5: Implement** `groww-start/lib/format.ts`

```ts
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
```

- [ ] **Step 6: Run the test to check it passes**

Run: `npx vitest run lib/format.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Theme, Next config and layout**

Append to the end of `groww-start/app/globals.css`. These rules override the shadcn defaults:

```css
:root {
  --primary: #00b386;
  --primary-foreground: #ffffff;
  --ring: #00b386;
}
@theme inline {
  --color-groww: #00d09c;
  --color-groww-dark: #00b386;
  --color-loss: #eb5b3c;
  --color-ink: #44475b;
  --color-muted-ink: #7c7e8c;
}
html { color-scheme: light; }
```

Replace `groww-start/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/**": ["./data/snapshot/**"] },
};

export default nextConfig;
```

Replace `groww-start/app/layout.tsx` (it gets `AppChrome` in Task 10):

```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Groww · Start here (concept)",
  description: "A concept demo: Learn → Practice → Invest → Build → Share for first-time investors.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#00d09c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${inter.variable} font-sans bg-neutral-100 text-ink antialiased`}>
        <div className="mx-auto min-h-dvh max-w-[430px] bg-white shadow-sm">{children}</div>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Check that it builds**

Run: `npm run build`
Expected: the build succeeds.

- [ ] **Step 9: Commit** (from `nikhil_groww_task/`)

```bash
git add -A
git commit -m "chore: scaffold Next.js app with tooling, theme and format helpers"
```

---

### Task 2: Shared types, number and date helpers

**Files:**
- Create: `groww-start/lib/types.ts`, `groww-start/lib/engine/num.ts`, `groww-start/lib/engine/dates.ts`, `groww-start/lib/engine/dates.test.ts`

**Interfaces:**
- Produces:
  - `PricePoint {date: string; close: number}`, `DataSource = "live" | "snapshot"`
  - `Quote {symbol; date; price; changePct; source}`, `HistoryResult {symbol; points: PricePoint[]; source}`
  - `FundCategory = "index"|"flexi"|"largecap"|"elss"|"gold"|"liquid"`
  - `round2(n)`, `round3(n)`
  - `toISTDate(d: Date): string`, `addDays(date, n)`, `monthKey(date)`, `prevMonthKey(key)`, `nextMonthKey(key)`,
    `daysInMonth(key)`, `dateInMonth(key, day)`, `addMonths(date, n)`, `daysBetween(a, b)`

- [ ] **Step 1: Create the types** at `groww-start/lib/types.ts`

```ts
export interface PricePoint { date: string; close: number }
export type DataSource = "live" | "snapshot";
export interface Quote { symbol: string; date: string; price: number; changePct: number; source: DataSource }
export interface HistoryResult { symbol: string; points: PricePoint[]; source: DataSource }
export type FundCategory = "index" | "flexi" | "largecap" | "elss" | "gold" | "liquid";
```

`groww-start/lib/engine/num.ts`:

```ts
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const round3 = (n: number) => Math.round(n * 1000) / 1000;
```

- [ ] **Step 2: Write the failing test** at `groww-start/lib/engine/dates.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { toISTDate, addDays, monthKey, prevMonthKey, nextMonthKey, daysInMonth, dateInMonth, addMonths, daysBetween } from "./dates";

describe("dates", () => {
  it("converts to IST calendar date", () => {
    expect(toISTDate(new Date("2026-10-06T19:00:00Z"))).toBe("2026-10-07");
    expect(toISTDate(new Date("2026-10-06T18:00:00Z"))).toBe("2026-10-06");
  });
  it("adds days across month ends", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("handles month keys across years", () => {
    expect(monthKey("2026-10-07")).toBe("2026-10");
    expect(prevMonthKey("2026-01")).toBe("2025-12");
    expect(nextMonthKey("2025-12")).toBe("2026-01");
  });
  it("clamps day to month length", () => {
    expect(daysInMonth("2024-02")).toBe(29);
    expect(dateInMonth("2026-02", 31)).toBe("2026-02-28");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-11-15", 2)).toBe("2027-01-15");
  });
  it("counts days between dates", () => {
    expect(daysBetween("2026-10-07", "2026-11-07")).toBe(31);
  });
});
```

- [ ] **Step 3: Run it to check it fails**

Run: `npx vitest run lib/engine/dates.test.ts`
Expected: FAIL, `Cannot find module './dates'`.

- [ ] **Step 4: Implement** `groww-start/lib/engine/dates.ts`

```ts
const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 86_400_000;

export function toISTDate(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const monthKey = (date: string) => date.slice(0, 7);

function parseKey(key: string): [number, number] {
  const [y, m] = key.split("-").map(Number);
  return [y, m];
}
const fmtKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

export function prevMonthKey(key: string): string {
  const [y, m] = parseKey(key);
  return m === 1 ? fmtKey(y - 1, 12) : fmtKey(y, m - 1);
}

export function nextMonthKey(key: string): string {
  const [y, m] = parseKey(key);
  return m === 12 ? fmtKey(y + 1, 1) : fmtKey(y, m + 1);
}

export function daysInMonth(key: string): number {
  const [y, m] = parseKey(key);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function dateInMonth(key: string, day: number): string {
  const d = Math.min(Math.max(1, day), daysInMonth(key));
  return `${key}-${String(d).padStart(2, "0")}`;
}

export function addMonths(date: string, n: number): string {
  let key = monthKey(date);
  for (let i = 0; i < n; i++) key = nextMonthKey(key);
  return dateInMonth(key, Number(date.slice(8, 10)));
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}
```

- [ ] **Step 5: Run the test to check it passes**

Run: `npx vitest run lib/engine/dates.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(engine): shared types and IST date helpers"
```

---

### Task 3: SIP replay (the Time Machine engine)

**Files:**
- Create: `groww-start/lib/engine/sip.ts`, `groww-start/lib/engine/sip.test.ts`

**Interfaces:**
- Consumes: `PricePoint`, `round2`, `monthKey`, `nextMonthKey`, `dateInMonth`
- Produces:
  - `SipPoint {date; invested; value}`
  - `SipReplayResult {series: SipPoint[]; invested; finalValue; returnPct; worstDipPct}`
  - `sipReplay(prices: PricePoint[], o: {monthlyAmount: number; startDate: string; endDate: string; sipDay: number}): SipReplayResult`

- [ ] **Step 1: Write the failing test** at `groww-start/lib/engine/sip.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { sipReplay } from "./sip";

const prices = [
  { date: "2024-01-01", close: 100 },
  { date: "2024-01-15", close: 80 },
  { date: "2024-02-02", close: 50 },  // 1 Feb is a holiday, so the SIP buys here
  { date: "2024-03-01", close: 100 },
  { date: "2024-03-10", close: 120 },
];

describe("sipReplay", () => {
  it("buys on the first trading day on/after the SIP day each month", () => {
    const r = sipReplay(prices, { monthlyAmount: 1000, startDate: "2024-01-01", endDate: "2024-03-10", sipDay: 1 });
    expect(r.series).toEqual([
      { date: "2024-01-01", invested: 1000, value: 1000 },
      { date: "2024-02-02", invested: 2000, value: 1500 },
      { date: "2024-03-01", invested: 3000, value: 4000 },
      { date: "2024-03-10", invested: 3000, value: 4800 },
    ]);
    expect(r.invested).toBe(3000);
    expect(r.finalValue).toBe(4800);
    expect(r.returnPct).toBe(60);
    expect(r.worstDipPct).toBe(-25);
  });

  it("returns zeros for an empty range", () => {
    const r = sipReplay(prices, { monthlyAmount: 1000, startDate: "2025-01-01", endDate: "2025-12-31", sipDay: 1 });
    expect(r).toEqual({ series: [], invested: 0, finalValue: 0, returnPct: 0, worstDipPct: 0 });
  });

  it("starts at the first available price when startDate precedes the data", () => {
    const r = sipReplay(prices, { monthlyAmount: 1000, startDate: "2020-01-01", endDate: "2024-03-10", sipDay: 1 });
    expect(r.series[0]).toEqual({ date: "2024-01-01", invested: 1000, value: 1000 });
    expect(r.invested).toBe(3000);
  });

  it("never reports a positive worst dip", () => {
    const up = [{ date: "2024-01-01", close: 10 }, { date: "2024-02-01", close: 20 }];
    const r = sipReplay(up, { monthlyAmount: 100, startDate: "2024-01-01", endDate: "2024-02-01", sipDay: 1 });
    expect(r.worstDipPct).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to check it fails**

Run: `npx vitest run lib/engine/sip.test.ts`
Expected: FAIL, `Cannot find module './sip'`.

- [ ] **Step 3: Implement** `groww-start/lib/engine/sip.ts`

```ts
import type { PricePoint } from "@/lib/types";
import { round2 } from "./num";
import { dateInMonth, monthKey, nextMonthKey } from "./dates";

export interface SipPoint { date: string; invested: number; value: number }
export interface SipReplayResult {
  series: SipPoint[]; invested: number; finalValue: number; returnPct: number; worstDipPct: number;
}
export interface SipReplayOptions { monthlyAmount: number; startDate: string; endDate: string; sipDay: number }

const EMPTY: SipReplayResult = { series: [], invested: 0, finalValue: 0, returnPct: 0, worstDipPct: 0 };

export function sipReplay(prices: PricePoint[], o: SipReplayOptions): SipReplayResult {
  const inRange = prices.filter((p) => p.date >= o.startDate && p.date <= o.endDate);
  if (inRange.length === 0 || o.monthlyAmount <= 0) return { ...EMPTY, series: [] };

  let units = 0;
  let invested = 0;
  const series: SipPoint[] = [];
  const endKey = monthKey(inRange[inRange.length - 1].date);
  let i = 0;

  for (let key = monthKey(inRange[0].date); key <= endKey; key = nextMonthKey(key)) {
    const target = dateInMonth(key, o.sipDay);
    while (i < inRange.length && inRange[i].date < target) i++;
    if (i >= inRange.length) break;
    const p = inRange[i];
    if (monthKey(p.date) !== key) continue; // no trading day left this month
    units += o.monthlyAmount / p.close;
    invested += o.monthlyAmount;
    series.push({ date: p.date, invested, value: round2(units * p.close) });
  }

  if (series.length === 0) return { ...EMPTY, series: [] };
  const last = inRange[inRange.length - 1];
  const finalValue = round2(units * last.close);
  if (series[series.length - 1].date !== last.date) series.push({ date: last.date, invested, value: finalValue });

  const worst = Math.min(0, ...series.map((s) => (s.value - s.invested) / s.invested));
  return {
    series,
    invested,
    finalValue,
    returnPct: round2(((finalValue - invested) / invested) * 100),
    worstDipPct: round2(worst * 100) || 0,
  };
}
```

- [ ] **Step 4: Run the test to check it passes**

Run: `npx vitest run lib/engine/sip.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(engine): SIP replay over historical prices"
```

---

### Task 4: Mock portfolio engine

**Files:**
- Create: `groww-start/lib/engine/portfolio.ts`, `groww-start/lib/engine/portfolio.test.ts`

**Interfaces:**
- Consumes: `round2`, `round3`
- Produces:
  - `Txn {id; symbol; side: "buy"|"sell"; qty; price; date}`, `PortfolioState {cash; transactions: Txn[]}`
  - `TradeResult = {ok: true; state} | {ok: false; error: string}`
  - `applyTrade(state, t: Txn, opts: {fractional: boolean}): TradeResult`
  - `heldQty(txns, symbol): number`
  - `Holding {symbol; qty; avgPrice; invested; value; pnl; pnlPct}`
  - `holdings(txns, prices: Record<string, number>): Holding[]`
  - `fundUnits(amount, nav): number` (rounded down to 3 decimals)

- [ ] **Step 1: Write the failing test** at `groww-start/lib/engine/portfolio.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { applyTrade, holdings, heldQty, fundUnits, type PortfolioState, type Txn } from "./portfolio";

const base: PortfolioState = { cash: 10000, transactions: [] };
const t = (p: Partial<Txn>): Txn => ({ id: "x", symbol: "TCS.NS", side: "buy", qty: 1, price: 100, date: "2026-10-07", ...p });

describe("applyTrade", () => {
  it("buys and debits cash", () => {
    const r = applyTrade(base, t({ qty: 2 }), { fractional: false });
    expect(r.ok && r.state.cash).toBe(9800);
  });
  it("rejects fractional stock quantities", () => {
    const r = applyTrade(base, t({ qty: 1.5 }), { fractional: false });
    expect(r).toEqual({ ok: false, error: "Stocks can only be bought in whole shares" });
  });
  it("rejects zero, negative and NaN quantities", () => {
    for (const qty of [0, -1, Number.NaN]) {
      expect(applyTrade(base, t({ qty }), { fractional: false }).ok).toBe(false);
    }
  });
  it("rejects buys beyond cash", () => {
    const r = applyTrade(base, t({ qty: 101 }), { fractional: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Not enough virtual cash/);
  });
  it("rejects selling more than held", () => {
    const r = applyTrade(base, t({ side: "sell", qty: 1 }), { fractional: false });
    expect(r).toEqual({ ok: false, error: "You can't sell more than you hold" });
  });
  it("allows selling an entire fractional holding without dust", () => {
    const units = fundUnits(100, 30); // 3.333
    let s = base;
    const b = applyTrade(s, t({ symbol: "MF120716", qty: units, price: 30 }), { fractional: true });
    if (!b.ok) throw new Error(b.error);
    s = b.state;
    const sell = applyTrade(s, t({ symbol: "MF120716", side: "sell", qty: heldQty(s.transactions, "MF120716"), price: 31 }), { fractional: true });
    expect(sell.ok).toBe(true);
    if (sell.ok) expect(holdings(sell.state.transactions, { MF120716: 31 })).toEqual([]);
  });
});

describe("holdings", () => {
  it("uses average cost and computes P&L", () => {
    const txns = [t({ qty: 2, price: 100 }), t({ qty: 2, price: 200 }), t({ side: "sell", qty: 2, price: 300 })];
    const [h] = holdings(txns, { "TCS.NS": 250 });
    expect(h).toEqual({ symbol: "TCS.NS", qty: 2, avgPrice: 150, invested: 300, value: 500, pnl: 200, pnlPct: 66.67 });
  });
  it("falls back to average price when no quote is available", () => {
    const [h] = holdings([t({ qty: 1, price: 100 })], {});
    expect(h.value).toBe(100);
  });
});

describe("fundUnits", () => {
  it("rounds down to 3 decimals", () => expect(fundUnits(100, 30)).toBe(3.333));
});
```

- [ ] **Step 2: Run it to check it fails**

Run: `npx vitest run lib/engine/portfolio.test.ts`
Expected: FAIL, `Cannot find module './portfolio'`.

- [ ] **Step 3: Implement** `groww-start/lib/engine/portfolio.ts`

```ts
import { round2, round3 } from "./num";

export interface Txn { id: string; symbol: string; side: "buy" | "sell"; qty: number; price: number; date: string }
export interface PortfolioState { cash: number; transactions: Txn[] }
export type TradeResult = { ok: true; state: PortfolioState } | { ok: false; error: string };
export interface Holding {
  symbol: string; qty: number; avgPrice: number; invested: number; value: number; pnl: number; pnlPct: number;
}

const EPS = 1e-6;

export function heldQty(txns: Txn[], symbol: string): number {
  const q = txns.filter((t) => t.symbol === symbol).reduce((acc, t) => acc + (t.side === "buy" ? t.qty : -t.qty), 0);
  return round3(q);
}

export function applyTrade(state: PortfolioState, t: Txn, opts: { fractional: boolean }): TradeResult {
  if (!Number.isFinite(t.qty) || t.qty <= 0) return { ok: false, error: "Enter a quantity greater than 0" };
  if (!opts.fractional && !Number.isInteger(t.qty)) return { ok: false, error: "Stocks can only be bought in whole shares" };
  if (!(t.price > 0)) return { ok: false, error: "Price unavailable right now" };
  const amount = round2(t.qty * t.price);

  if (t.side === "buy") {
    if (amount > state.cash + EPS) {
      return { ok: false, error: `Not enough virtual cash (₹${state.cash.toFixed(2)} available)` };
    }
    return { ok: true, state: { cash: round2(state.cash - amount), transactions: [...state.transactions, t] } };
  }

  if (t.qty > heldQty(state.transactions, t.symbol) + EPS) return { ok: false, error: "You can't sell more than you hold" };
  return { ok: true, state: { cash: round2(state.cash + amount), transactions: [...state.transactions, t] } };
}

export function holdings(txns: Txn[], prices: Record<string, number>): Holding[] {
  const acc = new Map<string, { qty: number; invested: number }>();
  for (const t of txns) {
    const h = acc.get(t.symbol) ?? { qty: 0, invested: 0 };
    if (t.side === "buy") {
      h.qty += t.qty;
      h.invested += t.qty * t.price;
    } else {
      h.invested -= h.qty > 0 ? h.invested * (t.qty / h.qty) : 0;
      h.qty -= t.qty;
    }
    acc.set(t.symbol, h);
  }
  const out: Holding[] = [];
  for (const [symbol, h] of acc) {
    const qty = round3(h.qty);
    if (qty <= EPS) continue;
    const invested = round2(h.invested);
    const avgPrice = round2(invested / qty);
    const value = round2(qty * (prices[symbol] ?? avgPrice));
    const pnl = round2(value - invested);
    out.push({ symbol, qty, avgPrice, invested, value, pnl, pnlPct: invested ? round2((pnl / invested) * 100) : 0 });
  }
  return out;
}

export function fundUnits(amount: number, nav: number): number {
  return Math.floor((amount / nav) * 1000) / 1000;
}
```

- [ ] **Step 4: Run the test to check it passes**

Run: `npx vitest run lib/engine/portfolio.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(engine): mock portfolio trades and holdings"
```

---

### Task 5: Monthly streak and SIP instalments

**Files:**
- Create: `groww-start/lib/engine/streak.ts`, `groww-start/lib/engine/streak.test.ts`, `groww-start/lib/engine/instalments.ts`, `groww-start/lib/engine/instalments.test.ts`

**Interfaces:**
- Consumes: `monthKey`, `prevMonthKey`, `nextMonthKey`, `dateInMonth`, `FundCategory`
- Produces:
  - `StreakResult {current; longest; freezesUsed}`
  - `computeStreak(dates: string[], today: string, freezes = 1): StreakResult`
  - `SipPlan {category: FundCategory; symbol; amount; day; startDate}`, `Instalment {date; amount}`
  - `dueInstalments(plan: SipPlan, existing: Instalment[], skippedMonths: string[], today: string): Instalment[]`

- [ ] **Step 1: Write the failing tests**

`groww-start/lib/engine/streak.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("is zero with no instalments", () => {
    expect(computeStreak([], "2026-10-07")).toEqual({ current: 0, longest: 0, freezesUsed: 0 });
  });
  it("counts consecutive months including the current one", () => {
    expect(computeStreak(["2026-08-07", "2026-09-07", "2026-10-07"], "2026-10-07").current).toBe(3);
  });
  it("does not break when this month's instalment is still pending", () => {
    expect(computeStreak(["2026-08-07", "2026-09-07"], "2026-10-03").current).toBe(2);
  });
  it("uses one freeze for a single missed month", () => {
    expect(computeStreak(["2026-07-07", "2026-09-07", "2026-10-07"], "2026-10-07")).toEqual({ current: 3, longest: 2, freezesUsed: 1 });
  });
  it("breaks after two missed months", () => {
    const r = computeStreak(["2026-06-07", "2026-09-07", "2026-10-07"], "2026-10-07");
    expect(r.current).toBe(2);
  });
  it("crosses year boundaries", () => {
    expect(computeStreak(["2025-12-05", "2026-01-05"], "2026-01-20").current).toBe(2);
  });
  it("reports the longest strict run", () => {
    const r = computeStreak(["2026-01-05", "2026-02-05", "2026-03-05", "2026-07-05", "2026-08-05"], "2026-08-05");
    expect(r.current).toBe(2);
    expect(r.longest).toBe(3);
  });
  it("reports no freeze used when the streak is broken", () => {
    expect(computeStreak(["2026-01-05"], "2026-10-07")).toEqual({ current: 0, longest: 1, freezesUsed: 0 });
  });
});
```

`groww-start/lib/engine/instalments.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { dueInstalments, type SipPlan } from "./instalments";

const plan: SipPlan = { category: "index", symbol: "MF120716", amount: 100, day: 7, startDate: "2026-10-07" };

describe("dueInstalments", () => {
  it("creates the first instalment on the start date", () => {
    expect(dueInstalments(plan, [], [], "2026-10-07")).toEqual([{ date: "2026-10-07", amount: 100 }]);
  });
  it("creates missing months up to today", () => {
    const r = dueInstalments(plan, [{ date: "2026-10-07", amount: 100 }], [], "2026-12-07");
    expect(r).toEqual([{ date: "2026-11-07", amount: 100 }, { date: "2026-12-07", amount: 100 }]);
  });
  it("respects skipped months", () => {
    const r = dueInstalments(plan, [{ date: "2026-10-07", amount: 100 }], ["2026-11"], "2026-12-07");
    expect(r).toEqual([{ date: "2026-12-07", amount: 100 }]);
  });
  it("clamps SIP day to month length and waits for the SIP day", () => {
    const p31 = { ...plan, day: 31 };
    expect(dueInstalments(p31, [{ date: "2026-10-07", amount: 100 }], [], "2026-11-30")).toEqual([{ date: "2026-11-30", amount: 100 }]);
    const p25 = { ...plan, day: 25 };
    expect(dueInstalments(p25, [{ date: "2026-10-07", amount: 100 }], [], "2026-11-20")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run them to check they fail**

Run: `npx vitest run lib/engine/streak.test.ts lib/engine/instalments.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement** `groww-start/lib/engine/streak.ts`

```ts
import { monthKey, nextMonthKey, prevMonthKey } from "./dates";

export interface StreakResult { current: number; longest: number; freezesUsed: number }

export function computeStreak(dates: string[], today: string, freezes = 1): StreakResult {
  if (dates.length === 0) return { current: 0, longest: 0, freezesUsed: 0 };
  const months = new Set(dates.map(monthKey));
  const first = [...months].sort()[0];
  const todayKey = monthKey(today);

  let key = months.has(todayKey) ? todayKey : prevMonthKey(todayKey); // the current month is still open
  let current = 0;
  let used = 0;
  while (key >= first) {
    if (months.has(key)) current++;
    else if (used < freezes) used++;
    else break;
    key = prevMonthKey(key);
  }

  let longest = 0;
  let run = 0;
  for (let k = first; k <= todayKey; k = nextMonthKey(k)) {
    run = months.has(k) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { current, longest, freezesUsed: current === 0 ? 0 : used };
}
```

Note: in the "one freeze" test, `longest` is 2 (Sep–Oct is the longest strict run). The streak including the freeze is
reported as `current` = 3.

`groww-start/lib/engine/instalments.ts`:

```ts
import type { FundCategory } from "@/lib/types";
import { dateInMonth, monthKey, nextMonthKey } from "./dates";

export interface SipPlan { category: FundCategory; symbol: string; amount: number; day: number; startDate: string }
export interface Instalment { date: string; amount: number }

export function dueInstalments(plan: SipPlan, existing: Instalment[], skippedMonths: string[], today: string): Instalment[] {
  const have = new Set(existing.map((i) => monthKey(i.date)));
  const startKey = monthKey(plan.startDate);
  const out: Instalment[] = [];
  for (let key = startKey; key <= monthKey(today); key = nextMonthKey(key)) {
    if (have.has(key) || skippedMonths.includes(key)) continue;
    const date = key === startKey ? plan.startDate : dateInMonth(key, plan.day);
    if (date <= today) out.push({ date, amount: plan.amount });
  }
  return out;
}
```

- [ ] **Step 4: Run them to check they pass**

Run: `npx vitest run lib/engine/streak.test.ts lib/engine/instalments.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(engine): monthly SIP streak with freeze and due instalments"
```

---

### Task 6: Persona rules and milestones

**Files:**
- Create: `groww-start/lib/engine/persona.ts`, `groww-start/lib/engine/persona.test.ts`, `groww-start/lib/engine/milestones.ts`, `groww-start/lib/engine/milestones.test.ts`

**Interfaces:**
- Produces:
  - Answer types: `Goal`, `Experience`, `Budget`, `Reaction`, `Horizon`, `Answers`
  - `PersonaId = "steady-starter" | "curious-explorer" | "goal-saver"`
  - `PersonaResult {id; title; tagline; suggestedCategory: "index" | "liquid"; suggestedAmount: 100 | 250 | 500; path: string[]}`
  - `personaFor(a: Answers): PersonaResult`
  - `GOAL_DEFAULTS: Record<Goal, {name: string; target: number}>`, `PRESET_ANSWERS: Record<PersonaId, Answers>`
  - `MilestoneKey = "first_lesson"|"three_lessons"|"first_time_machine"|"first_mock_buy"|"first_sip"|"streak_3"`
  - `MILESTONES: Record<MilestoneKey, {title; emoji; description}>`, `MILESTONE_ORDER: MilestoneKey[]`
  - `MilestoneInput {lessonsCompleted; timeMachineRuns; mockBuys; instalments; streak}`
  - `evaluateMilestones(input, already: Partial<Record<MilestoneKey, string>>, today: string): Partial<Record<MilestoneKey, string>>`
    returns only newly earned keys.

- [ ] **Step 1: Write the failing tests**

`groww-start/lib/engine/persona.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { personaFor, PRESET_ANSWERS, type Answers } from "./persona";

const a = (p: Partial<Answers>): Answers => ({ goal: "wealth", experience: "mf", budget: "500-2k", reaction: "wait", horizon: "3plus", ...p });

describe("personaFor", () => {
  it("routes short horizons and emergency goals to Goal Saver with liquid category", () => {
    expect(personaFor(a({ horizon: "lt1" }))).toMatchObject({ id: "goal-saver", suggestedCategory: "liquid" });
    expect(personaFor(a({ goal: "emergency" })).id).toBe("goal-saver");
  });
  it("routes learners, first-timers and panic sellers to Curious Explorer", () => {
    expect(personaFor(a({ goal: "learning" })).id).toBe("curious-explorer");
    expect(personaFor(a({ experience: "never" })).id).toBe("curious-explorer");
    expect(personaFor(a({ reaction: "sell" })).id).toBe("curious-explorer");
  });
  it("defaults to Steady Starter with index category", () => {
    expect(personaFor(a({}))).toMatchObject({ id: "steady-starter", suggestedCategory: "index" });
  });
  it("maps budget to suggested amount", () => {
    expect(personaFor(a({ budget: "100-500" })).suggestedAmount).toBe(100);
    expect(personaFor(a({ budget: "500-2k" })).suggestedAmount).toBe(250);
    expect(personaFor(a({ budget: "5k+" })).suggestedAmount).toBe(500);
  });
  it("presets resolve to their own persona", () => {
    for (const [id, answers] of Object.entries(PRESET_ANSWERS)) expect(personaFor(answers).id).toBe(id);
  });
  it("is deterministic", () => {
    expect(personaFor(a({}))).toEqual(personaFor(a({})));
  });
});
```

`groww-start/lib/engine/milestones.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { evaluateMilestones, type MilestoneInput } from "./milestones";

const zero: MilestoneInput = { lessonsCompleted: 0, timeMachineRuns: 0, mockBuys: 0, instalments: 0, streak: 0 };

describe("evaluateMilestones", () => {
  it("awards nothing at zero", () => {
    expect(evaluateMilestones(zero, {}, "2026-10-07")).toEqual({});
  });
  it("awards each milestone at its threshold", () => {
    const r = evaluateMilestones({ lessonsCompleted: 3, timeMachineRuns: 1, mockBuys: 1, instalments: 1, streak: 3 }, {}, "2026-10-07");
    expect(Object.keys(r).sort()).toEqual(["first_lesson", "first_mock_buy", "first_sip", "first_time_machine", "streak_3", "three_lessons"]);
    expect(r.first_sip).toBe("2026-10-07");
  });
  it("is idempotent: never re-awards", () => {
    const r = evaluateMilestones({ ...zero, lessonsCompleted: 1 }, { first_lesson: "2026-10-01" }, "2026-10-07");
    expect(r).toEqual({});
  });
});
```

- [ ] **Step 2: Run them to check they fail**

Run: `npx vitest run lib/engine/persona.test.ts lib/engine/milestones.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement** `groww-start/lib/engine/persona.ts`

```ts
export type Goal = "emergency" | "trip" | "studies" | "wealth" | "learning";
export type Experience = "never" | "fd" | "mf" | "stocks";
export type Budget = "100-500" | "500-2k" | "2k-5k" | "5k+";
export type Reaction = "sell" | "wait" | "buy";
export type Horizon = "lt1" | "1to3" | "3plus";
export interface Answers { goal: Goal; experience: Experience; budget: Budget; reaction: Reaction; horizon: Horizon }

export type PersonaId = "steady-starter" | "curious-explorer" | "goal-saver";
export interface PersonaResult {
  id: PersonaId; title: string; tagline: string;
  suggestedCategory: "index" | "liquid"; suggestedAmount: 100 | 250 | 500; path: string[];
}

const PERSONAS: Record<PersonaId, Omit<PersonaResult, "id" | "suggestedAmount">> = {
  "steady-starter": {
    title: "Steady Starter",
    tagline: "You think long-term and stay calm. Let's turn that into a habit.",
    suggestedCategory: "index",
    path: ["Learn what a SIP is (2 min)", "Replay a ₹100/month SIP on real past data", "Start your first ₹100 SIP"],
  },
  "curious-explorer": {
    title: "Curious Explorer",
    tagline: "You're here to understand before you commit. Smart.",
    suggestedCategory: "index",
    path: ["Learn the basics in 3 short lessons", "Practise with ₹10,000 of virtual money", "Try a small SIP when you feel ready"],
  },
  "goal-saver": {
    title: "Goal Saver",
    tagline: "You've got something specific to save for. Let's keep it safe and on track.",
    suggestedCategory: "liquid",
    path: ["Learn why short-term money needs low risk", "See how a steady monthly amount adds up", "Start a small SIP towards your goal"],
  },
};

export const GOAL_DEFAULTS: Record<Goal, { name: string; target: number }> = {
  emergency: { name: "Emergency fund", target: 30000 },
  trip: { name: "Goa trip", target: 15000 },
  studies: { name: "Higher studies", target: 100000 },
  wealth: { name: "Long-term wealth", target: 100000 },
  learning: { name: "My first ₹5,000", target: 5000 },
};

export const PRESET_ANSWERS: Record<PersonaId, Answers> = {
  "steady-starter": { goal: "wealth", experience: "fd", budget: "500-2k", reaction: "wait", horizon: "3plus" },
  "curious-explorer": { goal: "learning", experience: "never", budget: "100-500", reaction: "wait", horizon: "3plus" },
  "goal-saver": { goal: "trip", experience: "fd", budget: "500-2k", reaction: "wait", horizon: "lt1" },
};

function personaId(a: Answers): PersonaId {
  if (a.horizon === "lt1" || a.goal === "emergency") return "goal-saver";
  if (a.goal === "learning" || a.experience === "never" || a.reaction === "sell") return "curious-explorer";
  return "steady-starter";
}

export function personaFor(a: Answers): PersonaResult {
  const id = personaId(a);
  const suggestedAmount = a.budget === "100-500" ? 100 : a.budget === "500-2k" ? 250 : 500;
  return { id, suggestedAmount, ...PERSONAS[id] };
}
```

`groww-start/lib/engine/milestones.ts`:

```ts
export type MilestoneKey = "first_lesson" | "three_lessons" | "first_time_machine" | "first_mock_buy" | "first_sip" | "streak_3";
export interface MilestoneInput { lessonsCompleted: number; timeMachineRuns: number; mockBuys: number; instalments: number; streak: number }

export const MILESTONES: Record<MilestoneKey, { title: string; emoji: string; description: string }> = {
  first_lesson: { title: "First lesson", emoji: "📘", description: "Finished your first 2-minute lesson" },
  three_lessons: { title: "Basics done", emoji: "🎓", description: "Completed all 3 starter lessons" },
  first_time_machine: { title: "Time traveller", emoji: "⏳", description: "Replayed a SIP on real past data" },
  first_mock_buy: { title: "First practice buy", emoji: "🧪", description: "Made a buy with virtual money" },
  first_sip: { title: "First investment", emoji: "🌱", description: "Started your first SIP" },
  streak_3: { title: "3-month streak", emoji: "🔥", description: "Invested 3 months in a row" },
};

export const MILESTONE_ORDER: MilestoneKey[] = ["first_lesson", "first_time_machine", "first_mock_buy", "first_sip", "three_lessons", "streak_3"];

const RULES: Record<MilestoneKey, (i: MilestoneInput) => boolean> = {
  first_lesson: (i) => i.lessonsCompleted >= 1,
  three_lessons: (i) => i.lessonsCompleted >= 3,
  first_time_machine: (i) => i.timeMachineRuns >= 1,
  first_mock_buy: (i) => i.mockBuys >= 1,
  first_sip: (i) => i.instalments >= 1,
  streak_3: (i) => i.streak >= 3,
};

export function evaluateMilestones(
  input: MilestoneInput,
  already: Partial<Record<MilestoneKey, string>>,
  today: string,
): Partial<Record<MilestoneKey, string>> {
  const out: Partial<Record<MilestoneKey, string>> = {};
  for (const key of MILESTONE_ORDER) if (!already[key] && RULES[key](input)) out[key] = today;
  return out;
}
```

- [ ] **Step 4: Run them to check they pass**

Run: `npx vitest run lib/engine`
Expected: PASS, all engine tests.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(engine): persona rules and milestone evaluation"
```

---

### Task 7: Market data layer and snapshot

**Files:**
- Create: `groww-start/lib/market/instruments.ts`, `groww-start/lib/market/sources.ts`, `groww-start/lib/market/history.ts`,
  `groww-start/lib/market/server-deps.ts`, `groww-start/lib/market/market.test.ts`,
  `groww-start/scripts/fetch-snapshot.ts`, `groww-start/data/snapshot/*.json` (generated)

**Interfaces:**
- Consumes: `PricePoint`, `HistoryResult`, `Quote`, `FundCategory`, `addDays`, `round2`
- Produces:
  - `Instrument {symbol; name; short; kind: "stock"|"index"|"etf"|"fund"; category?: FundCategory; mfCode?: number}`
  - `INSTRUMENTS`, `getInstrument(symbol)`, `fundForCategory(cat): Instrument`, `snapshotFileName(symbol)`
  - `parseYahooChart(json): PricePoint[]`, `parseMfapi(json): PricePoint[]`
  - `fetchLive(inst, signal): Promise<PricePoint[]>`
  - `HistoryDeps {fetchLive(inst, signal); readSnapshot(symbol)}`
  - `getHistory(symbol, deps): Promise<HistoryResult>` (throws `UnknownSymbolError`)
  - `getQuotes(symbols, deps): Promise<Quote[]>`, `trimToYears(points, years)`
  - `serverDeps: HistoryDeps`

- [ ] **Step 1: Write the failing test** at `groww-start/lib/market/market.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { parseYahooChart, parseMfapi } from "./sources";
import { getHistory, getQuotes, trimToYears, UnknownSymbolError, type HistoryDeps } from "./history";
import { getInstrument, fundForCategory, snapshotFileName, INSTRUMENTS } from "./instruments";

const snap = [{ date: "2026-10-05", close: 10 }, { date: "2026-10-06", close: 11 }];

describe("parsers", () => {
  it("parses Yahoo chart JSON in IST and drops null closes", () => {
    const json = { chart: { result: [{ meta: { gmtoffset: 19800 }, timestamp: [1791259200, 1791345600, 1791432000],
      indicators: { quote: [{ close: [100.5, null, 102] }] } }] } };
    expect(parseYahooChart(json)).toEqual([{ date: "2026-10-06", close: 100.5 }, { date: "2026-10-08", close: 102 }]);
  });
  it("throws on an empty Yahoo result", () => {
    expect(() => parseYahooChart({ chart: { result: null } })).toThrow();
  });
  it("parses mfapi (newest first, DD-MM-YYYY) into ascending points", () => {
    const json = { data: [{ date: "06-10-2026", nav: "51.20" }, { date: "03-10-2026", nav: "50.00" }] };
    expect(parseMfapi(json)).toEqual([{ date: "2026-10-03", close: 50 }, { date: "2026-10-06", close: 51.2 }]);
  });
});

describe("instruments", () => {
  it("has the curated universe", () => {
    expect(INSTRUMENTS.filter((i) => i.kind === "stock")).toHaveLength(12);
    expect(getInstrument("MF120716")?.mfCode).toBe(120716);
    expect(fundForCategory("liquid").mfCode).toBe(143269);
    expect(snapshotFileName("^NSEI")).toBe("_NSEI.json");
  });
});

describe("getHistory", () => {
  const ok: HistoryDeps = { fetchLive: async () => [{ date: "2026-10-06", close: 99 }, { date: "2026-10-07", close: 100 }], readSnapshot: async () => snap };
  it("returns live data when available", async () => {
    expect((await getHistory("TCS.NS", ok)).source).toBe("live");
  });
  it("falls back to snapshot on upstream error", async () => {
    const r = await getHistory("TCS.NS", { ...ok, fetchLive: async () => { throw new Error("429"); } });
    expect(r).toEqual({ symbol: "TCS.NS", points: snap, source: "snapshot" });
  });
  it("falls back to snapshot when upstream returns too few points", async () => {
    const r = await getHistory("TCS.NS", { ...ok, fetchLive: async () => [] });
    expect(r.source).toBe("snapshot");
  });
  it("rejects unknown symbols", async () => {
    await expect(getHistory("EVIL", ok)).rejects.toBeInstanceOf(UnknownSymbolError);
  });
  it("builds quotes with day change", async () => {
    const [q] = await getQuotes(["TCS.NS"], ok);
    expect(q).toEqual({ symbol: "TCS.NS", date: "2026-10-07", price: 100, changePct: 1.01, source: "live" });
  });
  it("trims to N years from the last point", () => {
    const pts = [{ date: "2019-01-01", close: 1 }, { date: "2025-01-01", close: 2 }, { date: "2026-10-07", close: 3 }];
    expect(trimToYears(pts, 5).map((p) => p.date)).toEqual(["2025-01-01", "2026-10-07"]);
  });
});
```

(The timestamps in this test fall on 6, 7 and 8 Oct 2026 in IST; this was checked with Node.)

- [ ] **Step 2: Run it to check it fails**

Run: `npx vitest run lib/market`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement** `groww-start/lib/market/instruments.ts`

```ts
import type { FundCategory } from "@/lib/types";

export interface Instrument {
  symbol: string; name: string; short: string; kind: "stock" | "index" | "etf" | "fund";
  category?: FundCategory; mfCode?: number;
}

const stock = (ticker: string, name: string): Instrument => ({ symbol: `${ticker}.NS`, name, short: ticker, kind: "stock" });
const fund = (code: number, name: string, short: string, category: FundCategory): Instrument =>
  ({ symbol: `MF${code}`, name, short, kind: "fund", category, mfCode: code });

export const INSTRUMENTS: Instrument[] = [
  fund(120716, "UTI Nifty 50 Index Fund", "Nifty 50 Index", "index"),
  fund(122639, "Parag Parikh Flexi Cap Fund", "Flexi Cap", "flexi"),
  fund(118825, "Mirae Asset Large Cap Fund", "Large Cap", "largecap"),
  fund(120503, "Axis ELSS Tax Saver Fund", "ELSS Tax Saver", "elss"),
  fund(119132, "HDFC Gold ETF Fund of Fund", "Gold FoF", "gold"),
  fund(143269, "Parag Parikh Liquid Fund", "Liquid", "liquid"),
  { symbol: "^NSEI", name: "Nifty 50", short: "NIFTY 50", kind: "index" },
  { symbol: "GOLDBEES.NS", name: "Nippon India Gold BeES", short: "GOLDBEES", kind: "etf" },
  stock("RELIANCE", "Reliance Industries"),
  stock("TCS", "Tata Consultancy Services"),
  stock("HDFCBANK", "HDFC Bank"),
  stock("INFY", "Infosys"),
  stock("ITC", "ITC"),
  stock("MARUTI", "Maruti Suzuki"),
  stock("ICICIBANK", "ICICI Bank"),
  stock("SBIN", "State Bank of India"),
  stock("BHARTIARTL", "Bharti Airtel"),
  stock("HINDUNILVR", "Hindustan Unilever"),
  stock("ASIANPAINT", "Asian Paints"),
  stock("TITAN", "Titan Company"),
];

const BY_SYMBOL = new Map(INSTRUMENTS.map((i) => [i.symbol, i]));
export const getInstrument = (symbol: string) => BY_SYMBOL.get(symbol);

export function fundForCategory(cat: FundCategory): Instrument {
  const f = INSTRUMENTS.find((i) => i.kind === "fund" && i.category === cat);
  if (!f) throw new Error(`No fund for category ${cat}`);
  return f;
}

export const snapshotFileName = (symbol: string) => `${symbol.replace(/[^A-Za-z0-9]/g, "_")}.json`;
```

`groww-start/lib/market/sources.ts`:

```ts
import type { PricePoint } from "@/lib/types";
import type { Instrument } from "./instruments";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseYahooChart(json: any): PricePoint[] {
  const r = json?.chart?.result?.[0];
  if (!r || !Array.isArray(r.timestamp)) throw new Error("Empty Yahoo chart result");
  const off: number = r.meta?.gmtoffset ?? 19800;
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
  const byDate = new Map<string, number>();
  r.timestamp.forEach((t: number, i: number) => {
    const c = closes[i];
    if (typeof c === "number" && c > 0) byDate.set(new Date((t + off) * 1000).toISOString().slice(0, 10), c);
  });
  return [...byDate].map(([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date));
}

export function parseMfapi(json: any): PricePoint[] {
  if (!Array.isArray(json?.data)) throw new Error("Bad mfapi payload");
  return json.data
    .map((d: { date: string; nav: string }) => {
      const [dd, mm, yyyy] = d.date.split("-");
      return { date: `${yyyy}-${mm}-${dd}`, close: Number.parseFloat(d.nav) };
    })
    .filter((p: PricePoint) => p.close > 0)
    .sort((a: PricePoint, b: PricePoint) => a.date.localeCompare(b.date));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const UA = { "User-Agent": "Mozilla/5.0 (compatible; groww-start-demo/1.0)" };

export async function fetchLive(inst: Instrument, signal?: AbortSignal): Promise<PricePoint[]> {
  const url = inst.mfCode
    ? `https://api.mfapi.in/mf/${inst.mfCode}`
    : `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(inst.symbol)}?range=5y&interval=1d`;
  const res = await fetch(url, { headers: UA, signal, next: { revalidate: 900 } } as RequestInit);
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const json = await res.json();
  return inst.mfCode ? parseMfapi(json) : parseYahooChart(json);
}
```

`groww-start/lib/market/history.ts`:

```ts
import type { HistoryResult, PricePoint, Quote } from "@/lib/types";
import { addDays } from "@/lib/engine/dates";
import { round2 } from "@/lib/engine/num";
import { getInstrument, type Instrument } from "./instruments";

export interface HistoryDeps {
  fetchLive: (inst: Instrument, signal: AbortSignal) => Promise<PricePoint[]>;
  readSnapshot: (symbol: string) => Promise<PricePoint[]>;
}

export class UnknownSymbolError extends Error {
  constructor(symbol: string) { super(`Unknown symbol: ${symbol}`); }
}

export function trimToYears(points: PricePoint[], years: number): PricePoint[] {
  if (points.length === 0) return points;
  const cutoff = addDays(points[points.length - 1].date, -Math.round(365.25 * years));
  return points.filter((p) => p.date >= cutoff);
}

export async function getHistory(symbol: string, deps: HistoryDeps): Promise<HistoryResult> {
  const inst = getInstrument(symbol);
  if (!inst) throw new UnknownSymbolError(symbol);
  try {
    const points = await deps.fetchLive(inst, AbortSignal.timeout(4000));
    if (points.length < 2) throw new Error("Too few points");
    return { symbol, points: trimToYears(points, 5), source: "live" };
  } catch {
    return { symbol, points: await deps.readSnapshot(symbol), source: "snapshot" };
  }
}

export async function getQuotes(symbols: string[], deps: HistoryDeps): Promise<Quote[]> {
  return Promise.all(symbols.map(async (symbol) => {
    const { points, source } = await getHistory(symbol, deps);
    const last = points[points.length - 1];
    const prev = points[points.length - 2] ?? last;
    return { symbol, date: last.date, price: last.close, changePct: round2(((last.close - prev.close) / prev.close) * 100), source };
  }));
}
```

`groww-start/lib/market/server-deps.ts`:

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PricePoint } from "@/lib/types";
import type { HistoryDeps } from "./history";
import { snapshotFileName } from "./instruments";
import { fetchLive } from "./sources";

export const serverDeps: HistoryDeps = {
  fetchLive,
  readSnapshot: async (symbol) => {
    const file = path.join(process.cwd(), "data", "snapshot", snapshotFileName(symbol));
    return JSON.parse(await readFile(file, "utf8")) as PricePoint[];
  },
};
```

- [ ] **Step 4: Run the test to check it passes**

Run: `npx vitest run lib/market`
Expected: PASS (10 tests).

- [ ] **Step 5: Write the snapshot script** at `groww-start/scripts/fetch-snapshot.ts`

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { INSTRUMENTS, snapshotFileName } from "../lib/market/instruments";
import { fetchLive } from "../lib/market/sources";
import { trimToYears } from "../lib/market/history";

async function main() {
  const dir = path.join(process.cwd(), "data", "snapshot");
  await mkdir(dir, { recursive: true });
  for (const inst of INSTRUMENTS) {
    const points = trimToYears(await fetchLive(inst), 5);
    if (points.length < 200) throw new Error(`${inst.symbol}: only ${points.length} points`);
    await writeFile(path.join(dir, snapshotFileName(inst.symbol)), JSON.stringify(points));
    console.log(`${inst.symbol}: ${points.length} points, ${points[0].date} → ${points[points.length - 1].date}`);
    await new Promise((r) => setTimeout(r, 500)); // be polite to upstreams
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Note: `tsx` does not resolve the `@/` alias in the imported modules. If `npm run snapshot` fails with
`Cannot find module '@/lib/...'`, run `npx tsx --tsconfig tsconfig.json scripts/fetch-snapshot.ts` instead.
tsx honours tsconfig `paths`.

- [ ] **Step 6: Generate the snapshot**

Run: `npm run snapshot`
Expected: 20 lines, one per instrument, each with more than 200 points ending within the last few days. You should
see 20 files in `data/snapshot/`, including `_NSEI.json`, `MF120716.json` and `RELIANCE_NS.json`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(market): Yahoo/mfapi sources with snapshot fallback and committed 5y snapshot"
```

---

### Task 8: API routes and client hooks

**Files:**
- Create: `groww-start/app/api/history/route.ts`, `groww-start/app/api/quote/route.ts`, `groww-start/app/api/routes.test.ts`,
  `groww-start/lib/market/client.ts`, `groww-start/app/providers.tsx`
- Modify: `groww-start/app/layout.tsx`

**Interfaces:**
- Consumes: `getHistory`, `getQuotes`, `serverDeps`, `getInstrument`
- Produces:
  - `GET /api/history?symbol=X` → `HistoryResult` (400 if the symbol is unknown)
  - `GET /api/quote?symbols=A,B` → `{quotes: Quote[]}` (400 if any symbol is unknown or the list is empty)
  - `useHistory(symbol: string)` → TanStack `UseQueryResult<HistoryResult>`
  - `useQuotes(symbols: string[])` → `UseQueryResult<Quote[]>`
  - `<Providers>`

- [ ] **Step 1: Write the failing test** at `groww-start/app/api/routes.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as history } from "./history/route";
import { GET as quote } from "./quote/route";

describe("api routes", () => {
  it("history rejects unknown symbols with 400", async () => {
    const res = await history(new NextRequest("http://x/api/history?symbol=EVIL"));
    expect(res.status).toBe(400);
  });
  it("quote rejects empty and unknown lists with 400", async () => {
    expect((await quote(new NextRequest("http://x/api/quote?symbols="))).status).toBe(400);
    expect((await quote(new NextRequest("http://x/api/quote?symbols=TCS.NS,EVIL"))).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run it to check it fails**

Run: `npx vitest run app/api`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the routes**

`groww-start/app/api/history/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/market/history";
import { getInstrument } from "@/lib/market/instruments";
import { serverDeps } from "@/lib/market/server-deps";

const CACHE = { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" };

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "";
  if (!getInstrument(symbol)) return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  return NextResponse.json(await getHistory(symbol, serverDeps), { headers: CACHE });
}
```

`groww-start/app/api/quote/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market/history";
import { getInstrument } from "@/lib/market/instruments";
import { serverDeps } from "@/lib/market/server-deps";

export async function GET(req: NextRequest) {
  const symbols = (req.nextUrl.searchParams.get("symbols") ?? "").split(",").filter(Boolean);
  if (symbols.length === 0 || symbols.some((s) => !getInstrument(s))) {
    return NextResponse.json({ error: "Unknown or missing symbols" }, { status: 400 });
  }
  const quotes = await getQuotes(symbols, serverDeps);
  return NextResponse.json({ quotes }, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } });
}
```

- [ ] **Step 4: Run the test to check it passes**

Run: `npx vitest run app/api`
Expected: PASS (2 tests).

- [ ] **Step 5: Add the client hooks and providers**

`groww-start/lib/market/client.ts`:

```ts
"use client";
import { useQuery } from "@tanstack/react-query";
import type { HistoryResult, Quote } from "@/lib/types";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useHistory(symbol: string) {
  return useQuery({
    queryKey: ["history", symbol],
    queryFn: () => getJSON<HistoryResult>(`/api/history?symbol=${encodeURIComponent(symbol)}`),
    staleTime: 15 * 60_000,
  });
}

export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: async () => (await getJSON<{ quotes: Quote[] }>(`/api/quote?symbols=${symbols.map(encodeURIComponent).join(",")}`)).quotes,
    staleTime: 15 * 60_000,
    enabled: symbols.length > 0,
  });
}
```

`groww-start/app/providers.tsx`:

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

In `groww-start/app/layout.tsx`, import `Providers` and wrap the inner div:

```tsx
import { Providers } from "./providers";
// ...
<body className={`${inter.variable} font-sans bg-neutral-100 text-ink antialiased`}>
  <Providers>
    <div className="mx-auto min-h-dvh max-w-[430px] bg-white shadow-sm">{children}</div>
  </Providers>
</body>
```

- [ ] **Step 6: Smoke test the routes by hand**

Run `npm run dev`, then in a second shell:

```bash
curl -s "http://localhost:3000/api/quote?symbols=RELIANCE.NS,MF120716" | head -c 300
```

Expected: JSON with 2 quotes, each having `source` set to `live`, or to `snapshot` if offline.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(api): history and quote routes with client hooks"
```

---

### Task 9: Persisted app store

**Files:**
- Create: `groww-start/lib/store/index.ts`, `groww-start/lib/store/use-hydrated.ts`, `groww-start/lib/store/store.test.ts`

**Interfaces:**
- Consumes: all engine functions and types from Tasks 2–6
- Produces:
  - `todayFor(offsetDays: number, now?: Date): string`
  - `useApp`: a Zustand hook whose state is `AppData & AppActions`
  - `AppData`: `answers`, `goal`, `lessons`, `cash`, `transactions`, `reflections`, `timeMachineRuns`, `sipPlan`,
    `instalments`, `skippedMonths`, `milestones`, `clockOffsetDays`, `newMilestone`
  - `AppActions`:
    - `setOnboarding(answers, goal)`
    - `completeLesson(id, quizCorrect)`
    - `recordTimeMachineRun()`
    - `trade({symbol, side, qty, price}, fractional) → {ok: true} | {ok: false; error}`
    - `addReflection(prompt, answer)`
    - `startSip({category, symbol, amount, day})`
    - `advanceMonth(skipSip: boolean)`
    - `applyPreset(id: PersonaId)`
    - `dismissMilestone()`
    - `reset()`
  - `useToday(): string`
  - `useHydrated(): boolean`
  - `STORE_KEY = "groww-genz"`, `STORE_VERSION = 1`, `START_CASH = 10000`

- [ ] **Step 1: Write the failing test** at `groww-start/lib/store/store.test.ts`

```ts
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key() { return null; }
  get length() { return this.m.size; }
}

let mod: typeof import("./index");

beforeAll(async () => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-07T06:00:00Z"));
  mod = await import("./index");
});

beforeEach(() => mod.useApp.getState().reset());

const s = () => mod.useApp.getState();

describe("store", () => {
  it("computes today in IST with offset", () => {
    expect(mod.todayFor(0)).toBe("2026-10-07");
    expect(mod.todayFor(31)).toBe("2026-11-07");
  });

  it("starts a SIP once, even when confirm is double-tapped", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().startSip({ category: "index", symbol: "MF120716", amount: 500, day: 7 });
    expect(s().sipPlan?.amount).toBe(100);
    expect(s().instalments).toEqual([{ date: "2026-10-07", amount: 100 }]);
    expect(s().milestones.first_sip).toBe("2026-10-07");
    expect(s().newMilestone).toBe("first_sip");
  });

  it("advances months, adds instalments and earns the 3-month streak", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(false);
    s().advanceMonth(false);
    expect(s().instalments.map((i) => i.date)).toEqual(["2026-10-07", "2026-11-07", "2026-12-07"]);
    expect(s().milestones.streak_3).toBe("2026-12-07");
  });

  it("skip-month records a skip and adds no instalment", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(true);
    expect(s().skippedMonths).toEqual(["2026-11"]);
    expect(s().instalments).toHaveLength(1);
  });

  it("rejects an invalid trade without changing state", () => {
    const r = s().trade({ symbol: "TCS.NS", side: "buy", qty: 1000, price: 4000 }, false);
    expect(r.ok).toBe(false);
    expect(s().cash).toBe(10000);
    expect(s().transactions).toHaveLength(0);
  });

  it("a valid buy earns first_mock_buy", () => {
    expect(s().trade({ symbol: "TCS.NS", side: "buy", qty: 1, price: 4000 }, false)).toEqual({ ok: true });
    expect(s().cash).toBe(6000);
    expect(s().milestones.first_mock_buy).toBeDefined();
  });

  it("completeLesson is idempotent", () => {
    s().completeLesson("mutual-funds-sip", true);
    s().completeLesson("mutual-funds-sip", false);
    expect(s().lessons["mutual-funds-sip"].quizCorrect).toBe(true);
  });

  it("reset after time travel returns to real today and clears instalments", () => {
    s().startSip({ category: "index", symbol: "MF120716", amount: 100, day: 7 });
    s().advanceMonth(false);
    s().reset();
    expect(s().clockOffsetDays).toBe(0);
    expect(s().instalments).toEqual([]);
    expect(s().sipPlan).toBeNull();
  });

  it("discards persisted state from an older schema version", async () => {
    localStorage.setItem(mod.STORE_KEY, JSON.stringify({ state: { cash: "oops", answers: 42 }, version: 0 }));
    await mod.useApp.persist.rehydrate();
    expect(s().cash).toBe(10000);
    expect(s().answers).toBeNull();
  });

  it("survives corrupted JSON in storage", async () => {
    localStorage.setItem(mod.STORE_KEY, "{not json");
    await mod.useApp.persist.rehydrate();
    expect(s().cash).toBe(10000);
  });
});
```

- [ ] **Step 2: Run it to check it fails**

Run: `npx vitest run lib/store`
Expected: FAIL, `Cannot find module './index'`.

- [ ] **Step 3: Implement** `groww-start/lib/store/index.ts`

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toISTDate, dateInMonth, monthKey, nextMonthKey, daysBetween } from "@/lib/engine/dates";
import { applyTrade, type Txn } from "@/lib/engine/portfolio";
import { computeStreak } from "@/lib/engine/streak";
import { dueInstalments, type Instalment, type SipPlan } from "@/lib/engine/instalments";
import { evaluateMilestones, type MilestoneKey } from "@/lib/engine/milestones";
import { GOAL_DEFAULTS, PRESET_ANSWERS, type Answers, type PersonaId } from "@/lib/engine/persona";

export const STORE_KEY = "groww-genz";
export const STORE_VERSION = 1;
export const START_CASH = 10000;

export interface GoalInfo { name: string; target: number }
export interface Reflection { prompt: string; answer: string; date: string }
export interface LessonDone { quizCorrect: boolean; completedAt: string }

export interface AppData {
  answers: Answers | null;
  goal: GoalInfo | null;
  lessons: Record<string, LessonDone>;
  cash: number;
  transactions: Txn[];
  reflections: Reflection[];
  timeMachineRuns: number;
  sipPlan: SipPlan | null;
  instalments: Instalment[];
  skippedMonths: string[];
  milestones: Partial<Record<MilestoneKey, string>>;
  clockOffsetDays: number;
  newMilestone: MilestoneKey | null;
}

export interface AppActions {
  setOnboarding(answers: Answers, goal: GoalInfo): void;
  completeLesson(id: string, quizCorrect: boolean): void;
  recordTimeMachineRun(): void;
  trade(t: { symbol: string; side: "buy" | "sell"; qty: number; price: number }, fractional: boolean): { ok: true } | { ok: false; error: string };
  addReflection(prompt: string, answer: string): void;
  startSip(p: Omit<SipPlan, "startDate">): void;
  advanceMonth(skipSip: boolean): void;
  applyPreset(id: PersonaId): void;
  dismissMilestone(): void;
  reset(): void;
}

export type AppState = AppData & AppActions;

export const initialData: AppData = {
  answers: null, goal: null, lessons: {}, cash: START_CASH, transactions: [], reflections: [], timeMachineRuns: 0,
  sipPlan: null, instalments: [], skippedMonths: [], milestones: {}, clockOffsetDays: 0, newMilestone: null,
};

export function todayFor(offsetDays: number, now: Date = new Date()): string {
  return toISTDate(new Date(now.getTime() + offsetDays * 86_400_000));
}

function settle(s: AppData): Partial<AppData> {
  const today = todayFor(s.clockOffsetDays);
  const fresh = evaluateMilestones({
    lessonsCompleted: Object.keys(s.lessons).length,
    timeMachineRuns: s.timeMachineRuns,
    mockBuys: s.transactions.filter((t) => t.side === "buy").length,
    instalments: s.instalments.length,
    streak: computeStreak(s.instalments.map((i) => i.date), today).current,
  }, s.milestones, today);
  const keys = Object.keys(fresh) as MilestoneKey[];
  if (keys.length === 0) return {};
  return { milestones: { ...s.milestones, ...fresh }, newMilestone: keys[keys.length - 1] };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const update = (patch: Partial<AppData>) => {
        set(patch);
        set(settle(get()));
      };
      const today = () => todayFor(get().clockOffsetDays);
      return {
        ...initialData,
        setOnboarding: (answers, goal) => update({ answers, goal }),
        completeLesson: (id, quizCorrect) => {
          if (get().lessons[id]) return;
          update({ lessons: { ...get().lessons, [id]: { quizCorrect, completedAt: today() } } });
        },
        recordTimeMachineRun: () => update({ timeMachineRuns: get().timeMachineRuns + 1 }),
        trade: (t, fractional) => {
          const s = get();
          const r = applyTrade({ cash: s.cash, transactions: s.transactions }, { ...t, id: crypto.randomUUID(), date: today() }, { fractional });
          if (!r.ok) return r;
          update(r.state);
          return { ok: true };
        },
        addReflection: (prompt, answer) => update({ reflections: [...get().reflections, { prompt, answer, date: today() }] }),
        startSip: (p) => {
          if (get().sipPlan) return;
          const plan: SipPlan = { ...p, startDate: today() };
          update({ sipPlan: plan, instalments: dueInstalments(plan, [], [], plan.startDate) });
        },
        advanceMonth: (skipSip) => {
          const s = get();
          const cur = today();
          const day = s.sipPlan?.day ?? Number(cur.slice(8, 10));
          const next = dateInMonth(nextMonthKey(monthKey(cur)), day);
          const skippedMonths = skipSip && s.sipPlan ? [...s.skippedMonths, monthKey(next)] : s.skippedMonths;
          const extra = s.sipPlan ? dueInstalments(s.sipPlan, s.instalments, skippedMonths, next) : [];
          update({ clockOffsetDays: s.clockOffsetDays + daysBetween(cur, next), skippedMonths, instalments: [...s.instalments, ...extra] });
        },
        applyPreset: (id) => update({ answers: PRESET_ANSWERS[id], goal: GOAL_DEFAULTS[PRESET_ANSWERS[id].goal] }),
        dismissMilestone: () => set({ newMilestone: null }),
        reset: () => set({ ...initialData }),
      };
    },
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({ ...initialData }) as AppState,
    },
  ),
);

export const useToday = () => useApp((s) => todayFor(s.clockOffsetDays));
```

`groww-start/lib/store/use-hydrated.ts`:

```ts
"use client";
import { useEffect, useState } from "react";
import { useApp } from "./index";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useApp.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useApp.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}
```

- [ ] **Step 4: Run the test to check it passes**

Run: `npx vitest run lib/store`
Expected: PASS (10 tests). If the corrupted-JSON test throws instead of passing, wrap the storage so bad JSON reads as
empty:

```ts
storage: createJSONStorage(() => ({
  getItem: (k) => { const v = localStorage.getItem(k); try { if (v) JSON.parse(v); return v; } catch { return null; } },
  setItem: (k, v) => localStorage.setItem(k, v),
  removeItem: (k) => localStorage.removeItem(k),
})),
```

Then re-run and expect PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(store): persisted app store with milestones, SIP clock and safe rehydrate"
```

---

### Task 10: App chrome, home, journey hub, demo panel, milestone toast

**Files:**
- Create: `groww-start/lib/journey.ts`, `groww-start/lib/journey.test.ts`, `groww-start/lib/share.ts`, `groww-start/lib/share.test.ts`,
  `groww-start/components/app-chrome.tsx`, `groww-start/components/demo-panel.tsx`, `groww-start/components/milestone-toast.tsx`,
  `groww-start/app/page.tsx`, `groww-start/app/journey/page.tsx`
- Modify: `groww-start/app/layout.tsx`

**Interfaces:**
- Consumes: `useApp`, `useHydrated`, `useToday`, `personaFor`, `MILESTONES`, `computeStreak`
- Produces:
  - `journeyStatus(s: {lessons; sipPlan; milestones}): {lessonsDone; practiceUnlocked; investUnlocked; hasSip; shareUnlocked}`
  - `FIRST_LESSON_ID = "mutual-funds-sip"`
  - `ShareStats {milestone: MilestoneKey | null; streak; lessons; persona?: PersonaId}`
  - `shareHref(key: MilestoneKey, stats: Omit<ShareStats, "milestone">): string`
  - `parseShareParams(params: Record<string, string | undefined>, key: string): ShareStats`
  - `cardLines(stats: ShareStats): {headline; sub; chips: string[]}`
  - `useShareHref(key: MilestoneKey): string`, in `components/milestone-toast.tsx`

- [ ] **Step 1: Write the failing tests**

`groww-start/lib/journey.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { journeyStatus } from "./journey";

describe("journeyStatus", () => {
  it("locks practice and invest until lesson 1 is done", () => {
    expect(journeyStatus({ lessons: {}, sipPlan: null, milestones: {} })).toEqual({
      lessonsDone: 0, practiceUnlocked: false, investUnlocked: false, hasSip: false, shareUnlocked: false,
    });
  });
  it("unlocks after lesson 1 and share after any milestone", () => {
    const r = journeyStatus({
      lessons: { "mutual-funds-sip": { quizCorrect: true, completedAt: "2026-10-07" } },
      sipPlan: null,
      milestones: { first_lesson: "2026-10-07" },
    });
    expect(r).toMatchObject({ lessonsDone: 1, practiceUnlocked: true, investUnlocked: true, shareUnlocked: true });
  });
});
```

`groww-start/lib/share.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { shareHref, parseShareParams, cardLines } from "./share";

describe("share", () => {
  it("builds an href with only habit stats", () => {
    expect(shareHref("streak_3", { streak: 3, lessons: 2, persona: "steady-starter" }))
      .toBe("/share/streak_3?streak=3&lessons=2&persona=steady-starter");
  });
  it("sanitises params", () => {
    expect(parseShareParams({ streak: "-5", lessons: "abc", persona: "hacker" }, "nope"))
      .toEqual({ milestone: null, streak: 0, lessons: 0, persona: undefined });
    expect(parseShareParams({ streak: "99999" }, "first_sip").streak).toBe(999);
  });
  it("never puts rupee amounts on the card", () => {
    const lines = cardLines({ milestone: "first_sip", streak: 3, lessons: 3, persona: "steady-starter" });
    expect(JSON.stringify(lines)).not.toMatch(/₹|%|\bRs\b/);
    expect(lines.headline).toBe("First investment");
    expect(lines.chips).toEqual(["3-month SIP streak", "3 lessons", "Steady Starter"]);
  });
  it("has a generic card for unknown milestones", () => {
    expect(cardLines({ milestone: null, streak: 0, lessons: 0 }).headline).toBe("Started my investing journey");
  });
});
```

- [ ] **Step 2: Run them to check they fail**

Run: `npx vitest run lib/journey.test.ts lib/share.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement** `groww-start/lib/journey.ts` and `groww-start/lib/share.ts`

```ts
// lib/journey.ts
import type { AppData } from "@/lib/store";

export const FIRST_LESSON_ID = "mutual-funds-sip";

export function journeyStatus(s: Pick<AppData, "lessons" | "sipPlan" | "milestones">) {
  const practiceUnlocked = Boolean(s.lessons[FIRST_LESSON_ID]);
  return {
    lessonsDone: Object.keys(s.lessons).length,
    practiceUnlocked,
    investUnlocked: practiceUnlocked,
    hasSip: s.sipPlan !== null,
    shareUnlocked: Object.keys(s.milestones).length > 0,
  };
}
```

```ts
// lib/share.ts
import { MILESTONES, type MilestoneKey } from "@/lib/engine/milestones";
import type { PersonaId } from "@/lib/engine/persona";

export interface ShareStats { milestone: MilestoneKey | null; streak: number; lessons: number; persona?: PersonaId }

const PERSONA_TITLES: Record<PersonaId, string> = {
  "steady-starter": "Steady Starter", "curious-explorer": "Curious Explorer", "goal-saver": "Goal Saver",
};

export function shareHref(key: MilestoneKey, stats: Omit<ShareStats, "milestone">): string {
  const q = new URLSearchParams({ streak: String(stats.streak), lessons: String(stats.lessons) });
  if (stats.persona) q.set("persona", stats.persona);
  return `/share/${key}?${q.toString()}`;
}

const clampInt = (v: string | undefined) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(999, Math.max(0, n)) : 0;
};

export function parseShareParams(params: Record<string, string | undefined>, key: string): ShareStats {
  const persona = params.persona && params.persona in PERSONA_TITLES ? (params.persona as PersonaId) : undefined;
  return {
    milestone: key in MILESTONES ? (key as MilestoneKey) : null,
    streak: clampInt(params.streak),
    lessons: clampInt(params.lessons),
    persona,
  };
}

export function cardLines(s: ShareStats): { headline: string; sub: string; chips: string[] } {
  const chips: string[] = [];
  if (s.streak > 0) chips.push(`${s.streak}-month SIP streak`);
  if (s.lessons > 0) chips.push(`${s.lessons} lesson${s.lessons === 1 ? "" : "s"}`);
  if (s.persona) chips.push(PERSONA_TITLES[s.persona]);
  if (!s.milestone) return { headline: "Started my investing journey", sub: "Learning, practising, building the habit.", chips };
  const m = MILESTONES[s.milestone];
  return { headline: m.title, sub: m.description, chips };
}
```

- [ ] **Step 4: Run them to check they pass**

Run: `npx vitest run lib/journey.test.ts lib/share.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Build the chrome, demo panel and toast**

`groww-start/components/milestone-toast.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useApp, useToday } from "@/lib/store";
import { MILESTONES, type MilestoneKey } from "@/lib/engine/milestones";
import { computeStreak } from "@/lib/engine/streak";
import { personaFor } from "@/lib/engine/persona";
import { shareHref } from "@/lib/share";

export function useShareHref(key: MilestoneKey): string {
  const today = useToday();
  const instalments = useApp((s) => s.instalments);
  const lessons = useApp((s) => Object.keys(s.lessons).length);
  const answers = useApp((s) => s.answers);
  return shareHref(key, {
    streak: computeStreak(instalments.map((i) => i.date), today).current,
    lessons,
    persona: answers ? personaFor(answers).id : undefined,
  });
}

export function MilestoneToast() {
  const key = useApp((s) => s.newMilestone);
  const dismiss = useApp((s) => s.dismissMilestone);
  const href = useShareHref(key ?? "first_lesson");
  // Auto-dismiss so the toast never blocks the page's own buttons for long
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, [key, dismiss]);
  if (!key) return null;
  const m = MILESTONES[key];
  return (
    <div role="status" data-testid="milestone-toast" className="fixed inset-x-0 top-16 z-40 mx-auto flex max-w-[400px] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-lg">
      <span className="text-2xl" aria-hidden>{m.emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">Milestone: {m.title}</p>
        <p className="text-xs text-white/70">{m.description}</p>
      </div>
      <Link href={href} onClick={dismiss} className="text-sm font-semibold text-groww">Share</Link>
      <button onClick={dismiss} aria-label="Dismiss" className="px-1 text-white/60">✕</button>
    </div>
  );
}
```

`groww-start/components/demo-panel.tsx`:

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { useApp, useToday } from "@/lib/store";
import { formatDate } from "@/lib/format";
import type { PersonaId } from "@/lib/engine/persona";

export function DemoPanel({ onClose }: { onClose: () => void }) {
  const today = useToday();
  const hasSip = useApp((s) => s.sipPlan !== null);
  const { reset, applyPreset, advanceMonth } = useApp.getState();
  const presets: [PersonaId, string][] = [["steady-starter", "Steady Starter"], ["curious-explorer", "Curious Explorer"], ["goal-saver", "Goal Saver"]];
  return (
    <div data-testid="demo-panel" className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-2xl border bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">Demo controls</p>
        <span className="text-xs text-muted-ink">Demo date: {formatDate(today)}</span>
        <button onClick={onClose} aria-label="Close demo controls">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => advanceMonth(false)} disabled={!hasSip}>+1 month</Button>
        <Button variant="outline" onClick={() => advanceMonth(true)} disabled={!hasSip}>+1 month (skip SIP)</Button>
        {presets.map(([id, label]) => (
          <Button key={id} variant="outline" onClick={() => applyPreset(id)}>Persona: {label}</Button>
        ))}
        <Button variant="destructive" onClick={() => { reset(); location.assign("/"); }}>Reset demo</Button>
      </div>
      {!hasSip && <p className="mt-2 text-xs text-muted-ink">Start a SIP to unlock time travel.</p>}
    </div>
  );
}
```

`groww-start/components/app-chrome.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DemoPanel } from "./demo-panel";
import { MilestoneToast } from "./milestone-toast";
import { useHydrated } from "@/lib/store/use-hydrated";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const [demoOpen, setDemoOpen] = useState(false);
  const taps = useRef<number[]>([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") setDemoOpen(true);
  }, []);

  const onLogoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) { taps.current = []; setDemoOpen(true); }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={onLogoTap} className="text-xl font-bold tracking-tight text-groww-dark" aria-label="Groww">Groww</button>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase text-muted-ink">Concept demo</span>
        </div>
        <Link href="/journey" className="text-sm font-medium text-groww-dark">My journey</Link>
      </header>
      <main className="pb-24">{hydrated ? children : <div className="p-6 text-sm text-muted-ink">Loading…</div>}</main>
      {hydrated && <MilestoneToast />}
      {demoOpen && <DemoPanel onClose={() => setDemoOpen(false)} />}
    </>
  );
}
```

In `groww-start/app/layout.tsx`, wrap `{children}` with `<AppChrome>`:

```tsx
import { AppChrome } from "@/components/app-chrome";
// ...
<div className="mx-auto min-h-dvh max-w-[430px] bg-white shadow-sm"><AppChrome>{children}</AppChrome></div>
```

- [ ] **Step 6: Build the home page and journey hub**

`groww-start/app/page.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";

const EXPLORE = ["Stocks", "Mutual Funds", "ETFs", "IPO", "FDs", "Gold"];

export default function Home() {
  const started = useApp((s) => s.answers !== null);
  return (
    <div className="space-y-6 p-4">
      <div className="rounded-xl border px-4 py-3 text-sm text-muted-ink">🔍 Search Groww…</div>

      <Link href={started ? "/journey" : "/start"} className="block rounded-2xl bg-gradient-to-br from-groww to-groww-dark p-5 text-white shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{started ? "Your beginner journey" : "New to investing?"}</p>
        <p className="mt-1 text-xl font-bold">{started ? "Continue where you left off →" : "Start here →"}</p>
        <p className="mt-2 text-sm text-white/85">Learn in 2-minute lessons, practise with virtual money, then start with just ₹100.</p>
      </Link>

      <section>
        <h2 className="mb-3 font-semibold">Explore</h2>
        <div className="grid grid-cols-3 gap-3">
          {EXPLORE.map((e) => (
            <div key={e} className="rounded-xl border p-3 text-center text-sm text-ink opacity-60">{e}</div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-ink">Rest of the Groww app is out of scope for this concept.</p>
      </section>
    </div>
  );
}
```

`groww-start/app/journey/page.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { journeyStatus } from "@/lib/journey";
import { personaFor } from "@/lib/engine/persona";

export default function JourneyPage() {
  const state = useApp();
  const j = journeyStatus(state);
  const persona = state.answers ? personaFor(state.answers) : null;
  const steps = [
    { n: 1, title: "Learn", desc: `${j.lessonsDone}/3 bite-sized lessons`, href: "/learn", locked: false, done: j.lessonsDone >= 1 },
    { n: 2, title: "Practice", desc: "Virtual money + Time Machine", href: "/practice", locked: !j.practiceUnlocked, done: state.timeMachineRuns > 0 },
    { n: 3, title: "Invest", desc: "Start Small from ₹100/month", href: "/invest", locked: !j.investUnlocked, done: j.hasSip },
    { n: 4, title: "Build", desc: "Streaks, milestones, your goal", href: "/progress", locked: false, done: false },
    { n: 5, title: "Share", desc: "Celebrate milestones (no ₹ shown)", href: "/progress#milestones", locked: !j.shareUnlocked, done: false },
  ];
  return (
    <div className="space-y-4 p-4">
      {persona ? (
        <div className="rounded-2xl bg-groww/10 p-4">
          <p className="text-xs uppercase text-groww-dark">You're a</p>
          <p className="text-lg font-bold">{persona.title}</p>
          <p className="text-sm text-muted-ink">{persona.tagline}</p>
        </div>
      ) : (
        <Link href="/start" className="block rounded-2xl border p-4 text-sm">Take the 1-minute quiz to personalise your path →</Link>
      )}
      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.n}>
            <Link href={s.locked ? "#" : s.href} aria-disabled={s.locked}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${s.locked ? "pointer-events-none opacity-50" : ""}`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${s.done ? "bg-groww text-white" : "bg-neutral-100"}`}>
                {s.done ? "✓" : s.locked ? "🔒" : s.n}
              </span>
              <span className="flex-1"><span className="block font-semibold">{s.title}</span><span className="text-sm text-muted-ink">{s.desc}</span></span>
              <span aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 7: Check in the browser**

Run `npm run dev` and open http://localhost:3000 at a 390px width.
Expected:
- The home page shows the "Start here" card.
- `/journey` shows Practice and Invest as 🔒.
- `/?demo=1` opens the demo panel with time travel disabled.
- Tapping "Groww" 5 times opens the panel.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(ui): Groww shell, home, journey hub, demo controls and milestone toast"
```

---

### Task 11: Onboarding (5 questions → goal → persona)

**Files:**
- Create: `groww-start/app/start/page.tsx`

**Interfaces:**
- Consumes: `useApp().setOnboarding`, `personaFor`, `GOAL_DEFAULTS`, the `Answers` types, `FIRST_LESSON_ID`
- Produces: the route `/start`, which ends on a persona screen with `data-testid="persona-title"`, a "Start lesson 1"
  link and a "See my journey" link.

- [ ] **Step 1: Implement** `groww-start/app/start/page.tsx`

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { GOAL_DEFAULTS, personaFor, type Answers } from "@/lib/engine/persona";
import { FIRST_LESSON_ID } from "@/lib/journey";

const QUESTIONS: { key: keyof Answers; title: string; options: [string, string][] }[] = [
  { key: "goal", title: "What are you investing for?", options: [["emergency", "🛟 Emergency fund"], ["trip", "✈️ A trip or gadget"], ["studies", "🎓 Higher studies"], ["wealth", "🌱 Long-term wealth"], ["learning", "🤓 Just want to learn"]] },
  { key: "experience", title: "Have you invested before?", options: [["never", "Never"], ["fd", "FD or RD"], ["mf", "Mutual funds / SIP"], ["stocks", "Stocks"]] },
  { key: "budget", title: "How much can you set aside each month without stress?", options: [["100-500", "₹100 – ₹500"], ["500-2k", "₹500 – ₹2,000"], ["2k-5k", "₹2,000 – ₹5,000"], ["5k+", "₹5,000+"]] },
  { key: "reaction", title: "Your ₹1,000 becomes ₹800 in a month. You…", options: [["sell", "😬 Sell before it falls more"], ["wait", "🧘 Wait it out"], ["buy", "🛒 Buy a little more"]] },
  { key: "horizon", title: "When will you need this money?", options: [["lt1", "Within a year"], ["1to3", "In 1–3 years"], ["3plus", "3+ years from now"]] },
];

export default function StartPage() {
  const setOnboarding = useApp((s) => s.setOnboarding);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const total = QUESTIONS.length + 1;

  const choose = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value } as Partial<Answers>;
    setAnswers(next);
    if (key === "goal") {
      const d = GOAL_DEFAULTS[value as Answers["goal"]];
      setGoalName(d.name);
      setGoalTarget(String(d.target));
    }
    setStep(step + 1);
  };

  if (step === total) {
    const p = personaFor(answers as Answers);
    return (
      <div className="space-y-5 p-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-groww to-groww-dark p-6 text-white">
          <p className="text-sm text-white/80">You're a</p>
          <p data-testid="persona-title" className="text-2xl font-bold">{p.title}</p>
          <p className="mt-2 text-sm text-white/90">{p.tagline}</p>
        </motion.div>
        <div>
          <p className="mb-2 font-semibold">Your 3-step path</p>
          <ol className="space-y-2">
            {p.path.map((s, i) => (
              <li key={s} className="flex gap-3 rounded-xl border p-3 text-sm"><span className="font-bold text-groww-dark">{i + 1}</span>{s}</li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-muted-ink">This is a learning path, not investment advice. No risk score, no KYC needed yet.</p>
        <Button asChild className="w-full"><Link href={`/learn/${FIRST_LESSON_ID}`}>Start lesson 1</Link></Button>
        <Button asChild variant="ghost" className="w-full"><Link href="/journey">See my journey</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6 h-1.5 w-full rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-groww transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      {step < QUESTIONS.length ? (
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-xs text-muted-ink">Question {step + 1} of {QUESTIONS.length}</p>
          <h1 className="mb-5 mt-1 text-xl font-bold">{QUESTIONS[step].title}</h1>
          <div className="space-y-3">
            {QUESTIONS[step].options.map(([value, label]) => (
              <button key={value} onClick={() => choose(QUESTIONS[step].key, value)}
                className="w-full rounded-xl border p-4 text-left font-medium hover:border-groww hover:bg-groww/5">{label}</button>
            ))}
          </div>
        </motion.div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setOnboarding(answers as Answers, { name: goalName.trim() || "My goal", target: Math.max(100, Number(goalTarget) || 5000) });
          setStep(total);
        }}>
          <h1 className="text-xl font-bold">Name your first goal</h1>
          <label className="block text-sm">Goal<Input value={goalName} onChange={(e) => setGoalName(e.target.value)} maxLength={40} /></label>
          <label className="block text-sm">Target (₹)<Input inputMode="numeric" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value.replace(/\D/g, ""))} /></label>
          <Button type="submit" className="w-full">Save my goal</Button>
        </form>
      )}
      {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-sm text-muted-ink">← Back</button>}
    </div>
  );
}
```

- [ ] **Step 2: Check in the browser**

Run `npm run dev` and open `/start`. Answer: Long-term wealth → FD or RD → ₹500 – ₹2,000 → Wait it out → 3+ years →
Save my goal.
Expected:
- The result is "Steady Starter".
- The goal input was prefilled with "Long-term wealth" and 100000.
- `/journey` now shows the persona card.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(onboarding): 5-question quiz, goal, persona result"
```

---

### Task 12: Lessons (content, validation, player, glossary)

**Files:**
- Create: `groww-start/content/lessons/mutual-funds-sip.json`, `groww-start/content/lessons/index-funds.json`,
  `groww-start/content/lessons/ups-and-downs.json`, `groww-start/content/glossary.json`, `groww-start/lib/content/schema.ts`,
  `groww-start/lib/content/index.ts`, `groww-start/lib/content/content.test.ts`,
  `groww-start/components/learn/rich-text.tsx`, `groww-start/components/learn/lesson-player.tsx`,
  `groww-start/components/charts/price-chart.tsx`, `groww-start/app/learn/page.tsx`, `groww-start/app/learn/[lessonId]/page.tsx`

**Interfaces:**
- Consumes: `useApp().completeLesson`, `useHistory`, `FIRST_LESSON_ID`
- Produces:
  - `Lesson`, `Card` types
  - `LESSONS: Lesson[]` (sorted by `order`), `getLesson(id)`
  - `GLOSSARY: Record<string, {term; short}>`, `glossaryRefs(text): string[]`
  - `<RichText text>`, which renders `[[key|Label]]` as a tappable glossary term
  - `<PriceChart points height?>`
  - `/learn` and `/learn/[lessonId]` routes. The player has buttons named "Next" and "Finish lesson", and the done
    screen shows "Practice unlocked" for lesson 1.

- [ ] **Step 1: Write the content**

`groww-start/content/glossary.json`:

```json
{
  "nav": { "term": "NAV", "short": "Net Asset Value: the price of one unit of a mutual fund, updated once a day after markets close." },
  "sip": { "term": "SIP", "short": "Systematic Investment Plan: an automatic, fixed investment on the same date every month (or week)." },
  "index_fund": { "term": "Index fund", "short": "A fund that copies a market index like the Nifty 50 instead of a manager picking stocks." },
  "expense_ratio": { "term": "Expense ratio", "short": "The yearly fee a fund charges, as a % of your money. Lower means more stays with you." },
  "returns": { "term": "Returns", "short": "How much your investment grew or shrank. Past returns never guarantee future returns." }
}
```

`groww-start/content/lessons/mutual-funds-sip.json`:

```json
{
  "id": "mutual-funds-sip", "order": 1, "title": "What's a mutual fund & SIP?", "minutes": 2,
  "cards": [
    { "type": "text", "emoji": "🧺", "title": "A mutual fund is a shared basket", "body": "Lakhs of people pool their money. A professional manager buys many stocks or bonds with it. You own a slice of the whole basket, not one company." },
    { "type": "text", "emoji": "🏷️", "title": "The price of a slice is its [[nav|NAV]]", "body": "If NAV is ₹50 and you invest ₹100, you get 2 units. A higher NAV doesn't mean 'expensive'. It's just the price of a slice." },
    { "type": "text", "emoji": "🔁", "title": "A [[sip|SIP]] is investing on autopilot", "body": "Pick an amount, like ₹100, and a date. It gets invested every month. No timing the market, no daily decisions." },
    { "type": "text", "emoji": "⚖️", "title": "Why SIPs suit beginners", "body": "When prices fall, your ₹100 buys more units. When they rise, fewer. Over time this averages out your cost. It's called rupee cost averaging." },
    { "type": "quiz", "question": "NAV is ₹25 and your SIP is ₹100. How many units do you get?", "options": ["2", "4", "25"], "answer": 1, "explanation": "₹100 ÷ ₹25 = 4 units. Next month's NAV decides next month's units." }
  ]
}
```

`groww-start/content/lessons/index-funds.json`:

```json
{
  "id": "index-funds", "order": 2, "title": "Index funds & the Nifty 50", "minutes": 2,
  "cards": [
    { "type": "text", "emoji": "📊", "title": "The Nifty 50 is India's top-50 scoreboard", "body": "It tracks 50 of the biggest companies on the NSE, like Reliance, HDFC Bank and Infosys. When people say 'the market is up', they often mean the Nifty." },
    { "type": "text", "emoji": "🪞", "title": "An [[index_fund|index fund]] simply copies it", "body": "No star manager picking stocks. The fund holds the same 50 companies in the same proportions. Simple, diversified, low-cost." },
    { "type": "chart", "title": "The Nifty 50 over 5 years", "body": "Real past data. Notice the dips, and that it kept going. Past performance doesn't guarantee future returns.", "symbol": "^NSEI" },
    { "type": "text", "emoji": "💸", "title": "A low [[expense_ratio|expense ratio]] means more stays with you", "body": "Index funds often charge around 0.1–0.3% a year, while many actively managed funds charge more. Small fees compound too." },
    { "type": "quiz", "question": "What does a Nifty 50 index fund do?", "options": ["Picks the 50 stocks a manager likes most", "Holds the same 50 companies as the Nifty 50", "Guarantees Nifty-level returns"], "answer": 1, "explanation": "It mirrors the index. Returns follow the market and are never guaranteed." }
  ]
}
```

`groww-start/content/lessons/ups-and-downs.json`:

```json
{
  "id": "ups-and-downs", "order": 3, "title": "Ups and downs are normal", "minutes": 2,
  "cards": [
    { "type": "text", "emoji": "🎢", "title": "Markets move in waves", "body": "Even strong markets fall 10–20% sometimes. In March 2020 the Nifty fell about 38% in a few weeks, then got back above its old high by the end of that year." },
    { "type": "text", "emoji": "🧘", "title": "Time is your superpower", "body": "Money you won't need for 5+ years can ride out dips. Money for next month's rent shouldn't be in stocks." },
    { "type": "text", "emoji": "🔁", "title": "Dips can actually help a SIP", "body": "Your fixed amount buys more units when prices are low. That's why stopping a SIP during a fall often hurts more than the fall itself." },
    { "type": "text", "emoji": "🚫", "title": "No one can predict the market", "body": "Not finfluencers, not apps, not us. Be wary of anyone promising guaranteed or 'sure-shot' [[returns|returns]]." },
    { "type": "quiz", "question": "Your SIP is down 8% this month and you need the money in 6 years. What's sensible?", "options": ["Stop the SIP and sell", "Keep the SIP going", "Move everything into one hot stock"], "answer": 1, "explanation": "With a long horizon, short dips are normal. Staying consistent is what builds wealth." }
  ]
}
```

- [ ] **Step 2: Write the failing test** at `groww-start/lib/content/content.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { LESSONS, getLesson, GLOSSARY, glossaryRefs } from "./index";
import { getInstrument } from "@/lib/market/instruments";

describe("content", () => {
  it("loads 3 lessons in order, each ending in a quiz", () => {
    expect(LESSONS.map((l) => l.id)).toEqual(["mutual-funds-sip", "index-funds", "ups-and-downs"]);
    for (const l of LESSONS) expect(l.cards[l.cards.length - 1].type).toBe("quiz");
  });
  it("every glossary reference exists", () => {
    for (const l of LESSONS) for (const c of l.cards) {
      const text = JSON.stringify(c);
      for (const key of glossaryRefs(text)) expect(GLOSSARY[key], `${l.id}: ${key}`).toBeDefined();
    }
  });
  it("chart cards reference curated instruments", () => {
    for (const l of LESSONS) for (const c of l.cards) if (c.type === "chart") expect(getInstrument(c.symbol)).toBeDefined();
  });
  it("getLesson returns undefined for unknown ids", () => {
    expect(getLesson("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run it to check it fails**

Run: `npx vitest run lib/content`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement the schema and loader**

`groww-start/lib/content/schema.ts`:

```ts
import { z } from "zod";

const TextCard = z.object({ type: z.literal("text"), emoji: z.string().optional(), title: z.string().min(1), body: z.string().min(1) });
const ChartCard = z.object({ type: z.literal("chart"), title: z.string(), body: z.string(), symbol: z.string() });
const QuizCard = z.object({
  type: z.literal("quiz"), question: z.string(), options: z.array(z.string()).min(2).max(4),
  answer: z.number().int().nonnegative(), explanation: z.string(),
}).refine((q) => q.answer < q.options.length, { message: "answer index out of range" });

export const CardSchema = z.union([TextCard, ChartCard, QuizCard]);
export const LessonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int(), title: z.string(), minutes: z.number(),
  cards: z.array(CardSchema).min(3),
});
export const GlossarySchema = z.record(z.string(), z.object({ term: z.string(), short: z.string() }));

export type Card = z.infer<typeof CardSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
```

`groww-start/lib/content/index.ts`:

```ts
import l1 from "@/content/lessons/mutual-funds-sip.json";
import l2 from "@/content/lessons/index-funds.json";
import l3 from "@/content/lessons/ups-and-downs.json";
import glossary from "@/content/glossary.json";
import { GlossarySchema, LessonSchema, type Lesson } from "./schema";

export type { Lesson, Card } from "./schema";

export const LESSONS: Lesson[] = [l1, l2, l3].map((l) => LessonSchema.parse(l)).sort((a, b) => a.order - b.order);
export const GLOSSARY = GlossarySchema.parse(glossary);
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

export const GLOSSARY_RE = /\[\[([a-z_]+)\|([^\]]+)\]\]/g;
export const glossaryRefs = (text: string) => [...text.matchAll(GLOSSARY_RE)].map((m) => m[1]);
```

- [ ] **Step 5: Run the test to check it passes**

Run: `npx vitest run lib/content`
Expected: PASS (4 tests).

- [ ] **Step 6: Build the UI**

`groww-start/components/charts/price-chart.tsx`:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import type { PricePoint } from "@/lib/types";

export function PriceChart({ points, height = 180 }: { points: PricePoint[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || points.length < 2) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#7c7e8c" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { borderVisible: false }, timeScale: { borderVisible: false },
      handleScroll: false, handleScale: false,
    });
    const up = points[points.length - 1].close >= points[0].close;
    const series = chart.addSeries(AreaSeries, {
      lineColor: up ? "#00b386" : "#eb5b3c", lineWidth: 2,
      topColor: up ? "rgba(0,179,134,0.25)" : "rgba(235,91,60,0.25)", bottomColor: "rgba(255,255,255,0)",
    });
    series.setData(points.map((p) => ({ time: p.date, value: p.close })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [points]);
  return <div ref={ref} style={{ height }} className="w-full" />;
}
```

`groww-start/components/learn/rich-text.tsx`:

```tsx
"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GLOSSARY, GLOSSARY_RE } from "@/lib/content";

export function RichText({ text }: { text: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(GLOSSARY_RE)) {
    parts.push(text.slice(last, m.index));
    const key = m[1];
    parts.push(
      <button key={`${key}-${m.index}`} onClick={() => setOpen(key)} className="underline decoration-groww decoration-dotted underline-offset-4">{m[2]}</button>,
    );
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push(text.slice(last));
  const entry = open ? GLOSSARY[open] : null;
  return (
    <>
      {parts}
      <Sheet open={!!entry} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="bottom" className="mx-auto max-w-[430px] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{entry?.term}</SheetTitle>
            <SheetDescription>{entry?.short}</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

`groww-start/components/learn/lesson-player.tsx`:

```tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { RichText } from "./rich-text";
import { PriceChart } from "@/components/charts/price-chart";
import { useHistory } from "@/lib/market/client";
import { useApp } from "@/lib/store";
import { FIRST_LESSON_ID } from "@/lib/journey";
import { LESSONS, type Card, type Lesson } from "@/lib/content";

function ChartCardView({ symbol }: { symbol: string }) {
  const { data } = useHistory(symbol);
  return data ? <PriceChart points={data.points} /> : <div className="h-[180px] animate-pulse rounded-xl bg-neutral-100" />;
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const completeLesson = useApp((s) => s.completeLesson);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const card: Card = lesson.cards[i];
  const isQuiz = card.type === "quiz";
  const canAdvance = !isQuiz || picked !== null;
  const next = () => { if (canAdvance && i < lesson.cards.length - 1) setI(i + 1); };

  if (done) {
    const nextLesson = LESSONS.find((l) => l.order === lesson.order + 1);
    return (
      <div className="space-y-4 p-6 text-center">
        <motion.p initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-5xl">✅</motion.p>
        <h1 className="text-xl font-bold">Lesson complete</h1>
        {lesson.id === FIRST_LESSON_ID && <p className="rounded-xl bg-groww/10 p-3 text-sm font-medium text-groww-dark">Practice unlocked: try it with virtual money</p>}
        <Button asChild className="w-full"><Link href={lesson.id === FIRST_LESSON_ID ? "/practice" : nextLesson ? `/learn/${nextLesson.id}` : "/journey"}>
          {lesson.id === FIRST_LESSON_ID ? "Go to Practice" : nextLesson ? "Next lesson" : "Back to my journey"}
        </Link></Button>
        <Button asChild variant="ghost" className="w-full"><Link href="/learn">All lessons</Link></Button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex gap-1">
        {lesson.cards.map((_, k) => <div key={k} className={`h-1.5 flex-1 rounded-full ${k <= i ? "bg-groww" : "bg-neutral-100"}`} />)}
      </div>
      <p className="text-xs text-muted-ink">{lesson.title} · {lesson.minutes} min</p>
      <AnimatePresence mode="wait">
        <motion.div key={i} drag={canAdvance ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => info.offset.x < -80 && next()}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          className="mt-3 min-h-[320px] rounded-2xl border p-5 shadow-sm">
          {card.type === "text" && (<>
            {card.emoji && <p className="text-4xl">{card.emoji}</p>}
            <h2 className="mt-3 text-lg font-bold"><RichText text={card.title} /></h2>
            <p className="mt-2 leading-relaxed text-ink"><RichText text={card.body} /></p>
          </>)}
          {card.type === "chart" && (<>
            <h2 className="text-lg font-bold">{card.title}</h2>
            <div className="my-3"><ChartCardView symbol={card.symbol} /></div>
            <p className="text-sm text-muted-ink">{card.body}</p>
          </>)}
          {card.type === "quiz" && (<>
            <p className="text-xs font-semibold uppercase text-groww-dark">Quick check</p>
            <h2 className="mt-1 text-lg font-bold">{card.question}</h2>
            <div className="mt-4 space-y-2">
              {card.options.map((o, k) => {
                const state = picked === null ? "" : k === card.answer ? "border-groww bg-groww/10" : k === picked ? "border-loss bg-loss/10" : "opacity-60";
                return <button key={o} disabled={picked !== null} onClick={() => setPicked(k)} className={`w-full rounded-xl border p-3 text-left ${state}`}>{o}</button>;
              })}
            </div>
            {picked !== null && <p className="mt-3 text-sm">{picked === card.answer ? "✅ Correct! " : "Not quite. "}{card.explanation}</p>}
          </>)}
        </motion.div>
      </AnimatePresence>
      <div className="mt-5">
        {i < lesson.cards.length - 1 ? (
          <Button className="w-full" onClick={next} disabled={!canAdvance}>Next</Button>
        ) : (
          <Button className="w-full" disabled={!canAdvance} onClick={() => {
            const last = lesson.cards[lesson.cards.length - 1];
            completeLesson(lesson.id, last.type === "quiz" && picked === last.answer);
            setDone(true);
          }}>Finish lesson</Button>
        )}
      </div>
    </div>
  );
}
```

`groww-start/app/learn/[lessonId]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/lib/content";
import { LessonPlayer } from "@/components/learn/lesson-player";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
```

`groww-start/app/learn/page.tsx`:

```tsx
"use client";
import Link from "next/link";
import { LESSONS } from "@/lib/content";
import { useApp } from "@/lib/store";

export default function LearnPage() {
  const done = useApp((s) => s.lessons);
  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-bold">Learn</h1>
      <p className="text-sm text-muted-ink">2-minute lessons, plain language, one quick check each.</p>
      {LESSONS.map((l) => (
        <Link key={l.id} href={`/learn/${l.id}`} className="flex items-center justify-between rounded-2xl border p-4">
          <span><span className="block font-semibold">{l.order}. {l.title}</span><span className="text-sm text-muted-ink">{l.minutes} min</span></span>
          <span>{done[l.id] ? "✅" : "›"}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Check in the browser**

Open `/learn/mutual-funds-sip`.
Expected:
- Tapping "NAV" opens a bottom sheet.
- "Next" moves through the cards, and swiping left also works.
- The quiz needs an answer before "Finish lesson" is enabled.
- The done screen says "Practice unlocked".
- A "First lesson" toast appears.
- In `index-funds`, the chart card renders the Nifty.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(learn): validated lesson content, card player and glossary sheet"
```

---

### Task 13: Practice — Time Machine

**Files:**
- Create: `groww-start/components/charts/sip-chart.tsx`, `groww-start/components/reflection-prompt.tsx`,
  `groww-start/components/practice/time-machine.tsx`, `groww-start/app/practice/page.tsx`

**Interfaces:**
- Consumes: `useHistory`, `sipReplay`, `INSTRUMENTS`, `useApp().recordTimeMachineRun`, `useApp().addReflection`,
  `addDays`, `formatINR`, `formatPct`, `personaFor`
- Produces:
  - `<SipChart series>`
  - `<ReflectionPrompt prompt onDone>`
  - `<TimeMachine>`, with a "Replay" button and `data-testid="tm-result"`
  - the `/practice` page with tabs "Time Machine" and "Mock portfolio". Task 14 adds the second tab's content.

- [ ] **Step 1: Implement the components**

`groww-start/components/charts/sip-chart.tsx`:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { createChart, LineSeries, ColorType, LineStyle } from "lightweight-charts";
import type { SipPoint } from "@/lib/engine/sip";

export function SipChart({ series, height = 200 }: { series: SipPoint[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || series.length < 2) return;
    const chart = createChart(ref.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#7c7e8c" },
      grid: { vertLines: { visible: false }, horzLines: { color: "#f0f0f0" } },
      rightPriceScale: { borderVisible: false }, timeScale: { borderVisible: false },
      handleScroll: false, handleScale: false,
    });
    chart.addSeries(LineSeries, { color: "#9ca3af", lineWidth: 2, lineStyle: LineStyle.Dashed, title: "Invested" })
      .setData(series.map((p) => ({ time: p.date, value: p.invested })));
    chart.addSeries(LineSeries, { color: "#00b386", lineWidth: 2, title: "Value" })
      .setData(series.map((p) => ({ time: p.date, value: p.value })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [series]);
  return <div ref={ref} style={{ height }} className="w-full" />;
}
```

`groww-start/components/reflection-prompt.tsx`:

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

const CHIPS = ["It's low-cost", "I know the company", "A friend mentioned it", "Just curious"];

export function ReflectionPrompt({ prompt, onDone }: { prompt: string; onDone: () => void }) {
  const addReflection = useApp((s) => s.addReflection);
  const [answer, setAnswer] = useState("");
  return (
    <div data-testid="reflection" className="space-y-3 rounded-2xl border border-groww/40 bg-groww/5 p-4">
      <p className="text-sm font-semibold">🪞 {prompt}</p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => <button key={c} onClick={() => setAnswer(c)} className={`rounded-full border px-3 py-1 text-xs ${answer === c ? "border-groww bg-groww/10" : ""}`}>{c}</button>)}
      </div>
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={200} rows={2}
        className="w-full rounded-xl border p-2 text-sm" placeholder="In your own words (optional)" />
      <div className="flex gap-2">
        <Button size="sm" disabled={!answer.trim()} onClick={() => { addReflection(prompt, answer.trim()); onDone(); }}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Skip</Button>
      </div>
    </div>
  );
}
```

`groww-start/components/practice/time-machine.tsx`:

```tsx
"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SipChart } from "@/components/charts/sip-chart";
import { ReflectionPrompt } from "@/components/reflection-prompt";
import { useHistory } from "@/lib/market/client";
import { INSTRUMENTS } from "@/lib/market/instruments";
import { sipReplay } from "@/lib/engine/sip";
import { addDays } from "@/lib/engine/dates";
import { personaFor } from "@/lib/engine/persona";
import { formatINR, formatPct, formatDate } from "@/lib/format";
import { useApp } from "@/lib/store";

const YEARS = [1, 2, 3, 5];
const OPTIONS = INSTRUMENTS.filter((i) => i.kind !== "index");

export function TimeMachine() {
  const answers = useApp((s) => s.answers);
  const runs = useApp((s) => s.timeMachineRuns);
  const recordRun = useApp((s) => s.recordTimeMachineRun);
  const [symbol, setSymbol] = useState("MF120716");
  const [amount, setAmount] = useState(answers ? personaFor(answers).suggestedAmount : 500);
  const [years, setYears] = useState(3);
  const [run, setRun] = useState<{ symbol: string; amount: number; years: number } | null>(null);
  const [reflect, setReflect] = useState(false);
  const { data, isLoading } = useHistory(run?.symbol ?? symbol);

  const result = useMemo(() => {
    if (!run || !data || data.symbol !== run.symbol || data.points.length < 2) return null;
    const endDate = data.points[data.points.length - 1].date;
    return sipReplay(data.points, { monthlyAmount: run.amount, startDate: addDays(endDate, -Math.round(365.25 * run.years)), endDate, sipDay: 1 });
  }, [run, data]);

  const name = OPTIONS.find((o) => o.symbol === (run?.symbol ?? symbol))?.name;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-ink">What if you'd started a SIP back then? Replay real past prices month by month.</p>
      <label className="block text-sm font-medium">Invest in
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 w-full rounded-xl border bg-white p-3">
          <optgroup label="Mutual funds">{OPTIONS.filter((o) => o.kind === "fund").map((o) => <option key={o.symbol} value={o.symbol}>{o.name}</option>)}</optgroup>
          <optgroup label="Stocks & ETFs">{OPTIONS.filter((o) => o.kind !== "fund").map((o) => <option key={o.symbol} value={o.symbol}>{o.name}</option>)}</optgroup>
        </select>
      </label>
      <div>
        <p className="text-sm font-medium">Every month: <span className="text-groww-dark">{formatINR(amount)}</span></p>
        <Slider min={100} max={2000} step={100} value={[amount]} onValueChange={([v]) => setAmount(v)} className="mt-3" />
      </div>
      <div className="flex gap-2">
        {YEARS.map((y) => (
          <button key={y} onClick={() => setYears(y)} className={`flex-1 rounded-full border py-2 text-sm ${years === y ? "border-groww bg-groww/10 font-semibold" : ""}`}>{y}y ago</button>
        ))}
      </div>
      <Button className="w-full" disabled={isLoading && !data} onClick={() => {
        setRun({ symbol, amount, years });
        if (runs === 0) setReflect(true);
        recordRun();
      }}>Replay</Button>

      {result && result.series.length > 0 && (
        <div data-testid="tm-result" className="space-y-3 rounded-2xl border p-4">
          <p className="text-sm text-muted-ink">{formatINR(run!.amount)}/month in {name}, since {formatDate(result.series[0].date)}</p>
          <div className="flex justify-between">
            <div><p className="text-xs text-muted-ink">You'd have invested</p><p className="text-lg font-bold">{formatINR(result.invested)}</p></div>
            <div className="text-right"><p className="text-xs text-muted-ink">Worth today</p>
              <p className={`text-lg font-bold ${result.finalValue >= result.invested ? "text-groww-dark" : "text-loss"}`}>{formatINR(result.finalValue)} ({formatPct(result.returnPct)})</p></div>
          </div>
          <SipChart series={result.series} />
          {result.worstDipPct < 0 && (
            <p className="rounded-xl bg-neutral-50 p-3 text-sm">📉 At its lowest you were down <b>{formatPct(result.worstDipPct)}</b>. People who kept their SIP going through dips like this one got the result above.</p>
          )}
          <p className="text-xs text-muted-ink">Real past data{data?.source === "snapshot" ? " (showing saved prices)" : ""}. Past performance doesn't guarantee future returns.</p>
        </div>
      )}
      {result && result.series.length === 0 && <p className="text-sm text-muted-ink">Not enough data for that period. Try a shorter one.</p>}
      {reflect && result && <ReflectionPrompt prompt="Why did you pick this one to replay?" onDone={() => setReflect(false)} />}
    </div>
  );
}
```

`groww-start/app/practice/page.tsx`:

```tsx
"use client";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeMachine } from "@/components/practice/time-machine";
import { useApp } from "@/lib/store";
import { journeyStatus } from "@/lib/journey";

export default function PracticePage() {
  const state = useApp();
  if (!journeyStatus(state).practiceUnlocked) {
    return (
      <div className="space-y-3 p-6 text-center">
        <p className="text-4xl">🔒</p>
        <p className="font-semibold">Finish lesson 1 to unlock Practice</p>
        <Link href="/learn/mutual-funds-sip" className="text-groww-dark underline">Start the 2-minute lesson</Link>
      </div>
    );
  }
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-bold">Practice</h1>
        <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">Virtual money · Prices delayed · Not a prediction</p>
      </div>
      <Tabs defaultValue="time-machine">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="time-machine">Time Machine</TabsTrigger>
          <TabsTrigger value="mock">Mock portfolio</TabsTrigger>
        </TabsList>
        <TabsContent value="time-machine" className="pt-3"><TimeMachine /></TabsContent>
        <TabsContent value="mock" className="pt-3"><p className="text-sm text-muted-ink">Coming in the next task.</p></TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 2: Check in the browser**

Open `/practice` after finishing lesson 1. Pick UTI Nifty 50, ₹500 and 3y ago, then tap Replay.
Expected:
- Invested ≈ ₹18,000 (36 or 37 months).
- A chart with a dashed "Invested" line and a green "Value" line.
- A worst-dip note, plus the reflection prompt on the first run.
- A "Time traveller" milestone toast.

Then stop the dev server's network (or point `fetchLive` at a bad URL temporarily) and check that the result still
renders with "(showing saved prices)". Revert the temporary change afterwards.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(practice): Time Machine SIP replay with chart and reflection"
```

---

### Task 14: Practice — Mock portfolio

**Files:**
- Create: `groww-start/components/practice/mock-portfolio.tsx`, `groww-start/components/practice/trade-sheet.tsx`
- Modify: `groww-start/app/practice/page.tsx` (the "mock" tab content)

**Interfaces:**
- Consumes: `useQuotes`, `holdings`, `heldQty`, `fundUnits`, `useApp().trade`, `INSTRUMENTS`, `ReflectionPrompt`, `formatINR`, `formatPct`
- Produces:
  - `<MockPortfolio>`, which has testids `instrument-{symbol}`, `holding-{symbol}` and `cash`
  - `<TradeSheet instrument price open onOpenChange onTraded>`, whose confirm button is named "Confirm buy" or "Confirm sell"

- [ ] **Step 1: Implement** `groww-start/components/practice/trade-sheet.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { fundUnits, heldQty } from "@/lib/engine/portfolio";
import type { Instrument } from "@/lib/market/instruments";
import { formatINR } from "@/lib/format";

interface Props { instrument: Instrument | null; price: number; open: boolean; onOpenChange: (o: boolean) => void; onTraded: (side: "buy" | "sell") => void }

export function TradeSheet({ instrument, price, open, onOpenChange, onTraded }: Props) {
  const trade = useApp((s) => s.trade);
  const cash = useApp((s) => s.cash);
  const txns = useApp((s) => s.transactions);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [input, setInput] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const isFund = instrument?.kind === "fund";

  useEffect(() => { setSide("buy"); setInput(isFund ? "500" : "1"); setError(null); }, [instrument, isFund]);
  if (!instrument) return null;

  const held = heldQty(txns, instrument.symbol);
  const qty = isFund && side === "buy" ? fundUnits(Number(input), price) : Number(input);
  const label = isFund ? (side === "buy" ? "Amount (₹)" : "Units") : "Shares";

  const submit = () => {
    const r = trade({ symbol: instrument.symbol, side, qty, price }, isFund);
    if (!r.ok) { setError(r.error); return; }
    onOpenChange(false);
    onTraded(side);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-[430px] space-y-4 rounded-t-2xl p-5">
        <SheetHeader className="p-0">
          <SheetTitle>{instrument.name}</SheetTitle>
          <SheetDescription>{isFund ? "NAV" : "Last close"} {formatINR(price, 2)} · virtual money</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2">
          {(["buy", "sell"] as const).map((s) => (
            <button key={s} onClick={() => { setSide(s); setInput(isFund && s === "buy" ? "500" : isFund ? String(held) : "1"); setError(null); }}
              disabled={s === "sell" && held <= 0}
              className={`rounded-xl border py-2 text-sm font-semibold capitalize disabled:opacity-40 ${side === s ? (s === "buy" ? "border-groww bg-groww/10" : "border-loss bg-loss/10") : ""}`}>{s}</button>
          ))}
        </div>
        <label className="block text-sm">{label}
          <Input inputMode="decimal" value={input} onChange={(e) => { setInput(e.target.value.replace(/[^\d.]/g, "")); setError(null); }} />
        </label>
        <p className="text-xs text-muted-ink">
          {isFund && side === "buy" ? `≈ ${qty} units` : `≈ ${formatINR(qty * price || 0, 2)}`} · Virtual cash {formatINR(cash, 2)}{held > 0 ? ` · You hold ${held}` : ""}
        </p>
        {error && <p role="alert" className="text-sm text-loss">{error}</p>}
        <Button className="w-full" variant={side === "sell" ? "destructive" : "default"} onClick={submit}>Confirm {side}</Button>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Implement** `groww-start/components/practice/mock-portfolio.tsx`

```tsx
"use client";
import { useMemo, useState } from "react";
import { TradeSheet } from "./trade-sheet";
import { ReflectionPrompt } from "@/components/reflection-prompt";
import { useQuotes } from "@/lib/market/client";
import { INSTRUMENTS, getInstrument, type Instrument } from "@/lib/market/instruments";
import { holdings } from "@/lib/engine/portfolio";
import { useApp } from "@/lib/store";
import { formatINR, formatPct } from "@/lib/format";

const UNIVERSE = INSTRUMENTS.filter((i) => i.kind !== "index");

export function MockPortfolio() {
  const cash = useApp((s) => s.cash);
  const txns = useApp((s) => s.transactions);
  const { data: quotes, isLoading } = useQuotes(UNIVERSE.map((i) => i.symbol));
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [reflect, setReflect] = useState(false);

  const prices = useMemo(() => Object.fromEntries((quotes ?? []).map((q) => [q.symbol, q.price])), [quotes]);
  const hs = holdings(txns, prices);
  const value = hs.reduce((a, h) => a + h.value, 0);
  const pnl = hs.reduce((a, h) => a + h.pnl, 0);
  const snapshot = quotes?.some((q) => q.source === "snapshot");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border p-3"><p className="text-xs text-muted-ink">Virtual cash</p><p data-testid="cash" className="font-bold">{formatINR(cash, 2)}</p></div>
        <div className="rounded-2xl border p-3"><p className="text-xs text-muted-ink">Holdings</p>
          <p className="font-bold">{formatINR(value, 2)} <span className={pnl >= 0 ? "text-groww-dark" : "text-loss"}>{pnl !== 0 && `(${pnl > 0 ? "+" : ""}${formatINR(pnl)})`}</span></p></div>
      </div>

      {reflect && <ReflectionPrompt prompt="Why did you pick this?" onDone={() => setReflect(false)} />}

      {hs.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Your practice holdings</h2>
          {hs.map((h) => (
            <button key={h.symbol} data-testid={`holding-${h.symbol}`} onClick={() => setSelected(getInstrument(h.symbol) ?? null)}
              className="flex w-full justify-between border-b py-2 text-left text-sm">
              <span>{getInstrument(h.symbol)?.short}<span className="block text-xs text-muted-ink">{h.qty} @ {formatINR(h.avgPrice, 2)}</span></span>
              <span className="text-right">{formatINR(h.value, 2)}<span className={`block text-xs ${h.pnl >= 0 ? "text-groww-dark" : "text-loss"}`}>{formatPct(h.pnlPct)}</span></span>
            </button>
          ))}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold">Pick something to practise with</h2>
        {isLoading && <p className="text-sm text-muted-ink">Loading prices…</p>}
        {UNIVERSE.map((i) => {
          const q = quotes?.find((x) => x.symbol === i.symbol);
          return (
            <button key={i.symbol} data-testid={`instrument-${i.symbol}`} disabled={!q} onClick={() => setSelected(i)}
              className="flex w-full items-center justify-between border-b py-3 text-left disabled:opacity-50">
              <span><span className="block text-sm font-medium">{i.name}</span><span className="text-xs text-muted-ink">{i.kind === "fund" ? "Mutual fund" : i.kind === "etf" ? "Gold ETF" : "Stock"}</span></span>
              {q && <span className="text-right text-sm">{formatINR(q.price, 2)}<span className={`block text-xs ${q.changePct >= 0 ? "text-groww-dark" : "text-loss"}`}>{formatPct(q.changePct)}</span></span>}
            </button>
          );
        })}
        <p className="mt-2 text-xs text-muted-ink">Last close / NAV{snapshot ? " (showing saved prices)" : ""}. Trades fill at these prices.</p>
      </section>

      <TradeSheet instrument={selected} price={selected ? prices[selected.symbol] ?? 0 : 0} open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onTraded={(side) => { if (side === "buy" && txns.filter((t) => t.side === "buy").length === 0) setReflect(true); }} />
    </div>
  );
}
```

- [ ] **Step 3: Wire up the tab** in `groww-start/app/practice/page.tsx`

Replace the mock tab placeholder:

```tsx
import { MockPortfolio } from "@/components/practice/mock-portfolio";
// ...
<TabsContent value="mock" className="pt-3"><MockPortfolio /></TabsContent>
```

- [ ] **Step 4: Check in the browser**

On the Mock portfolio tab:
- Tap Reliance, keep 1 share, and tap "Confirm buy". Expected: cash drops by the last close, a holding row appears,
  the reflection prompt shows, and a "First practice buy" toast appears.
- Try 1.5 shares. Expected: the inline error "Stocks can only be bought in whole shares".
- Buy ₹500 of the UTI Nifty fund, then sell all of its units. Expected: the holding disappears.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(practice): mock portfolio with trade sheet and holdings"
```

---

### Task 15: Invest — Start Small SIP flow

**Files:**
- Create: `groww-start/app/invest/page.tsx`

**Interfaces:**
- Consumes: `useApp().startSip`, `useApp().sipPlan`, `useApp().answers`, `personaFor`, `fundForCategory`, `useHistory`,
  `sipReplay`, `addDays`, `formatINR`
- Produces: the route `/invest`, with buttons "₹100", "₹250" and "₹500", then "Continue", then
  "Confirm with UPI (demo)", and a done screen showing "First investment done".

- [ ] **Step 1: Implement** `groww-start/app/invest/page.tsx`

```tsx
"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { journeyStatus } from "@/lib/journey";
import { personaFor } from "@/lib/engine/persona";
import { fundForCategory } from "@/lib/market/instruments";
import { useHistory } from "@/lib/market/client";
import { sipReplay } from "@/lib/engine/sip";
import { addDays } from "@/lib/engine/dates";
import { formatINR, formatDate } from "@/lib/format";

const AMOUNTS = [100, 250, 500] as const;
const DAYS = [1, 5, 10, 15, 20, 25];
const WHY: Record<"index" | "liquid", string> = {
  index: "A broad index fund is a common starting point: it spreads your money across India's 50 largest companies, has low fees and needs no stock-picking.",
  liquid: "For money you'll need within about a year, a liquid fund is a common choice: it aims for stability rather than growth, so short-term dips are small.",
};

export default function InvestPage() {
  const state = useApp();
  const persona = state.answers ? personaFor(state.answers) : null;
  const category = persona?.suggestedCategory ?? "index";
  const fund = fundForCategory(category);
  const [step, setStep] = useState<"amount" | "fund" | "date" | "review" | "done">("amount");
  const [amount, setAmount] = useState<number>(persona?.suggestedAmount ?? 100);
  const [day, setDay] = useState(5);
  const { data } = useHistory(fund.symbol);

  const pastFive = useMemo(() => {
    if (!data || data.points.length < 2) return null;
    const end = data.points[data.points.length - 1].date;
    return sipReplay(data.points, { monthlyAmount: amount, startDate: addDays(end, -1826), endDate: end, sipDay: day });
  }, [data, amount, day]);

  if (!journeyStatus(state).investUnlocked) {
    return <div className="p-6 text-center"><p className="text-4xl">🔒</p><p className="font-semibold">Finish lesson 1 first</p><Link className="text-groww-dark underline" href="/learn/mutual-funds-sip">Start lesson</Link></div>;
  }

  if (state.sipPlan && step !== "done") {
    const p = state.sipPlan;
    return (
      <div className="space-y-3 p-5">
        <h1 className="text-xl font-bold">Your SIP is running 🌱</h1>
        <div className="rounded-2xl border p-4 text-sm">
          <p><b>{formatINR(p.amount)}</b> every month on day {p.day}</p>
          <p className="text-muted-ink">{fundForCategory(p.category).name} · started {formatDate(p.startDate)}</p>
        </div>
        <Button asChild className="w-full"><Link href="/progress">See my progress</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <h1 className="text-xl font-bold">Start Small</h1>

      {step === "amount" && (<>
        <p className="text-sm text-muted-ink">Pick an amount you won't miss. You can pause or stop anytime.</p>
        <div className="space-y-2">
          {AMOUNTS.map((a) => (
            <button key={a} onClick={() => setAmount(a)} className={`flex w-full items-center justify-between rounded-xl border p-4 ${amount === a ? "border-groww bg-groww/10" : ""}`}>
              <span className="text-lg font-bold">{formatINR(a)}</span>
              <span className="text-xs text-muted-ink">{a === 250 ? "Chhoti SIP size" : a === 100 ? "Lowest to start" : "Build faster"} · per month</span>
            </button>
          ))}
        </div>
        <Button className="w-full" onClick={() => setStep("fund")}>Continue</Button>
      </>)}

      {step === "fund" && (<>
        <div className="rounded-2xl border p-4">
          <p className="text-xs uppercase text-muted-ink">A common starting point</p>
          <p className="mt-1 font-semibold">{fund.name}</p>
          <p className="mt-2 text-sm">{WHY[category]}</p>
        </div>
        {pastFive && pastFive.series.length > 0 && (
          <p className="rounded-xl bg-neutral-50 p-3 text-sm">If you'd done this over the last 5 years: {formatINR(pastFive.invested)} invested would be worth about <b>{formatINR(pastFive.finalValue)}</b> today.</p>
        )}
        <p className="text-xs text-muted-ink">This is education, not a recommendation. Everyone with your answers sees the same suggestion. Past performance doesn't guarantee future returns.</p>
        <Button className="w-full" onClick={() => setStep("date")}>Continue</Button>
      </>)}

      {step === "date" && (<>
        <p className="font-medium">Which day of the month?</p>
        <div className="grid grid-cols-3 gap-2">
          {DAYS.map((d) => <button key={d} onClick={() => setDay(d)} className={`rounded-xl border py-3 ${day === d ? "border-groww bg-groww/10 font-semibold" : ""}`}>{d}</button>)}
        </div>
        <p className="text-xs text-muted-ink">Tip: pick a day just after your stipend or salary arrives.</p>
        <Button className="w-full" onClick={() => setStep("review")}>Continue</Button>
      </>)}

      {step === "review" && (<>
        <div className="space-y-2 rounded-2xl border p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-ink">Amount</span><b>{formatINR(amount)}/month</b></div>
          <div className="flex justify-between"><span className="text-muted-ink">Fund</span><b className="text-right">{fund.name}</b></div>
          <div className="flex justify-between"><span className="text-muted-ink">SIP date</span><b>{day} of every month</b></div>
          <div className="flex justify-between"><span className="text-muted-ink">First instalment</span><b>Today</b></div>
        </div>
        <p className="text-xs text-muted-ink">Demo only: no real money moves. In the real app this hands off to Groww's SIP and UPI AutoPay flow.</p>
        <Button className="w-full" onClick={() => { state.startSip({ category, symbol: fund.symbol, amount, day }); setStep("done"); }}>Confirm with UPI (demo)</Button>
      </>)}

      {step === "done" && (
        <div className="space-y-4 py-6 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-groww text-4xl text-white">✓</motion.div>
          <h2 className="text-xl font-bold">First investment done</h2>
          <p className="text-sm text-muted-ink">{formatINR(amount)} every month, on autopilot. The hardest step was starting.</p>
          <Button asChild className="w-full"><Link href="/progress">See my progress</Link></Button>
        </div>
      )}

      {step !== "amount" && step !== "done" && (
        <button className="text-sm text-muted-ink" onClick={() => setStep(step === "fund" ? "amount" : step === "date" ? "fund" : "date")}>← Back</button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Check in the browser**

Open `/invest` and go ₹250 → Continue → Continue → Continue → "Confirm with UPI (demo)".
Expected:
- The done screen appears with a "First investment" toast.
- Reloading `/invest` shows "Your SIP is running".
- For the Goal Saver preset (demo panel), the fund shown is Parag Parikh Liquid Fund.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(invest): Start Small SIP flow with category education and past-5y context"
```

---

### Task 16: Progress hub (streak, goal ring, milestones, reflections)

**Files:**
- Create: `groww-start/components/goal-ring.tsx`, `groww-start/app/progress/page.tsx`

**Interfaces:**
- Consumes: `useApp`, `useToday`, `computeStreak`, `MILESTONES`, `MILESTONE_ORDER`, `useShareHref`, `formatINR`, `formatDate`
- Produces: the route `/progress` with:
  - `data-testid="streak-count"` (text: the current streak number)
  - `data-testid="milestone-{key}"` with `data-achieved="true|false"`
  - each achieved milestone has a "Share" link
  - the section id is `milestones`

- [ ] **Step 1: Implement** `groww-start/components/goal-ring.tsx`

```tsx
export function GoalRing({ pct, size = 112 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(clamped)}% of goal`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f3" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#00b386" strokeWidth={10} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - clamped / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-ink text-lg font-bold">{Math.round(clamped)}%</text>
    </svg>
  );
}
```

- [ ] **Step 2: Implement** `groww-start/app/progress/page.tsx`

```tsx
"use client";
import Link from "next/link";
import { GoalRing } from "@/components/goal-ring";
import { useShareHref } from "@/components/milestone-toast";
import { useApp, useToday } from "@/lib/store";
import { computeStreak } from "@/lib/engine/streak";
import { MILESTONES, MILESTONE_ORDER, type MilestoneKey } from "@/lib/engine/milestones";
import { formatINR, formatDate } from "@/lib/format";

function MilestoneTile({ k, achievedAt }: { k: MilestoneKey; achievedAt?: string }) {
  const href = useShareHref(k);
  const m = MILESTONES[k];
  return (
    <div data-testid={`milestone-${k}`} data-achieved={achievedAt ? "true" : "false"}
      className={`rounded-2xl border p-3 ${achievedAt ? "" : "opacity-40 grayscale"}`}>
      <p className="text-2xl" aria-hidden>{m.emoji}</p>
      <p className="mt-1 text-sm font-semibold">{m.title}</p>
      <p className="text-xs text-muted-ink">{achievedAt ? formatDate(achievedAt) : m.description}</p>
      {achievedAt && <Link href={href} className="mt-2 inline-block text-xs font-semibold text-groww-dark">Share</Link>}
    </div>
  );
}

export default function ProgressPage() {
  const s = useApp();
  const today = useToday();
  const streak = computeStreak(s.instalments.map((i) => i.date), today);
  const invested = s.instalments.reduce((a, i) => a + i.amount, 0);
  const goalPct = s.goal ? (invested / s.goal.target) * 100 : 0;

  return (
    <div className="space-y-5 p-4">
      <h1 className="text-xl font-bold">My progress</h1>

      <section className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <p className="text-sm text-muted-ink">SIP streak</p>
        <p className="text-3xl font-bold">🔥 <span data-testid="streak-count">{streak.current}</span> <span className="text-base font-medium">month{streak.current === 1 ? "" : "s"}</span></p>
        <p className="mt-1 text-xs text-muted-ink">
          {s.sipPlan
            ? streak.freezesUsed > 0 ? "Streak freeze used for a skipped month. Your streak is safe." : "1 streak freeze ready: skip a month when money's tight without losing your streak."
            : <>No SIP yet. <Link href="/invest" className="text-groww-dark underline">Start with ₹100</Link></>}
        </p>
        {streak.longest > 0 && <p className="mt-1 text-xs text-muted-ink">Longest run: {streak.longest} months</p>}
      </section>

      {s.goal && (
        <section className="flex items-center gap-4 rounded-2xl border p-4">
          <GoalRing pct={goalPct} />
          <div>
            <p className="font-semibold">{s.goal.name}</p>
            <p className="text-sm text-muted-ink">{formatINR(invested)} of {formatINR(s.goal.target)} invested</p>
            <p className="text-xs text-muted-ink">{s.instalments.length} SIP instalment{s.instalments.length === 1 ? "" : "s"}</p>
          </div>
        </section>
      )}

      <section id="milestones">
        <h2 className="mb-2 font-semibold">Milestones</h2>
        <div className="grid grid-cols-2 gap-3">
          {MILESTONE_ORDER.map((k) => <MilestoneTile key={k} k={k} achievedAt={s.milestones[k]} />)}
        </div>
        <p className="mt-2 text-xs text-muted-ink">Milestones reward learning and consistency, never trading more.</p>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Lessons</h2>
        <p className="text-sm">{Object.keys(s.lessons).length} of 3 done · <Link href="/learn" className="text-groww-dark underline">Continue learning</Link></p>
      </section>

      {s.reflections.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Your notes to self</h2>
          <ul className="space-y-2">
            {s.reflections.map((r, i) => (
              <li key={i} className="rounded-xl bg-neutral-50 p-3 text-sm"><p className="text-xs text-muted-ink">{r.prompt} · {formatDate(r.date)}</p>{r.answer}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Check in the browser**

With a ₹250 SIP running, open `/progress?demo=1`:
- Tap "+1 month" twice. Expected: the streak reads 3, the goal ring grows, the "3-month streak" tile is achieved, and a
  toast appears.
- Tap "+1 month (skip SIP)", then "+1 month". Expected: the streak continues and the freeze-used text shows.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(progress): streak with freeze, goal ring, milestones and reflections"
```

---

### Task 17: Share card

**Files:**
- Create: `groww-start/app/api/card/route.tsx`, `groww-start/app/share/[key]/page.tsx`, `groww-start/components/share/share-actions.tsx`

**Interfaces:**
- Consumes: `parseShareParams`, `cardLines`
- Produces:
  - `GET /api/card?m=<key>&streak=&lessons=&persona=` → a 1080×1920 PNG
  - the route `/share/[key]`, with `<img data-testid="share-card">` and buttons "Share" and "Download"

- [ ] **Step 1: Implement the image route** at `groww-start/app/api/card/route.tsx`

```tsx
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { cardLines, parseShareParams } from "@/lib/share";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const { headline, sub, chips } = cardLines(parseShareParams(params, params.m ?? ""));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 96, background: "linear-gradient(160deg, #00d09c 0%, #00876a 100%)", color: "white" }}>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>Groww</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 40, opacity: 0.85 }}>Milestone unlocked</div>
          <div style={{ display: "flex", fontSize: 120, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>{headline}</div>
          <div style={{ display: "flex", fontSize: 44, opacity: 0.9, marginTop: 32 }}>{sub}</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 64 }}>
            {chips.map((c) => (
              <div key={c} style={{ display: "flex", fontSize: 40, padding: "16px 32px", borderRadius: 999, background: "rgba(255,255,255,0.18)", marginRight: 20, marginBottom: 20 }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 36, opacity: 0.8 }}>Learning → Practising → Investing. Concept demo.</div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
```

- [ ] **Step 2: Implement the share page and actions**

`groww-start/components/share/share-actions.tsx`:

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareActions({ imgUrl, text }: { imgUrl: string; text: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const getFile = async () => {
    const blob = await (await fetch(imgUrl)).blob();
    return new File([blob], "groww-milestone.png", { type: "image/png" });
  };
  const download = async () => {
    const file = await getFile();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const share = async () => {
    try {
      const file = await getFile();
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text });
      else { await download(); setStatus("Sharing isn't supported here, so we downloaded the card instead."); }
    } catch {
      setStatus("Sharing was cancelled.");
    }
  };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={share}>Share</Button>
        <Button variant="outline" onClick={download}>Download</Button>
      </div>
      {status && <p className="text-xs text-muted-ink">{status}</p>}
    </div>
  );
}
```

`groww-start/app/share/[key]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ShareActions } from "@/components/share/share-actions";
import { cardLines, parseShareParams } from "@/lib/share";

type Props = { params: Promise<{ key: string }>; searchParams: Promise<Record<string, string | undefined>> };

async function build({ params, searchParams }: Props) {
  const { key } = await params;
  const sp = await searchParams;
  const stats = parseShareParams(sp, key);
  const q = new URLSearchParams({ m: key, streak: String(stats.streak), lessons: String(stats.lessons) });
  if (stats.persona) q.set("persona", stats.persona);
  return { imgUrl: `/api/card?${q.toString()}`, lines: cardLines(stats) };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { imgUrl, lines } = await build(props);
  return { title: `${lines.headline} · Groww concept`, openGraph: { title: lines.headline, description: lines.sub, images: [{ url: imgUrl, width: 1080, height: 1920 }] } };
}

export default async function SharePage(props: Props) {
  const { imgUrl, lines } = await build(props);
  return (
    <div className="space-y-4 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-testid="share-card" src={imgUrl} alt={lines.headline} width={1080} height={1920} className="mx-auto w-3/4 rounded-2xl shadow-lg" />
      <p className="text-center text-xs text-muted-ink">Your card shows habits only, never amounts or returns.</p>
      <ShareActions imgUrl={imgUrl} text={`${lines.headline}! Building my investing habit on Groww.`} />
      <Link href="/progress" className="block text-center text-sm text-groww-dark">Back to progress</Link>
    </div>
  );
}
```

- [ ] **Step 3: Check in the browser**

Open `/share/streak_3?streak=3&lessons=2&persona=steady-starter`.
Expected:
- A green 9:16 card reads "3-month streak" with the chips "3-month SIP streak", "2 lessons" and "Steady Starter".
- Download saves a PNG.
- `/share/nope` shows "Started my investing journey".

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(share): 9:16 milestone card via next/og with share/download"
```

---

### Task 18: End-to-end smoke test, README, deploy

**Files:**
- Create: `groww-start/playwright.config.ts`, `groww-start/e2e/happy-path.spec.ts`, `groww-start/README.md`

**Interfaces:**
- Consumes: every route and the test ids from Tasks 10–17

- [ ] **Step 1: Write the Playwright config** at `groww-start/playwright.config.ts`

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  use: { baseURL: "http://localhost:3000", viewport: { width: 390, height: 844 }, trace: "retain-on-failure" },
  webServer: { command: "npm run build && npm run start", url: "http://localhost:3000", reuseExistingServer: true, timeout: 240_000 },
});
```

- [ ] **Step 2: Write the happy-path test** at `groww-start/e2e/happy-path.spec.ts`

```ts
import { test, expect } from "@playwright/test";

test("Learn → Practice → Invest → Build → Share", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /start here/i }).click();

  // Onboarding
  await page.getByRole("button", { name: /long-term wealth/i }).click();
  await page.getByRole("button", { name: "FD or RD" }).click();
  await page.getByRole("button", { name: /₹500 – ₹2,000/ }).click();
  await page.getByRole("button", { name: /wait it out/i }).click();
  await page.getByRole("button", { name: /3\+ years/i }).click();
  await page.getByRole("button", { name: /save my goal/i }).click();
  await expect(page.getByTestId("persona-title")).toHaveText("Steady Starter");

  // Learn
  await page.getByRole("link", { name: /start lesson 1/i }).click();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "4", exact: true }).click();
  await page.getByRole("button", { name: /finish lesson/i }).click();
  await expect(page.getByText(/practice unlocked/i)).toBeVisible();

  // Practice: Time Machine
  await page.getByRole("link", { name: /go to practice/i }).click();
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByTestId("tm-result")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Skip" }).click();

  // Practice: Mock buy
  await page.getByRole("tab", { name: /mock portfolio/i }).click();
  await page.getByTestId("instrument-RELIANCE.NS").click({ timeout: 20_000 });
  await page.getByRole("button", { name: "Confirm buy" }).click();
  await expect(page.getByTestId("holding-RELIANCE.NS")).toBeVisible();

  // Invest
  await page.goto("/invest");
  await page.getByRole("button", { name: /₹250/ }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /confirm with upi/i }).click();
  await expect(page.getByText("First investment done")).toBeVisible();

  // Build: demo time travel
  await page.goto("/progress?demo=1");
  await page.getByRole("button", { name: "+1 month", exact: true }).click();
  await page.getByRole("button", { name: "+1 month", exact: true }).click();
  await expect(page.getByTestId("streak-count")).toHaveText("3");
  await expect(page.getByTestId("milestone-streak_3")).toHaveAttribute("data-achieved", "true");

  // Share
  await page.getByRole("button", { name: /close demo controls/i }).click();
  await page.getByTestId("milestone-streak_3").getByRole("link", { name: "Share" }).click();
  const card = page.getByTestId("share-card");
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1080);
});
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test && npm run e2e`
Expected: all Vitest suites PASS and the 1 Playwright test PASSES. If the Playwright run fails, open the trace with
`npx playwright show-trace test-results/**/trace.zip`, fix the selector or the app, and re-run.

- [ ] **Step 4: Write the README** at `groww-start/README.md`

````markdown
# Groww · Start here (concept demo)

A concept for Gen Z first-time investors in India: **Learn → Practice → Invest → Build → Share**.
Brief: `../Designing Groww for the Gen Z Investor (1).pdf` · Spec: `../docs/superpowers/specs/2026-10-07-groww-genz-starter-design.md`

## Run
```bash
npm install
npm run dev        # http://localhost:3000 (use a phone-size viewport)
npm test           # unit tests (engine, store, market, content)
npm run e2e        # Playwright happy path
npm run snapshot   # refresh data/snapshot from Yahoo Finance + mfapi.in
```

## 5-minute demo script
1. Home → **Start here** → answer 5 taps → name a goal → persona + 3-step path.
2. **Lesson 1** (tap "NAV" for the glossary) → quiz → "Practice unlocked".
3. **Practice → Time Machine**: ₹500/month in a Nifty 50 index fund from 3 years ago → invested vs value, and the worst dip.
4. **Mock portfolio**: buy 1 Reliance share with virtual cash → reflection prompt.
5. **Invest → Start Small**: ₹250 (Chhoti SIP size) → category education → confirm (demo).
6. **Progress** with `?demo=1` → "+1 month" ×2 → 3-month streak, goal ring, milestone → **Share** card (no ₹ shown).

## Demo controls
Open with `?demo=1` or by tapping the "Groww" wordmark 5 times: reset, jump to a persona, +1 month, +1 month (skip SIP → shows the streak freeze).

## Data & compliance notes
- Prices are **delayed** (last close/NAV) from Yahoo Finance (unofficial, non-commercial) and mfapi.in, with a committed 5-year snapshot as fallback. Production would use Groww's licensed feed.
- No real-time prices in mock investing (SEBI, May 2024). Rewards are for learning and consistency only. Fund suggestions are category education, not advice. Share cards show no amounts or returns.
````

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test(e2e): happy path; docs: README with demo script"
```

- [ ] **Step 6: Deploy (ask the user first, because this publishes the app)**

After the user confirms, run from `groww-start/`:

```bash
npx vercel --prod
```

Accept the defaults when prompted, with the project root set to `groww-start`. Expected: a production URL. Then open
`<url>/?demo=1` on a phone and run the demo script once. Add the URL to the README and commit:

```bash
git add README.md && git commit -m "docs: add deployed demo URL"
```
