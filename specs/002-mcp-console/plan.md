# Implementation plan: MCP catalog console
Status: Implemented; integration pending
Spec: [spec.md](spec.md)
Updated: 2026-10-12

## Baseline and design
Clean adopted seed; Angular 21.1.0, existing federation and MVVM guard.
FR-001/002: stateless McpApiService opens SDK clients with bounded requests and
returns a connection abstraction. McpConsoleStore owns connection/data/epoch state.
FR-003/005: scoped ConsoleViewModel owns typed connection/tool forms and switchMap connection stream and exhaustMap tool stream bound to component lifetime.
FR-004: presentation ResultComponent consumes a typed union with published DTOs,
validated against published runtime output schemas before rendering. Content is
text, never executable HTML, including markdown and starter code.
FR-006: disconnect invalidates generation, closes the SDK client and clears results;
late connect/call completion cannot resurrect a closed connection.

## Constitution
One remote/one responsibility; no nested remotes or backend recreation. Keep exports,
versions and hello-world alias. All API work lives in api; singleton state has no
forms/UI dependencies. Standalone Material + shell tokens, inline BEM/OnPush.
Published DTOs and runtime contract consumed; no producer contract changes.

## Verification and external dependencies
Test connection handshake over synthetic fetch, argument mapping, duplicate command
suppression, cancellation races, errors and rendered outputs. Run architecture,
strict types, ChromeHeadless and production build. Inspect standalone responsive UI.
Dev proxy is local only. Production gateway currently has no browser MCP CORS;
admin host /mcp ingress and browser OAuth registration are external handoffs.
No deployment or credentials minted in this work.
