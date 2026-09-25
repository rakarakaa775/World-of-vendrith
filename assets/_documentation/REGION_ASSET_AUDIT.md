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


## World style rule: MEDIEVAL FANTASY ONLY

REGION follows the same **medieval-fantasy visual and technological baseline**.

The setting may contain fantasy architecture, magical landmarks and medieval infrastructure, but modern/contemporary/industrial assets are excluded by default.

### Allowed

- Medieval roads and paths
- Wooden or stone bridges
- Medieval docks, ports and ships
- Villages, towns, castles, fortifications and ruins with a medieval/fantasy character
- Medieval farms and camps
- Medieval regional props
- Fantasy landmarks, shrines, runestones, magical portals and teleport circles when they fit the world

### Excluded

- Modern asphalt road systems
- Highways designed for modern automobiles
- Modern street infrastructure
- Cars, buses, motorcycles and other modern vehicles
- Cruise ships, container ships and modern yachts
- Modern houses and contemporary architecture
- Skyscrapers and modern city blocks
- Industrial factories and modern power infrastructure
- Sci-fi structures
- Modern urban furniture and signage
- Contemporary construction materials/styles when they visibly break the medieval-fantasy setting

### Important

A **medieval/fantasy building is still not automatically a REGION asset**. The existing REGION-vs-BUILDING rule remains in force. Generic houses, walls, roofs, doors, windows and architecture kits stay in their canonical building library unless the asset itself represents a specific regional location/assembly.

A source can therefore be visually compatible with Vandrith while still being excluded from REGION because its actual role is a generic building asset.

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

## Port audit: 05_PORTS

**05_PORTS remains source-level defined but binary-unverified.** A port is treated as a regional location/assembly that combines shoreline access with port-specific infrastructure. A dock, ship, warehouse, barrel, or water tile by itself is not a port.

### Candidate port roles

Conceptual subroles for future placement metadata:

```text
05_PORTS
├── 01_FISHING_PORTS
├── 02_TRADE_PORTS
├── 03_RIVER_PORTS
├── 04_MILITARY_PORTS
├── 05_SHIPYARDS
├── 06_FORTIFIED_PORTS
├── 07_FANTASY_PORTS
└── 08_PORT_PROPS
```

These are **map-role concepts**, not physical repository folders yet. Physical folders should only be introduced when the binary library contains enough verified assets to justify the split.

### Source candidates reviewed

**Medieval Seaport Top-Down Pixel Art Tileset — Cute SCKR**
- Explicitly depicts medieval coastal harbour scenes with docks, fishing boats, cargo crates and waterfront buildings.
- Personal and commercial game use is allowed under the publisher's stated terms, but the pack must be purchased and its standalone redistribution restriction must be respected.
- This is a **commercial source candidate**, not a freely verified Vendrith source.
- It is useful as a visual/category reference for `01_FISHING_PORTS` and `02_TRADE_PORTS`, but it must not be recorded as an approved free asset without the actual purchase/license evidence.

**Medieval Coastal Fishing Village Port — Cute SCKR**
- Explicitly targets a medieval coastal fishing-village port and contains piers, fishing equipment, sailboats and shoreline scenery.
- Personal and commercial game use is allowed under the stated terms, with a restriction against standalone redistribution.
- This is also a **commercial source candidate**, not a repository-binary match.

**Medieval Dark Fantasy / RPG dock collections**
- OpenGameArt collections expose medieval/fantasy dock and boat candidates, but collection membership alone is not provenance proof.
- Any individual dock/port binary must be traced to its actual source page/package and license before approval.
- If the individual element is only a dock, classify it as `04_DOCKS`; only a broader port/location assembly belongs in `05_PORTS`.

### Port component split

| Component | Canonical role |
|---|---|
| Dock / pier | `04_DOCKS` |
| Static ship / boat | `06_SHIPS` |
| Controllable ship | PLAYABLE / VEHICLES |
| Warehouse / generic building | BUILDING / Architecture |
| Barrel / crate | `15_REGION_PROPS` when static regional scenery |
| Fishing equipment | `15_REGION_PROPS` when static; PLAYABLE when interactive |
| Complete port / harbor assembly | `05_PORTS` |

### Medieval-fantasy filter

Allowed port forms include medieval fishing ports, river ports, trading harbors, military harbors, shipyards, fortified harbors and fantasy ports that remain visually and technologically compatible with the setting.

Excluded by default: modern marinas, cruise terminals, container ports, industrial cargo terminals, modern cranes, yacht marinas and futuristic/sci-fi waterfront infrastructure.

### Current decision

No `05_PORTS` binary is promoted to verified status yet. The source audit is sufficient to define the category and filtering rules, but actual repository binaries still require path/filename/source/creator/license/credit/conditions and SHA-256 verification before promotion.

## Source research: ROADS / PATHS

### 01_ROADS

**[LPC] Streets — EXCLUDED**
- OpenGameArt author: Baŝto.
- Although the source is tagged LPC, its own description says it improves streets from **[LPC] Skorpio's SciFi Sprite Pack** and includes asphalt, road markings and contemporary street signs.
- License: CC-BY-SA 3.0 / GPL 3.0.
- **Vandrith decision: exclude from REGION** because the visual/technological baseline is medieval-fantasy only.
- This is a useful provenance/style warning: an LPC tag does not automatically make an asset medieval-fantasy compatible. citeturn0search0

