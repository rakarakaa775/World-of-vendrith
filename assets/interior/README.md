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
