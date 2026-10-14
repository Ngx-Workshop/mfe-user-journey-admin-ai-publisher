# Tasks: Publisher MVVM refactor

Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Updated: 2026-10-14

- [x] T001 — Refactor stateless API and singleton store to cold validated streams
  in src/app/features/workshop-publishing/api and state. FR-001/005, AC-001.
  Dependencies: none. Verify API/store behavior and strict types.
- [x] T002 — Refactor scoped publishing VM command lifecycle and JSON changes.
  FR-002/004, AC-002/004. Depends on T001. Verify order/overlap/teardown/recovery.
- [x] T003 — Extract typed presenters and compose page/options orchestrators in
  src/app/features/workshop-publishing/components and pages. FR-003/004.
  Depends on T002. Verify component intent, App rendering and component sizes.
- [x] T004 — Update mirrored tests and architecture guard. AC-001 through AC-005.
  Depends on T001/T002/T003. Verify architecture, tests, strict types and build.
- [x] T005 — Inspect supplied shell without paid writes; update architecture,
  development, feature index and handoff with exact evidence. Depends on T004.

External work: no contract changes. Paid/live provider workflows remain outside
local regression acceptance and must not be claimed from mocks.

## Progress and evidence

T001/T002: API/store/VM tests verify cold execution, cancellation, busy ownership,
ordered setup, errors, JSON edits and request recovery. T003: six presenters and
two feature orchestrators; all components are 24-97 lines (App is 33).
T004: 40 Karma tests pass; architecture, strict source/test types, diff whitespace
and isolated production build pass. T005: current production bundle rendered in
the administrator shell; form gating, invalid JSON and 375px layout verified.
Temporary browser routing restored; original local remote also renders the new
presenters. Exact commands and limits are in [handoff.md](handoff.md).
