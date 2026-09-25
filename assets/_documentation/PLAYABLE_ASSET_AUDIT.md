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


## 06_COMBAT_INTERACTABLES — initial source audit

06_COMBAT_INTERACTABLES covers exterior/playable-map objects that the player can actively operate for combat or defense.

### Audit groups

| Group | Examples |
|---|---|
| Siege weapons | ballista, catapult, trebuchet, scorpion/bolt thrower |
| Defensive weapons | defensive cannon where appropriate to Vandrith's medieval-fantasy setting |
| Traps | spike traps, pressure traps, defensive traps |
| Training objects | training dummies or other combat-practice interactables |
| Mounted defenses | wall-mounted or emplacement-style weapons |
| Fantasy combat devices | magical defensive/combat devices consistent with the setting |

OpenGameArt has a direct **[LPC] Siege Weapons** source by bluecarrot16. It includes medieval-era catapults and ballistae, plus a cannon, with CC-BY 4.0, CC-BY 3.0, GPL 3.0, GPL 2.0 and OGA-BY 3.0 listed as licenses. The source also documents how its layered tiles are assembled and animated. citeturn0search0

The LPC collections independently list **Siege Weapons** among their collected assets, confirming it as a distinct medieval gameplay-art category. citeturn0search3turn0search5

### Classification rule

- Decorative ballista/catapult → PLAYABLE/07_GAMEPLAY_PROPS.
- Operable ballista/catapult → PLAYABLE/06_COMBAT_INTERACTABLES.
- Decorative trap → PLAYABLE/07_GAMEPLAY_PROPS.
- Active/triggerable trap → PLAYABLE/06_COMBAT_INTERACTABLES.
- Training dummy → PLAYABLE/06_COMBAT_INTERACTABLES when it has a training function.
- Castle wall itself → PLAYABLE/02_ARCHITECTURE.
- Weapon mounted on castle wall → PLAYABLE/06_COMBAT_INTERACTABLES.
- A normal handheld weapon → assets/weapons/ with its gameplay binding; it is not duplicated into this category.

### Medieval-fantasy filter

Allowed:
- Ballistae
- Catapults
- Trebuchets
- Scorpions / bolt throwers
- Medieval defensive weapons
- Traps
- Training dummies
- Fantasy/magical defensive devices

Conditional:
- Cannon/artillery can be considered only where it fits Vandrith's intended medieval-fantasy technology baseline and visual language.

Excluded by default:
- Modern firearms
- Machine guns
- Modern turrets
- Explosive contemporary weapon systems
- Sci-fi weapons
- Futuristic automated defenses

### Provenance rule

Source discovery does not promote a repository binary. Verification requires repository path/filename, actual binary, source package/page, creator, license, attribution/conditions and SHA-256.

### Current COMBAT INTERACTABLES result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled


## 07_GAMEPLAY_PROPS — initial source audit

07_GAMEPLAY_PROPS covers **exterior/playable-map props that populate the actual game space but do not require their own specialized gameplay category**. The visual can be purely decorative, or it can receive an additional gameplay-role binding when the object becomes usable/interactable.

### Audit groups

| Group | Examples |
|---|---|
| Containers | barrels, crates, boxes, chests, sacks, baskets, tubs |
| Signs & markers | signposts, hanging signs, notice boards, readable markers |
| Water/utility props | wells, fountains, troughs, buckets |
| Fire/light props | campfires, braziers, exterior fireplaces, torches |
| Settlement props | benches, tables, stools, market props, carts used as static props |
| Farm props | scarecrows, hay/straw props, troughs and farm decoration |
| Decorative props | pots, jars, barrels, piles, tools and other exterior dressing |
| Memorial/landmark props | graves, tombstones, statues and similar exterior markers when used as map dressing |

### Source evidence

OpenGameArt provides strong medieval-fantasy/LPC source candidates for this category:

