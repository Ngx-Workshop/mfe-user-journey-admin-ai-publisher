# Implementation plan: Publisher design system migration

Status: Complete
Updated: 2026-11-01
Spec: [spec.md](spec.md)

## Source baseline
Installed @tmdjr/ngx-workshop-design-system 21.0.10 and existing federation singleton are already configured. Pages compose a particle header, custom sticky actions and Material presenters. Existing tests exercise typed intents and wizard gating.

## Design and requirement mapping
- FR-001: Replace custom history surface with NgxPanel and action strip with NgxActionBar; adopt NgxButton and shared status.
- FR-002: Wrap wizard in NgxPanel, retain Material stepper/typed form behavior and style through semantic tokens; apply shared button policy to all actions.
- FR-003: Use shared receipt panel and status presenter.
- FR-004: Opt page roots into ngx-design-system; use public ngx tokens, shell toolbar offsets and standalone theme fallback. Keep responsive grids and identifier wrapping.

## Constitution and architecture review
One remote and public integration contracts preserved. API clients, singleton store, scoped VMs and stream lifetimes are untouched. Presenters remain stateless, inline OnPush/BEM and approximately 230 lines. Shared UI replaces the old Material-only presentation consistent with the user's explicit migration request. No data migration or external service changes.

## Verification
Run check:architecture, strict source and spec type checks, Karma behavior tests and production build into dist/migration-verification. Smoke test the supplied authenticated shell without invoking paid provider or publishing actions. Check narrow layout and theme inheritance. Record exact results and limits in handoff.

## Layout refinement
Split publishing-history presentation into a filter presenter and results panel.
Keep existing input/output contracts and VM ownership; pass all unfiltered rows
for status summary counts. Measure panel chrome and available viewport through a
local lifetime-bound DOM utility, following the reference remotes. Forward shared
action-bar height to the overview root. At <=900px return panel bodies to natural
height. Verify existing route/filter/retry tests plus browser desktop/mobile
geometry, scrolling, receipt navigation and wizard layout.

## Compact receipt workspace
Use stateless compact row and shared request-panel presenters. Partition filtered
rows into normal and issues groups in the history compositor; retain allRows for
filter summary. Match navigation's stepped main panel and beveled solid secondary
issues panel, with a 2:1 split when issues exist. Measure available workspace height
from actual viewport position, then subtract each panel's measured chrome to size
its scrollable body. Collapsed mobile filters and a Requests/Issues switch retain
bounded panels on narrow viewports, superseding the earlier natural-height mobile
layout. Preserve lifecycle cleanup and API/store/VM contracts. Add partition/intent
coverage and verify desktop/mobile geometry plus keyboard scrolling.

## Receipt detail refinement
Reuse observeWorkspaceHeight/observePanelBody(container) for a fixed receipt panel.
Make toolbar observation work for both overview and receipt page roots. Keep compact
metadata and the progress list inside the panel's focusable scroll region; use
native details with 48px summary rows for result-bearing steps. NgxCodeBlock receives
the existing JsonPipe serialization with language=json and wrap=true. Existing
ReceiptViewModel/API/cancellation/routes remain unchanged. Verify direct-route and
retry suites plus code-block payload fidelity and browser geometry before/after
expansion on desktop and narrow screens.

## Three-column receipt refinement
Use a reusable receipt-only bounded panel presenter for measured header/body/footer
and content projection. Compose metadata, compact button rows and selected result
in a 300px / 1fr / 1.4fr desktop grid. Scoped ReceiptViewModel owns selected index
and computed selected step; reset index on each replacement/refresh read. Use native
buttons with pressed state for keyboard selection. Narrow layouts switch panels;
row selection reveals Details. Verify payload fidelity/no-result/stale reset and
real desktop/mobile bounds without changing API/routes/federation contracts.

## Receipt row action refinement
Project first-step workshop name/URL through a typed pure helper into HistoryRow;
include the name in local search. Preserve backend contracts. Use a stretched native
row button with separate sibling clipboard button and new-tab anchor, keeping
copy/launch clicks out of the receipt navigation intent. Use CDK Clipboard and
an announced success message. Verify first-step eligibility/malformed data, URL
encoding, button/anchor intents, disabled receipt navigation and copy isolation.
