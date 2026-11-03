# Architecture and external context

Updated 2026-10-14 for [009 Publisher overview and AI wizard](../specs/009-publisher-overview-wizard/spec.md).

## Responsibilities and source map
AI Publisher owns administrator workshop generation, import, review, validation, publication and receipt inspection. App provides a RouterOutlet. The exported Routes mount the overview and workshop wizard; standalone appConfig registers those routes. MCP catalog exploration and browser OAuth have moved to the independently federated mfe-user-journey-admin-mcp-gateway.

features/workshop-publishing provides a stateless Observable HTTP facade client,
root singleton server-state store, scoped publishing VM and OnPush inline BEM
views. The existing shell administrator session authorizes /api/publisher/tools.
Draft inputs and request IDs survive failed publication. Editing invalidates the
reviewed draft; a publish attempt blocks repeat submission until starting a new
workshop. Shared state exposes read-only signals and blocks overlapping requests
on subscription. Model credentials stay server-side.

## MVVM ownership and streams

- `api/publishing-api.service.ts`: cold authenticated HTTP, timeout, envelope and
  published DTO validation; no UI or shared state.
- `state/publishing.store.ts`: shared sections, models, assets, history,
  unconfirmed IDs, busy/error state and request/recovery orchestration. Deferred
  Observable execution surfaces failures and releases busy on completion/error/
  cancellation. Operation ownership prevents a previous finalizer unlocking the
  next ordered read. Cancelling browser writes retains unconfirmed IDs because
  server work may continue.
- `pages/publishing.view-model.ts`: view-scoped typed forms, selected image,
  editable/reviewed draft, validation, current ID and receipt. An exhaustMap
  command stream rejects duplicates; concatMap orders setup reads and retains
  each setup error. JSON control changes invalidate review. takeUntilDestroyed
  cancels subscriptions; pass the explicitly injected shared-core DestroyRef to
  avoid implicit injection-context assumptions across federation secondaries.
- `pages/publishing.component.ts`: wizard lifecycle/composition; existing model,
  image, source, review and receipt presenters form three vertical Material steps.
  Scoped VM owns step/review confirmation; successful generation/validation opens
  review. Editing invalidates publication readiness. Publication retains duplicate
  protection and receipt recovery. The route guard blocks leaving while busy and
  confirms discarding an unpublished draft.
- `pages/overview.view-model.ts`: scoped search/status state with computed
  history rows and lifetime-bound exhaustMap read commands. No new HTTP contracts.
- `pages/overview.component.ts`: history page composition and relative navigation.
  `components/publishing-history.component.ts`: stateless history/filter presenter;
  includes session unconfirmed requests, empty/no-results/loading/error/retry states.
- `components/publishing-{brief,model,images,source,review,receipts}.component.ts`:
  presentation only, typed inputs and user-intent outputs; no service/VM injection.
  Controls are supplied by the VM. `forms/publishing-form.ts` names the brief form.

All components are below the approximate 230-line guideline; the previous review/
form exception is no longer needed. HTML and SCSS are inline. Global standalone
theme foundations remain in src/styles.scss; federated views inherit shell tokens.
App/Routes/config remain entry points rather than feature state owners.

## External contracts and federation
Published DTOs and Ajv schemas use committed vendor @tmdjr/service-mcp-gateway-contracts 1.2.0 until registry publication. The browser facade is owned by service-mcp-gateway; this dependency remains necessary for publishing even though the MCP SDK and catalog feature have moved out.

Keep named/default App, named Routes, federation name, ./Component, ./Routes, remoteEntry.js and Angular shared singletons. Default path redirects to overview; console redirects to new for existing creation links and hello-world redirects to overview. The new route is protected by the draft-preservation guard. Host route consumers mount the exported Routes under their prefix; a component-only consumer must register those child routes for the RouterOutlet entry. Standalone appConfig owns HTTP/Material animations/zoneless setup; the consuming shell supplies its existing HttpClient/session interceptors and theme.