**LPC Modern Streets — EXCLUDED**
- OpenGameArt explicitly labels this source **Modern** and lists sidewalks, traffic lights, traffic cones, tires, manholes and contemporary road signage.
- License: CC0.
- **Vandrith decision: exclude from REGION** despite the permissive license, because it violates the medieval-fantasy visual/technological rule. citeturn0search1

**Medieval road/path candidates**
- **Cobblestone Tileset** by Cem Kalyoncu, with Lamoot as collaborator: CC-BY 3.0; explicitly tagged medieval/cobblestone/path. Attribution instructions identify Cem Kalyoncu and the texture contributors. Candidate for **01_ROADS / 02_PATHS**, subject to actual binary matching. citeturn1search0
- **Stone Pavement Ground Tile** by Saroman: CC-BY 3.0; explicitly tagged road/stone/cobblestone/medieval. Candidate for **01_ROADS / 02_PATHS**, subject to binary matching. citeturn1search1
- **tileable stone path** by forkart: CC0; candidate for **02_PATHS**, subject to binary matching. citeturn1search6

Binary status for all candidates: ⚠️ not individually verified against the Vendrith asset library.

### 02_PATHS

**RPG Tiles: Cobble stone paths & town objects**
- OpenGameArt source contains cobblestone paths and is licensed **CC-BY-SA 3.0**.
- Authors/collaborators listed by the source: **Zabin, Daneeklu, Jetrel, Hyptosis, Redshrike and Bertram**.
- REGION role: **02_PATHS** for the cobblestone path elements.
- The same atlas also contains water, dock, boat and town-object material, so only the path elements belong here. citeturn0search0
- Credit for the listed contributors and source license must be retained.
- Binary status: ⚠️ source verified; repository binary not individually verified.

**Cobblestone Tileset**
- OpenGameArt source by **Cem Kalyoncu**, collaborator **Lamoot**.
- License: **CC-BY 3.0**.
- Explicitly tagged cobblestone, path and medieval; attribution instructions name Cem Kalyoncu and texture contributors Lamoot and West. citeturn0search12turn0search13
- Candidate role: **02_PATHS**, and potentially 01_ROADS when assembled as a medieval regional road.
- Binary status: ⚠️ source verified; repository binary not individually verified.

**tileable stone path**
- OpenGameArt source by **forkart**.
- License: **CC0**.
- File listed by the source: stone.png.
- Candidate role: **02_PATHS**. citeturn0search14
- Binary status: ⚠️ source verified; repository binary not individually verified.

**Stone Pavement Ground Tile**
- OpenGameArt source by **Saroman**.
- License: **CC-BY 3.0**.
- Source tags include road, stone, cobblestone and medieval; file is Cobblestone.png. citeturn0search15
- Candidate role: **01_ROADS / 02_PATHS**, depending on actual use.
- Binary status: ⚠️ source verified; repository binary not individually verified.

**cobble path texture**
- OpenGameArt source by **OgreofWart**.
- License: **CC0**.
- Candidate role: **02_PATHS** only if used as a medieval-compatible path texture rather than a generic texture library asset. citeturn0search16
- Binary status: ⚠️ source verified; repository binary not individually verified.

**Top-down Pebble Path**
- OpenGameArt source by **Vaight**.
- License: **CC0**.
- 16x16 top-down cobblestone/road texture; candidate for **01_ROADS / 02_PATHS**. citeturn0search20
- Binary status: ⚠️ source verified; repository binary not individually verified.

### Path exclusion / filtering

- Modern asphalt roads, traffic infrastructure and contemporary streets remain excluded even when their licenses are permissive.
- A generic stone texture is not automatically a REGION path; it must function as a path/road asset in the map system.
- A source collection is not provenance proof for any repository binary.
- When a mixed atlas contains paths plus docks/boats/town objects, split the roles instead of placing the entire package under PATHS.

### Regional rail infrastructure

**LPC Mine Carts and Tracks**
- OpenGameArt author: Xenodora.
- Licenses: CC-BY-SA 3.0, GPL 3.0 and GPL 2.0.
- Attribution: credit Xenodora.
- REGION role: **01_ROADS / 02_PATHS** for the static rail/track infrastructure.
- Mine-cart itself is not REGION when usable; it belongs to the gameplay vehicle system.
- Binary status: ⚠️ not individually verified.

## Source research: REGIONAL INFRASTRUCTURE / REGION_PROPS

The next pass focuses on **medieval-fantasy regional infrastructure and props**, while keeping generic buildings/architecture excluded.

### Wells / fountains

**Medieval Well — Daniel Andersson**
- OpenGameArt source identified.
- REGION role: **15_REGION_PROPS** when used as static regional scenery/infrastructure.
- License: CC0.
- Attribution: not required; source says crediting Daniel Andersson is appreciated.
- Binary status: ⚠️ not individually verified against the asset library. citeturn1search8

**Medieval Fountain (with animated water) — City Building Game Art**
- OpenGameArt source identified.
- REGION role: **15_REGION_PROPS** when used as a static regional landmark/decoration.
- License: CC0.
- Attribution: "CityBuildingKit.com" / "www.CityBuildingKit.com" is requested but not mandatory.
- Binary status: ⚠️ not individually verified. citeturn1search14

