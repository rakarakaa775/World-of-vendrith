# LPC Terrains — WORLD Water & Terrain Audit — 2026-09-26

## Status

**Audit classification: COMPLETE for 59 `lpc_terrain__*.png` binaries.**

This document records the repository-side classification of the 59 LPC Terrains files currently present under:

`assets/world/world/02_TILES_AND_TERRAIN/`

The files remain in their existing location. No PNG is duplicated or renamed by this audit.

## Source family / provenance

**Source family:** [LPC] Terrains  
**Source page:** https://opengameart.org/content/lpc-terrains  
**License family:** CC-BY-SA 4.0 and CC-BY-SA 3.0 as applicable to the source package  
**Attribution:** retain the complete attribution from `CREDITS-terrain.txt` / accompanying source credits.

A source-family match is not treated as proof that the repository binary is independently verified. Repository approval still requires binary identity/checksum reconciliation.

## Canonical WORLD bindings

### Water

| Repository file | Category | Subcategory | Transition |
|---|---|---|---|
| `lpc_terrain__water.png` | Water | Open Water | — |
| `lpc_terrain__deepwater.png` | Water | Deep Water | — |
| `lpc_terrain__deepwater2.png` | Water | Deep Water | — |
| `lpc_terrain__brackish.png` | Water | Brackish | — |
| `lpc_terrain__coldwater.png` | Water | Cold Water | — |
| `lpc_terrain__coldwatergrass.png` | Water | Cold Water | Water ↔ Grass |
| `lpc_terrain__coldwatergrassaltother.png` | Water | Cold Water | Water ↔ Grass |
| `lpc_terrain__coldwaterredsandother.png` | Water | Cold Water | Water ↔ Red Sand |
| `lpc_terrain__coldwatersandother.png` | Water | Cold Water | Water ↔ Sand |
| `lpc_terrain__coldwatersnowgrass.png` | Water | Cold Water | Water ↔ Snow/Grass |
| `lpc_terrain__coldwatersnowother.png` | Water | Cold Water | Water ↔ Snow |
| `lpc_terrain__redsandwater.png` | Water | Coastal / Shallow | Red Sand ↔ Water |
| `lpc_terrain__sandredsandwater.png` | Water | Coastal / Shallow | Sand/Red Sand ↔ Water |
| `lpc_terrain__sandwater.png` | Water | Coastal / Shallow | Sand ↔ Water |
| `lpc_terrain__watergrass.png` | Water | Coastal / Shallow | Water ↔ Grass |
| `lpc_terrain__watergrassaltother.png` | Water | Coastal / Shallow | Water ↔ Grass |
| `lpc_terrain__waterredsandother.png` | Water | Coastal / Shallow | Water ↔ Red Sand |
| `lpc_terrain__watersandother.png` | Water | Coastal / Shallow | Water ↔ Sand |
| `lpc_terrain__watersnowgrass.png` | Water | Cold / Snow Water | Water ↔ Snow/Grass |
| `lpc_terrain__watersnowother.png` | Water | Cold / Snow Water | Water ↔ Snow |
| `lpc_terrain__snowcoldwater.png` | Water | Cold Water | Snow ↔ Cold Water |
| `lpc_terrain__snowwater.png` | Water | Cold / Seasonal Water | Snow ↔ Water |

### Frozen / ice

| Repository file | Category | Subcategory | Transition |
|---|---|---|---|
| `lpc_terrain__ice.png` | Frozen | Ice | — |
| `lpc_terrain__icegrass.png` | Frozen | Ice | Ice ↔ Grass |
| `lpc_terrain__icegrassaltother.png` | Frozen | Ice | Ice ↔ Grass |
| `lpc_terrain__iceredsandother.png` | Frozen | Ice | Ice ↔ Red Sand |
| `lpc_terrain__icesandother.png` | Frozen | Ice | Ice ↔ Sand |
| `lpc_terrain__icesnowgrass.png` | Frozen | Ice | Ice ↔ Snow/Grass |
| `lpc_terrain__icesnowother.png` | Frozen | Ice | Ice ↔ Snow |
| `lpc_terrain__snowice.png` | Frozen | Ice | Snow ↔ Ice |

**Important:** `ice*` is not automatically labelled as sea ice. The asset binding should carry a separate `water_origin` / `terrain_binding` field when the engine needs to distinguish frozen water from ordinary surface ice.

### Ground

