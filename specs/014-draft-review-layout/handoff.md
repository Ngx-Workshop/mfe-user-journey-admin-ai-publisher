# Handoff: Draft review layout

Status: Complete locally; not deployed
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)
Updated: 2026-11-06

## Delivered behavior
Compact sticky Checks sidebar on desktop; wider Workshop Preview grows beyond the
fold. On narrow screens the panels stack and checks use a bounded scroll region.
Preview includes safe first-image projection, title, level and summary, plus linked
Documentation / Coding labs / Assessment tabs with keyboard navigation. Header tune
icon opens the Material refinement dialog; existing source/image controls, errors,
operation locks and validation gates are preserved. No backend/deployment changes.

## Evidence
| Scenario/check | Method | Result / limits |
| --- | --- | --- |
| AC-001 | Local browser fixture, 1280px desktop, long imported document | PASS: preview height 3638px in 720px viewport; sidebar remains sticky during 1440px scroll. |
| AC-002 | Browser lab tab and component tests | PASS: material changes; linked IDs, selected/tabindex states, ArrowRight/Home/End. |
| AC-003 | Component tests | PASS: missing image state, unsafe URL skipped, first valid HTTPS image and alt beside metadata. |
| AC-004 | Browser plus wizard component test | PASS: dialog open/close, source edits invalidate preview, failed validation shows preserved recovery, corrected fixture restores preview; operation disables Done. Focus enters dialog in component test. |
| AC-001/005 | 507px local browser | PASS: stacked panels, static checks, page width equals scroll width, 475px dialog. Temporary viewport reset. |
| Behavior suite | npm test -- --watch=false --browsers=ChromeHeadless | PASS: 97 tests. |
| Architecture | npm run check:architecture | PASS; documented cohesive page/review size exceptions, inherited size notices remain. |
| Strict app/test types | tsc --noEmit with app noUnused checks and tsconfig.spec.json | PASS. |
| Production build | npm run build -- --output-path dist/draft-review-verification | PASS: b86744f6ef7f2f21. |
| Whitespace | git diff --check | PASS. |

Browser API responses were local fixtures. No paid calls, image uploads or real
publication performed; no claim of new production integration verification.

## Contract and context handoff
No API, DTO, federation, route or dependency changes for 014. The draft has no
separate cover field; first safe document image supplies the overview illustration.
Architecture/development docs and feature index updated. Existing uncommitted 013
changes preserved. Deployment is a separate action. No remaining local tasks.

## Review columns follow-up — 2026-11-07
Checks now uses a solid chamfered NgxPanel with its report scrolling inside the
frame. The preview panel heading uses the workshop name and actual level in
WORKSHOP PREVIEW / LEVEL {level}; the body omits duplicate name/eyebrow content.
The shared PublishingReviewTabsComponent occupies an unframed 180px desktop column
between checks and preview, flush under the measured action bar and sticky during
page scrolling. Below 1101px it becomes a sticky horizontal row above the stacked
panels. The page and review share material selection with linked ARIA IDs; keyboard
Up/Down, Left/Right, Home/End and outline resets remain supported.

Architecture, strict app/test types, production federation build with license
extraction and diff checks pass. ChromeHeadless: 110 pass / 3 existing failures,
matching the unchanged HEAD baseline recorded in spec 011's follow-up. Updated
workspace assertions pass for chamfered framing, dynamic header identity, unframed
cross-column tabs, keyboard selection and linked preview. Standalone component
material selection and publication gate tests also pass.

The authenticated admin session expired during browser verification. An isolated
localhost:4247 sample server exercised the actual production bundle with sample
saved-draft/preparation data; no real generation, validation, save or publication
was invoked. At 1920px the tabs start at the 69px action-bar bottom and remain there
after 907px of scrolling. Selecting Coding labs updates the preview and outline.
At 1024px and 390px the tab row sits within one rounded measurement pixel of the
action-bar bottom; document widths match each viewport. Chamfered checks retain
their full frame while report content scrolls inside. Temporary viewport restored.
The fixture server is stopped after verification. No deployment performed.

Existing cohesive component-size exceptions remain: the page (770 lines) composes
three stages and dialog/layout lifetimes; review (324 lines) retains material/image/
outline rendering after extracting tabs; preparation (241 lines) keeps report state
and compact/embedded/header variants together. All remain OnPush presentation or
page composition, with no service/store ownership changes. No external contracts,
routes, dependency versions or federation changes are required.

## Integrated outline and bounded checks — 2026-11-07
Desktop order is now material navigation / workshop preview / skills and checks,
with matching DOM reading order. The selected tab's outline appears directly below
it in the sticky navigation column. Documentation pages and lab titles select their
preview; assessment question titles select an individual question. Standalone review
retains its own outline and full assessment. Back to brief is removed; phase
navigation remains. Continue to publish lives in checks panel actions and keeps all
existing readiness, active-operation and attempted-publication gates.

PublishingReviewOutlineComponent shares item selection with the page/review.
PublishingChecksPanelComponent uses the existing observePanelBody container mode:
measured header/frame/actions are subtracted from the viewport-sized sticky host,
leaving an independently scrollable, focusable activity region and visible footer.
Wrapped action bars resize the available area through existing measured height.
The new presenters are 93/80 lines; tabs are 163 lines and review shrinks to 257.
The page remains its documented cohesive wizard/dialog/layout exception (768 lines).
No API, route, federation, persistence or dependency changes.

Verification:
- Architecture, strict application/test types, production federation build with
  licenses and diff checks pass.
- ChromeHeadless: 110 pass / the same 3 baseline history/receipt failures recorded
  above. Updated integration assertions cover second-page selection, selected
  assessment question rendering, external outline placement, action projection and
  removed Back to brief. Standalone outline/reset/empty tests pass after updating
  their selector to the extracted outline component.
- Isolated production sample preview, no live changes: at 1920x963, a 30-check
  report with expanded evidence has 2,394px of content inside a 647px activity region;
  frame bottom stays at 947px and actions bottom at 928px. At 1280x600, frame bottom
  is 584px, actions bottom 565px and activity region 284px. Scrolling the report moves
  its scrollTop to 600 while page scroll stays zero. Desktop second-page selection
  updates the middle preview. At 390px the horizontal tabs/outline fit a 390px document.
  Viewport restored and isolated sample server stopped. Authenticated browser
  acceptance remains unavailable because the prior administrator session expired.

Local implementation complete; no deployment or external work required.
