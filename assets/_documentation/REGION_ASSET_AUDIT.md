# REGION Asset Audit

Status: **STRUCTURE DEFINED / REGION-ONLY PROVENANCE AUDIT IN PROGRESS**

## Purpose

REGION is the map-role layer for **exterior regional geography and locations**. This audit is intentionally limited to assets whose role is a REGION element.

**Important scope rule: REGION is not the generic Building/Architecture library.**

Standalone buildings, house kits, walls, roofs, doors/windows, furniture, interior construction pieces, and generic architecture packs are not promoted merely because they can appear inside a region. They remain in their canonical asset libraries; a future REGION map may reference their placement as part of a specific location without duplicating the binaries.

## Canonical structure

```text
02_REGION
├── 01_ROADS
├── 02_PATHS
├── 03_BRIDGES
├── 04_DOCKS
├── 05_PORTS
├── 06_SHIPS
├── 07_VILLAGES
├── 08_TOWNS
├── 09_CITIES
├── 10_CASTLES
├── 11_FORTIFICATIONS
├── 12_RUINS
├── 13_FARMS
├── 14_CAMPS
└── 15_REGION_PROPS
```

## REGION vs generic BUILDING

A building can physically exist inside a region, but that does **not** automatically make its source binary a REGION asset.

### REGION

Use REGION for the regional/world-map role:
- Roads
- Paths
- Bridges
- Docks
- Ports
- Static ships/boats used as scenery
- Settlement/location assemblies when treated as regional locations
- Fortifications and ruins as regional locations
- Farms/camps as regional locations
- Regional infrastructure and decorative props

### NOT promoted as REGION just because it is a building

Do not classify these as REGION binaries during this audit:
- Generic house/building tiles
- Building wall kits
- Roof kits
- Windows and doors
- Interior building tiles
- Furniture
- Generic architecture packs
- Building construction components

## Static vs gameplay boundary

| Asset | REGION role | Gameplay role |
|---|---|---|
| Ship/boat | Static scenery → REGION/06_SHIPS | Controllable → PLAYABLE/07_VEHICLES |
| Cannon | Decorative/static → REGION/15_REGION_PROPS | Usable → PLAYABLE |
| Ballista | Decorative/static → REGION/15_REGION_PROPS | Usable → PLAYABLE |
| Catapult | Decorative/static → REGION/15_REGION_PROPS | Usable → PLAYABLE |
| Mine-cart track | REGION/01_ROADS or 02_PATHS | — |
| Mine cart | — | PLAYABLE/07_VEHICLES |
| Barrel | REGION/15_REGION_PROPS | PLAYABLE/06_GAMEPLAY_PROPS |
| Sign | REGION/15_REGION_PROPS | PLAYABLE/05_INTERACTABLES |
| Well/fountain | REGION/15_REGION_PROPS | PLAYABLE/05_INTERACTABLES |

## Source research: BRIDGES / DOCKS / PORTS / SHIPS

These are **source candidates**, not binary-approved assets. A source page alone does not prove that a repository binary came from that source.

### 03_BRIDGES

**LPC Wooden Bridge Rework**
- OpenGameArt source identified.
- REGION role: 03_BRIDGES.
- Source licenses: CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0.
- Attribution: Xenodora; the rework page also identifies AntumDeluge's current changes as CC0.
- Binary status: ⚠️ not individually verified.

**LPC style wood bridges and steel flooring**
- OpenGameArt source identified.
- REGION role: 03_BRIDGES when the element is bridge/walkway infrastructure.
- Source licenses: CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0.
- Attribution: Xenodora.
- Binary status: ⚠️ not individually verified.

**Stone Bridge tiles 32x32**
- Identified in LPC collections as a bridge source.
- REGION role: 03_BRIDGES.
- Binary status: ⚠️ source/binary identity not individually verified.

### 04_DOCKS

**Dock tileset**
- OpenGameArt source identified.
- REGION role: 04_DOCKS.
- The source is a dock/infrastructure asset, not a generic building.
- Binary status: ⚠️ source/binary identity not individually verified.

### 05_PORTS

No asset is promoted yet.

A port must represent a broader **port infrastructure/location**, not merely a dock, ship, water tile, or generic building.

Status: ⚠️ pending.

### 06_SHIPS

