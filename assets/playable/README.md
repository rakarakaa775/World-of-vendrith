# PLAYABLE Assets

PLAYABLE is the map-role layer for **gameplay-active exterior assets** placed on Playable Maps.

A PLAYABLE asset is not defined by its visual appearance alone. It must have an actual gameplay/interactable role such as interaction, resource gathering, crafting, combat use, loot, or vehicle control.

## Boundary

- Natural macro terrain → WORLD.
- Static regional infrastructure and scenery → REGION.
- Interior environment → INTERIOR.
- Living entities → LIFE_GENERATION.
- Generic source libraries remain in their canonical storage folders.
- PLAYABLE is a map-role classification; it does not require duplicating binaries already stored under objects/, vehicles/, weapons/, inventory/, effects/, or other canonical libraries.

## Canonical PLAYABLE role groups

03_PLAYABLE
├── 01_INTERACTABLES
├── 02_RESOURCE_NODES
├── 03_CRAFTING_STATIONS
├── 04_COMBAT_INTERACTABLES
├── 05_INTERACTABLES
├── 06_GAMEPLAY_PROPS
└── 07_VEHICLES

The first four groups are logical gameplay-role groups and should only become physical storage folders when the asset library requires them. Existing canonical asset libraries remain the binary source of truth.

## Static vs gameplay examples

| Asset | Static role | PLAYABLE role |
|---|---|---|
| Barrel | REGION/15_REGION_PROPS | 06_GAMEPLAY_PROPS when lootable/usable |
| Sign | REGION/15_REGION_PROPS | 05_INTERACTABLES when readable/interactable |
| Well/fountain | REGION/15_REGION_PROPS | 05_INTERACTABLES when usable |
| Cannon/ballista/catapult | REGION/15_REGION_PROPS | 04_COMBAT_INTERACTABLES when usable |
| Mine cart | — | 07_VEHICLES |
| Ship/boat | REGION/06_SHIPS when scenery | 07_VEHICLES when controllable |
| Resource node | WORLD/region scenery when purely visual | 02_RESOURCE_NODES when harvestable |
| Crafting station | REGION/props when decorative | 03_CRAFTING_STATIONS when usable |

## Medieval-fantasy rule

PLAYABLE follows the Vandrith **MEDIEVAL FANTASY ONLY** baseline.

Allowed: medieval/fantasy interactables, carts, boats, crafting stations, resource nodes, traps, siege equipment and magical gameplay objects that fit the setting.

Excluded by default: modern cars, motorcycles, firearms-style modern machinery, industrial machines, modern vending/utility equipment, contemporary infrastructure, sci-fi/futuristic gameplay objects.

## Provenance

Storage does not equal approval. Every candidate must retain source, creator, license, attribution/conditions and checksum evidence before it can become a verified repository asset.
