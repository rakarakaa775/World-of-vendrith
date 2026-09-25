# PLAYABLE Asset Audit

**Status:** STRUCTURE DEFINED / SOURCE AUDIT STARTED / BINARY VERIFICATION PENDING

## Scope

PLAYABLE contains exterior assets that are **actively usable by gameplay** on a Playable Map. The category is based on function, not appearance.

A decorative object remains REGION or its canonical asset library. An object becomes PLAYABLE when the player can meaningfully interact with, use, harvest, operate, enter/control, or otherwise trigger gameplay through it.

## Canonical map-role structure

03_PLAYABLE
├── 01_INTERACTABLES
├── 02_RESOURCE_NODES
├── 03_CRAFTING_STATIONS
├── 04_COMBAT_INTERACTABLES
├── 05_INTERACTABLES
├── 06_GAMEPLAY_PROPS
└── 07_VEHICLES

05_INTERACTABLES, 06_GAMEPLAY_PROPS, and 07_VEHICLES are already established by the REGION static/gameplay boundary. The first four groups are logical role buckets and should not be turned into duplicate physical asset libraries without evidence that the source library needs them.

## Canonical storage rule

PLAYABLE is a **map-role classification**, not a duplicate binary library.

Examples:
- A usable weapon remains in assets/weapons/ and receives a PLAYABLE gameplay binding.
- A controllable ship remains in assets/vehicles/ and receives a PLAYABLE/07_VEHICLES binding.
- A lootable barrel remains in assets/objects/ and receives a PLAYABLE/06_GAMEPLAY_PROPS binding.
- A crafting station may remain in assets/objects/ while its gameplay role is recorded as PLAYABLE/03_CRAFTING_STATIONS.
- An inventory item remains in assets/inventory/; it is not copied into PLAYABLE merely because the player can obtain it.

## Static/gameplay boundary

| Source asset | Classification |
|---|---|
| Decorative barrel/crate | REGION/15_REGION_PROPS or canonical object library |
| Lootable/usable barrel/crate | PLAYABLE/06_GAMEPLAY_PROPS |
| Decorative sign | REGION/15_REGION_PROPS |
| Readable/interactable sign | PLAYABLE/05_INTERACTABLES |
| Decorative well/fountain | REGION/15_REGION_PROPS |
| Usable well/fountain | PLAYABLE/05_INTERACTABLES |
| Decorative cannon/ballista/catapult | REGION/15_REGION_PROPS |
| Usable cannon/ballista/catapult | PLAYABLE/04_COMBAT_INTERACTABLES |
| Mine-cart track | REGION/01_ROADS or 02_PATHS |
| Controllable mine cart | PLAYABLE/07_VEHICLES |
| Static ship/boat | REGION/06_SHIPS |
| Controllable ship/boat | PLAYABLE/07_VEHICLES |
| Harvestable tree/resource node | PLAYABLE/02_RESOURCE_NODES when gameplay-enabled |
| Crafting forge/workbench/anvil | PLAYABLE/03_CRAFTING_STATIONS when usable |
| Decorative campfire | REGION/15_REGION_PROPS or effects |
| Usable campfire | PLAYABLE/03_CRAFTING_STATIONS or 05_INTERACTABLES according to gameplay behavior |

## Medieval-fantasy filter

Vandrith uses a medieval-fantasy visual and technological baseline.

### Allowed

- Medieval/fantasy interactive props
- Carts and wagons
- Medieval ships/boats when controllable
- Forges, anvils, crafting stations and workshops
- Harvestable resource nodes
- Medieval traps and usable siege equipment
- Wells, doors, gates, switches and levers
- Chests, containers and lootable props
- Fantasy/magical interactables that fit the setting

### Excluded

- Modern cars, buses, motorcycles and trucks
- Modern industrial machinery
- Modern firearms or contemporary weapon systems
- Modern vending/utility machines
- Contemporary infrastructure
- Sci-fi/futuristic vehicles and interactables
- Modern industrial control equipment

## Initial source candidates

OpenGameArt contains medieval/fantasy prop sources that can be useful for candidate matching. For example, Medieval Props Pack by System G6 is listed as CC0 and contains props including chests, campfires, carts, crates, barrels and similar objects. This is source evidence only; it does not prove that a Vendrith repository binary came from that package. citeturn0search1

The isometric medieval props pack by rubberduck is also listed as CC0 and includes medieval RPG props such as barrels, crates, boxes, wagons, wells and containers. Again, this is a source candidate, not a repository binary match. citeturn0search3

OpenGameArt's FAQ confirms that license compliance and attribution requirements must be followed for each source; source-page discovery alone is not sufficient for project approval. citeturn0search11

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

- PLAYABLE role structure: defined
- Static vs gameplay boundary: defined
- Medieval-fantasy filter: defined
- Initial source candidates: identified
- Repository binary verification: pending
- No asset is promoted to 🟢 solely from a source-page match

## Next audit order

1. INTERACTABLES
2. RESOURCE NODES
3. CRAFTING STATIONS
4. COMBAT INTERACTABLES
5. GAMEPLAY PROPS
6. VEHICLES

Each group will be checked against the existing canonical asset libraries before any new binary folder is created.
