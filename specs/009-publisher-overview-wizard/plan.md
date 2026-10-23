# Plan: Publisher overview and AI wizard
Status: Implemented; live shell integration pending
Updated: 2026-10-14

## Design
App becomes a RouterOutlet entry. Routes exports overview and new pages plus compatibility redirects; standalone appConfig supplies provideRouter. Both pages use existing shared hero and sticky actions. Actions expose navigation intent and contextual back action.
OverviewViewModel owns search/status/selected receipt and an exhaustMap command stream consuming the existing singleton store, with DestroyRef cleanup. A stateless history presenter renders rows and emits filter/inspect/refresh intentions.
PublishingComponent becomes a three-step Material wizard using its existing scoped PublishingViewModel. VM owns wizard stage and moves to review only on successful draft acceptance. Step gating preserves validation/publication protections. The page composes the existing stateless image presenter in the review step; remove the now-unused options orchestrator. A route guard preserves drafts and blocks leaving while busy.

## Constitution and integration
Keep all HTTP in API and server state in store; forms and step state in VM. Inline OnPush/BEM components under feature, mirrored tests under testing/app. No new contracts or data migrations. Routes and standalone router need explicit regression tests; component-only consumers require children registered by the host.

## Verification
Architecture, source/test types, Karma tests for history filters/receipt commands/routed CTA and wizard gating, isolated production build; desktop/mobile browser previews. Paid generation and live shell service checks excluded.

## Receipt/history refinement
Move inline overview receipt to a dedicated ReceiptComponent/ReceiptViewModel.
Route-param changes issue replaceable switchMap reads through PublishingStore;
invalid UUIDs do not issue requests; lifetime cleanup cancels reads. Navigation is
relative to the remote mount and preserves history filters in query parameters.
Add a stateless status badge reused in history/detail and pure step display utils.
Group indexed documentation and lab operations without double-counting substeps;
show progress only from receipt step status. Keep raw identifiers searchable.
Verify deep links, parameter replacement/cancellation, retry/invalid inputs,
filter restoration, summary grouping and responsive visual status distinction.

## Brief form polish
Remove the unused model presenter reload output/input and page binding. Reorder
typed form controls in PublishingBriefComponent; add a Material hint and example
placeholder with dynamic subscript sizing. Update existing presentation assertions,
run architecture/type/behavior/build checks and verify mobile hint spacing.
No form mapping, API, state or route changes.
