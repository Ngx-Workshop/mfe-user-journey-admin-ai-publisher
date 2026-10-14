# Implementation plan: Unified Admin Publisher layout

Status: Implemented; shell integration pending
Spec: [spec.md](spec.md)
Updated: 2026-10-14

## Source baseline and design
App currently wraps a custom hero and PublishingComponent repeats its introduction.
The supplied orchestrator catalog composes NgxParticleHeader plus a sticky primary
bar and a 1440px content container. Use this pattern within this remote.

| Requirement | Implementation |
| --- | --- |
| FR-001 | Add components/publishing-header.component.ts using shared headers 21.0.5; simplify App to feature composition. |
| FR-002 | Add stateless components/publishing-actions.component.ts; wire newDraft in pages/publishing.component.ts; remove the duplicate receipt action. |
| FR-003 | Full-width page background and hero, bounded content with mobile gutters. |

## Constitution and architecture
Maintain existing API/store/scoped VM responsibilities and RxJS lifetimes.
Presenters use typed inputs/outputs; no component-size exceptions. Routes and
federation entry points remain compatible. Add shared header federation declaration
matching the reference so shell Angular dependencies stay shared.

## Verification
Run architecture, strict source/test types, existing Karma behavior suite and an
isolated production build. Update action composition assertions to verify reset
and disabled behavior. Inspect desktop and 375px browser rendering if available.
No data migration or service-owner work is needed. Header dependency installation
requires registry access; shell rendering is distinct from local build evidence.
