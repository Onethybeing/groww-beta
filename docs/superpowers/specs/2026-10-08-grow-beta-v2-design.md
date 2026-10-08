# GROW Beta v2: Polish, Personalisation, Hindi and Insights — Design Spec

**Date:** 2026-10-08 · **Builds on:** `2026-10-07-groww-genz-starter-design.md` (revision 3) · **Status:** Draft for review

## Intent

Take the live GROW Beta demo (https://groww-beta.vercel.app) from "complete" to "polished and measurable":

- the two post-MVP items left out of the first build (personalised next step, deeper gamification);
- reviewer-facing evidence (a walkthrough GIF and a funnel dashboard measuring the brief's goals);
- quality work (accessibility and speed, desktop layout, installable PWA);
- night mode and a Hindi version.

**Success criteria**
- Every new feature works on mobile (360–430px) and desktop (≥1024px), in light and dark, in English and Hindi.
- axe finds 0 serious or critical violations on every route.
- Lighthouse mobile scores are ≥90 for Performance, Accessibility and Best Practices.
- The existing guardrails still hold:
  - no real-time prices;
  - rewards only for learning, consistency and referrals;
  - the starter fund is shown as education, not advice;
  - no ₹ amounts on share cards.
- Each item ships as its own reviewed PR, with CI green and an automatic Vercel deploy.

**User decisions:** Hindi covers the whole app with a toggle. Analytics come from real visitors stored in a free
Upstash Redis. Desktop gets a responsive web-app layout.

## 1. Night mode

- **Tokens.** `globals.css` defines semantic CSS variables in `:root` and redefines them under `.dark`:
  - `--bg`, `--card`, `--surface`, `--ink`, `--muted-ink`, `--line`
  - `--mint`, `--brand` (#0B7A55 / dark #33C48E), `--brand-ink`, `--loss`, `--streak`
  - `--tip-bg`, `--tip-line`, `--warn-bg`, `--warn-ink`

  Tailwind theme colours map to these variables. Every hard-coded colour class in components (`bg-white`,
  `text-[#3D4050]`, `bg-[#F1F2F4]` …) is replaced with a token class.
- **Preference.** `theme: "system" | "light" | "dark"` lives in a small persisted UI store (`grow-ui`). An inline
  script in `<head>` applies the `dark` class before paint, so there's no flash. A toggle (sun/moon/auto) sits in the
  app header.
- **Charts.** lightweight-charts colours are read from the current tokens and update when the theme changes.
- **Fixed in light:** the share card PNG and the OG image.
- **Tests:** a unit test for the theme resolver; the e2e test takes a dark-mode screenshot check (no contrast failures, via axe).

## 2. Accessibility and speed

- **axe:** `@axe-core/playwright` scans each route (the same 15 routes as the overflow crawl) in light and dark at
  390px. A serious or critical violation fails CI.
- **Lighthouse:** run against the production URL in mobile mode (`npx lighthouse`). Record the scores in the PR. Fix
  findings: image sizes, font preload, `lightweight-charts` loaded with `next/dynamic` and SSR off, tap-target sizes,
  labels, and headings in order.
- **Done when:** 0 serious or critical axe issues, and Lighthouse mobile ≥90 for Performance, Accessibility and Best Practices.

## 3. Desktop layout

- **Below 1024px:** unchanged (phone layout with the bottom tab bar).
- **At 1024px and above:**
  - The 430px frame is removed.
  - A fixed **left sidebar** (240px) shows the GROW logo and the nav: Home, Stocks, Mutual Funds, Practice, Holdings,
    and Quests.
  - The theme toggle and language switch sit at the sidebar bottom, and the tab bar is hidden.
  - Content gets `max-width: 1120px`.
- **Two-column pages at 1024px and above:**
  - **Home:** Explore on the left; Watchlist, Market today and Next best step on the right.
  - **Stock/Fund detail:** chart and info on the left; a sticky order panel on the right (Practice buy / Buy / Start
    SIP) instead of the fixed bottom footer.
  - **Holdings:** summary and the habit card on the left; holdings lists on the right.
  - **Practice:** the virtual portfolio on the left; Time Machine, quests and basics on the right.
- **Sheets:** bottom sheets become centred dialogs (max 480px) at this width.
- **Tests:** overflow and axe crawls also run at 1280px, and the e2e smoke test runs at 1280px.

## 4. PWA

- `app/manifest.ts`: name "GROW Beta", short_name "GROW", theme #0B7A55, `display: standalone`, `start_url: /`.
  Icons are 192, 512 and a maskable 512, as PNGs in `public/icons` built from the mark.
- `public/sw.js` (hand-written, no library):
  - **Precache** the offline page and the icons.
  - **Navigations:** network-first, falling back to the cache and then `/offline`.
  - **`/api/history` and `/api/quote`:** stale-while-revalidate, since the data is frozen.
  - **Static `/_next/static/*`:** cache-first.
- The service worker is registered in production only, from `AppChrome`.
- `/offline` page: "You're offline. Your practice and progress are saved on this device."
- **Tests:** an e2e check that the manifest is served and valid and that the service worker registers on the
  production build.

## 5. Personalised "next best step"

- **Engine:** `lib/engine/next-step.ts` exports `nextBestStep(state) → { id, titleKey, bodyKey, href, cta }`.
  It is a deterministic rule ladder, and the first match wins:
  1. No answers and the welcome is unseen → "Tell us your goal" (opens the welcome sheet).
  2. No lessons → the lesson matching the persona (Curious Explorer → index-funds, Goal Saver → ups-and-downs, else
     mutual-funds-sip).
  3. No practice trade and no Time Machine run → "Try a practice buy" on the starter fund.
  4. No SIP → "Start a ₹{suggested} SIP" in the starter fund (the category is shown as education).
  5. A paused SIP and no active SIP → "Resume your SIP".
  6. Streak below 3 → "Keep your streak: next SIP on {date}".
  7. Lessons below 3 → the next lesson.
  8. No referrals → "Invite a friend: both get a streak freeze".
  9. Otherwise → "Try this week's quest".
- **UI:** a card on Home (and in the right column on desktop) and in Practice. Copy: "A common next step" and "Not
  investment advice". It never names a specific stock to buy.
- **Tests:** one unit test per rung, with order precedence.

## 6. Deeper gamification

- **Points (XP), awarded only for learning and consistency.** Totals are derived from state, so they can't be
  farmed and always replay the same:

  | Source | XP |
  |---|---|
  | Lesson completed | 20 |
  | Correct quiz answer | +10 |
  | Time Machine runs | 10 each, max 3 |
  | First practice trade | 10, once |
  | Each SIP instalment | 25 |
  | Each streak month beyond the first | 15 |
  | Reflection saved | 5, max 5 |
  | Each weekly quest completed | 20 |

  Practice and real trades beyond the first earn **0**.
- **Levels** (XP thresholds): Seed 0, Sprout 60, Sapling 150, Tree 300, Grove 500.
  `levelFor(xp) → { name, min, next, progress }`.
- **Weekly quests:** three per ISO week of the demo clock, from a fixed rotation. Each is checked against that week's
  events.
  - Explainers and learning: "Open 2 'What's this?' explainers" or "Finish 1 lesson".
  - "Run the Time Machine once" or "Write a note to self".
  - "Keep your SIP on track" (an instalment this month, or an active SIP whose date hasn't come yet).
- **Monthly goal challenges** (one active):
  - "Invest ₹{2× suggested} via SIPs this month";
  - "Add ₹{x} to your goal".

  Progress is derived from the instalments in that calendar month.
- **State:** a new `events: { type, date }[]` log (explainer_open, quiz_correct, note), capped at 500 entries, so
  quests can count week-scoped actions. Everything else is derived.
- **UI:**
  - The Holdings habit card shows the level badge and an XP bar.
  - `/quests` (linked from Practice and the desktop sidebar) shows the level, this week's 3 quests, the monthly
    challenge and earned badges.
  - Completing a quest shows a small toast, never confetti.
- **Tests:** XP derivation (each source, the caps, and 0 XP for repeated trades), the level thresholds, quest
  completion within a week and resetting the next week, and challenge progress.

## 7. Hindi version

- **i18n layer:** `lib/i18n/{en,hi}.ts` dictionaries, typed so `hi` must have every key in `en` (a compile error
  otherwise). `t(key, vars)` does `{var}` interpolation.
- **Hooks and storage:** a `useT()` hook. `lang: "en" | "hi"` lives in the `grow-ui` store, and `<html lang>` updates with it.
- **Content:** `content/lessons/hi/*.json` and `content/glossary.hi.json` mirror the English files. Zod validates
  that structure matches (same ids, same card count and types, same quiz answer index).
- **Not translated:** instrument names and tickers (proper nouns), brand names, and the share-card PNG (English).
- **Dates:** `hi-IN` with Latin digits. Currency stays `₹1,00,000`.
- **Switch:** EN/हिं in the app header (mobile) and the sidebar (desktop).
- **Font:** Noto Sans Devanagari loaded via `next/font` for Hindi text.
- **Tests:**
  - key parity (a type-level check plus a runtime test);
  - lesson structure parity;
  - e2e: switch to Hindi, then the Home heading and tab labels render in Hindi and no English fallback keys show.
- **Note:** the translation is mine and should be proofread by a native speaker before wide sharing (stated in the README).

## 8. Analytics (real visitors)

- **Storage:** Upstash Redis via the Vercel Marketplace (free tier) gives `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
  The `@upstash/redis` client is used server-side only.
- **Client:**
  - `lib/analytics.ts` exports `track(event)`.
  - It uses a random anonymous id (`grow-ui.anonId`) and sends no personal data or amounts.
  - Events go out with `navigator.sendBeacon` to `/api/events`.
  - It is a no-op on localhost unless `NEXT_PUBLIC_ANALYTICS=1`.
- **Events (fixed set):**
  - `visit`, `onboarding_done`, `hints_skipped`, `lesson_done`, `practice_trade`, `time_machine`, `first_sip`,
    `streak_3`, `referral_shared`, `invite_accepted`, `lang_hi`, `theme_dark`, `pwa_installed`;
  - plus a `demo_clock` flag whenever the event happened after demo time travel.
- **Route `/api/events`:**
  - Validates against the allow-list with Zod.
  - Records each event once per anonymous id (`SADD event:{name} anonId`), and counts daily visits with
    `PFADD visits:{yyyy-mm-dd}`.
  - Rate-limited per id (60 per minute).
  - Returns 204. Without Redis env vars it returns 204 and does nothing.
- **`/insights` dashboard** (public, read-only, no per-user data):
  - A funnel: visitors → onboarding done → first lesson → practice trade → first SIP → 3-month streak, with the
    conversion % at each step.
  - Side stats: share of users who chose Hindi or dark mode, invites accepted, hints skipped.
  - A note on which metrics include demo time travel.
  - Built from `SCARD` counts through `/api/insights` (cached 60s).
- **Tests:** the route validates and rejects unknown events, no-ops without env vars, and the funnel math is unit-tested.
- **Approval:** installing the Upstash integration on the user's Vercel account needs explicit approval at that step.

## 9. Walkthrough GIF

- A Playwright script (`scripts/record-demo.ts`) runs the demo script at 390×844 against the production build, with
  video recording on.
- `ffmpeg` (or Python and Pillow if ffmpeg isn't present) converts it to a ≤60-second GIF of about 8MB or less, at
  `docs/demo.gif`.
- The README embeds it at the top. Run it after PRs 1–8, so it shows night mode and Hindi briefly.

## Delivery order (one PR each)

1. Night mode · 2. Accessibility and speed · 3. Desktop layout · 4. PWA · 5. Next best step · 6. Gamification ·
7. Hindi · 8. Analytics · 9. Walkthrough GIF

Every PR runs typecheck, lint, unit tests, `next build` (CI), the e2e test, a code review with fixes, and a deploy check.
Strings added in PRs 1–6 go through `t()` once PR 7 lands; PR 7 converts all remaining strings.

## Out of scope

Real accounts or cross-device sync, push notifications, real market data or orders, and a native app.
