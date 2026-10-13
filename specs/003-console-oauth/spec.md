# Browser OAuth connection
Status: In progress

FR-001: The production console connects through Ngx Workshop sign-in and explicit catalog:read consent using a dedicated public client and S256 PKCE. No pasted credential or browser client secret.
FR-002: The exact callback is https://admin.ngx-workshop.io/ai-publisher/console; issuer and resource are fixed. Validate single-use state, issuer, callback and ten-minute transaction lifetime. Remove callback parameters before token redemption.
FR-003: Keep access tokens only in memory. Store only the pending PKCE transaction in tab session storage. On expiry, disconnect, or unauthorized response, close the connection and require reconnection. Never refresh silently.
FR-004: Approve only the admin browser origin alongside existing clients. Preserve legacy authentication and ChatGPT integration.
FR-005: Deploy through existing infrastructure and demonstrate all three tools in the real console.

AC-001: Connect redirects to real sign-in/consent and returns connected with three discovered read-only tools.
AC-002: Invalid, expired, duplicate or unsolicited callbacks cannot redeem codes; no code/token appears in UI or persistent token storage.
AC-003: Expired/revoked bearer disconnects and retains tool inputs for retry.
AC-004: list_workshops, get_workshop and get_coding_lab display real published results.
