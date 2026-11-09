# Development and verification

Updated 2026-11-08. Use Node 22 and the committed lockfile.

The webpack-based Angular builder is pinned to `@angular-devkit/build-angular`
`21.2.26` as a direct dev dependency. An npm `overrides` entry pins webpack to
`5.105.2` across the builder and federation plugins to prevent duplicate runtimes.
Builder `21.2.28` uses webpack `5.112.0`, whose changed federation shared-module
identifiers cause `license-webpack-plugin@4.0.2` to fail with
`Cannot read properties of undefined (reading 'trim')`. Both pins are required
because the newer builder imports webpack internals that moved.
Keep license extraction enabled; remove the pin only after validating an upstream
compatibility fix with a normal production build and `3rdpartylicenses.txt` output.
Regenerate the lockfile with CI's Node 22/npm 10, then verify with `npm ci`.
Npm 11 can omit optional peer entries that npm 10 requires for a clean install.

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

Journey orchestration/tests are grouped under `pages/creation`, `pages/overview`
and `pages/receipt`. Presenters/tests use `components/creation`, `overview`,
`receipt` and `shared`. The Karma builder resolves `--include` relative to `src`,
so targeted tests outside production source need the `../testing` prefix:

```sh
npm test -- --watch=false --browsers=ChromeHeadless \
  --include=../testing/app/app.spec.ts \
  --include=../testing/app/features/workshop-publishing/pages/creation/publishing.component.spec.ts
```

Spec 018 local verification: 118 ChromeHeadless tests, strict application/test
types, architecture checks and isolated production build/license pass on Node
22.23.3. The creation session provides both PublishingViewModel and
DraftPersistenceViewModel; isolated VM tests must provide both. Progress replaces
step content without resetting the session. Verify dialog teardown/locks, selected
material retention, visible save/conflict retry and receipt navigation when changing
these boundaries. Existing URLs remain unchanged; no deployment is implied.

The local proxy routes /api/publisher to service-ai-publisher on port 3014, rewriting /api/publisher to /publisher. Runtime schemas/types come from @tmdjr/service-ai-publisher-contracts. The browser endpoint remains /api/publisher/tools with administrator credentials. The API has a 180-second timeout; a timeout may leave a server run active. Keep the displayed request ID and inspect its receipt before another publish. The shell's localhost remote override can load the local bundle. Build in an isolated output directory to avoid competing with a running watcher.

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

## Publisher options
Requires gateway contracts 1.2.0 (committed vendor tarball) and the matching gateway deployment. Entry automatically loads sections, models and administrator history. Manual checks: switch model and confirm reference rates; check setup failure guidance; inspect a previous ID without changing the current ID; search/select an image or explicitly generate one, add it to a reviewed draft, inspect its JSON, validate and publish. Image generation is separately billed and uploads to service-uploader; tests use doubles and perform no paid calls. Model choices/rates and the image model are gateway configuration (see its workshop-publishing guide). Receipt history is server-owned; unconfirmed requests remain in this running app session and are reconciled by receipt checks. Live provider/shell acceptance remains pending.

## MVVM regression checks

The publisher API and store return cold Observables: subscribe to execute them.
The scoped VM owns lifetime-bound command subscriptions; do not call API clients
from views or presenters. New presenters consume typed controls/data and emit
intent. The architecture command checks API/state stream boundaries and blocks
VM imports in presentation components (`pages/` contains explicit orchestrators).

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
redirects to `/overview`; `/new` opens the workshop creation workspace; `/console` redirects
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

## Design system presentation — 2026-11-01
Installed design-system 21.0.10 supplies the public theme mixin and shared
presentation components. Use npm run dev:bundle for shell overrides pointing to
http://localhost:4201/remoteEntry.js; its static server enables cross-origin
module loading and the watcher rebuilds production bundles. Isolated build
verification continues to use dist/migration-verification. UI migration evidence
is recorded in specs/010-design-system-migration/handoff.md.

## Publishing journey verification — 2026-11-04

The creation route now uses brief/review/publication workspaces, named operations,
elapsed generation time and resource previews. Run the standard checks above after
changes. Local acceptance covers delayed generation/clock cleanup, ordered setup,
phase approval, JSON invalidation, publication recovery, outline switching, safe
rich HTML/images and Markdown, empty resources, lab disclosures and answer reveal.

