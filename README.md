# Admin AI Publisher

Angular federated admin console for the NGX Workshop MCP catalog gateway.
Connect a gateway, discover its tools, and inspect public workshop summaries,
ordered workshop outlines and published coding labs with expandable JSON results.
The current gateway is read-only; this remote does not publish or modify content.

## Connection

Open the [production console](https://admin.ngx-workshop.io/ai-publisher/console) and choose **Connect Ngx Workshop**. Sign in with your Ngx Workshop account and approve catalog:read consent. The public browser client uses PKCE; no pasted token or client secret is needed. Tokens stay in memory, expire within ten minutes and require reconnection. The shell’s legacy session is separate from MCP authorization.

## Development

Use Node 22, `npm ci` and `npm start`. The remote runs on port 4201. Full-page OAuth requires its exact production callback; standalone development uses test doubles. Preserve federation exports and use published gateway contracts. See [OAuth handoff](specs/003-console-oauth/handoff.md) for deployment evidence and backend configuration.

## Checks

- `npm run check:architecture`
- `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json`
- `npm test -- --watch=false --browsers=ChromeHeadless`
- `npm run build`

Federation still exposes `./Component` and `./Routes` through `remoteEntry.js`.
The default route is `console`; `hello-world` remains a compatibility redirect.
See [architecture](docs/architecture.md), [development](docs/development.md) and
[console handoff](specs/002-mcp-console/handoff.md).
