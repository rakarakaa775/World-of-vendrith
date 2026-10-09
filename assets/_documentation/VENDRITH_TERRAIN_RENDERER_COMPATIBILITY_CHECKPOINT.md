# Vendrith Terrain Renderer Compatibility Checkpoint

Date: 2026-10-09
Branch: `feat/vendrith-ecc-v1`
Status: **source inspection completed; no runtime assets bound and no test suite run in this checkpoint**

## Confirmed from repository source

- The editor uses an orthogonal logical grid with an 8-neighbor terrain mask (0–255).
- The recognized runtime terrain keys in the current branch include `grass`, `sand`, `dirt`, `pavement`, `water`, and `deepwater`.
- Terrain bindings can carry an optional rectangular region `{x, y, width, height}`; the Pixi canvas has a region-texture crop path using that rectangle.
- Runtime terrain bindings are loaded from the reviewed `vandrith_asset_binding_workbench` path. Candidate and asset status must both be `approved`, the terrain key and mask must be valid, a license registry ID must exist, and non-base masks require `autotile_capable = true`.
- The loader permits base mask 255 and full-autotile candidates; an unbound mask can fall back to the base tile. That fallback prevents missing art but does not create a correct material transition.
- The renderer is Pixi-based. The concept must not force a diamond coordinate grid; painted oblique shading can create a 2.5D impression while preserving the editor's orthogonal grid.
- The current branch includes `deepwater`, so it should be used rather than inventing a new deep-water key. Snow, swamp/mud, cliffs and waterfalls are not all equivalent to the current terrain-key vocabulary; they need a reviewed semantic or object/overlay role before runtime integration.

## Implications for T0

1. Produce and validate a small source master, then export exact runtime tile images.
2. Test 32×32 and 64×64 exported candidates in the actual Pixi canvas. Neither size is declared authoritative until the map document's tile-size behavior and renderer scaling are verified.
3. Region-cropped atlas bindings are technically represented in the current binding type and Pixi crop path, but this does **not** prove all registry, asset-resolution, texture-loading, and database evidence requirements are satisfied for a new atlas. Individual PNGs remain the simpler initial route.
4. Keep the world grid orthogonal unless a separate design/engine decision changes it.
5. Do not create production bindings or alter Supabase rows in the art-prototype step.
6. Do not label the entire transition system complete: each desired transition mask still needs correct art, reviewed metadata and approved binding candidates.

## Required next verification

- Inspect `MapDocument` tile-size handling and the complete Pixi terrain draw path.
- Inspect `resolveAssetUrl` and the texture cache for path and atlas-crop assumptions.
- Build a test-map fixture and run targeted terrain renderer/binding tests.
- Once image binaries are available in the repository, programmatically check dimensions, RGBA/alpha, edge integrity and SHA-256.
- Review the resulting map at 1:1 and normal gameplay zoom before approving the visual family.

## Decision

The source supports neighbor-mask binding and has a rectangular region crop path, but no claim is made that new Vendrith assets are production-ready. Keep the first release small, preserve the orthogonal world grid, and pass visual + runtime gates before promoting any asset.
