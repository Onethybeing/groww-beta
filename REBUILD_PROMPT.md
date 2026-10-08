# Prompt: Build "GROW Beta" — beginner investing features inside a Groww-style app

> Give this prompt to an AI coding agent (for example Claude Code) along with the brief PDF,
> *Designing Groww for the Gen Z Investor*. It describes the finished app in enough detail to rebuild it from an
> empty folder.

---

## 1. Your role and how to work

You are a senior full-stack engineer and product designer. Build a **public, deployed demo web app** from the
attached product brief.

Work in this order:

1. **Research first.** Use parallel sub-agents to research:
   - free Indian market-data sources and SEBI rules (real-time price restrictions for virtual trading, the ₹250
     "Chhoti SIP", rules on investment advice, gamification and dark patterns);
   - UX patterns from Groww, Zerodha Varsity, Jar, StockGro, Duolingo, Acorns and Robinhood, including what to avoid;
   - the current Next.js and Vercel tooling.

   Summarise the findings in 10 bullets or fewer.
2. **Ask before building.** Ask me the blocking questions as multiple choice, with your recommendation marked:
   branding, scope, data freshness, hosting account. Then write a short **design spec** and a task-by-task
   **implementation plan** to `docs/`, and wait for my approval of each.
3. **Show the design first.** Before writing code, publish clickable mockups of every screen (a design canvas, or
   Figma-style boards) using **real data**. Never invent numbers; compute them from the actual data.
4. **Build test-first:**
   - Put all money, streak and reward logic in pure functions with unit tests written before the code.
   - Use one feature branch per PR on a **public GitHub repo**.
   - Run a **code review on every PR** and fix real findings before merging.
   - CI must run lint, typecheck, unit tests and `next build`.
5. **Verify like a user.** Run a Playwright end-to-end test of the whole journey at 390px, take screenshots of every
   screen, crawl every route for console errors and horizontal overflow at 360 and 390px, then deploy to **Vercel**
   and re-run the E2E against production.
6. **Report briefly.** Keep progress updates short. Ask me only for real decisions or outside actions
   (deploy logins, adding integrations). State any rulings you make and what they cost if wrong.

---

## 2. Product summary

**Problem (from the brief):** Indian 20–26-year-olds have access to investing apps but lack the knowledge,
confidence and money to start. The opportunity is to make the **first investing experience simple, understandable
and less intimidating**, not to add more products.

**Product principle:** LEARN → PRACTICE → INVEST → BUILD → SHARE.

**Critical framing:** this is **not** a separate learning app. It is a set of **beginner features built into a
normal Groww-style trading and investing app**, plus **one new tab (Practice)**. The usual flow stays primary:
Explore → stock or fund page → order → Holdings.

**Name and brand:**
- Call the app **"GROW Beta"**. Use a **recreated look-alike mark** (a green disc with a rising white wave), never
  the official Groww logo, plus a "Beta · Demo" pill.
- Show a visible disclaimer: *"Concept demo inspired by Groww · not affiliated · demo money only · real past data ·
  not investment advice"*. It goes on Home, in the README and on share and invite pages.

**Out of scope (from the brief):** F&O, intraday, advanced portfolio tools, tax, loans, insurance, a full Groww
redesign, real money or KYC.

---

## 3. Features to build

### Navigation
- Mobile-first, about 390px wide, inside a centred phone-width frame.
- Bottom tabs: **Home · Stocks · Mutual Funds · Practice (NEW badge) · Holdings**.
- Home and Holdings share a header with the logo, a search icon and an **Explore / Holdings** switch.

### MVP 1 — Onboarding (goals, experience, ability to invest)
- An optional **bottom sheet on first open**: 4 tap groups for goal (emergency / trip or gadget / studies /
  long-term wealth / just learning), invested before, comfortable monthly amount, and horizon. Then **Turn on
  hints** or **Skip**.
- The answers produce a **persona** from a deterministic rules table:
  - Goal Saver → **liquid** fund category (short horizon or emergency goal);
  - Curious Explorer → index;
  - Steady Starter → index.
- The persona also sets a suggested SIP amount (₹100 / ₹250 / ₹500 by budget), a goal tracker (name and target),
  and turns **beginner hints** on.
- No risk score and no KYC.

### MVP 2 — Bite-sized, contextual learning
- **"What's this?" explainers:** tappable dotted terms (NAV, Returns p.a., 52-week range, SIP, index fund, expense
  ratio) open a bottom sheet with a plain definition. Each has a **"For you, right now"** line computed from the
  screen's real numbers (for example "A ₹500 SIP today buys ≈3.1 units at ₹160.38") and a link to the matching
  2-minute lesson.
- **Beginner tips,** shown only when hints are on: "First stock?" on stock pages (with the real 1-year change) and
  "Your first SIP" or "One-time vs SIP" on the order screen.
