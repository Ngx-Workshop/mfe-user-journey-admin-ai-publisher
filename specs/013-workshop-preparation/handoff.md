# Handoff: Workshop preparation skills and checks

Status: Implemented; production acceptance pending
Updated: 2026-11-05
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)

## Delivered behavior

Implemented authenticated typed preparation start/get polling, client-chosen IDs retained across interrupted starts, scoped report/approval state, input invalidation and progress resumption. Added a skills/checks timeline with version fingerprints, timing, evidence, final-attempt totals and explicit human review. Completed logs collapse; running/failed logs remain open. Publication includes preparationId; explicit pre-write preparation rejection preserves JSON and permits new checks. Receipt detail can inspect persisted preparation evidence. Initial generation guidance discloses AI review/revision usage.

Source: feature api/publishing-api.service.ts, api/publishing-error.ts, state/publishing.store.ts, pages/publishing.view-model.ts, components/publishing-preparation.component.ts, components/preparation-activity.component.ts, and creation/receipt compositors. Uses vendored generated contracts 1.3.0; build needs no sibling checkout.

## Verification evidence

- PASS: 95 ChromeHeadless tests, including polling termination/cancellation, malformed reports, blocked publication, stale input, explicit rejection recovery and timeline evidence.
- PASS: architecture checks and strict app/test TypeScript checks.
- PASS: isolated production federation build with extracted licenses (dist/preparation-verification).
- Browser: isolated localhost sample server uses the real preparation orchestrator with provider/owner doubles. Observed running skills, tests, one revision/recheck, final 8 passed/0 failed, collapsed completed log, preview and manual-review checklist. No paid model, live image upload or publication.
- Responsive evidence and final bundle review recorded below. Standalone sample acceptance does not establish authenticated production-shell integration.

## Delivery and remaining acceptance

1. Release service-coding-labs with POST /lab-preflight and available isolated runner image.
2. Release service-mcp-gateway with copied skill assets and preparation tools. Its application contract is generated as 1.3.0; no npm release is implied. Keep the existing private publication volume and single-instance profile.
3. Release mfe-user-journey-admin-ai-publisher with its committed 1.3.0 contract tarball. Check authenticated shell generation, report polling, content review and publication receipt against real owners/provider.

No document/assessment schema change. Retain human review for facts, diagram rendering/source and instructional quality. No automatic visual-rendering pass or arbitrary mutation-testing claim. Preparation is bounded process-local state (two active, one per subject, 100 retained, one-hour finished TTL, capacity eviction/restart loss). Publication evidence remains durable. Legacy publication without preparationId is compatible and follows its prior owner verification path.

Context docs: architecture/development and gateway workshop-publishing guide describe exact boundaries. All local implementation tasks are complete; X001 is production rollout/acceptance.

## Final browser evidence

The final production bundle was reloaded after changes. At measured CSS widths
1440 and 390, document content width equaled viewport width (no horizontal overflow).
The final sample run showed one revision, retained earlier failure evidence and
8 final passes/0 failures. Expanding the planning skill revealed version 1.0.0 and
its content fingerprint. The completed log collapses and the workshop preview and
explicit Continue to publish control remain available. Temporary viewport overrides
were reset. A sample-only localhost preview is left running on port 4223; its owner/
provider responses are doubles and its publication operation is disabled.

The final local contract tarball integrity matches package-lock.json and its generated
models/discovery code match the gateway package. Extracted production licenses exist.
