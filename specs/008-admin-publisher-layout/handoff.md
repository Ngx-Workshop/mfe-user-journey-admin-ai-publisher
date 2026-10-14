# Handoff: Unified Admin Publisher layout

Status: Implemented; shell integration pending
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-10-14

## Delivered behavior
Replaced App's custom hero and repeated page introduction with one shared particle
hero: Workshop publishing eyebrow, AI Publisher h1 and concise description.
New workshop now sits in the primary sticky action bar, with the catalog's 56px
shell offset. Busy/initialization disables reset; reset retains existing VM
semantics. Receipt history and recovery stay in the workspace. Content uses the
reference's 1440px maximum, theme background, desktop spacing and mobile gutters.

## Acceptance and verification evidence
| Scenario/check | Method | Result and limitation |
| --- | --- | --- |
| AC-001 | Existing App test plus Chrome local production preview | PASS: one h1 and shared particle hero. |
| AC-002 | Existing App test extended for reset/busy/initialization | PASS: new request ID, cleared JSON/attempted state; busy disables action. |
| AC-003 | Chrome desktop and 375x812 viewport preview | PASS: mobile page width 375, no horizontal overflow; sticky position and 56px offset measured. |
| Architecture | npm run check:architecture | PASS |
| Source types | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json | PASS |
| Test types | npx tsc --noEmit -p tsconfig.spec.json | PASS |
| Behavior suite | npm test -- --watch=false --browsers=ChromeHeadless | PASS: 40 tests. HTTP doubles; no paid operations. |
| Production build | npm run build -- --output-path dist/layout-verification | PASS |
| Shell integration | Administrator shell with this local bundle | NOT RUN; standalone preview has no gateway and displays existing setup failure guidance. |

Checks ran with installed Node 24.9.0; development guide recommends Node 22.
Temporary preview server/tab and viewport override were cleaned up.

## Contracts and remaining integration
Added @tmdjr/ngx-shared-headers 21.0.5 with a matching singleton federation
configuration. It has Angular ^21.1.0 peer requirements, matching this remote.
No App/default export, route, API, deployment target or stored-data migration.
No service-owner changes are required. Next step: load this bundle in the existing
administrator shell and confirm hero, sticky action alignment and theme there.
Live generation/publication acceptance remains outside this layout task.

## Context maintenance
Updated docs/architecture.md and the feature index. No command, backend contract,
constitution or development workflow changes were necessary.
