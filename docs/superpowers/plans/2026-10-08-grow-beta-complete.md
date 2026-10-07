# GROW Beta: Complete Demo (Rev 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Each PR below is one task. Write the
> tests first, open a PR, run the code review and the spec check, merge, then move to the next PR.

**Goal:** Turn the rev-2 app into a complete, branded "GROW Beta" demo covering every MVP item in the brief plus
Referrals, then publish it as a public GitHub repo deployed on Vercel.

**Spec:** `docs/superpowers/specs/2026-10-07-groww-genz-starter-design.md` (Revision 3 at the top).

**Architecture:** reuse `lib/engine` (pure, tested), `lib/store` (Zustand, persisted), the market routes, and the
rev-2 screens. Every new money rule lives in `lib/engine` with Vitest tests. The store bumps to v2 with a migration from v1.

## Global Constraints

- **Name:** "GROW Beta". Use a recreated look-alike mark, never the official Groww logo file.
  The note "Concept demo inspired by Groww · not affiliated · demo money only" is visible on Home and in the README.
- **Data:** frozen snapshot (`data/snapshot`, last dates 6–7 Oct 2026). `/api/*` routes read only the snapshot unless
  `LIVE_DATA=1` is set.
- **Two kinds of money, never mixed:**
  - Practice uses virtual ₹10,000 (`cash`/`transactions`).
  - Real-demo uses the demo balance ₹25,000 (`wallet`/`orders`).
- **Product rules:**
  - No F&O or intraday.
  - Rewards (streak freezes) come only from consistency and referrals. Never cash, never trading volume.
  - SIP minimum ₹100. Stocks trade in whole shares only. Funds allow fractional units (3 dp).
- **Testing:** `npm test` and `npm run e2e` stay green on every PR.

## PR 1 — Brand, frozen data and CI

- `components/brand/grow-logo.tsx`: an SVG mark (green circle with a white rising-wave stroke) plus the "GROW" wordmark and a "Beta" pill.
- `app/icon.svg`: the favicon.
- Metadata title "GROW Beta".
- Home gets a footer note with the disclaimer.
- `lib/market/server-deps.ts`: `fetchLive` is used only when `process.env.LIVE_DATA === "1"`; otherwise it rejects,
  so `getHistory` serves the snapshot.
- Test: `server-deps` in snapshot mode returns `source: "snapshot"`.
- `.github/workflows/ci.yml`: install, lint, typecheck and `vitest run` on every PR.

## PR 2 — MVP gaps: goal in onboarding, "Ready to go real?"

- `WelcomeAnswers` gains `goal`, so the prompt has 4 tap groups. `setWelcome` uses the chosen goal and its default target.
- Practice tab: once there is at least 1 practice trade or Time Machine run, show a card linking to the index fund's
  SIP page ("Ready to go real? Start from ₹100").
- Tests: store `setWelcome` with a goal; the E2E test covers the 4 groups.

## PR 3 — Core investing loop (demo balance, orders, SIPs, watchlist, search)

- **Engine**
  - `lib/engine/sips.ts`:
    - `SipPlan` gains `id` and `status: "active" | "paused" | "cancelled"`. `Instalment` gains `sipId`.
    - `dueInstalmentsAll(plans, existing, skipped, today)` covers active plans only.
    - `pauseSip`, `resumeSip`, `modifySip` and `cancelSip` are pure transforms.
  - Wallet rule: an instalment is recorded only if the wallet covers it; otherwise it's a missed month.
- **Store v2**
  - New fields: `wallet` (25,000), `orders: Txn[]`, `sips: SipPlan[]`, `watchlist: string[]`.
  - The v1 `sipPlan` migrates into `sips[0]`.
  - Actions: `placeOrder`, `addMoney`, `startSip` (multiple), `updateSip`, `toggleWatch`.
  - `advanceMonth` processes all active SIPs.
- **UI**
  - `TradeSheet` gets `mode: "practice" | "real"`. Real mode uses the wallet and orders.
  - The stock page Buy and Sell work.
  - The fund SIP page enables "One-time" purchases.
  - `/search` searches every instrument. The header search icon goes there.
  - Watchlist bookmark on detail pages. Home gets a "Watchlist" section.
  - `/holdings` shows the demo balance with Add money, then stocks, funds (one-time) and SIPs, each SIP linking to
    `/sips/[id]` (pause/resume, modify amount/day, cancel).
  - `/orders` lists order history (buys, sells and SIP instalments).
- **Tests**
  - Engine tests for SIP transforms and wallet-gated instalments.
  - Store tests: migration v1→v2, real order vs practice separation, multiple SIPs.
  - E2E: real buy reduces the demo balance and appears in Holdings.

## PR 4 — Referrals (post-MVP)

- **Engine:** `lib/engine/referrals.ts`.
  - `referralCode(userId)` returns a deterministic `GROW-XXXX`.
  - `referralRewards(count)` returns bonus streak freezes, capped at 3.
- **Store**
  - New fields: `userId` (random, set once), `referrals: { code, joinedAt }[]`, `referredBy?: string`.
  - Bonus freezes feed into `computeStreak(..., 1 + bonus)`.
- **UI**
  - `/refer` shows the code, a copyable link `/r/[code]`, share (Web Share API) and the count with rewards.
  - The `/r/[code]` landing page reads "Your friend invited you to GROW Beta". It saves `referredBy` and gives a welcome streak freeze.
  - Entry points: the Holdings habit card and the share page.
  - Demo control: "Simulate friend joined".
- **Tests:** engine (code format, cap); store (`referredBy` is set once; freezes add up); E2E (refer page shows the code).

## PR 5 — Deploy and docs

- README:
  - Rename to GROW Beta.
  - Update the demo script and the brief-coverage table (every MVP and post-MVP item mapped to its screen).
- Public repo: `gh repo create Onethybeing/groww-beta --public`.
- Vercel: the user logs in, then `vercel link`, `vercel --prod` and Git integration. Smoke-test the production URL.
