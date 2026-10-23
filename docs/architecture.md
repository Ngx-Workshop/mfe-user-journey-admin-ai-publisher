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
