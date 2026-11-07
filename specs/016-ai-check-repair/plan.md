# Plan

Add get_workshop_repair_options for server-authoritative eligibility without adding
fields that older strict preparation-report validators reject. Extend start operation
with repair: new preparationId, sourcePreparationId, expectedDraftHash, activityId,
optional approved model. Resolve context before job insertion; idempotent retries
return the recorded repair before source re-resolution. Restrict to final failed
check/review rows, excluding unavailable checks. Repair generates once using owned
snapshot plus selected finding and rechecks including AI review; no auto second pass.

Frontend store loads repair options only after a failed terminal preparation. It
falls back without repair actions when older servers lack the tool. Presenters emit
selected activity IDs; VM owns operation/progress, a previous snapshot and changed
material summaries. Disable repair/undo while running or after publication attempt.
Keep old draft visible while repairing; apply returned draft for review. Restore
uses the exact saved report/draft/options; backend readiness still binds the hash.

Preserve unrelated deployment notes in both repositories. Do not push, deploy or run
paid provider calls as verification of this feature. Rollout: release publisher API/
contracts and frontend together; old report/receipt shapes remain unchanged. No
Nginx changes or owner persistence migrations are needed.
