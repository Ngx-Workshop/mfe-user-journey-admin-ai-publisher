# Handoff: Publisher MVVM refactor

Status: Complete (local refactor acceptance; paid workflows not exercised)
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-10-14

## Delivered behavior

- Stateless API returns cold validated HTTP streams, retaining credentials,
  timeout and error mapping.
- Root store owns read-only shared signals and subscription-time request
  protection. Completion/error/cancellation releases busy correctly, including
  ordered reads and reentrant finalization. Cancelled or failed publication
  preserves the submitted ID for receipt reconciliation.
- Scoped VM owns forms, draft/review, selected image and current receipt.
  exhaustMap protects commands, concatMap orders setup, teardown cancels reads/
  writes and prevents late results. JSON control changes invalidate review even
  when set programmatically. Failed commands preserve useful inputs.
- Page and nested options orchestrators compose six typed presenters: brief,
  model, images, source, review and receipts. Components are standalone OnPush
  with inline HTML/SCSS and BEM classes. All are below 230 lines; the largest is
  97 lines, and the former 390-line page is 63.
- Architecture guard now checks presentation/VM boundaries and rejects
  Promise-based API/state operations. Architecture/development context updated.

## Acceptance and verification evidence

| Scenario/check | Command or method | Result | Evidence/limitation |
| --- | --- | --- | --- |
| AC-001/002/004/005 | npm test -- --watch=false --browsers=ChromeHeadless | PASS | 40 tests: API, store, VM, presenters, App; HTTP/service doubles, no paid calls |
| AC-003 | npm run check:architecture | PASS | No size warnings; API/state/VM boundaries, inline views, BEM, typed code |
| Strict runtime | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json | PASS | No unused source or type errors |
| Test types | npx tsc --noEmit -p tsconfig.spec.json | PASS | Typed fixtures and doubles |
| Production/federation | npm run build -- --output-path dist/mvvm-verification | PASS | Optimized bundle, hash 4eca42e446024cc6; isolated output avoids the existing watcher |
| Whitespace | git diff --check | PASS | Source patch clean |
| Shell smoke | Supplied https://admin.ngx-workshop.io/ai-publisher/console with local production bundle | PASS | Five initial presenters, new BEM title, no setup alerts, four model choices and five section choices including placeholders |
| Local interactions | Enter brief/select section; malformed JSON; start new workshop | PASS | Generate enabled for valid form, explicit JSON guidance, reset clears guidance and disables invalid generation |
| Responsive layout | 375px browser viewport and computed layout | PASS | Publisher width 343px; single 309px field column; no document horizontal overflow |
| Paid generation/images/publication/recovery | Not run | NOT RUN | Existing integration acceptance remains; no claims from doubles |

The editor test tool found no tests; the repository Karma runner was used instead.
An initial test fixture used an unsupported editor block name; corrected to the
published Codemirror type. Initial federated smoke exposed NG0203 with implicit
takeUntilDestroyed injection; explicitly passing the scoped shared-core DestroyRef
resolved it. The final production bundle was loaded and tested again.

Baseline shell inspection reported structural style component-ID collision
warnings. Reloads also logged an aborted view-transition InvalidStateError;
the publisher rendered and smoke checks passed. This separate reload observation
was not diagnosed or changed in this remote.

## Contract and consumer handoff

No external repository action or migration is required. Named/default App,
Routes, console/compatibility redirects, remote exposures, Angular/RxJS shared
versions, gateway contracts 1.2.0 and facade payloads are unchanged.

Internal API/store methods now return Observables; callers subscribe rather than
awaiting Promises. VM intent methods return void and own lifetime-bound
subscriptions. Runtime callers and mirrored tests were migrated together.

## Remaining work and next action

All T001-T005 tasks are complete. Browser-only temporary routing was removed and
the existing localhost:4201 remote was confirmed to render the new presenters.
The temporary verification server/output are cleaned up; the user's server is
untouched. No dependencies were installed, commits created or deployment made.

For product integration acceptance, use a real configured administrator session
to generate, insert an image, publish and recover a receipt. Those paid/server
actions were deliberately not triggered by this refactor.
