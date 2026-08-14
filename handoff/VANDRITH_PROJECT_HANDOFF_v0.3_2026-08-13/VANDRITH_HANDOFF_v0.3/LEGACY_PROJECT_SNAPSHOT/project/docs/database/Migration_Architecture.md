# World Layer Migration Architecture v1.0

> **Phase:** 1.2.3 — World Layer Migration Implementation
> **Sprint:** 1.2.3.1
> **Blueprint:** World Blueprint v1.0 (LOCKED)
> **Status:** IN PROGRESS
> **Owner:** Lead Database Architect
> **Approver:** Lead Architect
> **Reviewer:** Peer Architect

---

## 1. Overview

### 1.1 Purpose

This document defines the migration architecture for the World Layer. It
establishes the migration foundation, ordering rules, dependency rules, ownership
rules, validation strategy, synchronization rules, replay compatibility, and
rollback strategy for all 16 world tables.

This document is architecture documentation. It does not contain SQL, TypeScript,
or implementation code. It defines the rules and constraints that the migration
implementation must follow.

### 1.2 Scope

The migration architecture applies to all 16 world tables:

| Order | Table | Parent |
|-------|-------|--------|
| 01 | `worlds` | None |
| 02 | `continents` | `worlds` |
| 03 | `regions` | `continents` |
| 04 | `kingdoms` | `regions` |
| 05 | `cities` | `kingdoms` |
| 06 | `villages` | `kingdoms` |
| 07 | `roads` | `worlds` |
| 08 | `landmarks` | `worlds` |
| 09 | `dungeons` | `worlds` |
| 10 | `climates` | `worlds` |
| 11 | `ecosystems` | `worlds` |
| 12 | `factions` | `worlds` |
| 13 | `religions` | `worlds` |
| 14 | `world_history` | `worlds` |
| 15 | `major_world_events` | `worlds` |
| 16 | `locations` | `worlds` |

### 1.3 Boundaries

- The migration architecture defines migration order and rules only.
- The migration architecture does not define gameplay logic.
- The migration architecture does not define API code.
- The migration architecture does not define UI code.
- The migration architecture does not contain SQL implementation.
- The migration architecture follows the locked World Blueprint v1.0.

### 1.4 Locked Blueprint Compliance

| Blueprint | Status | Compliance |
|-----------|--------|------------|
| Database Architecture Blueprint v1.0 | LOCKED | This architecture follows all locked rules. |
| Foundation Blueprint v1.0 | LOCKED | This architecture depends on Foundation only. |
| World Blueprint v1.0 | LOCKED | This architecture implements the World Blueprint. |

---

## 2. Migration Foundation

### 2.1 Migration Principles

| Principle | Description |
|-----------|-------------|
| Additive Only | All migrations are additive. No migration removes a table, column, or relationship. |
| Forward-Only | Migrations are forward-only. No backward migration is performed. |
| Backward Compatible | All migrations are backward compatible. Existing data is never broken. |
| Ordered | Migrations execute in strict dependency order. No migration runs before its parent. |
| Deterministic | Migration execution is deterministic. The same migrations in the same order produce the same result. |
| Atomic | Each migration is atomic. It either fully succeeds or fully fails. |
| Idempotent | Each migration is idempotent. Running it twice produces the same result. |
| Logged | Every migration is logged in the Migration Log. |
| Reviewed | Every migration is reviewed by the Peer Architect. |
| Approved | Every migration is approved by the Lead Architect. |

### 2.2 Migration Dependencies

The World Layer is a directed acyclic graph (DAG). Every migration depends only on
its parent migration and the Foundation Layer. No migration depends on a sibling.
No migration creates a circular dependency.