### Signs / regional markers

**Post sign — nicubunu**
- OpenGameArt source identified.
- REGION role: **15_REGION_PROPS** for non-interactive roadside/signpost scenery.
- License: CC0.
- Binary status: ⚠️ not individually verified.
- If a sign becomes readable/interactive in gameplay, the placed object crosses into the PLAYABLE interaction layer. citeturn1search15

**Merchant Post — bobjh**
- OpenGameArt source identified.
- Medieval-era merchant-square marker.
- REGION role: **15_REGION_PROPS** as a static regional marker.
- License: CC-BY-SA 4.0.
- Binary status: ⚠️ not individually verified; attribution/ShareAlike requirements must be retained if the actual binary is matched. citeturn1search17

### Medieval regional prop packs

**Medieval Props Pack 1 / 2 / 3 — Daniel Andersson**
- OpenGameArt sources identified as medieval-themed village prop collections.
- License: CC0.
- Candidate REGION roles include static carts, barrels, crates, camp/farm scenery and other exterior regional props where the individual asset is genuinely regional rather than a generic item.
- These packs must be split by individual asset role; the entire pack is not automatically REGION.
- Binary status: ⚠️ not individually verified. citeturn1search3turn1search6turn1search10

**Medieval Props Pack — System G6**
- OpenGameArt source identified.
- License: CC0.
- Contains exterior-oriented medieval props such as cart, campfire, trough, hay bundle, barrel and hitching post.
- Candidate REGION role: **13_FARMS / 14_CAMPS / 15_REGION_PROPS**, depending on the individual asset's actual use.
- Generic inventory/furniture items remain outside REGION.
- Binary status: ⚠️ not individually verified. citeturn1search1

### Camps

**isometric props and tents — rubberduck**
- OpenGameArt source identified.
- License: CC0.
- Contains tents, fireplaces, cauldrons, boxes, barrels and other camp-oriented elements.
- Candidate REGION role: **14_CAMPS** for static camp assemblies/props.
- Individual generic props must still be classified by actual role.
- Binary status: ⚠️ not individually verified. citeturn1search5

### Style filtering rule

Only medieval/fantasy-compatible elements from mixed packs may proceed to REGION review. Modern, contemporary, industrial or sci-fi elements remain excluded even when they appear in a CC0 collection. License permission does not override Vandrith's visual/technological setting rule.

## Deep audit: REGIONAL INFRASTRUCTURE / REGION_PROPS

### Verified source candidates

**Medieval Well — Daniel Andersson**
- OpenGameArt source: 55087_well.zip.
- License: **CC0**.
- Explicitly a medieval village well.
- REGION role: **15_REGION_PROPS** when used as fixed exterior infrastructure.
- Credit is not required; Daniel Andersson credit is appreciated.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search0

**Medieval Props Pack 1 — Daniel Andersson**
- Source package: 55083_props1.zip.
- License: **CC0**.
- Medieval village prop collection.
- Candidate roles: **15_REGION_PROPS**, **13_FARMS**, **14_CAMPS**, depending on the individual object's regional function.
- Generic inventory/furniture objects must be separated from REGION.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search1

**Medieval Props Pack 2 — Daniel Andersson**
- Source package: 55181_props2.zip.
- License: **CC0**.
- Medieval village prop collection.
- Candidate roles: **15_REGION_PROPS**, **13_FARMS**, **14_CAMPS**, subject to individual role.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search3

**Medieval Props Pack 3 — Daniel Andersson**
- Source package: 55189_props3.zip.
- License: **CC0**.
- Medieval village prop collection.
- Candidate roles: **15_REGION_PROPS**, **13_FARMS**, **14_CAMPS**, subject to individual role.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search4

**isometric medieval props — rubberduck**
- License: **CC0**.
- Contains medieval/fantasy props including wagon, well, stand, barrels, crates and sacks.
- The author states that the work uses other CC0 assets, including Daniel Andersson's Medieval Props Packs. If a Vendrith binary matches this derivative sheet rather than an original package, the provenance chain must be recorded accordingly.
- Candidate role: **15_REGION_PROPS** for static exterior place-defining objects.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search5

### Function boundary

| Object | Regional static use | Gameplay/other system |
|---|---|---|
| Well | 15_REGION_PROPS | PLAYABLE if interactive |
| Wagon/cart | 15_REGION_PROPS | PLAYABLE/VEHICLES if usable |
| Barrel/crate | 15_REGION_PROPS when decorative | PLAYABLE/ITEM if lootable/usable |
| Market stand | 15_REGION_PROPS | PLAYABLE if interactive |
| Trough/hay | 15_REGION_PROPS when fixed scenery | ITEM/LIFE when functional |
| Blacksmith equipment | 15_REGION_PROPS when scenery | ITEM/CRAFTING when usable |
| Generic furniture | — | ITEM_ASSET |
| Weapon/tool | — | ITEM_ASSET |
| Character/animal | — | LIFE_GENERATION |

### Important provenance finding

The Daniel Andersson packages have stable source filenames and CC0 licensing, giving us strong fingerprints for later binary matching. However, a filename/source-page match is still not proof that the same bytes are present in Vendrith. A binary is promoted only after repository path, filename/content, provenance and SHA-256 can be reconciled.
## Source research: STATIC REGIONAL LOCATIONS

