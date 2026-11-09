# Architecture and external context

Updated 2026-11-04 for [011 Publishing journey](../specs/011-publishing-journey/spec.md).

## Responsibilities and source map
AI Publisher owns administrator workshop generation, import, review, validation, publication and receipt inspection. App provides a RouterOutlet. The exported Routes mount the overview and workshop creation workspace; standalone appConfig registers those routes. MCP catalog exploration and browser OAuth have moved to the independently federated mfe-user-journey-admin-mcp-gateway.

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
- `pages/publishing.component.ts`: creation lifecycle/composition, phase focus and
  measured action-bar offset. Three explicit brief/review/publication workspaces
  replace the Material stepper. PublishingJourneyComponent exposes guarded phase
  navigation; successful generation/validation opens review. Publication requires
  validated content and explicit review confirmation at both UI and VM boundaries.
  The existing route guard blocks active work and confirms discarding drafts.
- `components/publishing-{setup,journey,progress,confirmation}.component.ts`:
  stateless brief/context composition, phase navigation, operation-specific activity
  display and publication checkpoint. The action presenter accepts an explicit status;
  existing overview/receipt callers retain a loading fallback.
- `components/publishing-review.component.ts`: local material-type/outline selection;
  document/lab/assessment children render one selected resource. Source/image controls
  remain secondary refinements; source edits remove the validated preview until validation.
- `utils/publishing-preview.ts`: pure block projection and HTTPS image URL checks.
  Rich HTML and Marked-rendered lab Markdown use Angular's normal sanitization.
  NgxCodeBlock renders code without execution. Diagrams/interactive quizzes have
  labeled source previews; assessment answers/feedback are explicitly revealed.
- `pages/overview.view-model.ts`: scoped search/status state with computed
  history rows and lifetime-bound exhaustMap read commands. No new HTTP contracts.
- `pages/overview.component.ts`: history page composition and relative navigation.
  `components/publishing-history.component.ts`: stateless history/filter presenter;
  includes session unconfirmed requests, empty/no-results/loading/error/retry states.
- `components/publishing-{brief,model,images,source,review,receipts}.component.ts`:
  presentation only, typed inputs and user-intent outputs; no service/VM injection.
  Controls are supplied by the VM. `forms/publishing-form.ts` names the brief form.

The creation compositor (347 lines) and review compositor (295 lines) are
cohesive size exceptions: their inline phase/preview composition and responsive
styles stay together while content rendering and setup are extracted. Existing
receipt/history/filter size exceptions remain separate. HTML and SCSS are inline. Global standalone
theme foundations remain in src/styles.scss; federated views inherit shell tokens.
App/Routes/config remain entry points rather than feature state owners.

## External contracts and federation
Published DTOs and Ajv schemas use installed @tmdjr/service-ai-publisher-contracts 1.0.5 (mcpPublisherContract). service-ai-publisher owns the browser facade and preparation state. The same-origin /api/publisher/tools path is routed through the verified Nginx TLS backhaul directly to publisher port 3014; the catalog gateway is outside this request path.

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

## Workshop creation journey — 2026-11-04
`/new` retains its route and guard but now presents separate brief, draft review and
publication workspaces. The journey nav remains visible above the active panel.
A scoped operation identity names sections/models/history setup, draft generation,
validation, image search/generation, publication and receipt checks. An RxJS interval
tracks elapsed wait time only while the command subscription is active; completion,
error and destruction stop it. Operation ownership prevents a prior ordered-read
finalizer clearing the following stage. Existing exhaustMap duplicate-command and
store error/recovery behavior remain intact.

Generation is a single-response gateway request. The progress view truthfully shows
brief received, whole-draft generation active, and review pending. It does not claim
individual pages/labs/assessment completion, percentage progress or a completion ETA.
After 60 seconds it adds waiting guidance; success opens the preview automatically.
No backend stage stream or extra provider requests are introduced.