| Migration | Depends On |
|-----------|-----------|
| 01_worlds | Foundation Layer |
| 02_continents | 01_worlds |
| 03_regions | 02_continents |
| 04_kingdoms | 03_regions |
| 05_cities | 04_kingdoms |
| 06_villages | 04_kingdoms |
| 07_roads | 01_worlds |
| 08_landmarks | 01_worlds |
| 09_dungeons | 01_worlds |
| 10_climates | 01_worlds |
| 11_ecosystems | 01_worlds |
| 12_factions | 01_worlds |
| 13_religions | 01_worlds |
| 14_world_history | 01_worlds |
| 15_major_world_events | 01_worlds |
| 16_locations | 01_worlds |

### 2.3 Migration Naming Convention

| Rule | Description |
|------|-------------|
| Format | `NN_table_name` where NN is the two-digit order number. |
| Zero-Padded | Order numbers are zero-padded (01, 02, ..., 16). |
| Snake Case | Table names are in snake_case. |
| Singular | Table names are singular where applicable. |
| Alphabetical Within Order | Migrations within the same order level are alphabetical. |

---

## 3. Migration Execution Rules

### 3.1 Execution Order

Migrations execute in strict numerical order. No migration executes before its
parent. No migration executes out of order. The execution order is:

```
01_worlds → 02_continents → 03_regions → 04_kingdoms → 05_cities →
06_villages → 07_roads → 08_landmarks → 09_dungeons → 10_climates →
11_ecosystems → 12_factions → 13_religions → 14_world_history →
15_major_world_events → 16_locations
```

### 3.2 Execution Constraints

| Constraint | Description |
|------------|-------------|
| No Parallel Execution | Migrations execute sequentially. No parallel migration execution. |
| No Reordering | Migrations cannot be reordered. The order is fixed. |
| No Skipping | No migration can be skipped. All migrations must execute. |
| No Partial Execution | A migration either fully completes or fully rolls back. |
| No Cross-Dependency | A migration cannot reference a table that has not yet been created. |

### 3.3 Execution Verification

After each migration, the following checks are performed:

| Check | Description |
|-------|-------------|
| Table Exists | The table has been created. |
| RLS Enabled | Row Level Security is enabled on the table. |
| Policies Exist | Four RLS policies exist (SELECT, INSERT, UPDATE, DELETE). |
| Foreign Key Valid | All foreign keys reference existing tables. |
| Indexes Created | All required indexes are created. |
| Ownership Column | The `user_id` column exists. |
| Timestamps | `created_at` and `updated_at` columns exist. |

---

## 4. Rollback Strategy

### 4.1 Rollback Philosophy

The rollback strategy is safety-first. No rollback destroys user data. No rollback
weakens a guarantee. Rollbacks are used only when a migration fails during execution.

### 4.2 Rollback Rules

| Rule | Description |
|------|-------------|
| Atomic Rollback | If a migration fails, it is fully rolled back. No partial state. |
| No Data Loss | Rollbacks do not destroy existing user data. |
| No Cascade | Rollbacks do not cascade to dependent tables. |
| Forward Recovery | After rollback, the system recovers forward by fixing and re-running the migration. |
| No Backward Migration | Rollbacks do not reverse previous successful migrations. |
| Logged | All rollbacks are logged. |
| Reviewed | All rollbacks are reviewed. |

### 4.3 Rollback Procedure

| Step | Action |
|------|--------|
| 1 | Migration fails. |
| 2 | Transaction is rolled back. No partial state remains. |
| 3 | The failure is logged in the Migration Log. |
| 4 | The Peer Architect is notified. |
| 5 | The migration is fixed. |
| 6 | The migration is re-run. |
| 7 | The rollback and re-run are documented. |

### 4.4 Rollback Restrictions

| Restriction | Description |
|--------------|-------------|
| No DROP TABLE | Rollbacks never drop a table. |
| No DROP COLUMN | Rollbacks never drop a column. |
| No DELETE DATA | Rollbacks never delete user data. |
| No ALTER TYPE | Rollbacks never change a column type. |
| No RENAME | Rollbacks never rename a table or column. |

---

## 5. Replay Compatibility

### 5.1 Replay Rules

