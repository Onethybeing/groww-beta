# Groww · Start here (concept demo)

A concept for Gen Z first-time investors in India: **Learn → Practice → Invest → Build → Share**, built as a
beginner journey inside a Groww-like shell.

- Brief: `../Designing Groww for the Gen Z Investor (1).pdf`
- Spec: `../docs/superpowers/specs/2026-10-07-groww-genz-starter-design.md`
- Plan: `../docs/superpowers/plans/2026-10-07-groww-genz-starter.md`
- Design canvas (13 boards): https://claude.ai/artifact/UPYpc2fEhadZcqxT3ebh2c

## Run

```bash
npm install
npm run dev        # http://localhost:3000 (use a phone-size viewport, ~390px)
npm test           # 84 unit tests: engine, store, market, content, routes
npm run e2e        # Playwright happy path on a production build (port 3100)
npm run snapshot   # refresh data/snapshot from Yahoo Finance + mfapi.in
```

## 5-minute demo script

The beginner features live **inside the normal Groww flow**, plus one new **Practice** tab.

1. **Home**: a new user sees an optional 3-tap prompt. Pick answers and tap **Turn on hints** (or skip it).
2. **Start with ₹100**: this opens the UTI Nifty 50 fund page.
   - Tap **NAV** for the "What's this?" explainer, which includes a "For you, right now" line.
   - The **What if you'd started a SIP?** card shows real past data.
3. **Stocks → Reliance**: the "First stock?" tip appears. Tap **Practice buy**, confirm, and answer the reflection prompt.
4. **Practice tab**: shows the virtual portfolio, the Time Machine (replay a SIP month by month) and "Basics in 2 minutes".
5. **Fund → Start SIP**: use the **Start small** quick picks (₹100 / ₹250 Chhoti SIP / ₹500), then start the SIP (demo).
6. **Holdings** with `?demo=1`: tap **+1 month** twice.
   - The **Your habit** card shows a 3-month streak, the goal ring and milestones.
   - Tap the streak milestone to **Share** the 9:16 card (no ₹ amounts).

## How it's built

- **Next.js 16 (App Router)**, Tailwind v4, shadcn/ui (Base UI), Motion, lucide icons, DM Sans.
- **`lib/engine`**: pure, unit-tested money logic. It covers SIP replay, the mock portfolio, the monthly streak with
  freeze, due instalments, the persona rules table and milestones.
- **`lib/store`**: a single Zustand store persisted in the browser. It is versioned and resets safely if saved data is
  stale or corrupt.
- **Market data**:
  - `/api/history` and `/api/quote` call Yahoo Finance (stocks, Nifty 50, GOLDBEES) and mfapi.in (6 funds) on the
    server, cached for 15 minutes.
  - On any failure they fall back to the committed 5-year snapshot in `data/snapshot/`.
- **Share card**: `/api/card` renders a 1080×1920 PNG with `next/og` from URL params.

## Data & compliance notes

- Prices are **delayed** (last close/NAV), and mock trades fill at those prices. There are no real-time prices in mock
  investing (SEBI, May 2024).
- Yahoo Finance is unofficial and non-commercial, which is fine for a demo. Production would use Groww's licensed feed.
- Rewards are for learning and consistency only: no leaderboards, no confetti on trades.
- Fund suggestions are **category education** (the same for the same answers) with past-performance disclaimers, not advice.
- Share cards never show amounts or returns.
