# Binary Asset Reconciliation — 2026-09-26

## Status

**BINARY IMPORT: PRESENT**  
**MAP-ROLE RECONCILIATION: IN PROGRESS — WORLD STRUCTURAL CLEANUP COMPLETE**  
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


## WORLD second reconciliation checkpoint — 2026-09-26

The repository tree was re-enumerated after the first-pass moves. The original 681 WORLD staging entries are now represented as:

- **242 entries remaining in WORLD staging**
- **64 additional entries reconciled:** 8 regional-context files + 56 fauna files
- **280 LPC map-symbol/banner files moved to shared canonical storage**
- **14 additional obvious role conflicts moved:** 3 sea creatures, 3 towers, 2 floor assets, 1 Victorian street asset, 2 Christmas-tree assets, 1 flower prop and 1 planter asset

The WORLD directory is therefore no longer a generic dump of the original 681-entry staging package.

### Provenance findings

The LPC Overworld source explicitly separates terrain, forests, mountains, hills, rocks and paths from houses/towns/castles, ships/docks, sea creatures, banners, patterns and symbols. It is licensed CC-BY-SA 3.0 and GPL 3.0, with attribution requirements. 

The LPC Terrains source explicitly covers ground terrain such as grass, dirt, rock, stone, mud, water, snow, ice, lava, sand, beach and bog, and requires attribution through its credits file.

The LPC Mountains source explicitly covers mountains, hills, cliffs, rocks and snow, with separate attribution requirements.

The LPC Trees source requires crediting the authors listed in its CREDITS-trees.txt file and linking back to the OpenGameArt source page.

### Remaining 242-entry WORLD staging rule

The remaining entries are **not yet all approved WORLD assets**. They contain a mixture of:

- genuine natural terrain/vegetation that can receive WORLD bindings;
- authoring resources such as TMX/TSX/XCF/PSD/scripts and credit files;
- a small number of remaining man-made/context assets such as ships and street/cement-related material;
- source packages whose exact provenance still needs individual checksum/license reconciliation.

Therefore the next step is to split the 242 entries into **NATURAL-WORLD**, **AUTHORING/SOURCE**, and **REMAINING ROLE CONFLICTS**, then perform provenance/checksum verification before any final approval.

## WORLD third reconciliation checkpoint — 2026-09-26

The current repository tree was re-enumerated from commit `0f011ae51cc685f246382d527f3a0d310702a79f`.

- **WORLD staging: 144 PNG binaries remain**
- **WORLD authoring/source files: 0**
- The latest cleanup removed three non-runtime/context PNGs from WORLD:
  - `LPC_forest__preview.png` → `assets/_documentation/source-material/world/`
  - `lpc-fruit-trees__fruit-trees-labels.png` → `assets/_documentation/source-material/world/`
  - `lpc_terrain__plowed_soil.png` → `assets/region/region/05_SETTLEMENTS/imported/`
- The remaining WORLD staging set is therefore PNG-only and is being treated as a **provenance audit set**, not automatically as approved content.

### Current provenance groups

The strongest source-family matches currently identified are:

| Repository source family | WORLD role | Provenance status |
|---|---|---|
| `LPC_Overworld__*` natural terrain/forest/mountain/rock/water files | WORLD | Source-family match; individual binary identity still pending |
| `lpc-terrains__terrain-v7.png` and related terrain exports | WORLD | Source-family match; individual binary identity still pending |
| `8__mountains-v6-tmw*`, `mountains__*` | WORLD | Source-family match; individual binary identity still pending |
| `rocks__*` | WORLD | Source-family match; individual binary identity still pending |
| `lpc-trees__*` | WORLD | Source-family match; individual binary identity still pending |
| `lpc-flowers-plants-fungi-wood__plants.png` | WORLD | Source-family match; individual binary identity still pending |
| `lpc-jungle*` | WORLD | Source-family match; individual binary identity still pending |
| generic/repacked/submission/edited files | WORLD candidate | Pending individual source-path and checksum reconciliation |

The OpenGameArt source pages confirm that LPC Terrains covers ground terrain including grass, dirt, rock, water, snow, ice, lava, sand, beach and bog; LPC Mountains covers mountains, hills, cliffs, rocks and snow; LPC Rocks covers rocks/boulders/stones/pebbles; the Plants/Fungi/Wood pack covers flowers, bushes, small trees, fungi, leaves, stumps and logs; and LPC Jungle covers trees, plants, vines and giant trees. These sources carry their respective attribution/license requirements and should not be collapsed into a single generic credit. 

### LPC Overworld binary checkpoint

The current WORLD tree contains **21** `LPC_Overworld__*.png` binaries. All 21 resolve in Git as Git LFS pointers. Their repository-side SHA-256 OIDs and byte sizes have been recorded during this checkpoint.

The OpenGameArt `[LPC] Overworld` source describes the same broad terrain family — grass, sand/desert, snow, water, forests, mountains, hills, rivers and rocks — but it also contains non-WORLD material such as houses, towns/castles, ships, docks, sea creatures and banners. Therefore only the natural subset belongs in WORLD; the repository's earlier reconciliation already moved the non-WORLD/context material out. citeturn0search1

**Binary verification status:** LFS identity recorded; upstream-file checksum comparison is still pending. Do not mark these files fully approved solely from filename/source-family similarity.

### Important approval rule

A source-family filename match is **not** sufficient for final approval. Each binary remains pending until the audit can establish:

`source package → source path → repository path → binary identity/SHA-256 → license → attribution`

For this reason, the current 144-file count should be read as **144 WORLD candidates under provenance review**, not 144 fully approved assets.

## Current checkpoint

**WORLD staging: 144 PNG binaries**  
**WORLD authoring/source files: 0**  
**MAP-ROLE RECONCILIATION: WORLD structural cleanup complete**  
**PROVENANCE / CHECKSUM VERIFICATION: IN PROGRESS — individual binary approval pending**
