# Map Editor Change Log Addendum — 2026-09-17 Terrain Approval Boundary

This addendum records the detailed implementation entry for the terrain approval correction. The root `MAP_EDITOR_CHANGELOG.md` remains the historical governance log; this file preserves the full technical entry for the current change without rewriting prior historical content.

## 2026-09-17 — Terrain runtime approval boundary enforced

- **Type:** Changed / Fixed
- **Reason:** The previous terrain binding loader accepted `asset_status` values `verified` and `active`, and the base-terrain path did not require an approved binding candidate. V4 also contained a second path that synthesized base bindings directly from `asset_registry`, bypassing the two-source approval boundary.
- **Details:** `loadTerrainAssetBindings()` now requires `candidate_status = approved`, `asset_status = approved`, a valid license registry reference, and either a mask-255 base terrain or an autotile-capable binding. The V4 bootstrap now consumes only `vandrith_asset_binding_workbench`; the direct `asset_registry` base-binding synthesis path was removed.
- **Affected:** `apps/map-editor/editor/terrain-asset-binding-loader.ts`, `apps/map-editor/tests/terrain-asset-binding.test.ts`, `apps/map-editor/components/map-editor-app-v4.tsx`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** GitHub writes succeeded as commits `68c7bb65d8d4037c16a4c540d5c79b83a0245350`, `f38cb1ea82c32fdb6f1a5dde8f351ecae0641199`, and `7f42612c9a632645148b5707fa05c1c70a5bcff6`. Automated test execution and browser/Vercel verification remain pending for these latest commits.
- **Notes:** No terrain binary was activated or transferred. Current Supabase terrain records still contain approval mismatches, so an empty/incomplete runtime terrain binding set remains expected until assets pass the documented approval boundary.