Browser checks used both the authenticated shell's localhost remote override and
an isolated localhost:4220 development preview with sample responses. Shell setup
reads and the new layout work. The live gateway rejected the sample import/validation
with generic publishing-agent guidance; the UI retained its input. This is an
unresolved integration observation, not a successful live validation/generation.
The isolated sample service exercised generation waiting/automatic review, page/lab/
assessment navigation and the publication checkpoint without any paid AI requests,
image uploads or live publication. Read-only preview/sanitization tests complement
these UI checks; they do not prove provider or owner-service integration.

Detailed evidence and component-size exceptions are in
[011 handoff](../specs/011-publishing-journey/handoff.md). Exact generation substages
need a future gateway progress contract; the UI currently reports only observable
request phases and elapsed time.

## Receipt verification and reading layout — 2026-11-04

78 ChromeHeadless tests, architecture checks, strict app/test types, production
isolated federation build/license and diff checks pass on Node 22.23.3. The actual
receipt b31ed86e-26f5-43c9-bb9a-de7bbd1b5325 was inspected through the authenticated
shell/local override. Its 10th completed operation now also shows failed verification,
0/6 tests, recovery guidance and the correct lab editor URL. Desktop Result grew to
4,542px while the 710px Receipt/Steps panels stayed at top 181px after document
scrolling. At 390px, switching to the result and back works and the final document
width remains 390px. No lab edits, live verification or publication were performed.
See [012 handoff](../specs/012-receipt-verification/handoff.md).

Pending-step follow-up: 80 ChromeHeadless tests and production build pass; helper and
routed regressions cover completed lab creation with pending verification and hidden
editor CTA. Architecture/strict types/diff checks pass. Owner-service retry behavior
was inspected read-only; no replay endpoint or live verification was exercised.

Editor-link follow-up (2026-11-05): 85 ChromeHeadless tests pass, along with
architecture, strict application/test types, production build/license and diff
checks. Tests cover page-specific direct/snapshot receipt results, safe route
encoding and pending/malformed/mismatched identities. Native editor links replace
the outlined button treatment. The verified isolated production output was copied
to the local bundle-serving directory for browser review; no remote deployment.

First-stage panel layout (2026-11-05): 86 ChromeHeadless tests pass, including
expanded JSON binding, validation intent, read-only locking and preserved content
when returning to disclosure mode. Production build/license, architecture, strict
app/test types and diff checks pass. Verified output was served through the local
remote override for desktop/intermediate/mobile layout checks. No generation,
validation or publication requests are needed to inspect this layout.

Panel layout browser evidence: standalone production preview verified at 1880, 1024
and 390px; document width matches each viewport. Inner panels stack at the
intermediate breakpoint and guidance stacks on mobile. The admin session expired
during visual checks, so authenticated-shell success is not claimed for this layout
follow-up; standalone error/retry presentation was used without backend mutations.

## Preparation acceptance — 2026-11-05

Deploy coding-labs preflight, gateway preparation/skill assets, then this bundle.
The API polls short get requests and includes terminal reports; unsubscribe cancels
polling, not server generation. Jobs are private, process-local, expire one hour after
completion and may be evicted; a server restart requires new checks. Use Resume check
progress after an interrupted request. A fresh generation includes AI review and up
to one revision/re-review, increasing selected-model usage; imports run no model.
Human review remains necessary for facts, rendered content and diagram source.

Automated cases cover polling cancellation/terminal results, report validation, failed
checks blocking publication, edit invalidation, recovery from explicit preparation
rejections, history snapshots and skill/check evidence. Browser acceptance uses an
isolated local fixture server and production bundle, with no paid generation or live
publication. Local fixture results must not be presented as live domain integration.
See specs/013-workshop-preparation/handoff.md for exact evidence and limits.

## Draft review layout (014)

Review is a desktop grid with a sticky compact Checks sidebar and a naturally tall
Workshop Preview. Below 960px the panels stack. Check the Documentation / Coding
labs / Assessment tablist with keyboard arrows, Home and End; the image beside the
workshop information comes from the first safe document image, with an empty state
when absent. The preview header tune icon opens Refine the draft. Verify source
changes survive closing/reopening, invalidate publication readiness, and restore
the preview only after successful validation. Dialog errors and operation locks
must remain visible. Opening the dialog never calls generation or publication.

