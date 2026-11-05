# Tasks: Workshop publishing journey

Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Updated: 2026-11-04

- [x] T001 — Add scoped operation/timing state, journey navigation and generation
  progress; replace Material stepper compositor (FR-001/002/004; AC-001/002).
- [x] T002 — Add browsable document/lab/assessment preview, safe Markdown/images,
  answer reveal and secondary refinement (FR-003/004; AC-003/004/005).
- [x] T003 — Update/add phase/progress/preview regression tests, run full behavior,
  architecture/type/build/license/diff checks (all acceptance). Depends on T001/T002.
- [x] T004 — Verify browser desktop/mobile states and update architecture/development,
  feature index and handoff with actual evidence/limits. Depends on T003.

## Evidence and integration follow-up
T001/T002 delivered and exercised through 72 behavior tests. T003 passes architecture,
strict application/test types, production federation build/license and diff checks.
T004 verified desktop and 390px preview, measured toolbar visibility and authenticated
shell setup; documentation and handoff record the live sample-validation rejection.
Live provider/publication acceptance remains an external integration follow-up, not a
claim of successful live validation.

- [x] T005 — 2026-11-05: Recompose brief stage as a nested authoring workspace
  (brief + expanded JSON) beside a separate guidance panel. Follow catalog spacing
  and responsive stacking. Expanded JSON retains control binding, validation,
  locking and review disclosure defaults. Full suite: 86 tests pass; production
  build, architecture, strict app/test types and diff checks pass.
