# World Layer Dependency Graph v1.0

> **Phase:** 1.2.3 — World Layer Migration Implementation
> **Sprint:** 1.2.3.1
> **Blueprint:** World Blueprint v1.0 (LOCKED)
> **Status:** IN PROGRESS
> **Owner:** Lead Database Architect

---

## 1. Overview

### 1.1 Purpose

This document defines the dependency graph for the World Layer. The World Layer is
a directed acyclic graph (DAG). Every table depends only on its parent table and the
Foundation Layer. No table depends on a sibling. No table creates a circular
dependency.

### 1.2 Scope

The dependency graph applies to all 16 world tables and their relationships to the
Foundation Layer.

### 1.3 Boundaries

- The dependency graph is a DAG. No circular dependencies.
- The dependency graph follows the World Blueprint v1.0.
- The dependency graph follows the Foundation Blueprint v1.0.
- No table depends on a sibling table.
- No table skips a dependency level.
- This document does not contain SQL implementation.

---

## 2. Dependency Hierarchy

### 2.1 Tree Diagram

```
Foundation Layer
  └── worlds (01)
        ├── continents (02)
        │     └── regions (03)
        │           └── kingdoms (04)
        │                 ├── cities (05)
        │                 └── villages (06)
        ├── roads (07)
        ├── landmarks (08)
        ├── dungeons (09)
        ├── climates (10)
        ├── ecosystems (11)
        ├── factions (12)
        ├── religions (13)
        ├── world_history (14)
        ├── major_world_events (15)
        └── locations (16)
```

### 2.2 Dependency Levels

| Level | Tables | Parent |
|-------|--------|--------|
| Foundation | Foundation Layer tables | None |
| 0 | `worlds` | Foundation Layer |
| 1 | `continents`, `roads`, `landmarks`, `dungeons`, `climates`, `ecosystems`, `factions`, `religions`, `world_history`, `major_world_events`, `locations` | `worlds` |
| 2 | `regions` | `continents` |
| 3 | `kingdoms` | `regions` |
| 4 | `cities`, `villages` | `kingdoms` |

---

## 3. Dependency Matrix

| Table | Depends On | Depended By | Level |
|-------|-----------|-------------|-------|
| `worlds` | Foundation Layer | `continents`, `roads`, `landmarks`, `dungeons`, `climates`, `ecosystems`, `factions`, `religions`, `world_history`, `major_world_events`, `locations` | 0 |
| `continents` | `worlds` | `regions` | 1 |
| `regions` | `continents` | `kingdoms` | 2 |
| `kingdoms` | `regions` | `cities`, `villages` | 3 |
| `cities` | `kingdoms` | None | 4 |
| `villages` | `kingdoms` | None | 4 |
| `roads` | `worlds` | None | 1 |
| `landmarks` | `worlds` | None | 1 |
| `dungeons` | `worlds` | None | 1 |
| `climates` | `worlds` | None | 1 |
| `ecosystems` | `worlds` | None | 1 |
| `factions` | `worlds` | None | 1 |
| `religions` | `worlds` | None | 1 |
| `world_history` | `worlds` | None | 1 |
| `major_world_events` | `worlds` | None | 1 |
| `locations` | `worlds` | None | 1 |

---

## 4. Dependency Rules

### 4.1 DAG Rules

| Rule | Description |
|------|-------------|
| DAG Preserved | The World Layer is a DAG. No circular dependencies. |
| No Circular Dependencies | No table depends on itself directly or indirectly. |
| No Sibling Dependencies | No table depends on a sibling table. |
| No Level Skip | No table skips a dependency level. |
| Parent Before Child | A parent table must exist before its child. |
| Foundation First | The Foundation Layer must be fully migrated before the World Layer. |

### 4.2 Foreign Key Rules

| Rule | Description |
|------|-------------|
| Single Parent | Each table has exactly one parent foreign key. |
| Foreign Key Required | Every table except `worlds` has a foreign key to its parent. |
| Foreign Key Nullable | Foreign keys are NOT NULL. Every child must belong to a parent. |
| Cascade Restrict | Foreign keys use RESTRICT on DELETE. No cascade deletion. |
| Index on Foreign Key | Every foreign key has an index. |
| Foreign Key Named | Foreign keys follow the naming convention: `fk_child_parent`. |

### 4.3 Dependency Direction Rules

| Rule | Description |
|------|-------------|
| Downward Only | Dependencies flow downward (parent to child). |
| No Upward Dependencies | No child table is referenced by its parent. |
| No Lateral Dependencies | No table references a sibling table. |
| No Cross-Layer Dependencies | The World Layer does not reference engine tables. |

---

## 5. Dependency Verification

### 5.1 Verification Checks

| Check | Description |
|-------|-------------|
| No Cycles | The dependency graph has no cycles. |
| All Parents Exist | Every table's parent exists before the table is created. |
| Foundation Complete | The Foundation Layer is fully migrated before the World Layer. |
| Foreign Keys Valid | All foreign keys reference existing tables. |
| No Orphaned Tables | No table exists without its parent. |
| No Sibling References | No table references a sibling table. |

### 5.2 Verification Procedure

| Step | Action |
|------|--------|
| 1 | Before each migration, verify the parent table exists. |
| 2 | After each migration, verify the foreign key is valid. |
| 3 | After all migrations, verify the entire graph is acyclic. |
| 4 | After all migrations, verify no orphaned tables exist. |
| 5 | Log all verification results. |

---

## 6. Dependency Guarantees

| Guarantee | Description |
|-----------|-------------|
| DAG Preserved | The dependency graph remains a DAG after all migrations. |
| No Circular Dependencies | No migration creates a circular dependency. |
| No Removed Dependencies | No migration removes a dependency. |
| No Weakened Dependencies | No migration weakens a dependency. |
| Foundation Integrity | The Foundation Layer is never modified by World Layer migrations. |
| Parent Integrity | A parent table is never deleted while children exist. |

---

## 7. Document Control

| Field | Value |
|-------|-------|
| Document | Dependency Graph v1.0 |
| Phase | 1.2.3 — World Layer Migration Implementation |
| Sprint | 1.2.3.1 |
| Blueprint | World Blueprint v1.0 (LOCKED) |
| Status | IN PROGRESS |
| Owner | Lead Database Architect |
| Created | 2026-08-03 |
| Last Update | 2026-08-03 — Sprint 1.2.3.1 authored. Dependency graph defined. |
| Next Sprint | 1.2.3.2 — Migration implementation (SQL migrations for tables 01–04) |
