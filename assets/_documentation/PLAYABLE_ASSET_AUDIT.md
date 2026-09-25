# PLAYABLE Asset Audit

**Status:** STRUCTURE DEFINED / SOURCE AUDIT STARTED / BINARY VERIFICATION PENDING

## Scope

PLAYABLE contains the **actual exterior map content used to build and populate playable locations**, plus gameplay-active objects and vehicles.

The category is based on the asset's role on the playable map. A building or wall can therefore belong to PLAYABLE even when it is visually static and has no direct interaction.

## Canonical map-role structure

03_PLAYABLE
├── 01_BUILDINGS
├── 02_ARCHITECTURE
├── 03_INTERACTABLES
├── 04_RESOURCE_NODES
├── 05_CRAFTING_STATIONS
├── 06_COMBAT_INTERACTABLES
├── 07_GAMEPLAY_PROPS
└── 08_VEHICLES

## BUILDINGS

01_BUILDINGS is for complete or recognizable medieval-fantasy exterior buildings placed on the playable map.

Examples:
- Houses
- House exteriors
- Taverns / bars
- Inns
- Shops
- Blacksmith buildings
- Bakeries
- Stables
- Barns
- Workshops
- Warehouses
- Churches / temples
- Guild buildings
- Other settlement buildings

A building does not need to be enterable or interactive to qualify. It is a PLAYABLE map asset because it forms part of the actual exterior game space.

## ARCHITECTURE

02_ARCHITECTURE is for exterior construction pieces used to assemble playable buildings and fortified locations.

Examples:
- House exterior walls
- Castle walls
- City walls
- Towers
- Gates
- Portcullises
- Exterior roofs
- Exterior windows and doors
- Arches
- Columns
- Balconies
- Chimneys
- Other medieval-fantasy exterior architectural pieces

Interior-only walls, floors, doors, furniture and construction pieces belong to INTERIOR.

## REGION vs PLAYABLE

REGION and PLAYABLE have different roles:

- REGION describes the **regional/location context** such as village, town, city, castle, farm, camp, road, bridge, dock, port and ship location.
- PLAYABLE contains the **actual exterior map assets** used to construct and populate those locations, including houses, taverns, castle walls, city walls, gates and exterior architecture.
- Therefore a TOWN can be a REGION location classification while its houses and walls are PLAYABLE assets.
- A CASTLE can be a REGION location classification while its castle buildings, walls, towers and gates are PLAYABLE assets.
- A village can be a REGION location classification while its houses, taverns, barns and exterior props are PLAYABLE assets.

This avoids forcing the same binary asset to be duplicated between REGION and PLAYABLE. REGION describes where/what the location is; PLAYABLE describes the concrete map content used to build it.

## Gameplay boundary

Gameplay behavior is layered on top of PLAYABLE map content.

| Asset | Map role | Gameplay role |
|---|---|---|
| House exterior | PLAYABLE/01_BUILDINGS | Optional enter/use binding |
| Tavern / bar exterior | PLAYABLE/01_BUILDINGS | Optional enter/use binding |
| Castle wall | PLAYABLE/02_ARCHITECTURE | Optional defense/access binding |
| City wall / gate | PLAYABLE/02_ARCHITECTURE | Optional gate/access binding |
| Exterior door | PLAYABLE/02_ARCHITECTURE | PLAYABLE/03_INTERACTABLES when usable |
| Decorative barrel/crate | PLAYABLE/07_GAMEPLAY_PROPS | None or decorative |
| Lootable/usable barrel/crate | PLAYABLE/07_GAMEPLAY_PROPS | Interactive |
| Decorative sign | PLAYABLE/07_GAMEPLAY_PROPS | None or decorative |
| Readable/interactable sign | PLAYABLE/07_GAMEPLAY_PROPS | PLAYABLE/03_INTERACTABLES |
| Decorative well/fountain | PLAYABLE/07_GAMEPLAY_PROPS | None or decorative |
| Usable well/fountain | PLAYABLE/07_GAMEPLAY_PROPS | PLAYABLE/03_INTERACTABLES |
| Decorative cannon/ballista/catapult | PLAYABLE/07_GAMEPLAY_PROPS | None or decorative |
| Usable cannon/ballista/catapult | PLAYABLE/07_GAMEPLAY_PROPS | PLAYABLE/06_COMBAT_INTERACTABLES |
| Mine-cart track | REGION location infrastructure | Not necessarily PLAYABLE |
| Controllable mine cart | PLAYABLE/08_VEHICLES | Vehicle gameplay |
| Static ship/boat | REGION location/context | Not necessarily PLAYABLE |
| Controllable ship/boat | PLAYABLE/08_VEHICLES | Vehicle gameplay |
| Harvestable tree/resource node | PLAYABLE/04_RESOURCE_NODES | Resource gameplay |
| Crafting forge/workbench/anvil | PLAYABLE/05_CRAFTING_STATIONS | Crafting gameplay |

