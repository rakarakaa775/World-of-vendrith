# INTERIOR Asset Audit

**Status:** STRUCTURE DEFINED / SOURCE AUDIT STARTED / BINARY VERIFICATION PENDING

## Scope

INTERIOR contains the actual **indoor map content** used to build playable interior spaces in Vandrith.

Examples include:
- Houses and home interiors
- Taverns, inns and shops
- Blacksmith, tailor, woodshop and other workshop interiors
- Castle and manor interiors
- Churches, temples and guild interiors
- Dungeons, caves and underground rooms when represented as indoor map spaces
- Interior rooms, corridors, stairways and architectural construction
- Furniture, decoration, containers, lighting and interior gameplay objects

INTERIOR is a **map-role classification**, not a duplicate binary library. Visual assets remain in their canonical libraries where appropriate and receive an INTERIOR map-role binding.

## Canonical map-role structure

```text
04_INTERIOR
├── 01_FLOORS
├── 02_WALLS
├── 03_CEILINGS
├── 04_DOORS_WINDOWS
├── 05_STAIRS
├── 06_FURNITURE
├── 07_DECORATION_PROPS
├── 08_INTERACTABLES
├── 09_CRAFTING_STATIONS
├── 10_LIGHTING
└── 11_DUNGEON_INTERIORS
```

The categories describe **what the indoor map asset does or represents**, not where its source binary must physically live.

---

## 01_FLOORS

Interior floor surfaces and floor construction.

Examples:
- Wooden floors
- Stone floors
- Brick floors
- Tile floors
- Carpet
- Rugs
- Decorative floor patterns
- Dungeon floors
- Indoor transition tiles

### Boundary

- Interior floor → INTERIOR/01_FLOORS
- Exterior ground/terrain → WORLD
- Exterior road/path → REGION
- A complete room/house interior scene → INTERIOR, with its individual floor assets classified here

---

## 02_WALLS

Interior wall and structural wall surfaces.

Examples:
- Wooden interior walls
- Stone walls
- Plastered walls
- Brick walls
- Castle interior walls
- Manor walls
- Shop/tavern walls
- Dungeon walls
- Interior pillars and structural wall details

### Boundary

- Interior wall → INTERIOR/02_WALLS
- Exterior house/castle/city wall → PLAYABLE/02_ARCHITECTURE
- Regional wall/location context → REGION only when the wall is being treated as location context rather than concrete map geometry

---

## 03_CEILINGS

Indoor ceiling and overhead construction.

Examples:
- Wooden ceilings
- Stone ceilings
- Plastered ceilings
- Beam ceilings
- Vaulted ceilings
- Castle/dungeon ceilings
- Ceiling decorations
- Indoor overhead transition pieces

A roof that is visibly part of the exterior building silhouette remains PLAYABLE/02_ARCHITECTURE. A ceiling used to close an indoor room belongs here.

---

## 04_DOORS_WINDOWS

Interior openings and architectural access elements.

Examples:
- Interior doors
- Door frames
- Interior windows
- Window frames
- Shutters
- Curtains when functioning as an opening treatment
- Castle interior doors
- Dungeon doors
- Cell doors

### Gameplay layering

A decorative/non-interactive interior door is INTERIOR/04_DOORS_WINDOWS.

An openable/usable door receives an additional INTERIOR/08_INTERACTABLES binding.

An exterior door remains PLAYABLE/02_ARCHITECTURE even when it leads into an interior.

---

## 05_STAIRS

Interior vertical movement and stair construction.

Examples:
- Wooden stairs
- Stone stairs
- Castle staircases
- Spiral stairs
- Ladders when they are part of indoor traversal
- Dungeon stairs
- Stair railings and associated indoor pieces

A staircase that is an exterior structure can instead belong to PLAYABLE/02_ARCHITECTURE.

A usable staircase may receive an interaction/traversal binding, but its physical visual role remains INTERIOR/05_STAIRS.

---

## 06_FURNITURE

Indoor furniture used to furnish rooms.

Examples:
- Beds
- Tables
- Chairs
- Stools
- Benches
- Cabinets
- Wardrobes
- Shelves
- Desks
- Bookcases
- Chests used as furniture
- Counters
- Beds and bedroom furniture
- Tavern furniture
- Shop furniture

Furniture remains INTERIOR even when it is interactive.

Examples:
- Decorative chair → INTERIOR/06_FURNITURE
- Sit-able chair → INTERIOR/06_FURNITURE + INTERIOR/08_INTERACTABLES
- Storage cabinet → INTERIOR/06_FURNITURE + INTERIOR/08_INTERACTABLES

---

## 07_DECORATION_PROPS

General indoor dressing and non-specialized props.

