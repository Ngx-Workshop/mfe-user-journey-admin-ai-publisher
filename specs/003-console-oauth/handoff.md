# Browser OAuth deployment handoff
Status: Complete; deployed production OAuth connection and all three browser tools verified.

Public console: https://admin.ngx-workshop.io/ai-publisher/console. Dedicated public client ngx-workshop-ai-publisher-prod has that exact callback, S256 PKCE, catalog:read and exact resource https://mcp.ngx-workshop.io/mcp. Issuer https://auth.ngx-workshop.io. Access token stays in memory; no refresh token or client secret. Expiry and unauthorized calls disconnect and discard shared results while retaining tool inputs.

## Validation and release
28 ChromeHeadless tests pass after clean npm ci, including RFC 7636 challenge, valid/invalid/expired/duplicate callback, exact resource/verifier and transaction consumption, timed expiry/late-response fencing and revoked-bearer disconnect. Architecture, strict unused/types and production build pass. CI [38328932588](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/38328932588) passed on reviewed source 912c2c53093edb60cd317238cefe0cedcc6eef99; [PR 1](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/pull/1) merged as 27bf1d6c6fe3567f9150d3c4bf91ca01037436a6.

Deployment workflow has no deployment secrets configured. Deployed the clean-install local production bundle through existing verified SSH access to the existing frontend target; no new CI credential created. Bundle SHA256 40d3ca772f3c3821ed7dff2fb22b710ce24ea76e41a866b15048b59193d8a481, build hash 1ebaa598544501e5. Public remoteEntry.js checksum matches local artifact: 339ada7e24ab3a734f9c7c06e02447ee81cdf43483ee77c3b2b5bd13841c68e1. Release manifest and rollback static files retained at /opt/ngx-releases/publisher-912c2c5 on frontend host. For rollback, replace the active directory with previous-static; retain the current directory for recovery.

The browser had a local localhost:4201 development override; turned it off via the existing orchestrator controls and reloaded the production console before starting OAuth. Owner completed real Ngx Workshop sign-in and catalog:read consent, returned to the console, and the deployed SDK discovered three tools. The callback URL is clean (no code/state/issuer query). The initial handoff expired after ten minutes; a fresh connection succeeded without weakening the lifetime policy.

## Backend and browser policies
Both services approve exact origins https://chatgpt.com and https://admin.ngx-workshop.io. Admin MCP OPTIONS is 204 with exact CORS headers; unapproved origin is 403. Admin invalid-code token redemption is invalid_grant with exact allow-origin; unapproved origin has no allow-origin header. Existing registered callback CSP supports the admin return. Persistent cookie/JWKS/storage keys, introspection secret and original public clients compared unchanged against prior private configuration.

Auth remains service-auth:c4c0a6b6d266; gateway remains service-mcp-gateway:9e6630a2e6e0, both recreated via the validated promotion operator. Prior config retained at /opt/ngx-releases/publisher-oauth-config-20261013T004332Z on app host. Updated encrypted application escrow verified privately at ops-recovery/ngx-oauth/20261013T004509Z/application-secrets.tar.gz.gpg with an independent bucket-scoped credential; asset bucket denied and anonymous reads denied. Owner-only encrypted copy retained outside source control.

Nginx [PR 2](https://github.com/Ngx-Workshop/nginx-ngx-workshop.io/pull/2) merged as 2eb81bc. Image nginx-ngx-workshop.io:publisher-58e7f04 uses the same pinned base and mounts, passed nginx -t before/after promotion, and public console returns Referrer-Policy: no-referrer. Native OAuth interaction routes retain upstream same-origin form policy. Prior container nginx-before-publisher-f67b7f38d3ab retained for rollback. Edge receipt at /opt/ngx-releases/publisher-edge.

## Real browser acceptance — 2026-10-12

Verified through the deployed admin console after owner login/consent, without pasted tokens or a local remote override:

| Tool | Input | Observed result |
| --- | --- | --- |
| list_workshops | sectionId angular | Six workshops, starting with What is Angular?, My 1st Component!, My 1st Service! |
| get_workshop | angular / 6acaffbb4d4ddb09fe84ff6d | What is Angular?, level 1, ordered outline with three pages, one coding lab, one assessment |
| get_coding_lab | labId 6abca5763b2ecd0f16ae87fa, no versionId | Sum an array — demo challenge, TypeScript version 1, prompt, starter solve function, hint and public sample test |

Workshop count/identity/outline and lab identity match current public service-document and service-coding-labs owner responses. Each console request visibly completed with Tool response received, with no authorization, CORS, schema or transport error. Server identity ngx-workshop-catalog · 0.1.0, three tools discovered. Console retained at https://admin.ngx-workshop.io/ai-publisher/console.

Local screenshots: /tmp/ngx-oauth-release/publisher-list-workshops.jpg, publisher-get-workshop.jpg, publisher-get-coding-lab.jpg. Screenshots show published results and connection status; no bearer/password/code was captured. Expiry and revoked-bearer disconnect remain covered by behavioral tests; this acceptance did not deliberately revoke the owner's live grant or wait for its full lifetime. Reconnect explicitly after normal expiry; do not refresh or persist bearer tokens.
