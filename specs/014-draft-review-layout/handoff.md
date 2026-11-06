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
