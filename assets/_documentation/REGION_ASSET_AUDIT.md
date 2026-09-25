# REGION Asset Audit

Status: **STRUCTURE DEFINED / PROVENANCE AUDIT PENDING BINARY VERIFICATION**

## Purpose

REGION contains the physical, exterior, man-made geography and static locations that define a region of Vandrith World.

REGION is not the place for natural terrain, living entities, or gameplay-interactive assets.

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

## Classification rule

The primary question is **what the asset represents in the world and whether the player can use it**.

### REGION

Use REGION when an asset is a static exterior structure/location that forms the physical environment of a region.

- Roads
- Paths
- Bridges
- Docks
- Ports
- Static ships/boats used as scenery
- Villages
- Towns
- Cities
- Castles
- Fortifications
- Ruins
- Farms as static locations
- Camps as static locations
- Decorative regional props

### PLAYABLE

Move an asset to PLAYABLE when it has direct gameplay interaction or use.

Examples:

| Asset | Static/scenery | Interactive/gameplay |
|---|---|---|
| Ship | REGION/06_SHIPS | PLAYABLE/07_VEHICLES |
| Cannon | REGION/15_REGION_PROPS | PLAYABLE |
| Ballista | REGION/15_REGION_PROPS | PLAYABLE |
| Catapult | REGION/15_REGION_PROPS | PLAYABLE |
| Mine-cart track | REGION/01_ROADS or 02_PATHS | — |
| Mine cart | — | PLAYABLE/07_VEHICLES |
| Barrel | REGION/15_REGION_PROPS | PLAYABLE/06_GAMEPLAY_PROPS |
| Sign | REGION/15_REGION_PROPS | PLAYABLE/05_INTERACTABLES |
| Well/fountain | REGION/15_REGION_PROPS | PLAYABLE/05_INTERACTABLES |
| Camp object | REGION/14_CAMPS | PLAYABLE when usable |
| Farm object | REGION/13_FARMS | PLAYABLE when harvestable/usable |

A visual duplicate may legitimately exist in both categories when one version is scenery and another is interactive.

## Boundary with WORLD

WORLD is natural environment only.

Move these to REGION:
- Bridges
- Docks
- Ports
- Ships
- Roads
- Villages
- Towns
- Cities
- Castles
- Fortifications
- Ruins
- Farms
- Camps
- Other man-made structures

Keep these in WORLD:
- Ground
- Water
- Mountains
- Hills
- Cliffs
- Natural rock formations
- Forest
- Jungle
- Desert
- Swamp
- Snow/ice biomes

## Boundary with LIFE_GENERATION

People, animals, monsters, NPCs, enemies and other living entities are not REGION assets. Their generation belongs to LIFE_GENERATION and SPAWN_LIFE.

A village or town building remains REGION; the villagers themselves are LIFE_GENERATION.

## Boundary with INTERIOR

REGION stores the exterior location/structure.

INTERIOR stores the inside environment:
- Interior floors
- Interior walls
- Ceilings
- Furniture
- Interior lighting
- Kitchens
- Shops
- Taverns
- Castles/dungeons interiors

A castle exterior belongs REGION/10_CASTLES; its interior belongs INTERIOR/12_CASTLE.

## Boundary with vehicles and weapons

The repository already separates vehicle and weapon asset storage. Vehicle documentation explicitly includes carts and ships, while weapon documentation covers weapons, shields and weapon-related sprites. Therefore REGION may reference static scenery variants, but reusable/controllable vehicle and weapon assets remain in their dedicated gameplay asset systems.

## Current repository evidence

The current World-of-vendrith repository has dedicated top-level storage for:
- `assets/objects` — general world props, buildings, furniture, structures and interactable object visuals.
- `assets/vehicles` — carts, ships and other approved vehicle visuals.
- `assets/weapons` — weapons, shields and weapon-related sprites; license/attribution records are mandatory.
- `assets/environment` — terrain, vegetation, water, structures, climate/environment and world scenery.

The REGION audit therefore acts as the **map-role classification layer**. It does not duplicate binaries merely to create a second copy of an asset. The same source asset should have one canonical storage location where possible, with map-role metadata/reference indicating that it is valid for REGION.

## Provenance status

No binary asset is promoted to a verified license/credit status solely because its filename or visual appearance resembles a known source.

For each candidate asset, verification should record:
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

## Audit workflow

1. Inventory candidate exterior/man-made assets.
2. Classify by REGION category.
3. Check whether the asset is static or gameplay-interactive.
4. Cross-check source package, README and metadata.
5. Verify external source/license/credit where required.
6. Record exact binary identity when available.
7. Keep unresolved candidates pending.
8. Only then promote the asset into an approved map library.

## Important rule

**REGION is about the role of an asset in the exterior world, not about the asset's filename or visual style.**

A ship that cannot be controlled is scenery; a controllable ship is gameplay.

A barrel that only decorates a town is scenery; a lootable barrel is gameplay.

A sign that is purely decorative is scenery; a readable/interactable sign is gameplay.