**LPC Wooden ship tiles**
- OpenGameArt source identified.
- Ship tiles are attributed to Tuomo Untinen.
- Licenses listed on the source include CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0 and GPL 2.0.
- REGION role: 06_SHIPS only when used as static exterior scenery.
- Controllable/usable ship → PLAYABLE/VEHICLES.
- Binary status: ⚠️ not individually verified.

**LPC Ship**
- Identified in LPC collections.
- REGION role: 06_SHIPS only when the instance is static scenery.
- Exact source package and binary identity: ⚠️ pending.

## Source research: ROADS / PATHS

### 01_ROADS

**[LPC] Streets**
- OpenGameArt author: Baŝto.
- The asset improves the streets from [LPC] Skorpio's SciFi Sprite Pack and includes separated streets, road markings, additional markings and street signs.
- License: CC-BY-SA 3.0 / GPL 3.0.
- Copyright/attribution notice states it is based on Skorpio's SciFi Sprite Pack, which is dual licensed CC-BY-SA 3.0 and GPL 3.0.
- REGION role: **01_ROADS**.
- Important: street/road tiles and road markings belong here; street signs are regional props unless they become interactive.
- Binary status: ⚠️ not individually verified against the asset library.

**LPC Modern Streets**
- Identified as an LPC collection/source candidate.
- REGION role: 01_ROADS when the asset represents exterior roadway infrastructure.
- Binary/source identity: ⚠️ pending.

### 02_PATHS

**RPG Tiles: Cobble stone paths & town objects**
- OpenGameArt source contains cobblestone paths and is licensed CC-BY-SA 3.0.
- The source attributes the work to Zabin, Daneeklu, Jetrel, Hyptosis, Redshrike and Bertram and provides a credit instruction linking back to the source page.
- REGION role: **02_PATHS** for the cobblestone path elements.
- The same tileset contains town objects, dock and boat elements; those must be split by actual role rather than importing the whole atlas into PATHS.
- Binary status: ⚠️ not individually verified.

### Regional rail infrastructure

**LPC Mine Carts and Tracks**
- OpenGameArt author: Xenodora.
- Licenses: CC-BY-SA 3.0, GPL 3.0 and GPL 2.0.
- Attribution: credit Xenodora.
- REGION role: **01_ROADS / 02_PATHS** for the static rail/track infrastructure.
- Mine-cart itself is not REGION when usable; it belongs to the gameplay vehicle system.
- Binary status: ⚠️ not individually verified.

## Important classification rule for mixed tilesets

A single source package may contain multiple REGION and non-REGION roles.

Example: **RPG Tiles: Cobble stone paths & town objects** contains path, dock, boat and town-object material. We do not classify the entire package as PATHS. We split individual assets/elements by their actual world role. citeturn0search0

Likewise, LPC collections contain streets, bridges, ships, buildings, interiors and other assets together. Collection membership is not sufficient evidence for REGION classification. citeturn0search1turn0search2

## Important exclusion: buildings

The LPC collections contain Colonial Buildings, Victorian Buildings, Adobe Town Set, cottages, castles and many other architecture assets. Their presence in an outdoor/LPC collection does **not** make them REGION binaries.

The REGION system should reference a specific settlement/location instance rather than duplicate every generic building binary.

## Provenance rule

No binary asset is promoted to verified license/credit status solely because its filename or visual appearance resembles a known source.

For every candidate we must record:
1. Repository/source path
2. Filename
3. Asset type
4. Intended REGION category
5. Source page/package
6. Creator/author when verified
7. License
8. Required credit
9. Additional conditions
10. SHA-256 when the binary is available
11. Binary verification status

Unknown provenance remains **⚠️ pending review**.

## Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — pending
4. SHIPS — source research started; binary matching pending
5. ROADS / PATHS — source research started; binary matching pending
6. Regional infrastructure
7. Static regional locations
8. REGION_PROPS

**Generic buildings remain excluded from this audit.**

## Important rule

**REGION is about the role of an asset in the exterior world, not about its filename, visual style, or the fact that it could be placed near a building.**

A building tile is not automatically a REGION asset.

A static bridge is REGION.

A static dock is REGION.

A static ship used as scenery is REGION.

A road/path is REGION.

A controllable ship is PLAYABLE/VEHICLES.

A mine cart is PLAYABLE/VEHICLES while its static track infrastructure is REGION.

A generic house/building kit remains in the building/architecture asset library until it is instantiated as part of a specific regional location.
