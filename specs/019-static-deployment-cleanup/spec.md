# Static deployment cleanup

FR-001: Replace obsolete files only after a complete staged build is validated. FR-002: Preserve the served directory inode and existing build/federation behavior. FR-003: Reject invalid paths and restore prior contents on promotion failure. FR-004: Remove successful or interrupted-upload staging, retaining failed rollback recovery.

Acceptance: old hashed files disappear on successful deployment; missing entrypoints leave the old site untouched; a failed Nginx visibility check restores the previous site.
