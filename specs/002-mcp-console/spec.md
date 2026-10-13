# Feature: MCP catalog console
Status: Implemented; integration pending
Feature ID: 002-mcp-console
Created / updated: 2026-10-12
Request: Build an admin experience for service-mcp-gateway.

## Problem and scope
Administrators need to connect to the MCP gateway and explore its public catalog.
The copied seed currently exposes unrelated CRUD. This feature replaces that UI
with connection, discovery, guided tool calls and readable/raw results. Publishing,
AI conversation, domain mutations and OAuth client registration are outside scope;
the gateway currently offers only three read-only tools.

## Functional requirements
- FR-001: Connect/disconnect using a configurable MCP URL and in-memory bearer token.
- FR-002: Discover server identity and available tools; enable only known read-only tools.
- FR-003: Validate section/workshop IDs and lab/version ObjectIds before calling.
- FR-004: Show workshop summaries, ordered outline and published lab content, plus raw JSON.
- FR-005: Expose busy, empty, access failure, protocol failure and tool error states; retain inputs for retry.
- FR-006: Clear connection results and credentials on disconnect; ignore late responses.

## Acceptance
- AC-001: Connect performs the official SDK handshake and discovery; displays identity and tools.
- AC-002: Invalid input causes no request; valid input runs the selected tool once.
- AC-003: Successful and empty lists, workshop outlines and lab prompt/code/hints/tests render safely as text.
- AC-004: Failures retain inputs and allow retry; disconnect during a request prevents stale updates.
- AC-005: Keyboard labels, status announcements and narrow layouts support the whole journey.

## Quality and contracts
Use feature MVVM, inline OnPush components, typed forms, shell tokens and mirrored tests.
Consume @tmdjr/service-mcp-gateway-contracts 1.0.0 and official MCP client 2.3.1.
No tokens in storage, URLs, logs or result history. HTTPS required except loopback.
Preserve App/default App, federation exposures and existing hello-world route alias.
Standalone dev proxies /mcp to localhost:3011. Host must provide an equivalent
same-origin route or gateway-approved CORS. Local checks use HTTP doubles;
live host/OAuth acceptance is separately pending.

## Decisions
Use an explicitly supplied catalog:read access token for this iteration. Browser
OAuth login needs an approved client ID/callback and cannot reuse legacy cookies.
The endpoint defaults to same-origin /mcp; it is an integration contract to configure,
not a claim that the deployed admin host already proxies this path.
