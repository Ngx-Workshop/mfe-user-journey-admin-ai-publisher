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

## Brief workspace polish — 2026-11-07
Compact guarded phases are projected into the action bar. New workshop is hidden on
creation; Request history uses chevron / arrow_forward. Setup replaces the source
panel with model options and retry, moves Generate to creation panel actions, and
opens JSON import from a labelled file_upload header icon. The wider 340–420px
FROM IDEA TO WORKSHOP rail shows guidance by default and embedded preparation
checks when present. Return to draft review is removed; phase navigation remains.

The page owns both Material dialog lifetimes. Import preserves the existing JSON
control, displays errors/progress and respects operation locks. Success moves to
review and closes import; closing/reopening preserves edits. No API, dependency,
route, persistence or federation changes. Preparation's 238-line cohesive exception
keeps check rendering and its compact/embedded variants together. The page's existing
size exception now includes both inline dialog templates and shared dialog lifecycle;
presentation/state access boundaries remain enforced by the architecture check.

Verification on Node 24.9.0:
- Architecture, strict application types, test types and git diff --check pass.
- Production federation build passes with normal license extraction.
- ChromeHeadless: 110 pass / 3 fail. An isolated HEAD baseline using the same installed
  dependencies reproduces the same three failures: app.spec.ts draft continuation,
  publishing-history.spec.ts draft continuation (obsolete .request-row__continue
  selectors), and receipt.component.spec.ts expecting Needs attention instead of
  Recovery. These unchanged history/receipt issues are outside this layout change.
- Updated workspace regression passes: action placement, phase gating, default/check
  guidance replacement, invalid JSON dialog errors, preserved source on reopen,
  successful validation closing import, generation and explicit publication review.
- Authenticated admin shell with local remote: desktop 1920px, intermediate 1024px,
  mobile 390px inspected. Document width equals viewport at 1024px and 390px; inner
  panels stack at intermediate widths and outer panels stack on mobile. Import opens
  the existing saved JSON and closes without modifying it. Viewport restored and
  user tab returned to Workshop brief. No live generation/validation/publication run.

Local implementation complete; no deployment performed. No external producer work
is required. Existing baseline test failures remain separately identified above.

## Journey heading release candidate — 2026-11-08
Creation now projects journey navigation as the first action-bar content, replacing
its visible New workshop h1. The visually hidden phase heading supplies the page h1.
Overview/receipts retain NgxActionBar. Its installed public API cannot project a
custom heading, so the opt-in creation header uses the same shell spacing/sticky
layer tokens and a cleaned-up ResizeObserver for measured toolbar offsets.

The previously failing history tests now exercise the actual workshop-name resume
button. Routed saved-draft coverage verifies preserved JSON through Refine; the
receipt test expects the implemented Recovery status. Wizard navigation coverage
expects the phase heading and asserts no action-bar h1 and journey-first placement.
No domain behavior was weakened to make tests pass.

All 113 ChromeHeadless tests pass; architecture, strict application/test types,
production federation build with licenses and diff checks pass. Isolated production
sample preview confirms journey-first layout, 69px desktop / 167px mobile action-bar
measurement and no horizontal overflow at 390px. No live workshop mutations occurred.
This release includes the brief/review/outline/check-panel changes recorded above
and in spec 014. Production release will use the push-to-main deployment workflow;
its final run and deployed-artifact verification are recorded in the release follow-up.

## Production release — 2026-11-08
Released commit fa03543c2ec6ce4d7f26833b5b277e9d3de9d04e to main.
[Deployment run](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42450642740)
and [validation run](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42450642757)
both completed successfully. Each clean Node 22 job reports 113 passing tests and
production build hash 801aee09dd811518; deployment's static asset copy succeeded.

Post-deployment: the public beta.ngx-workshop.io publisher remoteEntry.js returns 200
and references 2181.9ed6d12a891452b4.js. That application chunk returns 200, matches
the locally verified chunk byte-for-byte (SHA-256
5e12250b7e573a056e4caaf1268541c9e30e07ee6a6e8583002167d012f5845f), and contains
the journey heading, integrated outline and bounded-checks components. Standalone
bootstrap assets are separately hashed; verification follows the federation entry's
actual application chunk. No paid model calls, saved draft changes or live publication
were performed. Authenticated-shell review still requires renewing the expired user
session; deployment and static artifact delivery are verified independently.

The accompanying documentation-only completion record uses [skip ci] to avoid
redeploying unchanged application assets. Local working tree is committed and clean.

## Activity-only loading workspace — 2026-11-08
Progress and workspace panels are now mutually exclusive for every non-idle
operation. The progress view renders without the outer publication/generation panel;
setup, review, checks and publication panels return at idle. Scoped VM controls retain
source/brief data across presenter recreation. Long-generation guidance no longer
refers to hidden check activity. Phase navigation remains visible and appropriately
locked; modal operations retain their existing progress/lock behavior.

All 113 ChromeHeadless tests pass. Regression coverage checks every operation across
brief/review/publication, absence of workspace panels while active, return at idle,
source preservation and existing publication/recovery gates. Architecture, strict
application/test types, production build/license and diff checks pass. No API, route,
dependency, persistence or federation changes; no live workshop operations performed.
The follow-up release uses the existing authorized push-to-main production workflow.

Activity-only view deployed 2026-11-08 in commit 4776c3e103070c4ea939932729d3035d28e52c62.
[Deployment](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42452383130)
and [validation](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/42452383173)
both succeeded with 113 passing tests. Production build hash: 7407e3a391148346.
Public remoteEntry.js and referenced 2181.559f6de093d96824.js return 200; that
application chunk matches the verified local build byte-for-byte. No live draft,
model or publication operations were performed. Completion record is documentation
only and skips CI to avoid redeploying unchanged assets.
