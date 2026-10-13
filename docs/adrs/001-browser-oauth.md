# ADR: A dedicated browser OAuth client
Accepted 2026-10-12.

Use public client ngx-workshop-ai-publisher-prod, S256 PKCE and resource-bound catalog:read access tokens. The exact console callback avoids adding shell routes. Pin issuer and resource instead of discovering arbitrary endpoints from user input. No browser client secret, legacy JWT forwarding, refresh token or persistent access token. A ten-minute single-use tab transaction survives full-page sign-in; bearer expiry closes SDK state and requires a new connection. Existing registered-client CORS and consent callback CSP allow only approved origins. Server introspection continues to use @tmdjr/ngx-auth-client; its Nest implementation is unsuitable for a browser bundle.

SPA document responses also use Referrer-Policy: no-referrer so shell initialization cannot forward callback queries in same-origin Referer headers. Native auth interaction documents retain their upstream same-origin policy for form Origin validation. Cross-origin CORS fetch retains Origin under no-referrer; see [MDN Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy).
