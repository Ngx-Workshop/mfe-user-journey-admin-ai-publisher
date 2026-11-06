# Feature: Draft review layout

Status: Complete locally; not deployed
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
