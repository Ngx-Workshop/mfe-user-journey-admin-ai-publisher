# Handoff: MVVM remote starter

Status: Complete
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-10-09

## Delivered behavior

The example now lives under src/app/features/example-documents with stateless
HTTP transport, a root server-state store, scoped catalog/editor view models,
and grouped orchestration/presentation components. Components use inline views,
OnPush, typed inputs/outputs and BEM styles. Tests mirror source in testing/app.

Failed saves retain input and the dialog; concurrent submissions are guarded.
Reads cancel stale requests and retain last good records on failure. Delete
failure retains records. Patches explicitly carry false and blank descriptions;
optional addresses must be complete. Production federation startup and the
standalone Material theme are repaired.

The architecture command and CI checks make these conventions reviewable for
future clones. Federation identity, exports, routes and dependency versions remain
compatible with the existing seed.

## Acceptance and verification evidence

| Scenario/check | Command or method | Result | Evidence/limitation |
| --- | --- | --- | --- |
| AC-001–003 | ChromeHeadless suite | PASS | 15 tests: HTTP URLs/payloads, state cancellation/retention, mutation failures, validation, editor/dialog retry and duplicate guards; synthetic HTTP doubles |
| AC-004 | npm run check:architecture | PASS | Source conventions pass; temporary invalid fixtures also rejected as expected |
| AC-004 | TypeScript noEmit + noUnusedLocals/noUnusedParameters | PASS | Application sources compile without unused symbols |
| AC-004 | Production and development isolated builds | PASS | No warnings; production browser initializes after disabling module concatenation |
| AC-004 | In-app browser, synthetic loopback GET API | PASS | Desktop catalog and mobile create dialog render; 390px viewport has no horizontal overflow; partial address disables save, clearing address enables save |
| AC-005 | Documentation/source review, relative-link audit, git diff --check | PASS | Guidance matches implemented responsibilities and testing layout |
| Host/backend integration | Authenticated host and real CRUD service | NOT RUN | Local starter verification uses synthetic records; no live writes |
| GitHub workflows | Remote CI execution | NOT RUN | Workflows authored; equivalent local checks passed |

Tests were rerun after adding the global theme: all 15 pass. The initial optimized
bundle built but failed Angular initialization in the browser; the repaired bundle
was rebuilt and rendered successfully. No dependency installation or upgrade was
needed. The temporary preview server and viewport override were cleaned up.

## Contract and consumer handoff

No external repository changes are required for this starter upgrade. API requests
use the published seed contract 0.0.7 and /api/example-crud. The update DTO cannot
remove an existing address: blank address edits omit that patch field and preserve
it, as explained in the UI. Runtime host providers and theme remain host-owned;
the standalone stylesheet does not supply a theme to a federated host.

New clones should follow [seed adoption](../../docs/seed-adoption.md), replace the
example domain and identity, configure gateway/host registration, and verify real
integration with disposable records. No changes have been deployed or pushed.

## Remaining work and next action

No unchecked implementation tasks remain for the starter. Host/backend checks and
remote CI execution are environment-specific follow-up checks, not completed local
evidence. Keep the architecture guard alongside compiler, behavior tests and review;
it is a source-convention check rather than a complete semantic linter.

## Context maintenance

Updated AGENTS, README, constitution, architecture/development/adoption guides,
Spec Kit-style templates, testing guide and feature index. Historical seed facts
should be rewritten during adoption rather than copied into a new product.
