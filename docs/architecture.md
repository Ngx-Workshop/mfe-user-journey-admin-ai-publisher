# Architecture and external context

Updated 2026-10-13 for [005 MCP Gateway migration](../specs/005-mcp-gateway-migration/spec.md).

## Responsibilities and source map
AI Publisher owns administrator workshop generation, import, review, validation, publication and receipt inspection. App composes features/workshop-publishing/pages/publishing.component.ts directly. MCP catalog exploration and browser OAuth have moved to the independently federated mfe-user-journey-admin-mcp-gateway.

features/workshop-publishing provides a stateless HTTP facade client, singleton execution/section store, scoped draft-review VM, and OnPush publishing view with inline BEM styling. The existing shell administrator session authorizes /api/publisher/tools. Draft inputs and request IDs survive failed publication. Editing invalidates the reviewed draft; a publish attempt blocks repeat submission until receipt reconciliation. Shared store blocks overlapping commands; disposed views do not accept late results. Model credentials stay server-side. Existing 333-line PublishingComponent remains a cohesive inline review/form presentation exception to the approximate size guideline.

## External contracts and federation
Published DTOs and Ajv schemas use committed vendor @tmdjr/service-mcp-gateway-contracts 1.1.0 until registry publication. The browser facade is owned by service-mcp-gateway; this dependency remains necessary for publishing even though the MCP SDK and catalog feature have moved out.

Keep named/default App, named Routes, federation name, ./Component, ./Routes, remoteEntry.js and Angular shared singletons. Default path redirects to console; hello-world redirects there for compatibility. Standalone appConfig owns HTTP/Material animations/zoneless setup; the consuming shell supplies its existing HttpClient/session interceptors and theme.

Build/deployment targets remain dist/mfe-user-journey-admin-ai-publisher and /opt/mfe-remotes/mfe-user-journey-admin-ai-publisher. No migration of stored content or publishing API changes. Historical specs 002/003 describe the former catalog/OAuth implementation; current ownership and migration evidence are in spec 005.
