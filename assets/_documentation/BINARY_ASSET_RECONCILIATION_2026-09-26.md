# Binary Asset Reconciliation — 2026-09-26

## Status

**BINARY IMPORT: PRESENT**  
**MAP-ROLE RECONCILIATION: IN PROGRESS — WORLD FIRST PASS APPLIED**  
**PROVENANCE / CHECKSUM VERIFICATION: NOT YET COMPLETE FOR EVERY BINARY**

The commit `032f83d88821e4d81fbfb63c87006c8ec06b4fb3` imported the original binary asset packages into the repository through Git LFS.

GitHub's LFS model stores a pointer in the Git tree and the large object separately. Therefore a visible LFS pointer proves repository tracking, but does not by itself prove that every binary object has been locally materialized or that provenance/license has been reconciled. citeturn0search0turn0search2

## Canonical rule

The four map layers are **map-role classifications**, not replacement asset libraries:

- `01_WORLD` — natural environment only.
- `02_REGION` — regional/location context.
- `03_PLAYABLE` — concrete exterior gameplay content.
- `INTERIOR` — interior map content.

Canonical source libraries remain:

- `assets/environment/`
- `assets/characters/`
- `assets/animals/`
- `assets/weapons/`
- `assets/vehicles/`
- `assets/animations/`
- `assets/objects/`
- `assets/effects/`
- `assets/inventory/`
- `assets/ui/`
- `assets/shared/`

No binary is duplicated merely to satisfy a map-role classification.

## Immediate reconciliation rules

### WORLD

Allowed:
- ground and terrain
- grass, dirt, sand, stone, mud, beach
- water: coastal, normal, deep, transitions, flowing, frozen
- mountains, hills, cliffs, natural rock formations
- forest, jungle, desert, swamp, snow/ice
- natural vegetation/scenery

Not allowed:
- characters
- animals
- clothing
- weapons
- vehicles
- animation-only resources
- buildings or man-made structures

Known issue from the imported package: `assets/world/world/02_TILES_AND_TERRAIN/` contains at least some non-WORLD material. Those files remain preserved but are **pending canonical-library reconciliation** rather than being treated as WORLD assets.

### REGION

Allowed as regional context:
- roads and paths
- bridges, docks and ports
- static/location-context ships
- villages, towns, cities
- castles, fortifications, ruins
- farms and camps
- regional props/context

Map-project files such as TMX/TSX are authoring resources and must not be mistaken for standalone binary asset approval.

### PLAYABLE

Allowed:
- buildings
- exterior architecture
- interactables
- resource nodes
- crafting stations
- combat interactables
- gameplay props
- controllable vehicles

Not canonical PLAYABLE categories:
- characters
- animals
- standalone animation resources
- general weapon library

These belong to their canonical libraries and receive a PLAYABLE gameplay binding only when applicable.

### INTERIOR

Allowed:
- floors
- walls
- ceilings
- doors/windows
- stairs
- furniture
- decoration props
- interactables
- crafting stations
- lighting
- dungeon interiors

## Imported-package mapping

| Imported source class | Canonical library | Map-role binding |
|---|---|---|
| `02_TILES_AND_TERRAIN/` | `environment/` | WORLD |
| character sprites/clothing | `characters/` | LIFE_GENERATION / gameplay binding |
| animals | `animals/` | LIFE_GENERATION / gameplay binding |
| weapons | `weapons/` | PLAYABLE combat binding / inventory |
| vehicles | `vehicles/` | REGION context or PLAYABLE controllable vehicle |
| animations | `animations/` | entity/system binding; not a map layer |
| objects/buildings | `objects/` | REGION context / PLAYABLE / INTERIOR |
| interior source assets | `objects/` or dedicated interior canonical source record | INTERIOR |
| TMX/TSX map projects | map-authoring data | REGION/PLAYABLE/INTERIOR authoring |

## Provenance rule

An asset is not promoted to `approved` merely because its filename resembles an OpenGameArt source. Promotion requires reconciliation of:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

Unknown or unresolved provenance remains **pending**.

## Current imported counts

The import manifest records:
- WORLD staging: 681 binaries
- REGION staging: 14 binaries
- PLAYABLE staging: 7,061 binaries
- INTERIOR staging: 19 binaries

These are **manifest-reported import counts**, not an independent final classification count.

## Next reconciliation sequence

1. Enumerate every imported binary by source path.
2. Detect non-map-role material in WORLD and PLAYABLE.
3. Bind those files to canonical libraries without duplicating binaries.
4. Record source/license/attribution and LFS OID/size where available.
5. Recompute counts after reconciliation.
6. Only then mark individual assets repository-present/approved.



## WORLD first-pass reconciliation — completed

On 2026-09-26, the first WORLD staging directory was enumerated directly from the repository tree.

- Original WORLD staging count: **681**
- Clearly non-WORLD files removed from that staging path: **81**
- Remaining WORLD staging count: **600**
- LFS pointer identity was preserved; the move changed repository path, not the LFS object.
- Verification after the move confirmed representative targets are still Git LFS pointers. GitHub documents that LFS pointer files contain an object OID and final file size, while the actual large object is stored separately. citeturn0search6turn0search2

### Moved categories

| Category | Count / rule | Destination |
|---|---:|---|
| Character shirt animation sprites | 7 | `assets/characters/imported/lpc/` |
| Overworld houses | 3 | `assets/objects/imported/exterior/` |
| Explicit wall/stair/water-wall pieces | 5 | `assets/objects/imported/exterior/` |
| Limestone/brick/window architecture | 3 | `assets/objects/imported/exterior/` |
| Roof tiles/previews | 5 | `assets/objects/imported/exterior/` |
| LPC wall package + credits/TSX | 3 | `assets/objects/imported/exterior/` |
| Christmas wall decoration | 1 | `assets/objects/imported/interior/` |
| LPC structure pack | 50 | `assets/objects/imported/interior-exterior/` |
| Rusty-wall / pipe asset | 1 | `assets/objects/imported/exterior/` |
| Sidewalk | 1 | `assets/region/region/01_ROADS/imported/` |
| Roof/building/indoor edited tilesets | 3 | canonical-role staging destinations |

**Total moved: 81.**

### Deliberately not moved

- `LPC_Overworld__Sailboat.png`
- `LPC_Overworld__Ship.png`
- `LPC_Overworld__Shipwreck.png`

These are man-made maritime assets, but the exact final distinction between REGION context, controllable vehicle, and wreck/prop should be decided in the REGION/PLAYABLE audit rather than guessed from filename.

- `lpc_animals_2022_v1.1__animated wall traps (extra).png`

This is also retained pending PLAYABLE combat-interactable reconciliation.

- `lpc_animals_2022_v1.1__underwater tiles (by Sevarihk).png`

This remains in WORLD because its filename identifies underwater tiles and therefore may legitimately belong to the water layer.

The move was performed at the Git tree level using the existing LFS pointer blob identities, so no binary re-encoding was performed.
