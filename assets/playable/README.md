# PLAYABLE Assets

PLAYABLE is the map-role layer for the **actual exterior gameplay map content** placed on Playable Maps.

This includes buildings and architecture that form the playable settlement/castle/town space, as well as gameplay-active objects. A PLAYABLE asset is therefore defined by its role on the playable map, not only by whether it is mechanically interactive.

## Boundary

- Natural macro terrain → WORLD.
- Regional geographic/location classification → REGION.
- Actual exterior map content such as houses, taverns, shops, castle walls, city walls and exterior architecture → PLAYABLE.
- Interior-only environment → INTERIOR.
- Living entities → LIFE_GENERATION.
- Generic source libraries remain in their canonical storage folders.
- PLAYABLE is a map-role classification; it does not require duplicating binaries already stored under objects/, vehicles/, weapons/, inventory/, effects/, or other canonical libraries.

## Canonical PLAYABLE role groups

03_PLAYABLE
├── 01_BUILDINGS
├── 02_ARCHITECTURE
├── 03_INTERACTABLES
├── 04_RESOURCE_NODES
├── 05_CRAFTING_STATIONS
├── 06_COMBAT_INTERACTABLES
├── 07_GAMEPLAY_PROPS
└── 08_VEHICLES

### 01_BUILDINGS

Complete or recognizable exterior buildings used on the playable map:

- Houses
- Taverns / bars
- Inns
- Shops
- Blacksmiths
- Bakeries
- Stables
- Barns
- Workshops
- Warehouses
- Churches / temples
- Guild buildings
- Other medieval-fantasy settlement buildings

### 02_ARCHITECTURE

Exterior construction pieces used to build playable locations:

- House exterior walls
- Castle walls
- City walls
- Towers
- Gates
- Portcullises
- Roofs
- Exterior windows and doors
- Arches
- Columns
- Balconies
- Chimneys
- Other medieval-fantasy exterior architectural pieces

Interior-only versions belong to INTERIOR.

## Static vs gameplay examples

| Asset | PLAYABLE map role | Gameplay role |
|---|---|---|
| House exterior | 01_BUILDINGS | Optional enter/use binding |
| Tavern / bar exterior | 01_BUILDINGS | Optional enter/use binding |
| Castle wall | 02_ARCHITECTURE | Optional gate/defense binding |
| City wall / gate | 02_ARCHITECTURE | Optional gate/access binding |
| Exterior door | 02_ARCHITECTURE | 03_INTERACTABLES when usable |
| Barrel | 07_GAMEPLAY_PROPS | Lootable/usable when enabled |
| Sign | 07_GAMEPLAY_PROPS | 03_INTERACTABLES when readable/interactable |
| Well/fountain | 07_GAMEPLAY_PROPS | 03_INTERACTABLES when usable |
| Cannon/ballista/catapult | 07_GAMEPLAY_PROPS | 06_COMBAT_INTERACTABLES when usable |
| Mine cart | — | 08_VEHICLES when controllable |
| Ship/boat | — | 08_VEHICLES when controllable |
| Resource node | — | 04_RESOURCE_NODES when harvestable |
| Crafting station | — | 05_CRAFTING_STATIONS when usable |

A building does **not** have to be mechanically interactive to belong to PLAYABLE. Its presence as actual exterior map architecture is enough. Gameplay behavior is a separate binding layered on top.

## Canonical storage rule

PLAYABLE is a **map-role classification**, not a duplicate binary library.

Examples:
- A house tileset may remain in assets/objects/ while receiving a PLAYABLE/01_BUILDINGS binding.
- Castle wall tiles may remain in the canonical object/source library while receiving a PLAYABLE/02_ARCHITECTURE binding.
- A usable weapon remains in assets/weapons/ and receives a PLAYABLE gameplay binding.
- A controllable ship remains in assets/vehicles/ and receives a PLAYABLE/08_VEHICLES binding.
- A crafting station may remain in assets/objects/ while its gameplay role is recorded as PLAYABLE/05_CRAFTING_STATIONS.
- An inventory item remains in assets/inventory/; it is not copied into PLAYABLE merely because the player can obtain it.

## Medieval-fantasy rule

PLAYABLE follows the Vandrith **MEDIEVAL FANTASY ONLY** baseline.

Allowed: medieval/fantasy buildings, taverns, houses, castles, walls, gates, shops, workshops, carts, boats, crafting stations, resource nodes, traps, siege equipment and magical gameplay objects that fit the setting.

Excluded by default: modern houses/apartments, skyscrapers, asphalt-city infrastructure, modern cars, motorcycles, contemporary utility equipment, industrial machinery, cruise/container ships, and sci-fi/futuristic structures or gameplay objects.

## Provenance

Storage does not equal approval. Every candidate must retain source, creator, license, attribution/conditions and checksum evidence before it can become a verified repository asset.