Review opens on the first documentation page and supplies an outline, material-type
controls, ordered rich-content blocks, validated HTTPS images, code examples,
formatted Markdown lab instructions, hints, reference solutions, tests and answer
reveal. Preview code never executes; unsupported interactive blocks keep explicit
source fallback. Empty resources have guidance. Marked 18.1.3 is the only new runtime
dependency; shared Angular/design-system/federation versions are unchanged.

The page measures action-bar height so focus/scroll positioning includes wrapped
mobile actions. Content and outline stack below 800px; material switches remain
native keyboard-accessible buttons. Preview state resets on a replaced draft.
Explicit approval opens a separate publication checkpoint; JSON edits revoke it.
Publish attempts still lock the current request and expose receipt recovery.

### Verification outcomes and natural-height receipt results — 2026-11-04
ReceiptViewModel now projects a typed verification outcome and matching coding-lab
editor URL for each step through pure publishing-verification helpers. Only completed
verify_lab_N results with explicit boolean passed are interpreted. Test counts require
valid nonnegative integers with passed <= total; unknown/malformed values are not
inferred. The editor URL uses the same indexed completed create_lab_N result's valid
24-hex _id, never a version ID or another lab. ReceiptStepResultComponent renders
completion and verification outcome independently, recovery guidance, new-tab editor
navigation and unchanged safe JSON. Server receipt status/message are preserved.
Shared publishingProgress appends a failed-verification count so history also makes
clear that completed operations do not guarantee passed tests.

The workspace now uses natural-height grid rows. Result opts out of bounded body
measurement through ReceiptWorkspacePanel.bounded=false. Receipt/Steps have viewport-
bounded sticky heights derived from shell offset and the action presenter's measured
height. Existing panel-body measurement still handles their internal scrolling and
cleans up reactively. Selecting a step scrolls the natural Result into view; narrow
panel switching retains sticky controls and stacked document flow. This supersedes
the earlier three-column note's internally scrolling selected result. The receipt
page remains a documented cohesive composition/layout size exception (~512 lines).
No backend edits, recovery replay, API, route or federation contract changes.

Pending receipt steps never expose an editor CTA, even when the matching lab creation
completed. The pure URL projection and result presenter both enforce completion.
A pending verification is an unconfirmed owner response, not proof it never ran.
Coding-labs supports re-verifying a current draft, but the publishing gateway does
not resume an existing receipt by replaying publish_workshop. Any targeted retry
requires gateway-owned reconciliation; see spec 012 recovery notes.

### Page-specific receipt editor links — 2026-11-05
The receipt result presenter now uses native underlined editor anchors with visible
keyboard focus, preserving new-tab/noopener/noreferrer behavior. Completed
create/write/name_page_N steps receive documentEditorUrl from a pure projection.
The route is /document-editor/:section/:workshopSlug/:pageId, with individually encoded
segments. Route context comes from the first completed workshop creation result.
Direct page results must identify PAGE type and the matching workshopGroupId;
workshop snapshots match PAGE entries by sortId to the operation index. Only valid
24-hex page IDs are linked, with no guessed fallback or use of a workshop ID as a
page ID. Pending, missing or ambiguous destinations stay unlinked. No API/route or
dependency changes; existing coding-lab completion gating is preserved.

### First-stage nested authoring panels — 2026-11-05
PublishingSetupComponent now owns two outer NgxPanels: the left stepped Workshop
creation workspace and the right chamfered FROM IDEA TO WORKSHOP guidance panel.
Inside the workspace, Shape your workshop and Import or edit workshop draft JSON
are sibling panels. The JSON editor is expanded by default in setup; the review
source component retains its original disclosure through a shared editor template.
The compositor omits its former surrounding panel for setup and reuses a single
content template for setup versus the framed generation/review/publication states.

Catalog-style 16px gutters separate the panels. The guidance column is 280–320px;
the inner authoring columns use minmax(0,1fr). At <=1200px, brief/JSON stack within
the left workspace; at <=900px, the outer workspace/guidance also stack. Controls,
scoped form state, validation, pending locks, commands and public routes remain
unchanged. The setup presenter remains below the approximate 230-line guideline.

