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


## Source audit continuation: 05_PORTS — direct source pass

### Port-specific source candidates

**Medieval Seaport Top-Down Pixel Art Tileset — Cute SCKR**
- Explicit medieval coastal harbour/port composition.
- Includes docks, fishing boats, cargo crates and waterfront buildings.
- Commercial source; not treated as a free approved Vendrith source.
- Use only as a category/visual reference unless the project has documented purchase/license evidence.

**Medieval Coastal Fishing Village Port — Cute SCKR**
- Explicit medieval coastal fishing-village port composition.
- Includes piers, fishing equipment, sailboats and shoreline scenery.
- Commercial source; not promoted as a free source.

**Port/harbor assemblies from free OpenGameArt collections**
- Collection membership can identify possible medieval waterfront assets, but the individual submission/package must still be traced.
- A dock, ship, warehouse or prop discovered separately is split into its canonical REGION category instead of being promoted as a complete port.

### 05_PORTS rule reinforced

A verified 05_PORTS asset must represent a recognizable port/harbor location or assembly. The following remain component assets:

| Source element | Classification |
|---|---|
| Wooden pier / dock | 04_DOCKS |
| Static sailing ship | 06_SHIPS |
| Warehouse | BUILDING / Architecture |
| Barrel / crate | 15_REGION_PROPS when static |
| Fishing gear | 15_REGION_PROPS when static |
| Complete fishing/trade/military harbor assembly | 05_PORTS |

**Current 05_PORTS status: ⚠️ source/category defined, but no Vendrith binary has been proven.**

No commercial asset is being copied into the approved free-asset pool merely because it visually matches the category.

**Next source target: 06_SHIPS.**


## Source audit continuation: 06_SHIPS — direct source pass

### 06_SHIPS scope

06_SHIPS is limited to **static exterior ships/boats used as regional scenery**. A controllable or gameplay-usable vessel belongs to PLAYABLE / VEHICLES. Modern cruise ships, container ships, yachts, industrial vessels and futuristic craft are excluded by the medieval-fantasy-only rule.

### Source candidates reviewed

**[LPC] Wooden ship tiles — Tuomo Untinen**
- OpenGameArt source explicitly describes wooden sailing ship tiles with decks, helm, cabins and stairs.
- Creator attribution: **Wooden ship tiles by Tuomo Untinen**; the OGA submission uploader is Reemax.
- Licenses listed: **CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0 and GPL 2.0**.
- File listed: **ship.png**.
- REGION role: **06_SHIPS** when static exterior scenery; controllable vessel → PLAYABLE / VEHICLES.
- Vandrith binary status: ⚠️ source verified, repository binary not individually matched. citeturn0search0turn0search5

**[LPC] Ship — bluecarrot16**
- OpenGameArt source identifies **[LPC] Ship** by bluecarrot16.
- License family includes **CC-BY 4.0, GPL 3.0, GPL 2.0 and OGA-BY 3.0**.
- Candidate REGION role: **06_SHIPS** only when used as static scenery.
- Binary status: ⚠️ source identified, exact Vendrith binary/package match still pending.

**Black Sail Ship — Bleed's Game Art**
- OpenGameArt source describes a top-down 16-direction pirate ship and tags it medieval/pirate/fantasy.
- License: **CC-BY 3.0**.
- Attribution notice says credit is optional and provides Bleed's attribution text.
- File listed: **Black Sail.zip**.
- Candidate role: **06_SHIPS**, subject to actual binary match.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search3

**3d medieval ship — aqrezes**
- Identified as a medieval ship candidate in OpenGameArt collections.
- Candidate role: **06_SHIPS** for static regional scenery.
- Binary status: ⚠️ source/package and Vendrith binary still require direct matching.

### Ship provenance and classification rule

A ship source is not promoted merely because its preview looks medieval. Promotion requires the actual Vendrith binary to be matched by repository path/filename/content and then reconciled with the source creator, license, attribution/conditions and SHA-256. Mixed ship packs must also be filtered: modern/freighter/cruise/yacht content is excluded even when the package license is permissive.

### Current 06_SHIPS decision

**06_SHIPS remains ⚠️ source-researched / binary-unverified.** No ship candidate is promoted to 🟢 verified provenance in this pass. The repository archive archive/VANDRITH_ALL_PROJECT_FILES_LATEST.zip remains the primary binary-inspection target for the next verification step.

**Next verification target:** inspect the archive manifest and match ship-related filenames/content against the source candidates above.

## Source audit continuation: 06_SHIPS — expanded medieval-fantasy source pass

### Additional source candidates

**Ship tileset — Sevarihk**
- CC-BY 4.0.
- Modular 32x32 ship/boat construction kit with wooden planks, masts and sails.
- Includes Viking ships and small boats, but also huge freighters and sand gliders; therefore only medieval-compatible elements may be considered for Vandrith.
- Attribution requires credit and a link to the source or author's homepage.
- Candidate role: **06_SHIPS** for static medieval/fantasy vessels.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search1turn0search5

