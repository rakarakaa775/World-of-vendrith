# INTERIOR

INTERIOR stores the **map-role classification for indoor spaces** in Vandrith World.

Canonical structure:

```text
INTERIOR
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

## Important

INTERIOR is a **map-role classification**, not a second binary asset library.

Canonical visual assets may remain in `assets/objects/`, `assets/effects/`, `assets/inventory/`, `assets/vehicles/`, source archives, or other verified libraries. INTERIOR records how those assets are used on indoor maps.

Examples:

- Interior floor → `01_FLOORS`
- Interior wall → `02_WALLS`
- Interior door/window → `04_DOORS_WINDOWS`
- Furniture → `06_FURNITURE`
- Indoor prop → `07_DECORATION_PROPS`
- Usable indoor object → `08_INTERACTABLES` binding
- Usable forge/workbench → `09_CRAFTING_STATIONS` binding
- Torch/lantern/fireplace → `10_LIGHTING`
- Dungeon-specific interior → `11_DUNGEON_INTERIORS`

See `assets/_documentation/INTERIOR_ASSET_AUDIT.md` for the complete classification, medieval-fantasy filter, REGION/PLAYABLE/INTERIOR boundaries, source research and binary verification rules.

Binary provenance remains pending until the original source packages are available for reconciliation.

## Room context

Room types are metadata/context, not additional physical asset folders.

Recommended contexts:

- RESIDENTIAL
- TAVERN_INN
- SHOP
- WORKSHOP
- BLACKSMITH
- WOODSHOP
- TAILOR
- ALCHEMY
- KITCHEN
- STORAGE
- CASTLE
- MANOR
- TEMPLE_CHURCH
- GUILD
- LIBRARY
- MILITARY
- PRISON
- CRYPT
- CATACOMB
- DUNGEON
- CAVE_DUNGEON

For example, a blacksmith forge is 09_CRAFTING_STATIONS with BLACKSMITH context; a dungeon floor is 01_FLOORS with 11_DUNGEON_INTERIORS and DUNGEON context.

## Cave and dungeon boundary

Natural cave terrain remains WORLD.

Constructed indoor or underground spaces belong to INTERIOR. A natural cave converted into a dungeon can use WORLD for its natural terrain and INTERIOR/11_DUNGEON_INTERIORS for the dungeon map composition.

Exterior cave gates, doors or fortifications remain PLAYABLE/02_ARCHITECTURE.

## Source eligibility

Vandrith is medieval-fantasy only. Interior source packages must be filtered for setting compatibility. Packages or collections that mix medieval/fantasy material with modern, Victorian, contemporary or sci-fi material must be reviewed at the individual package/file level rather than accepted as a whole.

OpenGameArt's LPC Indoor Tiles collection contains many different source packages and explicitly warns that its generated credits file is not guaranteed accurate; attribution must therefore be checked against the individual source package/page. citeturn0search0

A source page alone does not prove that a binary in this repository came from that source. Final approval requires repository path/filename, actual binary content, source package/page, creator, license/attribution conditions and SHA-256 reconciliation where available.