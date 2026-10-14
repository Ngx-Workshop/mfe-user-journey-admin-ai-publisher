# Architecture and external context

Updated 2026-10-14 for [007 Publisher MVVM refactor](../specs/007-publisher-mvvm-refactor/spec.md).

## Responsibilities and source map
AI Publisher owns administrator workshop generation, import, review, validation, publication and receipt inspection. App composes features/workshop-publishing/pages/publishing.component.ts directly. MCP catalog exploration and browser OAuth have moved to the independently federated mfe-user-journey-admin-mcp-gateway.

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
- `pages/publishing.component.ts`: lifecycle and overall composition.
  `components/publishing-options.component.ts`: nested options orchestration
  using the same page-scoped VM, not a second VM or store.
- `components/publishing-{brief,model,images,source,review,receipts}.component.ts`:
  presentation only, typed inputs and user-intent outputs; no service/VM injection.
  Controls are supplied by the VM. `forms/publishing-form.ts` names the brief form.

All components are below the approximate 230-line guideline; the previous review/
form exception is no longer needed. HTML and SCSS are inline. Global standalone
theme foundations remain in src/styles.scss; federated views inherit shell tokens.
App/Routes/config remain entry points rather than feature state owners.

## External contracts and federation
Published DTOs and Ajv schemas use committed vendor @tmdjr/service-mcp-gateway-contracts 1.2.0 until registry publication. The browser facade is owned by service-mcp-gateway; this dependency remains necessary for publishing even though the MCP SDK and catalog feature have moved out.

Keep named/default App, named Routes, federation name, ./Component, ./Routes, remoteEntry.js and Angular shared singletons. Default path redirects to console; hello-world redirects there for compatibility. Standalone appConfig owns HTTP/Material animations/zoneless setup; the consuming shell supplies its existing HttpClient/session interceptors and theme.

Build/deployment targets remain dist/mfe-user-journey-admin-ai-publisher and /opt/mfe-remotes/mfe-user-journey-admin-ai-publisher. No migration of stored content or publishing API changes. Historical specs 002/003 describe the former catalog/OAuth implementation; current ownership and migration evidence are in spec 005.

## Publisher options — 2026-10-13
PublishingComponent initializes ordered section/model/history reads through its scoped VM. PublishingOptionsComponent composes model/image presenters using that VM. The store retains unconfirmed submitted IDs for this app session; durable administrator-owned receipts come from list_publishing_runs (latest 100 by receipt modification time). The gateway enforces model choices. Prices are server reference rates; configuration can replace the model catalog. Unknown configured model prices are explicitly unavailable. Images are reviewed, inserted into the first documentation page as existing editor blocks and validated before publication. Images are not a separate workshop cover field.
