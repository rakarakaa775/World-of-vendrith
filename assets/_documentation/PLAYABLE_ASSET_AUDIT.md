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


## BUILDINGS — initial source audit

The BUILDINGS role is now explicitly included in PLAYABLE. Current external source research confirms that medieval-fantasy building categories are broad enough to warrant their own role rather than being treated as generic props.

Relevant source candidates include:
- [LPC] Tavern — taverns, inns, bars, kitchens and breweries; CC-BY-SA 3.0. The source page also notes that its preview scenes can contain tiles from other submissions, so attribution must be checked from the package credits rather than inferred from the preview. 
- [LPC] Thatched-roof Cottage and [LPC] Adobe Town Set — listed in OpenGameArt's LPC collections as building-related sources.
- [LPC] Blacksmith, Woodshop, Tailor, Floors, Walls, Roofs, and Windows & Doors — listed together in the LPC Tiles collection and useful for constructing exterior building sets.
- [LPC] Revised Base Structure Kit — structural elements including floors, walls, doors, windows, roofs and arched castle doors; CC-BY-SA 3.0.
- OpenGameArt's medieval-building collections also list medieval houses, blacksmiths, stables, barracks, castles and other building types.

These are **source candidates only**. They do not establish that any binary currently stored in the Vendrith repository originated from them.

### BUILDINGS audit rule

For each candidate found in the repository, verify:

1. Complete/exterior building role
2. Medieval-fantasy compatibility
3. Repository path and filename
4. Actual binary content
5. Source package/page
6. Creator
7. License
8. Attribution/conditions
9. SHA-256 checksum

Interior-only building content is excluded from BUILDINGS and belongs to INTERIOR. Exterior construction pieces such as walls, roofs, gates and exterior doors are audited under ARCHITECTURE.

### Current BUILDINGS result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled


## ARCHITECTURE — initial source audit

02_ARCHITECTURE is reserved for **exterior construction elements** that build playable medieval-fantasy locations.

### Audit groups

| Group | Examples |
|---|---|
| Castle fortification | castle walls, merlons, towers, battlements |
| City fortification | city walls, gates, gatehouses, watchtowers |
| House exterior | exterior walls, foundations, roofs, chimneys |
| Openings | exterior doors, windows, arches |
| Structural detail | columns, balconies, buttresses, exterior stairs |
| Decorative architecture | pinnacles, facade details, exterior ornaments |

Current source research provides direct examples:
- **[LPC] Castle Mega-Pack** covers castle/tower/Gothic architecture, windows, churches/cathedrals and architectural features; its page states CC-BY-SA 3.0 and provides attribution to underlying contributors and source works. citeturn0search2turn0search7
- **[LPC] Windows & Doors** provides exterior windows and doors. Its current page lists CC-BY-SA 3.0 and GPL 3.0 and explicitly requires the information in its credits file to accompany distribution. citeturn0search8
- OpenGameArt's **LPC Tiles** collection lists Floors, Walls, Roofs, Windows & Doors, Medieval Village Decorations and Thatched-roof Cottage among the collected sources. citeturn0search0
- A separate CC0 **pixel art castle tileset** includes walls, stone/brick elements, pillars, doors/gates and windows, making it a possible source candidate where the style matches Vandrith. citeturn0search11

### Important provenance rule

The sources above are **reference/source candidates, not repository matches**. A source page, even one with exact-looking filenames or previews, does not prove that the same binary exists in Vendrith.

For each repository candidate we must reconcile:
1. Repository path and filename
2. Actual binary content
3. Source package/page
4. Creator/contributors
5. License
6. Attribution/conditions
7. SHA-256 checksum

### Architecture classification boundary

- Exterior castle/city/house wall → PLAYABLE/02_ARCHITECTURE
- Exterior gate/door/window → PLAYABLE/02_ARCHITECTURE
- Interior wall/floor/door/window construction → INTERIOR
- A complete house/tavern/castle building → PLAYABLE/01_BUILDINGS
- A decorative regional location marker/context → REGION
- A gameplay-enabled door/gate → PLAYABLE/02_ARCHITECTURE + PLAYABLE/03_INTERACTABLES binding
- A purely decorative architectural piece remains PLAYABLE/02_ARCHITECTURE; gameplay interaction is not required

### Current ARCHITECTURE result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled


## 03_INTERACTABLES — initial source audit