- **[LPC] Containers** includes boxes, crates, barrels, tubs, sacks, bags, chests, baskets, pots, jars and related glassware. Its current source page lists **CC-BY-SA 4.0** and requires the information in its credits file. The page also explicitly warns that some preview elements come from other submissions and must be attributed separately. citeturn0search0
- OpenGameArt's LPC RPG collection lists **LPC Style Well**, **[LPC] Signposts, graves, line cloths and scare crow**, **[LPC] Hanging signs**, **[LPC] Medieval Village Decorations** and other directly relevant exterior-prop sources. citeturn0search14
- The current LPC collection **Nearly all the LPC assets in one place** also lists **LPC Fireplace**, **[LPC] Signposts, graves, line cloths and scare crow**, **[LPC] Hanging signs**, **LPC Sign Post** and **[LPC] Medieval Village Decorations**. The collection warns that automatically generated credits are not guaranteed to be accurate, so attribution still has to be checked against each original source. citeturn0search12
- An LPC-compatible RPG collection lists **Camp Fire Animation for RPGs**, **[LPC] Water Fountain** and **LPC Sign Post**, providing additional source candidates for fire, water and signage props. citeturn0search13
- A 2026 OpenGameArt medieval-dark-fantasy collection groups medieval containers, covered wells, treasure chests, fountains and medieval props together, confirming these as common medieval-fantasy environmental prop roles. This is a source-discovery reference, not proof of Vendrith provenance. citeturn0search2

### Classification rule

07_GAMEPLAY_PROPS is the **default exterior prop role** when an object does not belong to a more specific PLAYABLE gameplay category.

Examples:

- Decorative barrel/crate → PLAYABLE/07_GAMEPLAY_PROPS.
- Lootable/openable barrel/crate/chest → PLAYABLE/07_GAMEPLAY_PROPS + PLAYABLE/03_INTERACTABLES.
- Decorative sign → PLAYABLE/07_GAMEPLAY_PROPS.
- Readable/interactive sign → PLAYABLE/07_GAMEPLAY_PROPS + PLAYABLE/03_INTERACTABLES.
- Decorative well/fountain → PLAYABLE/07_GAMEPLAY_PROPS.
- Usable well/fountain → PLAYABLE/07_GAMEPLAY_PROPS + PLAYABLE/03_INTERACTABLES.
- Decorative campfire/brazier → PLAYABLE/07_GAMEPLAY_PROPS and/or canonical effects storage.
- Usable cooking fire → PLAYABLE/05_CRAFTING_STATIONS.
- Decorative forge/anvil → PLAYABLE/07_GAMEPLAY_PROPS.
- Usable forge/anvil → PLAYABLE/05_CRAFTING_STATIONS.
- Decorative ballista/catapult → PLAYABLE/07_GAMEPLAY_PROPS.
- Operable ballista/catapult → PLAYABLE/06_COMBAT_INTERACTABLES.
- Decorative tree/rock → WORLD, not PLAYABLE/07_GAMEPLAY_PROPS.
- Harvestable tree/resource node → WORLD + PLAYABLE/04_RESOURCE_NODES.
- Complete house/tavern/building → PLAYABLE/01_BUILDINGS.
- Exterior wall/roof/gate/door architecture → PLAYABLE/02_ARCHITECTURE.
- Static regional road/bridge/dock/port context → REGION.
- Interior-only props → INTERIOR.

### REGION vs PLAYABLE boundary for props

The deciding question is **what the asset represents in the map**:

- REGION = the regional/location context or infrastructure classification.
- PLAYABLE = the concrete exterior visual prop used to populate the playable map.
- Therefore a market/town can be a REGION context while its barrels, signs, benches, stalls and decorative props are PLAYABLE.
- A dock can be REGION context while a barrel or crate placed on the playable dock is PLAYABLE.
- A farm can be REGION context while its scarecrow, trough, hay props and usable farming objects are PLAYABLE.
- A cemetery can be REGION context while individual graves/statues/markers used to populate the playable exterior are PLAYABLE.

### Medieval-fantasy filter

Allowed:

- Wooden barrels, crates, chests and sacks
- Medieval/fantasy signs and hanging signs
- Wells, fountains and water troughs
- Campfires, braziers and exterior fireplaces
- Benches, tables, stools and market props
- Farm props such as scarecrows and hay/straw objects
- Graves, tombstones and medieval/fantasy memorial props
- Pots, jars, baskets and other period-appropriate containers
- Fantasy/magical props consistent with Vandrith

Excluded by default:

- Modern plastic bins and contemporary waste containers
- Modern street signs and traffic signage
- Modern benches/street furniture
- Electrical utility boxes and modern infrastructure props
- Vending machines and contemporary appliances
- Modern industrial containers/equipment
- Sci-fi/futuristic props
- Contemporary urban decoration

