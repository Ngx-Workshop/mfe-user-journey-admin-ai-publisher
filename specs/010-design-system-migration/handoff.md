# Handoff: Publisher design system migration

Status: Complete
Updated: 2026-11-01
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)

## Delivered behavior
AI Publisher overview, workshop wizard and request receipt now use shared action
bars, panels, button shapes and semantic status tones from the installed design
system 21.0.10. Page roots opt into its scope and supporting presenters consume
public semantic colors/radius. Standalone bootstrap includes its theme fallback.
The obsolete particle header presenter was removed. Typed intent outputs, forms,
VMs, loading/error/retry/recovery behavior, API payloads and routes are retained.

## Acceptance and verification evidence
| Scenario/check | Method | Result | Evidence/limitation |
| --- | --- | --- | --- |
| Architecture | npm run check:architecture | PASS | Existing API/store/VM boundaries retained |
| Strict source | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json | PASS | No unused source declarations |
| Test types | npx tsc --noEmit -p tsconfig.spec.json | PASS | Existing suites compile |
| Behavior | npm test -- --watch=false --browsers=ChromeHeadless | PASS | 52 tests; doubles, no paid calls |
| Production | npm run build -- --output-path dist/migration-verification | PASS | License extraction enabled, within budgets |
| Final styles | npm run dev:bundle watcher | PASS | Final production bundle compiled successfully |
| AC-001 | Real supplied admin shell, local remote | PASS | Three real requests; search no-results, clear, Completed filter (1/3), inspect and return preserving filter |
| AC-002 | Shell wizard, existing behavior suite | PASS | Models/sections loaded; initial generation disabled; unit suite verifies explicit review and duplicate publication gating |
| AC-003 | Shell completed and attention receipts | PASS | Progress, recovery text and return navigation visible |
| AC-004 | Shell theme and 375px viewport | PASS | NASA shell theme inherited; history/wizard/loaded receipt scrollWidth equals clientWidth 375. Viewport restored |

The existing local endpoint stopped responding during inspection. Restarted the
repository dev:bundle watcher/static server on port 4201; its CORS support allows
the HTTPS shell to load the local remote. The preview was returned to overview.
Existing shell duplicate Material component warnings and an unrelated dashboard
widget error were observed while recovering the unavailable remote; they do not
require publisher API or federation contract changes for this migration.

## Contract and consumer handoff
No external-owner changes, package publication or deployment required. Existing
App/Routes exports, federation exposures/shared versions and gateway contracts
are preserved. The user's package.json/webpack.config.js installation is retained.

## Remaining work and next action
None within presentation acceptance. Paid model generation, image generation/
upload, live publication and service recovery remain outside this migration;
existing test doubles do not establish those live mutation integrations.

## Context maintenance
Updated docs/architecture.md, docs/development.md and the feature index with
current presentation ownership, standalone fallback and verification evidence.

## Layout refinement acceptance — 2026-11-01
Replaced the centered history card with a full-width filter rail/results layout,
matching the orchestrator/navigation examples. Rail uses chamfered/solid panel;
results use stepped/grid with header tools, an independently scrollable focusable
body and footer hint. Counts use all loaded rows and stay stable while filtering.
Wizard/receipt use full-width stepped/solid panels with publisher-specific labels.

- Architecture, strict source/spec types and whitespace checks passed.
- All 52 Karma behavior tests passed after the layout changes, including routed
  filtering, empty/error/retry, receipt return and wizard gating.
- Isolated production build passed with no budget/compiler warnings. Final small
  mobile spacing/label refinements were type-checked and rebuilt by the watcher.
- At 1280×720 in the real admin shell, rail was 320px wide at x=16 and result
  panel was x=352, width=912; both ended at y=704 (16px viewport clearance).
  Request body was 339px tall with 544px scrollable content; keyboard End moved
  its scrollTop to 204. No horizontal overflow (1280/1280).
- Search produced no-results while unfiltered summary counts remained stable;
  clear/status filtering and receipt inspection/return preserved the selected
  Completed filter. Mobile panels stacked with natural result height and no
  horizontal overflow (375/375). Temporary viewport was restored.
- Full-width wizard and receipt rendered with explicit publisher panel labels;
  no generation, upload or publishing commands were invoked.

AC-005 and T004–T005 are complete. Context ownership details are recorded in
architecture.md. The supplied shell continues to load the local bundle.

## Compact receipts / separate issues acceptance — 2026-11-01
AC-006–007 and T006–007 are complete. The overview now matches navigation's
separate repair panel: completed/running receipts in Request history and recovery/
unconfirmed receipts only in Issues. Shared stateless rows are 52px tall, with an
ID and progress line, semantic status and an inspect icon. Long text truncates
visually while full values remain in title/receipt detail. Search/status apply to
both panels; loading/error/retry remain available in either panel.

The measured workspace reserves 16px below the panels and sizes each scroll body
after subtracting its header/footer. Mobile filters collapse into a bounded overlay
and a Requests/Issues switch keeps the selected panel above the fold. This replaces
the previous mobile page-scrolling behavior documented earlier in this handoff.

Verification:
- Architecture, strict source/spec TypeScript and whitespace checks passed.
- 54/54 Karma tests passed, including new grouping/no-duplicate, filtered groups,
  disabled inspect, full-message title and Issues retry intent coverage.
- Isolated production build passed. No publishing API/data/federation changes.
- Real shell at 1854×963: both panels ended at y=947 with 52px rows;
  document height equaled viewport height and no horizontal overflow.
- At 1280×600, both panel bottoms were <=584 and page height remained 600.
- At 375×568 after resize settled, Issues panel ended at y=550.8 and page height
  was 568. Its list was 63px tall with 104px content; keyboard End reached
  scrollTop=41. Inspection opened the chosen receipt and displayed recovery text.
