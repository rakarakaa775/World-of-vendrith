# Vendrith Visual Consistency Standard v1

Date: 2026-10-09
Scope: original hand-painted 2.5D assets, beginning with terrain
Status: **design standard — visual approval and renderer validation still required**

## Purpose

Every asset should feel like part of one coherent world when placed together in a playable map. Individual beauty is not sufficient: palette, light, camera, scale, brushwork, edge treatment, texture density, and depth cues must agree.

LPC and other existing assets may be used as comparison references. Do not trace, recolor, or otherwise treat third-party artwork as original Vendrith art. Any LPC assets retained in the project must keep their own provenance, license and attribution records and be reviewed for stylistic compatibility.

## 1. Shared art direction

- Style: hand-painted fantasy with a readable 2.5D depth illusion.
- Readability: forms and material boundaries remain legible at the normal gameplay zoom.
- Texture: grouped brush marks and deliberate shapes; avoid both noisy micro-detail and overly smooth generic surfaces.
- Shape language: natural, slightly stylized silhouettes, with detail concentrated around meaningful edges and landmarks.
- Detail budget: ground tiles have restrained detail; focal objects such as cliffs and landmarks may carry more contrast, but must not look as if they came from a different renderer.
- Originality: establish a recognizable Vendrith shape, color and material language rather than imitating one source pack.

## 2. Lighting and shading contract

- Default key light: upper-left, unless a project-level lighting decision explicitly changes it.
- Highlights appear on surfaces oriented toward the light; contact shadows sit beneath raised objects and overhangs.
- Cast-shadow direction, softness, color and intensity should be consistent within a scene.
- Ground tiles should not bake in long directional shadows that conflict with dynamic objects or other tiles.
- Water, snow, stone, vegetation and sand may respond differently to light, but must share the same scene lighting logic.
- Cliff faces need distinct top/side planes and readable elevation; avoid fake height produced solely by dark outlines.

## 3. Palette relationships

Use palette families rather than hard-coding one RGB color for every biome:
- Vegetation: layered natural greens with controlled yellow-green highlights and cooler shadow greens.
- Soil: warm ochre/brown midtones with restrained dark crevices.
- Sand: warm pale gold, separated from dry soil by hue and value.
- Stone: neutral-to-cool mineral grays with selective warm reflected light.
- Shallow/coastal water: lighter turquoise/cyan, visible bed or shoreline, foam only where appropriate.
- Deep/open water: darker, cooler blue with less visible seabed and stronger depth cues.
- Snow: cool light values with blue-violet shadows, not pure white everywhere.
- Mud/swamp: lower saturation, olive and earth notes, with wetness shown by selective highlights.

These are relationships, not final numeric palette values. Numeric swatches must be approved against actual rendered assets and the target display.

## 4. Camera, grid and scale

- Never infer the world grid from a concept image.
- Current Map Editor grid, coordinate system and draw-order behavior are authoritative.
- Hand-painted oblique shading can suggest depth without converting an orthogonal world into a diamond isometric grid.
- Prototype 32×32 runtime exports and 64×64 source/master candidates; validate the actual renderer before freezing dimensions.
- Every asset must declare its logical footprint and visual overhang separately where applicable.
- Character scale, tree canopy size, cliff height and prop footprint must be checked in a scale test scene.

## 5. Material and edge rules

- Grass: varied clumps and ground cover, with a clean readable outer contour.
- Dirt: compact earth forms; avoid random high-contrast noise that competes with grass.
- Sand: smoother, finer texture with sparse pebbles and soft shore forms.
- Water: consistent wave-mark language and a clear depth distinction; shoreline foam must be an overlay or edge treatment that can tile correctly.
- Rock: clustered planes and fractures consistent with the light direction.
- Snow: soft accumulation on upward-facing surfaces and readable exposed rock where applicable.
- Transitions should blend material shapes, not merely place a hard outline around one tile.
- Corners, thin strips, diagonal contacts and multi-material junctions require dedicated visual checks.

## 6. Asset compatibility levels

1. **Native** — authored to this standard; expected to match the Vendrith family.
2. **Adapted** — third-party or legacy art reviewed and modified only within its license permissions; provenance remains attached.
3. **Reference only** — moodboards or concept images that are not approved for runtime.
4. **Rejected** — license unclear, visually incompatible, technically invalid or provenance missing.

Do not remove attribution or license data when adapting a legacy asset. If permitted modifications cannot make an asset visually coherent, prefer replacement over forcing it into the family.

## 7. Required review board

Review assets together in a single test map, not only as isolated thumbnails. Include:
- grass/dirt, grass/sand, grass/stone and grass/snow transitions;
- sand/shallow-water and shallow/deep-water boundaries;
- cliffs with ground above and water/ground below;
- repeated patches to reveal visible repetition;
- a tree, rock and small prop to test scale and contact shadows;
- the same map at 1:1 asset scale and normal gameplay zoom.

Check seams, contrast jumps, lighting disagreement, silhouette mismatch, material confusion, repetition and draw-order errors.

## 8. Required metadata and provenance

Each runtime candidate must have:
- stable asset ID and file path;
- material/role and intended logical terrain key;
- exact width/height, logical footprint and overhang;
- alpha expectations and file format;
- transition pair and neighbor-mask mapping only when the runtime contract defines it;
- source/master reference and tool/export settings where useful;
- creator/provenance, license, attribution and adaptation notes;
- SHA-256 checksum, validation result, reviewer and approval state.

Do not invent provenance. Mark generated or hand-painted work as Vendrith-original only when that is accurate and retain the source master.

## 9. Technical gate

Before runtime approval:
1. Inspect the current loader and renderer contract.
2. Verify exact dimensions, color mode, alpha and edge integrity.
3. Verify that asset path, IDs and neighbor masks match the existing registry/binding contract.
4. Run transition-map and rendering checks at supported zoom levels.
5. Run targeted tests and the relevant broader test suite.
6. Obtain explicit visual review and license/provenance approval.
7. Only then promote assets through the existing approved binding workflow.

A concept render, contact sheet or this standard alone does not prove compatibility and must never automatically approve or bind assets.

## 10. Acceptance criteria

- [ ] All terrain shares consistent light direction and shading logic.
- [ ] Material colors differ clearly but remain within a coherent palette.
- [ ] Brushwork and texture density feel related across materials.
- [ ] Terrain boundaries and corners are seamless in all tested orientations.
- [ ] Elevation and depth remain readable at normal gameplay zoom.
- [ ] Scale is consistent in a combined map.
- [ ] Legacy/third-party art retains provenance and has passed compatibility review.
- [ ] Metadata matches the files and checksums.
- [ ] Runtime compatibility is demonstrated by actual code inspection and tests.
- [ ] No unreviewed candidate is promoted to approved or bound in production.

## Next milestone

Apply this standard to a small terrain set (grass, dirt, sand, shallow water, deep water), create transition examples, and inspect the current renderer before deciding final export dimensions or adding runtime bindings.
