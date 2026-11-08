# Plan: Workshop publishing journey

Status: Implemented; live integration pending
Spec: [spec.md](spec.md)
Updated: 2026-11-04

## Source baseline
Working tree clean. Angular 21.1.0, design system 21.0.10, published gateway
contracts 1.2.30 (architecture docs still described a historical vendor version).
Current generation is one HTTP response, not SSE/pollable generation milestones.

## Design and requirement mapping
- FR-001/004: publishing.component.ts becomes a workspace compositor. A stateless
  journey presenter shows three guarded phase buttons and context. Brief/review/
  publication bodies are mutually exclusive, and final approval stays explicit.
- FR-002: scoped VM tracks operation label and elapsed seconds around command
  subscriptions. A stateless progress presenter explains active work and next phase;
  all lifecycle cleanup remains on the existing exhaustMap command stream.
- FR-003: review presenter owns local preview selection and composes dedicated
  document/lab/assessment presenters. Pure preview helpers parse image/code payloads
  safely. Marked renders lab Markdown through Angular's normal sanitized innerHTML;
  no bypassSecurityTrustHtml or executable lab/diagram renderer is introduced.
- FR-004/005: reuse source/image/receipt presenters, existing store, route guards,
  HTTP facade and draft contracts. Guard publish in VM as well as the view.

## Constitution and ownership
One remote responsibility and server ownership preserved. API/store keep data access;
VM owns command/form/progress state, presenters own selection only. New files and tests
stay in workshop-publishing components/utils/pages and mirrored testing/app. Inline
OnPush BEM components target 230 lines; any cohesive exception is recorded in handoff.
No host/shared Angular dependency changes. Markdown parser is the sole new dependency.

## Verification
Test phase gating, delayed generation/progress cleanup/failure/retry, source invalidation,
publish recovery, preview navigation/rendering/sanitization, empty states and answer
reveal. Run architecture, strict app/test types, full ChromeHeadless suite, isolated
production build/license and diff checks. Verify signed-in shell/read-only setup and
narrow layouts; use validated sample draft import for preview when supported.

## External dependencies and risks
No required producer changes. Future exact generation substages require gateway events
with run identity and explicit stage statuses. UI labels must remain honest until then.
Raw interactive editor blocks show labeled source fallback. Preview is an administrator
inspection surface, not execution of labs or exact reproduction of the learner remote.
No paid generation, live image creation or publication is needed to validate locally.
Markdown use reference: https://marked.js.org/ (output requires sanitization; Angular
innerHTML sanitization remains enabled).

## Implemented size review
The creation compositor (347 lines) and review compositor (295 lines) are documented
cohesive exceptions after extracting setup, progress, confirmation and content
renderers. See handoff for rationale and verification. The supplied gateway's sample
validation failure remains an integration observation; isolated sample responses
verified preview behavior without paid generation or publication.

## First-stage layout follow-up — 2026-11-05
PublishingSetupComponent owns outer workspace/guidance NgxPanels, with nested brief
and JSON NgxPanels inside the workspace. PublishingComponent renders the setup
without its former enclosing panel; other phases keep that panel using a shared
content template. PublishingSourceComponent gains an expanded presentation input
(default false), reusing one editor template so controls and actions stay identical.
Use 16px catalog-style gaps, a 280–320px guidance rail and minmax(0,1fr) authoring
columns. Validate desktop/intermediate/mobile rendering and existing authoring tests;
add a behavioral check that expanded JSON retains binding/locking/validation.

## Brief polish — 2026-11-07
Use projected journey content in the shared action presenter and projected embedded
checks in setup. Keep the page responsible for source/refine MatDialog lifetime and
VM intents; keep source/model controls bound to the existing scoped forms. The source
dialog closes when validation moves to review, with errors kept in the dialog on failure.
No API, route, federation or dependencies change. Verify composition, invalid input
preservation, generation gating and guidance replacement plus standard checks.

## Journey heading and release — 2026-11-08
The shared NgxActionBar API only accepts a string heading. Keep it for overview and
receipt, and add an opt-in local creation header using shell tokens, projected journey,
existing buttons/status templates and lifetime-bound ResizeObserver height reporting.
Move semantic h1 to the visually hidden phase heading. Update stale history tests to
use the actual workshop-name resume button and receipt status label; assert restored
JSON in the routed draft test. Run architecture/types/full tests/production build,
commit the authorized layout work and push main to trigger the production workflow.

## Activity-only loading view — 2026-11-08
Render the workspace content without an outer panel during active operations. Make
progress and phase panels mutually exclusive; keep phase heading/errors available.
Retain scoped VM-owned controls across panel destruction/recreation and update the
long-generation guidance so it no longer refers to hidden checks. Regression-check
all operation types across brief, review and publication, plus restored JSON.