- Expanding mobile filters left the same panel bottom/page height. Needs attention
  filtering selected the Issues pane. Temporary viewport restored; final preview
  returned to unfiltered overview.
- Only read-only history/receipt requests were made; no generation/upload/publish.

Context ownership is updated in docs/architecture.md. No external integration work
is needed for this layout; live mutation acceptance remains outside this change.

## Compact receipt detail acceptance — 2026-11-01
AC-008–009 and T008–009 are complete. Receipt detail now uses measured viewport
and panel-body heights, a compact metadata summary, sticky progress heading and
48px step rows. Native disclosures render results in NgxCodeBlock (JSON, wrapped,
shared copy action). Expansion remains inside the keyboard-scrollable progress
region. Status/refresh stay in the header; status moves into metadata on mobile.
Loading/error/retry, direct links, parameter replacement, recovery text and return
navigation preserve their existing behavior. All component code remains <230 lines.

Verification:
- Architecture and strict app/spec TypeScript checks passed; git diff --check clean.
- All 55 Karma tests passed. New routed receipt test checks design-system blocks,
  object/nested/false/zero/null fidelity, literal HTML text, copy control presence,
  result-free steps and the focusable progress region. Existing receipt route,
  cancellation, error/retry, invalid-ID and history-return tests also passed.
- Final isolated production build passed, without compiler/budget warnings.
- Real shell at 1710×986: expanded result panel bottom y=970; document dimensions
  equaled viewport dimensions. Progress region 603px high with 1156px content;
  compact summary rows measured 48px.
- At 375×568 with expanded JSON: panel bottom y=551.4, document dimensions
  375×568, progress region 114px with 1673px content. Keyboard End reached
  scrollTop=1559; viewport restored afterward.
- Shared code block displayed the actual workshop result JSON and Copy code
  control. Clipboard writes were not necessary for the acceptance check.
- The local bundle server stopped responding on reload; restarted dev:bundle
  and rechecked the final compiled receipt in the supplied authenticated shell.
- No model generation, upload or publishing operations were invoked.

No external-owner work or contract changes are required. Context ownership and
code-block containment are documented in docs/architecture.md.

## Three-column receipt acceptance — 2026-11-01
AC-010 and T010–T011 are complete. Receipt metadata, progress selection and selected
step details occupy independent bounded panels. The first step is selected by
default; button selection updates pressed/highlight state and the third panel.
Undefined results show explicit guidance and only the selected JSON block exists.
Receipt replacement/refresh clears stale result state; new selections reset the
result scroll. Narrow layouts use three panel controls and selection opens details.

Verification:
- Architecture, strict source/spec types and whitespace checks passed.
- All 56 Karma tests passed, including result selection/object/null/undefined,
  literal HTML rendering, route replacement clearing/reset and existing receipt
  loading/error/retry/navigation behavior.
- Production build passed without compiler/budget warnings. Final small metadata
  width adjustment passed source types and the local watcher rebuilt it.
- Authenticated shell verification resumed after the user restored sign-in.
  At 1920×907, column widths were 300 / 648.3 / 907.7px at x=16 / 332 / 996.3;
  panel bottoms were <=891. Page width/height equaled the viewport.
- Live step selection changed the third panel and pressed row. A long result
  scrolled independently (scrollTop=239.5 while progress remained at 0); selecting
  another step reset result scroll to 0. A pending step showed no-result guidance.
- At 375×568 in the restored shell, panel bottom was 551.4 and page dimensions
  remained 375×568. Progress controls selected the pending step and opened Details.
  Temporary viewport was restored.
- Additional standalone sample verification used 32 steps to establish long-list
  keyboard scrolling (progress scrollTop=947) and JSON rendering, with no real
  publishing operations. The temporary fixture server was stopped afterward.

No external-owner changes or paid generation/upload/publication were needed.
Current presentation/state responsibilities are recorded in docs/architecture.md.

## Receipt row action acceptance — 2026-11-02
AC-011 and T012–T013 are complete for the publisher. Rows show the workshop name,
copyable request ID and progress. The row's primary native button opens receipt/
step details; a separate icon anchor launches the workshop in a new tab. Copy is
a sibling control with a live success announcement. Incomplete/malformed first-step
results do not create a workshop link; route segments are encoded and names are
included in local search. Existing user formatting/background edits were preserved.

Verification:
- Architecture, strict app/spec types and whitespace checks passed. The existing
  453-line ReceiptComponent review notice remains outside this row-action change.
- 64/64 Karma tests passed, including eligible/ineligible first-step identity,
  malformed route fields, encoded segments, name search, copy isolation, launch
  target/relationship, disabled receipt navigation and existing route journeys.
- Isolated production build passed without compiler/budget warnings.
- Real admin shell displayed all three workshop names. Clicking copy announced
  Request ID copied and retained /ai-publisher/overview. Primary row click opened
  /ai-publisher/requests/5ba71c76-1744-4951-879a-aa6a996ddf44 with step details.
- Workshop launch created a separate tab at the requested exact route:
  /document-editor/angular/pure-type-script-functions-for-angular-developers,
  preserving the publisher tab. The editor then reported 'This page no longer
  exists in this workshop' and redirected to root. This is an observed destination
  integration issue, not a publisher link-generation failure. No editor data,
  routes or backend contracts were changed; the requested link format is retained.
- The temporary launch-check tab was closed and the publisher returned to overview.
  No paid generation/upload/publication actions were performed.

Destination follow-up: inspect the existing workshop's document references in
Document Editor/service-document if that historical workshop should remain editable.
Publisher changes require no external deployment/contract migration.
