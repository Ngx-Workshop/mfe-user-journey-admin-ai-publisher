# Architecture and external context
Updated 2026-10-12 for [002 MCP console](../specs/002-mcp-console/spec.md).

## Responsibilities and source map
The remote owns an administrator’s workshop publishing and read-only MCP exploration journey. The gateway
owns tools, authentication enforcement and public domain projections. The shell
owns navigation, theme and legacy browser authentication.

`src/app/features/mcp-console` contains:
- `api/mcp-api.service.ts`: stateless factory around official MCP client and Streamable HTTP.
- `models/console.models.ts`: published DTO inputs/results, connection abstraction and known tool choices.
- `state/mcp-console.store.ts`: root connection/server/result state and request orchestration.
- `state/catalog-result.ts`: published JSON schema validation and tool error interpretation.
- `pages/console`: scoped typed forms/VM and OnPush composition view.
- `components/result`: typed input/output presentation for catalog results.

Data flows API → store → VM → view. The VM uses switchMap for replaceable
connection attempts and exhaustMap for tool commands, with takeUntilDestroyed.
Disconnect aborts pending handshake fetches, closes an established SDK client,
invalidates a generation counter and clears shared results. Late requests cannot
restore old state. The VM disposes connections on destruction.
No credential persistence, automatic connection, remote nesting or AI model backend.

The client pins the gateway-supported 2026-07-28 protocol, discovers capabilities,
and advertises its identity. Known tools run only when discovered with readOnlyHint.
Discovery does not grant authorization. SDK request and fetch timeouts are 15 seconds;
requests omit cookies and reject redirects. HTTPS endpoints are required except
loopback HTTP. URL credentials, query and fragments are rejected.

## External contracts and federation
Dependencies: @modelcontextprotocol/client 2.3.1 and
@tmdjr/service-mcp-gateway-contracts 1.0.0. The published runtime output schemas
validate responses before typed display; text is interpolated safely, never executed.
Three commands: list_workshops(sectionId), get_workshop(sectionId, workshopId),
get_coding_lab(labId, versionId?). Tool errors, protocol errors and access failures
are presented separately from results; inputs stay available for retry.

Keep named/default App, named Routes, federation name, ./Component, ./Routes,
remoteEntry.js and Angular shared singletons. Default path now redirects to console;
hello-world redirects there for compatibility. Standalone appConfig owns Material
animations/zoneless setup. Host consumption requires the existing Angular/Material
providers/theme. Fetch-based MCP transport deliberately bypasses shell HttpClient
interceptors to avoid forwarding legacy session credentials.

Browser OAuth uses dedicated public client ngx-workshop-ai-publisher-prod and the exact callback https://admin.ngx-workshop.io/ai-publisher/console. The OAuth API pins auth.ngx-workshop.io and the mcp.ngx-workshop.io/mcp resource. It uses Web Crypto S256, single-use state and issuer validation, and strips callback parameters before redemption. Only the ten-minute pending PKCE transaction enters tab session storage; tokens stay in the SDK connection in memory. OAuthConnectionStore orchestrates sign-in. Connection expiry or a 401 closes the transport and clears results, requiring reconnection. No refresh token or browser client secret.

Both backend production profiles approve https://admin.ngx-workshop.io alongside existing ChatGPT origin. Registered-client token CORS, gateway preflight, and registered callback form CSP are existing server policies. The shell owns legacy sign-in; these cookies do not authorize MCP.

Build output and deployment target remain dist/mfe-user-journey-admin-ai-publisher
and /opt/mfe-remotes/mfe-user-journey-admin-ai-publisher. Deployment and acceptance evidence belong in specs/003-console-oauth/handoff.md.

## Workshop publishing

features/workshop-publishing provides a stateless HTTP facade client, singleton execution/section store, scoped draft-review VM, and an OnPush publishing view. The existing shell administrator session authorizes /api/publisher/tools; catalog OAuth remains independent. Administrators can browse sections, generate a brief-based draft or import JSON, inspect documentation/labs/assessment, validate edits, explicitly publish, and inspect receipts. Inputs and request ID survive failed publication. Editing invalidates the reviewed draft; a publish attempt blocks repeat submission until receipt reconciliation. Shared store blocks overlapping commands; disposed views do not accept late results. Credentials remain in the existing shell session; model credentials stay server-side. Generated contract types/schemas use a committed vendor 1.1.0 package until registry publication.