| Repository file | Category | Subcategory | Transition |
|---|---|---|---|
| `lpc_terrain__dirt.png` | Ground | Dirt | — |
| `lpc_terrain__dirt2.png` | Ground | Dirt | — |
| `lpc_terrain__dirt_night.png` | Ground | Dirt / Night | — |
| `lpc_terrain__grass.png` | Ground | Grass | — |
| `lpc_terrain__grass_night.png` | Ground | Grass / Night | — |
| `lpc_terrain__grassalt.png` | Ground | Grass Variant | — |
| `lpc_terrain__grassgrassaltother.png` | Ground | Grass Variant | Grass ↔ Grass Variant |
| `lpc_terrain__redsand.png` | Ground | Red Sand | — |
| `lpc_terrain__sand.png` | Ground | Sand | — |
| `lpc_terrain__sandredsand.png` | Ground | Sand | Sand ↔ Red Sand |
| `lpc_terrain__snow.png` | Ground | Snow | — |
| `lpc_terrain__tallgrass.png` | Vegetation | Tall Grass | — |

### Natural terrain formations

| Repository file | Category | Subcategory | Transition |
|---|---|---|---|
| `lpc_terrain__hole.png` | Terrain Formation | Natural Opening / Hole | — |
| `lpc_terrain__holegrassaltother.png` | Terrain Formation | Hole | Hole ↔ Grass |
| `lpc_terrain__holek.png` | Terrain Formation | Hole Variant | — |
| `lpc_terrain__holekgrassaltother.png` | Terrain Formation | Hole Variant | Hole ↔ Grass |
| `lpc_terrain__holelikegrassaltotheroverlay.png` | Terrain Formation | Hole-like | Overlay |
| `lpc_terrain__holelikegrassoverlay.png` | Terrain Formation | Hole-like | Overlay |
| `lpc_terrain__holemid.png` | Terrain Formation | Hole | — |
| `lpc_terrain__holemidgrassaltother.png` | Terrain Formation | Hole | Hole ↔ Grass |

### Volcanic terrain

| Repository file | Category | Subcategory | Transition |
|---|---|---|---|
| `lpc_terrain__lava.png` | Volcanic Terrain | Lava | — |
| `lpc_terrain__lavagrassaltother.png` | Volcanic Terrain | Lava | Lava ↔ Grass |
| `lpc_terrain__lavarock.png` | Volcanic Terrain | Lava Rock | Lava ↔ Rock |

### Source tilesets — visual verification required

| Repository file | Category | Subcategory | Transition |
|---|---|---|---|
| `lpc_terrain__tileset01a.png` | Ground/Terrain | Source Tileset | Needs visual/source verification |
| `lpc_terrain__tileset01b.png` | Ground/Terrain | Source Tileset | Needs visual/source verification |
| `lpc_terrain__tileset01c.png` | Ground/Terrain | Source Tileset | Needs visual/source verification |
| `lpc_terrain__tileset01d.png` | Ground/Terrain | Source Tileset | Needs visual/source verification |
| `lpc_terrain__tileset01e.png` | Ground/Terrain | Source Tileset | Needs visual/source verification |
| `lpc_terrain__tileset01f.png` | Ground/Terrain | Source Tileset | Needs visual/source verification |

## Canonical water taxonomy

The Asset Library keeps water depth/use separate:

```text
WORLD
└── WATER
    ├── COASTAL
    │   └── transition tiles involving sand/red-sand/grass
    ├── OPEN
    │   └── water
    ├── DEEP
    │   └── deepwater / deepwater2
    ├── BRACKISH
    │   └── brackish
    ├── COLD
    │   └── coldwater + cold-water transitions
    └── FROZEN
        └── ice + ice transitions
```

The taxonomy is a logical Asset Library binding. It does not require moving or duplicating the PNG files.

## Metadata contract

Each future asset record should be able to represent at least:

- `source_family`: `LPC Terrains`
- `source_asset_path`
- `repository_path`
- `map_role`: `WORLD`
- `world_category`
- `subcategory`
- `transition_type`
- `terrain_binding`
- `water_origin` when relevant
- `license`
- `attribution_required`
- `attribution_source`
- `binary_identity`
- `checksum_sha256`
- `approval_state`

## Approval boundary

The 59 classifications above are **classification decisions**, not blanket approval.

- `water` → Open Water
- `deepwater`, `deepwater2` → Deep Water
- sand/grass/red-sand water combinations → Coastal/Shallow or transition bindings
- `ice*` → Frozen/Ice, without assuming sea-ice origin
- `tileset01a-f` → Source Tileset / visual verification pending

No asset receives an invented creator, license, checksum, or binary-verified status.

## Repository verification

On 2026-09-26 the repository tree was enumerated and returned exactly **59** filenames matching `lpc_terrain__*.png`.

Git object SHAs are tracked by the repository for these files. They are repository blob/pointer identities, not substitutes for the final binary SHA-256 provenance check.

## Relationship to WORLD audit

This audit is a focused expansion of `assets/_documentation/WORLD_ASSET_AUDIT.md` and `assets/_documentation/BINARY_ASSET_RECONCILIATION_2026-09-26.md`.

It does not alter the WORLD/REGION boundary:

- WORLD = natural environment.
- REGION = buildings, bridges, docks, ships, settlements and other regional/man-made context.
