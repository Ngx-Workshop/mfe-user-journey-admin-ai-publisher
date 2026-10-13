# Tasks: MCP Gateway migration

Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Updated: 2026-10-13

- [x] T001 — Move MCP feature/tests/dependencies into gateway and retain publisher composition. Verify AC-001/002 with composition and existing behavior tests.
- [x] T002 — Replace gateway hello-world with overview; adapt OAuth callback/identity and test route and callback contracts. Verify AC-003/004.
- [x] T003 — Run architecture, strict types, behavior tests and isolated builds in both repositories.
- [x] T004 — Update architecture/development/README, feature indexes and handoff with actual evidence.
- [ ] X001 — Auth configuration owner: approve the exact new callback for the retained public client; verify live sign-in/consent and return to overview. External production configuration is outside this local change.

## Progress and evidence

T001/T002: Gateway owns the moved MCP feature and tests; Publisher retains its unchanged workshop-publishing feature. Composition tests verify separation, gateway route tests verify overview and replaced hello-world, and PKCE tests cover exact callback redemption/validation. Both lockfiles updated; gateway vendors the same DTO tarball.
T003: Architecture, strict source types, test types, ChromeHeadless and isolated production builds pass in both MFEs. Gateway: 30 tests. Publisher: 7 tests. git diff --check passes. Existing component-size review notices are documented in architecture/plan.
T004: Current architecture/development/README/testing guides, entry points, indexes and handoffs updated.
X001: Pending external auth registration and live OAuth acceptance. Admin shell browser reports NG04002 for overview, while localhost:4201 renders the migrated console and workshop-tool selection correctly; shell registration/deployed or overridden remote must be confirmed.