**16th century ship — twin_mice**
- 3D ship model explicitly identified as a 16th-century ship.
- Licenses listed: CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0, GPL 2.0 and CC0.
- File: `ship2.obj`.
- Candidate role: **06_SHIPS** for static regional scenery.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search7

**3d medieval ship — aqrezes**
- Medieval ship model, `ship.blend`.
- Licenses: OGA-BY 3.0 and CC0.
- Creator asks for credit but states it is not mandatory.
- Candidate role: **06_SHIPS**.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search10

**Medieval Boat — AnyRPG**
- CC0 rowboat model, `medievalboatexport.blend`.
- Described as a rowboat and identified as a derivative of `simple-wood-boat`.
- Candidate role: **06_SHIPS** for static scenery.
- Because it is derivative, the provenance chain should be retained if a matching Vendrith binary is discovered.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search11

### Important mixed-pack filtering

The Sevarihk package is not automatically accepted as a whole: its own description includes freighters and other non-medieval vessels. Vandrith should extract or use only medieval/fantasy-compatible vessel elements. citeturn0search1

### 06_SHIPS current status

**⚠️ Source-researched / binary-unverified.** The expanded source pass gives us stronger medieval-fantasy candidates, but no candidate is promoted until the actual Vendrith binary is matched and its provenance and SHA-256 are reconciled.

**Next step remains binary inspection of `archive/VANDRITH_ALL_PROJECT_FILES_LATEST.zip`.**

## Binary verification checkpoint: 06_SHIPS

A repository-level search was performed against the known ship source fingerprints, including `ship.png`, `lpc-ship.zip`, `Black Sail.zip`, `ship_bases.zip`, `ship_rework-body.png`, `ship_rework-sailsmasts.png`, `ship_rework-bows.png`, `ship_rework-misc.png`, `steuer-schiff.png`, `medievalboatexport.blend`, and `ship2.obj`.

No indexed repository result established an exact Vendrith binary match for these fingerprints. This does **not** prove that the files are absent: the project archive `archive/VANDRITH_ALL_PROJECT_FILES_LATEST.zip` is a binary container whose internal members are not exposed by the connected GitHub text reader.

### Provenance conclusion

- **No 06_SHIPS asset is promoted to 🟢 verified provenance.**
- Source/license facts remain recorded as candidate evidence only.
- The Sevarihk pack requires element-level filtering because it contains both medieval-compatible vessels and non-medieval vessels such as freighters. citeturn0search0
- The AnyRPG Medieval Boat is CC0 but is explicitly derivative of `simple-wood-boat`; any future binary match must preserve that provenance chain. citeturn0search1
- The LPC Ship source is explicitly CC-BY 4.0 / GPL 3.0 / GPL 2.0 / OGA-BY 3.0 and provides `lpc-ship.zip`; this remains source evidence until a Vendrith binary match is established. citeturn0search9
- The LPC Wooden ship tiles source provides `ship.png` and identifies Tuomo Untinen as the ship-tile creator under the listed licenses. citeturn0search11

**Status: `06_SHIPS = ⚠️ source-researched / binary-unverified`.**

**Next target:** continue with the archive/binary inspection path rather than adding more ship sources unless a new source is needed to resolve a concrete filename/provenance match.

## Source audit continuation: 07_VILLAGES — deep medieval-fantasy pass

The village category is treated as a **regional location/assembly**, not as a generic Building/Architecture bucket. A source is a 07_VILLAGES candidate only when its content can establish a recognizable village-scale exterior/location; standalone houses, wall/roof kits, furniture, and isolated props remain in their canonical libraries.

### Audited source candidates