The next location pass distinguishes **regional location assemblies** from generic building assets. A medieval/fantasy building pack may be visually valid but is not promoted to REGION merely because it contains houses.

### 07_VILLAGES / 08_TOWNS

**[LPC] Medieval Village Decorations — bluecarrot16 and contributors**
- OpenGameArt source explicitly targets a medieval/pre-industrial town.
- Includes graveyard/cemetery, statues, signage, lighting, banners, farming, market, square, military camp and fences.
- License: CC-BY-SA 4.0 and CC-BY-SA 3.0.
- Required attribution information is contained in `CREDITS-decorations-medieval.txt` and must be retained.
- Candidate REGION roles: **07_VILLAGES / 08_TOWNS / 14_CAMPS / 15_REGION_PROPS**, depending on the individual asset.
- Generic furniture/building pieces remain outside REGION.
- Binary status: ⚠️ not individually verified. citeturn0search4

**Medieval Village MegaKit — quaternius**
- OpenGameArt lists it as a CC0 medieval/fantasy modular environment pack.
- It contains modular walls, roofs, stairs, doors and windows.
- Because these are generic construction components, they remain in the Building/Architecture library.
- A future **specific village assembly** created from those components may be represented as a REGION location instance, but the source binaries themselves are not promoted to REGION by default.
- Binary status: ⚠️ not individually verified. citeturn0search2

### 09_CITIES

No city asset is promoted yet.

A city REGION asset should represent a **specific city-scale exterior location/assembly or city infrastructure**, not a generic collection of buildings. Generic city/building kits remain in the Building/Architecture library.

### 10_CASTLES

**Medieval Castles & Tiles — Sam**
- OpenGameArt source is explicitly medieval/castle themed.
- License: CC0.
- Candidate REGION role: **10_CASTLES** only when a castle exterior/location assembly is represented.
- Individual generic wall/structure pieces should remain canonical building/architecture assets unless assembled into a specific regional castle location.
- Binary status: ⚠️ not individually verified. citeturn0search3

**Castle / Dungeon — Gary Shaw**
- OpenGameArt source is explicitly medieval/fantasy.
- License: CC-BY 4.0.
- The source contains many castle/dungeon tiles, including walls, floors and decorative pieces.
- Candidate REGION role: **10_CASTLES** only for a specific castle exterior/location assembly; individual generic tiles remain outside REGION.
- Attribution to Gary Shaw is required.
- Binary status: ⚠️ not individually verified. citeturn0search5

### 11_FORTIFICATIONS

**Basic Hex Tile Set Plus — pistachio**
- OpenGameArt lists medieval village/castle elements, including castle, moat, road stone and bridge pieces.
- License: CC0.
- Candidate REGION roles: **11_FORTIFICATIONS** for specific fortification/location elements and **01_ROADS / 03_BRIDGES** for the corresponding infrastructure.
- Individual house/building tiles remain outside REGION.
- Binary status: ⚠️ not individually verified. citeturn0search7

### 12_RUINS

No source is promoted yet.

Ruins should represent a **specific ruined regional location** or ruin-specific scenery. A generic damaged wall/building kit should not be promoted solely because it looks ruined.

### 13_FARMS

**[LPC] Medieval Village Decorations**
- The source explicitly includes farming material and medieval/pre-industrial town scenery.
- Candidate REGION role: **13_FARMS** for static farm/field/market infrastructure where the individual asset is part of a regional farm location.
- Individual crops/items that belong to Item Asset or Life systems remain outside REGION.
- Binary status: ⚠️ not individually verified. citeturn0search4

### 14_CAMPS

**[LPC] Medieval Village Decorations**
- The source explicitly includes military camp material.
- Candidate REGION role: **14_CAMPS** for static camp/location assemblies.
- Interactive equipment or gameplay objects should be handled by PLAYABLE instead.
- Binary status: ⚠️ not individually verified. citeturn0search4

### Location classification rule

A useful test is:

**"Does this asset describe a regional place/location, or is it merely a reusable construction component?"**

- Specific village/town/city/castle/ruin/farm/camp assembly → REGION.
- Generic house → Building/Architecture.
- Generic wall/roof/door/window → Building/Architecture.
- Static road/path/bridge/dock → REGION.
- Static regional decoration → REGION/REGION_PROPS.
- Interactive gameplay object → PLAYABLE.
- Living entity → LIFE_GENERATION / SPAWN_LIFE.

## Deep audit: 12_RUINS / 13_FARMS / 14_CAMPS

This pass applies a stricter role test: the asset must represent a **regional exterior location or its fixed regional infrastructure**. Generic architecture, generic inventory objects, crops as resources, animals, characters and interactive gameplay objects remain outside REGION.

### 12_RUINS

#### Candidate: Classical Ruin Tiles
- OpenGameArt source: **Classical Ruin Tiles** by surt.
- License: **CC0**.
- Role candidate: **12_RUINS** when individual tiles form a ruined exterior landmark/location.
- Medieval-fantasy compatibility: **conditional**. The source is classical rather than explicitly medieval, so it must pass a visual review before use in Vandrith.
- Do not promote generic stone/wall tiles merely because they can be damaged or arranged as ruins.
- Binary status: ⚠️ source identified; repository binary not individually verified. citeturn0search21

