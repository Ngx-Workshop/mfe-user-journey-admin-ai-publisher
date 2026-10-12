# Constitution — Angular remote seed

Version: 1.1.0 · Adopted: 2026-09-29 · Updated: 2026-10-09

These are durable requirements demonstrated by the executable starter. Verification
evidence and integration limits belong in the development guide and feature handoffs.

## 1. One remote, one responsibility

Ngx-Workshop is a learning platform using independently maintained repositories.
A remote owns a focused user journey or a structural element. The host shell
loads and composes remotes. Do not nest remotes or assume ownership of global
navigation, authentication, or other journeys.

## 2. Preserve integration contracts

Treat `remoteEntry.js`, exposed modules, exported symbols, route behavior, shared
singletons, and HTTP contracts as public interfaces. Document compatibility and
consumer impact before changing them. The gateway owns routing from browser API
paths to services; this remote does not choose production service addresses.

## 3. Angular MVVM and feature organization

Keep runtime code under `src/app/features/<feature>`, grouped into api, models,
state, forms, utils, pages and presentation components by responsibility. Keep
public App/Routes/config at src/app and specs under the mirrored testing/app tree.
Create additional folders such as styles or resolvers only when they have content.

Stateless API clients own HTTP and generated DTO mapping. Root singleton stores
own shared server state and data orchestration without depending on UI, forms,
dialogs or Router. Scoped view models own view/form state and call stores.
Orchestration components compose views and manage lifecycle. Presentation
components accept typed inputs and emit user intent without injecting stores or
API clients. Multiple layers of orchestration are allowed for distinct concerns.

Use standalone OnPush components, zoneless-compatible signals, Angular Material,
typed reactive forms and RxJS streams. Use switchMap for replaceable reads,
concatMap for writes requiring order, exhaustMap for duplicate-sensitive commands,
and takeUntilDestroyed or equivalent lifetime cleanup. Keep form/draft state out
of shared singleton stores. Preserve user input and useful errors on failure.

Inline component HTML and SCSS; shared style foundations may remain mixins.
Use BEM class naming and host theme tokens. Aim for approximately 230 lines per
component; document justified cohesive exceptions. Avoid hiding code to meet a
line count. No extra state framework or unsafe any casts in the starter. Keep
Angular and federation versions compatible with the consuming shell.

## 4. Put data ownership on the server

Use published DTO contracts and explicit request mapping. Frontend visibility and
route guards support the user experience; backend authorization remains necessary.
Keep credentials and privileged operations out of browser assets. Do not infer
authorization rules from the seed's demonstration CRUD interface.

## 5. Make behavior observable and verifiable

Specify acceptance scenarios before nontrivial implementation. Cover loading,
empty, success, validation, and failure states appropriate to the feature. Preserve
keyboard access, useful labels, and responsive behavior. Test observable outcomes
and integration boundaries; do not treat a successful build as end-to-end proof.

## 6. Keep knowledge local and current

An agent with this checkout alone must be able to understand its responsibilities,
contracts, and verification steps. Record external dependencies and handoffs in the
feature folder. Distinguish assumptions, source observations, and verified results.

## Amendments

Change these principles intentionally with a rationale and version/date update.
Review affected architecture docs and templates at the same time. A justified
feature-specific exception belongs in its plan, with impact and follow-up stated.