03_INTERACTABLES covers exterior map objects that the player can directly operate, activate, open, read, enter, toggle or otherwise interact with.

### Audit groups

| Group | Examples |
|---|---|
| Access | usable doors, gates, portcullises, entrance mechanisms |
| Containers | chests, crates, barrels and other loot/storage containers |
| World utilities | wells, fountains, switches, levers, handles |
| Information | readable signs, notice boards, interactive markers |
| World objects | usable furniture/props when interaction is a distinct gameplay action |
| Animated interaction | doors, gates and similar animated map mechanisms |

Source research confirms suitable medieval/fantasy candidates:
- OpenGameArt's LPC collections include **LPC Windows & Doors**, **LPC Animated Doors**, **LPC Animated Castle Doors**, **LPC Style Well**, **LPC Water Fountain**, containers and similar world-interaction assets. citeturn0search0turn0search8
- **[LPC] Windows & Doors** is CC-BY-SA 3.0 / GPL 3.0 and requires the complete attribution information from its credits file when distributing the images. citeturn0search9
- **[LPC] Containers** is CC-BY-SA 4.0 and includes chests, crates, barrels, sacks, baskets, pots and related containers. Its page explicitly warns that preview images contain assets from other submissions and those must be attributed separately. citeturn0search3
- OpenGameArt's fantasy/RPG collection also lists wells, treasure chests, animated castle doors, traps, training objects and other interaction-oriented assets. citeturn0search2

### Classification rule

An object receives the 03_INTERACTABLES role when interaction is part of its intended gameplay behavior.

Examples:
- Decorative door → PLAYABLE/02_ARCHITECTURE only
- Openable door → PLAYABLE/02_ARCHITECTURE + PLAYABLE/03_INTERACTABLES
- Decorative chest → PLAYABLE/07_GAMEPLAY_PROPS
- Lootable chest → PLAYABLE/07_GAMEPLAY_PROPS + PLAYABLE/03_INTERACTABLES
- Decorative well → PLAYABLE/07_GAMEPLAY_PROPS
- Usable well → PLAYABLE/07_GAMEPLAY_PROPS + PLAYABLE/03_INTERACTABLES
- Decorative sign → PLAYABLE/07_GAMEPLAY_PROPS
- Readable sign → PLAYABLE/07_GAMEPLAY_PROPS + PLAYABLE/03_INTERACTABLES
- Gate with gameplay access control → PLAYABLE/02_ARCHITECTURE + PLAYABLE/03_INTERACTABLES

03_INTERACTABLES is therefore a **gameplay-role binding**, not a reason to duplicate the underlying visual binary.

### Provenance rule

Source-page discovery does not promote a repository binary. Verification still requires repository path/filename, actual binary, source package/page, creator, license, attribution/conditions and SHA-256.

### Current INTERACTABLES result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled


## 04_RESOURCE_NODES — initial source audit

04_RESOURCE_NODES covers exterior world objects that exist as **gameplay resource sources**. The visual can remain in WORLD, OBJECTS or another canonical library; the PLAYABLE role records that the node is harvestable/minable/collectable.

### Audit groups

| Group | Examples |
|---|---|
| Forestry | harvestable trees, fruit trees, wood/log nodes |
| Mining | ore veins, mineral nodes, mineable rocks |
| Agriculture | harvestable crops, farm resource plants |
| Foraging | flowers, herbs, fungi, wild plants |
| Stone/material | quarry rocks, stone deposits, clay/mud resource nodes |
| Water/fishing | fishing spots or other resource-bearing water points when represented as map objects |

### Source evidence

OpenGameArt's LPC collections explicitly list resource-oriented sources such as **LPC Crops, LPC Fruit Trees, LPC Rocks, LPC Ore and Forge, and LPC Flowers / Plants / Fungi / Wood**. citeturn0search0turn0search2

**[LPC] Trees** is a dedicated outdoor tree collection under CC-BY-SA 3.0 and requires attribution of the authors listed in its credits file plus a link to the OpenGameArt page. citeturn0search1

The LPC ecosystem therefore provides clear source candidates for forests, fruit trees, rocks, crops, ore and harvestable plants. Source discovery remains separate from repository provenance verification.

### Classification rule

