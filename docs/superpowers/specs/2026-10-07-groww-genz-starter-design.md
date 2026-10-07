# Groww for the Gen Z Investor — "Start Here" Demo Webapp: Design Spec

**Date:** 2026-10-07
**Source brief:** `Designing Groww for the Gen Z Investor (1).pdf`
**Status:** Draft for review

## 1. Intent

**Purpose:** A polished, clickable demo webapp that accompanies the case study and shows the
LEARN → PRACTICE → INVEST → BUILD → SHARE journey working end-to-end for an Indian 20–26-year-old
first-time investor.

**Success criteria**
- A reviewer can complete the whole journey on a phone-sized screen in about 5 minutes.
- The Practice and Build steps use real logic and real market data, not hardcoded numbers.
- The demo never breaks during a presentation: no login, and every external data source has an offline fallback.
- The design avoids the gamification patterns that regulators flag (see §6).

**Framing:** a *feature inside Groww*. A lightweight, static Groww-like shell (green/white, Groww-style
cards) with a "New to investing? Start here" entry into the beginner journey. This is not a redesign of Groww.

**Effort:** about 1 week, building one deep happy path through all 5 MVP modules plus a Share card.

**Out of scope:** real money, KYC, payments, login or cross-device sync, live (real-time) prices,
intraday or F&O, referrals, personalised fund or stock recommendations, tax, and other financial products.

## 2. Demo journey

1. **Groww home (static shell).** Shows a "New to investing? Start here" card that links to `/start`.
   Returning users go to `/journey` instead: a hub showing the 5 steps, which ones are locked, and their persona.
2. **Onboarding (`/start`).** Five tap-only questions, one per screen, with a progress bar:
   1. Goal: emergency fund / trip or gadget / higher studies / long-term wealth / just learning
   2. Experience: never / FD or RD / mutual funds or SIP / stocks
   3. Monthly comfort amount: ₹100–500 / ₹500–2k / ₹2k–5k / ₹5k+
   4. "If ₹1,000 became ₹800 in a month you would…": sell / wait / buy more
   5. Horizon: <1 yr / 1–3 yrs / 3+ yrs

   **Result:** a persona (Steady Starter / Curious Explorer / Goal Saver) and a 3-step path card.
   There is no risk score. The user also sets one goal (name + target amount) here.
3. **Learn (`/learn/[lessonId]`).** Three lessons, each 4–6 swipeable cards plus one quiz card:
   - L1 "What's a mutual fund & SIP?"
   - L2 "Index funds & the Nifty 50"
   - L3 "Ups and downs are normal"

   Glossary terms (NAV, expense ratio, SIP, index, returns) open a bottom-sheet explainer when tapped.
   Completing L1 unlocks Practice.
4. **Practice (`/practice`).** Everything is labelled "Virtual money · Prices delayed / past data · Not a prediction".
   - **Time Machine:**
     - Inputs: a fund or stock, a monthly amount (₹100–₹2,000), a start year (up to 5 years back).
     - The app replays real historical prices month by month.
     - Output: a chart of invested vs current value, the final value, the worst dip along the way,
       and a plain-language takeaway.
   - **Mock buy:**
     - Starts with a ₹10,000 virtual balance.
     - Users can buy and sell curated stocks or funds at the last close or NAV.
     - The holdings list shows P&L.
   - After the first Time Machine run and the first mock buy, a reflection prompt asks
     "Why did you pick this?" and saves the answer. It is shown later on the Progress page.
5. **Invest — Start Small (`/invest`).** This step is simulated.
   - The user picks ₹100 / ₹250 ("Chhoti SIP") / ₹500 per month and a SIP date.
   - A fund *category* is shown with education-only copy, the same for everyone with the same answers:
     "A broad index fund is a common starting point because…".
   - It ends with a review screen, a mock confirmation and the "First investment" milestone.
   - Projection copy carries a "returns not guaranteed" disclaimer.
6. **Build — Progress (`/progress`).**
   - A SIP streak counted in **months**, because the SIP is monthly and a weekly streak would always break.
     One streak freeze automatically covers a single skipped month.
   - A milestones grid: first lesson, 3 lessons, first Time Machine run, first mock buy, first SIP, 3-month streak.
   - A goal ring, e.g. "Goa trip 18%", drawn as a plain SVG ring. It grows with the amount invested
     through simulated SIP instalments.