- **[LPC] Medieval Village Decorations** — bluecarrot16 and contributors. CC-BY-SA 4.0 and CC-BY-SA 3.0. Contains medieval/pre-industrial town decorations including farming, market, square, camp, fences, signage and lighting. The source requires retaining the complete attribution information in `CREDITS-decorations-medieval.txt`. It is primarily a decoration/region-props source; individual pieces may support a village assembly but the package itself is not proof of a complete village binary in Vendrith. citeturn0search1turn0search4
- **OPP2017 - Village and room** — Hapiel/Open Pixel Project. CC-BY 3.0, CC-BY-SA 3.0, GPL 3.0, GPL 2.0, OGA-BY 3.0 and CC0 are listed. The package explicitly contains village tiles, houses, fountain and market stands. It is a strong village-source candidate, but it is mixed with room/interior content and must be split by actual role. citeturn0search2turn0search5
- **Village (Tiled Environment | Isometric)** — 2DPIXX/Jana Ochse. CC-BY 3.0. Isometric village environment with 49 frames. Candidate only if the Vendrith projection/style and binary can be matched. citeturn0search3
- **Medieval Tileset** — Calciumtrice. CC-BY 3.0. Medieval exterior/interior tiles with combinable buildings. This is useful as a medieval architectural source, but generic stackable buildings do not automatically become 07_VILLAGES; they remain Building/Architecture unless a recognizable village assembly is actually present. citeturn0search0turn0search7
- **Medieval town** — Keith Karnage. CC-BY 3.0. Explicit medieval town tileset, but described as half-finished; therefore a candidate for town/village visual reference rather than automatic regional promotion. citeturn0search8
- **[LPC] Farm** — bluecarrot16, Wolthera van Hövell tot Westerflier and Ivan Voirol. CC-BY 4.0. Contains barns, granary, coop, apiary, sheds/stables, fences, windmill and water wheel. Only the primitive/thatched/wattlework variants are compatible with the medieval-fantasy baseline; the source explicitly includes more modern early-industrial variants that must be excluded. It is primarily a 13_FARMS source, with farm elements usable when constructing a village. citeturn0search6

### Classification rules

- Complete/recognizable village location → **07_VILLAGES**.
- Generic house/building kit → **Building/Architecture**, not 07_VILLAGES.
- Market/fence/well/sign/barrel as standalone scenery → **15_REGION_PROPS**.
- Farm-specific assembly → **13_FARMS**.
- Camp-specific assembly → **14_CAMPS**.
- Interior room assets → **INTERIOR**.
- Interactive objects → **PLAYABLE** according to function.
- Modern/contemporary/industrial variants → excluded by the medieval-fantasy-only rule.

### Provenance status

No 07_VILLAGES source above is promoted to 🟢 solely from source-page evidence. Binary matching against the Vendrith archive is still required before a repository asset can be marked provenance-verified. **Status: 07_VILLAGES = ⚠️ source-researched / binary-unverified.**

## Source audit continuation: 08_TOWNS — deep medieval-fantasy pass

08_TOWNS is treated as a **regional settlement/location layer**, not as a generic Building/Architecture library. A source qualifies as a town candidate only when it can represent a recognizable town-scale exterior/location or provide town-scale settlement assemblies. Generic houses, walls, roofs, doors, windows and modular building pieces remain in their canonical Building/Architecture library.

### Audited source candidates

**Medieval city set — VladimirSlavik**
- OpenGameArt source explicitly describes a progression in settlement size and complexity from village to city.
- License: **GPL 2.0**.
- The source uses complete 128x128 settlement sprites plus modular parts and is suitable for settlement-scale map representation.
- Provenance note: the author states that the buildings are derivatives of Freeciv amplio2 pieces, with additional original work; farms/mines are also described as mixed-origin material. Any Vendrith binary match must preserve the derivative provenance chain.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**Medieval town — Keith Karnage**
- OpenGameArt source explicitly identifies a half-finished medieval town tileset.
- License: **CC-BY 3.0**.
- Tags include medieval, town, fantasy and 32x32.
- Candidate role: **08_TOWNS** when the actual binary is used as a town/location assembly; isolated houses/roofs/walls remain Building/Architecture.
- Attribution: Keith Karnage.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search2

**Medieval Tileset — Calciumtrice**
- OpenGameArt source describes exterior medieval buildings that can be stacked and combined, with interiors for shops, taverns and blacksmiths.
- License: **CC-BY 3.0**.
- Individual building components remain Building/Architecture; a constructed town-scale placement can support 08_TOWNS at map-instance level, but the source binary itself should not be promoted as a town assembly unless such an assembly is actually present.
- Attribution: Medieval Tileset by Calciumtrice.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search0

**Medieval Town (base) 3D assets — Kenney**
- OpenGameArt source describes a modular 3D pack containing walls, roofs, floors and roads for creating a medieval town.
- License: **CC0**.
- Modular building components remain Building/Architecture; the pack can support 08_TOWNS when assembled into a recognizable regional town.
- Attribution is not mandatory; the source suggests crediting Kenney.nl.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search3turn0search15

**Isometric Medieval City Sim Assets**
- OpenGameArt source describes assets created for an abandoned fantasy/medieval city simulation game and includes roughly a dozen building sprites.
- The source notes that many sprites borrow heavily from other tilesets, including Yar and Seth Galbraith material, so provenance must be treated as a derivative chain rather than inferred from the submission uploader alone.
- Candidate role: 08_TOWNS / 09_CITIES only when an actual settlement assembly or city-specific exterior asset is matched; individual generic buildings remain Building/Architecture.
- Binary status: ⚠️ source identified; Vendrith binary and complete license/provenance chain require direct matching. citeturn0search8

