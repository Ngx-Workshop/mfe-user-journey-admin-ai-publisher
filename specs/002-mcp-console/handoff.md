# Handoff: MCP catalog console
Status: Implemented; integration pending
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)
Updated: 2026-10-12

## Delivered behavior
The seed CRUD journey and its dependency/tests are replaced by a read-only MCP
console. It connects using the official client, discovers the gateway identity and
tools, validates guided arguments, and displays workshop summaries, ordered outlines,
published lab prompts/code/hints/public tests and expandable structured JSON.
Workshop/lab drilldown prefills identifiers. Loading, empty, validation, execution,
protocol and authorization failures preserve input for retry. Disconnect clears
results, credentials and identity; abort/epoch checks prevent stale connection/call
completion. No browser credential storage, cookies, HTML execution or publishing.

## Verification evidence
| Check | Result | Limits |
| --- | --- | --- |
| npm run check:architecture | PASS | Feature folders, MVVM boundaries, inline BEM, typed OnPush components |
| Strict app types + unused checks | PASS | tsconfig.app.json |
| Test types | PASS | tsconfig.spec.json |
| ChromeHeadless behavior tests | PASS: 17 tests | Synthetic fetch/API doubles, not live catalog/OAuth |
| Production federation build | PASS | dist/console-verification; retained budgets |
| git diff --check | PASS | No whitespace errors |
| Browser disconnected layout | PASS | Narrow viewport and wider two-column layout; no horizontal overflow in observed DOM |
| Keyboard validation | PASS | Enter submitted insecure URL; safe actionable error appeared, no network request |
| Real gateway from admin host | PENDING | Host MCP ingress/CORS and valid OAuth bearer required |

Protocol fixture implements the 2026-07-28 server/discover, complete result,
cache metadata and SDK identity metadata. It verifies bearer headers, omitted
cookies, rejected redirects, tool discovery and argument mapping. Other tests
verify all three result types, empty lists, ordered outline and drilldown, text
safety, malformed output, errors/retry, input validation, duplicate suppression,
late completion and pending-handshake abort. Initial fixture-shape failures were
corrected to match the actual SDK; final suite passes.

## Contract and external handoff
- service-mcp-gateway: @tmdjr/service-mcp-gateway-contracts 1.0.0 consumed from registry.
  Three tool/output contracts unchanged; no service files edited.
- mfe-shell-admin / nginx-ngx-workshop.io / service-mcp-gateway: provide /mcp on the
  admin origin, forwarding the canonical gateway Host and required trusted ingress
  headers without changing token audience, or explicitly approve browser CORS.
  Allow MCP content/version/method/name/auth headers as required by the SDK.
  Do not use retired /api/mcp-gateway (410). Verify connect, all three reads, token
  expiry/revocation and disconnect from the real admin host after configuration.
- service-auth: browser OAuth client/callback approval is required for future PKCE
  sign-in. Current console takes an existing catalog:read token in memory.
- Local dev uses proxy.conf.json to localhost:3011. Static bundle hosting has no proxy.
- Federation exports and Angular shared versions unchanged. Routes now default to
  console with hello-world retained as a redirect. No deployment or publishing done.

## Context and next step
README, AGENTS, architecture/development/testing guides and feature index updated.
001 seed feature records remain historical. Preview dev server is localhost:4322
for this session; normal npm start defaults to 4201.
Next: configure the admin browser connection path and verify real OAuth/catalog
calls before deployment. X001 remains pending; X002 is a future enhancement.

SDK reference: https://ts.sdk.modelcontextprotocol.io/v2/clients/connect
