# Feature: Publisher overview and AI wizard
Status: Implemented; live shell integration pending
Created/Updated: 2026-10-14
Request: Default overview with searchable/filterable request history; New workshop navigates to an AI creation wizard.

## Requirements and acceptance
- FR-001 / AC-001: Default route redirects to overview; load request history with loading, empty, failure/retry and receipt inspection states.
- FR-002 / AC-002: Search IDs, messages and step names, combined with status filters (all, complete, running, needs recovery, unconfirmed). Show no-results state and clear filters. Include session unconfirmed requests.
- FR-003 / AC-003: New workshop navigates to a dedicated new route, relative to the remote's mount path. Console redirects to new for existing creation links; hello-world redirects to overview.
- FR-004 / AC-004: AI wizard offers brief/model generation, review and optional imagery/editing, then explicit publication and receipt recovery. Require a validated draft before proceeding; editing invalidates review; failures preserve input and request ID; duplicate-sensitive commands retain existing protections.
- FR-005 / AC-005: Preserve shared Admin hero/action style, keyboard labels and responsive layouts at 375px. Navigating away during an active operation is blocked; unsaved drafts require user confirmation.

## Scope and boundaries
No new backend contracts or paid calls for verification. History API is the latest 100 receipts; no workshop title/date is available, so do not invent either. Filter locally within loaded history. App/default export and Routes remain federation entries. Standalone App gains router setup. Validate route mounting under /ai-publisher in tests.

## Receipt/history refinement — 2026-10-14
- FR-006 / AC-006: Inspect receipt navigates to requests/:requestId, loads the
  requested receipt independently of history, supports direct links, refresh,
  failure/retry, invalid IDs and returning to history with search/status retained.
- FR-007 / AC-007: Status badges have distinct green/blue/red/neutral treatments
  with visible text; history shows completed/total steps and deduplicated page/lab
  counts rather than raw operation identifiers. Detail steps have readable action
  names and one-based item numbers; raw result JSON remains in optional disclosure.
  Unknown operation names receive a readable fallback; no invented workshop metadata.

## Brief form polish — 2026-10-14
FR-008 / AC-008: The New workshop page has no reload sections/models/history CTA.
Section and level precede the brief in visual/keyboard order. Brief has an
accessible hint describing prompt ingredients and an example placeholder. Hint
wraps naturally without overlapping Generate workshop draft on narrow screens.
Setup continues automatically; empty-section guidance must not reference the removed action.
