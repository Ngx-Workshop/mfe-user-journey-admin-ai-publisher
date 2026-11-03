# Feature: Publisher design system migration

Status: Complete
Feature ID: 010-design-system-migration
Created: 2026-11-01
Request/source: Migrate AI Publisher using the installed design system, following the admin catalog and navigation migrations.

## Problem and scope
Administrators need consistent shell themes, actions, panels and controls across request history, workshop creation and receipt inspection. Existing views use a particle hero, custom action strip and Material color tokens. This change covers presentation and standalone theme setup. Provider, gateway, DTO, route, draft and publishing behavior remain compatible.

## Functional requirements and acceptance
- FR-001 / AC-001: Opening overview shows a shared action bar and history panel. Search, status, clear, refresh, empty, loading, error and receipt navigation remain available.
- FR-002 / AC-002: New workshop uses themed controls and panels. Generation/import, explicit review, publication gating, locked controls and recovery remain governed by the existing VM.
- FR-003 / AC-003: Receipt detail uses shared panels/status with refresh, retry and history navigation intact.
- FR-004 / AC-004: Shell and standalone themes apply across all routes; narrow layouts wrap controls and long identifiers without horizontal page overflow. Keyboard labels and focus remain usable.

## Quality and boundaries
Standalone OnPush inline BEM presenters retain typed intent outputs; API/store/VM ownership and reactive lifetimes remain unchanged. App/Routes exports and federation configuration remain compatible. No paid generation, image upload or publishing is needed for presentation acceptance. Live mutation acceptance remains outside this migration.

## Assumptions
The named repository and supplied /ai-publisher/overview URL identify AI Publisher; the separate asset-manager repository is outside this request. Installed design-system 21.0.10 is the target contract. Shell source owns the global theme.

## Success criteria
Architecture, strict source/test types, behavior tests and isolated production build pass. Browser smoke checks verify read-only history, wizard and receipt routes plus narrow-screen layout in the supplied shell.

## Layout refinement — 2026-11-01
FR-005 / AC-005: Follow the admin catalog/navigation workspace layout: full width
with 16px gutters, a 280–320px solid chamfered filter rail, and a stepped results
panel with header tools and a keyboard-scrollable viewport body on desktop.
Search/status/reset and counts stay in the rail; results, refresh, loading,
errors/retry and empty states remain in the main panel. Below 900px stack panels
and use natural page scrolling. Toolbar height is measured so wrapping never
obscures content. Wizard and receipt use the same full-width workspace and
explicit panel shapes/eyebrows rather than default demonstration styling.

## Compact receipt workspace — 2026-11-01
FR-006 / AC-006: Separate needs_recovery and unconfirmed receipts into an Issues
panel like navigation's repair panel. Completed/running receipts stay in Request
history, with no duplicates. Search/status apply to both groups and preserve
counts, retry and receipt navigation. Compact rows use an ID, status, one-line
progress/message and a small inspect action; full content remains in receipt detail.
FR-007 / AC-007: The workspace and its lists must fit above the viewport fold.
Scroll lists inside their panels, including narrow screens. On narrow screens,
filters collapse and Requests/Issues switching keeps one complete panel visible.
Resize and wrapped headers must not push list/footer content below the fold.

## Compact receipt detail — 2026-11-01
FR-008 / AC-008: Receipt detail uses the same measured viewport workspace with
compact progress rows and internal keyboard-accessible scrolling on desktop and
mobile. Expanding step results must not grow the panel or document below the fold.
Preserve ID, progress/status, recovery guidance, loading/error/retry, refresh,
parameter replacement and history navigation.
FR-009 / AC-009: Step results use the installed design-system JSON code block,
including its copy action. Preserve JSON values, render content as text, and wrap
long content within the panel. Steps without results remain simple progress rows.

## Three-column receipt workspace — 2026-11-01
FR-010 / AC-010: Receipt detail separates receipt metadata, selectable publishing
progress, and selected step details into three viewport-bounded columns. Step
selection updates only the detail panel, including explicit no-result guidance.
Select the first step initially; replacement reads/refresh clear stale selection
and results. Keep JSON code blocks, recovery/error/retry and history navigation.
On narrow screens, switch between the three panels; selecting a step opens its
Details pane. Each panel retains its own internal scrolling above the fold.

## Receipt row actions — 2026-11-02
FR-011 / AC-011: The compact row's primary button opens receipt/step details.
Show the workshop name from the completed first create_workshop step result.
ID click copies only the request ID; it must not navigate. The separate launch
icon opens /document-editor/{sectionId}/{workshopDocumentGroupId} in a new tab,
using valid first-step route values and encoded path segments. Missing/incomplete
results show an unavailable name/link without fabricating metadata. All actions
are keyboard accessible and independent, with no nested interactive elements.
