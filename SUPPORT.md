# Support

Try the [synthetic demo](https://whoop.3spinningplates.com/demo) to see how the dashboard works without connecting an account. Setup and operations instructions are in the [README](README.md).

## Sign-in errors or "Not found"

Start at the [dashboard home page](https://whoop.3spinningplates.com/) and begin a fresh connection. Do not reuse a callback URL: OAuth state is browser-bound, expires, and can be used only once. Keep cookies enabled and finish sign-in in the same browser.

For self-hosted instances, check `PUBLIC_URL`, the WHOOP application's registered callback, and reverse-proxy routing. The hosted callback is exactly `https://whoop.3spinningplates.com/callback`. Do not post callback query strings in issues because they may contain authorization codes or state.

## Missing or delayed history

Check account sync status and allow the initial import to finish. Imports paginate through available history and may pause for rate limits. Use the account controls to retry a full import if necessary. Missing or unscored WHOOP records appear as gaps, not zero scores. Dates follow WHOOP cycles and recorded timezone offsets.

For operators, `/ready` checks database access and worker heartbeat. Inspect both `gallant-web` and `gallant-worker` service logs using the README operations commands. Register the v2 webhook for event-driven updates; scheduled reconciliation also runs independently.

## Sharing and account controls

Dashboards are private until a member enables sharing. Anyone with an enabled sharing link can view the shared dashboard details. Revoking the link disables access. Disconnecting WHOOP stops imports and disables sharing while retaining private history; account deletion removes the account and its stored records from the active database. Operators must account for retained backups as described in the recovery instructions.

## Get help

[Open an issue](https://github.com/ChrisTitusTech/gallant-dashboard/issues/new/choose) with the affected page path (without query strings or sharing tokens), browser, deployment type, expected behavior, and reproduction steps. Use synthetic or redacted screenshots. Do not post health records or credentials.

Report security problems through [private vulnerability reporting](SECURITY.md), not public issues. WHOOP account, device, and subscription problems should be handled through WHOOP support.
