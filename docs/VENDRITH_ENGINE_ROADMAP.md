# Vendrith Engine Roadmap

Status: PLANNING / SAVED FOR LATER

This document records the systems and architecture agreed for Vendrith World Builder and the future Vendrith Engine. It is a planning reference and does not require immediate implementation.

## Current priority

**Do not start these engine systems yet.**

The immediate priority is to finish importing, organizing, classifying, and verifying assets for the four map layers:

1. World Map
2. Region Map
3. Playable Map
4. Interior Map

After the four map asset libraries are sufficiently complete and verified, development can continue with the systems in this document.

## Main World Builder menu

```
VENDRITH WORLD BUILDER
├── 01_PREVIEW
├── 02_WORLD MAP
├── 03_REGION MAP
└── 04_PLAYABLE MAP
```

Preview is intended to become a live simulation preview, not only an image viewer.

## Core data flow

```
WORLD MAP
    +
REGION MAP
    +
PLAYABLE MAP
    +
INTERIOR MAP
    +
LIFE GENERATION
    +
SPAWN LIFE
    +
ITEM ASSET
    +
WORLD CIVILIZATION
    ↓
WORLD ENGINE
    ↓
TIME ENGINE
    ↓
4 SEASON ENGINE
    ↓
WEATHER ENGINE
    ↓
PREVIEW / GAME RUNTIME
```

## Planned systems

### 1. Life Generation

Creates reusable life types/templates.

Examples:
- humanoids
- beasts
- monsters
- aquatic life
- avian life
- reptilian life
- insectoid life
- plant life
- spiritual entities
- undead
- other life types

Life Generation creates the definition/template of a life form. It does not represent a specific individual living in the world.

### 2. Spawn Life

Creates and manages actual living entities placed in the world.

Planned responsibilities:

```
06_SPAWN_LIFE
├── 01_SPAWN_POINTS
├── 02_LIFE_PROFILES
├── 03_LIFE_PANEL
├── 04_FAMILIES
├── 05_RELATIONSHIPS
├── 06_AI_ENGINE
├── 07_LIFE_GROUPS
└── 08_SPAWN_RULES
```

Examples:
- spawn Player/NPC/Animal/Creature/Monster
- life profiles
- personality
- background
- occupation
- attributes and skills
- family trees
- relationships
- households and groups
- routines and needs
- AI behavior
- population and location rules

**Concept:** Life Generation creates life types; Spawn Life creates actual life entities.

### 3. Item Asset

A dedicated item-definition/data layer for objects that can be owned, used, traded, consumed, planted, equipped, or placed.

```
07_ITEM_ASSET
├── 01_CONSUMABLES
├── 02_CLOTHING
├── 03_EQUIPMENT
├── 04_FURNITURE
├── 05_GARDENING
├── 06_MATERIALS
├── 07_RESOURCES
├── 08_TRADE_GOODS
├── 09_BOOKS_DOCUMENTS
├── 10_QUEST_ITEMS
└── 11_SPECIAL_ITEMS
```

Item Asset defines the item. Inventory later manages actual ownership/instances.

### 4. World Civilization

The social, political, historical, cultural, and organizational layer of the world.

```
08_WORLD_CIVILIZATION
├── 01_TEMPLATES
├── 02_GENERATION
├── 03_CIVILIZATIONS
├── 04_SETTLEMENTS
├── 05_TERRITORIES
├── 06_ORGANIZATIONS
├── 07_HISTORY
├── 08_RELATIONSHIPS
└── 09_LORE
```

World Civilization can combine settlements into larger political entities and define:
- countries
- kingdoms
- empires
- republics
- city-states
- capitals, cities, towns, villages and outposts
- territories and borders
- organizations
- leadership and ranks
- culture and identity
- vision and mission
- laws and principles
- history and timelines
- diplomacy, trade, alliances and wars
- religion, traditions, mythology and legends

### World Civilization generation modes

The system should support:

- **Manual** — user selects all important fields.
- **Template** — user selects a predefined template.
- **Random** — compatible template options are selected automatically.
- **Hybrid** — some fields are locked manually while others are generated.

Random generation must use compatibility rules rather than arbitrary combinations.

## Preview simulation

Preview should eventually load the created world and run it using:

- World Engine
- Time Engine
- 4 Season Engine
- Weather Engine
- Life systems
- Civilization systems

### Time Engine

Planned data:
- year
- month
- day
- hour
- minute
- simulation speed

