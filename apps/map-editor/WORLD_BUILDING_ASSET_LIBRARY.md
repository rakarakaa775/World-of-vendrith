# World Building Asset Library — Design Contract

## Purpose
The World Building tool will include a visual **Asset Library** so the map creator can inspect available assets before placing them on a map.

The library is a discovery/placement layer. It does not replace the canonical asset libraries or duplicate binary files.

## Core rule
Canonical binary asset remains stored once.

The World Building Asset Library stores **metadata and references**:

`asset_id → canonical asset path → preview → role → category → provenance/license → placement capability`

No binary duplication is required just to make an asset visible in the World Builder.

## World-focused categories
The first World Building library should expose natural environment assets such as:
- Ground: grass, dirt, mud, sand, stone, beach, bog
- Water: coastal / near-shore, normal, deep, transitions, rivers / flowing water, frozen water / ice
- Terrain formations: hills, mountains, cliffs, natural rocks, caves / natural openings where classified as WORLD
- Vegetation: trees, forest vegetation, jungle vegetation, flowers, plants, fungi, bushes, logs / stumps
- Climate / biome variants: desert, snow, winter, tropical / jungle, swamp / wetland, volcanic / lava

Man-made structures such as bridges, docks, ships, villages and buildings are not shown as WORLD assets merely because they originate from an overworld package. They belong to REGION/PLAYABLE/INTERIOR according to their role.

## Visual library card
Each asset card should eventually show:
1. Preview image / thumbnail.
2. Asset name.
3. Category.
4. Biome or environment tag.
5. Source family.
6. License status.
7. Provenance status.
8. Asset type: tileset, atlas, standalone scenery, transition, or animated environment.
9. Dimensions / tile size when known.
10. A `Use` / `Place` action when the asset is runtime-compatible.

## Filters
The library should support:
- Search by name
- Category
- Biome
- Environment type
- Source family
- License
- Provenance status
- Runtime status
- Tile size
- Static vs animated
- Approved vs pending

Pending-provenance assets may be visible for audit/discovery, but the placement action should respect the repository's approval/runtime rules.

## Preview modes
Because many LPC files are sprite sheets or terrain atlases, the library should support:
- **Sheet preview** — show the complete PNG.
- **Tile preview** — show extracted tile-sized regions when tile metadata is known.
- **Placement preview** — show the asset in the World Builder canvas.
- **Terrain preview** — show terrain transitions/autotiling when supported.

The library must never alter the source binary just to generate a preview.

## Relationship to terrain bindings
Existing terrain binding infrastructure remains authoritative for terrain runtime behavior.

The Asset Library is the human-facing discovery layer:
`Asset Registry → Asset Library → Terrain Binding → World Builder placement`

For terrain assets, the library can expose whether an asset is registered, runtime-compatible, autotile-capable, bound to a terrain key, or pending verification.

## Provenance and licensing
The library must expose the same approval state used by the asset audit.

An asset should not display a misleading `approved` badge based only on its filename.

The required provenance chain remains:
`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

## World base-asset manifest

The World Builder must not infer its usable PNG set from `placement_category='world'` alone.

A dedicated Supabase manifest, `public.world_asset_manifest`, defines the approved World PNG selection while continuing to reference the canonical `asset_registry` rows.

Current roles:
- `base_terrain` — foundational world terrain/water PNGs.
- `polar_terrain` — dedicated north/south polar terrain foundation.
- `mountain` — foundational mountain PNGs.
- `polar_mountain` — snow/polar mountain variant.

The manifest is restricted to approved assets whose canonical binary is marked `verified` in `asset_files`. The current selection contains 19 enabled PNG assets.

### Seasonal separation

The three approved terrain PNGs from **LPC Revised 4-Seasons Exterior Tilesets** are deliberately **not** members of the World manifest:
- `LPC_Terrain__terrain.png`
- `tiled__terrain-map-v7.png`
- `lpc-terrains__terrain-v7.png`

These remain available to the future Seasonal Preview Engine. The map's stored geography should remain season-neutral; the seasonal engine can change the visual terrain presentation over time without replacing the underlying world layout.

The World Builder should consume `public.world_asset_manifest_v1` for World terrain selection rather than rebuilding this list from source names or broad placement categories.

## Final audit lock — 2026-09-28

The Asset Library has completed its current binary/manifest audit and is **LOCKED** as the canonical approved library snapshot.

Snapshot:
- Approved registry assets: **93**
- Asset Library browser assets: **86**
- Canonical asset file rows: **93**
- Verified binary rows: **90**
- Unavailable binary rows: **3**
- World manifest enabled + verified: **19**

The three unavailable binaries are explicitly tracked and are not treated as verified:
- `LPC Revised Buildings`
- `tile_sand.png`
- `tile_water.png`

`LPC Thatched-roof Cottage` was resolved from the finalized review archive and is now verified.

The lock is an intake/audit boundary: existing audited records remain intact, while any future asset addition or binary replacement must go through a new audit/intake cycle. The lock does not delete or hide the three unavailable records.

## Implementation boundary

Reuse the existing asset registry, asset resolver, asset proxy and terrain-binding infrastructure where possible.

Do not create a second independent asset database solely for the World Builder.

The next implementation phase can build on this locked library snapshot without changing the canonical asset foundation.
