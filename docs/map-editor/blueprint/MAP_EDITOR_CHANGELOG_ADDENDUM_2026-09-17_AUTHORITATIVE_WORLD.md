# Map Editor Change Log Addendum — 2026-09-17 Authoritative World Routing

This addendum records the detailed implementation entries for the F-006 bootstrap-duplication containment, cleanup work, and the follow-up Phase 0 hierarchy/persistence audit. The root `MAP_EDITOR_CHANGELOG.md` remains the historical governance log; this addendum preserves the technical detail without rewriting prior historical entries.

## 2026-09-17 — V4 persistence pinned to audited authoritative World Map

- **Type:** Changed / Fixed
- **Reason:** The live Supabase audit found 108 `world` rows sharing the same `world_id`. The previously implemented V4 fallback selected the newest row by `created_at`, which could select a later empty bootstrap row instead of the World Map containing the verified editing progression.
- **Details:** Added `NEXT_PUBLIC_VANDRITH_WORLD_MAP_ID` with the audited fallback `87ba34eb-5a75-42fa-8919-63e44b700c02`. `ensureConnection()` now requires that ID to exist, belong to the configured `WORLD_ID`, and have `map_type = world`. The newest-by-created-at fallback and its direct insert path were removed from V4.
- **Affected:** `apps/map-editor/components/map-editor-app-v4.tsx`, `MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit; F-006 bootstrap duplication containment.
- **Verification:** GitHub write committed as `1df3d63ceea772f23943f112278081ba0237d20b1`; file was re-fetched and the authoritative ID/routing guard was confirmed. Browser/Vercel and automated test execution remain pending.
- **Supabase:** Read-only dependency audit was performed before this code change. No rows were deleted and no schema migration was applied in this step.
- **Notes:** The 108-row cleanup was intentionally kept as a separate database operation.

## 2026-09-17 — F-006 World Map duplicate dependency audit completed

- **Type:** Added / Audited
- **Reason:** Before destructive cleanup, verify that the 107 non-authoritative World Map rows were bootstrap duplicates rather than maps containing unique authoring data.
- **Details:** Audited all 108 `world` rows for `WORLD_ID = 3695d0b0-788e-42fa-9345-cc3197d0c94d`. All 108 were named `World Map`, `map_type = world`, and `metadata.editor_bootstrap = true`; the authoritative row was `87ba34eb-5a75-42fa-8919-63e44b700c02`. PostgreSQL foreign keys referencing `maps` were enumerated. Duplicate rows had no `map_cells`, `map_objects`, `map_building_placements`, `map_occupancy_cells`, `map_connections`, `map_annotations`, dungeon rooms/corridors, weather overrides, or environment policies. The duplicate set contained 115 `map_versions`, 93 runtime snapshots, and 12 save-slot rows. Across all duplicate versions there were zero non-null painted tiles and zero persisted layer objects; duplicate runtime snapshots likewise contained zero painted tiles. The 12 duplicate save slots referenced only duplicate map versions. Three legacy version snapshots used an older flat document shape, but they contained no painted cells or objects and remained scoped to the duplicate rows.
- **Affected:** Supabase `maps`, `map_versions`, `map_editor_runtime_snapshots`, `map_editor_save_slots`, and all FK dependents of `maps`.
- **Roadmap phase:** Phase 0 — Foundation Audit; F-006 bootstrap duplication cleanup.
- **Verification:** Live read-only SQL audit completed immediately before deletion. No authoritative map content was found outside the retained World Map.
- **Notes:** The authoritative World Map retained 4 durable versions, 1 runtime snapshot, 2 save slots, 48 projected `map_cells`, and 48 `map_navigation_cells` before cleanup.

## 2026-09-17 — F-006 duplicate World Map cleanup and uniqueness guard applied

- **Type:** Removed / Added
- **Reason:** Remove confirmed-empty bootstrap duplicates and prevent the database from recreating multiple World Maps for the same world.
- **Details:** Applied Supabase migration `cleanup_duplicate_world_bootstrap_maps`. The migration enforced preconditions for the audited 108-row set, deleted all 107 non-authoritative World Map rows, and relied on existing `ON DELETE CASCADE` relationships to remove their 115 duplicate versions, 93 runtime snapshots, and 12 duplicate save slots. It then created `maps_one_world_per_world_uidx`, a partial unique index on `public.maps(world_id) WHERE map_type = 'world'`.
- **Affected:** Supabase `public.maps` and cascaded dependent rows; new index `maps_one_world_per_world_uidx`.
- **Roadmap phase:** Phase 0 — Foundation Audit; F-006 bootstrap duplication cleanup.
- **Verification:** Migration succeeded. Post-cleanup audit reports exactly 1 World Map for the audited world, 0 Region Maps, 0 Playable Maps, authoritative map `87ba34eb-5a75-42fa-8919-63e44b700c02` still present, 4 authoritative versions, 1 authoritative runtime snapshot, and 2 authoritative save slots. The unique partial index was re-queried and confirmed.
- **Notes:** No asset binaries changed. No region/playable authoring data existed in the audited world and none was removed.

## 2026-09-17 — Phase 0 map hierarchy/persistence caller audit

- **Type:** Audited / Finding
- **Reason:** Verify that the new one-World-Map database invariant is respected by the V4 authoring path before introducing Region/Playable persistence.
- **Repository finding:** `map-editor-app-v4.tsx` now resolves persistence only against the explicit authoritative World Map ID and no longer selects a World Map by `created_at`. The current `MapBrowser` creates Region/Playable/Interior documents only in React memory and calls `onOpen()`; it does not persist child maps to Supabase. `map-manager.ts` likewise implements hierarchy as `MapDocument` relationships only.
- **Database finding:** The live `public.maps` table currently supports `map_type` values `world`, `exterior`, and `interior`; it has no `parent_map_id` column. The current canonical `MapDocument`/Map Editor model uses logical `world`, `region`, and `playable` map types plus `parentMapId`/playable hierarchy fields. Therefore the repository's three-scale hierarchy cannot yet be persisted losslessly through the existing `maps` identity schema without an explicit mapping/contract decision.
- **Live state:** Exactly 1 `world` map exists for `WORLD_ID = 3695d0b0-788e-42fa-9345-cc3197d0c94d`; the authoritative map has 4 versions, 1 runtime snapshot, 2 save slots, 48 `map_cells`, and no persisted objects/layers/connections/annotations. There are currently 0 Region and 0 Playable map rows.
- **Constraint evidence:** All map-dependent foreign keys inspected point at `maps(id)`, mostly with `ON DELETE CASCADE`; there is currently no persisted hierarchy FK from a map to a parent map.
- **Decision:** Do not add Region/Playable persistence or remap `maps.map_type` yet. The mismatch must first be resolved in the MapDocument/database contract and migration design, then implemented with tests. This keeps Phase 0 evidence separate from Phase 3 persistence implementation.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Repository files were re-fetched from `main`; live Supabase schema and rows were inspected after F-006 cleanup. No schema or data was changed by this audit.

## 2026-09-17 — F-006 cleanup status recorded

- **Type:** Updated
- **Reason:** Keep repository governance synchronized with the live Supabase cleanup and follow-up audit.
- **Details:** Added the cleanup result and hierarchy/persistence caller finding to `MAP_EDITOR_STATUS_LOG.md` and preserved detailed evidence in this addendum.
- **Affected:** `docs/map-editor/MAP_EDITOR_STATUS_LOG.md`, this addendum.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** GitHub documentation update committed after the live audit. Automated Map Editor tests and browser/Vercel verification remain separate gates.
- **Notes:** The next foundation task is to define the explicit database representation for World → Region → Playable → Interior before wiring child-map persistence.
