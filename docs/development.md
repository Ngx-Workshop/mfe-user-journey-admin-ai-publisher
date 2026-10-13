# Development and verification
Updated 2026-10-12. Use Node 22 and the committed lockfile.

| Purpose | Command |
| --- | --- |
| Install | `npm ci` |
| Architecture | `npm run check:architecture` |
| Local dev with MCP proxy | `npm start` |
| Production build | `npm run build` |
| Isolated verification build | `npm run build -- --output-path dist/console-verification` |
| Behavior tests | `npm test -- --watch=false --browsers=ChromeHeadless` |
| Strict source/unused checks | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` |
| Test types | `npx tsc --noEmit -p tsconfig.spec.json` |

Production connection uses the Connect Ngx Workshop button, real account login and catalog consent. No pasted bearer token is required. Full-page OAuth must start on the exact registered production console callback; standalone development builds can exercise the protocol with test doubles. Do not put credentials in files, URLs or source configuration. Browser bearer tokens last at most ten minutes and reconnect explicitly; legacy shell sessions do not authorize MCP.

Tests in testing/app mirror runtime folders. The protocol test intercepts fetch
and validates the real SDK’s modern handshake/discovery/call headers and arguments.
Store tests cover errors, schema validation, duplicate requests and disconnect races.
Presentation tests cover empty lists, ordered outline/drilldown and inert lab content.
These are synthetic doubles, not live OAuth/catalog verification.

Manual acceptance: check disconnected/loading/error/empty/content states, labeled
keyboard submissions, narrow and desktop layouts, expiry and callback validation and disconnect during
requests. Use the admin shell’s remote override for localhost:4201/remoteEntry.js.
See specs/003-console-oauth/handoff.md for production registration and evidence. CI and deployment retain architecture/tests/build checks.

## Publishing acceptance

The local proxy routes /api/publisher to the local gateway /publisher facade. Publishing requires an actual platform administrator sign-in and an enabled gateway even in local-public catalog mode. Standalone preview can display forms without signing in. The API has a 180-second timeout; a timeout may leave the server run active. Keep the displayed request ID and inspect the receipt before another publish. Model generation needs server-only model/API credentials. Live model and owning-service acceptance remains pending; synthetic behavior tests do not prove deployment.
