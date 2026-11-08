# Feature: Draft review layout

Status: Deployed 2026-11-08; authenticated session acceptance pending
Feature ID: 014-draft-review-layout
Created: 2026-11-06
Request/source: User request and supplied current-page screenshot.

## Problem and scope
Administrators must scroll through a large checks report before reaching workshop materials. Keep checks visible beside the preview and move optional editing into a focused dialog. This is a presentation change within the publisher; publication gates and server contracts remain unchanged.

## Functional requirements
- FR-001: Desktop review has a compact sticky Checks panel and wider Workshop Preview panel with natural page scrolling.
- FR-002: Documentation, coding labs and assessment use keyboard-accessible tabs with material counts and linked panels.
- FR-003: Workshop information includes the first valid document image, or an explicit empty image state.
- FR-004: A labeled icon in the preview header opens a refinement dialog with existing image and source controls. Edits persist and require validation; pending operations prevent dismissal.
- FR-005: Narrow screens stack panels without horizontal overflow; activity evidence remains accessible.

## Acceptance scenarios
- AC-001 / FR-001, FR-005: With a prepared draft, desktop shows two columns, checks remain visible during document scrolling; narrow screens stack panels.
- AC-002 / FR-002: Selecting a tab changes materials; Left/Right/Home/End navigate tabs with roving focus and selected state.
- AC-003 / FR-003: Safe HTTPS image is shown with workshop information. Missing, malformed or unsafe images show the empty state.
- AC-004 / FR-004: Refine opens a focus-trapped dialog; Done restores the review. Source edits invalidate readiness and remain available for validation; errors remain visible in the dialog.

## Quality and data boundaries
Standalone OnPush, inline BEM styles and shell theme tokens. No new API, paid generation or publication triggered by opening the dialog. Existing API/store/view-model ownership and validation remain. The draft has no cover field: derive its first valid image in page/block order. Actual external service integration is outside this layout change.

## Review columns follow-up — 2026-11-07
FR-006 / AC-005: Checks uses a solid chamfered ngx-panel. The preview panel header
shows the draft name and WORKSHOP PREVIEW / LEVEL {actual level}; remove duplicate
identity from its body. Material tabs occupy their own unframed desktop column,
flush below the action bar and sticky during scrolling. Tabs retain counts, linked
panels and keyboard selection (including vertical Up/Down). On narrow screens use a
sticky horizontal tab row above stacked checks/preview without document overflow.

## Integrated outline and bounded checks — 2026-11-07
FR-007 / AC-006: Desktop columns are sticky material tabs/outline, workshop preview,
and checks. Show documentation pages, labs or assessment questions below the selected
tab; selecting an item updates the middle preview. Remove Back to brief. Place
Continue to publish in checks panel actions with existing readiness/operation gates.
Checks activity scrolls independently; measured panel chrome and footer must fit
within the available viewport, including wrapped action bars and expanded evidence.