### Storage rule

07_GAMEPLAY_PROPS is a **map-role classification**, not a duplicate asset library.

Examples:

- A container can remain in `assets/objects/` and receive a PLAYABLE/07_GAMEPLAY_PROPS binding.
- A fire visual can remain in `assets/effects/` while its exterior map placement is recorded as PLAYABLE/07_GAMEPLAY_PROPS.
- A sign asset can remain in the canonical object/source library and receive the PLAYABLE role.
- An inventory item inside a chest remains in `assets/inventory/`; the chest itself is the PLAYABLE prop.
- A weapon placed as a decorative exterior prop remains in `assets/weapons/` if that is its canonical source, with a map-role binding rather than a duplicate binary.

### Provenance rule

The source pages above establish **source candidates and licensing/attribution requirements**, not repository provenance.

A repository asset can become 🟢 verified only when the following are reconciled:

1. Repository path and filename
2. Actual binary content
3. Source package/page
4. Creator/contributors
5. License
6. Attribution/conditions
7. SHA-256 checksum

In particular, the [LPC] Containers page demonstrates why a filename or visual resemblance is insufficient: the package contains contributions from multiple artists and explicitly requires the complete credits information. citeturn0search0

### Current GAMEPLAY PROPS result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled

### Audit conclusion

07_GAMEPLAY_PROPS is now defined as the **general exterior dressing and prop layer** for playable locations. Specialized gameplay behavior is layered on top rather than creating duplicate visual assets:

- interaction → + PLAYABLE/03_INTERACTABLES
- resource harvesting → + PLAYABLE/04_RESOURCE_NODES
- crafting → + PLAYABLE/05_CRAFTING_STATIONS
- combat operation → + PLAYABLE/06_COMBAT_INTERACTABLES
- vehicle control → PLAYABLE/08_VEHICLES

This keeps the PLAYABLE architecture role-based and prevents unnecessary binary duplication.



## 08_VEHICLES — initial source audit

08_VEHICLES covers **vehicles that are part of actual playable exterior gameplay**: the player can control, ride, drive, steer, mount, or otherwise use the vehicle as a gameplay vehicle.

The visual binary remains in its canonical library, normally `assets/vehicles/`; PLAYABLE records the map/gameplay role and does not require a duplicate copy.

### Audit groups

| Group | Examples | PLAYABLE treatment |
|---|---|---|
| Land transport | carts, wagons, horse carts, carriages | PLAYABLE/08_VEHICLES when controllable/rideable |
| Mine transport | mine carts | PLAYABLE/08_VEHICLES when controllable/rideable |
| Water transport | rowboats, canoes, rafts, sailing boats | PLAYABLE/08_VEHICLES when controllable/rideable |
| Ships | medieval/fantasy ships, sailing vessels | PLAYABLE/08_VEHICLES when controllable/rideable |
| Mounted transport | horse/cart combinations or other fantasy mounts represented as vehicles | PLAYABLE/08_VEHICLES when the vehicle role is controllable |
| Fantasy transport | setting-compatible magical vehicles | PLAYABLE/08_VEHICLES when actually playable |

### Important REGION boundary

A vehicle visual is **not automatically PLAYABLE** merely because it appears on the exterior map.

- Static wagon parked in a town → REGION/settlement context or PLAYABLE/07_GAMEPLAY_PROPS depending on how it is used as map dressing.
- Static ship tied to a dock → REGION/port/ship context when it is only regional scenery.
- Controllable wagon/cart → PLAYABLE/08_VEHICLES.
- Controllable boat/ship → PLAYABLE/08_VEHICLES.
- Controllable mine cart → PLAYABLE/08_VEHICLES.
- Vehicle prop that is only decorative → not promoted to 08_VEHICLES.
- A vehicle that is both scenery and controllable may have both regional context and PLAYABLE vehicle binding without duplicating the binary.

This keeps REGION focused on **where/what the location is** while PLAYABLE records the actual gameplay role.

### Source evidence

OpenGameArt provides direct medieval/fantasy vehicle source candidates:

