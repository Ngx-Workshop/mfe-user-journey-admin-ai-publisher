# Handoff: Receipt verification outcomes and reading layout

Status: Complete
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-11-04

## Delivered behavior
Completed operations remain completed. A complete verify_lab_N result with an
explicit boolean passed field now has a separate Verification passed/failed outcome.
Receipt/history progress counts retain completion/resource counts and append failed
verification counts. The receipt summary explains why completed steps can still
need attention. Server statuses and messages remain unchanged and authoritative.

Selected results show test counts only when valid, describe recovery, and open the
coding labs editor in a new tab. Links derive the matching indexed create_lab_N
result's validated 24-character _id. Version IDs, unrelated lab indices and malformed/
missing identities never become links. Failed guidance recommends inspecting both
tests and the reference solution, fixing the lab and verifying again; no diagnosis
of which source is wrong is fabricated from failed-test output alone.

Result is now a natural-height panel in document flow. Receipt and Steps remain
sticky below the measured action bar/shell and retain viewport-bounded internal
scrolling. Narrow panel switching remains, with sticky controls and a natural-height
result. Selecting a step brings its result into view below navigation. The focused
ReceiptStepResultComponent owns outcome/link/JSON presentation; the shared panel's
bounded input defaults true, preserving other consumers.

## Acceptance and verification evidence

| Check/scenario | Method | Result | Evidence/limits |
| --- | --- | --- | --- |
| AC-001 | Pure helper, routed tests and actual supplied receipt | PASS | Completed + Verification failed; 0/6 tests; 10/10 remains operations complete; Needs attention remains server status |
| AC-002 | Multi-lab/malformed-identity tests and live receipt | PASS | Exact /coding-labs-editor/coding-labs/6aebffc0140f132cb6017a19 link with new-tab isolation; no guessed/mismatched/version ID |
| AC-003 | Authenticated desktop browser with document scroll | PASS | Result 4,542px tall; Receipt/Steps 710px tall at top 181px; after document scroll 908px side panels remain at 181px while Result moves to -726px |
| AC-003 narrow | 390 × 844 viewport, panel switching and selected verification | PASS | Final document width 390px; long JSON flows down page; switch remains accessible; viewport override reset |
| AC-004 | Existing and new routed regression tests | PASS | Safe JSON/null/result-free states, route replacement/selection reset and no publish calls |
| Full tests | npm test -- --watch=false --browsers=ChromeHeadless, Node 22.23.3 | PASS | 78 tests |
| Architecture | npm run check:architecture | PASS | Existing compositor size reviews remain; receipt inline composition/layout remains a documented exception |
| Strict app types | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json | PASS | No errors |
| Test types | npx tsc --noEmit -p tsconfig.spec.json | PASS | No errors |
| Production build | npm run build -- --output-path dist/migration-verification | PASS | Normal federation build, license extraction enabled and nonempty |
| Whitespace | git diff --check | PASS | No whitespace errors |

Live browser verification used the supplied receipt through the existing local
remote override. The tab remains on its failed verification for review. No coding
lab data was edited, no verification was re-executed, no publishing was replayed,
and no server receipt status was changed. Prior uncommitted journey changes remain
preserved. No deployment or external-repository changes were performed.

## Contracts and remaining work
Routes, default/named federation exports, shared versions, dependencies and API/DTO
contracts are unchanged. Editor path follows the user-provided published route.
The link supplies access to the separate editor; this remote does not implement lab
editing or decide how later verification reconciles a publishing receipt.

Local acceptance is complete. The actual failed lab remains for the administrator
to inspect/fix/re-verify in its editor; that content correction is outside this task.

## Context maintenance and size review
Updated architecture/development and feature index. The receipt page remains a
cohesive composition/layout exception (about 512 lines), extending its existing
464-line exception with sticky layout and summary feedback while extracting selected
result rendering into its own small presenter. No unrelated view model/state
boundaries or earlier feature records were changed.

## Follow-up: pending CTA and replay semantics
Pending selected steps now suppress the editor CTA in both URL projection and
presentation, including pending verification with a completed matching lab creation.
Completed lab steps retain access. Full tests: 80 PASS; production build/license,
architecture, strict app/test types and diff checks pass. See
[recovery notes](recovery-notes.md) for read-only owner-service investigation.
Verification may be rerun against the current draft via coding-labs; full publishing
replay does not resume a journaled receipt. No retry was executed or implemented.

Authenticated browser follow-up confirmed receipt d7c28e1f-0a28-4101-af69-96bcdee7ee6e
step 9 remains Pending with zero editor CTA links in Result. The local override's
4201 bundle server had stopped; restarted npm run serve:bundle and left the supplied
receipt open on its pending verification. No retry request was made.

## Follow-up: underlined lab links and documentation page links — 2026-11-05
Coding lab editor CTAs are now underlined native anchors with a visible focus ring,
preserving their new-tab behavior and pending-step suppression. Completed
create/write/name_page_N operations also offer Open documentation editor, following
/document-editor/:section/:workshopSlug/:pageId. The pure projection handles direct
page results and matching PAGE/sortId entries in workshop snapshots; missing,
ambiguous, cross-workshop or malformed identities produce no link. A workshop _id
is never used as a page _id. No API, route or dependency changes.

85 ChromeHeadless tests, architecture, strict app/test types, production federation
build/license and diff checks pass on Node 22.23.3. Authenticated browser checks
confirmed that Write documentation page 1 links to page 6acedcfa4d4ddb09fe850515
and Create documentation page 2 links to 6acedcfa4d4ddb09fe85051b under the recorded
angular/angular-components-introduction workshop route. Both documentation and
lab editor anchors have computed text-decoration:underline and no Material button
attribute. Verified production artifacts were copied to the local bundle directory
for preview. No remote deployment, page/lab edits or replay occurred.
