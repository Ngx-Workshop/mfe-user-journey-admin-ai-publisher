# Feature: Journey composition

Status: Complete locally; not deployed
Feature ID: 018-journey-composition
Created: 2026-11-08
Updated: 2026-11-08
Request/source: Review standards after design-system migration and regroup user journeys.

## Problem and audience

Administrators need predictable creation, review and recovery flows. Contributors
need explicit ownership rather than a growing wizard compositor. Source inspection
found an 822-line creation component, a 694-line creation VM, a 507-line receipt
component, and obsolete size exceptions in architecture documentation. The baseline
architecture check passes; that is not proof of cohesive responsibilities.

## Scope and requirements

- FR-001: Group page orchestration and presentation by creation, overview, receipt
  and genuinely shared responsibilities within the existing publishing feature.
- FR-002: Give brief, review, publication and refinement distinct composition
  owners, retaining one scoped creation session and existing navigation semantics.
- FR-003: Separate draft persistence from publishing commands. Keep source edits,
  revision conflicts, retry and unsaved-navigation protection observable.
- FR-004: Separate receipt summary/progress presentation from route/lifecycle/layout.
- FR-005: Preserve App/Routes/federation, URLs, DTOs, safe previews, explicit review,
  duplicate protection, operation locks, keyboard access and responsive layout.
- FR-006: Enforce presentation/orchestration boundaries and maintain accurate
  architecture guidance and mirrored tests.

Out of scope: API/dependency upgrades, backend changes, paid generation,
publication, deployment, or a new visual design.

## Acceptance

- AC-001: Generate/import, review materials, refine, validate and explicitly approve
  before publication. Step switches retain forms, draft and selection. Active work
  displays progress instead of editable workspace content. (FR-002/005)
- AC-002: Import closes after successful validation; refinement retains edits and
  stays locked while busy. Dialogs close on leaving the creation session. (FR-002/005)
- AC-003: Saved edits and revision conflicts expose status/error/retry; malformed
  saved links show guidance. Navigation still protects unsaved work. (FR-003/005)
- AC-004: Receipt refresh/recovery, step selection, verification warnings, editor
  links and responsive panels remain available. (FR-004/005)
- AC-005: Architecture checks, strict types, behavior tests and isolated production
  build pass. New components aim at 230 lines; cohesive exceptions are documented,
  not hidden by moving templates/styles out of components. (FR-001/006)

## Data, assumptions and success criteria

One creation session intentionally spans the three transient phases. Keep `/new`
and `?draft=` restoration rather than introducing step URLs that could imply durable
review approval. The user authorized separate routes if necessary; scoped step
orchestrators solve the composition issue without changing that public contract.
Administrator/session ownership and published contracts are unchanged.

Local acceptance uses store/HTTP doubles and production compilation. Live shell,
provider and owner-service integration remain separate acceptance work; local tests
must not be described as deployment or paid workflow verification.
