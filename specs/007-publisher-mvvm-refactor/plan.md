# Implementation plan: Publisher MVVM refactor

Status: Implemented and verified
Spec: [spec.md](spec.md)
Updated: 2026-10-14

## Source baseline and discrepancies

The clean worktree contains one publishing feature, App/config/routes and four
test files. The API is stateless but uses firstValueFrom; the store owns public
writable signals and Promise execution; the VM uses an alive flag. The main page
is 390 lines and options inject the VM. Spec 006's typed presentation claim does
not match executable code. No separate component templates/styles exist.

## Design and requirement mapping

| Requirement | Approach | Boundary |
| --- | --- | --- |
| FR-001 | Cold HttpClient streams and validated mapping; read-only store signals; deferred execution with catchError/finalize | api/, state/ |
| FR-002 | VM command stream with exhaustMap, ordered initialization with concatMap, takeUntilDestroyed teardown | pages/publishing.view-model.ts |
| FR-003 | Page and options orchestrators; brief, model, image, source, review and receipts presenters with typed inputs/outputs | components/, pages/ |
| FR-004 | Preserve forms and draft state in VM; observe JSON control changes; retain unconfirmed IDs before writes | VM/store and mirrored tests |
| FR-005 | Do not change App/Routes/federation/dependencies or facade payloads | public entry points |

Use the existing feature folder and mirrored testing tree. Keep signal-based
render state and typed reactive controls: RxJS owns async orchestration, not an
additional state framework. Duplicate-sensitive commands use exhaustMap; ordered
initialization uses concatMap. All current reads are explicit commands sharing
the publisher's one-operation policy, not live searches: no switchMap needed.
Store operations are cold; busy protection is checked on subscription. A cancelled
write retains its ID because server work may continue.

## Constitution, contracts and risks

All applicable principles are satisfied without a component-size exception.
Shared singleton state remains UI-independent. Presentation imports neither VM,
store nor API. HTML sanitation remains Angular's existing innerHTML behavior.
Published contracts 1.2.0, authenticated facade and 180-second timeout are
unchanged; no backend delivery or data migration is needed.

Federated verification exposed NG0203 when takeUntilDestroyed implicitly
injected from its secondary entry point. Pass the VM's explicitly injected
shared-core DestroyRef; this resolved the shell failure without changing shared
dependency configuration. Verified again in the optimized production bundle.

Main risk: synchronous completion, teardown or duplicate events might leave
loading flags stuck or discard recovery state. Test each explicitly. Inputs and
user intent must remain wired across every extracted surface.

## Verification plan

AC-001: API tests for envelopes/errors/contract rejection and cancellation.
AC-002: store/VM tests for order, overlap, teardown and readonly shared ownership.
AC-003/004: component tests plus App composition and existing workflow regressions.
AC-005: route tests, architecture checks, strict types and isolated build.
Inspect the supplied shell page without generation/publication; record separately
whether it actually loads the changed local remote. Live provider acceptance is
not inferred from a shell snapshot.