Examples:
- Books
- Scrolls
- Vases
- Pots
- Jars
- Plates
- Cups
- Bottles
- Paintings
- Banners
- Carpets
- Curtains
- Plants
- Shelves and decorative objects
- Kitchen decorations
- Workshop decorations
- Religious/fantasy decorations
- Period-appropriate household props

### Boundary

The object belongs here when its primary role is **indoor visual dressing**.

If the object has a defined gameplay action, it can receive an additional INTERIOR/08_INTERACTABLES, INTERIOR/09_CRAFTING_STATIONS, or other gameplay binding without duplicating the binary.

---

## 08_INTERACTABLES

Gameplay-role binding for indoor objects that the player can directly operate.

Examples:
- Openable interior doors
- Searchable cabinets
- Lootable chests
- Containers
- Levers
- Switches
- Books or readable objects
- Interactive shelves
- Usable beds
- Sit-able furniture
- Interactive fireplaces
- Indoor mechanisms
- Dungeon mechanisms
- Secret doors

This is a **role binding**, not a separate physical asset library.

Examples:
- Decorative chest → INTERIOR/06_FURNITURE or INTERIOR/07_DECORATION_PROPS
- Lootable chest → same physical asset + INTERIOR/08_INTERACTABLES
- Decorative door → INTERIOR/04_DOORS_WINDOWS
- Openable door → INTERIOR/04_DOORS_WINDOWS + INTERIOR/08_INTERACTABLES

---

## 09_CRAFTING_STATIONS

Gameplay-role binding for indoor crafting and processing stations.

Examples:
- Forge
- Anvil
- Furnace
- Smelter
- Grindstone
- Woodworking bench
- Carpenter station
- Tailor station
- Loom
- Sewing station
- Alchemy table
- Cauldron
- Cooking hearth
- Kitchen workstation
- Mill
- Enchanting station
- Fantasy/magical crafting station

### Boundary

A complete blacksmith/workshop interior remains INTERIOR and can contain:
- Furniture
- Props
- Crafting stations
- Interactables

A forge is not automatically a crafting station merely because it looks like one. It receives the 09_CRAFTING_STATIONS gameplay role only when its intended game function is crafting/processing.

---

## 10_LIGHTING

Indoor lighting and light-emitting visual assets.

Examples:
- Torches
- Wall torches
- Candles
- Candelabras
- Lanterns
- Fireplaces
- Braziers
- Magical lights
- Hanging lamps
- Light-source animations
- Interior glow effects

The visual asset may remain in `assets/effects/` or another canonical source library while receiving an INTERIOR/10_LIGHTING map-role binding.

### Boundary

- Indoor torch/lantern → INTERIOR/10_LIGHTING
- Outdoor torch as exterior map dressing → PLAYABLE/07_GAMEPLAY_PROPS
- Natural sunlight/daylight environment → WORLD
- Pure VFX with no indoor map-lighting role → EFFECTS

---

## 11_DUNGEON_INTERIORS

Specialized indoor/underground environment role for dungeon spaces.

Examples:
- Dungeon floor/wall kits
- Cells
- Prison corridors
- Underground chambers
- Dungeon doors
- Dungeon gates
- Dungeon traps as physical map objects
- Crypt interiors
- Catacombs
- Underground fantasy rooms
- Dungeon architectural decorations

This category is intended for **dungeon-specific interior map composition**, not a duplicate library.

### Layering rule

A dungeon asset may also receive a more specific physical role:

- Dungeon floor → INTERIOR/01_FLOORS + INTERIOR/11_DUNGEON_INTERIORS
- Dungeon wall → INTERIOR/02_WALLS + INTERIOR/11_DUNGEON_INTERIORS
- Dungeon door → INTERIOR/04_DOORS_WINDOWS + INTERIOR/11_DUNGEON_INTERIORS
- Dungeon lever → INTERIOR/08_INTERACTABLES + INTERIOR/11_DUNGEON_INTERIORS

This allows dungeon context without losing the physical asset classification.

---

# INTERIOR MAP TYPES

Interior map spaces can be built from the same role system.

### Residential
- Houses
- Bedrooms
- Kitchens
- Dining rooms
- Storage rooms

### Commercial
- Taverns
- Inns
- Shops
- Markets indoors
- Bakeries
- General stores

### Workshop
- Blacksmiths
- Woodshops
- Tailors
- Alchemists
- Crafting rooms

### Civic / institutional
- Guild halls
- Town halls
- Libraries
- Schools
- Courthouses when appropriate to the setting

### Religious
- Churches
- Temples
- Shrines
- Chapels

### Military
- Barracks
- Armories
- Guard rooms
- Castle interiors

### Noble
- Manors
- Castles
- Palaces
- Throne rooms

