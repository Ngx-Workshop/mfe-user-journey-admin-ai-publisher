# Tasks: Unified Admin Publisher layout

Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Updated: 2026-10-14

- [x] T001 — Add shared header dependency and hero presenter (FR-001 / AC-001).
- [x] T002 — Add sticky actions, simplify App/page composition and move reset
  action from receipts (FR-002 / AC-002); depends on T001.
- [x] T003 — Match responsive content styles (FR-003 / AC-003); depends on T002.
- [x] T004 — Update existing composition/action assertions; run architecture,
  type checks, tests and isolated build; depends on T001–T003.
- [x] T005 — Record browser evidence, context updates and handoff; depends on T004.

## Evidence
T001–T003: shared header 21.0.5, typed header/action presenters, responsive page
composition; API/store/VM code and entry exports/routes retained.
T004: architecture, both TypeScript checks, 40 Karma tests and production build pass.
T005: desktop and 375px browser preview inspected; one h1, sticky offset 56px and
375px page width measured. Architecture docs and handoff updated. Shell acceptance
is separately pending; local preview has no gateway and shows existing setup errors.
