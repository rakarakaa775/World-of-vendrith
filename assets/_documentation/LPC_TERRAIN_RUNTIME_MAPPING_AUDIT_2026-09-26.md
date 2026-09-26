# LPC Terrain Runtime Mapping Audit — 2026-09-26

## Scope

This audit traces the existing Map Editor terrain runtime against the verified LPC terrain source. It is WORLD/terrain-only and does not modify the building system.

## Runtime path found

The Map Editor loads terrain bindings from `public.vandrith_asset_binding_workbench` through:

- `apps/map-editor/editor/supabase-terrain-asset-loader.ts`
- `apps/map-editor/editor/terrain-asset-binding-loader.ts`
- `apps/map-editor/editor/terrain-asset-binding.ts`

A binding is accepted by the loader only when:

1. `candidate_status = approved`
2. `asset_status = approved`
3. the terrain key is one of `grass`, `sand`, `dirt`, `pavement`, `water`
4. `neighbor_mask` is valid
5. a license registry id is present
6. a non-base binding has `autotile_capable = true`

The renderer then resolves a terrain cell by terrain key + neighbor mask. Mask `255` is the canonical verified base binding and is used as a safe fallback when a more specific transition mask is not bound.

## Current database/runtime state

`public.terrain_types` currently contains exactly five runtime terrain keys:

- `grass`
- `sand`
- `dirt`
- `pavement`
- `water`

`public.asset_binding_candidates` currently contains 30 rows. There are 12 approved candidate rows, of which 5 are approved base terrain bindings (`neighbor_mask = 255`) and 0 are approved transition bindings.

Those five approved base bindings point to the existing starter terrain assets:

- `tile_grass.png`
- `tile_sand.png`
- `tile_dirt.png`
- `tile_pavement.png`
- `tile_water.png`

## LPC runtime boundary

The 59 verified LPC terrain binaries are present in `asset_registry`, but all 59 currently have `status = pending`.

There are currently:

- **0** LPC terrain rows in `asset_binding_candidates`
- **0** LPC terrain rows in `vandrith_asset_binding_workbench`
- **0** LPC terrain bindings accepted by the runtime loader

Therefore the current Map Editor does **not** consume the 59 LPC terrain binaries as runtime terrain textures. It continues to use the existing five approved starter terrain bindings.

This is an important integration finding: binary verification and visual semantic verification have succeeded, but runtime integration has not yet been performed.

## Tile-region / tileset conclusion

The existing Map Editor runtime does not expose a `tileset_id` or `tile_region` mapping for these LPC PNGs. Its current terrain binding contract is asset-ID based (`terrain_key + neighbor_mask -> asset_id`).

The repository's Tiled region assets are a separate source format and do not provide a demonstrated runtime mapping for the LPC terrain binaries.

Therefore this checkpoint does **not** invent or assign `tileset_id`, `tile_region`, `flow_direction`, or `flow_strength`.

## Next gate

Before LPC terrain can enter the runtime binding workbench, the project needs a separate semantic binding review that maps the verified LPC source binaries to the existing five logical terrain keys and/or defines additional terrain keys where the source semantics require them.

That review must also establish whether the runtime should use the original 16×16 LPC sheets directly or a verified 32×32 derived terrain representation. No conversion is assumed by this audit.

## Safety boundary

No LPC asset was promoted to `approved`, no binding candidate was inserted, and no Map Editor renderer code was changed in this checkpoint.
