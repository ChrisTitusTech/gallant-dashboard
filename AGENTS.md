# Gallant Dashboard conventions

## Completion and deployment

The user has given standing authorization to commit, push to `origin/main`, and deploy completed task-owned changes to https://whoop.3spinningplates.com using `ssh 3plates`. Complete relevant checks before publishing and deploying. Do not ask for repeated authorization. Honor any later explicit stop point or narrower scope.

Use the release activation, backup, and rollback procedures documented in README.md. Reuse one task-scoped SSH multiplexed connection and close it when finished. Verify public readiness, desktop/mobile smoke checks, and service logs after deployment. Keep unrelated services intact and never commit or print secrets or real member data.

Report the published commit, deployed release, validation results, and any remaining blockers. Do not report full success if deployment or required validation failed.