Build/deployment targets remain dist/mfe-user-journey-admin-ai-publisher and /opt/mfe-remotes/mfe-user-journey-admin-ai-publisher. No migration of stored content or publishing API changes. Historical specs 002/003 describe the former catalog/OAuth implementation; current ownership and migration evidence are in spec 005.

## Publisher options — 2026-10-13
PublishingComponent initializes ordered section/model/history reads through its scoped VM. PublishingOptionsComponent composes model/image presenters using that VM. The store retains unconfirmed submitted IDs for this app session; durable administrator-owned receipts come from list_publishing_runs (latest 100 by receipt modification time). The gateway enforces model choices. Prices are server reference rates; configuration can replace the model catalog. Unknown configured model prices are explicitly unavailable. Images are reviewed, inserted into the first documentation page as existing editor blocks and validated before publication. Images are not a separate workshop cover field.

## Admin Publisher layout — 2026-10-14
The overview and wizard pages compose the shared NgxParticleHeader hero,
a stateless sticky PublishingActionsComponent and a 1440px responsive workspace. PublishingHeaderComponent and the action presenter
use inline OnPush/BEM views. The New workshop output calls the existing scoped VM
reset on the wizard. Overview's action navigates to new; Request history returns
from the wizard to overview. The receipt presenter supports current-run recovery. Shared
headers 21.0.5 is installed and declared as a federation singleton, matching the
Admin catalog pattern. See [layout handoff](../specs/008-admin-publisher-layout/handoff.md).

## Overview and wizard — 2026-10-14
The overview searches request IDs, messages and publishing step names, combined
with published statuses or session unconfirmed IDs. The gateway returns the latest
100 modified receipts; filtering is local to loaded history. Workshop titles and
timestamps are not exposed by this contract and are not fabricated in the UI.
Receipt inspection now navigates to `requests/:requestId` and reconciles the existing shared store. The former options
orchestrator was removed because the wizard composes its presenters per step.
See [overview/wizard handoff](../specs/009-publisher-overview-wizard/handoff.md).

## Receipt detail and history presentation — 2026-10-14
ReceiptComponent owns the separate `requests/:requestId` route and composes the
shared header/actions/status badge. ReceiptViewModel validates IDs and uses
switchMap with explicit DestroyRef teardown for replacement/retry reads through
PublishingStore. Direct links need no prior overview load. Returning to overview
preserves search/status query parameters; raw identifiers remain searchable.

History rows show completed/total step progress plus deduplicated indexed page/lab
counts. The pure publishing-step-display helpers map known operation names into
readable actions and one-based numbers; unknown names get a readable fallback.
Results remain optional JSON disclosures in receipt detail. No workshop titles or
resource completion claims are inferred from step names. Shared status badges use
green success, blue running, shell error attention and neutral unconfirmed accents;
text/surface contrast follows shell tokens. Green/blue are semantic status accents
so status colors remain distinct when the shell primary color changes.

## Design system migration — 2026-11-01
Overview, wizard and receipt page roots opt into ngx-design-system. The shared
PublishingActionsComponent composes NgxActionBar, NgxButton and NgxInlineStatus,
replacing the particle hero and custom action strip. NgxPanel owns each primary
workspace surface; supporting presenters use public semantic ngx color/radius
tokens and NgxButton on Material controls. PublishingStatusComponent maps domain
statuses to shared semantic tones. The obsolete header presenter is removed.
Standalone src/styles.scss includes the design-system theme; federated routes
inherit shell styles. Toolbar offset defaults match the other admin remotes
(96px desktop / 76px narrow); standalone .publisher-app sets it to zero.
API/store/VM, route, guard and federation contracts are unchanged. See
[design-system handoff](../specs/010-design-system-migration/handoff.md).

### Publisher workspace layout
The overview uses the same two-column workspace as the admin catalog/navigation:
16px gutters, a 280–320px solid chamfered filter rail and a stepped request panel.
PublishingFiltersComponent owns stateless search/status/reset intents and derives
summary counts from unfiltered rows. PublishingHistoryComponent composes the rail
and results, keeping its existing intents and receiving allRows for summaries.
The result header owns count/refresh; its focusable body scrolls independently.
The local panel-body-viewport utility measures available space and panel chrome,
with ResizeObserver/listener cleanup tied to component destruction. At <=900px,
panels stack and bodies return to natural page height. The action presenter emits
its measured height to the overview root so sidebar positioning follows wrapping.
Wizard and receipt workspaces also use full width and explicit stepped/solid
panel variants. No domain state or public routing changes accompany the layout.

