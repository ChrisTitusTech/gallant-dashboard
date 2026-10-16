# Implementation and acceptance

- [x] Foundation, migrations, configuration, CI definition
- [x] WHOOP OAuth, private sessions, isolation, token rotation
- [x] Durable full-history imports, webhooks, reconciliation, rate budgets
- [x] Responsive dashboard, comparisons, details, exports, sharing
- [x] Automated unit, database, and browser acceptance
- [x] Independent production deployment, HTTPS, backups, restore verification
- [ ] Confirm v2 webhook registration in the WHOOP Developer Dashboard
- [x] Member authorizes WHOOP; all six initial imports complete without errors
- [ ] Compare representative recent and historical records with WHOOP

Development remains entirely in this repository. Existing 3plates application and database are independent.
No credentials or real member records may be committed. Public sharing is opt-in and includes full dashboard details, never raw payloads or account information.

## Verified on 2026-10-16 UTC

- 8 unit tests, 12 PostgreSQL integration tests, and 8 desktop/mobile browser tests passed.
- Type checking, ESLint, production build, ShellCheck, shell syntax checks, and `shfmt -d` passed.
- Multi-year history, pagination, date selection, dialog keyboard behavior, private/public separation, and sharing preview covered in browser tests.
- Production desktop/mobile smoke tests passed against the actual HTTPS deployment. Screenshots inspected. `node deploy/smoke.mjs` reproduces these checks without importing or changing member data.
- Application revision `e2e1114` deployed at `/opt/gallant-dashboard/releases/e2e1114` and selected by `/opt/gallant-dashboard/current`.
- Web and worker run as `gallant`, are enabled for boot, and passed an actual service restart. No host reboot was performed.
- `/ready` returns ready, service restart counters are zero, and post-restart warning/error journal inspection was clean.
- Database and API listen only on `127.0.0.1:5433` and `127.0.0.1:3100` respectively.
- Production environment files are root-owned mode 600. A mode-600 ignored `.env.production` is the local recovery copy; original `.env` remains untouched. Tracked-file secret scan passed.
- Caddy serves the WHOOP hostname over valid HTTPS. Existing 3plates and forum routes still return HTTP 200; 3plates API health passes.
- WHOOP accepts the authorization redirect and routes to its login flow with the exact callback and offline scope. Subsequent live sign-in and all six initial imports succeeded.
- Anonymous private-data and export requests return 401. Missing share links return 404; shared HTML and APIs use no-store and noindex headers.
- Nightly backup timer enabled; backup service executed successfully. A full database dump was restored to a temporary scratch database and validated, then that scratch database was removed. At the time of validation, production had zero members and zero imported records.

## Resolved deployment findings

The initial deployment found cached Node package permissions that prevented unprivileged services from reading dependencies. The activation script now copies packages, normalizes public release-file permissions, and imports runtime dependencies as the service user before activation. A first-install rollback path also incorrectly resolved a nonexistent current link; it now resolves only existing targets. Both fixes are committed and the subsequent release is healthy.

Static serving originally replaced the application's no-store header. This was corrected and covered by a production-static integration test before the final release.

## Remaining external acceptance

No connected browser session was available to edit the WHOOP Developer Dashboard. Verify its v2 webhook URL is `https://whoop.3spinningplates.com/api/webhooks/whoop`, and its privacy URL is `https://whoop.3spinningplates.com/privacy`. The OAuth callback is `https://whoop.3spinningplates.com/callback`.

Live authorization and initial history imports are complete. Compare representative dates against WHOOP and confirm a real webhook updates the dashboard. Fixture tests cannot prove actual account history coverage or webhook registration.

Implementation commits are published on `main`; GitHub Actions validation passed for revision `af36345`. Backups are on the VPS; off-server backup transport is not configured.

## Historical analytics enhancement

- [x] Sleep stages, hours versus need/debt/naps, efficiency, consistency, and local timing charts
- [x] HRV/resting-heart-rate charts with prior 28-day baselines and observation counts
- [x] Yearly recovery/strain/sleep calendar with accessible daily drilldown
- [x] Synthetic demo, privacy/isolation regression checks, desktop/mobile browser validation

Implementation and acceptance details are in [the analytics plan](docs/analytics-plan.md). The user subsequently authorized push and deployment as the default completion workflow; see AGENTS.md.

## Shutdown and dependency fixes

- [x] Reproduce the worker shutdown hang with `PGMAX_LIFETIME=1`; normal idle connections alone do not reproduce it.
- [x] Bound Postgres.js pool teardown to five seconds after completing the current job and releasing the singleton lock. Regression verifies normal process exit and lock availability for a replacement.
- [x] Upgrade `@fastify/static` to 10.1.6 and override only the vulnerable transitive esbuild used by `@esbuild-kit/core-utils` to the patched 0.25 series. Migration generation verified in a temporary directory.
- [x] Add a dependency-audit CI gate; the current lockfile has zero known vulnerabilities.
- [x] Split chart dependencies into their own production bundle, removing the bundle-size warning.
- [x] Validate 14 unit tests, 13 database integration tests, and 12 browser tests, including encoded-path rejection and worker shutdown. Typecheck, lint, production build, ShellCheck, formatting checks, and migration generation pass.

Postgres.js documents bounded teardown in its [cleanup guidance](https://github.com/porsager/postgres#teardown--cleanup). The regression specifically exercises an expired reserved connection; increasing systemd's stop timeout would not resolve the hang.

## Cycle dates and lifetime statistics

- [x] Reproduce and fix pre-midnight cycles collapsing onto the previous date; anchor to main sleep local wake date without rewriting raw history.
- [x] Cover recovery-linked sleeps without cycle IDs, nap exclusion, timezone boundaries, workout alignment, and stable input ordering.
- [x] Add full-history averages, extrema with dates, coverage counts, nightly sleep/nap totals, workouts and duration, and green recovery days.
- [x] Verify lifetime values remain independent of date filters and isolated per member, including shared dashboards.
- [x] Pass 17 unit, 13 database integration, and 14 desktop/mobile browser tests; typecheck, lint, production build, and dependency audit pass.
Release acceptance: publish and deploy, then verify the October 15 projection against production records and run desktop/mobile smoke checks. Report live evidence with the deployed revision.

## Workout explorer, correlations, and year comparisons

Scope: three navigation views using member-scoped imported data. Workout filters cover sport, duration, strain, and zone time with sortable results, weekly hours, and daily drilldown. Correlations show date-matched scatter points, Pearson r, paired counts, and explicit same-day/next-day alignment; fewer than ten pairs or constant values do not produce a coefficient. Year comparisons match month/day observations across two years and show monthly averages and coverage, preserving missing values and leap-day differences.

Acceptance: synthetic unit coverage for filters, missing values, correlation alignment/variance, leap years and partial years; API isolation and date-range boundaries; desktop/mobile controls, empty states, and screenshots. Run project checks, database/browser suites, audit, CI, and production smoke checks. No schema change; deployment uses existing backup and release rollback.
- [x] Implement and test calculations and API data projection.
- [x] Implement and validate all three desktop/mobile views.
Validation: 20 unit, 13 database integration, and 18 browser tests pass, along with typecheck, lint, build, ShellCheck, and dependency audit. Release acceptance requires push, deployment, live readiness, service-log review, and the expanded desktop/mobile smoke checks; report evidence with the deployed revision.

## Review recommendations
Implement local-date defaults, redacted log paths, accessible mobile navigation, immutable asset caching, URL-backed view controls, revision-aware history reuse, per-kind sync/completeness, and server-enforced selective expiring shares. Prepare encrypted off-server backups, periodic restore verification, and operational monitoring; destination/delivery configuration requires user input.
Acceptance: timezone/keyboard/history browser regressions, share restrictions and cache invalidation API tests, unit coverage, project gates, deployment smoke/readiness/log checks. Preserve existing share policy for existing links. Additive migration; do not roll back to code that ignores sharing restrictions after enabling restricted shares.

- [x] Local date, navigation keyboard/focus, URL controls, token redaction, static asset cache, restricted sharing, completeness, and history reuse implemented.
- [x] 23 unit tests and 15 database tests passed. Desktop/mobile suite passed 22 tests, with two additional context-reuse cases passing separately. Build, typecheck, lint, audit, and ShellCheck pass.
- [x] Encrypted off-server backup round-trip and upload-failure handling verified using synthetic data and a mocked transport.
- [ ] Off-server destination/recipient and alert delivery hook: user configuration pending. No real external transfer or message has been sent.
Release verification: run full CI and production smoke/readiness, a real scratch restore, and monitor status after deployment. Report pending configuration separately from successful application deployment.
