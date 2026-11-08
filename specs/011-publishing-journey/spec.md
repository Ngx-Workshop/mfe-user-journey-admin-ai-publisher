# Feature: Workshop publishing journey

Status: Implemented; live integration pending
Feature ID: 011-publishing-journey
Created: 2026-11-04
Updated: 2026-11-04
Request/source: Polish creation, make generation progress understandable and improve workshop review.

## Problem and current evidence
The vertical Material stepper in publishing.component.ts combines authoring, an opaque
single-response AI wait, content inspection and publication. The signed-in shell at
/ai-publisher/new shows Working… and an indeterminate bar. Review is a list of
collapsed disclosures and raw lab JSON. The current gateway returns no generation
substage stream; the frontend cannot infer individual resource completion.

## Scope and requirements
- FR-001: Replace the stepper with distinct brief, review and publication workspaces,
  keeping the current phase visible and preventing premature publication.
- FR-002: Name each in-flight operation (setup, generation, validation, images,
  publication, receipt). During generation show elapsed wait time, confirmed brief,
  active whole-draft generation and pending review. Never invent percentages,
  completed pages/labs, or provider milestones. Preserve input and retry on failure.
- FR-003: Review opens immediately on the first documentation page, with a workshop
  outline, documentation/lab/assessment navigation, readable rich content and images,
  formatted Markdown lab instructions, named code/solution/test views and optional
  answer reveal. Empty resources and unsupported interactive previews have guidance.
- FR-004: JSON and image refinement are secondary disclosures. Source edits invalidate
  readiness and require validation. Explicit review continues to a publication
  checkpoint with retained duplicate protection, receipt recovery and route guard.
- FR-005: Preserve routes, default/named federation exports and API contracts.

## Acceptance scenarios
- AC-001 (FR-001/004/005): Brief is the starting workspace. Review/publication cannot
  be skipped. Successful generation/import opens review; explicit confirmation opens
  publication. Editing source revokes approval. Publish is disabled until reviewed.
- AC-002 (FR-002): A pending request shows its actual operation and elapsed time;
  generation stays active until response, never fabricates backend substages, and
  failure returns to a recoverable brief. Timers stop on completion/destruction.
- AC-003 (FR-003): Selecting outline items changes the preview. Text, image and code
  blocks, Markdown labs, hints, test/solution disclosures and hidden assessment
  answers are readable. Rendering never executes draft scripts or lab code.
- AC-004 (FR-004): Image application and invalid JSON require revalidation; failures
  preserve inputs; publish attempts retain request identity and recovery controls.
- AC-005 (FR-001/003): Keyboard navigation and narrow screens preserve content and
  actions without horizontal document overflow; active phase changes receive focus.

## Quality and external boundaries
Use scoped VM state, root store/API ownership, OnPush inline BEM views and existing
semantic theme tokens. Tests use delayed operation/HTTP doubles and browser previews;
paid AI calls and live publication are not required local acceptance. Precise server
substages would require a future gateway contract and are explicitly outside scope.

## Success criteria and assumptions
Deliver functional local UI, meaningful behavior tests, architecture/strict-type checks,
production build/licenses and browser layout verification. Retain the existing numeric
VM phase as an internal implementation detail; replace only its stepper presentation.

## First-stage panel layout — 2026-11-05
FR-006 / AC-006: The brief stage has two sibling outer panels: a wide creation
workspace on the left and FROM IDEA TO WORKSHOP guidance on the right. The left
workspace contains two sibling inner panels: Shape your workshop (model/brief form)
and Import or edit workshop draft JSON (always-visible editor and validation).
Follow the referenced catalog's 16px gutters and responsive minmax columns. Stack
inner panels before they become cramped, and stack outer panels on narrow screens.
Both authoring methods retain their controls/validation/locking, and the review-stage
JSON disclosure remains compact. Generation/review/publication behavior is preserved.

## Brief workspace polish — 2026-11-07
FR-007 / AC-007: Compact guarded phase navigation lives in the action bar. Creation
hides New workshop; Request history uses chevron / arrow_forward. The guidance rail
grows to 340–420px and replaces default guidance with preparation checks when present.
The creation header opens source JSON in a keyboard-accessible modal. Source edits,
validation errors and locks survive closing/reopening; successful validation opens
review and closes the modal. The former source panel now holds model selection and
setup retry. Generate belongs to creation panel actions; remove Return to draft review.

## Journey heading and release — 2026-11-08
FR-008 / AC-008: On creation, journey navigation replaces the New workshop action-bar
heading and precedes status/actions. Keep a descriptive page h1 for accessibility.
Repair the full test suite and release the accumulated publisher layout changes
through the existing production deployment workflow after successful verification.

## Activity-only loading view — 2026-11-08
FR-009 / AC-009: While a publishing operation is active, show its progress view and
hide workspace panels, including preparation, setup, review and publication panels.
Restore the appropriate workspace when the operation returns idle, preserving
view-model-owned brief/source data and existing error and publication gates.
