# REGION Asset Audit

Status: **STRUCTURE DEFINED / REGION-ONLY PROVENANCE AUDIT IN PROGRESS**

## Purpose

REGION is the map-role layer for **exterior regional geography and locations**. This audit is intentionally limited to assets whose role is a REGION element.

**Important scope rule: REGION is not the generic Building/Architecture library.**

For this audit, standalone buildings, house kits, interior/building construction pieces, furniture, roofs, walls, doors/windows, and other generic building assets are **not promoted simply because they can appear in a region**. They stay in their canonical asset storage/category unless a future map-placement record explicitly identifies them as part of a REGION location.

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

A building can physically exist inside a region, but that does **not** automatically make the asset a REGION asset.

### REGION

Use REGION for the regional/world-map role:
- Roads
- Paths
- Bridges
- Docks
- Ports
- Static ships/boats used as scenery
- Settlement/location assemblies when treated as a regional location
- Fortifications and ruins as regional locations
- Farms/camps as regional locations
- Regional infrastructure and decorative props

### NOT promoted as REGION just because it is a building

Do not classify these as REGION assets during this audit:
- Generic house/building tiles
- Building wall kits
- Roof kits
- Windows and doors
- Interior building tiles
- Furniture
- Generic architecture packs
- Building construction components

Those remain in their canonical asset libraries. If a future map document uses them to instantiate a specific village/town/city/castle, the **map placement/instance** can belong to REGION without duplicating the source binary.

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

## Source research: first REGION pass

These are **source candidates**, not binary-approved assets. A source page alone does not prove that a repository binary came from that source.

### 03_BRIDGES

**LPC Wooden Bridge Rework**
- OpenGameArt author: AntumDeluge.
- The page states the tileset was originally by Xenodora and reworked as a drop-in replacement.
- Licenses: CC-BY-SA 3.0, GPL 3.0, GPL 2.0.
- Attribution instruction: credit Xenodora; the page says AntumDeluge's current changes are CC0.
- REGION role: **03_BRIDGES**.
- Binary status: ⚠️ not individually verified against our asset library. citeturn0search0

**LPC style wood bridges and steel flooring**
- OpenGameArt author: Xenodora.
- Wood bridge and steel-flooring tiles are designed for bridges/walkways.
- Licenses: CC-BY-SA 3.0, GPL 3.0, GPL 2.0.
- Attribution instruction: credit Xenodora.
- REGION role: **03_BRIDGES** for bridge pieces; steel flooring only belongs here when actually used as regional bridge/walkway infrastructure.
- Binary status: ⚠️ not individually verified. citeturn0search11

**Stone Bridge tiles 32x32**
- Identified as a separate bridge source in OpenGameArt's LPC outdoor collections.
- REGION role: **03_BRIDGES**.
- Binary status: ⚠️ not individually verified. citeturn0search3

### 04_DOCKS

**Dock tileset**
- OpenGameArt author: Reid.
- Asset: `Artis_dock.png`.
- License: CC-BY-SA 3.0.
- REGION role: **04_DOCKS**.
- This is a dock/infrastructure asset, not a generic building asset.
- Binary status: ⚠️ not individually verified against our library. citeturn1search0

### 05_PORTS

No binary-approved PORT asset yet.

A port should only be promoted when we have evidence that the asset represents **port infrastructure/location**, rather than merely a dock, ship, water tile, or generic building.

Status: ⚠️ pending binary/source matching.

### 06_SHIPS

**LPC Wooden ship tiles**
- OpenGameArt author page: Reemax.
- The page states the ship tiles themselves were made by Tuomo Untinen.
- Licenses: CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0, GPL 2.0.
- Attribution notice: “Wooden ship tiles by Tuomo Untinen.”
- REGION role: **06_SHIPS only when used as static exterior scenery**.
- Important: the page explicitly distinguishes the ship tiles from LPC water in the preview; RPG Maker sails shown in a later discussion are not automatically usable under the ship license.
- Binary status: ⚠️ not individually verified against our library. citeturn0search7turn0search10

**LPC Ship**
- Identified in OpenGameArt LPC collections.
- REGION role: **06_SHIPS only if the instance is static scenery**.
- If controllable/usable, it belongs to the vehicle/gameplay system instead.
- Binary/source identity: ⚠️ exact source package and binary not yet verified. citeturn0search5

## Important exclusion: buildings

The LPC collections contain many entries such as Colonial Buildings, Victorian Buildings, Adobe Town Set, castles, cottages and other architecture. Their appearance in an LPC outdoor collection does **not** make them REGION assets for this audit.

They remain outside the REGION binary library unless we are later recording a **specific regional location instance**. The REGION system should reference the placement of a settlement/location rather than duplicate every building binary.

OpenGameArt's LPC collections themselves mix outdoor, indoor, building, furniture and other assets, which is another reason we must classify by role instead of collection membership. citeturn0search3turn1search8

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
5. ROADS / PATHS
6. Regional infrastructure
7. Static regional locations
8. REGION_PROPS

**Generic buildings are excluded from this pass.**

## Important rule

**REGION is about the role of an asset in the exterior world, not about its filename, visual style, or the fact that it could be placed near a building.**

A building tile is not automatically a REGION asset.

A static bridge is REGION.

A static dock is REGION.

A static ship used as scenery is REGION.

A controllable ship is PLAYABLE/VEHICLES.

A generic house/building kit remains in the building/architecture asset library until it is instantiated as part of a specific regional location.