**Toen's Medieval Strategy Sprite Pack v.1.0**
- OpenGameArt source describes a medieval-style RPG/strategy pack containing towns, villages, castles, houses, roads, rivers and bridges.
- License shown on the source: **CC-BY 3.0**; the attribution notice states that credit and source links are required according to the included license/attribution information.
- This is a mixed pack and must be split by actual role. Town/village exterior assets may support 08_TOWNS / 07_VILLAGES, while roads, bridges, terrain, sea and GUI remain in their canonical categories.
- The entire ZIP must never be promoted as a single REGION/TOWN binary.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search5turn0search10

**Village (Tiled Environment | Isometric) — 2DPIXX**
- Isometric village environment, CC-BY 3.0.
- Primarily a 07_VILLAGES candidate; it can inform town-scale isometric settlement classification only if actual Vendrith use expands beyond village scale.
- Binary status: ⚠️ not individually matched. citeturn0search4

### 08_TOWNS classification rules

| Asset/source result | Classification |
|---|---|
| Recognizable medieval town/location assembly | **08_TOWNS** |
| Town-scale settlement scene with streets/squares and multiple structures | **08_TOWNS** |
| Generic modular medieval house kit | **BUILDING / Architecture** |
| Generic walls/roofs/doors/windows | **BUILDING / Architecture** |
| Market stalls/signs/barrels/fences as standalone scenery | **15_REGION_PROPS** |
| Farm-specific settlement assembly | **13_FARMS** |
| Camp-specific settlement assembly | **14_CAMPS** |
| Castle/fortified settlement whose primary role is fortress | **10_CASTLES / 11_FORTIFICATIONS** |
| Ruined town/location | **12_RUINS** when ruin is the primary regional role |
| Interior-only town/shop/tavern assets | **INTERIOR** |
| Interactive shop/chest/sign/door/etc. | **PLAYABLE** by gameplay function |
| Modern city streets, asphalt, cars, contemporary architecture | **EXCLUDED** |

### Town vs city boundary

Use **08_TOWNS** for a recognizable regional settlement below the city scale: compact medieval market towns, walled towns, river towns, crossroads towns and fantasy settlements that function as town-scale locations.

Use **09_CITIES** when the source or assembled location is explicitly city-scale: dense multi-district settlement, large urban footprint, major city infrastructure or a source explicitly designed around a city-scale settlement.

This is a map-role distinction, not a strict historical population number. A source does not become 09_CITIES merely because it contains many buildings.

### Medieval-fantasy filter

Allowed:
- Medieval market towns
- Walled medieval towns
- River/crossroads towns
- Fantasy towns compatible with medieval technology
- Medieval town squares, streets and settlement infrastructure

Excluded:
- Modern suburbs
- Contemporary city blocks
- Asphalt automobile streets
- Traffic-light systems
- Skyscrapers
- Industrial city infrastructure
- Modern vehicles and urban furniture
- Sci-fi/futuristic settlements

### Provenance decision

The 08_TOWNS source pass is complete for this audit stage, but **no source is promoted to 🟢 verified Vendrith provenance** solely from OpenGameArt evidence.

Promotion still requires:
1. actual repository/archive path;
2. exact binary filename/content match;
3. source/package provenance;
4. creator and license;
5. attribution and additional conditions;
6. SHA-256 of the actual Vendrith binary when accessible.

**Current status: 08_TOWNS = ⚠️ source-researched / binary-unverified.**

### Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — source research completed; binary matching pending
4. SHIPS — source research completed; binary matching pending
5. ROADS — medieval-fantasy source filtering completed; binary matching pending
6. PATHS — source research completed; binary matching pending
7. Regional infrastructure — source research completed; binary matching pending
8. VILLAGES — source research completed; binary matching pending
9. TOWNS — source research completed; binary matching pending
10. CITIES — next source-audit target
11. CASTLES
12. FORTIFICATIONS
13. RUINS
14. FARMS
15. CAMPS
16. REGION_PROPS — source research/deep classification completed; binary matching pending

**Generic buildings remain excluded from this audit.**


## Source audit continuation: 09_CITIES — deep medieval-fantasy pass

09_CITIES is reserved for **city-scale exterior regional locations**. It is not a generic container for medieval buildings. A city candidate should show a recognizable urban settlement role: dense multi-structure footprint, districts, major civic/urban infrastructure, or an explicitly city-scale source. Generic houses and modular building kits remain BUILDING/Architecture.

### Audited source candidates

**Medieval city set — VladimirSlavik**
- OpenGameArt source explicitly describes settlement progression from village to city.
- License: **GPL 2.0**.
- Complete 128x128 settlement sprites are provided for each level, making this one of the strongest city-scale candidates reviewed.
- Provenance is mixed/derivative: the author identifies Freeciv amplio2-derived buildings plus original work. Any matched Vendrith binary must preserve that chain.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search16

