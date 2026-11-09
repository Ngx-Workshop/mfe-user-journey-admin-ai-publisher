# Handoff: Journey composition

Status: Complete locally; not deployed
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-11-08

## Delivered behavior

Grouped runtime and mirrored tests into creation, overview, receipt and shared
presentation. Existing routes, DTOs and federation contracts are unchanged.

| Review finding | Resolution |
| --- | --- |
| Creation compositor mixed three steps, dialogs and route lifecycle (822 lines) | Shell is 296 lines; brief/review/publication orchestrators and dialog/controller own distinct concerns |
| Receipt route mixed summary and step-list rendering with navigation (507 lines) | Route/layout is 306 lines; typed summary/progress presenters emit intent |
| Draft saves were mixed with publication commands and their feedback was commented out | Scoped persistence VM owns JSON/revision/save state; page/dialog expose conflicts; retry retains source |
| Flat folders obscured journey ownership | Journey folders for pages and components; API/models/state/utils remain feature-shared |
| Material selection reset when a step was recreated | Session retains selection; presenters preserve initial bound selection and reset when content changes |
| Historical exceptions no longer described executable code | Current ownership/size rationale recorded; historical notes explicitly superseded |

One scoped creation VM still serializes commands. Do not provide separate copies
in the step components or dialog: that would lose draft state and duplicate locks.
The persistence VM is separately provided at the same shell. Public step URLs
were not necessary; `/new?draft=` retains its existing durable restoration contract
and does not imply persisted publication approval.

## Acceptance and verification evidence

All final checks below used Node 22.23.3 (initial orientation used default Node
24.9.0). HTTP/store doubles and a schema-validated read-only local fixture were
used; no live generation, publication, image upload or deployment occurred.

| Scenario/check | Command or method | Result |
| --- | --- | --- |
| AC-001/002/003/004 | `npm test -- --watch=false --browsers=ChromeHeadless` | 118 passed |
| Selection, dialog lifetime, routed recovery | Targeted Karma includes rooted at `../testing` for App, creation component and preview specs | 23 passed |
| AC-005 architecture | `npm run check:architecture` | Passed; nine cohesive size warnings documented in architecture |
| App strict types | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` | Passed |
| Test types | `npx tsc --noEmit -p tsconfig.spec.json` | Passed |
| Production federation | `npm run build -- --output-path dist/journey-verification` | Passed; remoteEntry.js 14,794 bytes; licenses 37,956 bytes |
| Whitespace | `git diff --check` | Passed |
| Review responsive layout | Production bundle/read-only fixture at 1920, 1024, 390px | Document width equals viewport at all three sizes; desktop three columns, narrower single column |
| Creation transition/dialog | 390px fixture | Brief/publication widths 390px; dialog width 358px; selected page 2 survives brief round-trip; explicit approval enables publish without invoking it |
| Receipt responsive selection | Same three viewport widths | No document overflow; mobile Progress -> pending step opens Step details with no-result guidance |

First regression run exposed the selection-reset issue and a dialog test that
did not await its closing animation. Selection ownership was corrected; the
lifetime test now awaits `afterClosed`. Both pass. One targeted test invocation
used paths relative to repository root and selected zero tests; corrected
`../testing` includes are documented in the development guide.

The first local fixture used an invalid empty draft; it was corrected and checked
against the installed contract schema before browser acceptance. A mobile receipt
probe initially waited for hidden progress controls; switching panels and awaiting
render confirmed the actual behavior. These were validation-fixture issues, not
claims of successful backend integration. Existing Ajv UUID-format console warnings
were observed; API/schema behavior was not changed by this refactor.

## Contract and consumer handoff

No producer changes required. App/default App, named Routes, federation exposures,
shared packages, HTTP payloads and relative mount behavior are unchanged. Public
routes remain overview, new, requests/:requestId and legacy redirects. Only internal
source import paths changed.

## Remaining work and next action

T001-T006 complete. Live authenticated-shell smoke and normal release/deployment
remain separate actions: verify the shell offset/theme, saved draft refresh,
refinement and receipt navigation with the new bundle. No paid calls are required
for that smoke. The temporary local fixture server was stopped.

## Context maintenance

Architecture now maps the current journey folders and explicit cohesive exceptions.
Development documents provider scope, regression expectations and correctly rooted
targeted tests. Feature index updated. Constitution and external contracts unchanged.
