# Browser OAuth deployment handoff
Status: Deployed; owner browser sign-in and three-tool acceptance pending.

Public console: https://admin.ngx-workshop.io/ai-publisher/console. Dedicated public client ngx-workshop-ai-publisher-prod has that exact callback, S256 PKCE, catalog:read and exact resource https://mcp.ngx-workshop.io/mcp. Issuer https://auth.ngx-workshop.io. Access token stays in memory; no refresh token or client secret. Expiry and unauthorized calls disconnect and discard shared results while retaining tool inputs.

## Validation and release
28 ChromeHeadless tests pass after clean npm ci, including RFC 7636 challenge, valid/invalid/expired/duplicate callback, exact resource/verifier and transaction consumption, timed expiry/late-response fencing and revoked-bearer disconnect. Architecture, strict unused/types and production build pass. CI [38328932588](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/38328932588) passed on reviewed source 912c2c53093edb60cd317238cefe0cedcc6eef99; [PR 1](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/pull/1) merged as 27bf1d6c6fe3567f9150d3c4bf91ca01037436a6.

Deployment workflow has no deployment secrets configured. Deployed the clean-install local production bundle through existing verified SSH access to the existing frontend target; no new CI credential created. Bundle SHA256 40d3ca772f3c3821ed7dff2fb22b710ce24ea76e41a866b15048b59193d8a481, build hash 1ebaa598544501e5. Public remoteEntry.js checksum matches local artifact: 339ada7e24ab3a734f9c7c06e02447ee81cdf43483ee77c3b2b5bd13841c68e1. Release manifest and rollback static files retained at /opt/ngx-releases/publisher-912c2c5 on frontend host. For rollback, replace the active directory with previous-static; retain the current directory for recovery.

The browser had a local localhost:4201 development override; turned it off via the existing orchestrator controls and reloaded the production console before starting OAuth. Real sign-in reached auth.ngx-workshop.io; owner credential/consent handoff is pending. Synthetic tests and public asset checks do not prove all three tools through the browser.

## Backend and browser policies
Both services approve exact origins https://chatgpt.com and https://admin.ngx-workshop.io. Admin MCP OPTIONS is 204 with exact CORS headers; unapproved origin is 403. Admin invalid-code token redemption is invalid_grant with exact allow-origin; unapproved origin has no allow-origin header. Existing registered callback CSP supports the admin return. Persistent cookie/JWKS/storage keys, introspection secret and original public clients compared unchanged against prior private configuration.

Auth remains service-auth:c4c0a6b6d266; gateway remains service-mcp-gateway:9e6630a2e6e0, both recreated via the validated promotion operator. Prior config retained at /opt/ngx-releases/publisher-oauth-config-20261013T004332Z on app host. Updated encrypted application escrow verified privately at ops-recovery/ngx-oauth/20261013T004509Z/application-secrets.tar.gz.gpg with an independent bucket-scoped credential; asset bucket denied and anonymous reads denied. Owner-only encrypted copy retained outside source control.

Nginx [PR 2](https://github.com/Ngx-Workshop/nginx-ngx-workshop.io/pull/2) merged as 2eb81bc. Image nginx-ngx-workshop.io:publisher-58e7f04 uses the same pinned base and mounts, passed nginx -t before/after promotion, and public console returns Referrer-Policy: no-referrer. Native OAuth interaction routes retain upstream same-origin form policy. Prior container nginx-before-publisher-f67b7f38d3ab retained for rollback. Edge receipt at /opt/ngx-releases/publisher-edge.

## Next acceptance
Finish owner sign-in/consent without entering credentials in chat, confirm callback query stripped and three read-only tools discovered, then run list_workshops angular; get_workshop angular/6acaffbb4d4ddb09fe84ff6d; get_coding_lab 6abca5763b2ecd0f16ae87fa. Record real result screenshots and update status only when observed.
