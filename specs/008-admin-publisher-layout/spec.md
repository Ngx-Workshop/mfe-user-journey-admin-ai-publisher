# Feature: Unified Admin Publisher layout

Status: Implemented; shell integration pending
Feature ID: 008-admin-publisher-layout
Created: 2026-10-14
Updated: 2026-10-14
Request/source: User requested the MFE Remotes catalog header/hero/actions pattern.

## Problem and scope
Administrators see duplicate introductions and a bottom-only new workshop action.
Unify the hero, sticky actions and responsive content container with the Admin
MFE reference. Keep generation, review, publication and recovery behavior intact.

## Requirements and acceptance
- FR-001 / AC-001: Render one AI Publisher h1 in the shared particle hero, with an
  icon eyebrow and a concise explanation; remove the duplicate page introduction.
- FR-002 / AC-002: Put New workshop in a sticky primary action bar below the hero.
  Clicking invokes the existing newDraft command; disable it while busy or initializing.
  Keep history and receipt recovery accessible in the content.
- FR-003 / AC-003: Match the reference 1440px content width, theme-token background,
  hero spacing and mobile gutters; no horizontal overflow at 375px.

## Quality and boundaries
OnPush, inline BEM presenters with typed inputs/outputs; page owns its existing VM.
Preserve App/default exports, Routes, HTTP contracts and administrator authorization.
No backend, deployment, paid generation or workflow changes. Local build, existing
behavior tests and browser layout checks verify scope; live publication is excluded.

## Assumptions
Use the reference shared header version 21.0.5 and sticky shell offset 56px.
New workshop retains the existing brief/model selections and resets the draft/request.