#### Ruin classification rule
A ruin qualifies as REGION when it communicates a recognizable **regional ruined place**, for example:
- ruined tower
- collapsed fortress section
- abandoned shrine
- ruined gate
- destroyed village/farm site
- ancient regional landmark

A generic cracked wall texture, broken brick tile or reusable damaged construction piece remains a Building/Architecture asset unless it is part of a specific ruin assembly.

**Current decision:** no ruin binary is promoted to verified REGION yet.

### 13_FARMS

#### Candidate: [LPC] Farm
- OpenGameArt source: **[LPC] Farm** by bluecarrot16, Wolthera van Hövell tot Westerflier (TheraHedwig), and Ivan Voirol.
- License: **CC-BY 4.0**.
- Contains barns, granary, chicken coop, apiary/beehives, sheds/stables, fences, windmill and water wheel elements.
- The source explicitly provides both primitive medieval/pre-modern styling and a more modern early-industrial styling.
- **Vandrith rule:** only the medieval/pre-modern elements may proceed; early-industrial variants are excluded.
- Role candidates: **13_FARMS** for fixed farm infrastructure/location assemblies.
- Generic construction components should remain Building/Architecture.
- Farm crafting machines that are gameplay-interactive may belong to PLAYABLE/Item/Crafting systems rather than REGION.
- Binary status: ⚠️ source identified; repository binary not individually verified. citeturn0search11

#### Candidate: Pixel farm and shack
- OpenGameArt source: **Pixel farm and shack** by pixel32.
- License: **CC0**.
- Contains crops, farm tiles and a shack.
- Role candidate: farm terrain/location scenery can support **13_FARMS**.
- The shack itself is a generic building component and should not be promoted to REGION merely because it is bundled with farm assets.
- Crops/resources may belong to Item Asset / Life Generation depending on their function; only fixed regional farm scenery belongs here.
- Binary status: ⚠️ source identified; repository binary not individually verified. citeturn0search4

#### Candidate: Simple Farm Tiles
- OpenGameArt source: **Simple Farm Tiles** by ChikenwingJJA.
- License: **CC0**.
- Contains grass, farmland tiles and crops.
- Role candidate: **13_FARMS** only for fixed farmland/field terrain used as regional scenery.
- Individual crop/resource assets are not automatically REGION.
- Binary status: ⚠️ source identified; repository binary not individually verified. citeturn0search13

#### Farm boundary rule
A farm is REGION when it describes **where farming happens in the world**:
- fields
- irrigation/water-wheel infrastructure
- fences
- barns/stables as part of a specific farm location
- granary
- apiary
- windmill
- farmyard assembly

It is not REGION merely because an asset is agriculturally themed:
- seeds → ITEM_ASSET
- crops as inventory/resources → ITEM_ASSET
- animals → LIFE_GENERATION
- farming tools → ITEM_ASSET
- generic farmhouse → BUILDING/ARCHITECTURE

### 14_CAMPS

#### Candidate: isometric props and tents
- OpenGameArt source: **isometric props and tents** by rubberduck.
- License: **CC0**.
- Contains tents, fireplaces, cauldrons, boxes, barrels, barricades and other camp-oriented props.
- Role candidate: **14_CAMPS** for fixed camp assemblies and exterior camp infrastructure.
- Generic boxes/barrels/cauldrons should not automatically become REGION; classify them by actual role.
- Interactive containers/equipment can move to PLAYABLE or Item systems.
- Binary status: ⚠️ source identified; repository binary not individually verified. citeturn0search18

#### Candidate: [LPC] Medieval Village Decorations
- The source explicitly includes military camp material within a medieval/pre-industrial town decoration set.
- Role candidate: **14_CAMPS** for fixed military/civilian camp scenery.
- License: CC-BY-SA 4.0 / CC-BY-SA 3.0 with required credit information in the included credits file.
- Only the actual camp/location elements should be extracted from the package; unrelated town decorations remain in their own REGION categories.
- Binary status: ⚠️ source identified; repository binary not individually verified. citeturn0search10turn0search6

#### Camp boundary rule
A camp qualifies as REGION when it represents a recognizable **fixed exterior camp/location**:
- tent cluster
- campfire area
- military encampment
- caravan camp
- hunter/gatherer camp
- temporary field camp
- barricade/perimeter as part of the camp assembly

A single tent or barrel is not automatically a REGION location. It can remain a reusable prop until placed/assembled as part of a specific camp.

### Deep-audit decision matrix

| Asset/function | REGION category | Decision |
|---|---|---|
| Ruined tower/location assembly | 12_RUINS | REGION |
| Generic cracked wall tile | — | BUILDING/Architecture |
| Fixed farm fields | 13_FARMS | REGION |
| Barn/stable in a specific farm assembly | 13_FARMS | REGION |
| Generic barn kit | — | BUILDING/Architecture |
| Crop resource | — | ITEM_ASSET |
| Farm animal | — | LIFE_GENERATION |
| Fixed tent camp assembly | 14_CAMPS | REGION |
| Single reusable tent | — | REGION_PROPS / source-specific until placed |
| Interactive chest/barrel | — | PLAYABLE / ITEM |
| Static camp barrel as scenery | 15_REGION_PROPS when appropriate | REGION_PROPS |
| Military camp assembly | 14_CAMPS | REGION |
| Generic medieval house | — | BUILDING/Architecture |

### Verification status

