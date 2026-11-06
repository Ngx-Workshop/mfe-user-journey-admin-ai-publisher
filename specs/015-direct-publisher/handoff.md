# Direct publisher handoff

Implemented locally, 2026-11-06; deployment pending.

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
