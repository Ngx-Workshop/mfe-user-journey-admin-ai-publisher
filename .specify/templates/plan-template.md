# Implementation plan: <feature>

Status: Draft
Spec: [spec.md](spec.md)
Updated: <date>

## Source baseline

<Commit/reference, relevant source files, current behavior, and inherited
limitations that affect this feature. Verify dependency versions from manifests.>

## Design and requirement mapping

| Requirement | Approach | Files/boundaries affected |
| --- | --- | --- |
| FR-001 | <Concrete approach> | <Actual paths and integration points> |

## Constitution check

<For each applicable principle: satisfied, N/A with reason, or an explicit
deviation with rationale/impact/follow-up. Revisit after implementation.>

## Data, API, and integration contracts

<Requests, responses, validation, access policy, ownership, generated artifacts,
and compatibility. Include host exports/routes for frontend changes or DTO/
schema/OpenAPI changes for services as applicable. Mark unchanged boundaries.>

## External dependencies and delivery order

| Owner repository | Required contract/change | Compatibility and ordering | Local fallback / pending check |
| --- | --- | --- | --- |
| <Owner or none> | <Exact dependency> | <Producer/consumer sequence> | <Test double and verification limit> |

## Verification plan

| Acceptance scenario | Check/test | Environment or prerequisites |
| --- | --- | --- |
| AC-001 | <Observable check and test path/command> | <Local, test DB, host, etc.> |

<Use the repo development guide. Distinguish unit/build checks from integration.>

## Risks and migration

<Relevant failure modes, data migration, backward compatibility, rollout/rollback,
or N/A with explanation. Avoid unrelated deployment work.>

## Decisions and open questions

<Resolved choices with evidence; unresolved decisions and which tasks they block.>

## Frontend architecture review

Describe the feature tree under src/app/features/<feature> and mirrored testing/app
paths. Map stateless HTTP, singleton state orchestration, scoped view models,
orchestration components, presentation components and typed forms. Record stream
operators/lifetimes, loading/empty/error/retry behavior, inline HTML/SCSS/BEM and
component size exceptions. Verify npm run check:architecture, appropriate behavior
tests and build; record any rule exceptions with rationale and impact.