This deep pass establishes **source candidates and classification rules**, not binary approval. No candidate is considered present in the Vendrith repository until the actual repository asset can be matched by path, filename, source metadata/credits and SHA-256 where available.

## Deep audit: 15_REGION_PROPS

REGION_PROPS is reserved for **static exterior regional infrastructure and scenery** that helps define a place. It is not a dumping ground for every medieval prop.

### Regional markers / infrastructure

**Medieval Well — Daniel Andersson**
- Medieval village prop.
- License: CC0.
- Candidate: **15_REGION_PROPS** when placed as static regional infrastructure.
- Attribution is not required; credit is appreciated.
- Binary status: ⚠️ not individually verified. citeturn0search2

**Medieval Props Pack 1 / 2 / 3 — Daniel Andersson**
- Medieval village-oriented prop collections.
- License: CC0.
- Candidate static regional roles include fixed barrels, carts, market/farm scenery, village markers and similar exterior decoration, but each object must be classified individually.
- Binary status: ⚠️ not individually verified. citeturn0search3turn0search5turn0search6

**Medieval Props Pack — System G6**
- License: CC0.
- Includes cart, basket, crate, hay bundle, trough, barrel, hitching post, campfire and related props.
- Candidate REGION_PROPS: fixed hitching posts, troughs, hay bundles, carts and other scenery when used to define an exterior regional location.
- Generic inventory containers/items and interactive gameplay objects remain outside REGION.
- Binary status: ⚠️ not individually verified. citeturn0search1

### Fantasy regional decoration

**50 fantasy-RPG asset models — rubberduck**
- License: CC0.
- Includes torches, fences, bridges, carts, gates, statues and other fantasy-RPG models.
- Candidate REGION_PROPS: static torches, gates, statues and regional decorative elements.
- Bridges remain **03_BRIDGES**; carts that become usable vehicles belong to PLAYABLE.
- Binary status: ⚠️ not individually verified. citeturn0search11

**isometric medieval props — rubberduck**
- License: CC0.
- Includes medieval/fantasy props such as barrels, crates, wagon, well, stand, sacks and containers.
- Candidate REGION_PROPS: static regional stands, wagon/scenery and well where they function as place-defining exterior objects.
- Generic containers/items remain outside REGION.
- Binary status: ⚠️ not individually verified. citeturn0search4

### REGION_PROPS boundary

Use this category for fixed objects that communicate or support a **specific exterior regional place**:

- signpost / regional marker
- well / fountain
- static cart or wagon
- hitching post
- trough
- haystack / hay bundle as fixed farm scenery
- statue / monument
- torch / brazier / exterior light
- fixed market stand
- fixed barricade
- gate decoration
- regional shrine/marker
- non-interactive decorative barrels/crates when clearly part of a location

Do **not** automatically place these here:

- generic inventory item → ITEM_ASSET
- lootable chest/barrel → PLAYABLE
- usable cart → PLAYABLE/VEHICLES
- weapon → ITEM_ASSET
- furniture → ITEM_ASSET
- character/animal → LIFE_GENERATION
- generic building component → BUILDING/Architecture
- bridge → 03_BRIDGES
- dock → 04_DOCKS
- ship → 06_SHIPS
- farm assembly → 13_FARMS
- camp assembly → 14_CAMPS

### Important: static vs interactive

The same visual object can change system category depending on its function:

| Object | Static exterior scenery | Interactive/gameplay |
|---|---|---|
| Barrel | 15_REGION_PROPS | PLAYABLE / ITEM |
| Cart | 15_REGION_PROPS | PLAYABLE / VEHICLES |
| Sign | 15_REGION_PROPS | PLAYABLE / INTERACTABLE |
| Well | 15_REGION_PROPS | PLAYABLE / INTERACTABLE |
| Chest | 15_REGION_PROPS only if purely decorative | PLAYABLE / ITEM |
| Statue | 15_REGION_PROPS | PLAYABLE if it has a gameplay interaction |
| Torch/brazier | 15_REGION_PROPS | PLAYABLE if mechanically interactive |

### Style and provenance rule

CC0 or another permissive license does not make an asset automatically suitable for Vandrith. The asset must also satisfy the **medieval-fantasy-only** visual/technological rule and the actual REGION role.

Likewise, a source page does not prove that the same binary exists in the Vendrith repository. Every eventual promotion to verified status still requires repository path, filename, source/credit evidence, license, conditions and SHA-256 when the binary is available.

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

## Static-location audit closure

The static-location pass for **07_VILLAGES → 14_CAMPS** is now considered **source-researched and classification-defined**.

### New/confirmed source findings

