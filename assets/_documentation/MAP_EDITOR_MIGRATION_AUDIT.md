# Map Editor → Vendrith World Builder — Phase 0 Audit

**Status:** BASELINE AUDIT COMPLETE / MIGRATION READY  
**Date:** 2026-09-25

## Scope

Phase 0 inventories the repository references that still use **Map Editor** as an architectural/product concept before any destructive rename or binary move.

## Findings

### 1. Repository-wide indexed code search

The repository code search returned no indexed matches for:

- `map-editor`
- `Map Editor`
- `MapEditor`
- `map editor`
- `map_editor`
- `assets/map-editor`

This means there is currently no indexed source-code reference that can safely be treated as an active application implementation reference.

This does **not** prove that no reference exists in binary files, unindexed generated content, archives, external project files, or files that GitHub code search does not index.

### 2. Existing map-editor README

`assets/map-editor/README.md` still describes the folder as:

- Map Editor Assets
- terrain
- biomes
- world-markers
- region-markers
- playable
- buildings
- roads-rivers
- navigation
- ui

This taxonomy is stale relative to the completed WORLD / REGION / PLAYABLE / INTERIOR architecture.

### 3. Asset registry

`assets/_documentation/ASSET_LIBRARY_REGISTRY.md` still uses `map-editor/` as a broad storage category for World/Region/Playable authoring visuals and editor-only assets.

This is now too broad. The migration should distinguish:

- editor-only assets/tooling;
- WORLD role;
- REGION role;
- PLAYABLE role;
- INTERIOR role.

The canonical binary library must not be duplicated simply to satisfy these roles.

### 4. Existing verified binaries

The registry records individually verified terrain binaries under:

- `assets/map-editor/terrain/tile_grass.png`
- `assets/map-editor/terrain/tile_dirt.png`

These files must **not** be blindly moved or renamed during Phase 0.

Their provenance, license, SHA-256, and registry identity must remain intact. A later binary migration may move them only after an explicit path/reference migration is designed.

## Migration Decision

Do **not** delete or rename `assets/map-editor/` yet.

Instead:

1. Freeze the old folder as a legacy compatibility/storage boundary.
2. Update its README so it no longer defines the World Builder architecture.
3. Keep existing verified binaries in place until binary migration is deliberately executed.
4. Introduce World Builder architecture through documentation/data contracts first.
5. Later inspect application source/configuration and migrate active references.
6. Only remove the legacy folder after consumer/reference verification.

## Current Boundary

```
Vendrith World Builder
├── WORLD
├── REGION
├── PLAYABLE
└── INTERIOR

Editor-only resources
└── legacy map-editor storage
```

The four map layers are **roles in the World Builder**, not mandatory physical folders containing duplicated binaries.

## Phase 0 Exit Criteria

- [x] Existing `map-editor` documentation identified.
- [x] Existing asset registry references identified.
- [x] Indexed repository search performed.
- [x] Verified binary paths identified.
- [x] No binary moved or deleted.
- [x] WORLD / REGION / PLAYABLE / INTERIOR architecture preserved.
- [ ] Application implementation audit — next phase.
- [ ] UI terminology migration — next phase.
- [ ] Data-model migration — next phase.
- [ ] Binary reconciliation — deferred.

## Important Limitation

GitHub code search is not a complete binary/archive inspection mechanism. Absence of indexed matches is therefore not evidence that every historical or generated reference has disappeared.


## Phase 1 completion record

The active product surface has now been migrated to **Vendrith World Builder**:

- New route: `/world-builder`.
- Legacy `/editor` route redirects to `/world-builder`.
- Main application component: `VendrithWorldBuilderApp`.
- Main browser component: `WorldBrowser`.
- Error boundary: `WorldBuilderErrorBoundary`.
- Home navigation points to `/world-builder`.
- Home action terminology uses **World Builder** and **Load World**.
- Legacy component files using the `MapEditor*` class/function names were removed after the new components were wired.
- Test workflow was renamed to `.github/workflows/world-builder-tests.yml`.

### Contracts intentionally retained

The following remain unchanged because they are persistence/backend contracts rather than product terminology:

- `MapDocument`, `MapType`, and related serialized document types.
- Existing `map_*` editor persistence module filenames while the data contract migration is deferred.
- Supabase RPC names such as `map_editor_bootstrap_world_identity_v1`, `map_editor_create_child_v1`, and `map_editor_create_interior_v1`.
- Existing database table names such as `map_editor_save_slots`.

These names must not be renamed as branding-only changes because doing so would create a backend compatibility migration.

### Route verification

The source-level route migration is complete. A live production test was not claimed from the current commit: the GitHub combined status currently reports a Vercel failure whose target indicates a Vercel build-rate-limit/plan constraint. No successful World Builder test run was observed through the available GitHub workflow-run interface during this audit.
