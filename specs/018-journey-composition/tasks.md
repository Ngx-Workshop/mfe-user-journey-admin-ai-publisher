# Tasks: Journey composition

Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Updated: 2026-11-08

## Local implementation

- [x] T001: Group runtime/test files by journey; update imports and architecture
  orchestration boundary. FR-001/006, AC-005. Depends on: none.
- [x] T002: Split creation shell, steps and refinement dialog; retain shared scoped
  state, locks and lifecycle. FR-002/005, AC-001/002. Depends on: T001.
- [x] T003: Extract persistence VM and restore visible save/error/retry feedback.
  FR-003, AC-003. Depends on: T001.
- [x] T004: Extract typed receipt summary/progress presenters. FR-004, AC-004.
  Depends on: T001.
- [x] T005: Verify regressions, architecture, strict types and isolated build.
  All ACs. Depends on: T002/T003/T004.
- [x] T006: Update architecture/development context and handoff with results and
  explicit remaining integration limits. Depends on: T005.

## External work

No external contract implementation required. Live shell acceptance/deployment is
not part of this local refactor and must not be inferred from local doubles.

## Evidence

T001-T004: strict app/test types, 118 passing tests and production compilation.
T005: local browser measurements and command outcomes in the handoff.
T006: current source map, size exceptions, targeted test commands and feature
index updated. Historical migration notes explicitly distinguished from current
architecture.
