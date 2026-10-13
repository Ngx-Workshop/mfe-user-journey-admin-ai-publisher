# Implementation plan: MCP Gateway migration

Status: Implemented; integration pending
Updated: 2026-10-13
Spec: [spec.md](spec.md)

## Source baseline and design
Both checkouts start clean. AI Publisher App composes mcp-console, which embeds workshop-publishing. Gateway still composes example-documents at hello-world.

FR-001: Move src/app/features/mcp-console and mirrored testing/app/features/mcp-console into Gateway. Preserve API → root store → scoped VM → OnPush component boundaries. Remove only the publishing import/element from the migrated console; adapt its heading.
FR-002: AI Publisher App composes the unchanged PublishingComponent inside its retained publisher heading and responsive shell. Remove MCP-only SDK dependency; retain gateway DTOs and Ajv used by publishing.
FR-003: Gateway App composes ConsoleComponent. Export empty redirect to overview and overview App route; replace seed runtime/tests/dependency. Preserve all federation exposures.
FR-004: Change OAuth callback and pending-transaction key for Gateway; retain client ID and issuer/resource. Record exact auth registration handoff.

## Constitution check and architecture review
One responsibility per remote; no remote nesting or new state framework. Preserve stateless clients, singleton server stores, scoped form state, RxJS cancellation and teardown. Existing console/result and publishing components exceed the approximate line guideline; retain cohesive inline templates/styles as a documented migration exception rather than adding a refactor to this move.

## Verification
Run architecture checks, strict application/test types, ChromeHeadless tests and isolated production builds in both repositories. Add composition and exported-route regression coverage, retain protocol/store/error/schema/PKCE tests. Inspect the running shell page. Synthetic tests do not prove live OAuth or publication.

## External dependency and rollout
The auth owner must approve https://admin.ngx-workshop.io/mcp-gateway/overview for ngx-workshop-ai-publisher-prod before live sign-in. Existing AI Publisher route remains console; only gateway seed route changes. Deploy both independent remotes after review; no deployment is part of local migration.