Local verification uses a fixture server and no paid model/image/publication calls.
The deployment remains a separate action; see specs/014-draft-review-layout/handoff.md.

AI repair local verification uses backend/model doubles or an explicitly labelled
fixture server. Verify failed-check CTA/model cost notice, locked progress, changes,
restore, stale-edit protection and resumed IDs without paid calls. Production requires
the publisher repair API plus the new frontend contracts; no Nginx change is needed.

Persistent drafts acceptance: verify Your drafts/Continue review, direct ?draft= links,
refresh, incomplete-source autosave/conflict feedback, interrupted checks and fresh explicit
publication review. ChromeHeadless cases use HTTP doubles. Production persistence acceptance
uses check-only unpublished content, no paid generation or owner publication.

Brief workspace polish (2026-11-07): architecture, strict application/test types,
production build/license and diff checks pass. ChromeHeadless reports 110 pass and
3 failures, reproduced against isolated unchanged HEAD: two stale draft continuation
selectors and the receipt Needs attention/Recovery label expectation. Updated brief
composition/import/preservation/success/phase regression passes. Authenticated local
remote layout inspected at 1920/1024/390px; import opened existing JSON without live
validation, generation or publication. See spec 011 handoff for evidence and limits.

Review column follow-up (2026-11-07): production build/license, architecture, strict
app/test types and diff checks pass; 110 tests pass with the same 3 baseline failures
listed in spec 011. New workspace assertions cover the chamfered panel, draft header
identity and external tab/preview keyboard selection. Isolated production sample
preview verified at 1920/1024/390px, including sticky tabs after 907px of scrolling.
The admin session expired; successful authenticated-shell acceptance is not claimed.
No live model/validation/publication requests were performed. See spec 014 handoff.

Integrated outline follow-up (2026-11-07): architecture/types/build/license/diff pass;
110 tests pass with the same three baseline failures. Isolated production fixture
verified page selection, 30 checks and expanded evidence, internal activity scrolling
and visible actions at 1920x963 and 1280x600. Mobile document width equals 390px.
The sample server is stopped; no live save, paid generation, validation or publication
was performed. See spec 014 handoff for measurements and authentication limitation.

Journey heading release candidate (2026-11-08): all 113 ChromeHeadless tests pass,
including repaired stale history/receipt expectations and restored-JSON coverage.
Architecture, strict app/test types, production federation build/license and diff
checks pass. Journey-first desktop/mobile preview was checked against the isolated
production sample. This supersedes earlier baseline-failure notes for this checkout.

Production release (2026-11-08): fa03543 deployed successfully via workflow run
42450642740; independent validation run 42450642757 also passed. Both clean Node 22
jobs report 113 passing tests and build hash 801aee09dd811518. The public federation
entry references the new application chunk, which matches the verified local bytes.
See spec 011 production release record. Earlier undeployed/failing-test notes are
historical. Authenticated UI acceptance still requires the user's expired session.

Activity-only workspace (2026-11-08): all 113 tests pass, including every operation's
panel hiding/restoration, retained source and publication gates. Architecture,
strict app/test types, production build/license and diff checks pass. The workspace
shows progress alone during non-idle operations and restores phase panels at idle.

Activity-only view released in 4776c3e (2026-11-08). Deployment 42452383130 and
validation 42452383173 succeeded with 113 tests; published application chunk matches
the verified build. See spec 011 handoff for links and production verification.

Publication panels (2026-11-08): 113 tests, architecture, strict app/test types,
production build/license and diff checks pass. Isolated production sample confirms
side-by-side confirmation/embedded checks on desktop and stacked panels at 390px
without document overflow or receipt lookup controls. No live workshop operations
or deployment performed. See spec 011 handoff.

Single publication panel (2026-11-08): 113 tests and architecture/types/build/license/
diff checks pass. Isolated production preview verified the centered 765px glass panel,
viewport background and 358px mobile panel without overflow. No checks or lookup
controls render on Publication. No live operations or deployment performed. This
supersedes the earlier local two-panel layout; see spec 011 handoff.

Publication receipt redirect (2026-11-08): 115 tests pass, including HTTP-backed mounted
success/recovery redirects, current-run identity, no discard prompt and receipt detail
loading. Architecture/types/build/license/diff checks pass. No live publication or
deployment performed. See spec 011 handoff.
