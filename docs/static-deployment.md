# Static deployment cleanup

The workflow uploads a complete build into a per-run staging directory, validates index.html, remoteEntry.js, and runs `scripts/deploy-static.sh` to synchronize only `/opt/mfe-remotes/mfe-user-journey-admin-ai-publisher`. Rsync deletes obsolete assets after staging succeeds, uses checksums and delayed file replacement, and keeps the destination directory inode for Nginx bind mounts.

A per-project lock serializes promotion. A temporary hard-link backup restores the old content if synchronization or Nginx visibility verification fails; successful deployment deletes staging and backup. Failed rollback retains recovery files. Build symlinks, invalid release IDs and symlinked destination paths are rejected. An interrupted upload never touches the live directory. No Nginx restart is required.

This fixes the previous SCP overwrite behavior, which retained old hashed bundles and source maps. Existing build configurations, federation exports, publishing and business behavior are preserved. Existing browser sessions may need refresh when old lazy-load chunks are removed.

Verification is scoped to the deployment helper (stale-file removal, mount-directory preservation, invalid/incomplete build rejection and rollback), workflow syntax and live Actions rollout. Source-only checks do not establish a successful deployment.
