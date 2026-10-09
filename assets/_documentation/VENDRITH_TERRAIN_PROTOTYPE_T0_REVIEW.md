# Vendrith Terrain Prototype T0 — Review and Validation Plan

Date: 2026-10-09
Branch target: `feat/vendrith-ecc-v1`
Status: **visual direction drafted; production tiles and runtime compatibility not yet verified**

## Visual concept

The current concept direction is original hand-painted 2.5D fantasy terrain: rich but controlled natural color, upper-left lighting, legible material texture, visible cliff faces, and distinct shallow/coastal versus deep/open water. The generated concept preview is mood/reference material only. It is not a production tileset, does not guarantee exact pixel dimensions, and must not be imported into the runtime as a sprite sheet.

## T0 scope

Create and review individual prototype assets for:
- grass ground
- dirt ground
- sand ground
- shallow/coastal water
- deep/open water
- grass-to-dirt transition
- grass-to-sand transition
- sand-to-shallow-water shoreline
- shallow-to-deep-water transition

## Geometry decision gate

The current renderer/runtime contract must be checked before selecting the final tile grid. Prototype comparison:
- 32×32 px exported tile: candidate runtime baseline, subject to code-level validation.
- 64×64 px editable/master tile: candidate for hand-painted detail; downsample/export quality must be inspected.
- A full atlas is not assumed to be supported. Prefer one exact tile per PNG and one asset identity per runtime binding until region/crop support is proven.

Do not adopt a diamond/isometric coordinate grid solely because the artwork looks isometric. The current Map Editor's world grid and draw-order model must determine whether terrain is orthogonal, oblique-shaded, or truly isometric.

## Visual acceptance checklist

- [ ] Materials are recognizable at normal game zoom and at 1:1 scale.
- [ ] Every base tile is exactly the declared dimensions with no accidental padding.
- [ ] Repeated ground tiles do not create obvious seams or strong repeated motifs.
- [ ] Light direction and contact shadows agree across the set.
- [ ] Grass/dirt, grass/sand, sand/shallow-water, and shallow/deep-water edges work in all orientations.
- [ ] Inner and outer corners do not leave gaps, halos, or one-pixel slivers.
- [ ] Isolated cells, narrow strips, diagonals, and multi-material junctions are checked.
- [ ] Shallow water and deep water are visually distinct without relying on labels.
- [ ] Alpha behavior is deliberate and documented for each asset.
- [ ] Source masters remain editable and are not confused with runtime exports.

## File and metadata acceptance checklist

- [ ] Runtime exports are individual PNG RGBA assets unless renderer support for atlases is demonstrated.
- [ ] Metadata declares key, role, dimensions, material, transition pair, mask (only if mapped to the runtime contract), variant, provenance, license, attribution, checksum, and review status.
- [ ] SHA-256 checksums are reproducible.
- [ ] No unverified third-party artwork is mixed into the original asset family.
- [ ] No asset is promoted to approved based on the concept preview alone.

## Runtime compatibility gate

Inspect and test:
1. Map Editor world grid and terrain draw pipeline.
2. Terrain binding loader validation and supported terrain keys.
3. Neighbor-mask semantics and whether a mask maps to a full PNG or a tile region.
4. Alpha blending, texture filtering, pixel ratio and scaling.
5. Actual Map Editor rendering using the prototype assets.

The current documented binding shape is `terrain_key + neighbor_mask -> asset_id`. The current loader requires approved candidate and asset states, valid license registry identity, and autotile capability for non-base masks. The prototype must not bypass these conditions. Additional semantic terrain keys require a separate reviewed schema/runtime change.

## Exit decision

Proceed to a production tileset only after art review, transition-map review, dimension/alpha checks, and a code-backed renderer compatibility report. Until then, this milestone is design/prototype planning, not a claim that the game already renders these assets.
