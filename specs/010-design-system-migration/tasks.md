# Tasks: Publisher design system migration

Updated: 2026-11-01
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)

- [x] T001 — Migrate actions, page roots, history, wizard, receipt and supporting presenters under src/app/features/workshop-publishing. Covers FR-001–004. Verify shared components and retained intents.
- [x] T002 — Adopt standalone theme in src/styles.scss and verify contracts/types, architecture, behavior tests and isolated production build. Depends on T001.
- [x] T003 — Smoke test shell history/wizard/receipt and narrow layout, then record evidence and update context docs/index. Depends on T001–002.

## Evidence
T001: Shared NgxActionBar/NgxPanel/NgxButton/NgxInlineStatus replace local presentation; API/store/VM untouched.
T002: Architecture, strict app/spec TypeScript, 52/52 Karma tests and isolated production build passed. Production bundle watcher also compiled the final minor style refinements successfully.
T003: Real administrator shell verified search no-results, clear/status filters, completed and attention receipts, return with status retained, wizard section/model loading and disabled generation. History, wizard and loaded receipt each measured document width/scrollWidth 375/375 at 375px. Temporary viewport restored. No paid generation, upload or publication calls.

- [x] T004 — Apply full-width rail/workspace layout and explicit panel variants.
  Covers FR-005 / AC-005. Preserve filter, navigation and recovery behavior.
- [x] T005 — Verify architecture, types, behavior tests, production build and
  desktop/mobile shell geometry; update handoff and context.

- [x] T006 — Separate issues, compact receipt rows and bounded panel bodies on all
  breakpoints. Covers AC-006–007; preserve filtering and inspect intents.
- [x] T007 — Verify partition/intent behavior, architecture/types/build, viewport
  bounds and list scrolling; update handoff/context with evidence.

- [x] T008 — Compact receipt detail and constrain progress/result scrolling;
  use NgxCodeBlock for JSON result details. Covers AC-008–009.
- [x] T009 — Verify result rendering, existing receipt behavior, architecture,
  types/build and desktop/mobile panel bounds; update handoff/context.

- [x] T010 — Three-column receipt panels and scoped selected-step state. Covers AC-010.
- [x] T011 — Verify selection/results/reset, architecture/types/build and shell
  desktop/mobile scrolling; update context/handoff.

- [x] T012 — First-step workshop metadata, primary receipt button, copy ID and
  separate workshop launch action. Covers AC-011.
- [x] T013 — Verify metadata/actions/search, checks/build and browser behavior;
  update context and handoff.