**Isometric Medieval City Sim Assets — SketchyLogic**
- OpenGameArt source describes assets made for an abandoned fantasy/medieval city simulation game.
- License: **CC-BY 3.0**.
- Contains building sprites and other material, but not a complete city map; therefore individual buildings remain BUILDING/Architecture unless a matched binary is actually a city-specific assembly.
- The author notes substantial borrowing from Yar's outside tileset and Seth Galbraith's medieval tileset, so provenance must be retained as a derivative chain.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search6turn0search13

**16x16 RPG Town / Town Tiles — Surt and derivatives**
- Surt's **Town Tiles** are CC0 and explicitly fantasy town tiles; this is primarily a town-scale source, not automatically a city source. citeturn0search7
- The enlarged JRPG collection documents that Town tiles are by Surt, modified by Blarumyrran, with snow-town modifications by Sharm; if these are used together, the source attribution chain and OpenGameArt link must be retained. citeturn0search15
- Classification: **08_TOWNS** unless a larger city assembly is actually present.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**RPG Town Tileset — 2DPIXX**
- 32x32 tiles for classic RPG village/town use; license **CC-BY 3.0**.
- Strong 08_TOWNS candidate, but not inherently 09_CITIES. citeturn0search2turn0search11
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**RPG Town Pixel Art Assets — ansimuz**
- License: **CC0**.
- Source states the pack contains the tiles necessary to build a complete RPG town, including roads, river, pond, buildings, trees and props.
- Classification: primarily **08_TOWNS**; it should only enter 09_CITIES if a Vendrith map assembly actually uses it at city scale.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search12

**American / Asian / European city tilesets — MirceaKitsune — EXCLUDED**
- Although licensed **CC0**, the source explicitly describes modern city tiles and includes contemporary infrastructure such as stop signs and street lights.
- Vandrith decision: **EXCLUDED** under the medieval-fantasy-only rule. License permission does not override setting compatibility. citeturn0search8

**City Pixel Tileset — software_atelier — EXCLUDED**
- CC0, but the source contains modern urban objects including street lamps, street signs, traffic-cone/trash-bin elements and contemporary city presentation.
- Vandrith decision: **EXCLUDED** from REGION despite the permissive license. citeturn0search10

### 09_CITIES classification rules

| Asset/source result | Classification |
|---|---|
| Explicit medieval city-scale settlement assembly | **09_CITIES** |
| Dense multi-district medieval/fantasy city location | **09_CITIES** |
| Major medieval civic/urban infrastructure belonging to a city | **09_CITIES** when city-specific |
| Compact market/walled/river settlement | **08_TOWNS** unless clearly city-scale |
| Generic medieval houses/buildings | **BUILDING / Architecture** |
| Modular walls/roofs/doors/windows | **BUILDING / Architecture** |
| Market props, signs, barrels, fences | **15_REGION_PROPS** |
| Castle/fortress primary role | **10_CASTLES / 11_FORTIFICATIONS** |
| Ruined urban location | **12_RUINS** |
| Interior-only buildings/rooms | **INTERIOR** |
| Interactive city objects | **PLAYABLE** by function |
| Modern/contemporary/industrial city assets | **EXCLUDED** |

### Town vs city rule

The distinction is based on **map role and settlement scale**, not historical population counts. A pack containing many buildings is not automatically a city. A source becomes a 09_CITIES candidate when the asset itself or the verified Vendrith assembly represents a city-scale regional location.

### Medieval-fantasy filter

Allowed:
- Medieval/fantasy walled cities
- Dense medieval urban districts
- Medieval city squares and civic areas
- River cities and fortified medieval urban settlements
- Fantasy cities compatible with medieval technology

Excluded:
- Modern city blocks
- Asphalt automobile networks
- Traffic-light streets
- Skyscrapers
- Contemporary street furniture/signage
- Industrial/factory city infrastructure
- Modern vehicles
- Sci-fi/futuristic cities

### Provenance decision

No source is promoted to 🟢 verified Vendrith provenance from source-page evidence alone. Binary promotion still requires the actual repository/archive path, exact binary/content match, source/package provenance, creator, license, attribution/conditions and SHA-256 when accessible.

**Current status: `09_CITIES = ⚠️ source-researched / binary-unverified`.**

### Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — source research completed; binary matching pending
4. SHIPS — source research completed; binary matching pending
5. ROADS — source research completed; binary matching pending
6. PATHS — source research completed; binary matching pending
7. Regional infrastructure — source research completed; binary matching pending
8. VILLAGES — source research completed; binary matching pending
9. TOWNS — source research completed; binary matching pending
10. **CITIES — source research completed; binary matching pending**
11. CASTLES — next source-audit target
12. FORTIFICATIONS
13. RUINS
14. FARMS
15. CAMPS
16. REGION_PROPS — source research/deep classification completed; binary matching pending

