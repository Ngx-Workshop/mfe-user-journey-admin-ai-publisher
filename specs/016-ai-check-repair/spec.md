# Fix a failed check with AI

FR-001: A current failed content check offers Fix with AI with selected-model/cost
notice. Outages, provider failures, passed/superseded rows and human-review rows do
not offer paid repair. JSON remains an optional advanced escape hatch.
FR-002: Repair uses the owned, unexpired, finished server draft and selected finding;
validate its content hash and activity ID before a model call. Browser-supplied
finding text is never trusted. Existing subject isolation, capacity and idempotent
request IDs remain enforced. One explicit repair request makes at most one revision;
there is no automatic repair loop or publication.
FR-003: Rerun structure, objective, lab and AI teaching checks on the revision. Clear
publication approval and show changed material names plus Restore previous draft.
A failure preserves the original draft and exposes recovery without starting a new
paid request after a lost response; Resume uses the existing preparation ID.
FR-004: Existing preparation/receipt response shapes remain backward compatible.
An additive repair-options tool reports eligible activity IDs; repair is an additive
start-preparation operation. Contracts build independently and frontend vendors a
reproducible package until a registry release is available.

AC-001: Service tests prove focused context, authorization/hash/eligibility validation,
no-model-call rejection, once-only revision/retries, full rechecks and outage exclusion.
AC-002: UI/API/VM tests prove CTA intent/cost display, locking/stale edits, polling,
model selection, retained draft on failure, changed-material summary and undo.
AC-003: Build, strict types, contracts, lint/architecture and behavior suites pass.
Local preview uses fixture responses and makes no paid calls or owner mutations.
