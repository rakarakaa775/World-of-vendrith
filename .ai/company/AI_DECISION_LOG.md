# AI Company Decision Log

Record durable operating decisions here. Add newest decisions at the top. Never store secrets, access tokens, or private credentials.

## 2026-10-24 — Initial six-role company charter
- **Decision:** Start with six sequential AI roles under human supervision.
- **Roles:** Roadmap/Project Director, Repository Auditor, Implementation, QA/Testing, Integration/Release, Independent Verification.
- **Repository:** `rakarakaa775/World-of-vendrith`.
- **Required branch:** `feat/vendrith-ecc-v1`; do not create a new branch for routine work or modify `main` without explicit instruction.
- **Safety:** Preserve user changes; no destructive Git operations, production database changes, paid infrastructure, or production releases without explicit approval.
- **Validation:** Evidence must distinguish static checks, tests, build, browser/runtime behavior, CI, and deployment.
- **Coordination:** Sequential handoffs; parallel execution is not assumed.
- **Next step:** Pilot the SOP on one low-risk task after the docs are reviewed.
- **Status:** Charter recorded in repository; agent automation/configuration is not yet implemented.