## Canonical storage rule

PLAYABLE is a **map-role classification**, not a duplicate binary library.

Examples:
- A house tileset may remain in assets/objects/ while receiving a PLAYABLE/01_BUILDINGS binding.
- Castle wall tiles may remain in the canonical object/source library while receiving a PLAYABLE/02_ARCHITECTURE binding.
- A usable weapon remains in assets/weapons/ and receives a PLAYABLE gameplay binding.
- A controllable ship remains in assets/vehicles/ and receives a PLAYABLE/08_VEHICLES binding.
- A crafting station may remain in assets/objects/ while its gameplay role is recorded as PLAYABLE/05_CRAFTING_STATIONS.
- An inventory item remains in assets/inventory/; it is not copied into PLAYABLE merely because the player can obtain it.

## Medieval-fantasy filter

Vandrith uses a medieval-fantasy visual and technological baseline.

### Allowed

- Medieval/fantasy houses and exterior buildings
- Taverns, inns, shops and workshops
- Castle and city walls
- Towers, gates and fortifications
- Medieval/fantasy exterior doors, windows and roofs
- Carts and wagons
- Medieval ships/boats when part of playable gameplay
- Forges, anvils, crafting stations and workshops
- Harvestable resource nodes
- Medieval traps and usable siege equipment
- Fantasy/magical interactables that fit the setting

### Excluded

- Modern houses, apartments and villas
- Skyscrapers
- Modern asphalt-city infrastructure
- Modern cars, buses, motorcycles and trucks
- Modern industrial machinery
- Modern firearms or contemporary weapon systems
- Modern vending/utility machines
- Contemporary infrastructure
- Cruise ships and container ships
- Sci-fi/futuristic buildings, vehicles and interactables

## Source-audit principle

OpenGameArt contains clear examples of the type of medieval-fantasy exterior/building assets this category needs, including houses, windows/doors, walls, roofs, city-outside tiles, taverns, castles and stone home exteriors. These are source candidates only; they do not prove that a Vendrith repository binary came from any particular source. citeturn0search0turn0search6

For example, the LPC Castle Mega-Pack has explicit CC-BY-SA 3.0 attribution requirements and identifies several underlying contributors and source works, demonstrating why provenance must be preserved at asset level. citeturn0search1

## Verification rule

A PLAYABLE asset can become 🟢 verified only when all of these can be reconciled:

1. Repository path and filename
2. Actual binary content
3. Source package/page
4. Creator
5. License
6. Attribution/conditions
7. SHA-256 checksum

Classification without binary provenance remains ⚠️ pending.

## Current status

- PLAYABLE role structure: corrected and expanded
- Buildings category: defined
- Architecture category: defined
- REGION vs PLAYABLE boundary: defined
- Static vs gameplay boundary: defined
- Medieval-fantasy filter: defined
- Repository binary verification: pending
- No asset is promoted to 🟢 solely from a source-page match

## Next audit order

1. BUILDINGS
2. ARCHITECTURE
3. INTERACTABLES
4. RESOURCE NODES
5. CRAFTING STATIONS
6. COMBAT INTERACTABLES
7. GAMEPLAY PROPS
8. VEHICLES

Each group will be checked against the existing canonical asset libraries before any new binary folder is created.