### Dungeon / underground
- Prisons
- Crypts
- Catacombs
- Caves
- Underground chambers

These are **interior map contexts**, not additional binary asset categories.

---

# WORLD / REGION / PLAYABLE / INTERIOR BOUNDARY

The four map layers answer different questions:

| Layer | Main question | Examples |
|---|---|---|
| WORLD | What natural world environment is this? | ground, water, mountains, forests, deserts |
| REGION | What regional/location context is this? | village, town, city, castle, road, bridge, dock, port |
| PLAYABLE | What concrete exterior map content is placed here? | house exterior, castle wall, gate, exterior prop, controllable ship |
| INTERIOR | What concrete indoor map content is placed inside? | floor, wall, door, furniture, lighting, crafting station |

### Critical boundary examples

- Village → REGION
- House exterior → PLAYABLE/01_BUILDINGS
- House interior → INTERIOR
- Exterior house wall → PLAYABLE/02_ARCHITECTURE
- Interior house wall → INTERIOR/02_WALLS
- Exterior door → PLAYABLE/02_ARCHITECTURE
- Interior door → INTERIOR/04_DOORS_WINDOWS
- Outdoor barrel → PLAYABLE/07_GAMEPLAY_PROPS
- Indoor barrel → INTERIOR/07_DECORATION_PROPS
- Outdoor forge → PLAYABLE/05_CRAFTING_STATIONS when usable
- Indoor forge → INTERIOR/09_CRAFTING_STATIONS when usable
- Outdoor torch → PLAYABLE/07_GAMEPLAY_PROPS
- Indoor torch → INTERIOR/10_LIGHTING
- Natural cave terrain → WORLD when treated as natural terrain
- Constructed dungeon room → INTERIOR/11_DUNGEON_INTERIORS

---

# MEDIEVAL-FANTASY STYLE RULE

Vandrith uses a **medieval-fantasy only** visual and technological baseline.

## Allowed

- Medieval houses and interiors
- Wooden, stone and brick construction
- Taverns and inns
- Castles and manor interiors
- Blacksmiths and traditional workshops
- Libraries and guild halls
- Churches, temples and fantasy shrines
- Dungeons, crypts and catacombs
- Period-appropriate furniture
- Torches, candles, lanterns and braziers
- Fantasy/magical objects that fit the setting
- Medieval/fantasy crafting stations

## Excluded by default

- Modern apartments
- Modern offices
- Modern kitchens and appliances
- Modern bathrooms
- Contemporary furniture
- Plastic-heavy modern interiors
- Electricity infrastructure with contemporary design
- Televisions, computers and modern electronics
- Modern medical interiors
- Modern factories
- Sci-fi/futuristic interiors
- Contemporary urban interiors

A fantasy element is allowed when it remains visually and technologically consistent with Vandrith's medieval-fantasy setting.

---

# SOURCE AUDIT

OpenGameArt provides strong source candidates for the INTERIOR taxonomy.

### LPC interior collections

**[LPC] Indoor Tiles** is a useful source index for interior material. Its collection includes House Insides, Interior Castle Tiles, Fireplace, House Interior and Decorations, Dungeon Elements, Wooden Furniture, Floors, Shelves, Tables & Stools, Blacksmith and other indoor sources. The collection itself warns that automatically generated credits are not guaranteed to be accurate, so individual source pages and credits must be checked. 

**[LPC] Interiors** directly groups LPC Walls, Floors, Wooden Furniture and Upholstery as interior sources.

### House interiors

**[LPC] House Insides** contains chairs, stools, tables, cabinets, torches, beds, walls, floors, doors, vases, flowers, stove and kitchen/sink material. The current source lists CC-BY-SA 3.0 and GPL 3.0 and gives attribution instructions for Lanea Zimmerman (Sharm) and HughSpectrum.

### Castle interiors

**LPC: Interior Castle Tiles** provides castle interior tiles and stairs. The current source lists CC-BY 4.0, CC-BY 3.0, CC-BY-SA 4.0, CC-BY-SA 3.0, GPL 3.0 and OGA-BY 3.0 and explicitly asks users to credit Lanea Zimmerman.

### Furniture

**[LPC] Upholstery** contains beds, chairs, armchairs, couches, sofas, pillows and other furniture-related material. The source lists multiple licenses including CC-BY, CC-BY-SA, GPL and OGA-BY and provides a specific attribution notice naming bluecarrot16 and Lanea Zimmerman.

### Floors

**[LPC] Floors** contains more than 100 interior floor tiles including carpets, rugs, wood, stone, brick and tile. The current source lists CC-BY-SA 4.0 and provides a multi-author attribution notice plus a credits file.

### General medieval interiors

