# Handoff: Workshop publishing journey

Status: Implemented; live integration pending
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-11-04

## Delivered behavior
The creation route now presents three distinct workspaces rather than a Material
stepper: Workshop brief, Draft review and Publication. A persistent journey nav
shows the active phase and guarded destinations. Setup has brief guidance and retry;
JSON import remains available. Existing route, discard confirmation, shared store,
request IDs and receipt recovery are preserved.

Each in-flight command has a specific status in the action bar and activity panel.
Generation replaces the form with confirmed brief / active whole-draft generation /
pending review, elapsed wait time and longer-wait guidance. Success opens review
automatically; errors retain input. The gateway returns a single final response,
so the UI does not invent resource-level progress or completion percentages.
Subscription finalization/destruction stops timing; operation identity protects
ordered setup labels from previous finalizers.

Review opens on the first documentation page. Material-type controls and an outline
navigate readable content, images, code, Markdown lab instructions, hints, solutions,
tests and assessment questions. Answers/feedback are opt-in. Interactive editor
blocks retain labeled source fallbacks, and code never executes in preview.
Angular sanitization remains enabled for HTML/Markdown; image blocks require HTTPS
without credentials. Refinement is secondary. JSON edits revoke validation/approval.
A separate publication checkpoint requires explicit review approval in the VM as
well as the UI; attempts remain protected against duplicate publication.

The measured action-bar height keeps the journey visible when mobile actions wrap.
Phase changes focus an accessible heading and scroll to the workspace below the
actual toolbar. At 390px, outline/content and material controls stack naturally.

## Acceptance and verification evidence

| Scenario/check | Method | Result | Evidence/limitation |
| --- | --- | --- | --- |
| AC-001 | Component/routed tests and isolated browser | PASS | No stepper, guarded phases, automatic review, explicit checkpoint, source edits revoke approval |
| AC-002 | Delayed Subjects, Jasmine clock, teardown tests and 12-second sample response | PASS | Actual operation labels, elapsed clock, completion/failure/destruction cleanup and no fabricated percentage |
| AC-003 | Preview tests and isolated sample browser | PASS | Outline selection/reset, ordered HTML/code/images, safe Markdown, lab disclosures, empty resources and answer reveal |
| AC-004 | Existing image/JSON/publish recovery tests plus VM approval checks | PASS | Input retained, revalidation required, request identity and duplicate protection retained |
| AC-005 | Desktop and 390 × 844 browser checks | PASS | Stable document/lab width 390px, expanded solution wraps, controls reachable; final journey top 183.4px below 167.4px action bar |
| Full behavior suite | npm test -- --watch=false --browsers=ChromeHeadless, Node 22.23.3 | PASS | 72 tests |
| Architecture | npm run check:architecture | PASS | Existing receipt/filter/history size reviews plus documented creation/review exceptions |
| Strict application types | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json | PASS | No errors |
| Test types | npx tsc --noEmit -p tsconfig.spec.json | PASS | No errors |
| Production federation build | npm run build -- --output-path dist/migration-verification | PASS | Normal license extraction enabled; nonempty 37,955-byte license file |
| Lockfile install | npm ci, Node 22.23.3 | PASS | Clean install from the committed lockfile |
| Whitespace | git diff --check | PASS | No whitespace errors |
| Authenticated shell | Supplied /ai-publisher overview/new with local override | PARTIAL | Setup and new layout loaded. Sample validate_workshop_draft returned generic agent failure; input retained. No live validation success claimed |
| Provider/publication | Live AI generation, image generation/upload, publish | NOT RUN | No paid calls or live publication; sample preview responses were explicitly isolated |

Browser testing restored the user's live tab to overview and removed temporary
sample input. Viewport overrides were reset. Isolated sample service and proxy were
outside the repository; no mock endpoint or sample draft entered production code.

## Contracts and consumer handoff
Routes, default/named App, exposures, DTOs, API paths and shared dependency versions
are unchanged. Marked 18.1.3 is pinned for Markdown preview; its HTML goes through
Angular's normal sanitizer. Current installed gateway contracts are 1.2.30, correcting
a historical architecture note that still described a vendor 1.2.0 baseline.

No external producer change is required for this UI. If exact AI generation substages
are desired, service-mcp-gateway needs an explicit progress contract (run identity,
reported stage/status, completion/failure and reconnection semantics). Current UI
must not infer authoring milestones from elapsed time.

## Remaining work and next action
Local feature work is complete. Live integration remains pending: diagnose the
supplied gateway's sample-validation rejection, then exercise successful generation,
refinement, verification/publication and receipt recovery with an approved workshop.
No deployment or external repository change was performed.

## Context maintenance and size exceptions
Updated architecture/development and feature index. Creation compositor is 347 lines
of phase/lifecycle composition and inline responsive styles; review compositor is
295 lines of material navigation/preview composition and inline styles. Setup,
operation progress, confirmation and each content renderer are extracted focused
presenters. Keeping these two compositions cohesive avoids passing VMs into views
or fragmenting each phase solely to meet an approximate line count. Existing
receipt/filter/history exceptions are unrelated and preserved.

## First-stage panel layout follow-up — 2026-11-05
The brief stage now has a wide left Workshop creation NgxPanel containing two
sibling panels (Shape your workshop and the always-visible Import or edit workshop
draft JSON), plus a separate right FROM IDEA TO WORKSHOP guidance NgxPanel.
The outer page frame is omitted for this stage so guidance is a true sibling;
generation/review/publication retain the existing framed composition. The source
presenter shares one editor template across expanded setup and compact review
disclosure modes, preserving the same control, validation output and locks.

Verification: 86 ChromeHeadless tests pass, including expanded binding/locking and
return-to-disclosure content preservation. Architecture, strict application/test
types, production federation build (nonempty 37,955-byte license file) and diff
checks pass on Node 22.23.3. Setup remains 225 lines; the page compositor's existing
cohesive inline phase/layout exception is now 357 lines.

Standalone browser layout checks used the verified production bundle on localhost:4201
after the authenticated admin session expired. Standalone has no API proxy, so these
checks show existing setup error/retry states rather than a successful live setup.
At 1880px: outer workspace 1512px, two inner panels 726px each with a 16px gap, right
guidance 320px. At 1024px: the 612px inner panels stack while guidance stays right.
At 390px: outer workspace/guidance stack at 358px and inner panels at 314px; document
width is exactly 390px. Viewport overrides were reset. No paid generation, validation
or publishing was performed. Browser login renewal was attempted using existing
autofill; authenticated shell layout verification remains unclaimed for this change.
