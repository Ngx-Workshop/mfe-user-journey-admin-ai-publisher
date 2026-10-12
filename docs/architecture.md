# Architecture and external context

Updated 2026-10-09 for [001 MVVM starter](../specs/001-mvvm-starter/spec.md).
The executable seed demonstrates example-document list/search/create/edit/delete.
It owns this journey; shell, gateway, auth and backend data are external owners.

## Source map

```text
src/app/
  app.ts / app.config.ts / app.routes.ts
  features/example-documents/
    api/                  # stateless ExampleCrudApiService
    models/               # generated DTO exports, dialog/form types
    state/                # singleton ExampleDocumentsStore
    forms/                # stateless typed ExampleFormService
    utils/                # user-facing API error mapping
    pages/catalog/        # catalog orchestration + scoped CatalogViewModel
    components/
      document-card/      # typed card presentation
      document-form/      # document/address form presentations
      editor/             # dialog orchestration + scoped EditorViewModel
testing/
  app/                    # mirrors source app/features folders
  fixtures/               # synthetic test-only DTOs
scripts/check-architecture.mjs
```

The data flow is API → singleton store → scoped VM → component template.
User intents flow from presentation outputs → orchestration/VM → store → API.
App is a thin public composition entry point. Catalog/dialog components inject
scoped VMs and UI integration such as MatDialog. Cards/forms inject no server state.
Forms accept a typed FormGroup from the owning scoped VM; this demonstrates nested
presentation without putting forms in singleton state.

The store exposes readonly shared signals and owns loading/error/mutation state.
Its root refresh stream uses switchMap to cancel stale reads and retains successful
records on read failure. Mutation observables trigger refresh on success; finalize
releases pending state on completion/error/cancellation. A refresh error after a
successful write stays a read error, not a failed write that encourages duplicates.
Scoped command streams use exhaustMap; takeUntilDestroyed ends their requests.
Editor errors keep the form open and preserve input for retry. Form mapping sends
false archived and blank description explicitly and validates optional addresses.

## Federation and providers

Keep named/default App, named Routes, mfe-user-journey-admin-ai-publisher, ./Component, ./Routes and
remoteEntry.js. The route export retains empty-path redirect to hello-world.
The host supplies HttpClient/session interceptors and Router when it consumes
Routes. Remote loading does not install standalone appConfig. Standalone bootstrap
uses App directly and needs no Router because the example has no route navigation.
It provides zoneless change detection, HTTP and animations. src/styles.scss supplies
the standalone Material theme; federation does not install this theme in the host.

Angular/Material/CDK 21.1.0, RxJS 7.8.2 and strict shared versions remain unchanged.
Production webpack disables module concatenation to preserve Angular identities
across federation boundaries; the inherited optimized configuration failed at
runtime with a missing defineInjectable export before this repair.
Module Federation and ngx-build-plus retain inherited 20-series versions; builds
and standalone verification do not prove every host combination compatible.

## External contracts

The installed @tmdjr/seed-service-nestjs-contracts 0.0.7 types define the consumer
DTOs; backend validation defines accepted requests. The stateless API normalizes
its base URL to /api/example-crud and encodes IDs once for detail paths.

| Method | Browser path | Contract |
| --- | --- | --- |
| GET | /api/example-crud | ExampleMongodbDocDto[] |
| GET | /api/example-crud/:id | ExampleMongodbDocDto |
| POST | /api/example-crud | CreateExampleMongodbDocDto → document |
| PATCH | /api/example-crud/:id | UpdateExampleMongodbDocDto → document |
| DELETE | /api/example-crud/:id | void |

The backend owns persistence/authorization. The seed contains no auth guard and
does not fabricate credentials or backend behavior. Blank address fields omit
the address property; PATCH then preserves an existing address. The published
update DTO provides no null/removal field, so removing an address requires a
producer contract change. Partial nonblank addresses are invalid locally.

Host/registry owners are mfe-shell-workshop, mfe-shell-admin and
service-mfe-orchestrator. Gateway owners map the browser API prefix to
seed-service-nestjs. Package/shared metadata owners are independent repositories.
No sibling checkout is needed; use local HTTP doubles when services are unavailable.

Build output remains dist/mfe-user-journey-admin-ai-publisher. The existing deploy workflow targets
/opt/mfe-remotes/mfe-user-journey-admin-ai-publisher on main. Registration/gateway configuration and
actual deployment are separate integration work; this change does not execute them.