- **"Basics in 2 minutes":** 3 swipeable card lessons, each ending in a 1-question quiz:
  - What's a mutual fund & SIP;
  - Index funds & the Nifty 50 (with a real 5-year chart);
  - Ups and downs are normal.

  Lessons are Zod-validated JSON and use Lucide icons, not emoji.

### MVP 3 — Mock investing (Practice tab)
- **Virtual ₹10,000**, kept completely separate from the demo balance.
- **Practice buy** sits next to **Buy** on every stock and fund page. It fills at last close or NAV. Whole shares
  only for stocks; funds allow fractional units to 3 decimals.
- A **reflection prompt** ("Why did you pick this?") follows the first practice trade.
- **Time Machine:** pick any fund or stock, an amount of ₹100–2,000 per month, and 1, 2, 3 or 5 years ago. It
  replays a monthly SIP on **real past prices** and shows:
  - invested vs value on a chart;
  - the return;
  - the lowest point with its month;
  - the peak with its month;
  - an honest takeaway such as "Right now you'd be down 1.8%…".

### MVP 4 — Micro investing (practice → first real investment)
- A **"Ready to go real?"** card appears in Practice after any practice activity. It is persona-aware: it suggests
  the index fund, or the liquid fund for short-term goals.
- **SIP order screen:**
  - tabs: Monthly SIP / One-time;
  - **Start small** quick picks: ₹100 / ₹250 (Chhoti SIP) / ₹500;
  - a SIP date (1, 5, 10, 15, 20 or 25);
  - which goal it counts towards;
  - minimum ₹100;
  - a confirm button labelled "(demo) UPI AutoPay".
- A **₹25,000 demo balance** pays for real-style orders and SIPs, with an "Add ₹5,000" button.
- Funds are suggested as a **category** (the same suggestion for the same answers) with past-performance
  disclaimers, never as personalised advice.

### MVP 5 — Progress and milestones (in Holdings)
- **Holdings** shows:
  - the demo balance card;
  - current value vs invested, and total returns;
  - stocks, one-time funds and SIPs, valued at real NAVs;
  - order history.
