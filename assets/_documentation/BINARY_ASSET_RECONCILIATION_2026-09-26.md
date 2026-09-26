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


## WORLD fourth checkpoint — LPC Terrains provenance boundary

OpenGameArt's **[LPC] Terrains** identifies bluecarrot16 as author and Zabin as collaborator. The pack covers grass, dirt, rock, stone, cobblestone, mud, water, snow, ice, lava, sand, beach and bog, and lists CC-BY-SA 4.0 and CC-BY-SA 3.0. Its attribution notice requires crediting all authors listed in `CREDITS-terrain.txt` and linking back to the OpenGameArt page. citeturn0search0

This confirms that the terrain family is appropriate for WORLD, but it does **not** by itself prove that every similarly named repository PNG is an exact byte-for-byte copy of the upstream file. The repository therefore keeps individual binary identity and source-path verification as a separate approval step.

The related **[LPC] Terrains Repacked** submission states that it repacks the LPC Terrains tiles into a 4096×4096 image and retains the same attribution requirements. A repository file named like a repacked/exported terrain atlas must therefore retain its exact upstream/repack provenance rather than being silently attributed to a generic terrain source. citeturn0search4

### Special mountain license boundary

The separate **[LPC] Mountains from The Mana World** package is GPL 2.0, not the CC-BY-SA licensing shown for the main LPC Mountains package. Its three mountain-v6 TMW PNGs must therefore remain separately identified in the provenance registry and must not be merged into the main CC-BY-SA mountain credit record. citeturn0search2

The main **[LPC] Mountains** page also explicitly warns that its preview/Tiled material contains LPC Terrains content, so the terrain attribution requirements continue to apply where that material is included. citeturn0search1

## World Building Asset Library checkpoint

A visual Asset Library is now defined at `apps/map-editor/WORLD_BUILDING_ASSET_LIBRARY.md`.

The intended model is:

`Asset Registry → Asset Library → Terrain Binding → World Builder placement`

The library will show thumbnails/previews, names, categories, biome/environment tags, source family, license/provenance status, runtime status, dimensions/tile size and placement capability. It will support sheet preview, tile preview, placement preview and terrain/autotile preview where metadata allows.

This is deliberately a **metadata/reference layer**, not another binary asset library. Canonical binaries remain stored once, while the World Builder reads their registered paths and runtime bindings.

This will also let us visually inspect which WORLD assets are actually available before placing them, instead of relying only on filenames.

## Updated current checkpoint

**WORLD staging: 144 PNG binaries**  
**WORLD authoring/source files: 0**  
**MAP-ROLE RECONCILIATION: WORLD structural cleanup complete**  
**PROVENANCE / CHECKSUM VERIFICATION: IN PROGRESS — individual binary approval pending**  
**WORLD BUILDING ASSET LIBRARY: DESIGN CONTRACT ADDED — UI IMPLEMENTATION PENDING**


## WORLD fourth reconciliation checkpoint — LPC Terrains — 2026-09-26

A focused repository enumeration found exactly **59** files matching `lpc_terrain__*.png` under `assets/world/world/02_TILES_AND_TERRAIN/`.

All 59 are now classified in `assets/_documentation/LPC_TERRAINS_WORLD_AUDIT_2026-09-26.md` by canonical WORLD role, subcategory and transition binding.

### Locked classification rules

- `lpc_terrain__water.png` → WORLD / WATER / OPEN.
- `lpc_terrain__deepwater.png`, `deepwater2.png` → WORLD / WATER / DEEP.
- Sand/red-sand/grass water-combination tiles → WORLD / WATER / COASTAL or transition bindings.
- `coldwater*` → WORLD / WATER / COLD.
- `ice*` and `snowice` → WORLD / WATER / FROZEN/ICE binding; do not infer sea-ice origin from filename alone.
- Ground, volcanic, vegetation and natural-hole files remain WORLD natural terrain.
- `tileset01a`–`tileset01f` remain **Source Tileset / visual verification pending**.

This is metadata classification only. The PNGs are not duplicated or renamed, and source-family matching does not by itself promote the binaries to approved status.

The repository tree currently provides Git object/pointer identities for all 59 files; final binary SHA-256 reconciliation remains a separate verification step.


## WORLD fifth reconciliation checkpoint — Natural Landforms — 2026-09-26

