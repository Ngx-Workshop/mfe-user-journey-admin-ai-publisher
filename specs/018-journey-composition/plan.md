# Implementation plan: Journey composition

Status: Complete locally; not deployed
Spec: [spec.md](spec.md)
Updated: 2026-11-08

## Source baseline and review

Clean worktree; Angular 21.1.0, design system 21.0.11, publisher contracts 1.2.9.
API/store boundaries already pass the architecture checker. Main issues:

- Creation combines unrelated step layout, dialog lifetime, media queries and
  route/unsaved handling. An obsolete commented block hides persistence errors.
- Persistence and autosave share a large VM with preparation/publication commands.
- Receipt summary and progress markup/styles obscure route/selection lifecycle.
- Flat pages/components folders obscure the three user journeys.
- Architecture documentation describes a 347-line compositor; actual size is 822.

## Design and requirement mapping

| Requirement | Approach |
| --- | --- |
| FR-001 | `pages/creation`, `pages/overview`, `pages/receipt`; `components/creation`, `components/overview`, `components/receipt`, `components/shared`; mirror tests |
| FR-002 | Creation shell owns session/lifecycle; brief/review/publication orchestrators consume its VM; refinement dialog owns dialog UI/lifetime |
| FR-003 | Scoped draft persistence VM owns JSON/revision/save state and serialized autosave; creation VM owns preparation/approval/publication |
| FR-004 | Typed receipt summary/progress presenters emit refresh/selection; receipt page retains responsive panel layout |
| FR-005 | Retain relative route navigation and existing guard; no child route lifecycle or URL migration |
| FR-006 | Page folder denotes orchestration; components remain input/output-only; documented cohesive exceptions |

## Constitution and contracts

No federation, HTTP, shared dependency or external service changes. API clients
remain stateless and stores remain UI-independent. Draft/forms remain scoped;
commands retain exhaustMap, ordered operations retain concatMap, subscriptions
use explicit DestroyRef teardown. No additional state library or base classes.
Inline HTML/SCSS, OnPush, BEM and shell tokens remain mandatory.

Review layout (265 lines), creation shell (296) and receipt layout (306) exceed
the approximate 230-line target. Review's three columns, sticky breakpoints and
material-selection bindings are one responsibility. The shell retains lifecycle,
navigation protection, accessible focus and recovery feedback, but no step content
or dialog markup. Receipt retains responsive panel composition, not summary or
progress implementation. The creation command VM retains one duplicate-sensitive
command queue; extracting competing queues would weaken cross-operation locks.
Do not split it solely to conceal a line count. Existing large history/filter/
row presenters will be reviewed as cohesive presentation exceptions, not rewritten
as unrelated visual redesign.

## Verification plan and risks

Run architecture and strict app/test types, existing creation/VM/persistence/
receipt regressions plus new focused persistence and lifetime checks, then the
full behavior suite because folder moves affect all imports. Run isolated
production build. Inspect responsive UI through local browser fixtures if
available without remote writes.

Primary risks: scoped provider duplication, destroyed dialog during pending work,
selection reset when progress hides a step, stale imports, and missing encapsulated
styles after extraction. Keep material selection at the creation shell when
progress replaces step content, and keep one shared VM provider at that shell.

No data migration or external delivery ordering. Existing shell URLs remain valid.

## Verification outcome

118 behavior tests pass, including the new lifetime, selection and save-error
regressions. Strict application/test types, architecture, whitespace and isolated
production build/license checks pass. Read-only browser fixtures confirm responsive
review and receipt layouts at 1920/1024/390px. See the handoff for exact evidence,
corrected validation attempts and live integration limits.