- **LPC Mine Carts and Tracks** by Xenodora contains mine-cart graphics and track assets. Its page lists **CC-BY-SA 3.0, GPL 3.0 and GPL 2.0**, and specifically instructs users to credit Xenodora. citeturn0search0turn0search3
- **16x16 fantasy pixel art vehicles** contains a canoe, ship, airship, cart, buggy, covered wagon, horse and donkey. It lists **CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0 and GPL 2.0**, and explicitly requires a link to OpenGameArt and credit to DualR. This is a broader fantasy source candidate rather than an LPC-only source. citeturn0search2
- OpenGameArt's **LPC RPG Assets** collection includes LPC Mine Carts and Tracks, a wooden ship tileset, LPC Ship and other compatible fantasy/RPG material. The collection warns that its automatically generated credits file is not guaranteed to be accurate, so original source pages and special attribution instructions must still be checked. citeturn0search1
- The LPC collection also lists **LPC Rowboat Recolor**, **LPC Ship**, **Animated Pixel Art Raft Sprite**, **Wooden Boat**, and **LPC Mine Carts and Tracks**, providing additional vehicle source candidates. citeturn0search6turn0search5

### Vehicle classification rules

#### Land vehicles

- Controllable cart → PLAYABLE/08_VEHICLES.
- Controllable wagon → PLAYABLE/08_VEHICLES.
- Controllable carriage → PLAYABLE/08_VEHICLES.
- Static cart/wagon used only as town dressing → PLAYABLE/07_GAMEPLAY_PROPS or REGION context, depending on whether it is a concrete playable prop or merely regional scenery.
- Modern car/bus/truck → excluded by the medieval-fantasy filter.

#### Mine carts

- Mine cart itself, when rideable/controllable → PLAYABLE/08_VEHICLES.
- Mine-cart track as location infrastructure → REGION when it primarily defines mine/industrial route context.
- Mine-cart track required specifically for vehicle gameplay can additionally receive a PLAYABLE gameplay binding, but the underlying track remains infrastructure rather than a vehicle.
- Decorative mine cart → PLAYABLE/07_GAMEPLAY_PROPS or REGION context.
- Modern rail vehicle → excluded.

#### Boats and ships

- Controllable rowboat → PLAYABLE/08_VEHICLES.
- Controllable canoe/raft → PLAYABLE/08_VEHICLES.
- Controllable medieval sailing ship → PLAYABLE/08_VEHICLES.
- Static boat at a dock → REGION context unless it is intentionally treated as a concrete playable prop.
- Static ship used as scenery → REGION/06_SHIPS or equivalent regional context.
- Cruise ship, container ship, modern yacht or modern motorboat → excluded by default.
- Fantasy/magical vessel → allowed only if its design fits Vandrith's medieval-fantasy baseline.

### Medieval-fantasy filter

Allowed:

- Wooden carts and wagons
- Horse-drawn carriages
- Medieval/fantasy mine carts
- Rowboats
- Canoes and simple rafts
- Medieval sailing boats
- Medieval sailing ships
- Fantasy/magical vessels consistent with the setting
- Other period-compatible transport appropriate to Vandrith

Conditional:

- Airships or unusual magical vehicles are allowed only when they clearly belong to Vandrith's fantasy setting and do not introduce a modern/sci-fi technological language.
- Cannon-equipped or armed ships require separate gameplay classification if the weapons are operational; the vessel itself remains a vehicle.

Excluded by default:

- Modern cars
- Buses
- Motorcycles
- Trucks
- Cruise ships
- Container ships
- Modern yachts
- Motorboats with contemporary styling
- Trains and modern rail vehicles
- Sci-fi spacecraft
- Futuristic hover vehicles
- Contemporary industrial transport

### Canonical storage rule

Vehicle binaries should remain in `assets/vehicles/` or their verified source/library location.

PLAYABLE/08_VEHICLES records the **gameplay/map role** rather than copying the visual asset.

Examples:

- `assets/vehicles/cart.png` → vehicle library + PLAYABLE/08_VEHICLES if controllable.
- `assets/vehicles/ship.png` → vehicle library + PLAYABLE/08_VEHICLES if controllable.
- Static ship used only to establish a port scene → REGION context, not automatically 08_VEHICLES.
- Mine cart visual → vehicle library + 08_VEHICLES when rideable.
- Vehicle inventory item/icon → `assets/inventory/`, not PLAYABLE binary duplication.

### Provenance rule

Source-page discovery does not establish repository provenance.

A vehicle can become 🟢 verified only after reconciling:

