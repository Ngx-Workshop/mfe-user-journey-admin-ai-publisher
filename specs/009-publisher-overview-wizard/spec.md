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
