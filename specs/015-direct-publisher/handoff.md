# Direct publisher handoff

Deployed 2026-11-06; authenticated/paid authoring acceptance is separate.

The frontend API/runtime validators and model exports now consume the user's
installed @tmdjr/service-ai-publisher-contracts 1.0.5 and mcpPublisherContract.
The pre-existing package.json/package-lock.json installation changes were preserved.
No remaining gateway-contract import exists in source, tests or the package/lockfile.
The POST /api/publisher/tools URL, payload/envelope, timeout, polling and administrator
withCredentials behavior remain unchanged. Local proxy forwards /api/publisher to
127.0.0.1:3014 and strips /api; the obsolete catalog proxy was removed.

In nginx-ngx-workshop.io, docker/nginx.conf retires /api/ai-publisher with 410 and
keeps the exact administrator facade, verified TLS upstream, normalized headers and
existing body/time limits. docker/oauth/backhaul.conf routes publishing directly to
service-ai-publisher:3014; catalog still goes to service-mcp-gateway:3011.

Verification on Node 22.23.3: architecture check, strict application types with unused
checks, test types, full ChromeHeadless behavior suite and isolated production build
all pass. The build produced 3rdpartylicenses.txt. Existing component-size review
notices remain non-failing and unrelated. Both source configurations pass native
nginx -t with disposable certificates; the exact source configurations were also
validated in disposable network-isolated containers using the currently deployed
backhaul Nginx image. No application or Nginx service was reloaded. Local Docker Hub
retrieval of the pinned image stalled and was cancelled; the existing production
runtime image validation avoided an image download. Both repository diff checks pass.

Deploy publisher service first (already deployed in the prior cutover), then install
and reload the application-host backhaul configuration and deploy the edge source
plus frontend. The edge workflow deploys only docker/nginx.conf, so it does not apply
the backhaul edit. Update the existing mounted backhaul file in place with a private
backup, run nginx -t before reload and restore on failure. Verify admin facade 401,
allowed-Origin OPTIONS 204, non-admin-host facade 403, retired route 410 and catalog
metadata after rollout. Then check real signed-in setup/history/preparation reads.
No paid model call or workshop mutation is needed for routing verification.

Gateway compatibility code/contracts are retained until the direct Nginx routing is
deployed and checked; its later retirement must preserve any remaining catalog
consumers' types. This task made no commit, push, publication or production reload.

## Production deployment — 2026-11-06

User authorized update and deployment. Source commits were pushed to main:
- nginx-ngx-workshop.io: 2f4dea273b7ad91993d886aa8aacdcf44f518fb3.
- mfe-user-journey-admin-ai-publisher: 574979267e3824da9965b98073ffd1043c48c41c.

The application-host backhaul was backed up under
/etc/ngx-workshop/releases/direct-publisher-20261106T231435Z. The reviewed source
matched the expected live baseline; its mounted inode was preserved, nginx -t
passed and reload succeeded. The edge configuration and previous publisher assets
were backed up under /opt/ngx-releases/direct-publisher-20261106T231457Z on the edge.
No service settings, model credentials, receipt storage or content were changed.

Nginx validation/deployment run 42310554724 succeeded. Frontend deployment run
42310556622 and independent validation run 42310556627 succeeded, including clean
install, architecture, ChromeHeadless tests, strict app types and production build.
Both live Nginx configurations hash-match the committed source.

Final public checks:
- Catalog metadata GET 200; unauthenticated catalog MCP POST 401.
- Agent publishing POST 401.
- Admin browser facade POST with allowed Origin/no credentials 401.
- Allowed-Origin browser preflight 204.
- Facade on beta host 403; untrusted Origin on admin host 403.
- Retired /api/ai-publisher GET 410.
- Public federation remoteEntry.js hash matches the deployed file. Its referenced
  2181.eee6ef2fa5d7c78e.js chunk serves successfully and contains publisher contract
  metadata (ngx-workshop-publisher).

The browser URL remains /api/publisher/tools, now routed directly by the TLS
backhaul to service-ai-publisher:3014. Catalog routing remains on the gateway.
No paid provider call, signed-in account flow, workshop mutation or receipt write
was used for verification. Rollback assets/configurations remain preserved.

Deployment links:
- https://github.com/Ngx-Workshop/nginx-ngx-workshop.io/actions/runs/42310554724
- https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42310556622
- https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42310556627

These deployment evidence additions are recorded locally after the functional source
commits were deployed; no second docs-only deployment was triggered.
