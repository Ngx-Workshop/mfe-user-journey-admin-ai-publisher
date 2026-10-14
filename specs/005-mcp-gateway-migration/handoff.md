# Handoff: MCP Gateway migration

Status: Implemented; integration pending
Updated: 2026-10-13
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)

## Delivered behavior

MCP catalog console, scoped VM, singleton MCP/OAuth state, SDK transport, PKCE, result validation/rendering and mirrored tests moved from AI Publisher into mfe-user-journey-admin-mcp-gateway. The destination replaces the seed example runtime/tests/contracts dependency, defaults to overview and exports overview App; hello-world is removed. Console heading/SDK identity/PKCE storage key now identify MCP Gateway.

AI Publisher directly composes the unchanged workshop-publishing feature with its publisher heading. Publishing API/models/store/VM/component files and existing console/legacy routes are unchanged. SDK-only dependency removed from Publisher; gateway contracts/Ajv remain required for publishing.

## Acceptance and verification evidence

| Scenario/check | Method | Result and limit |
| --- | --- | --- |
| AC-001/002 composition, tool and publishing behavior | ChromeHeadless suites | PASS: Gateway 30 tests; Publisher 7 tests; synthetic HTTP/fetch/store doubles |
| AC-003 route exports / AC-004 callback and PKCE validation | Gateway route and OAuth tests | PASS; overview callback and replacement of hello-world verified |
| Architecture | npm run check:architecture in both MFEs | PASS; inherited cohesive component-size review warnings documented |
| Source types | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json in both | PASS |
| Test types | npx tsc --noEmit -p tsconfig.spec.json in both | PASS |
| Production federation builds | npm run build -- --output-path dist/migration-verification in both | PASS; does not overwrite watcher output |
| Whitespace | git diff --check in both | PASS |
| Local UI | Running watcher at http://localhost:4201 | PASS: Gateway heading, disconnected connection state, three tools, disabled Run and empty result; selecting Inspect a workshop reveals Workshop ID |
| Admin shell route | Browser navigation to https://admin.ngx-workshop.io/mcp-gateway/overview | NOT VERIFIED: shell reports NG04002 and returns to root; original hello-world displayed the seed example. Local rebuilt route export contains overview. Confirm session override/deployed remote and shell registry/useRoutes configuration. |
| Live OAuth / publication | Actual auth/owner services | NOT RUN; no credentials, paid model calls or domain writes performed |

## Contract and consumer handoff

Auth configuration owner: add exact callback https://admin.ngx-workshop.io/mcp-gateway/overview to public client ngx-workshop-ai-publisher-prod before live sign-in. Keep issuer/resource/catalog:read/PKCE/no-refresh policy intact. Existing client ID intentionally retained; no new server client is assumed. Approve new URI before removing the former /ai-publisher/console callback after rollout.

Shell/orchestrator owner: load the updated Gateway ./Routes under mcp-gateway, use overview in navigation links, and confirm the browser's local override points at http://localhost:4201/remoteEntry.js when testing locally. No shell source, live navigation data, auth registration or production deployment changed here.

## Remaining work and next action

Local T001–T004 complete. X001: approve redirect and exercise real sign-in/consent/return to overview, expiry and reconnect after loading the new bundle in the shell. Release both MFEs together to avoid duplicate/missing catalog UI during rollout. In-flight OAuth transactions from the old page must be restarted. No stored content migration.

## Context maintenance

Updated both READMEs, architecture/development/testing guides, AGENTS entry descriptions and feature indexes. Historical specs remain as historical evidence; current ownership is documented here.

## Callback registration update — 2026-10-13

The user reported invalid_redirect_uri after moving the console and authorized the callback update. The live public client ngx-workshop-ai-publisher-prod now also approves the exact https://admin.ngx-workshop.io/mcp-gateway/overview redirect. Retained /ai-publisher/console for rollout compatibility. No other client records, keys, origins, scopes, resource configuration or image changed. The private config was backed up under /opt/ngx-releases/mcp-overview-callback-20261014T001405Z; mounted inode/UID1000/mode0600 preserved. Production loadConfig validation passed, then the existing ngx-auth-service container was restarted and readiness passed.

Live authorization checks after restart: new overview and previous console callback each redirect to the auth sign-in interaction; an unregistered /mcp-gateway/unregistered callback still returns 400 invalid_redirect_uri. This verifies registration acceptance without completing a user sign-in or issuing a token. Encrypted recovery escrow refreshed through the existing application backup operator: ops-recovery/ngx-oauth/20261014T001427Z/application-secrets.tar.gz.gpg; private upload checksum/size and anonymous-access rejection verified.