A focused filename-level pass identified **23** natural landform binaries in the WORLD terrain staging path: 9 mountains, 3 hills, 4 cliffs and 7 natural rocks.

Detailed classification is recorded in `WORLD_MOUNTAINS_HILLS_CLIFFS_ROCKS_AUDIT_2026-09-26.md`.

The audit explicitly separates ordinary [LPC] Mountains, Mountains from The Mana World (GPL 2.0), [LPC] Overworld, [LPC] Rocks, and grass-topped cliff/mountain derivatives. No ambiguous file receives a guessed provenance or license.


## WORLD sixth reconciliation checkpoint — Natural Vegetation — 2026-09-26

A direct repository-tree enumeration found **25 PNG candidates** in `assets/world/world/02_TILES_AND_TERRAIN/` matching forest/tree/plant/jungle/season semantics.

| Natural vegetation group | Count | Status |
|---|---:|---|
| Forest terrain | 3 | source-family identified; binary verification pending |
| Deciduous / woodland trees | 4 | [LPC] Trees source identified; binary verification pending |
| Seasonal / modified trees | 3 | source/binary mapping pending |
| Orchard / fruit trees | 3 | multiple distinct source families identified |
| Plants / understory / submissions | 6 | mixed source families; mapping pending |
| Jungle | 5 | [LPC] Jungle family identified; binary verification pending |
| **Total** | **24 unique classified records + 1 generic plant sheet** | all remain provenance-review candidates |

Important source boundaries:
- [LPC] Forest tiles is a separate multi-author pack with CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0.
- [LPC] Trees is CC-BY-SA 3.0 and requires its credits file.
- [LPC] Conifers is CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0, but no dedicated conifer-named binary was found in this enumeration.
- [LPC] Jungle is CC-BY 4.0 and has its own credits file.
- Fruit Trees, All Seasons Apple Tree and Orange Trees are separate sources and must retain separate attribution.

The detailed classification is recorded in `WORLD_FOREST_WOODLAND_CONIFER_JUNGLE_AUDIT_2026-09-26.md`.

**Approval remains pending:** `source package → source path → repository path → binary identity/SHA-256 → license → attribution`.


## WORLD seventh reconciliation checkpoint — Desert — 2026-09-26

A direct repository-tree enumeration identified **17 desert/sand PNG candidates** in WORLD terrain staging.

- 4 desert terrain files
- 10 sand/water transition files
- 3 desert landform files
- 0 filename-explicit dedicated desert-vegetation files

The absence of a dedicated desert-vegetation filename is recorded explicitly rather than filling the gap from an external source assumption. The official [LPC] Beach / Desert pack contains cacti, desert plants and dry trees, but a repository binary must be located and checksum/source-reconciled before receiving that binding. citeturn0search0

Detailed classification: `WORLD_DESERT_DESERT_VEGETATION_AUDIT_2026-09-26.md`.

**Approval remains pending:** `source package → source path → repository path → binary identity/SHA-256 → license → attribution`.


## WORLD eighth reconciliation checkpoint — Swamp / Wetlands — 2026-09-26

A filename-focused enumeration found **21 PNG candidates** with wetland-adjacent semantics. The strongest explicit candidate is `lpc_terrain__brackish.png`; `watergrass` and `watergrassaltother` are strong wetland transition candidates. Generic dirt/grass and hole/depression assets remain unapproved for swamp-specific binding until visual/source verification.

No dedicated swamp vegetation binary was promoted solely from filename semantics. Generic plants, dead trees and fungi remain reusable candidates whose biome binding requires visual verification and provenance reconciliation.

Detailed audit: `WORLD_SWAMP_WETLANDS_AUDIT_2026-09-26.md`.

**Approval remains pending:** `source package → source path → repository path → binary identity/SHA-256 → license → attribution`.


## WORLD ninth reconciliation checkpoint — Snow / Tundra / Frozen Landscapes — 2026-09-26

A filename-focused enumeration found **33 PNG candidates** with snow/ice/frozen/winter/cold semantics. Snow terrain, snowy landforms and snowy vegetation variants are distinguishable from frozen water and cold-water transitions. No dedicated tundra vegetation family was promoted from filename semantics alone.

Official LPC sources confirm snow/ice terrain and snowy overworld/landform variants, but exact repository binary provenance still requires source-path and binary identity reconciliation. citeturn0search0turn0search1turn0search5

