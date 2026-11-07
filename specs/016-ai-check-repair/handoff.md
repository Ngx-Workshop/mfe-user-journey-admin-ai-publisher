# AI check repair handoff

Implemented locally, 2026-11-06; release and paid acceptance pending.

## Behavior

Current failed content checks offer Fix with AI, with selected-model and possible
charge guidance. The server supplies eligible activity IDs through the additive
get_workshop_repair_options tool. Only final failed check/review rows from an owned,
unexpired, finished draft are eligible; service/provider exceptions, passed rows,
superseded automatic-repair rows and human-review rows are excluded.

start_workshop_preparation now accepts operation repair with a new idempotent
preparationId, sourcePreparationId, expectedDraftHash, activityId and optional
approved model. Context comes from the server-owned source snapshot and finding;
there is no browser-supplied prompt/finding authority. Same-ID retries return the
existing repair, including after a lost response. Source hash, ownership, capacity
and activity eligibility are enforced before a model call.

Each explicit repair makes at most one revision, then runs structure, serialization,
objective/runner checks, real owner preflight calls and AI teaching review. No
additional automatic revision or publication occurs. Provider failure preserves the
old snapshot. Publication still requires matching readiness and explicit review.

The frontend keeps the old preview during repair, locks concurrent commands, shows
changed material names (ignoring regenerated block IDs), and offers Restore previous
draft. Edits invalidate both approval and repair context. Interrupted work resumes
using the same ID. Known pre-start rejections restore the old state and hide stale
repair options until checks are refreshed. New teaching/validation failures return
to review rather than publishing automatically. A repair success is not a factual
or visual accuracy guarantee.

## Compatibility and release

Existing PreparationReport, PreparationActivity and PublishingReceipt schemas are
byte-equivalent as JSON objects to HEAD. Eligibility is a separate read to avoid
breaking older strict runtime validators. The publisher now has thirteen tools.
New frontend tolerates older servers missing repair-options support by keeping
normal validation/review available without a repair CTA.

Independent contracts source version is 1.1.0; frontend installs the reproducible
vendor/tmdjr-service-ai-publisher-contracts-1.1.0.tgz artifact. It exactly matches
producer-generated files and is not registry-published. Release publisher API and
contracts, then frontend. Both may be built without sibling source. Nginx, owner
schemas, journals and the catalog gateway need no change. Old gateway compatibility
discovery is historical and is not this frontend's contract source.

## Verification

On Node 22.23.3: strict publisher build, 61 unit tests, 5 HTTP/MCP tests, non-mutating
lint, regenerated OpenAPI/discovery and independent contract build pass. Frontend
architecture checks, strict app/test types, 106 ChromeHeadless tests, isolated
production build and license artifact pass. Both diff checks pass. Tests cover
foreign/stale/passed/superseded/outage rejection before a model call, focused context,
idempotency, one-revision limit, rechecks, no owner writes, preserved originals,
server eligibility, cost/locking, restore, stale edits and interrupted progress.

Fixture-only browser walkthrough at localhost:4221/new verified a visible failed
check CTA, selected-model charge notice, previous draft while running, changed page/
learning-plan list, a fresh publication-review requirement and full restore to the
original failure/preview. Screenshots are under the current Codex visualization
workspace (ai-fix-failed-check.jpg and ai-fix-review-changes.jpg). Fixture responses
are explicitly labelled; no provider request, real lab execution, domain mutation or
publication occurred. Browser review prompted small messaging corrections that were
then covered by the final test/build run. Existing component-size review notices
are non-failing. PublishingComponent remains a cohesive 439-line composition/inline
style exception; repair display logic is in its own stateless presenter and change
comparison is a pure utility.

Unrelated prior deployment notes were preserved. No commit, push, deployment or
paid generation was performed for this feature. Next step: release publisher and
frontend together, then an owner-approved live failed-draft repair acceptance.