7. **Share (`/share/[milestoneKey]`).**
   - A 9:16 achievement card generated with `next/og`, e.g. "3-month SIP streak · 3 lessons · Steady Starter".
   - Progress lives only in the browser, so the card's stats are passed in the URL query
     (`?streak=3&lessons=3&persona=steady-starter`).
   - **No rupee amounts or returns.**
   - Share actions: Web Share API, falling back to download.

**Demo controls.** A hidden panel, opened by tapping the Groww logo 5 times or by `?demo=1`, with these actions:
- Reset all progress
- Jump to a persona
- "+1 month", which moves the demo clock forward, adds that month's SIP instalment, and updates the
  streak, goal ring and milestones
- "+1 month (skip SIP)", which moves the clock forward without an instalment to show the streak freeze

## 3. Architecture

**Stack:**
- Next.js 16.3.x (App Router) + TypeScript, Tailwind v4 + shadcn/ui, Motion
- TradingView lightweight-charts v5 (price and Time Machine charts); the goal ring is plain SVG
- Zustand with persist (browser storage), TanStack Query (market data), Zod (content and API validation)
- Vercel Hobby hosting

```
app/(groww)/page.tsx        static Groww-like home + Start here card
app/start/                  onboarding → persona
app/learn/[lessonId]/       lesson card player
app/practice/               Time Machine + mock buy
app/invest/                 Start Small SIP flow
app/progress/               streak, milestones, goal ring
app/share/[milestoneId]/    share page + opengraph-image (next/og)
app/api/quote/route.ts      latest close / NAV for a symbol
app/api/history/route.ts    daily or monthly history for a symbol
lib/engine/                 pure functions (no React)
lib/store/                  Zustand slices + persistence
lib/market/                 data clients: yahoo, mfapi, snapshot fallback
content/lessons/*.json      lesson decks
content/glossary.json       glossary terms
data/instruments.json       curated universe
data/snapshot/*.json        ~5y daily history per instrument (committed)
scripts/fetch-snapshot.ts   rebuilds the snapshot
```

### 3.1 Market data

**Curated universe (`data/instruments.json`)**
- 12 large-cap NSE stocks, all as Yahoo `.NS` symbols: RELIANCE, TCS, HDFCBANK, INFY, ITC, MARUTI,
  ICICIBANK, SBIN, BHARTIARTL, HINDUNILVR, ASIANPAINT, TITAN. TATAMOTORS is excluded because of its 2025 demerger.
- The Nifty 50 (`^NSEI`) and GOLDBEES.NS (gold).
- Six mutual funds by mfapi scheme code, all checked on 2026-10-07:

  | Code | Fund | Category |
  |---|---|---|
  | 120716 | UTI Nifty 50 Index | index |
  | 122639 | Parag Parikh Flexi Cap | flexi |
  | 118825 | Mirae Asset Large Cap | largecap |
  | 120503 | Axis ELSS Tax Saver | elss |
  | 119132 | HDFC Gold ETF FoF | gold |
  | 143269 | Parag Parikh Liquid | liquid; used for the Goal Saver persona's short-horizon goals |

**Sources**
- Stocks and indices: a direct server-side `fetch` of `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
  (Yahoo sends no CORS headers). No extra npm dependency.
- Funds: `https://api.mfapi.in/mf/{code}`. The response is newest first with `DD-MM-YYYY` dates.

**API routes**
- Requests are validated with Zod, and only symbols in the curated list are accepted.
- Responses are cached for 15 min (`revalidate = 900`).
- On any upstream failure or timeout (4s), the route serves the matching snapshot file and sets
  `source: "snapshot"`. The UI then shows a small "showing saved prices" note.

**Delayed, not live**
- Mock buys execute at the last close or NAV.
- No intraday ticking.
- The label "Prices delayed" is always visible in Practice.

**Snapshot.** `scripts/fetch-snapshot.ts` writes about 5 years of daily closes to `data/snapshot/{symbol}.json`.
It runs once and is committed. The Time Machine and mock buys read prices through the API routes (live data
first) and fall back to these files.

**Production note.** Yahoo is unofficial and its terms are non-commercial, which is acceptable for a demo.
A production build would use Groww's own licensed market data.

### 3.2 Domain engine (`lib/engine`, pure and unit-tested)

- `sipReplay(prices, monthlyAmount, startDate, endDate)`
  - Buys on the first trading day on or after the SIP day each month.
  - Returns a monthly series of `{date, invested, value}`, plus `invested`, `finalValue`, `returnPct`
    and `worstDipPct`. `worstDipPct` is the lowest point of (value − invested) / invested, shown as
    "At its lowest you were down X%". XIRR is left out (YAGNI).