Detailed audit: `WORLD_SNOW_TUNDRA_FROZEN_AUDIT_2026-09-26.md`.


## WORLD tenth reconciliation checkpoint — Ground / Terrain Core — 2026-09-26

A broad filename discovery returned **144 PNG paths**, but only a conservative subset is Ground Core. Grass, dirt/soil and beach have direct candidates; stone and mud remain conservative/source-level classifications until exact binary identity is verified. The official LPC Terrains source explicitly covers grass, dirt, stone, mud and beach. citeturn0search0

Detailed audit: `WORLD_GROUND_TERRAIN_CORE_AUDIT_2026-09-26.md`.


## WORLD eleventh reconciliation checkpoint — Ground Transitions — 2026-09-26

A focused scan found **29 transition-related PNG candidates**. The LPC terrain source was explicitly designed for seamless terrain composition and supports selected multi-terrain combinations; this validates keeping transitions as logical compatibility metadata rather than duplicating binaries. citeturn0search0turn0search8

Detailed audit: `WORLD_GROUND_TRANSITIONS_AUDIT_2026-09-26.md`.


## WORLD twelfth reconciliation checkpoint — Natural Hazards / Special Terrain — 2026-09-26

A focused enumeration found **14 PNG candidates**. Strong semantic groups are lava (`lava`, `lavagrassaltother`, `lavarock`), waterfall (`tilesets_edit__5_waterfall.png`), cave sheets, and hole/depression variants. The official LPC Terrains source includes lava, while LPC sources separately document waterfall and cave resources. citeturn0search0turn0search1turn0search5

Detailed audit: `WORLD_NATURAL_HAZARDS_SPECIAL_TERRAIN_AUDIT_2026-09-26.md`.


## WORLD water-feature reconciliation checkpoint — 2026-09-26

Focused filename scan returned **40 water-related matches**, with false positives filtered conservatively. Strong feature candidates include `LPC_Overworld__River.png`, general water sheets, deepwater, brackish, coldwater, beach/shore assets and the previously audited waterfall. The water model is now explicitly **water state + geographic feature + transition**. No standalone lake or ocean binary is invented where the repository does not provide one. Detailed audit: `WORLD_SHORELINES_RIVERS_LAKES_WATER_FEATURES_AUDIT_2026-09-26.md`.


## WORLD vegetation ecology reconciliation checkpoint — 2026-09-26

Filename scan returned **52 vegetation-related candidates**; terrain transitions and generic grass materials were filtered out. Strong families are forest/woodland, seasonal/snow trees, orchard/fruit trees, jungle, understory/plants/fungi and dead vegetation. Dedicated desert and wetland vegetation remain source-supported but binary-pending where filename evidence is insufficient. Detailed audit: `WORLD_VEGETATION_ECOLOGY_AUDIT_2026-09-26.md`.


## WORLD biome composition reconciliation checkpoint — 2026-09-26

The completed WORLD audits are consolidated into a logical biome recipe layer. Biomes reference verified Asset Library records rather than owning duplicate binaries. Water remains state + feature; landforms remain orthogonal; seasonal variants are modifiers. Detailed rules: `WORLD_BIOME_COMPOSITION_ECOLOGY_RULES_2026-09-26.md`.


## WORLD thirteenth reconciliation checkpoint — Asset Library schema v1 — 2026-09-26

The live Supabase Asset Library foundation was inspected before adding a second schema. Existing canonical tables were retained rather than duplicated:

- `asset_registry`: canonical asset identity
- `asset_sources`: source/package identity
- `asset_license_registry`: license and attribution
- `asset_provenance_verifications`: provenance evidence
- `asset_manifest`: manifest/runtime metadata
- `asset_seasonal_variants`: seasonal relationships
- `asset_binding_candidates`: existing terrain candidates

The new WORLD extension adds normalized relationships:

- `asset_binary_verifications`
- `world_biome_compatibility`
- `world_water_bindings`
- `world_landform_bindings`
- `world_vegetation_bindings`
- `world_transition_bindings`

The migration was applied successfully to the live Supabase project and the six new tables were verified with RLS enabled.

**Important:** these tables contain no seeded WORLD approvals yet. New bindings default to candidate/pending states, so schema creation does not silently promote any audited PNG to approved status.

Detailed contract: `assets/_documentation/ASSET_LIBRARY_SCHEMA_V1_2026-09-26.md`.

