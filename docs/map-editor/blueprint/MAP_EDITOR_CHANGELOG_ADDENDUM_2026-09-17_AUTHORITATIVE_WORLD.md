# Map Editor Change Log Addendum — 2026-09-17 Authoritative World Routing

This addendum records the detailed implementation entry for the F-006 bootstrap-duplication containment step. The root `MAP_EDITOR_CHANGELOG.md` remains the historical governance log; this addendum preserves the technical detail without rewriting prior historical entries.

## 2026-09-17 — V4 persistence pinned to audited authoritative World Map

- **Type:** Changed / Fixed
- **Reason:** The live Supabase audit found 108 `world` rows sharing the same `world_id`. The previously implemented V4 fallback selected the newest row by `created_at`, which could select a later empty bootstrap row instead of the World Map containing the verified editing progression.
- **Details:** Added `NEXT_PUBLIC_VANDRITH_WORLD_MAP_ID` with the audited fallback `87ba34eb-5a75-42fa-8919-63e44b700c02`. `ensureConnection()` now requires that ID to exist, belong to the configured `WORLD_ID`, and have `map_type = world`. The newest-by-created-at fallback and its direct insert path were removed from V4.
- **Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`, `MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit; F-006 bootstrap duplication containment.
- **Verification:** GitHub write committed as `1df3d63ceea772f23943f112278081ba0237d20b1`; file was re-fetched and the authoritative ID/routing guard was confirmed. Browser/Vercel and automated test execution remain pending.
- **Supabase:** Read-only dependency audit was performed before this code change. No rows were deleted and no schema migration was applied in this step.
- **Notes:** The 108-row cleanup remains a separate database operation. The current fallback ID is intentionally explicit and should be replaced through environment configuration if the authoritative World Map is migrated later.
