# Security policy

## Supported versions

Security fixes target the latest code on `main`. Older commits and self-hosted deployments should be updated after reviewing migrations and deployment instructions.

## Report a vulnerability privately

Use [GitHub private vulnerability reporting](https://github.com/ChrisTitusTech/gallant-dashboard/security/advisories/new). Do not open a public issue for an unresolved vulnerability.

Include the affected revision, steps to reproduce using synthetic accounts or fixtures, expected and actual behavior, and the likely impact. Useful areas include account isolation, OAuth/session handling, public sharing, exports, webhook verification, and token storage.

Never submit real health records, client secrets, access or refresh tokens, session cookies, database dumps, or active sharing links. Redact sensitive values from evidence. Test only accounts and systems you are authorized to use.

Reports are reviewed by the project maintainer; no guaranteed response time or paid bounty is offered.

## Deployment responsibilities

Operators must protect environment files, encryption keys, database access, and backups. Read the [deployment and recovery guidance](README.md#production-deployment). Backups contain sensitive records even though stored WHOOP tokens are encrypted. The default deployment keeps backups on the same host; off-server recovery requires separate configuration.
