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

## Optional extension: FANTASY / ISEKAI REGION

These assets are **optional**. They are added only when the world actually contains fantasy/isekai structures or magical regional landmarks. They do not replace the normal REGION categories and they do not turn generic buildings into REGION assets.

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
├── 15_REGION_PROPS
└── 16_FANTASY_REGION                [OPTIONAL]
    ├── 01_MAGIC_PORTALS
    ├── 02_TELEPORT_CIRCLES
    ├── 03_SHRINES_AND_ALTARS
    ├── 04_RUNE_STONES
    ├── 05_MAGIC_WELLS_AND_FOUNTAINS
    ├── 06_FANTASY_LANDMARKS
    └── 07_DUNGEON_ENTRANCES
```

### What belongs here

- **Magic portals / gates** when they are physical regional landmarks or travel structures.
- **Teleport circles** when they are placed as regional travel infrastructure.
- **Shrines and altars** when they are exterior regional locations rather than interior-only objects.
- **Rune stones** and other magical standing stones used as exterior landmarks.
- **Magic wells/fountains** when they are physical regional props or landmarks.
- **Fantasy landmarks** such as a giant magical monument or other constructed regional feature that is not a generic building.
- **Dungeon entrances** when the visible asset is the exterior entrance/location marker; the dungeon interior belongs to INTERIOR.

### Fantasy-specific source candidates

| Candidate | REGION role | Evidence | Status |
|---|---|---|---|
| Teleporter Circle | 16_FANTASY_REGION/02_TELEPORT_CIRCLES | CC-BY 3.0; fantasy teleporter; active version has animation | ⚠️ source candidate |
| Statues & Fountains Collection | 16_FANTASY_REGION/05_MAGIC_WELLS_AND_FOUNTAINS or 15_REGION_PROPS | CC-BY-SA 3.0 collection with per-source licensing notes | ⚠️ mixed-role source candidate |
| [LPC] Water Fountain | 16_FANTASY_REGION/05_MAGIC_WELLS_AND_FOUNTAINS | CC-BY 3.0; attribution instructions list Curt, Sharm, William.Thompsonj and the web address | ⚠️ source candidate |
| Temple and Ruins Assets | 16_FANTASY_REGION/03_SHRINES_AND_ALTARS or 06_FANTASY_LANDMARKS where applicable | Collection includes shrines, teleporter, runes and ruins | ⚠️ collection/source candidate |

The Teleporter Circle source is explicitly a fantasy runed teleporter and is licensed CC-BY 3.0. citeturn2search1

The Statues & Fountains collection is useful for fantasy regional landmarks, but it is a mixed-license collection: the collection states CC-BY-SA 3.0 while noting that individual included assets can have different licenses and should be checked against its sources.md/attribution material. citeturn2search0

The [LPC] Water Fountain is separately identified as CC-BY 3.0 with specific attribution instructions, so it must retain those credits if used. citeturn2search2

### Isekai-specific rule

**ISEKAI is a setting tag, not a new universal asset layer.**

If the story contains objects brought from another world, classify them by their actual REGION role:

- Modern road → REGION/01_ROADS
- Static modern vehicle used as scenery → REGION/15_REGION_PROPS or another appropriate regional category
- Power pole / street infrastructure → REGION/15_REGION_PROPS or the appropriate infrastructure category
- Abandoned modern urban remains → the appropriate regional location category
- Modern building → remains a building/architecture asset; do not promote it to REGION merely because it is isekai

Only add these assets if the actual world design calls for Earth/modern-world remnants. A fantasy world without an isekai-origin civilization should not receive them.

### Hard boundary: REGION vs magic gameplay

A visual magic landmark can be REGION, but its gameplay logic belongs elsewhere:

| Asset | Visual placement | Gameplay logic |
|---|---|---|
| Teleport circle | REGION/16_FANTASY_REGION | Teleport system / world engine |
| Magic portal | REGION/16_FANTASY_REGION | Travel/portal system |
| Shrine | REGION/16_FANTASY_REGION | Quest/interactions if applicable |
| Magic fountain | REGION/16_FANTASY_REGION or REGION_PROPS | Interaction/effect system if applicable |
| Magic crystal resource node | WORLD/12_FANTASY_NATURE if natural; PLAYABLE if harvestable | Resource/item system |

**No fantasy/isekai candidate becomes repository-approved until source/package match, binary identity, license/credit verification and checksum are available where applicable.**

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

## Source research: ROADS / PATHS

### 01_ROADS

**[LPC] Streets**
- OpenGameArt author: Baŝto.
- The asset improves the streets from [LPC] Skorpio's SciFi Sprite Pack and includes separated streets, road markings, additional markings and street signs.
- License: CC-BY-SA 3.0 / GPL 3.0.
- Copyright/attribution notice states it is based on Skorpio's SciFi Sprite Pack, which is dual licensed CC-BY-SA 3.0 and GPL 3.0.
- REGION role: **01_ROADS**.
- Important: street/road tiles and road markings belong here; street signs are regional props unless they become interactive.
- Binary status: ⚠️ not individually verified against the asset library.

**LPC Modern Streets**
- Identified as an LPC collection/source candidate.
- REGION role: 01_ROADS when the asset represents exterior roadway infrastructure.
- Binary/source identity: ⚠️ pending.

### 02_PATHS

**RPG Tiles: Cobble stone paths & town objects**
- OpenGameArt source contains cobblestone paths and is licensed CC-BY-SA 3.0.
- The source attributes the work to Zabin, Daneeklu, Jetrel, Hyptosis, Redshrike and Bertram and provides a credit instruction linking back to the source page.
- REGION role: **02_PATHS** for the cobblestone path elements.
- The same tileset contains town objects, dock and boat elements; those must be split by actual role rather than importing the whole atlas into PATHS.
- Binary status: ⚠️ not individually verified.

### Regional rail infrastructure

**LPC Mine Carts and Tracks**
- OpenGameArt author: Xenodora.
- Licenses: CC-BY-SA 3.0, GPL 3.0 and GPL 2.0.
- Attribution: credit Xenodora.
- REGION role: **01_ROADS / 02_PATHS** for the static rail/track infrastructure.
- Mine-cart itself is not REGION when usable; it belongs to the gameplay vehicle system.
- Binary status: ⚠️ not individually verified.

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

## Current audit order

1. BRIDGES — source research completed; binary matching pending
2. DOCKS — source research completed; binary matching pending
3. PORTS — pending
4. SHIPS — source research started; binary matching pending
5. ROADS / PATHS — source research started; binary matching pending
6. Regional infrastructure
7. Static regional locations
8. REGION_PROPS

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
