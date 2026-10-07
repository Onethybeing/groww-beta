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
npm test           # 75 unit tests: engine, store, market, content, routes
npm run e2e        # Playwright happy path on a production build (port 3100)
npm run snapshot   # refresh data/snapshot from Yahoo Finance + mfapi.in
```

## 5-minute demo script

1. **Home → "Start here: 1-minute quiz"**: 5 one-tap questions → name a goal → persona (e.g. *Steady Starter*) + 3-step path.
2. **Lesson 1**: tap **NAV** for the 30-second explainer → quiz → "Practice unlocked".
3. **Practice → Time Machine**: ₹500/month in the UTI Nifty 50 Index Fund from 3 years ago → **Replay**. Real NAVs show
   ₹18,500 invested, now worth about ₹18,176 (−1.8%), up 16% at one point. A live lesson in "ups and downs are normal".
4. **Mock portfolio**: buy 1 Reliance share with virtual ₹10,000 at the last close → reflection prompt ("Why did you pick this?").
5. **Invest → Start Small**: ₹250 (Chhoti SIP size) → category education + real "last 5 years" context → pick a date →
   review → confirm (demo).
6. **Progress** with `?demo=1` → **+1 month** twice → 3-month streak, goal ring, milestone toast → **Share** the 9:16 card
   (habit stats only, no ₹ amounts).

## Demo controls

Open with `?demo=1` or by tapping the **Groww** wordmark on Home 5 times:

- **Reset demo**
- **Persona:** jump to a preset persona
- **+1 month:** moves the demo clock forward and records that month's SIP instalment
- **+1 month (skip SIP):** shows the streak freeze

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
