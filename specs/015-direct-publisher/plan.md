# Plan

Replace gateway package imports and mcpCatalogContract references with the installed
publisher package/mcpPublisherContract; keep published DTO and schema validation.
Keep browser /api/publisher/tools and withCredentials. Change local publisher proxy
port to 3014 and remove unused catalog proxy. In nginx-ngx-workshop.io, keep edge
TLS routing to the private backhaul and change its publishing destination to
service-ai-publisher:3014. Retire the seed /api/ai-publisher path with 410 rather than
exposing an unimplemented public port route. Keep catalog routing on gateway.

Preserve the user's installed dependency/lockfile changes. Run existing frontend
behavior/architecture/type/build checks and Nginx syntax validation with temporary
certificates. No visual change or paid generation is required. Deploy both Nginx
hops before retiring gateway compatibility; this local task does not publish/reload.
