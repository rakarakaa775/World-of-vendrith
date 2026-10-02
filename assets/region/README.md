# REGION Assets

REGION is the map-role layer for **regional/location context** on the Vandrith World Builder.

## Core boundary

**REGION answers: “What/where is this regional location?”**  
**PLAYABLE answers: “What concrete exterior map content is placed and used there?”**

REGION therefore describes the location context and regional infrastructure, while the actual exterior buildings, architecture and gameplay props used to populate that location are classified through PLAYABLE bindings.

Examples:

- Village / town / city as a location context → REGION
- Castle / fortification as a regional location context → REGION
- Road / path / bridge / dock / port context → REGION
- Static ship tied to a port → REGION
- House exterior placed in the town → PLAYABLE/01_BUILDINGS
- Castle wall or gate → PLAYABLE/02_ARCHITECTURE
- Barrel, sign, well or market prop placed in the town → PLAYABLE/07_GAMEPLAY_PROPS
- Usable door/sign/well → additional PLAYABLE/03_INTERACTABLES binding
- Controllable cart/ship → PLAYABLE/08_VEHICLES

A building is **not** a REGION asset merely because it exists inside a village, town, city or castle. Generic building/architecture binaries remain in their canonical libraries and receive PLAYABLE map-role bindings when used as concrete exterior gameplay-map content.

## Canonical REGION roles

- Roads and paths
- Bridges
- Docks and ports
- Static ships/boats
- Villages, towns and cities as regional/location classifications
- Castles and fortifications as regional/location classifications
- Ruins
- Farms and camps as regional/location classifications
- Regional infrastructure and location-context props

Gameplay-active objects receive their appropriate PLAYABLE binding. Natural terrain belongs to WORLD. Interior environment belongs to INTERIOR. Living entities belong to LIFE_GENERATION.

## Medieval-fantasy rule

REGION follows the Vandrith **MEDIEVAL FANTASY ONLY** visual and technological baseline.

Allowed: medieval/fantasy roads, paths, bridges, ports, settlements, castles, ruins, farms, camps and compatible regional infrastructure.

Excluded by default: modern asphalt roads, highways, contemporary urban infrastructure, modern vehicles, cruise/container ships, modern yachts, skyscrapers, industrial/sci-fi infrastructure and contemporary urban props.

## Canonical storage rule

REGION is a **map-role classification**, not a duplicate binary library. Source binaries remain in their canonical asset/source libraries. A REGION role records how an asset or location functions as regional context.

See `assets/_documentation/REGION_ASSET_AUDIT.md` for the complete classification and provenance rules.
