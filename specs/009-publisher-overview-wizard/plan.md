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
