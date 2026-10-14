# Handoff: Publisher overview and AI wizard
Status: Implemented; live shell integration pending
Updated: 2026-10-14
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)

## Delivered
The default overview loads the latest 100 request receipts. Search request IDs,
messages and step names with a status filter; session unconfirmed IDs appear too.
Clear filters, loading/empty/no-match/error/retry states and receipt inspection
are available. New workshop navigates to new under the same mount prefix.

The dedicated new page is a three-step vertical Material wizard: brief/model and
AI generation (or JSON import), review/refinement with optional images, then
explicit publication/receipt recovery. Validated drafts and explicit review gate
publication; editing invalidates readiness. Existing inputs/request IDs and
publication duplicate protection survive failures. The guard blocks navigation
during active requests and confirms leaving an unpublished draft. Shared Admin
hero/action layout and responsive gutters remain consistent on both pages.

## Verification
- Architecture command: PASS.
- Strict source and test TypeScript checks: PASS.
- Karma/ChromeHeadless: 47 PASS, including mounted routing, CTA, combined filters,
  retry, receipt inspection, draft guard and actual wizard interaction/gating.
- Production build to dist/wizard-verification: PASS.
- Chrome desktop and 375x812 mobile previews: PASS with sample local history/
  section/model read responses. Both pages' scroll width equalled 375; hero,
  filters, CTA/back navigation and receipt response checked. Back button token
  corrected after preview revealed poor contrast (now white on primary).
- No live shell, paid generation/image upload or real publication checks.
- Checks used installed Node 24.9.0, rather than recommended Node 22.

## Integration and next step
Named/default App and named Routes remain exposed. App now hosts RouterOutlet;
standalone appConfig registers the routes. Routes default to overview, new hosts
the wizard, console redirects to new and hello-world redirects to overview.
Host route consumers load these under /ai-publisher; component-only consumers
must register the child routes. Server must retain index fallback for direct
navigation. No backend contract, dependency version or stored-data migration.

Next: load the updated remote in the administrator shell and verify its default
route, prefix-relative CTA/back navigation, theme and direct route refresh. Live
provider/workshop acceptance is outside this local UI verification.

## Context
Updated architecture/development docs, feature index and architecture orchestrator
allowlist; removed the now-unused options composer. All local tasks completed.