- Decorative tree → WORLD/07_FOREST or another natural WORLD biome role.
- Harvestable tree → WORLD natural asset + PLAYABLE/04_RESOURCE_NODES gameplay binding.
- Decorative rock → WORLD/06_NATURAL_ROCK_FORMATIONS.
- Mineable ore/rock → PLAYABLE/04_RESOURCE_NODES.
- Decorative crop/plant → WORLD/biome role.
- Harvestable crop/herb/plant → PLAYABLE/04_RESOURCE_NODES.
- Fruit tree → WORLD/biome role + PLAYABLE/04_RESOURCE_NODES when harvestable.
- Fishing/resource spot → PLAYABLE/04_RESOURCE_NODES when it has a defined resource gameplay function.

A resource node does **not** need to be moved physically out of WORLD. PLAYABLE records the gameplay role.

### Medieval-fantasy filter

Allowed:
- Trees and wood resources
- Fruit trees
- Crops and farm plants
- Herbs, flowers and fungi
- Stone and ore deposits
- Clay/mud material nodes
- Fantasy resource nodes consistent with Vandrith

Excluded by default:
- Modern industrial resource machines
- Oil pumps and modern extraction machinery
- Mining machinery as the resource itself
- Sci-fi/futuristic resource nodes

### Provenance rule

Source-page discovery does not promote a repository binary. Verification still requires repository path/filename, actual binary, source package/page, creator, license, attribution/conditions and SHA-256.

### Current RESOURCE NODES result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled


## 05_CRAFTING_STATIONS — initial source audit

05_CRAFTING_STATIONS covers exterior/playable-map stations that provide a defined crafting or processing function.

### Audit groups

| Group | Examples |
|---|---|
| Blacksmithing | forge, anvil, furnace, smelter, grindstone |
| Woodworking | workbench, saw/workbench, carpenter station |
| Tailoring | loom, sewing/tailoring station |
| Alchemy | alchemy table, cauldron, potion station |
| Cooking | cooking fire, hearth, kitchen cooking station |
| Farming/processing | mill, trough or other craft/processing station when player-operated |
| Enchanting/fantasy | enchanting altar or magical crafting station compatible with Vandrith |

OpenGameArt's LPC sources provide direct candidates: **[LPC] Blacksmith** includes forges, furnaces/smelters, anvils and blacksmith tools; **LPC Tiles** lists Blacksmith, Woodshop, Tailor, Alchemy and Ore and Forge; and the broader LPC collections include Meals and related food/crafting sources. citeturn0search0turn0search2turn0search5

The [LPC] Blacksmith source currently lists CC-BY 4.0, CC-BY 3.0, GPL 3.0, GPL 2.0 and OGA-BY 3.0, and its attribution notice identifies the creator and source page. Its preview also incorporates assets from other sources, which reinforces the rule that package credits must be inspected rather than inferred from a preview. citeturn0search0

### Classification rule

- Decorative forge/anvil → PLAYABLE/07_GAMEPLAY_PROPS or canonical object storage.
- Usable forge/anvil → PLAYABLE/05_CRAFTING_STATIONS.
- Decorative cooking fire → PLAYABLE/07_GAMEPLAY_PROPS or effects.
- Usable cooking station → PLAYABLE/05_CRAFTING_STATIONS.
- Decorative loom → PLAYABLE/07_GAMEPLAY_PROPS.
- Usable loom → PLAYABLE/05_CRAFTING_STATIONS.
- A complete blacksmith building → PLAYABLE/01_BUILDINGS; its forge/anvil can additionally receive the 05_CRAFTING_STATIONS gameplay binding.
- Interior-only crafting station → INTERIOR unless the same asset is intentionally used as an exterior playable station.

### Storage rule

The visual binary does not need to be copied into PLAYABLE. A crafting station can remain in assets/objects/ or another canonical library while PLAYABLE records its gameplay role.

### Medieval-fantasy filter

Allowed: forge, anvil, furnace, smelter, workbench, loom, tailoring station, alchemy table, cooking hearth/fire, mill, medieval processing stations and fantasy/magical crafting stations fitting the setting.

Excluded by default: modern factories, electric industrial workstations, contemporary appliances, modern laboratory equipment and sci-fi crafting machinery.

### Provenance rule

Source discovery does not promote a repository binary. Verification requires repository path/filename, actual binary, source package/page, creator, license, attribution/conditions and SHA-256.

### Current CRAFTING STATIONS result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled
