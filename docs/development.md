# Development and verification

Updated 2026-10-13. Use Node 22 and the committed lockfile.

| Purpose | Command |
| --- | --- |
| Install | npm ci |
| Architecture | npm run check:architecture |
| Local dev | npm start |
| Isolated production build | npm run build -- --output-path dist/migration-verification |
| Behavior tests | npm test -- --watch=false --browsers=ChromeHeadless |
| Strict source checks | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json |
| Test types | npx tsc --noEmit -p tsconfig.spec.json |

Tests mirror runtime folders under testing/app and use HTTP/store doubles for publishing and application composition. Manual acceptance covers section browsing, generation, JSON import/edit, draft validation/review, publication and receipt recovery. These actions require a real administrator shell session and configured server-side model/owner services. Synthetic tests do not prove live generation or publication.

The local proxy routes /api/publisher to the gateway publishing facade. The API has a 180-second timeout; a timeout may leave a server run active. Keep the displayed request ID and inspect its receipt before another publish. The shell's localhost remote override can load the local bundle. Build in an isolated output directory to avoid competing with a running watcher.

MCP catalog/SDK/OAuth verification now belongs to mfe-user-journey-admin-mcp-gateway at /mcp-gateway/overview. See [migration handoff](../specs/005-mcp-gateway-migration/handoff.md).

## Deployment

[Validate publisher](../.github/workflows/validate.yml) runs on pull requests and
pushes to `main`. [Deploy](../.github/workflows/deploy.yml) runs independently on
pushes to `main` and supports manual dispatch from `main`; other branches cannot
deploy. Deployment runs architecture checks, tests and a production build before
copying assets, so a failed check prevents upload even though validation is a
separate workflow.

Configure repository secrets `MFE_DROPLET_IP`, `MFE_SSH_PRIVATE_KEY` and
`MFE_SSH_HOST_FINGERPRINT` for the frontend host. Deployment preserves the
production target `/opt/mfe-remotes/mfe-user-journey-admin-ai-publisher/` and
serializes production runs without cancelling an in-progress deployment.

Generation failures now show fixed guidance for model configuration/access/quota/rate limits/timeouts, image lookup, incomplete/refused output and invalid generated drafts. Unknown or older gateway responses keep the generic fallback; upstream message text is never displayed. The gateway logs safe categories and bounded validation field/reason codes for operator diagnosis. A generation failure preserves the brief and does not create a publication receipt.