**Generic buildings remain excluded from this audit.**


## Source audit continuation: 10_CASTLES — deep medieval-fantasy pass

10_CASTLES is reserved for a recognizable castle/keep/citadel location or complete castle set piece used as a regional location. Generic walls, towers, gates, roofs, doors and modular construction pieces remain BUILDING/Architecture unless the source/binary itself represents a complete castle location.

### Audited source candidates

**Castle Set — Nia Mi**
- OpenGameArt source explicitly tags the set as castle/medieval and describes medieval flags, tower and gate.
- License: **CC0**.
- Candidate role: **10_CASTLES** only when used as a recognizable castle location/assembly; individual wall/tower/gate components can remain BUILDING/Architecture or support 11_FORTIFICATIONS depending on actual assembly.
- File listed by source: Castle Set.7z.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search0

**Medieval Castle (Lvl 2) — City Building Game Art**
- OpenGameArt describes a miniature medieval fortress with surrounding wall and waving flags and provides PNG plus Blender source.
- License: **CC0**.
- Strong candidate for **10_CASTLES** because the source explicitly presents it as a complete miniature castle/fortress set piece rather than only reusable wall pieces.
- File listed by source: Medieval_Castle_Level02_sprites and source.zip.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search12

**Medieval Castles & Tiles — Sam**
- OpenGameArt describes a 3D medieval castle set intended to build a castle.
- License: **CC0**.
- Candidate for 10_CASTLES only when the actual Vendrith use is a complete castle assembly; modular pieces alone should remain in Building/Architecture or Fortifications according to role.
- File listed by source: Medieval Castles & Tiles.zip.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search6

**Castle / Dungeon — Gary Shaw**
- OpenGameArt describes a 325-tile castle/dungeon set with walls, floors, doors, stairs, decorative pieces and other dungeon elements.
- License: **CC-BY 4.0**.
- Because it is primarily a modular tileset rather than a complete regional castle location, it is a conditional 10_CASTLES source; generic construction pieces should not be promoted to REGION automatically.
- Credit to Gary Shaw is required when matched and used under the source terms.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search2

**Castle / Dungeon 2 — Gary Shaw**
- Second castle/dungeon tileset with the same general role and **CC-BY 4.0** license.
- Candidate only where a complete castle/location assembly is actually represented; individual generic tiles remain outside REGION.
- File listed by source: castle-dungeon2_tiles.zip.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search7

**pixel art castle tileset — rubberduck**
- OpenGameArt source is a CC0 castle tileset containing walls, brick/stone pieces, pillars, gates, doors, windows, flags and decorative parts.
- This is primarily a modular construction source, not automatically a complete castle location.
- Candidate support: BUILDING/Architecture and, when assembled as defensive regional infrastructure, 11_FORTIFICATIONS; only a verified complete castle assembly belongs directly in 10_CASTLES.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search4turn0search11

**OPP2017 - Castle tiles — Hapiel / Open Pixel Project**
- OpenGameArt describes more than 400 32x32 castle tiles including floors, walls, waterfall, doors, windows and stairs.
- Licenses listed: **CC-BY 3.0, CC-BY-SA 3.0 and GPL 3.0**; the page also describes the project as public-domain/free to use, so the exact applicable license for a matched asset must be preserved from the package/source metadata.
- Primarily a modular castle construction source. Do not promote the entire package as a 10_CASTLES binary without a recognizable castle assembly.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search9

**Castle Platformer 32x Tileset — Vicplay**
- Medieval castle-themed 32x32 tileset, **CC0**, with inner decoration objects.
- Primarily platformer construction tiles rather than a regional castle location; therefore conditional support only.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search10turn0search15

**CastleTileset — Duasun**
- 16x16 roguelike castle tileset in multiple visual variants.
- License: **CC0**.
- Primarily modular castle tiles; candidate support for castle construction but not automatically 10_CASTLES.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search3

**WhiteFort castle set — destinedtodie**
- 3D castle construction set containing gate, walls, towers, doors, stairs and a main building.
- License: **CC-BY 3.0**.
- Strong castle/fortification source, but the repository binary and exact source package would still need matching before classification.
- Credit to destinedtodie is required under CC-BY when used.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched. citeturn0search21

### Castle classification rules

| Asset/source result | Classification |
|---|---|
| Complete recognizable medieval/fantasy castle location/set piece | **10_CASTLES** |
| Keep/citadel represented as a complete regional location | **10_CASTLES** |
| Generic castle wall/tower/gate kit | **BUILDING / Architecture** |
| Defensive wall/tower/gate system used as fortification | **11_FORTIFICATIONS** |
| Ruined castle/keep whose primary role is ruin | **12_RUINS** |
| Castle interior rooms/dungeon interiors | **INTERIOR** |
| Decorative flags, barrels, statues, torches etc. as standalone scenery | **15_REGION_PROPS** |
| Interactive gate/chest/lever/door etc. | **PLAYABLE** by gameplay function |
| Modern/contemporary/industrial castle-like architecture | **EXCLUDED** |