## Preparation skills and checks — 2026-11-05

Creation now uses start/get_workshop_preparation through the published 1.3.0 contract
(vendored reproducible tarball). Stateless API validates report output schemas and
polls with cancellable Observables. Store owns request/error/busy orchestration;
scoped VM owns report, progress resumption, draft and approval. New starts retain a
client-chosen preparation ID so a lost response can be polled without restarting.
Edits invalidate report and review. Both VM and gateway block unchecked publication.
Explicit stale/unavailable preparation rejections permit rechecking while retaining
JSON; uncertain publication still retains its request ID and duplicate protection.

PublishingPreparationComponent presents current totals and an expandable timeline;
PreparationActivityComponent presents one typed skill/check/review row with versions,
fingerprints, duration and evidence. Native disclosures, text statuses, inline BEM
styles and theme tokens support keyboard/responsive access. Completed successful
reports collapse their log; failures and running reports stay open. Receipts expose
saved preparation metadata in a separate disclosure. Existing page compositor size
exceptions continue for the added composition bindings; the new presenters stay
below the approximate component size target. No HTTP or service state in presenters.

## Draft review layout (014)

Review uses an unframed two-column workspace so no clipped panel ancestor prevents
sticky positioning. The compact checks sidebar scrolls within the remaining viewport;
the wider preview grows with its material content. At 960px and below, panels stack
and checks become a bounded static region. Preparation compact density is opt-in;
receipt evidence and generation retain their original presentation.

The review presenter owns linked accessible tabs (Left/Right/Home/End and roving
focus), outline selection and safe first-image projection from document blocks.
There is no new workshop cover field. The page composes a Material refinement
dialog with the same VM-owned image/source controls, validation and error state.
Dismissal is locked while operations are pending and the dialog closes on page
destruction. The page and review presenter retain cohesive size exceptions for
wizard/dialog composition and material navigation; no data access moves into them.

## Direct publisher contract and routing — 2026-11-06

The API and model exports use @tmdjr/service-ai-publisher-contracts 1.0.5 and
mcpPublisherContract. Browser requests remain POST /api/publisher/tools with the
administrator session; local proxy strips /api and reaches publisher port 3014.
Production edge keeps the protected administrator facade and verified TLS backhaul;
the backhaul targets publisher directly. The catalog gateway is outside this path.
Source changes are local until both Nginx hops and this frontend are deployed.
The gateway compatibility implementation can be retired after that routing rollout.

## AI repair of failed checks

Publisher contracts 1.1.0 are installed as a reproducible vendor artifact. The API
validates separate repair eligibility; the shared store loads it after failed terminal
preparation. Failed-check presenters emit an activity ID, not prompt text. The scoped
VM owns one previous draft/report/options snapshot, progress, changed-material summary
and restoration. New repair results invalidate publication review. The compositor
uses PublishingRepairReviewComponent; repairChanges compares content while ignoring
regenerated editor block IDs. No model calls originate from presenters or the browser.
See specs/016-ai-check-repair/handoff.md for tests and rollout order.

## Persistent workshop drafts (017) — 2026-11-07

SavedDraftsStore owns private summary reads and versioned source saves through the stateless
publisher API client. Overview lists Your drafts newest updated first with cursor paging and
Continue review. The existing new route uses ?draft=<uuid> as a stable review link; restoring
requires no prior in-memory state. The scoped VM restores draft source, generation brief/model,
latest evidence and previous repair revision; explicit publication approval is always fresh.
Source edits autosave after 400ms, including incomplete JSON, and invalidate preparation.
Save status and errors remain visible; navigation/unload guards protect unsaved work.
MongoDB on service-ai-publisher persists records across refresh/redeployment. Interrupted
processing is non-ready and requires new checks without automatic paid replay. The existing
receipt journal remains authoritative for publication recovery; draft IDs are stable publication
request IDs. New tools are packaged in independent contracts 1.2.0 via the verified vendor
artifact; no sibling source is loaded at runtime. PublishingComponent remains a cohesive
composition/inline-style exception; persistence reads/writes are in API/store boundaries.