- `portfolio(transactions, latestPrices)` returns holdings with average price, current value and P&L, plus cash.
- `applyBuy` / `applySell` validate cash and quantity. Stocks use whole shares; funds allow fractional units.
- `computeStreak(instalmentDates, today, freezes)`
  - Counts calendar months (dates are IST `YYYY-MM-DD` strings).
  - A month with an instalment counts. A current month with no instalment yet does not break the streak.
  - One freeze covers one missed month.
- `evaluateMilestones(input, already, today)` returns newly earned milestone keys and is idempotent.
- `personaFor(answers)` is a deterministic rules table that maps the 5 answers to a persona and a suggested category.
- `dueInstalments(plan, existing, skippedMonths, today)` returns the SIP instalments that are due but not yet recorded.
  The app's "today" comes from a store clock offset, so demo controls can move it.

### 3.3 State (`lib/store`, persisted under one versioned key)

| Slice | Fields |
|---|---|
| `profile` | `answers`, `persona`, `goal {name, target}` |
| `learning` | `lessonProgress {lessonId: {status, quizCorrect, completedAt}}` |
| `practice` | `cash` (start 10000), `transactions[]`, `reflections[]`, `timeMachineRuns` |
| `invest` | `sipPlan {category, symbol, amount, day, startDate}` or `null`; `instalments[] {date, amount}`; `skippedMonths[]` |
| `progress` | `milestones {key: achievedAt}`. Streak and freezes are derived from instalments, not stored. |
| `clock` | `offsetDays` (demo time travel) |

The store holds a schema `version`. If the version doesn't match or the data fails to parse, everything resets to defaults.

### 3.4 Content

- Lessons are stored as JSON and validated with Zod at build time.
- Card types: `text`, `visual` (an emoji or illustration plus a caption), `quiz` (options, answer, explanation)
  and `chart` (a reference to snapshot data).
- The tone is plain, witty Indian English with no jargon, and every term is explained.

## 4. UI and design

- Mobile-first with a 390px design width. On desktop the app is centred in a phone-width frame.
- A Groww-like visual language: white background, Groww green accent, rounded cards and a clean sans-serif font.
  The app uses no Groww logos beyond a text wordmark placeholder ("Groww"), and the demo is labelled as a concept.
- Motion is limited to swipeable lesson cards, the streak flame and a single calm celebration on first SIP.
  There is no confetti on trades.

## 5. Error handling

- Market API failure falls back to the snapshot (see §3.1).
- Bad saved state resets to defaults.
- Invalid buys (not enough virtual cash, or a quantity of 0 or less) show an inline error and are never thrown.
- Lesson content fails the build if it doesn't pass Zod validation.
- The share image route handles an unknown `milestoneId` by returning a generic card.

## 6. Compliance-driven design rules

- **No real-time prices in mock investing.** This follows SEBI's May 2024 circular restricting real-time
  price data for virtual-trading apps.
- **Reward consistency and learning only.** Never reward trade count or returns. There are no return-ranked
  leaderboards, no prize mechanics, no false urgency and no loss-aversion copy (with the draft SEBI ad code
  of June 2026 and the FCA findings on engagement practices in mind).
- **Category education, not advice.** The suggestion is identical for the same answers, carries a
  past-returns disclaimer, and has no "best fund" rankings.
- **Share cards** show only habit metrics, never ₹ amounts or returns.

## 7. Testing

- **Vitest unit tests for `lib/engine`:**
  - SIP replay against a hand-computed small fixture
  - Buys on holidays or weekends moving to the next trading day
  - Max drawdown
  - Buy/sell validation
  - Streaks across month and year boundaries and with a freeze
  - Milestones being idempotent
  - Persona mapping table
- **API route tests:** a mocked upstream failure returns the snapshot with `source: "snapshot"`.
- **Playwright smoke test (390×844):** home → onboarding → L1 → Time Machine → mock buy → Start Small SIP
  → demo "+1 month" twice → progress shows the 3-month streak milestone → share page renders.
  The app lives in `groww-start/`; the repository root holds the brief and the docs.

## 8. Deliverables

- A deployed Vercel URL plus a README with the demo script (the 5-minute walkthrough) and the demo controls.
- The source repo with the committed snapshot data.