- **[LPC] Medieval Village Decorations** — medieval/pre-industrial town material; CC-BY-SA 4.0 and CC-BY-SA 3.0; retain the included `CREDITS-decorations-medieval.txt`. Suitable candidate roles include village/town decoration, camps, farms and regional props depending on the individual element. citeturn0search0
- **Medieval Village MegaKit** — Quaternius, CC0; useful as a medieval village visual reference, but its modular walls, roofs, stairs, doors and windows are generic construction components and therefore remain in Building/Architecture rather than becoming REGION binaries automatically. citeturn0search6
- **[LPC] Farm** — CC-BY 4.0; contains barns, granary, coop, apiary, sheds/stables, fences, windmill and water-wheel elements. Only medieval/pre-modern variants fit Vandrith; early-industrial variants remain excluded. citeturn0search2
- **Castle Set** — Nia Mi, CC0; explicitly medieval castle/tower/wall/gate material. Candidate for 10_CASTLES only when used as a specific castle/location assembly; reusable wall/tower components remain Building/Architecture. citeturn1search0
- **Medieval Castle (Lvl 2)** — City Building Game Art, CC0; a complete miniature medieval fortress set piece with surrounding wall, suitable as a strong 10_CASTLES candidate if the repository binary is later matched. citeturn1search14
- **Castle / Dungeon** — Gary Shaw, CC-BY 4.0; medieval/fantasy castle/dungeon tiles. Credit is required; generic tiles remain Building/Architecture unless assembled into a specific regional castle. citeturn1search13
- **old ruins tileset** — rubberduck, CC-BY-SA 3.0; explicitly an outdoor/isometric ruins set with winter/frozen variant. Candidate for 12_RUINS, subject to visual/style and binary verification; retain `CREDITS.txt`. citeturn1search6
- **[LPC] Cavern and ruin tiles** — Reemax with collaborators, CC-BY-SA 3.0 / GPL 3.0 / GPL 2.0; candidate for ruin-specific exterior elements, but the package is mixed with caves, mines and other roles, so elements must be split by function. citeturn1search19
- **Free isometric ruins** — rubberduck, CC0; explicit isometric ruins pack. Candidate for 12_RUINS when the projection/style fits the chosen REGION rendering. citeturn1search20

### City decision

**09_CITIES remains source-defined but binary-unverified.** The audit will not promote a generic city/building tileset merely because it depicts a medieval city. A city candidate must represent a recognizable city-scale exterior/location assembly or city-specific regional infrastructure. Generic houses, walls, roofs, doors and windows remain Building/Architecture.

### Fortification decision

**11_FORTIFICATIONS remains source-defined but binary-unverified.** Castle walls, gates, towers and moats can contribute to a fortification location, but reusable construction tiles are not automatically REGION. A complete fortress/fortification assembly is the stronger promotion target.

### Ruins decision

The previous conditional **Classical Ruin Tiles** candidate remains conditional because its source is explicitly classical rather than medieval. New medieval/fantasy-compatible candidates such as **old ruins tileset** provide stronger candidates for future verification, but no repository binary is promoted yet. citeturn1search6turn1search17

### Binary verification status

**No new binary is promoted to verified provenance in this pass.** OpenGameArt source pages establish source/licensing facts, but they do not prove that the same binary is present in Vendrith. Promotion still requires repository path + filename/content + source/creator/license/credit/conditions + SHA-256 when the binary is available.

## Deep audit: 15_REGION_PROPS

REGION_PROPS is a strict static exterior place-defining category. Reusable inventory objects, furniture, weapons/tools and gameplay-interactive objects remain in their canonical systems.

### Source candidates

**Medieval Props Pack — System G6**
- 19 medieval props including chest, bench, brazier, campfire, cart, crate, hay bundle, trough, barrel and hitching post.
- License: CC0.
- Candidate REGION_PROPS: fixed hitching posts, troughs, hay bundles, carts and similar exterior scenery.
- Interactive chest/barrel/cart → PLAYABLE/ITEM/VEHICLES.
- Source package: medieval_props_pack.7z.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search0

**isometric medieval props — rubberduck**
- Medieval/fantasy isometric props including barrel, crate, wagon, well, stand and sacks.
- License: CC0.
- Candidate REGION_PROPS: static well, stand, wagon/scenery and other place-defining exterior elements.
- The author states that the work uses other CC0 assets including Daniel Andersson's Medieval Props Packs; derivative provenance must be preserved if matched.
- Source package: medieval_props_sheets.zip.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search1

**50 fantasy-RPG asset models — rubberduck**
- CC0 pack containing torches, fences, bridges, carts, gates and statues.
- Candidate REGION_PROPS: static torches, gates, statues and regional decoration.
- Bridges → 03_BRIDGES; usable carts → PLAYABLE/VEHICLES.
- Source package: 50_rpg_asset_models.blend.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search9

**Medieval Props Pack 1 / 2 / 3 — Daniel Andersson**
- Medieval village prop collections, all CC0.
- Source packages: 55083_props1.zip, 55181_props2.zip, 55189_props3.zip.
- No credit required; crediting Daniel Andersson is appreciated.
- Candidate REGION_PROPS depends on each object's exterior regional role.
- Binary status: ⚠️ source verified; Vendrith binaries not individually matched. citeturn0search3turn0search4turn0search6

**Medieval Smith Pack — Daniel Andersson**
- Medieval blacksmith prop collection.
- License: CC0.
- Source package: 75579_Smith1Upload_blend.zip.
- Static exterior smithing equipment can support 15_REGION_PROPS; usable crafting equipment belongs to gameplay/crafting systems.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search11

### Strict function split