OpenGameArt's **Medieval Tileset** includes both exterior and interior material for shops, taverns, blacksmiths and other medieval spaces. The source lists CC-BY 3.0 and identifies Calciumtrice as the creator.

### Workshop interiors

**[LPC Revised] Workshop Tilesets** provides Tiled-ready workshop sets for Tailor, Woodshop and Blacksmith interiors. Its current source lists OGA-BY 3.0 and OGA-BY 4.0 and includes a detailed attribution chain for the underlying LPC assets.

---

# SOURCE PROVENANCE RULE

Source discovery does **not** prove that a binary in Vendrith came from that source.

An INTERIOR asset can become 🟢 verified only when all of the following reconcile:

1. Repository path
2. Repository filename
3. Actual binary content
4. Source package/page
5. Creator/contributors
6. License
7. Attribution requirements
8. Any share-alike/GPL/OGA-BY conditions
9. SHA-256 checksum

A visually similar image, identical-looking preview, filename match, collection membership or source-page discovery alone is insufficient.

Generated OGA collection credits are treated as a **research aid**, not authoritative provenance. The individual source page/package and its attribution instructions remain the verification target.

---

# CANONICAL STORAGE RULE

INTERIOR is a **map-role classification**, not a duplicate binary library.

Examples:

- Interior floor tiles may remain in the canonical object/source library + INTERIOR/01_FLOORS.
- Furniture may remain in `assets/objects/` + INTERIOR/06_FURNITURE.
- Interior lighting may remain in `assets/effects/` + INTERIOR/10_LIGHTING.
- Crafting stations may remain in `assets/objects/` + INTERIOR/09_CRAFTING_STATIONS.
- Doors may remain in the canonical object/source library + INTERIOR/04_DOORS_WINDOWS.
- A chest remains one visual binary while receiving the appropriate INTERIOR furniture/prop and interactable bindings.

No binary duplication is required merely because an asset receives an INTERIOR map role.

---

# GAMEPLAY BOUNDARY

| Asset | Physical role | Gameplay role |
|---|---|---|
| Decorative chair | INTERIOR/06_FURNITURE | None |
| Sit-able chair | INTERIOR/06_FURNITURE | INTERIOR/08_INTERACTABLES |
| Decorative chest | INTERIOR/06_FURNITURE or 07_DECORATION_PROPS | None |
| Lootable chest | INTERIOR/06_FURNITURE or 07_DECORATION_PROPS | INTERIOR/08_INTERACTABLES |
| Decorative forge | INTERIOR/07_DECORATION_PROPS | None |
| Usable forge | INTERIOR/09_CRAFTING_STATIONS | Crafting |
| Decorative torch | INTERIOR/10_LIGHTING | None |
| Interactive fireplace | INTERIOR/10_LIGHTING | INTERIOR/08_INTERACTABLES |
| Decorative door | INTERIOR/04_DOORS_WINDOWS | None |
| Openable door | INTERIOR/04_DOORS_WINDOWS | INTERIOR/08_INTERACTABLES |
| Dungeon lever | INTERIOR/07_DECORATION_PROPS | INTERIOR/08_INTERACTABLES + 11_DUNGEON_INTERIORS |

Gameplay behavior is layered on top of the physical indoor role rather than creating duplicate visual assets.

---

# BINARY VERIFICATION STATUS

The actual canonical source asset packages are intentionally **not required for this structural/source phase**.

Current status:

| Category | Structure | Source research | Binary reconciliation |
|---|---|---|---|
| 01_FLOORS | Defined | Started | ⚠️ Pending |
| 02_WALLS | Defined | Started | ⚠️ Pending |
| 03_CEILINGS | Defined | Started | ⚠️ Pending |
| 04_DOORS_WINDOWS | Defined | Started | ⚠️ Pending |
| 05_STAIRS | Defined | Started | ⚠️ Pending |
| 06_FURNITURE | Defined | Strong | ⚠️ Pending |
| 07_DECORATION_PROPS | Defined | Started | ⚠️ Pending |
| 08_INTERACTABLES | Defined | Started | ⚠️ Pending |
| 09_CRAFTING_STATIONS | Defined | Strong | ⚠️ Pending |
| 10_LIGHTING | Defined | Strong | ⚠️ Pending |
| 11_DUNGEON_INTERIORS | Defined | Started | ⚠️ Pending |

## Audit conclusion

The INTERIOR MAP taxonomy is now defined as the indoor counterpart to WORLD, REGION and PLAYABLE.

The project can therefore proceed with:

1. INTERIOR structure and role definitions
2. Source/license research
3. Medieval-fantasy filtering
4. Gameplay-role bindings
5. Later binary reconciliation when the original source packages are brought into the project conversation

No INTERIOR binary should be promoted to 🟢 until repository content and SHA-256 provenance are available.
