# Handoff

See ../../docs/static-deployment.md for source/destination and operational behavior. Seven shared helper regression tests passed on the Nginx host using disposable files, real rsync and an isolated Nginx-check double. YAML/shell checks pass. Main pushes retain each repository's existing build/publish ownership. Live rollout remains a separate verification step.

Live rollout verified on 2026-11-21: [GitHub Actions](https://github.com/Ngx-Workshop/mfe-user-journey-admin-ai-publisher/actions/runs/44938401556) succeeded. The Nginx container sees all expected nonempty entrypoints; all 27 sites passed this check. Public admin/workshop/auth/design-system HTTPS roots returned 200. Successful staging was removed.