### Compact receipts and issues — 2026-11-01
The history compositor now partitions filtered rows: complete/running receipts
appear in Request history; needs_recovery/unconfirmed receipts appear only in a
separate beveled secondary Issues panel, following navigation's repair workspace.
PublishingRequestRowComponent renders stateless 52px rows with ellipsized ID and
progress/message, status, and an accessible inspect icon. Full IDs and summaries
remain available in title text and receipt detail. PublishingRequestPanelComponent
owns panel feedback, keyboard-scrollable rows, empty states and typed inspect/retry
outputs. Both panels show loading/error recovery independently.

The workspace height is measured from its actual position to the viewport bottom.
Each panel subtracts its own measured chrome from that allocated height. These
lifetimes clean up observers/listeners. This supersedes the earlier natural-height
mobile behavior: mobile filters use a collapsed disclosure with a bounded overlay;
Requests/Issues switching shows one full-height panel. Resize, wrapped toolbar and
filter expansion retain visible panel bounds and internal scrolling at all tested
breakpoints. Service/store/VM/routing contracts remain unchanged.

### Compact receipt detail — 2026-11-01
ReceiptComponent uses the same measured workspace/container-body utilities as
history. Metadata and the compact 48px progress summaries share a focusable internal
scroll region with a sticky progress heading. Expanding a native step disclosure
adds content inside that region without expanding the panel/document. Panel header
owns status/refresh; on narrow screens status moves into scrollable metadata to
preserve progress space. Loading/error/retry, malformed-ID guidance, direct links,
replacement reads and history query parameters retain the existing VM behavior.

Step results use NgxCodeBlock with JSON serialization, wrapping, highlighting and
the shared copy control. Result wrappers/scroll region establish positioning contexts
so code-block live announcements remain contained. Steps with undefined results
remain plain rows; null and other JSON values retain their serialized values.
The viewport utility observes the containing page toolbar for both receipt and
history. API/store/VM/federation contracts and step-name display helpers are unchanged.

### Three-column receipt workspace — 2026-11-01
Receipt detail now composes ReceiptWorkspacePanelComponent three times: receipt
metadata, compact selectable progress, and selected-step details. The presenter
owns measured container-height scrolling and public panel projections. Desktop
columns are 300px / 1fr / 1.4fr with 16px gaps; below 1100px, Receipt/Progress/Step
details controls show one bounded panel. Selecting a progress row reveals step
details on narrow layouts while all columns remain visible on desktop.

ReceiptViewModel owns selectedIndex and computed selectedStep, defaulting/resetting
to the first step whenever a receipt read starts. Previous results clear while
reads are pending; undefined results show explicit no-result guidance. Only the
selected result instantiates NgxCodeBlock, retaining JSON null/false/zero and
text-safe rendering. The result panel resets its own scroll on selected-step
changes; scrolling it does not move the progress list. Route/API/federation
contracts, recovery/error/retry and history navigation remain compatible.

### Receipt row navigation and workshop identity — 2026-11-02
Overview rows now project workshopName/workshopUrl using the pure workshopSummary
helper. Only a completed first create_workshop result supplies identity; string
route fields are validated and encoded as individual segments. This refines earlier
notes that history has no workshop title: titles can be derived from first-step
result data without adding receipt metadata fields or changing the API. Name is
included in local search; missing identity remains explicitly unavailable.

PublishingRequestRowComponent uses a stretched native receipt-details button with
sibling copy-ID button and new-tab workshop anchor. Controls are not nested. CDK
Clipboard copies the raw ID and announces success; neither copy nor workshop launch
emits receipt inspection. The row adds a workshop-name line and retains compact
progress/status. Valid links use /document-editor/{sectionId}/{workshopDocumentGroupId}
with target=_blank and noopener/noreferrer. Missing route data disables launch.