| Rule | Description |
|------|-------------|
| No World Serialization | World data is not included in save snapshots except the world identifier. |
| No Replay Queries | Replays do not query world tables. Zero replay overhead. |
| Deterministic | Migration execution is deterministic. Same order, same result. |
| No Non-Determinism | No migration introduces non-determinism. |
| Identifier Stability | World identifiers never change after creation. |

### 5.2 Replay Guarantees

| Guarantee | Description |
|-----------|-------------|
| Replay Compatibility | Migrations preserve replay compatibility. |
| No Snapshot Impact | Migrations do not affect save snapshot format. |
| No Event Impact | Migrations do not affect event ordering. |
| No Determinism Impact | Migrations do not introduce non-determinism. |

---

## 6. Synchronization Compatibility

### 6.1 Synchronization Rules

| Rule | Description |
|------|-------------|
| Server-Authoritative | All world data synchronization is server-authoritative. |
| Non-Blocking | Synchronization is non-blocking. |
| No Client Authority | No migration introduces client-side authority. |
| No Corruption | No migration corrupts data. |
| Ownership Preserved | Synchronization preserves ownership. |

### 6.2 Synchronization Guarantees

| Guarantee | Description |
|-----------|-------------|
| Sync Compatibility | Migrations preserve synchronization compatibility. |
| Server Authority | Migrations do not introduce client-side authority. |
| Non-Blocking | Migrations do not introduce blocking synchronization. |
| Ownership | Migrations preserve ownership through `user_id` and RLS. |

---

## 7. Migration Compatibility

### 7.1 Compatibility Rules

| Rule | Description |
|------|-------------|
| Additive | All migrations are additive. |
| Forward-Only | All migrations are forward-only. |
| Backward Compatible | All migrations are backward compatible. |
| No Breaking Changes | No migration breaks existing data. |
| No Destructive Operations | No migration performs destructive operations. |

### 7.2 Compatibility Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Compatibility | Migrations preserve save snapshot format. |
| Replay Compatibility | Migrations preserve replay compatibility. |
| Migration Compatibility | Migrations are additive and forward-only. |
| Sync Compatibility | Migrations preserve synchronization compatibility. |
| Event Compatibility | Migrations do not affect event ordering. |
| Snapshot Compatibility | Migrations preserve snapshot format. |
| Ownership Compatibility | Migrations preserve ownership. |
| Dependency Compatibility | Migrations preserve the DAG. |
| Naming Compatibility | Migrations follow the naming convention. |
| Lock Policy Compatibility | Migrations follow the lock policy. |

---

## 8. Change Management

### 8.1 Change Rules

| Rule | Description |
|------|-------------|
| Versioned | All migration changes are versioned. |
| Reviewed | All migration changes are reviewed. |
| Approved | All migration changes are approved. |
| Documented | All migration changes are documented. |
| Additive | All migration changes are additive. |

### 8.2 Migration Log

Every migration is logged in `docs/database/Migration_Log.md`. The log records:

| Field | Description |
|-------|-------------|
| Migration Name | The name of the migration. |
| Order | The execution order number. |
| Date | The date the migration was applied. |
| Status | The status of the migration (PENDING, APPLIED, FAILED, ROLLED BACK). |
| Description | A description of the migration. |
| Dependencies | The dependencies of the migration. |
| Rollback Status | Whether the migration was rolled back. |

---

## 9. Document Control

| Field | Value |
|-------|-------|
| Document | Migration Architecture v1.0 |
| Phase | 1.2.3 — World Layer Migration Implementation |
| Sprint | 1.2.3.1 |
| Blueprint | World Blueprint v1.0 (LOCKED) |
| Status | IN PROGRESS |
| Owner | Lead Database Architect |
| Approver | Lead Architect |
| Reviewer | Peer Architect |
| Created | 2026-08-03 |
| Last Update | 2026-08-03 — Sprint 1.2.3.1 authored. Migration architecture defined. |
| Next Sprint | 1.2.3.2 — Migration implementation (SQL migrations for tables 01–04) |
