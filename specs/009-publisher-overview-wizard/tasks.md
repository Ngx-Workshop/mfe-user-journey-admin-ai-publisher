# Tasks: Publisher overview and AI wizard
- [x] T001: Overview scoped VM and stateless history presenter; test search/status/empty/errors/inspection.
- [x] T002: Default overview/new routes, relative CTA/back links and standalone router; test mounted routing/compatibility.
- [x] T003: Three-step wizard, validation gating and navigation preservation; test successful/failed generation and review invalidation.
- [x] T004: Architecture/type/test/build checks and browser responsive acceptance.
- [x] T005: Update architecture/development, feature index and handoff with evidence and integration limits.

## Evidence
T001–T003: overview/filter presenter and VM; routed standalone/App entry; wizard
with explicit review gating and draft navigation guard. Existing API/store contracts retained.
T004: architecture, strict source and test types, 47 Karma tests and isolated
production build pass. Desktop and 375px browser previews checked with local
sample read responses; combined search/filter, receipt inspection and CTA/back
navigation verified. Both pages measured page width 375 at viewport 375.
T005: architecture/development/index and handoff updated. Live shell/provider
acceptance remains separate from completed local tasks.

## Receipt/history refinement
- [x] T006: Routed receipt page/VM with direct loading, retry, cancellation and filter return.
- [x] T007: Shared colored status badge and readable progress/step descriptions.
- [x] T008: Route/summary/regression checks, responsive preview and documentation handoff.

T006–T008 evidence: 52 Karma tests PASS, including deep links, malformed UUID,
replacement cancellation, retry, filter return and deduplicated summary counts.
Architecture/source/test types and production build PASS. Chrome local sample-data
preview verified colored badges, readable steps, direct detail reload and history
navigation; overview/detail both measured 375px scroll width at viewport 375.
No live shell or service publication acceptance was performed.

- [x] T009: Remove wizard reload action, reorder fields and add prompt guidance;
  update existing checks and verify hint layout on mobile.

T009 evidence: existing presenter assertions verify section/level/brief order,
prompt hint/example and absence of reload action. 52 tests, architecture and both
type checks PASS; production build to dist/brief-verification PASS. Desktop/375px
sample-data preview verified hint wrapping; mobile hint bottom 581.89px, generate
button top 597.89px (16px separation), page width 375px. No paid operations.
