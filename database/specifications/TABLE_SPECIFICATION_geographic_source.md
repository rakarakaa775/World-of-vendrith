# Vandrith Database — Table Specification v0.1

**Status:** `DRAFT — READY FOR REVIEW`  
**Version:** `v0.1`  
**Date:** 13 August 2026  
**Target:** Supabase / PostgreSQL  
**Scope:** World → Continent → Region → Location → Settlement

## 0. Purpose

This document converts the approved Database Schema Blueprint v0.1 into an implementable table specification.

**This is not SQL yet.** SQL is generated only after the complete table specification and schema audit are approved.

---

## 1. Design Rules

1. Every persistent entity receives a stable UUID.
2. Simulation time is authoritative; gameplay timestamps must not depend on device time.
3. Foreign keys protect domain relationships.
4. Historical records are not silently deleted.
5. Current state and historical state are separate concerns.
6. Settlement is not Civilization.
7. Settlement is not Polity.
8. A location can exist without being a settlement.
9. A settlement must have a location.
10. Geographic nesting must not create circular references.
11. Soft lifecycle states are preferred over destructive deletion.
12. Derived values must not become duplicated authoritative state.
13. `created_at` / `updated_at` are database audit timestamps; simulation timestamps use the simulation clock.
14. v0.1 must support one village and 50–100 starting NPCs without blocking later scaling.

## 2. Type Conventions

| Concept | PostgreSQL direction |
|---|---|
| Primary ID | `uuid` |
| Name | `text` |
| Description | `text` |
| Boolean | `boolean` |
| Count | `integer` |
| Decimal | `numeric` |
| Simulation timestamp | `timestamptz` |
| Flexible metadata | `jsonb` |
| Coordinates | `numeric` initially; PostGIS later |
| Enum-like state | `text` + `CHECK` initially |

---

# 3. `worlds`

**Responsibility:** Top-level simulation container.

| Column | Type | Null | Default | Key |
|---|---|---:|---|---|
| `id` | uuid | NO | generated UUID | PK |
| `name` | text | NO | — | — |
| `slug` | text | NO | — | UNIQUE |
| `description` | text | YES | null | — |
| `status` | text | NO | `active` | — |
| `current_tick` | bigint | NO | `0` | — |
| `current_simulation_time` | timestamptz | NO | project epoch | — |
| `created_at` | timestamptz | NO | `now()` | — |
| `updated_at` | timestamptz | NO | `now()` | — |

### Constraints

- `name <> ''`
- `slug` unique
- `current_tick >= 0`
- status: `active | paused | archived`

### Indexes

- unique `slug`
- `status`

### Authority

Time/World domain owns simulation time.

---

# 4. `continents`

**Responsibility:** Major geographic divisions within a world.

| Column | Type | Null | Default | Key |
|---|---|---:|---|---|
| `id` | uuid | NO | generated UUID | PK |
| `world_id` | uuid | NO | — | FK → worlds.id |
| `name` | text | NO | — | — |
| `slug` | text | NO | — | — |
| `description` | text | YES | null | — |
| `status` | text | NO | `active` | — |
| `created_at` | timestamptz | NO | `now()` | — |
| `updated_at` | timestamptz | NO | `now()` | — |

### Constraints

- `(world_id, slug)` unique
- `name <> ''`

### Delete rule

`RESTRICT` while dependent regions exist.

---

# 5. `regions`

**Responsibility:** Geographic regions within a continent.

| Column | Type | Null | Default | Key |
|---|---|---:|---|---|
| `id` | uuid | NO | generated UUID | PK |
| `continent_id` | uuid | NO | — | FK → continents.id |
| `name` | text | NO | — | — |
| `slug` | text | NO | — | — |
| `description` | text | YES | null | — |
| `climate_type` | text | YES | null | — |
| `status` | text | NO | `active` | — |
| `created_at` | timestamptz | NO | `now()` | — |
| `updated_at` | timestamptz | NO | `now()` | — |

### Constraints

- `(continent_id, slug)` unique
- `name <> ''`

### Indexes

- `continent_id`
- `(continent_id, status)`

### Delete rule

`RESTRICT` while dependent locations exist.

---

# 6. `locations`

**Responsibility:** Generic physical places. A location does not need to be a settlement.

Examples:

- forest
- lake
- mountain
- road
- mine
- ruins
- village site
- building site
- travel node

