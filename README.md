# Admin AI Publisher

Angular federated admin journey for generating and publishing NGX Workshop learning materials. Browse sections, generate a brief-based workshop or import JSON, review documentation/labs/assessment, validate edits, publish explicitly and inspect receipts. Publishing uses the existing administrator shell sign-in and /api/publisher/tools.

The MCP catalog explorer and OAuth connection now live in the separate MCP Gateway MFE at /mcp-gateway/overview. AI Publisher retains /ai-publisher/console, default console redirect and legacy hello-world redirect. Federation still exposes ./Component and ./Routes through remoteEntry.js.

Use Node 22, npm ci and npm start (port 4201). Run npm run check:architecture, npm test -- --watch=false --browsers=ChromeHeadless and npm run build. See [architecture](docs/architecture.md), [development](docs/development.md) and [migration handoff](specs/005-mcp-gateway-migration/handoff.md).
