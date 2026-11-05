# Pending verification and replay investigation

Reviewed: 2026-11-04
Scope: Pending verify_lab_0 in receipt d7c28e1f-0a28-4101-af69-96bcdee7ee6e.

## UI correction
A pending step no longer receives an editor URL from codingLabEditorUrl. The result
presenter separately requires status:complete before rendering its CTA. Completed
lab/version/verification steps retain their editor link. Tests cover pending lab,
version and verify operations even when a matching lab creation has completed.

## Owner-service observations
The following sibling sources were inspected read-only at the user's request:
- service-coding-labs/src/coding-labs/lab-versions.controller.ts exposes admin-only
  POST /labs/:labId/versions/:versionId/verify (HTTP 200).
- service-coding-labs/src/coding-labs/lab-versions.service.ts verify acquires withLock,
  requires the current draft version, and runs runner.verify. It does not publish,
  create versions or persist a publishing receipt. Re-verifying the current draft
  is supported; a published/replaced draft is rejected, and active locks/capacity
  may require waiting. This reruns current saved content, not necessarily the old
  content hash originally journaled by the publisher.
- service-mcp-gateway/src/publishing/publishing-run.service.ts records a step as
  pending before calling the owner and complete only after receiving a result.
  Pending can mean an error or lost response, not necessarily an unexecuted call.
  Re-submitting publish_workshop with the same request ID/draft returns the existing
  receipt; changed draft hashes are rejected. It deliberately does not replay writes.
- service-mcp-gateway/src/publishing/publishing.spec.ts explicitly tests uncertain
  writes are not repeated. It also checks failed verification stops publication.

## Conclusion and possible future work
The existing coding labs editor can run verification again for the current draft.
The publisher currently cannot resume the receipt by replaying the full request.
A targeted Retry verification action would need gateway-owned recovery support:
admin/receipt ownership checks, current version and hash reconciliation, in-flight
protection, durable recording of the new outcome and an explicit choice of whether
it only rechecks verification or resumes remaining publishing writes. Do not silently
turn successful re-verification into publication or claim the whole receipt is done.

No service code was changed, no endpoint was called to retry, and no receipt or lab
content was modified. This investigation is not live retry or resume verification.