### Unified request history — 2026-11-07

Saved draft summaries now join the main Request history rows with a Draft badge,
readiness/processing summary, saved timestamp and Continue review action. The separate
Your drafts panel is removed. The Drafts status filter, shared search, combined
loading/error feedback and in-panel Load more drafts preserve discovery and pagination.
Drafts appear in API newest-updated order before receipts because receipts expose no
reliable timestamps. Receipt/unconfirmed IDs suppress duplicate draft rows; receipt
inspection and the existing Issues panel retain their own actions. The wizard's saved
and recovery guidance now points to Request history. No backend or contract changes.

### Brief workspace polish — 2026-11-07
The creation action bar now projects compact guarded phase navigation and hides its
New workshop action. Setup owns brief/model sibling panels and a wider guidance rail;
the rail replaces default guidance with projected embedded preparation checks. The
page owns the header-triggered source import dialog, preserving scoped JSON controls,
errors/operation locks and closing after successful validation opens review. Generate
is projected into the outer creation panel actions. See spec 011's follow-up handoff;
API, persistence, routes and federation boundaries are unchanged.

### Review columns — 2026-11-07
The review page composes a chamfered checks panel, an unframed sticky material-tab
column and the preview panel. Preview header identity comes from the draft name and
level. PublishingReviewTabsComponent shares typed selection and ARIA IDs with the
review presenter; the latter retains outline selection and resets it on tab changes.
Below 1101px tabs become a sticky horizontal row over stacked panels. A lifetime-bound
media query supplies orientation; report scrolling stays inside its panel frame.
See spec 014 follow-up for verification and existing cohesive size exceptions.

### Integrated review outlines and bounded checks — 2026-11-07
Desktop review now reads navigation / preview / checks. The shared outline presenter
shows pages, labs or assessment questions under the active tab and binds item selection
to the middle preview. Assessment optionally renders a selected question. The checks
wrapper measures actual panel chrome/actions through observePanelBody and reserves
viewport space for activity scrolling; Continue to publish stays in panel actions.
Back to brief is removed in favor of existing phase navigation. Narrow layouts stack
navigation, preview and checks. See spec 014 follow-up evidence; contracts unchanged.

### Creation journey heading — 2026-11-08
PublishingActionsComponent now has an opt-in creation header with projected journey
navigation in the heading position, followed by status and actions. It measures its
height with a lifetime-bound ResizeObserver. The installed NgxActionBar only exposes
a string heading, so overview and receipt continue using that shared component.
The page's visually hidden phase heading is now h1. API/routes/federation unchanged.

### Publication workspace — 2026-11-08
Publication now owns two sibling NgxPanels: confirmation/current receipt and embedded
preparation checks. They stack below 900px. The page's shared content outlet is
unframed so checks are a true sibling; active operations still display progress alone.
PublishingReceiptsComponent adds showLookup (default true); publication disables it
while retaining identity/result display and directing recovery to Request history.
API, state, route and federation contracts are unchanged. See spec 011 handoff.

### Single publication panel — 2026-11-08
Supersedes the two-column publication layout above: Publication now follows the
Create MFE remote presentation with one centered 765px stepped/glass panel, a viewport
NgxBackground and fade entrance. Confirmation and returned receipt remain in its body;
publication/back controls use panel actions. Preparation/checks are absent from this
phase, while existing domain readiness gates stay enforced. See spec 011 follow-up.

### Publication result navigation — 2026-11-08
PublishingComponent observes attempted state and its matching terminal receipt after
work settles, then navigates once to the sibling requests/{requestId} route. The API,
store and scoped VM retain their data responsibilities; routing stays in the page.
The receipt page reads the run independently. Pending work and missing/mismatched
receipts do not redirect. See spec 011 handoff for routed verification.
