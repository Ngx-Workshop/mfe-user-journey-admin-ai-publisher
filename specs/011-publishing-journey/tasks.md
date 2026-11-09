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

## Brief polish — 2026-11-07
- [x] T006 — Compact action-bar journey, conditional creation action, widened checks
  rail, model panel, header import modal and panel generation action (FR-007/AC-007).
- [x] T007 — Verify modal preservation, locks, guidance replacement, responsive
  layout and standard architecture/types/tests/build; record evidence in handoff.

## Journey heading and release — 2026-11-08
- [x] T008 — Replace creation action-bar heading with journey and retain measured
  sticky offsets/page heading; repair stale history/receipt test expectations.
- [x] T009 — Pass all release checks and deploy accumulated UI work through the
  repository production workflow; record exact release and outcome in handoff.

## Activity-only loading view — 2026-11-08
- [x] T010 — Hide workspace panels whenever operation progress is visible and restore
  them at idle, preserving form/source state (FR-009 / AC-009).
- [x] T011 — Verify operation/phase visibility, restored source, architecture/types,
  full tests and production build; record handoff evidence.

## Publication panels — 2026-11-08
- [x] T012 — Two publication panels, embedded right-side checks, no lookup controls,
  current receipt/identity and Request history recovery retained (FR-010 / AC-010).
- [x] T013 — Verify layout composition, operation hiding, publication guards and
  receipt recovery guidance; run architecture/types/tests/build and record evidence.

## Single publication panel — 2026-11-08
- [x] T014 — Replace publication columns with the referenced centered glass panel,
  viewport background/fade and panel actions; remove publication checks (FR-011).
- [x] T015 — Verify single-panel composition, no checks/lookup, footer gates,
  responsive background, architecture/types/tests/build and record handoff.

## Publication completion routing — 2026-11-08
- [x] T016 — Navigate matching terminal publication results to mounted receipt detail,
  waiting for work to settle and guarding repeated/unrelated navigation (FR-012).
- [x] T017 — Verify routed success/recovery and non-result behavior, then run standard
  architecture/types/tests/build checks and update handoff.
