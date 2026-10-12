# Implementation plan: MVVM remote starter

Status: Complete
Spec: [spec.md](spec.md)
Updated: 2026-10-09

## Technical context and baseline

Angular/Material 21.1.0, TypeScript ~5.9.3, RxJS 7.8.2, Module Federation and
ngx-build-plus 20 series; published seed contracts 0.0.7. Working tree clean.
Existing list/dialog inject API; list owns server state; subscriptions have no
teardown; dialog dismisses on errors. Forms drop false/empty updates and allow
partial addresses. The scaffold title test is stale and lacks HTTP providers.

## Ordered design

1. Record requirements and migrate executable example into features/example-documents.
2. api/ExampleCrudApiService handles transport; state/ExampleDocumentsStore owns
   shared documents/loading/error and mutation-driven refresh. switchMap cancels
   reads; defer/finalize expose mutation state without coupling to forms or dialogs.
3. pages/catalog scoped CatalogViewModel filters shared data and guards deletion.
   components/editor scoped EditorViewModel owns typed form, save errors and guarded
   submit stream; orchestration dialog closes on saved$ and locks while submitting.
4. components/document-card and components/document-form are typed presentations;
   pages/catalog composes controls/cards, editor dialog and delete confirmation.
5. Mirror tests under testing/app and configure Karma include relative to src.
   Verify HTTP mappings, store refresh/retention, forms and editor retry/teardown.
6. Add dependency-free architecture guard; update constitution, agent entry point,
   plan/tasks templates, adoption/source/testing docs and handoff.

## Constitution and compatibility

Six principles satisfied by distinct frontend responsibility/server ownership,
preserved default App and named Routes, standalone OnPush/zoneless state, observable
acceptance tests and current local docs. Existing federation exports/shared versions
and hello-world path remain. No external repository writes or deployment required.

## Verification

Architecture command, production/development builds, ChromeHeadless suite with
HTTP doubles, type checks, documentation links and git diff --check. Browser smoke
uses synthetic loopback data, never live records. Host auth/gateway verification
remains separate; no backend/null-address contract is invented.

## Runtime findings during verification

The original optimized federation bundle failed in the browser with
ɵɵdefineInjectable not a function. Disable production module concatenation (the
same fix already verified in the learner MFE), keeping identity/exposures/versions
intact, and repeat the browser check. The seed's empty global stylesheet also
left standalone Material unthemed; supply a standalone-only Material theme while
federated consumers continue inheriting their host theme.