Example speeds:
`1x, 2x, 5x, 10x, 50x, 100x`

### 4 Season Engine

```
Spring → Summer → Autumn → Winter → Spring
```

Seasons should affect simulation systems such as:
- vegetation
- crops
- water
- snow and ice
- environmental conditions

The season system should not be implemented as a simple color filter.

### Weather Engine

Planned weather states:
- clear
- cloudy
- rain
- heavy rain
- storm
- wind
- fog
- snow
- blizzard
- special weather

Weather can depend on:
- season
- biome
- region
- location
- time

## Vendrith Engine architecture

World Builder should not become one giant monolithic application.

```
                 VENDRITH ENGINE
                        │
          ┌─────────────┴─────────────┐
          ↓                           ↓
 VENDRITH WORLD BUILDER          GAME RUNTIME
          │                           │
          ↓                           ↓
      WORLD DATA  ───────────────→  GAME
```

World Builder creates world/data. The engine runs that data. The game consumes the resulting world and gameplay state.

## Planned engine layers

### A. World Building

- World
- Region
- Playable
- Interior

### B. World Simulation

- World Engine
- Time Engine
- 4 Season Engine
- Weather Engine
- Life Generation
- Spawn Life
- Item Asset
- World Civilization
- Economy
- Faction

### C. Gameplay

- Quest Engine
- Dialogue Engine
- Economy Engine
- Faction Engine
- Inventory Engine
- Crafting Engine
- Construction Engine
- Skill/Attribute Engine
- Battle Engine

### D. Engine Core

- Entity System
- Event System
- Save/Load System
- Asset System
- Animation System
- Audio System
- Rendering
- Input
- Scene Management
- Plugin/Modding System
- Physics
- AI

## Battle Engine status

**Planned — not a current priority.**

The Battle Engine should not be forced into full implementation before sufficient combat animation assets exist.

The first future Battle Engine foundation can be logic-only:

```
BATTLE ENGINE
├── Combat Entity
├── Health
├── Damage
├── Defense
├── Attack
├── Target
├── Status Effect
├── Combat State
└── Battle Event
```

Example:

```
NPC A
HP 100
Attack 10

NPC B
HP 80
Defense 3

Attack result:
10 - 3 = 7 damage

Battle Event:
NPC A attacked NPC B
```

Animation should resolve the event separately. If an appropriate animation is unavailable, the system may use a placeholder rather than making combat logic dependent on a specific asset.

### Capability principle

Entities should expose only the capabilities they actually have.

```
LIFE #001
├── Animation
│   ├── idle ✓
│   ├── walk ✓
│   ├── run ✓
│   ├── attack ✓
│   ├── block ✗
│   └── dodge ✗
├── Combat
│   ├── melee ✓
│   ├── ranged ✗
│   └── magic ✗
└── Interaction
    ├── talk ✓
    ├── trade ✓
    └── craft ✓
```

The engine must not require every entity to have every animation or gameplay capability.

## Recommended implementation order after the four map asset stages

1. Core Entity System
2. Event System
3. World Engine
4. Time Engine
5. 4 Season Engine
6. Weather Engine
7. World / Region / Playable / Interior data integration
8. Life Generation
9. Spawn Life
10. Item Asset
11. World Civilization
12. Preview Simulation
13. Quest / Dialogue / Economy
14. Inventory / Crafting
15. Battle Engine foundation
16. Advanced Battle systems

## Important asset principle

Do not create or import assets merely to make a system appear complete.

Systems must work with assets that are actually available and whose provenance/license status has been verified.

Asset classification remains separate from engine-system design.

## Supabase data layer

Supabase may be used as the persistent data layer for:

- worlds
- regions
- playable areas
- life profiles
- families
- organizations
- civilizations
- items
- templates
- quests
- relationships
- history
- saves

Runtime logic should remain independent of the database.

```
VENDRITH ENGINE
      │
      ├── Runtime Logic
      │
      └── Data Layer
              │
              └── Supabase
```

Movement, animation, combat calculations, physics, weather transitions, and rendering should not depend directly on database round trips.

## Current project rule

**Finish the four map asset libraries first.**

Until that milestone is reached:
- do not prioritize full Battle Engine implementation
- do not expand the engine unnecessarily
- do not force missing assets into the library
- continue asset provenance/license verification
- keep the architecture documented so implementation can resume later

When the four map asset stages are complete, this document becomes the starting roadmap for the next development phase.
