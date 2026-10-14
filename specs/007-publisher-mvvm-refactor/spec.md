# Feature: Publisher MVVM refactor

Status: Complete
Feature ID: 007-publisher-mvvm-refactor
Created: 2026-10-14
Updated: 2026-10-14
Request/source: Codebase quality refactor requested by the administrator.

## Problem, scope and baseline

The publisher already separates HTTP from root state, but Promise-based requests
cannot be cancelled with view teardown. The 390-line publishing page combines
forms, review and recovery. Options inject the VM despite spec 006 describing them
as presentation. Refactor all current runtime feature code, preserving behavior.
Historical catalog/OAuth implementations are no longer in this checkout.

In scope: API/store/VM streams, composition, inline BEM views, regression tests,
architecture enforcement and context documentation. Out of scope: new product
features, paid provider calls, backend changes, federation or route changes.

## Requirements and acceptance

- FR-001 / AC-001: Stateless API observables validate published contracts; root
  state owns shared results and request orchestration, not forms or drafts.
  Authenticated requests, timeout, error guidance and invalid-response rejection
  remain unchanged.
- FR-002 / AC-002: Scoped VM commands reject overlap, initialize reads in order,
  preserve setup errors and input after failure, and stop accepting results when
  destroyed. Read cancellation must release busy state.
- FR-003 / AC-003: Standalone OnPush orchestration components compose typed
  presentation components. Every component has inline HTML/SCSS, BEM classes,
  accessible labels and approximately 230 lines or fewer.
- FR-004 / AC-004: Generate/import/edit/image/review/publication/history flows
  remain available. Editing invalidates review, failed publication retains the
  request ID and blocks duplicate publication; receipt inspection reconciles
  unconfirmed requests without changing the current ID.
- FR-005 / AC-005: Named/default App, Routes, exposures, shared versions, HTTP
  paths and DTO payloads remain compatible.

## Success criteria and assumptions

Architecture, strict source/test types, behavior tests and isolated production
build pass. Component tests verify typed intent and empty/review/receipt states.
Live shell inspection is attempted separately; doubles do not prove deployed
provider behavior. No requirement to issue paid generation or publication during
verification. Cancelling a browser write does not cancel server work: submitted
request IDs remain shared and recoverable.
