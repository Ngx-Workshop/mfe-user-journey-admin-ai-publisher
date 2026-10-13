# Admin AI Publisher

Angular federated admin console for the NGX Workshop MCP catalog gateway.
Connect a gateway, discover its tools, and inspect public workshop summaries,
ordered workshop outlines and published coding labs with expandable JSON results.
The current gateway is read-only; this remote does not publish or modify content.

## Development

Use Node 22, then `npm ci` and `npm start`. The console runs on port 4201;
its local `/mcp` proxy forwards to `http://127.0.0.1:3011/mcp`. Start the gateway
and its catalog owners separately. Supply an OAuth access token with `catalog:read`
for the gateway resource. Tokens stay in memory, are cleared from the form after
connection, and are discarded on disconnect/navigation. A blank token works only
with a gateway explicitly configured for local-public development.

The deployed gateway is `https://mcp.ngx-workshop.io/mcp`. Browser connectivity
requires an approved origin plus MCP CORS, or a correctly configured same-origin
proxy. The current admin host does not yet provide the default `/mcp` route.
The Angular dev proxy is not deployed. Browser OAuth sign-in needs an approved
client registration/callback; the shell’s existing session cookies are not bearer access.

## Checks

- `npm run check:architecture`
- `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json`
- `npm test -- --watch=false --browsers=ChromeHeadless`
- `npm run build`

Federation still exposes `./Component` and `./Routes` through `remoteEntry.js`.
The default route is `console`; `hello-world` remains a compatibility redirect.
See [architecture](docs/architecture.md), [development](docs/development.md) and
[console handoff](specs/002-mcp-console/handoff.md).
