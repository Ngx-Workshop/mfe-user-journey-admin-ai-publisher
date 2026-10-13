# Feature: MCP Gateway migration

Status: Implemented; integration pending
Created: 2026-10-13
Request/source: Move MCP Gateway from AI Publisher into its dedicated MFE.

## Problem and scope
Administrators need independent publishing and catalog journeys. Move the entire MCP console, OAuth, SDK transport, state, forms, result display and tests. Preserve workshop-publishing behavior in AI Publisher. Replace the gateway seed example with the real console.

## Functional requirements and acceptance
- FR-001 / AC-001: Opening MCP Gateway at /mcp-gateway/overview shows connection, discovery, three read-only tools and structured/JSON results, with existing loading, error, empty and disconnect behavior.
- FR-002 / AC-002: Opening AI Publisher at its existing console route shows publishing, draft review and receipts, without MCP connection UI or MCP requests.
- FR-003 / AC-003: Gateway root redirects to overview; hello-world is replaced and no longer exported. App/default and Routes federation contracts remain intact.
- FR-004 / AC-004: OAuth uses the exact new overview callback with PKCE validation, in-memory tokens, expiry and credential-free transport preserved.

## Quality and boundaries
Retain Angular MVVM, standalone OnPush, inline BEM styling, typed forms and mirrored behavior tests. Preserve SDK/Angular versions. Auth client registration is external configuration; no production configuration or deployment is changed here. Reuse the existing public OAuth client ID; its approved redirect must be updated by the auth owner. No data migration.

## Success criteria
Both MFEs pass architecture, type, behavior and production build checks. Verify the locally served route in the shell where available. Full OAuth acceptance requires the new redirect registration.
