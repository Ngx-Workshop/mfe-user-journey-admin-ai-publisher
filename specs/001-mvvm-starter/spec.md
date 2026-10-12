# Feature: MVVM remote starter

Status: Complete
Feature ID: 001-mvvm-starter
Created: 2026-10-09
Updated: 2026-10-09
Request/source: Apply the assessment/document-editor architecture standards to future MFEs.

## Scope and requirements

Refactor the working example-document CRUD seed; preserve its public App/Routes,
hello-world route, federation exports, generated contract package and service ownership.
Do not deploy or modify the companion backend or other seeds.

- FR-001: Runtime code uses src/app/features/example-documents, grouped into api,
  models, state, forms, utils, pages and components. Testing mirrors src/app outside
  production source under testing/app.
- FR-002: Stateless API client owns HTTP; root singleton store owns server state and
  data orchestration; scoped view models own filtering/forms/commands. Components
  orchestrate composition/lifecycle or present typed inputs and emit intents.
- FR-003: Standalone OnPush/zoneless components use inline templates/SCSS, BEM
  classes and theme tokens. Aim for about 230 lines; explain cohesive exceptions.
- FR-004: Demonstrate latest-read cancellation, duplicate-sensitive command guards,
  lifetime cleanup, error retention/retry, explicit update values, typed contracts,
  partial-address validation and empty/success/loading states without any casts.
- FR-005: Future clones inherit current architecture guidance, templates/adoption
  instructions and a lightweight architecture check command.

## Acceptance

- AC-001: Initial load and search render documents; failed reload retains previous
  records and supports retry; superseded reads cancel. (FR-001/002/004)
- AC-002: Create/edit close only on success; failed save retains form input and
  offers retry; duplicate saves are blocked. Empty description and archived=false
  are sent explicitly. Optional addresses must be complete when provided. (FR-004)
- AC-003: Delete failure retains records; success refreshes shared server state;
  presentation components make no HTTP calls or mutate singleton state. (FR-002/004)
- AC-004: Build and tests pass using external testing tree; source architecture
  check verifies folder/boundary/inline/BEM conventions. (FR-001/003/005)
- AC-005: Docs/templates accurately teach adopting these boundaries. (FR-005)

## Decisions and limits

Keep the seed example domain rather than introducing assessment logic. Normalize
collection URL to /api/example-crud and encode IDs once in detail URLs. Published
UpdateExampleMongodbDocDto permits no null address; blank address fields omit that
patch field and preserve a stored address. Explain this limit in edit UI/docs.
No new framework, dependency upgrade, backend change or auth policy is introduced.
