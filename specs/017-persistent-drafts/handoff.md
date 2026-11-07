# Persistent drafts handoff — 2026-11-07

Deployed; production draft recovery, autosave and action visibility verified. User authorized implementation and
deployment without historical migration/cutover work (no live users).

Publisher-owned MongoDB ai_publisher_drafts / ai_publisher_preparations persist source,
brief/model, stable draft ID, optimistic version, latest/prior repair preparation and
private check evidence. No tokens are stored. Active execution remains in one writer;
checkpoints precede paid work and follow each activity. Startup interrupts running work,
retains source, invalidates readiness and does not replay AI. Outage provenance is durable.
Three additive tools list/get/save drafts; preparation inputs add draftId/draftVersion.
Source saves invalidate old preparation authority and conflict on stale versions.
Published drafts leave the active list; stable publication IDs preserve receipt recovery.
Existing receipts remain on their private volume; Nginx/owner services need no change.

Frontend Your drafts uses a private newest-updated cursor-paged list with Continue review.
Stable links use new?draft=<uuid>. Fresh sessions restore source (including incomplete
edits), brief/model, current checks and previous repair context; explicit human publication
approval is always reset. Edits autosave after 400ms with save/conflict feedback and
navigation/unload protection. Restoring a previous draft requires fresh checks.

Contracts source 1.2.0 is generated and independently bundled in vendor; production
publication uses the CI run-number patch version. Runtime never imports sibling source.
Production MongoDB URI/database settings were added privately to the host-owned env;
credentials reuse existing database access and only publisher collections are accessed.
No data cutover or historical migration is required.

Verification: strict publisher build, generated contracts build, 61 unit tests,
9 HTTP/MCP/MongoDB tests (four with real isolated MongoDB), typed lint, 12 deployment
script tests, publication workflow tests, production audit high gate all passed.
Frontend 110 ChromeHeadless tests, strict app/test types, architecture check and isolated
production build passed. Final delivery checks also run in CI. Tests use doubles for
models and owner APIs; no paid generation or publication was performed.

The publisher page/VM remain cohesive composition/orchestration exceptions to size
review guidance. New API requests live in the stateless API client; saved list and
persistence operations live in SavedDraftsStore. Existing context notes are retained
as historical evidence; the new architecture sections supersede process-local-only
preparation statements.

## Production acceptance evidence

- API commit b5a4947c12316e4a8bc588ff97d21eaefb3e6606:
  https://github.com/Ngx-Workshop/service-ai-publisher/actions/runs/42401607746
  Validate, registry publication and deployment all succeeded. Running image
  service-ai-publisher:ci-42401607746-1 matches that revision. Contracts publication
  reported @tmdjr/service-ai-publisher-contracts@1.2.8. Frontend's bundled source
  1.2.0 artifact was byte-compared with all six producer-generated dist files.
- Frontend feature commit bf3274f58711013fc800b642b2294c091ccf50b8 deployed successfully
  in run 42402051123 and passed independent validation in run 42402051043.
  Live screenshot review found low contrast on the new anchor. Final correction
  a5c2f14871dbed6eb2430be7842f211d9a43f91d uses the shared glass surface and removes
  the local anchor color override. Final deployment and independent validation succeeded:
  https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42402591837
  https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42402591944
- Signed-in production browser created a clearly labelled unpublished check-only
  draft b931d743-e6a3-44d4-b233-1f6d9a9fdf4e. It passed all seven checks. A full API
  container restart retained source SHA256
  93abdd95a7b75954dd8af3d4dca9233f0586ecd0569e15ec6c2e9a3df4c2ca13
  and complete/ready evidence unchanged. After frontend deployment Your drafts listed
  it and Continue review restored the six pages, one lab, eight questions and checks.
  Direct review-link refresh restored the same state without approving publication.
- A source edit autosaved as version 2, cleared the preparation association and
  survived refresh. Publication remained disabled. Revalidation created preparation
  46a07458-1d63-4989-a8a4-ecbe134a55c4 under the same draft, version 3, seven passed
  checks; another refresh restored that report. Final Mongo read confirmed ready,
  zero generation/repair activities and no publishedRequestId.
- Unauthenticated list_workshop_drafts returned 401. No paid model call or owner
  publication occurred. The labelled verification draft remains private and unpublished.
- With explicit user approval the offline localhost publisher override was temporarily
  disabled for production browser checks, then restored exactly to
  http://localhost:4201/remoteEntry.js. The user's original receipt page was restored.
- Screenshots: persistent-drafts-live-overview.jpg (visible Continue review label)
  and persistent-drafts-live-review.jpg in the current Codex visualization workspace.
- Private pre-change environment backup:
  /etc/ngx-workshop/releases/persistent-drafts-20261107/publisher.runtime.env.
  Host-owned environment and receipt volume are preserved. Production credentials
  were never printed or committed. No Nginx changes were required.

Postdeployment evidence updates are local documentation only, avoiding another
unnecessary deployment. Functional source and generated artifacts are committed/pushed.
