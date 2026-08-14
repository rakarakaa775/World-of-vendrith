# World Layer Migration Order v1.0

> **Phase:** 1.2.3 — World Layer Migration Implementation
> **Sprint:** 1.2.3.1
> **Blueprint:** World Blueprint v1.0 (LOCKED)
> **Status:** IN PROGRESS
> **Owner:** Lead Database Architect

---

## 1. Overview

### 1.1 Purpose

This document defines the migration execution order for all 16 world tables. The
order is fixed and cannot be changed. Every migration depends on its parent
migration and the Foundation Layer.

### 1.2 Scope

The migration order applies to all 16 world table migrations.

### 1.3 Boundaries

- The migration order is fixed. No reordering.
- The migration order follows the dependency graph.
- The migration order follows the World Blueprint v1.0.
- This document does not contain SQL implementation.

---

## 2. Migration Sequence

| Order | Migration Name | Table | Parent Table | Dependency Level |
|-------|----------------|-------|--------------|-----------------|
| 01 | `01_worlds` | `worlds` | None | 0 (Foundation) |
| 02 | `02_continents` | `continents` | `worlds` | 1 |
| 03 | `03_regions` | `regions` | `continents` | 2 |
| 04 | `04_kingdoms` | `kingdoms` | `regions` | 3 |
| 05 | `05_cities` | `cities` | `kingdoms` | 4 |
| 06 | `06_villages` | `villages` | `kingdoms` | 4 |
| 07 | `07_roads` | `roads` | `worlds` | 1 |
| 08 | `08_landmarks` | `landmarks` | `worlds` | 1 |
| 09 | `09_dungeons` | `dungeons` | `worlds` | 1 |
| 10 | `10_climates` | `climates` | `worlds` | 1 |
| 11 | `11_ecosystems` | `ecosystems` | `worlds` | 1 |
| 12 | `12_factions` | `factions` | `worlds` | 1 |
| 13 | `13_religions` | `religions` | `worlds` | 1 |
| 14 | `14_world_history` | `world_history` | `worlds` | 1 |
| 15 | `15_major_world_events` | `major_world_events` | `worlds` | 1 |
| 16 | `16_locations` | `locations` | `worlds` | 1 |

---

## 3. Execution Order

Migrations execute in strict numerical order. No migration executes before its
parent.

```
01_worlds
  └── 02_continents
        └── 03_regions
              └── 04_kingdoms
                    ├── 05_cities
                    ├── 06_villages
                    ├── 07_roads
                    ├── 08_landmarks
                    ├── 09_dungeons
                    ├── 10_climates
                    ├── 11_ecosystems
                    ├── 12_factions
                    ├── 13_religions
                    ├── 14_world_history
                    ├── 15_major_world_events
                    └── 16_locations
```

---

## 4. Ordering Rules

| Rule | Description |
|------|-------------|
| Strict Numerical Order | Migrations execute in numerical order (01 through 16). |
| Parent Before Child | A parent migration must execute before its child. |
| No Reordering | The migration order is fixed. No reordering. |
| No Skipping | No migration can be skipped. All 16 must execute. |
| No Parallel Execution | Migrations execute sequentially. No parallel execution. |
| No Out-of-Order | No migration executes out of order. |
| Foundation First | The Foundation Layer must be fully migrated before 01_worlds. |

---

## 5. Dependency Level Explanation

| Level | Tables | Description |
|-------|--------|-------------|
| 0 | `worlds` | Depends on Foundation Layer only. Root of the World Layer. |
| 1 | `continents`, `roads`, `landmarks`, `dungeons`, `climates`, `ecosystems`, `factions`, `religions`, `world_history`, `major_world_events`, `locations` | Depend on `worlds` only. Direct children of the world root. |
| 2 | `regions` | Depends on `continents`. |
| 3 | `kingdoms` | Depends on `regions`. |
| 4 | `cities`, `villages` | Depend on `kingdoms`. Leaf tables. |

---

## 6. Migration Batches

Migrations may be implemented in batches for sprint planning. Each batch must
respect the dependency order.

| Batch | Migrations | Prerequisite |
|-------|-----------|-------------|
| Batch 1 | 01_worlds | Foundation Layer complete |
| Batch 2 | 02_continents | 01_worlds complete |
| Batch 3 | 03_regions | 02_continents complete |
| Batch 4 | 04_kingdoms | 03_regions complete |
| Batch 5 | 05_cities, 06_villages | 04_kingdoms complete |
| Batch 6 | 07_roads, 08_landmarks, 09_dungeons, 10_climates, 11_ecosystems, 12_factions, 13_religions, 14_world_history, 15_major_world_events, 16_locations | 01_worlds complete |

### Batch Rules

| Rule | Description |
|------|-------------|
| Dependency Respect | Each batch respects the dependency order. |
| Parent Complete | A batch cannot start until its parent batch is complete. |
| Sequential Within Batch | Within a batch, migrations execute in numerical order. |
| No Cross-Batch Dependency | A migration in one batch cannot depend on a migration in a later batch. |

---

## 7. Migration Status Tracking

| Status | Description |
|--------|-------------|
| PENDING | The migration has not been applied. |
| APPLIED | The migration has been successfully applied. |
| FAILED | The migration failed during execution. |
| ROLLED BACK | The migration was rolled back after failure. |

### Current Status

| Order | Migration | Status |
|-------|-----------|--------|
| 01 | `01_worlds` | PENDING |
| 02 | `02_continents` | PENDING |
| 03 | `03_regions` | PENDING |
| 04 | `04_kingdoms` | PENDING |
| 05 | `05_cities` | PENDING |
| 06 | `06_villages` | PENDING |
| 07 | `07_roads` | PENDING |
| 08 | `08_landmarks` | PENDING |
| 09 | `09_dungeons` | PENDING |
| 10 | `10_climates` | PENDING |
| 11 | `11_ecosystems` | PENDING |
| 12 | `12_factions` | PENDING |
| 13 | `13_religions` | PENDING |
| 14 | `14_world_history` | PENDING |
| 15 | `15_major_world_events` | PENDING |
| 16 | `16_locations` | PENDING |

---

## 8. Document Control

| Field | Value |
|-------|-------|
| Document | Migration Order v1.0 |
| Phase | 1.2.3 — World Layer Migration Implementation |
| Sprint | 1.2.3.1 |
| Blueprint | World Blueprint v1.0 (LOCKED) |
| Status | IN PROGRESS |
| Owner | Lead Database Architect |
| Created | 2026-08-03 |
| Last Update | 2026-08-03 — Sprint 1.2.3.1 authored. Migration order defined. |
| Next Sprint | 1.2.3.2 — Migration implementation (SQL migrations for tables 01–04) |