| Column | Type | Null | Default | Key |
|---|---|---:|---|---|
| `id` | uuid | NO | generated UUID | PK |
| `region_id` | uuid | NO | — | FK → regions.id |
| `parent_location_id` | uuid | YES | null | FK → locations.id |
| `name` | text | NO | — | — |
| `slug` | text | NO | — | — |
| `location_type` | text | NO | — | — |
| `description` | text | YES | null | — |
| `latitude` | numeric | YES | null | — |
| `longitude` | numeric | YES | null | — |
| `status` | text | NO | `active` | — |
| `created_at` | timestamptz | NO | `now()` | — |
| `updated_at` | timestamptz | NO | `now()` | — |

### Constraints

- `(region_id, slug)` unique
- `name <> ''`
- `parent_location_id <> id`
- coordinate range validation when coordinates are supplied

### Indexes

- `region_id`
- `parent_location_id`
- `location_type`
- `status`

### Important boundary

`locations` describes **where** something exists. It must not become a catch-all table for Life, Organization, Civilization, or other domain state.

---

# 7. `settlements`

**Responsibility:** Physical/social population centers such as camps, villages, towns, and cities.

Settlement is a domain entity built on a location.

| Column | Type | Null | Default | Key |
|---|---|---:|---|---|
| `id` | uuid | NO | generated UUID | PK |
| `location_id` | uuid | NO | — | FK → locations.id |
| `name` | text | NO | — | — |
| `slug` | text | NO | — | — |
| `settlement_type` | text | NO | `village` | — |
| `founded_at_simulation_time` | timestamptz | YES | null | — |
| `population_target` | integer | YES | null | — |
| `status` | text | NO | `active` | — |
| `description` | text | YES | null | — |
| `created_at` | timestamptz | NO | `now()` | — |
| `updated_at` | timestamptz | NO | `now()` | — |

### Constraints

- `location_id` unique in v0.1
- `population_target >= 0`
- `name <> ''`
- settlement type: `camp | village | town | city | capital | other`
- status: `active | abandoned | destroyed | archived`

### Important boundary

Do **not** make `civilization_id` or `kingdom_id` mandatory columns.

Political sovereignty and civilizational influence will later use relationship tables.

---

# 8. Crescent Moon Village Seed Contract

The first settlement is normal data, not hard-coded engine logic.

```text
World
└── Continent
    └── Region
        ├── Dangerous Forest Location
        └── Crescent Moon Village Location
            └── Crescent Moon Village Settlement
```

The village's relationship to the dangerous forest belongs to geography/location data, not a special engine rule.

---

# 9. Future-Compatible Relationships

Later domains may connect:

```text
settlements
    ↕
polities / political control

settlements
    ↕
civilization_influences

settlements
    ↕
settlement_history

settlements
    ↕
resources

settlements
    ↕
buildings
```

A settlement must be able to change political control without changing its geographic identity.

---

# 10. Domain Ownership

| Table | Authoritative domain |
|---|---|
| `worlds` | World / Time |
| `continents` | World |
| `regions` | World |
| `locations` | World |
| `settlements` | World / Settlement |

No unrelated engine should directly rewrite these tables.

---

# 11. Event Candidates

These are proposed event contracts, not final API names:

```text
world:created
world:state:changed

location:created
location:changed
location:status:changed

settlement:created
settlement:status:changed
settlement:location:changed
```

Population changes should later be derived from actual Life/Household membership, not from `population_target`.

---

# 12. Review Checklist

- [ ] UUID strategy confirmed
- [ ] simulation timestamp strategy confirmed
- [ ] geographic hierarchy confirmed
- [ ] location nesting confirmed
- [ ] settlement/location relationship confirmed
- [ ] delete/restrict policy confirmed
- [ ] status values confirmed
- [ ] indexes reviewed
- [ ] Supabase RLS strategy reviewed
- [ ] seed strategy reviewed
- [ ] compatibility with World Engine confirmed

---

# 13. Next Tables

After this foundation:

```text
06. buildings
07. services
08. resources
09. households
10. family_groups
11. lives
12. life_attributes
13. life_needs
14. fate
15. relationships
...
```

**Do not generate SQL yet.**

---

## Decision

`DRAFT — READY FOR REVIEW`

This specification establishes the stable geographic foundation for Crescent Moon Village while preserving the World Bible's separation between:

- place
- settlement
- political sovereignty
- civilization
- Life
- History
- Legacy