### Castle vs fortification boundary

The distinction is based on regional location role:

- **10_CASTLES** = a recognizable castle/keep/citadel destination or complete castle location.
- **11_FORTIFICATIONS** = defensive infrastructure whose primary purpose is walls, towers, gates, ramparts, bastions, defensive lines or military perimeter systems.
- A castle may contain fortifications, but a reusable wall/tower kit does not become a castle merely because it can be assembled into one.
- A ruined castle is classified under **12_RUINS** when the ruin state is the defining regional role.

### Medieval-fantasy filter

Allowed:
- Medieval stone/wood castles
- Keeps, citadels and royal fortresses compatible with medieval technology
- Fantasy castles with medieval-compatible architecture
- Defensive castle locations with towers, gates, walls and courtyards

Excluded:
- Modern military bases
- Contemporary government compounds
- Industrial/security complexes
- Sci-fi/futuristic fortresses
- Modern concrete megastructures whose visual language breaks the setting

### Binary verification checkpoint

Repository code search was performed for the principal source package/file fingerprints reviewed in this pass, including:

- Medieval_Castle_Level02_sprites
- Castle Set.7z
- castle_tileset_part1.png
- RoguelikeCastle.png
- opp5_castle_tiles.zip
- WhiteFort.7z
- Medieval Castles & Tiles.zip

No indexed repository result established an exact Vendrith binary match.

**Important:** this is not proof that these binaries are absent from the project. The repository contains binary/archive material that is not fully exposed by text/code search. Therefore these remain **⚠️ source-researched / binary-unverified**, not 🟢 and not 🔴.

### Provenance decision

No castle source is promoted to verified Vendrith provenance from source-page evidence alone. Promotion still requires:

1. actual repository/archive path;
2. exact binary/content match;
3. source/package provenance;
4. creator and license;
5. attribution and additional conditions;
6. SHA-256 of the actual Vendrith binary when accessible.

**Current status: 10_CASTLES = ⚠️ source-researched / binary-unverified.**

### Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — source research completed; binary matching pending
4. SHIPS — source research completed; binary matching pending
5. ROADS — source research completed; binary matching pending
6. PATHS — source research completed; binary matching pending
7. Regional infrastructure — source research completed; binary matching pending
8. VILLAGES — source research completed; binary matching pending
9. TOWNS — source research completed; binary matching pending
10. CITIES — source research completed; binary matching pending
11. CASTLES — source research completed; binary matching pending
12. FORTIFICATIONS — next source-audit target
13. RUINS
14. FARMS
15. CAMPS
16. REGION_PROPS — source research/deep classification completed; binary matching pending

**Generic buildings remain excluded from this audit.**


## Source audit continuation: 11_FORTIFICATIONS — deep medieval-fantasy pass

11_FORTIFICATIONS is reserved for defensive regional infrastructure whose primary role is protection, perimeter control, or military defense: walls, ramparts, guard towers, gatehouses, gates, drawbridges, bastions, defensive towers and related fortification systems. A complete castle/keep/citadel remains 10_CASTLES; generic construction kits remain BUILDING / Architecture unless the verified asset is specifically a fortification assembly.

### Audited source candidates

**Castle Gate and Drawbridge — City Building Game Art**
- OpenGameArt source: medieval fortress gate/drawbridge with separate gate, bridge and drawbridge items.
- License: CC0.
- Source package: Medieval_CityBridge+Gate_sprites and source.zip.
- Strong 11_FORTIFICATIONS candidate for gatehouse/drawbridge infrastructure.
- Attribution to CityBuildingKit.com is requested but not mandatory.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**Castle Set — Nia Mi**
- OpenGameArt describes medieval flags, tower and gate.
- License: CC0.
- Tower/gate elements can support 11_FORTIFICATIONS when assembled as a defensive perimeter; a complete recognizable castle location remains 10_CASTLES.
- Source package: Castle Set.7z.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**KayKit: Medieval Builder Pack 1.0 — Kay Lousberg**
- OpenGameArt identifies a 200+ asset medieval scenery pack containing a dedicated set of walls to defend a kingdom.
- License: CC0; commercial/personal use with no attribution requirement.
- Only defensive wall/tower/fortification elements enter 11_FORTIFICATIONS; roads, buildings and water are split to their canonical roles.
- Source package: kaykit_medieval_builder_pack_1.0.zip.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**pixel art castle tileset — rubberduck**
- OpenGameArt lists walls/stone/brick pieces, pillars, metal defensive parts, gates/doors, flags and related castle elements.
- License: CC0.
- Modular source. Defensive wall/gate pieces may support 11_FORTIFICATIONS when their map role is a defensive perimeter; generic construction pieces remain BUILDING / Architecture and decorative elements remain REGION_PROPS.
- Files include castle_tileset_part1.png, castle_tileset_part2.png and castle_tileset_part3.png.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**Medieval pixel castle environment — Chestera**
- OpenGameArt describes a medieval pixel castle environment.
- License: CC0.
- Conditional fortification candidate when a matched binary provides defensive perimeter structures.
- Source package: MedievalEnvironment.zip.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

