# Feature: Receipt verification outcomes and reading layout

Status: Complete
Feature ID: 012-receipt-verification
Created: 2026-11-04
Updated: 2026-11-04
Request/source: Receipt b31ed86e-26f5-43c9-bb9a-de7bbd1b5325 has 10 completed operations but verify_lab_0 reports passed:false, 0/6 tests. Add the coding lab editor link and allow Result to grow while Receipt/Steps stay sticky.

## Requirements and acceptance
- FR-001 / AC-001: Keep operation completion and the server receipt status intact.
  Explicitly distinguish failed/passed verification results in progress and selected
  details. A complete verify request with passed:false never means tests passed.
- FR-002 / AC-002: Match indexed lab steps to the completed create_lab_N result's
  validated _id and link to /coding-labs-editor/coding-labs/:id in a new tab.
  Use the matching index, never another lab or a version _id. Pending steps
  must never show the editor CTA, even when matching lab creation is complete. Missing/malformed
  identity produces useful guidance without a guessed link. Show test counts only
  if provided and valid. The user fixes lab tests/solution and re-verifies there.
- FR-003 / AC-003: On desktop let the selected Result panel and its JSON grow in
  document flow. Receipt/Steps stay sticky below the shell/action bar, bounded to
  the visible viewport with internal scrolling. Narrow layouts keep panel switching
  with a naturally growing Result. Preserve keyboard access and long JSON wrapping.
- FR-004 / AC-004: Preserve direct receipt loads, refresh/errors, query parameters,
  selected-step reset, safe JSON and federation/API contracts. Do not edit lab data,
  replay publishing or change server receipt statuses.

## Verification and boundaries
Use pure projection and routed/component regression tests, architecture/types/build/
licenses, plus read-only authenticated browser checks at desktop and narrow sizes.
No live lab edits, verification execution or publishing are required. Existing
uncommitted journey work is preserved. Exact backend recovery/replay remains outside
this remote; external receipt status is authoritative.

## Editor-link follow-up — 2026-11-05
Completed documentation steps also offer an underlined native link following
/document-editor/:section/:workshopSlug/:pageId. Resolve direct page results or
matching PAGE/sortId entries in workshop snapshots; never use a workshop ID as the
page ID, guess a destination or expose pending-step CTAs. Coding lab editor CTAs
use the same underlined text style. New-tab behavior and keyboard focus remain.
