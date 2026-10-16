# Historical analytics implementation plan

Scope: the three recommended additions approved in conversation: sleep analytics, personal HRV/resting-heart-rate baselines, and a yearly calendar heatmap. Workout exploration, correlations, journals, and weekly reports remain future work.

## Phase 1: calculations and API

- Add explicit analytics projections using existing member-scoped records; no migration or new OAuth scopes.
- Sleep: main-sleep stage totals, hours versus WHOOP need, debt contribution, efficiency/consistency, recorded-local bedtime and wake time. Keep naps separate. Preserve missing values and zero.
- Recovery: daily HRV and resting heart rate versus the preceding 28 calendar days, excluding the current day. Require at least seven valid observations per metric; show observation counts and gaps. Fetch context before the selected range.
- Calendar: independent full-year view of strain, sleep, or recovery, with missing dates distinct from zero and future dates disabled. Retain existing tenant/sharing boundaries.
- Unit checks: signed nap adjustment, missing fields, naps, timezone boundaries, baseline warmup and gaps, leap years.

## Phase 2: interface

- Add sleep charts to Sleep and baseline charts to Recovery, preserving the compact overview.
- Add an overview calendar with year/metric selectors, month labels, accessible day buttons, and day-detail drilldown including dates outside the selected chart range.
- Use existing Recharts and visual styling. Long sleep/recovery series use weekly/monthly averages with clear labels; calendar always shows individual days.
- Synthetic demo includes varied stages, timing, and naps. No real member data enters fixtures or screenshots.
- Browser checks cover controls, details, empty data, keyboard access, and desktop/mobile overflow.

## Phase 3: acceptance

Run typecheck, lint, unit tests, build, isolated PostgreSQL integration tests, and desktop/mobile browser tests. Inspect screenshots and review the final diff. Record validation and make coherent local commits. The user subsequently authorized automatic push and deployment for completed project work. Publish to main and use the existing release activation workflow; no database schema changes are necessary. Rollback is reverting the application commits.

## Progress

- [x] Calculations and API verified
- [x] Interface and browser acceptance verified
- [x] Documentation, final checks, and local commits complete

## Acceptance evidence

- 14 unit tests pass, including baseline warmup/context, sparse records, complete sleep-stage grouping, signed nap adjustment, leap years, and long-range aggregation.
- 12 PostgreSQL integration tests pass; existing member isolation and revocable sharing checks now cover analytics/calendar payloads.
- 12 distinct desktop/mobile browser cases pass, including the new views, out-of-range calendar drilldown, empty histories, future dates, and keyboard activation.
- TypeScript, ESLint, production build, Prettier, and diff whitespace checks pass. The existing Vite bundle-size advisory remains (approximately 203 KB gzipped).
- Synthetic desktop sleep/calendar and mobile recovery screenshots inspected. Mobile screenshots disable animations to capture the settled navigation state.
- No dependency, database schema, server configuration, or OAuth permission changes. Publication and deployment follow the standing authorization in AGENTS.md, with live smoke checks for the new features.

The sleep-need calculation now adds WHOOP's already-signed nap adjustment. The regression test first reproduced the incorrect 9.5-hour result for an 8.5-hour requirement. Field reference: https://developer.whoop.com/api/.
