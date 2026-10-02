# WORLD Biome Composition & Ecology Rules — 2026-09-26

## Purpose
Biome is a composition, not a folder of duplicated PNGs. It references ground, water state/features, landforms, vegetation, transitions, seasons and special features.
LPC Terrains is explicitly designed so multiple terrain materials can be painted together, while LPC Overworld combines terrain, forests, mountains, hills and rivers. citeturn0search0turn0search1

## Canonical biome schema
biome_id; primary_ground; secondary_ground; water_states; water_features; landforms; vegetation_families; transitions; seasonal_variants; special_features
Every field references Asset Library records; it does not create new binaries.

## FOREST
Ground: GRASS, DIRT, STONE, local MUD.
Water: OPEN, COASTAL/SHALLOW, seasonal COLD.
Landforms: HILLS, ROCKS, local CLIFFS.
Vegetation: WOODLAND/DECIDUOUS, UNDERSTORY, FLOWERS, BUSHES, FUNGI, DEAD TREES.
Features: STREAMS/RIVERS, SMALL LAKES.
Transitions: GRASS↔DIRT, GRASS↔WATER, GRASS↔STONE, FOREST↔MEADOW.

## JUNGLE
Ground: GRASS, DIRT, MUD/WET GROUND.
Water: COASTAL/SHALLOW, OPEN, local BRACKISH.
Landforms: ROCKS, HILLS, CLIFFS.
Vegetation: GIANT TREES, VINEY TREES, GIANT PLANTS, GIANT FUNGI, UNDERSTORY.
Features: RIVERS, WATERFALLS, WETLAND POCKETS.
The LPC Jungle source explicitly contains giant trees, giant mushrooms/fungi and giant plants; v2 is CC-BY 4.0 with a credits file. citeturn0search13

## DESERT
Ground: SAND, RED SAND, DRY GROUND.
Water: COASTAL/SHALLOW and local OPEN water such as oasis.
Landforms: DESERT HILLS, DESERT ROCKS, SAND CLIFFS.
Vegetation: CACTUS, SUCCULENTS, DRY SHRUBS, DESERT TREES.
The LPC Beach/Desert source explicitly contains cacti, desert plants and dry trees; repository binary provenance remains pending where exact identity is not established. citeturn0search11

## SWAMP / WETLAND
Ground: MUD, WET GROUND, GRASS, BOG.
Water: BRACKISH, COASTAL/SHALLOW, local OPEN.
Landforms: LOW HILLS, DEPRESSIONS.
Vegetation: MARSH PLANTS, REEDS, WATER PLANTS, FUNGI, WATERLOGGED/DEAD TREES.
Features: PONDS, MARSH CHANNELS, SINKS/POOLS.
LPC Terrains explicitly includes bog among its terrain scope. citeturn0search0

## SNOW / TUNDRA
Ground: SNOW, FROZEN GROUND, COLD STONE.
Water: COLD, FROZEN, regional OPEN/DEEP.
Landforms: SNOWY MOUNTAINS, HILLS, CLIFFS, ROCKS.
Vegetation: SNOWY FOREST, LOW COLD VEGETATION, SNOW-COVERED TREES.
Features: FROZEN LAKES, ICE, FROZEN WATERFALLS.
LPC Revised 4-Season Terrain provides seasonal terrain, animated water, waterfalls and a frozen waterfall variant. citeturn0search2

## MOUNTAIN / HILLS
Mountains and hills are landform modifiers, not mandatory climates.
Valid compositions include MOUNTAIN+FOREST, MOUNTAIN+SNOW, MOUNTAIN+DESERT, MOUNTAIN+TUNDRA and MOUNTAIN+VOLCANIC.
The LPC Mountains source covers mountains, hills, cliffs, rocks and snowy variants. citeturn0search5

## COASTAL
Coastal is geographic context, not a replacement for water state.
Land: BEACH, SAND, ROCK, CLIFF.
Water: COASTAL/SHALLOW, OPEN, offshore DEEP.
Vegetation is regional and only added when verified.

## Composition rules
1. One PNG gets one canonical Asset Library identity. Compatibility is many-to-many.
2. Terrain is selected before ecology: BIOME → GROUND → WATER → LANDFORM → VEGETATION → TRANSITIONS → SPECIAL FEATURES.
3. Water uses STATE + FEATURE. Example: RIVER+OPEN, DEEP RIVER+DEEP, FROZEN LAKE+FROZEN.
4. Seasonal modifiers do not create new biomes: FOREST+SNOW = SNOWY FOREST; LAKE+FREEZE = FROZEN LAKE.
5. Landforms are orthogonal: FOREST can have MOUNTAIN elevation; DESERT can have HILLS.
6. Transitions are compatibility rules, not biome-owned duplicate binaries.

## World Builder recipe
BiomeRecipe should contain biome, climate, moisture, elevation, season, ground, water states/features, landforms, vegetation, transitions and special features.
Asset Library resolves those references to verified binaries.

## Validation
Reject a recipe when provenance is unresolved, an asset is outside medieval-fantasy WORLD scope, a transition is unsupported, a water state/feature combination is invalid, no compatible vegetation exists, or a requested seasonal variant has no compatible source asset.
Do not reject merely because there is no PNG named after the biome.

## Canonical model
WORLD → MATERIALS (GROUND, WATER STATES)
WORLD → LANDFORMS (MOUNTAINS, HILLS, CLIFFS, NATURAL ROCKS)
WORLD → VEGETATION
WORLD → WATER FEATURES
WORLD → SPECIAL TERRAIN
WORLD → TRANSITIONS
WORLD → BIOME RECIPES

## Status
The biome layer is now a logical composition system suitable as the foundation for the future World Builder and Asset Library.