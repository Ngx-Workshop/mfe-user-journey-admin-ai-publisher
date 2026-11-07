# Persistent drafts handoff — 2026-11-07

Implemented; deployment/live acceptance pending. User authorized implementation and
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
