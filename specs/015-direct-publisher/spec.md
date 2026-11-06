# Direct AI publisher ownership

FR-001: Import all publishing types and runtime schemas from installed
@tmdjr/service-ai-publisher-contracts 1.0.5; no runtime gateway-contract dependency.
FR-002: Preserve /api/publisher/tools, request/result shapes and administrator cookies.
FR-003: Local development targets publisher port 3014. Production Nginx retains
verified TLS backhaul and admin-only facade while bypassing the MCP gateway.
AC-001: Existing API, polling, validation and application tests pass with new schemas.
AC-002: Architecture, strict app/test types and isolated production build pass.
AC-003: Both Nginx configurations validate; obsolete /api/ai-publisher route is retired.
