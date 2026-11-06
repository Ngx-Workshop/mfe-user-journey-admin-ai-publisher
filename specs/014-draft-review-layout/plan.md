# Implementation plan: Draft review layout

Status: Complete locally; not deployed
Spec: [spec.md](spec.md)
Updated: 2026-11-06

## Source baseline and design
The working tree includes uncommitted preparation UI and gateway contract adoption from feature 013; preserve that work. Angular/Material 21.1 are installed.

| Requirement | Approach / files |
| --- | --- |
| FR-001, FR-005 | Unframe review phase in pages/publishing.component.ts; CSS grid, sticky compact sidebar with bounded scrolling, naturally tall preview and stacked mobile layout. |
| FR-002 | components/publishing-review.component.ts: linked tablist/tabpanel and roving keyboard focus; retain existing material renderers. |
| FR-003 | Reuse utils/publishing-preview.ts safe image projection from draft blocks. |
| FR-004 | Template-based Material dialog composed in the page; preserve VM-owned controls and commands, errors and operation state. Focus trap/restoration supplied by Material. |

## Architecture and contracts
No HTTP/state changes or federation changes. Presenters accept typed inputs. Page orchestrator owns dialog lifecycle and closes it on destruction. Compact report is opt-in so receipts and generation keep their existing density. Cohesive size exceptions: publishing page composes the wizard and refinement dialog; review presenter owns related tab/outline/image UI. Existing preview renderers remain separate. No new dependency or migration required.

## Verification
Mirrored component tests cover tabs, image fallback and dialog controls; existing wizard tests enforce publication gates. Run architecture checks, strict app/test TypeScript, full ChromeHeadless suite and isolated production build. Inspect desktop/mobile local fixture with mocked preparation and no publication/paid calls. Test sticky positioning during scroll and dialog interaction.
