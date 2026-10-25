# Development and verification

Updated 2026-10-14. Use Node 22 and the committed lockfile.

| Purpose | Command |
| --- | --- |
| Install | npm ci |
| Architecture | npm run check:architecture |
| Build dependency compatibility | npm run test:build |
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

The webpack builder `@angular-devkit/build-angular` is pinned to 21.2.27
with webpack overridden to 5.106.2 for all consumers. Builder 21.2.28 requires
newer webpack internals, but `license-webpack-plugin` 4.0.2 cannot parse the
federation provider identifiers introduced in webpack 5.107, causing production
license extraction to fail with an undefined `trim` error. The builder reuses
the root `@angular/build` dependency to retain its patched tooling.
Keep license extraction enabled. Run `npm run test:build` and a production
build when updating these pins. The regression tests use Node's built-in runner
to verify license parsing and a single webpack instance across federation/build.
They also run automatically before `npm run build`, including in CI.

Generation failures now show fixed guidance for model configuration/access/quota/rate limits/timeouts, image lookup, incomplete/refused output and invalid generated drafts. Unknown or older gateway responses keep the generic fallback; upstream message text is never displayed. The gateway logs safe categories and bounded validation field/reason codes for operator diagnosis. A generation failure preserves the brief and does not create a publication receipt.

## Publisher options
Requires gateway contracts 1.2.0 (committed vendor tarball) and the matching gateway deployment. Entry automatically loads sections, models and administrator history. Manual checks: switch model and confirm reference rates; check setup failure guidance; inspect a previous ID without changing the current ID; search/select an image or explicitly generate one, add it to a reviewed draft, inspect its JSON, validate and publish. Image generation is separately billed and uploads to service-uploader; tests use doubles and perform no paid calls. Model choices/rates and the image model are gateway configuration (see its workshop-publishing guide). Receipt history is server-owned; unconfirmed requests remain in this running app session and are reconciled by receipt checks. Live provider/shell acceptance remains pending.

## MVVM regression checks

The publisher API and store return cold Observables: subscribe to execute them.
The scoped VM owns lifetime-bound command subscriptions; do not call API clients
from views or presenters. New presenters consume typed controls/data and emit
intent. The architecture command checks API/state stream boundaries and blocks
VM imports in presentation components (overview/wizard pages are explicit orchestrators).

Tests cover cancellation, ordered setup after failures, duplicate commands,
publication recovery, JSON edits, typed presentation intents and App composition.
Use the Angular Karma command if editor test discovery does not find these specs.
When importing takeUntilDestroyed in a federated VM, pass its explicitly injected
DestroyRef rather than relying on implicit injection inside the secondary entry
point. Standalone tests alone do not verify shared-core injection in the shell.

The refactor was smoke-tested in the supplied administrator shell with a local
isolated bundle, including setup reads, form gating, JSON syntax guidance and
375px responsive layout. This does not replace paid generation, image upload,
publication or receipt recovery acceptance. See the
[refactor handoff](../specs/007-publisher-mvvm-refactor/handoff.md) for evidence.

## Overview and AI wizard
Standalone bootstrap now registers the remote's exported routes. The default URL
redirects to `/overview`; `/new` opens the three-step AI wizard; `/console` redirects
to `/new` and `/hello-world` redirects to `/overview`. In the administrator shell,
these routes remain relative to the existing `/ai-publisher` mount. Serve the index
fallback for direct navigation/refresh of these routes.

Acceptance: search IDs/messages/step names and combine with each status, clear
filters, retry history failures, inspect a receipt, navigate New workshop and
Request history, generate or import/validate a draft, review images/materials,
explicitly continue to publish and check the receipt after success or failure.
Unpublished draft navigation requires confirmation; active operations prevent
leaving. The wizard retains request IDs and duplicate protection. Tests use HTTP/
store doubles; browser previews use sample read-only history/model/section data.
No paid provider, upload or live publication calls were made for this change.

Receipt inspection opens `/requests/:requestId` (under `/ai-publisher` in the
shell). Check a direct link and refresh, malformed ID guidance without HTTP,
receipt failures/retry, and returning to history with filters retained. The route
loads `get_publishing_run` independently of the latest-100 history. History badges
have distinct status colors plus labels; summary counts represent reported indexed
resources and completed publishing steps, not additional backend metadata.
