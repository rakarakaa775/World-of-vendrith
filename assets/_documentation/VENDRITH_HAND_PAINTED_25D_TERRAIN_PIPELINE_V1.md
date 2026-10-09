# Vendrith Hand-Painted 2.5D Terrain Pipeline v1

Status: **specification / design gate — not runtime-approved**
Date: 2026-10-09
Scope: original Vendrith WORLD terrain and material transitions. Buildings and other REGION structures are out of scope.

## 1. Goal

Create an original, hand-painted terrain family with a coherent 2.5D illusion: readable elevation, material depth, controlled highlights, consistent light direction, soft contact shadows, and distinctive Vendrith color language. LPC is a quality/reference baseline only; do not copy LPC pixels, compositions, or source assets into the original family.

The first deliverable is a tested terrain prototype, not a large unverified atlas. A beautiful concept image is not considered a game-ready tileset until every tile is independently exportable, correctly sized, transparent where required, and transition-tested.

## 2. Repository/runtime facts that constrain this design

The existing Map Editor terrain loader reads `public.vandrith_asset_binding_workbench` and accepts only approved candidates with a valid license registry ID, supported terrain key, valid neighbor mask, and `autotile_capable=true` for non-base bindings. The current documented terrain keys are `grass`, `sand`, `dirt`, `pavement`, and `water`.

The binding contract is currently `terrain_key + neighbor_mask -> asset_id`. Existing runtime audits found no demonstrated crop/region-based renderer contract for atlas tile IDs. Therefore this pipeline must **not** assume that an atlas plus metadata can be consumed directly by the renderer. For the first integration, prefer individual tile PNGs (one exact tile per asset ID) unless code-level tests prove a region/crop extension is supported.

Current runtime terrain keys are not enough to express every desired material (snow, mud, shallow coastal water, deep sea, cliff face, etc.). Do not silently overload a key or insert database candidates. Propose a reviewed logical taxonomy and migration only after the art prototype and runtime contract have been validated.

Relevant existing audits:
- `assets/_documentation/LPC_TERRAIN_RUNTIME_MAPPING_AUDIT_2026-09-26.md`
- `assets/_documentation/LPC_TERRAIN_MAP_V7_TRANSITION_MATRIX_AUDIT_2026-09-26.md`
- `assets/_documentation/ASSET_LIBRARY_SCHEMA_V1_2026-09-26.md`

## 3. Visual direction

- View: top-down playable grid with hand-painted forms, subtle isometric/oblique shading cues; do not rotate the entire world into a diamond grid without an explicit renderer decision.
- Light: fixed upper-left key light; highlights and contact shadows must agree across all tiles.
- Surface: painterly brush texture at game scale, not noisy micro-detail. Important edges remain legible when viewed at normal play zoom.
- Elevation: cliffs, banks and ledges use separate face assets or verified overlay layers; never fake a tall cliff using a flat ground tile alone.
- Water: distinguish shallow/coastal water from deep/open water through hue, value, transparency/foam and depth cues. These are visual classes first; runtime semantic keys require separate approval.
- Palette: natural greens, warm earth, mineral stone and restrained blue/cyan water; avoid a uniform saturation level across every biome.
- Originality: establish a Vendrith palette and brush grammar; do not trace or reproduce existing LPC or other third-party sprites.

## 4. Prototype scope

Build a small vertical slice before scaling up:

1. Base ground: grass, dirt, sand, stone/rock, snow.
2. Water states: shallow/coastal water and deep water, visually unmistakable.
3. Landform: cliff top, cliff face, river bank, waterfall edge (waterfall can be a later animated asset).
4. Transitions: grass↔dirt, grass↔sand, grass↔stone, sand↔shallow water, shallow↔deep water, grass↔snow.
5. Variation: at least 3 non-identical interior variants for common ground materials to reduce repetition.
6. Validation map: a small test map deliberately placing every supported transition, corner, edge, isolated cell, and three-/four-material junction.

The first review should focus on grass, dirt, sand, shallow water and deep water plus their transitions. Snow, cliff faces and waterfalls are authored as additional families, not forced into the first five existing runtime keys.

## 5. Geometry and export rules