- **"Your habit" card:**
  - a monthly **SIP streak** (calendar months; the current month doesn't break it);
  - **streak freezes**: 1 base, and each covers one missed month;
  - a goal ring;
  - milestone chips: First lesson, Time traveller, First practice buy, First investment, 3-month streak, Basics done;
  - "Invite friends".
- Milestones reward **learning and consistency only, never trading more**.
- A milestone toast appears at the top and closes itself after 4 seconds. No confetti.

### Core investing loop (also working)
- **Search** across all instruments.
- **Watchlist:** a bookmark on detail pages, shown as a section on Home.
- **Stock Buy and Sell** with the demo balance.
- **One-time fund buy and sell.**
- **Several SIPs**, at most one active per fund. Each SIP has a manage page with modify amount or date, pause,
  resume, and cancel (cancel needs confirming).
- **Resuming must never back-charge the paused months.**
- If the demo balance can't cover an instalment, that month is recorded as **missed**, not retried.
- **Order history** covers buys, sells, SIP instalments and missed instalments.

### Post-MVP — Share cards
- A 9:16 PNG generated with `next/og` (1080×1920, DM Sans, GROW mark).
- It shows the milestone, the streak, the lesson count and the persona. It **never shows ₹ amounts or returns**.
- Share uses the Web Share API, falling back to download.

### Post-MVP — Referrals
- Each user gets a stable `GROW-XXXX` code (a hash of a persisted random user id, with no 0/O/1/I).
- `/refer` shows the code, a copyable link `/r/[code]`, share, the friends who joined, and the freeze total.
- `/r/[code]` is the landing page. **Accept invite** gives +1 streak freeze, and is allowed **only for new investors**
  (no SIPs or orders yet). It rejects your own code and a second invite.
- Rewards are **streak freezes only, never cash**, capped at 3 from invites.

### Demo controls (for presenting)
- Open with `?demo=1`, or by tapping the logo 5 times.
- Controls:
  - reset;
  - persona presets;
  - **+1 month**, which moves the demo clock and collects SIP instalments;
  - **+1 month (skip SIP)**, to show a streak freeze;
  - **friend joined**, which simulates a referral.

---

## 4. Data and compliance rules

- **Real but frozen data.** Fetch about 5 years of daily history once and commit it as JSON. All runtime routes
  serve this snapshot. Live fetching is allowed only behind `LIVE_DATA=1` for local experiments.
  - **Stocks** (Yahoo Finance chart endpoint, server-side only): RELIANCE, TCS, HDFCBANK, INFY, ITC, MARUTI,
    ICICIBANK, SBIN, BHARTIARTL, HINDUNILVR, ASIANPAINT, TITAN (all `.NS`). Skip TATAMOTORS (demerged in 2025).
  - **Index and ETF:** `^NSEI`, `GOLDBEES.NS`.
  - **Mutual funds** (`api.mfapi.in`, codes checked against live data):

    | Code | Fund | Category |
    |---|---|---|
    | 120716 | UTI Nifty 50 Index | index |
    | 122639 | Parag Parikh Flexi Cap | flexi |
    | 118825 | Mirae Asset Large Cap | large cap |
    | 120503 | Axis ELSS | ELSS |
    | 119132 | HDFC Gold ETF FoF | gold |
    | 143269 | Parag Parikh Liquid | liquid |
- **No real-time prices** in mock investing (SEBI, May 2024). Label everything "Virtual money · Prices delayed /
  past data · Not a prediction".
- **Rewards** come only from learning, consistency and referrals: no cash, no leaderboards, no confetti on trades,
  no false urgency.
- **No personalised buy advice.** Category education only, with past-performance disclaimers.
- **IST dates throughout.** The app's "today" comes from a store clock offset, so demo time travel works.

---

## 5. Tech stack and architecture

- **Framework:** Next.js 16 (App Router, Turbopack) + TypeScript, Tailwind v4, shadcn/ui (Base UI), Motion,
  lucide-react, DM Sans via `next/font`.
- **Charts:** TradingView lightweight-charts v5. Re-fit the chart after `autoSize` measures its container.
- **State:**
  - **Zustand** with `persist` in a single versioned localStorage store (v3), with migrations from v1 and v2 and a
    safe reset on corrupt data.
  - The user id is persisted on first load.
  - **TanStack Query** handles market data. **Zod** validates content and API input.
- **`lib/engine/`** holds pure, tested logic:
  - dates (IST);
  - SIP replay (worst dip, return);
  - trailing returns (CAGR) and the 52-week range;
  - portfolio (average cost, P&L, fractional units, a configurable balance label);
  - SIPs (wallet-gated collection, missed months, pause/resume with no back-charge, the next SIP date);
  - the monthly streak with N freezes;
  - persona rules, milestones, and referral codes and rewards.
- **`lib/market/`** holds the instrument list, the Yahoo and mfapi parsers, and `getHistory`/`getQuotes` with an
  explicit `live` flag and an in-memory snapshot cache.
- **API routes:** `/api/history`, `/api/quote` (allow-listed symbols, 400 otherwise) and `/api/card` (OG image).
- **Pages:**
  - `/` · `/stocks` · `/stocks/[symbol]` · `/funds` · `/funds/[symbol]` · `/funds/[symbol]/sip` · `/search`
  - `/practice` · `/practice/time-machine` · `/learn/[lessonId]`
  - `/holdings` · `/sips/[id]` · `/orders`
  - `/share/[key]` · `/refer` · `/r/[code]`

  Decode route params safely, so a malformed escape never causes a 500.
- **Design tokens:** brand `#0B7A55`, mint `#E8F8F2`, ink `#1B1D29`, muted `#5B5E6E`, line `#E6E8EC`, loss
  `#C0392B`, streak `#F08A24`. Radii 12/14/16/24; touch targets ≥44px; 52px primary buttons.

---

## 6. Acceptance criteria

- [ ] Every brief item (MVP 1–5, share cards, referrals) is reachable and working on the deployed URL.
- [ ] More than 110 unit tests pass, covering every money, streak, SIP, referral and migration rule, including
      edge cases:
  - resume without back-charge;
  - wallet too low → missed month;
  - selling a whole fractional holding;
  - start date before the data begins;
  - stale or corrupt saved state;
  - a double-tapped confirm.
- [ ] A Playwright E2E covers the full journey, passing both locally on a production build and against the live URL.
      Steps: hints → explainer → practice buy → demo buy → watchlist → go-real → ₹250 SIP → +1 month ×2 → 3-month
      streak → pause SIP → orders → share card → referral → new-user invite.
- [ ] 0 console errors and no horizontal overflow on every route at 360 and 390px.
- [ ] A public GitHub repo with one reviewed PR per feature, green CI, and Vercel auto-deploy from `main` (Root
      Directory set to the app folder).
- [ ] The README contains the disclaimer, the live link, a brief-coverage table (brief item → screen), a 5-minute
      demo script and run instructions.

---

## 7. Possible next iteration (not part of the current build)

Night mode, accessibility (axe) and Lighthouse ≥90, a responsive desktop layout with a sidebar, an installable PWA,
a personalised "next best step" card (education, not advice), deeper gamification (XP from learning and consistency
only; levels Seed → Grove; weekly quests), a full Hindi version with a toggle, a real-visitor funnel dashboard
(anonymous events in Upstash Redis), and a walkthrough GIF in the README.
