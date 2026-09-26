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

Example:
`[thumbnail] LPC Overworld — Grass`
`WORLD · Ground · Temperate`
`CC-BY-SA · Provenance verified`
`[Preview] [Use]`

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

This is especially important for LPC packs where one package can contain different source/license requirements. LPC Terrains, for example, requires attribution to all authors in its credits file and a link to its OpenGameArt source page. citeturn0search0

## Future World Builder layout
Recommended structure:
`World Builder`
- Map Canvas
- Layers
- **Asset Library**
  - Search
  - Filters
  - Categories
  - Asset grid
  - Selected asset details
  - Preview
  - Place / Bind action

The Asset Library should be dockable/collapsible so it does not permanently consume the map canvas.

## Implementation boundary
This design should reuse the existing asset registry, asset resolver, asset proxy and terrain-binding infrastructure where possible.

Do not create a second independent asset database solely for the World Builder.

The next implementation phase can add the visual Asset Library UI on top of the existing registry and runtime asset resolution.