- Runtime-safe baseline: square orthogonal grid until the Map Editor proves a different grid contract.
- Tile-size decision: prototype at **32×32 px** to align with the repository's existing derived terrain work; also test a **64×64 px** master version for hand-painted detail. Do not assume that 64×64 can be bound by the current renderer without checking tile dimensions and scaling.
- Each runtime tile image must have exact declared dimensions; no accidental padding, off-grid pixels, or inconsistent edge seams.
- PNG RGBA for runtime tiles and overlays. Opaque ground tiles may use alpha=255 throughout; overlays may use alpha transparency.
- Use lossless source masters (Krita `.kra` or layered `.ora`) and export runtime PNGs. Aseprite `.aseprite` is optional for pixel-level cleanup or animation; Blender is optional only if a later render-to-sprite workflow is chosen.
- Metadata: JSON sidecar for each set; include asset key, file path, dimensions, tile size, material, role, transition pair, neighbor mask (only when defined), variant index, alpha expectation, source/provenance, license, attribution, SHA-256, and verification status.
- Keep source masters separate from runtime exports. Never commit a flattened concept sheet as if it were a tested tileset.

## 6. Proposed folder layout

```text
assets/
  vendrith-original/
    terrain/
      masters/
      runtime/
        ground/
        water/
        transitions/
        landforms/
      previews/
      metadata/
      tests/
  _documentation/
    VENDRITH_HAND_PAINTED_25D_TERRAIN_PIPELINE_V1.md
```

This is a proposed layout only. Before adding binaries, inspect current repository conventions and avoid duplicating canonical assets or creating a competing registry. The existing Asset Registry and license/provenance tables remain authoritative.

## 7. Tool choices (no required plugin)

- **Krita**: recommended primary hand-painting tool; preserve editable layered masters.
- **Aseprite**: optional for precise tile cleanup, animation frames, and sprite-sheet export.
- **Blender**: optional if the team later decides to render simple 3D terrain props into consistent 2D sprites.
- **PNG + JSON**: runtime export and explicit metadata.
- **Existing repository tests / Map Editor**: authoritative compatibility gate.

Tools are interchangeable; no plugin is a prerequisite. Do not claim these tools are installed or have been run unless verified.

## 8. Pipeline gates

### Gate A — Art direction
Approve palette, camera/grid assumptions, lighting, texture density and sample tiles at actual game scale.

### Gate B — Tile integrity
Verify dimensions, RGBA mode, alpha, file naming, no accidental borders, and SHA-256. Produce a contact sheet only for human review; it is not the runtime asset.

### Gate C — Transition coverage
Test each transition in all orientations, inside/outside corners, narrow strips, diagonal contacts, isolated terrain cells, and multi-material junctions. No visible gaps, dark halos, or inconsistent light direction.

### Gate D — Runtime contract
Trace how the renderer consumes `asset_path`, tile width/height, `neighbor_mask`, `tile_region`, and `tileset_id`. If only whole-file textures are supported, export individual tile PNGs. If region/crop support is proposed, implement and test it separately rather than assuming it exists.

### Gate E — Governance and approval
Record provenance, license, attribution, checksum and visual review. New original art should be recorded as Vendrith-created only when that provenance is true. Keep candidates unapproved until all evidence and tests pass. Never promote assets by documentation alone.

### Gate F — Map Editor integration
Add approved candidates only through the existing reviewed asset-binding workflow. Verify the base binding and transition masks, run targeted tests and the relevant full test suite, then inspect the real Map Editor. Do not alter runtime bindings or Supabase data as part of the concept-art step.

## 9. Acceptance criteria

- [ ] Visual identity is recognizably Vendrith and not a copy of LPC.
- [ ] Tile geometry matches the selected grid and declared dimensions.
- [ ] Base tiles repeat without obvious seams or distracting repetition.
- [ ] All listed transitions pass the validation map in every orientation.
- [ ] Shallow water and deep water are visually distinguishable.
- [ ] Cliff tops and faces read as elevation at normal gameplay zoom.
- [ ] PNGs have expected RGBA/alpha behavior; JSON metadata matches binaries.
- [ ] SHA-256 values are recorded and reproducible.
- [ ] License/provenance and review status are explicit.
- [ ] Runtime compatibility is proven by code inspection and tests, not inferred from a preview.
- [ ] No asset binding, registry approval, renderer, or database mutation occurs before its separate approval gate.

## 10. First implementation milestone

**Milestone T0 — Terrain prototype specification and visual review.**

Deliver:
1. palette sheet and brush/light rules;
2. 32×32 runtime tile prototype plus 64×64 master comparison;
3. base ground/water tiles and a compact set of transition examples;
4. metadata schema and a deterministic validation checklist;
5. a compatibility report mapping prototype requirements to the actual Map Editor loader/renderer.

Exit condition: the prototype is reviewed and its dimensions/transition strategy are validated. Only then create the complete tile family and prepare runtime integration.
