# GROW Beta: invest, practise, start small

A concept demo for Indian Gen Z first-time investors (age 20–26). It builds **Learn → Practice → Invest → Build → Share**
into a Groww-style investing app as features, not as a separate learning app.

> **GROW Beta is a concept demo inspired by Groww. It is not affiliated with Groww.** All money is demo money. Prices
> are real past data (stocks to 7 Oct 2026, fund NAVs to 6 Oct 2026) and are not investment advice.

- **Live demo:** https://groww-beta.vercel.app (open on a phone, or at ~390px width; `?demo=1` shows demo controls)
- **Brief:** [`Designing Groww for the Gen Z Investor (1).pdf`](<../Designing Groww for the Gen Z Investor (1).pdf>)
- **Spec:** [`docs/superpowers/specs/2026-10-07-groww-genz-starter-design.md`](../docs/superpowers/specs/2026-10-07-groww-genz-starter-design.md) (revision 3 at the top)
- **Design canvas:** https://claude.ai/artifact/UPYpc2fEhadZcqxT3ebh2c

## Brief coverage

| Brief item | Where it lives in the app |
|---|---|
| **MVP 1 · Gen Z onboarding** (goals, experience, ability to invest) | Optional 4-tap prompt on first open: goal, experience, monthly amount, horizon. It sets beginner hints, a persona, a goal tracker and the default SIP size. |
| **MVP 2 · Bite-sized learning** (concepts for the next action) | "What's this?" explainers on NAV, returns p.a. and 52-week range, each with a *For you, right now* line. A "First stock?" tip and a first-SIP tip. "Basics in 2 minutes" (3 card lessons with a quiz) in Practice. |
| **MVP 3 · Mock investing** (virtual money) | **Practice** tab with ₹10,000 virtual. **Practice buy** sits next to Buy on every stock and fund. **Time Machine** replays a monthly SIP on real past NAVs. A reflection prompt follows the first trade. |
| **MVP 4 · Micro investing** (practice → first real investment) | "Ready to go real?" nudge in Practice (persona-aware: index fund, or liquid fund for short-term goals). SIP order with **Start small** ₹100 / ₹250 (Chhoti SIP) / ₹500. Demo balance ₹25,000 for real-style SIPs, one-time buys and stock Buy/Sell. |
| **MVP 5 · Progress & milestones** | Holdings **Your habit** card: monthly SIP streak with streak freezes, goal ring, milestones (first lesson, Time traveller, first practice buy, first investment, 3-month streak, basics done). |
| **Post-MVP · Social achievement cards** | 9:16 share card (`/share/[key]`, image from `/api/card`). It shows habits only, never ₹ amounts or returns. |
| **Post-MVP · Referrals** | `/refer` (code, link, share) and `/r/[code]` invite landing. Both people earn a **streak freeze, never cash**. Referral freezes are capped at 3 per user, and invites can only be claimed by new investors (no SIPs or orders yet). |
| Post-MVP · Personalised recommendations, deeper gamification | Out of scope for this build, by decision. The persona already drives hints and the starter fund *category* (education, not advice). |
| **Out of scope per the brief** | No F&O, intraday, advanced portfolio tools, tax, loans or insurance, and no full Groww redesign. |

Also working (the core investing loop): search, watchlist, stock and fund pages, Buy/Sell, one-time fund buys, several
SIPs with pause / resume / modify / cancel, order history, and Holdings valued at real NAVs.

## 5-minute demo script

1. **Home:** answer the 4-tap prompt and tap **Turn on hints**. Hints must be on for the "Start with ₹100" chip and the tips to show.
2. **Start with ₹100:** the fund page opens. Tap **NAV** for an explainer. The **What if you'd started a SIP?** card uses real data.
3. **Stocks → Reliance:**
   - The "First stock?" tip shows.
   - **Practice buy** → reflection prompt.
   - Then **Buy** with the demo balance, and bookmark the stock to add it to the watchlist.
4. **Practice:** see the virtual portfolio and the Time Machine. **Ready to go real?** opens the SIP order.
5. **SIP order:** pick **₹250 (Chhoti SIP)** and start the SIP (demo UPI AutoPay).
6. **Holdings** with `?demo=1`:
   - Tap **+1 month** twice to reach a **3-month streak**.
   - Open the SIP to **pause** or **modify** it.
   - Open **Order history**.
7. **Share** the 3-month-streak card, then **Invite friends**. To show the invite landing page, open your `/r/<code>` link in a private window (a new user).

**Demo controls:** open with `?demo=1` or by tapping the GROW logo 5 times. They offer: reset, persona presets,
+1 month, +1 month (skip SIP), and a simulated friend joining.

## Run locally

```bash
cd groww-start
npm install
npm run dev        # http://localhost:3000 (phone width ~390px)
npm test           # unit tests: engine, store, market, content, route validation
npm run e2e        # Playwright end-to-end on a production build (port 3100)
npm run snapshot   # (optional) refresh data/snapshot from Yahoo Finance + mfapi.in
```

Frozen snapshot data is the default and is what the deployed demo uses. `LIVE_DATA=1` (local experiments only) fetches Yahoo Finance and mfapi.in instead. Yahoo is unofficial and non-commercial, and it can include today's in-progress bar, so don't enable it on a public deployment.

## How it's built

- **Framework and UI:** Next.js 16 (App Router), Tailwind v4, shadcn/ui (Base UI), Motion, lucide icons, DM Sans.
  Hosted on Vercel. CI (GitHub Actions) runs lint, typecheck, Vitest and `next build` on every PR.
- **`lib/engine`:** pure, unit-tested money logic. It covers SIP replay, trailing returns, portfolio and trades, SIPs
  (wallet-gated collection, pause/resume with no back-charging), the monthly streak with freezes, persona rules,
  milestones and referral codes.
- **`lib/store`:** a single persisted Zustand store (v3, with migrations from v1 and v2). Practice money and the demo balance
  are kept strictly separate.
- **Market data:** `/api/history` and `/api/quote` serve the committed snapshot (`data/snapshot`, about 5 years of
  daily data for 12 large caps, the Nifty 50, GOLDBEES and 6 funds).

## Compliance-minded design

- No real-time prices in the demo (frozen snapshot). Mock investing uses past data (SEBI, May 2024).
- Rewards are only for learning, consistency and referrals (streak freezes). There's no cash, no trading leaderboards
  and no confetti on trades.
- The starter fund is a **category** suggestion (the same for the same answers) with past-performance disclaimers, not advice.
- Share cards never show amounts or returns.