1. Repository path and filename
2. Actual binary content
3. Source package/page
4. Creator/contributors
5. License
6. Attribution/conditions
7. SHA-256 checksum

The mine-cart source is a good example: its page identifies the creator and multiple licenses, so those details must be preserved with any verified repository match. citeturn0search0turn0search3

### Current VEHICLES result

**Source coverage:** strong  
**Repository binary match:** not yet established  
**Approval:** ⚠️ pending until binary provenance is reconciled

### PLAYABLE category audit status

All eight PLAYABLE map-role categories are now defined:

1. BUILDINGS — defined
2. ARCHITECTURE — defined
3. INTERACTABLES — defined
4. RESOURCE_NODES — defined
5. CRAFTING_STATIONS — defined
6. COMBAT_INTERACTABLES — defined
7. GAMEPLAY_PROPS — defined
8. VEHICLES — defined

The next phase is therefore **repository-wide binary reconciliation** against these roles. No source candidate is promoted to 🟢 merely because a visually similar source page exists.


## BINARY RECONCILIATION — HANDOFF ARCHIVE INSPECTION

### Inspection artifact

The CI-produced inspection archive supplied for this audit was inspected locally:

- Artifact file: `vandrith-map-binary-inspection.zip`
- Manifest files: `archive-member-sha256.txt`, `archive-member-list.txt`
- Inspected original archive member count: **129**
- Inspection scope: PLAYABLE / REGION / map-related paths and source fingerprints
- Result: **no actual PLAYABLE binary asset files were present in the inspected handoff archive**

The 129 members are predominantly documentation, project source/configuration files, and two nested project ZIP packages. The legacy project asset directories in that archive contain only `.gitkeep` placeholders.

### Consequence

This inspection does **not** prove that the canonical repository asset libraries are empty. It proves only that the specific handoff archive inspected here does not contain the PLAYABLE binary payload needed for filename/content/SHA-256 reconciliation.

Therefore:

- PLAYABLE structure remains **defined**
- PLAYABLE source research remains **available**
- PLAYABLE binary provenance remains **⚠️ PENDING**
- No binary is promoted to 🟢, 🟡, or 🔴 from this archive alone
- No duplicate `assets/playable/` binary library should be created merely to satisfy the map-role structure

### Vehicles source verification

Two relevant OpenGameArt sources were independently checked during the PLAYABLE vehicle audit:

1. **LPC Mine Carts and Tracks — Xenodora**
   - Files include `lpc-mine-cart-carts.png` and `lpc-mine-cart-tracks-sample.zip`
   - Licenses listed by the source: CC-BY-SA 3.0, GPL 3.0 and GPL 2.0 on the current source page
   - Attribution instruction: credit Xenodora
   - This is a **source candidate**, not a repository-binary match. citeturn0search2

2. **16x16 fantasy pixel art vehicles — DualR**
   - Includes canoe, ship, airship, cart, buggy and covered wagon
   - Licenses listed: CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0 and GPL 2.0
   - The source explicitly requires a link to OpenGameArt.org and credit to DualR
   - This is a **source candidate**, not a repository-binary match. citeturn0search0

OpenGameArt's own FAQ also notes that CC-BY/CC-BY-SA/GPL usage can require attribution and, depending on the selected license and distribution context, additional conditions such as share-alike or compatibility considerations. citeturn0search10

### Current PLAYABLE binary status

| Category | Role audit | Source research | Binary reconciliation |
|---|---|---|---|
| 01_BUILDINGS | Defined | Started | ⚠️ Pending |
| 02_ARCHITECTURE | Defined | Started | ⚠️ Pending |
| 03_INTERACTABLES | Defined | Started | ⚠️ Pending |
| 04_RESOURCE_NODES | Defined | Started | ⚠️ Pending |
| 05_CRAFTING_STATIONS | Defined | Started | ⚠️ Pending |
| 06_COMBAT_INTERACTABLES | Defined | Started | ⚠️ Pending |
| 07_GAMEPLAY_PROPS | Defined | Started | ⚠️ Pending |
| 08_VEHICLES | Defined | Verified source candidates | ⚠️ Pending |

**Audit conclusion:** the PLAYABLE MAP taxonomy and source-audit rules are complete, but binary-level approval cannot be completed until the actual canonical asset packages/binaries are available for SHA-256 and content reconciliation.
