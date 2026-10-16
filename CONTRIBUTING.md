# Contributing

Bug reports, documentation improvements, and focused pull requests are welcome. Discuss substantial behavior or architecture changes in an issue before implementing them.

## Development

Follow the [README local setup](README.md#local-development). Use Node 24, pnpm 9.15.4, and PostgreSQL 16. Copy `.env.example` only when no `.env` exists, fill in your own WHOOP app credentials, and generate a separate encryption key. Never use production credentials or a production database for development or tests.

The `/demo` route uses synthetic data and is suitable for frontend work without a WHOOP account. Real sign-in requires a WHOOP application with a registered callback matching your configured origin.

## Pull requests

1. Create a branch from `main` and keep the change focused.
2. Preserve member isolation, private-by-default data, revocable sharing, and resumable imports.
3. Add meaningful tests for changed behavior. Use synthetic fixtures only.
4. Run the applicable checks below and describe their results in your pull request.
5. Explain the problem, resulting behavior, and any migration or deployment considerations. Include demo screenshots for visual changes.

Do not include `.env` files, database dumps, OAuth codes, tokens, sharing URLs, or real member records in commits, logs, screenshots, or issue attachments.

## Checks

```bash
pnpm check
pnpm test:db
pnpm exec playwright install chromium
pnpm test:browser
shellcheck deploy/*.sh
shfmt -d deploy/*.sh
```

The [README validation instructions](README.md#validation) include the isolated test database command. Integration tests require a database named `gallant_test` and clear test fixtures. Never point them at a database containing data you need to retain.

`pnpm check` runs TypeScript checks, ESLint, unit tests, and the production build. GitHub Actions also runs database integration tests, Chromium desktop/mobile tests, and ShellCheck. Changes to deployment scripts should additionally pass `bash -n` and formatting checks.

Database migrations live in `drizzle/`. Keep migrations compatible with the previous application release so deployment rollback remains possible. Describe any required backfill or manual operation explicitly.

## Reporting problems

Use the [issue templates](https://github.com/ChrisTitusTech/gallant-dashboard/issues/new/choose) for bugs and feature requests. Follow [SECURITY.md](SECURITY.md) for vulnerabilities and [SUPPORT.md](SUPPORT.md) for troubleshooting.