| Asset | Static exterior role | Interactive/gameplay role |
|---|---|---|
| Well/fountain | 15_REGION_PROPS | PLAYABLE / INTERACTABLE |
| Sign/marker | 15_REGION_PROPS | PLAYABLE / INTERACTABLE |
| Barrel/crate | 15_REGION_PROPS if decorative | PLAYABLE / ITEM |
| Cart/wagon | 15_REGION_PROPS if scenery | PLAYABLE / VEHICLES |
| Hitching post/trough | 15_REGION_PROPS | PLAYABLE if functional |
| Hay bundle | 15_REGION_PROPS when fixed scenery | ITEM/LIFE when functional |
| Statue/monument | 15_REGION_PROPS | PLAYABLE if interactive |
| Torch/brazier | 15_REGION_PROPS when decorative | PLAYABLE if mechanically interactive |
| Blacksmith prop | 15_REGION_PROPS when scenery | ITEM/CRAFTING when usable |
| Chest | 15_REGION_PROPS only when decorative | PLAYABLE / ITEM |
| Furniture | — | ITEM_ASSET |
| Weapon/tool | — | ITEM_ASSET |
| Character/animal | — | LIFE_GENERATION |

### Provenance decision

These candidates are source-verified but not binary-approved. Promotion requires repository path, filename/content, source, creator, license, credit/conditions and SHA-256 where the binary is available.

**Current decision:** 15_REGION_PROPS source audit and deep classification are complete; binary verification remains pending.

## Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — source research completed; binary matching pending
4. SHIPS — source research completed; binary matching pending
5. ROADS — medieval-fantasy source filtering completed; binary matching pending
6. PATHS — source research completed; binary matching pending
7. Regional infrastructure — source research completed; binary matching pending
8. Static regional locations (VILLAGES → CAMPS) — source research and classification completed; binary matching pending
9. REGION_PROPS — source research/deep classification completed; binary matching pending

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


## Binary verification pass: BRIDGES → DOCKS → PORTS → SHIPS → ROADS → PATHS

### Repository matching result

A repository-level filename/content search was performed for the currently identified source fingerprints, including:

- 003_bridge.zip — JamesWhite / Wooden Bridge
- 005_stone_bridge.zip — JamesWhite / Stone Bridge
- FLARE_Bridge.zip — Lamoot / Isometric Bridge
- Bridging.zip — FacadeGaikan / Bridges and Stuff
- merchant_post.zip — bobjh / Merchant Post
- kenney_roadTextures_2.zip — Kenney / Road Textures
- ship.png — LPC Wooden ship tiles
- lpc-ship.zip — [LPC] Ship
- Docks / bridge-related repository terms

No indexed repository result was returned for these exact package/file fingerprints. This is **not proof that the binaries are absent**, because GitHub code search does not reliably index binary/archive contents.

### Current decisions

- **03_BRIDGES:** ⚠️ source candidates remain unverified in Vendrith. Wooden Bridge (JamesWhite, CC0), Stone Bridge (JamesWhite, CC0), Isometric Bridge (Lamoot, CC-BY-SA 3.0 + GPL 3.0/2.0), and Bridges and Stuff (FacadeGaikan, CC0) remain candidates pending direct binary inspection. citeturn0search9turn0search11turn0search5turn0search2
- **04_DOCKS:** ⚠️ no Vendrith binary was individually matched in this pass. Source/collection references are not sufficient to promote a binary.
- **05_PORTS:** ⚠️ no complete port/harbor binary was individually matched. Component assets such as docks, ships and props must not be promoted as a complete port assembly.
- **06_SHIPS:** ⚠️ no exact Vendrith binary match was established for the previously researched ship sources. A source page alone remains insufficient for promotion.
- **01_ROADS:** ⚠️ no exact Vendrith binary match was established for the researched road candidates. Medieval-fantasy compatibility remains mandatory; modern asphalt/street infrastructure stays excluded.
- **02_PATHS:** ⚠️ no exact Vendrith binary match was established for the researched path candidates. Generic stone textures remain unclassified unless their actual function as path/road material is proven.

### Provenance gate

No candidate in this pass is promoted to 🟢 verified provenance. Promotion still requires:

1. actual repository path;
2. exact filename/content match;
3. source/package provenance;
4. creator and license;
5. credit and additional conditions;
6. SHA-256 of the actual Vendrith binary when accessible.

**Next verification target:** direct inspection of the asset workspace/source archives rather than additional OpenGameArt collection searching.


## Binary container discovery: repository archive

A direct repository tree inspection found the project archive:

- `archive/VANDRITH_ALL_PROJECT_FILES_LATEST.zip`
- Repository blob SHA: `92511976469c101d428d47f16bf43ee81364ad6d`
- Reported archive size: 3,258,487 bytes

This is a **real repository binary/archive**, so the earlier conclusion that the repository exposed no binary container was incomplete. However, the connected GitHub file reader can identify the archive and its blob metadata but does not expose its ZIP members as readable UTF-8 content. Therefore the archive's internal asset paths, filenames and checksums are **not yet verified** from this interface.

### Consequence for provenance audit

The archive is now the primary binary-inspection target for the next pass. We must inspect its ZIP manifest and, where relevant, individual files before promoting any REGION candidate.

Until the archive contents are directly inspected:

- no bridge source is promoted to 🟢;
- no dock source is promoted to 🟢;
- no port assembly is promoted to 🟢;
- no ship source is promoted to 🟢;
- no road/path source is promoted to 🟢;
- existing ⚠️ provenance status remains unchanged.

**Next binary step:** inspect `VANDRITH_ALL_PROJECT_FILES_LATEST.zip` itself, map its internal asset paths against the REGION source candidates, then compute SHA-256 for matched binaries.
