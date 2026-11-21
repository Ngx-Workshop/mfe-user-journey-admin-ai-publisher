# Plan

Upload the existing build output into a unique run/attempt directory. Serialize per-project promotion with flock; use a temporary hard-link snapshot and rsync checksum/delayed updates/deletion into the existing mount. Validate expected entrypoints through the Nginx container before deleting recovery files. Preserve current build configuration and package publishing.
