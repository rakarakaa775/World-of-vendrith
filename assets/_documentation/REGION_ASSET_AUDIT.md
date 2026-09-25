# REGION Asset Audit

Status: **STRUCTURE DEFINED / REGION-ONLY PROVENANCE AUDIT IN PROGRESS**

## Purpose

REGION is the map-role layer for **exterior regional geography and locations**. This audit is intentionally limited to assets whose role is a REGION element.

**Important scope rule: REGION is not the generic Building/Architecture library.**

For this audit, standalone buildings, house kits, interior/building construction pieces, furniture, roofs, walls, doors/windows, and other generic building assets are **not promoted simply because they can appear in a region**. They stay in their canonical asset storage/category unless a future map-placement record explicitly identifies them as part of a REGION location.

The current audit starts with:
- Roads
- Paths
- Bridges
- Docks
- Ports
- Static ships/boats
- Regional infrastructure
- Static exterior regional locations
- Region props

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

The primary question is also whether the asset is directly usable by the player.

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

A visual duplicate may legitimately exist in both categories when one version is scenery and another is interactive.

## Source candidates verified for REGION research

The following are **source candidates**, not binary-approved assets. A source page alone does not prove that a repository binary came from that source.

### Bridges

| Source candidate | REGION category | Source evidence | License / credit | Binary status |
|---|---|---|---|---|
| LPC Wooden Bridge Rework | 03_BRIDGES | OpenGameArt source identified | CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0; credit Xenodora | ⚠️ binary not individually verified |
| Stone Bridge tiles 32x32 | 03_BRIDGES | OpenGameArt source identified | CC-BY 3.0; attribution: Tuomo Untinen | ⚠️ binary not individually verified |
| LPC style wood bridges and steel flooring | 03_BRIDGES | OpenGameArt collection/source identified | Source-specific attribution must be retained | ⚠️ binary not individually verified |

### Docks / Ports

| Source candidate | REGION category | Source evidence | License / credit | Binary status |
|---|---|---|---|---|
| Dock tileset | 04_DOCKS | OpenGameArt LPC collections identify the source | Must verify source page/package before approval | ⚠️ binary not individually verified |

### Ships

| Source candidate | REGION category | Source evidence | License / credit | Binary status |
|---|---|---|---|---|
| LPC Wooden ship tiles | 06_SHIPS when used as static scenery | OpenGameArt LPC collections identify the source | Must verify exact source page/package before approval | ⚠️ binary not individually verified |
| LPC Ship | 06_SHIPS when used as static scenery | OpenGameArt LPC collections identify the source | Must verify exact source page/package before approval | ⚠️ binary not individually verified |
| LPC Misc tile atlas — boat/bridge elements | 06_SHIPS / 03_BRIDGES depending element | OpenGameArt source identifies derivative work | CC-BY-SA 3.0 / GPL 3.0; derivative attribution includes Sharm, Janna, Tuomo Untinen, Casper Nilsson, Barbara Rivera and Daneeklu | ⚠️ binary not individually verified |

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

1. BRIDGES
2. DOCKS
3. PORTS
4. SHIPS
5. ROADS / PATHS
6. Regional infrastructure
7. Static regional locations
8. REGION_PROPS

Generic buildings are excluded from this pass.

## Important rule

**REGION is about the role of an asset in the exterior world, not about its filename, visual style, or the fact that it could be placed near a building.**

A building tile is not automatically a REGION asset.

A static bridge is REGION.

A static dock is REGION.

A static ship used as scenery is REGION.

A controllable ship is PLAYABLE/VEHICLES.

A generic house/building kit remains in the building/architecture asset library until it is instantiated as part of a specific regional location.