**Fortress — nicubunu / Liberated Pixel Cup**
- OpenGameArt describes a fantasy/historical fortress map element.
- License: CC0.
- Complete fortress location → 10_CASTLES; defensive perimeter component → 11_FORTIFICATIONS.
- Binary status: ⚠️ source verified; Vendrith binary not individually matched.

### Fortification classification rules

| Asset/source result | Classification |
|---|---|
| Defensive wall/rampart system | 11_FORTIFICATIONS |
| Guard/watch tower used as defensive infrastructure | 11_FORTIFICATIONS |
| Gatehouse / defensive gate | 11_FORTIFICATIONS |
| Drawbridge / defensive bridge attached to fortification | 11_FORTIFICATIONS |
| Bastion / defensive tower / perimeter structure | 11_FORTIFICATIONS |
| Complete castle/keep/citadel destination | 10_CASTLES |
| Generic wall/tower/gate construction kit | BUILDING / Architecture unless specifically verified as a regional fortification system |
| Ruined wall/tower/gate whose ruin state is primary | 12_RUINS |
| Decorative flag/statue/torch/barrel | 15_REGION_PROPS |
| Usable ballista/catapult/cannon/siege machine | PLAYABLE |
| Decorative siege machine | 15_REGION_PROPS |
| Interactive gate/drawbridge control | PLAYABLE behavior layered over REGION structure |
| Modern military base/security wall | EXCLUDED |
| Sci-fi/futuristic fortress | EXCLUDED |

### Fortification vs castle boundary

- 11_FORTIFICATIONS = defensive infrastructure as a regional system.
- 10_CASTLES = recognizable castle/keep/citadel location.
- A standalone medieval guard tower used along a settlement perimeter is a fortification, not automatically a castle.
- A complete fortress destination with its own compound/keep/walls can be 10_CASTLES.
- Generic modular wall pieces remain BUILDING / Architecture until their verified map role is a regional fortification system.

### Medieval-fantasy filter

Allowed:
- Medieval stone/wood defensive walls
- Ramparts and battlements
- Guard/watch towers
- Gatehouses and fortified gates
- Drawbridges and defensive bridges
- Bastions and perimeter defenses compatible with medieval technology
- Fantasy fortifications that preserve the medieval-fantasy visual/technological baseline

Excluded:
- Modern military bases
- Concrete security compounds
- Modern border/security barriers
- Contemporary military infrastructure
- Industrial security complexes
- Sci-fi/futuristic defensive structures
- Modern surveillance infrastructure

### Binary verification checkpoint

Repository code search was performed against principal source fingerprints reviewed for this pass, including:
- Medieval_CityBridge+Gate_sprites and source.zip
- Castle Set.7z
- kaykit_medieval_builder_pack_1.0.zip
- castle_tileset_part1.png
- castle_tileset_part2.png
- castle_tileset_part3.png
- MedievalEnvironment.zip
- fortress.svg

No indexed repository result established an exact Vendrith binary match for these source fingerprints.

**Important:** this is not proof that the binaries are absent. The repository contains binary/archive material that is not fully exposed by text/code search. These therefore remain ⚠️ source-researched / binary-unverified, not 🟢 and not 🔴.

### Provenance decision

No fortification source is promoted to verified Vendrith provenance from source-page evidence alone. Promotion still requires:
1. actual repository/archive path;
2. exact binary/content match;
3. source/package provenance;
4. creator and license;
5. attribution and additional conditions;
6. SHA-256 of the actual Vendrith binary when accessible.

**Current status: 11_FORTIFICATIONS = ⚠️ source-researched / binary-unverified.**

### Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — source research completed; binary matching pending
4. SHIPS — source research completed; binary matching pending
5. ROADS — source research completed; binary matching pending
6. PATHS — source research completed; binary matching pending
7. Regional infrastructure — source research completed; binary matching pending
8. VILLAGES — source research completed; binary matching pending
9. TOWNS — source research completed; binary matching pending
10. CITIES — source research completed; binary matching pending
11. CASTLES — source research completed; binary matching pending
12. FORTIFICATIONS — source research completed; binary matching pending
13. RUINS — next source-audit target
14. FARMS
15. CAMPS
16. REGION_PROPS — source research/deep classification completed; binary matching pending

**Generic buildings remain excluded from this audit.**
