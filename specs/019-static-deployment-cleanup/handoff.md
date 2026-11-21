# Handoff

See ../../docs/static-deployment.md for source/destination and operational behavior. Seven shared helper regression tests passed on the Nginx host using disposable files, real rsync and an isolated Nginx-check double. YAML/shell checks pass. Main pushes retain each repository's existing build/publish ownership. Live rollout remains a separate verification step.
