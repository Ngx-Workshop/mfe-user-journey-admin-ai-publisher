# Plan: Receipt verification outcomes and reading layout

Status: Complete
Spec: [spec.md](spec.md)
Updated: 2026-11-04

## Source baseline
ReceiptViewModel projects labels; publishingProgress counts status:complete without
checking verification result.passed. ReceiptWorkspacePanel always caps its body to a
measured workspace height; all three panels currently scroll internally. Live
create_lab_0 result confirmed _id 6aebffc0140f132cb6017a19. The failed result contains
no lab ID itself. Prior journey changes are already uncommitted and must be retained.

## Design and mapping
- FR-001/002: Add pure receipt-step outcome/link helpers under utils. Receipt VM
  projects a verification summary and matching editor URL onto step values. Shared
  publishingProgress adds failed-verification count for history/receipt consistency.
  A focused result presenter shows completion, outcome, recovery guidance and link
  before untouched safely rendered JSON. Summary retains backend status/message.
- FR-003: Add an unbounded content mode to ReceiptWorkspacePanel; result opts in.
  Desktop workspace becomes natural-height grid; left two columns use measured
  sticky top and available height from actual action-bar height and shell offset.
  Use CSS viewport math instead of scroll-position-dependent workspace measurement.
  Narrow panel switching stays; sticky panes retain bounded scroll while selected
  result uses page flow. The code block remains unchanged; its enclosing panel
  previously imposed the scrolling limit.
- FR-004: Keep existing store/API and route reading intact; plain validated links
  launch the external editor. No external repository or contracts change.

## Architecture and verification
Scoped VM owns projection/selection; presenters consume typed values, pure helpers
own receipt shape checks; no API access in views. Inline OnPush/BEM and semantic
styles remain. Reuse routed tests plus focused multi-lab/malformed-ID/result tests;
run full tests, architecture, strict app/test types, production isolated build,
license and diff checks. Verify desktop sticky behavior after document scroll,
Result height beyond viewport and mobile switching/overflow in the live shell.

## Pending-step follow-up
Editor destinations now require the selected step to be complete, in both the pure
projection and result presenter. Pending create/version/verify steps cannot inherit
a completed lab's editor CTA. Completed steps keep their existing editor access.
Replay capability was investigated read-only in service-coding-labs and the gateway;
see [recovery-notes.md](recovery-notes.md). No retry API or replay UI is introduced.

## Documentation links — 2026-11-05
Add publishing-document-link.ts to project completed create/write/name_page_N
results onto the user-provided document-editor page route. Workshop route context
comes from the first completed create_workshop result. Direct pages must belong to
that workshop; workshop snapshots match PAGE kind and numeric sortId to the step
index, rejecting ambiguous/invalid IDs. The VM supplies the URL to the result
presenter, whose editor anchors use native underlined styling instead of Material
buttons. Pure and routed tests cover both response shapes, pending/missing/malformed
identities and safe segment encoding. No API, routing or owner-service change.
