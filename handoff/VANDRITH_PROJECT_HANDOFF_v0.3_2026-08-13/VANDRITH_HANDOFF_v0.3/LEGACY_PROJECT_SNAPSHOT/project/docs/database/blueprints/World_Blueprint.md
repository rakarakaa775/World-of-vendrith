# World Blueprint

> The Vendrith World — World Database Blueprint.
>
> This blueprint defines the world layer of the database schema: worlds,
> continents, regions, kingdoms, cities, villages, locations, landmarks, roads,
> dungeons, ecosystems, climates, world_history, major_world_events, factions, and
> religions. It is a design document only — no SQL, no TypeScript, no pseudocode,
> no implementation code.
>
> The blueprint follows the Database Architecture Blueprint v1.0 (LOCKED), the
> Foundation Blueprint v1.0 (READY FOR LOCK), the Engine Blueprint Standard v1.0,
> the Save Architecture, the Replay Architecture, the Synchronization
> Architecture, the Validation Architecture, the Event Bus Architecture, the
> Engine Dependency Graph, and the Naming Rules v1.0.
>
> **Blueprint Version:** v1.0 — Sprint 1.2.2.6
> **Blueprint Status:** LOCKED
> **Lock Status:** LOCKED
> **Owner:** Lead Database Architect

---

## Pending Chapters Table

| Chapter | Title | Sprint | Status |
|---------|-------|--------|--------|
| 1 | Identity | 1.2.2.1 | COMPLETE |
| 2 | Philosophy | 1.2.2.1 | COMPLETE |
| 3 | Purpose | 1.2.2.1 | COMPLETE |
| 4 | Responsibilities | 1.2.2.2 | COMPLETE |
| 5 | Schema Architecture | 1.2.2.2 | COMPLETE |
| 6 | Naming Convention | 1.2.2.2 | COMPLETE |
| 7 | Relationships | 1.2.2.3 | COMPLETE |
| 8 | Security | 1.2.2.3 | COMPLETE |
| 9 | Validation | 1.2.2.3 | COMPLETE |
| 10 | Performance | 1.2.2.4 | COMPLETE |
| 11 | Testing | 1.2.2.4 | COMPLETE |
| 12 | Future Expansion | 1.2.2.5 | COMPLETE |
| 13 | Dependencies | 1.2.2.5 | COMPLETE |
| 14 | Completion Checklist | 1.2.2.5 | COMPLETE |
| 15 | Lock Policy | 1.2.2.6 | COMPLETE |
| 16 | Visual Prototype | 1.2.2.6 | COMPLETE |

**Chapters 1–3 authored in Sprint 1.2.2.1. Chapters 4–6 authored in Sprint
1.2.2.2. Chapters 7–9 authored in Sprint 1.2.2.3. Chapters 10–11 authored in
Sprint 1.2.2.4. Chapters 12–14 authored in Sprint 1.2.2.5. Chapters 15–16
authored in Sprint 1.2.2.6. All 16 chapters are complete. The blueprint is
READY FOR LOCK.**

---

## Document Control

| Field | Value |
|-------|-------|
| Blueprint Name | World Blueprint |
| Blueprint Version | v1.0 — Sprint 1.2.2.6 |
| Blueprint Status | LOCKED |
| Lock Status | LOCKED |
| Phase | 1.2 — Database Schema Design |
| Sprint | 1.2.2.6 — Chapters 15–16 (Final Lock) |
| Owner | Lead Database Architect |
| Approver | Lead Architect |
| Reviewer | Peer Architect |
| Chapters Completed | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 |
| Chapters Pending | None |
| Last Update | 2026-08-03 — Sprint 1.2.2.6 authored (Chapters 15–16). All 16 chapters complete. Blueprint is LOCKED. |
| Next Sprint | 1.2.3 — World Layer Migration Implementation |
| Related Architecture | Database Architecture Blueprint v1.0 (LOCKED), Foundation Blueprint v1.0 (READY FOR LOCK) |

---

## 1. Identity

### Overview

This chapter defines the permanent identity record for the World Blueprint. The
World Blueprint defines the world layer of the database schema — the tables that
manage worlds, continents, regions, kingdoms, cities, villages, locations,
landmarks, roads, dungeons, ecosystems, climates, world history, major world
events, factions, and religions. These tables are the second layer of the database
schema, built on top of the Foundation Layer. Every gameplay system that references
geography, politics, ecology, or history depends on the World Layer.

The identity attributes below are permanent. They do not change when individual
tables are added, removed, or restructured. They identify the blueprint, not the
specific tables within it.

This chapter has 14 sections.

---

### 1.1 Blueprint Identity

#### Purpose

The blueprint identity defines the permanent name, abbreviation, domain, layer,
and schema group for the World Blueprint.

#### Scope

The blueprint identity applies to the entire World Blueprint — all 16 chapters
and all tables within the world layer.

#### Boundaries

The blueprint identity is permanent. It does not change when tables are added or
restructured. It identifies the blueprint, not the tables within it.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Permanent Name | The blueprint name is `World Blueprint` (abbreviated `WB`). It does not change. |
| Permanent Layer | The World Layer is Layer 2 of the 10-layer schema hierarchy. It does not change. |
| Permanent Domain | The domain is Database Schema Design. It does not change. |
| Permanent Schema Group | The schema group is World. It does not change. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint name is `World Blueprint` | Abbreviated `WB`. Used in documentation, cross-references, sprint logs, and the migration log. |
| The World Layer is Layer 2 of the 10-layer schema hierarchy | Per the Database Architecture Blueprint v1.0 §5. |
| The World Layer must be designed and locked before any layer above it | Layers 3–10 depend on the World Layer. |
| The blueprint name does not change when tables are added or restructured | It identifies the layer, not the tables. |

---

### 1.2 Blueprint Scope

#### Purpose

The blueprint scope defines what the World Blueprint covers and what it does not
cover.

#### Scope

The blueprint scope applies to all tables in the world layer: worlds, continents,
regions, kingdoms, cities, villages, locations, landmarks, roads, dungeons,
ecosystems, climates, world_history, major_world_events, factions, and religions.

#### Boundaries

The World Blueprint covers the static and semi-static world data — the geography,
political boundaries, ecology, climate, history, factions, and religions that define
the world. It does not cover gameplay systems (inventory, dialogue, quests, combat,
activities, NPC AI, economy) or save data. Those are covered by their respective
blueprints.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World Geography | The blueprint covers worlds, continents, regions, kingdoms, cities, villages, locations, landmarks, and roads. |
| World Ecology | The blueprint covers ecosystems and climates. |
| World History | The blueprint covers world_history and major_world_events. |
| World Politics | The blueprint covers factions and religions. |
| World Dungeons | The blueprint covers dungeons as world locations. |
| No Gameplay Systems | The blueprint does not cover inventory, dialogue, quests, combat, activities, NPC AI, or economy. |
| No Save Data | The blueprint does not cover save snapshots or save documents. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Blueprint covers 16 table domains | worlds, continents, regions, kingdoms, cities, villages, locations, landmarks, roads, dungeons, ecosystems, climates, world_history, major_world_events, factions, religions. |
| The World Blueprint does not cover gameplay systems | Those are covered by their respective blueprints. |
| The World Blueprint does not cover save data | That is covered by the Save Engine. |
| The scope is permanent | It does not change when tables are added or restructured. |

---

### 1.3 Blueprint Objectives

#### Purpose

The blueprint objectives define what the World Blueprint aims to achieve.

#### Scope

The blueprint objectives apply to the entire World Blueprint — all 16 chapters
and all tables within the world layer.

#### Boundaries

The objectives are goals, not guarantees. They define what the blueprint aims to
achieve, not what it promises. The guarantees are defined in Chapter 2
(Philosophy) and the compatibility rules throughout the blueprint.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Complete World Model | The blueprint provides a complete model of the world's geography, ecology, history, politics, and religion. |
| Replay-Compatible | The blueprint ensures world data does not introduce non-determinism into replays. |
| Migration-Safe | The blueprint ensures world migrations are additive, forward-only, and backward compatible. |
| Sync-Compatible | The blueprint ensures world data is server-authoritative and non-blocking. |
| Ownership-Safe | The blueprint ensures world data is scoped to the correct owner. |
| Performant | The blueprint ensures world queries are efficient and non-blocking. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint provides a complete world model | No gaps in geography, ecology, history, politics, or religion. |
| The blueprint is replay-compatible | World data does not introduce non-determinism. |
| The blueprint is migration-safe | Migrations are additive and forward-only. |
| The blueprint is sync-compatible | World data is server-authoritative and non-blocking. |
| The blueprint is ownership-safe | World data is scoped to the correct owner. |
| The blueprint is performant | World queries are efficient and non-blocking. |

---

### 1.4 Version Information

#### Purpose

The version information defines the current version, status, sprint, and chapter
completion for the World Blueprint.

#### Scope

The version information applies to the blueprint version — the version number in
the document control panel.

#### Boundaries

The initial version is v1.0. The blueprint is IN PROGRESS. Chapters 1–3 are
authored. Chapters 4–16 are pending. The blueprint cannot be reviewed, approved,
or locked until all 16 chapters are complete.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Initial Version | The initial version is v1.0. |
| Traceable | Every version is traceable to a sprint, date, and set of changes. |
| Semantic Versioning | Future versions follow semantic versioning (major.minor.patch). |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The initial version is v1.0 | No exceptions. |
| The blueprint is IN PROGRESS until all 16 chapters are complete | No partial locking. |
| The blueprint cannot be reviewed, approved, or locked until all chapters are complete | No exceptions. |
| Every version is traceable | Sprint, date, changes. |

---

### 1.5 Ownership Information

#### Purpose

The ownership information defines who owns, approves, and reviews the World
Blueprint.

#### Scope

The ownership information applies to the blueprint ownership — the owner, approver,
and reviewer.

#### Boundaries

The owner is the Lead Database Architect. The approver is the Lead Architect. The
reviewer is a peer architect. The owner does not change without Lead Architect
approval.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Defined Owner | The owner is the Lead Database Architect. |
| Defined Approver | The approver is the Lead Architect. |
| Defined Reviewer | The reviewer is a peer architect. |
| No Unapproved Changes | No change is merged without review and approval. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The owner is the Lead Database Architect | Authors chapters, performs self-review, resolves findings. |
| The approver is the Lead Architect | Approves the blueprint for lock. |
| The reviewer is a peer architect | Performs peer review. |
| The owner does not change without Lead Architect approval | No unauthorized changes. |

---

### 1.6 Dependency Information

#### Purpose

The dependency information defines what the World Blueprint depends on and what
depends on it.

#### Scope

The dependency information applies to all cross-layer dependencies involving the
World Layer.

#### Boundaries

The World Layer is Layer 2 of the 10-layer schema hierarchy. It depends on the
Foundation Layer (Layer 1). Layers 3–10 may depend on the World Layer. The World
Layer does not depend on any layer above it. No circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 2 | The World Layer is Layer 2 of the 10-layer schema hierarchy. |
| Foundation Dependency | The World Layer depends on the Foundation Layer (Layer 1) for user identity and ownership scoping. |
| No Upward Dependencies | The World Layer does not depend on any layer above it. |
| No Circular Dependencies | The World Layer does not create circular dependencies. |
| DAG Structure | The schema dependency graph remains a directed acyclic graph. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer is Layer 2 | Per the Database Architecture Blueprint v1.0 §5. |
| The World Layer depends on the Foundation Layer | Via `user_id` references. No copies of foundation data. |
| The World Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The World Layer follows the Engine Dependency Graph | Topological build order. |
| No engine imports a database client | (Engine Dependency Graph). |

---

### 1.7 Compatibility Requirements

#### Purpose

The compatibility requirements define what the World Blueprint must be compatible
with — the Save Engine, the Replay System, the Event Bus, the Synchronization
Architecture, and every other dependent system.

#### Scope

The compatibility requirements apply to all world tables, all world queries, all
world migrations, and all world sync operations.

#### Boundaries

All 10 compatibility guarantees are permanent. No world table, no world migration,
no world sync operation weakens a compatibility guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | World data does not affect save snapshots. The user ID is the only foundation reference. |
| Replay Compatibility | World data does not introduce non-determinism into replays. |
| Migration Compatibility | World migrations are additive, forward-only, and backward compatible. |
| Synchronization Compatibility | World data is server-authoritative and non-blocking. |
| Event Bus Compatibility | World data does not affect event ordering. |
| Snapshot Compatibility | World data does not affect existing snapshot format. |
| Save Compatibility | World data does not affect existing save format. |
| Ownership Compatibility | World data does not weaken RLS. |
| Lock Policy Compatibility | World data is documented and follows the lock policy. |
| Dependency Compatibility | World data does not create circular dependencies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are permanent | No weakening. |
| No world table weakens a compatibility guarantee | No exceptions. |
| No world migration weakens a compatibility guarantee | No exceptions. |
| No world sync operation weakens a compatibility guarantee | No exceptions. |
| Compatibility is tested | Every world table is tested against all dependent systems. |

---

### 1.8 Synchronization Requirements

#### Purpose

The synchronization requirements define how world data is synced. World data is
server-authoritative. Sync is non-blocking.

#### Scope

The synchronization requirements apply to all world data that is synced: world
metadata, faction membership, religion membership, and world events.

#### Boundaries

Sync is server-authoritative, non-blocking, and does not corrupt data. The World
Layer does not manage sync — the Synchronization Architecture does. The game
continues in a degraded state when the server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | World sync is server-authoritative. No client-side authority. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World sync is server-authoritative | No client-side authority. |
| World sync is non-blocking | No blocking gameplay. |
| World sync does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 1.9 Validation Requirements

#### Purpose

The validation requirements define how world data is validated. Validation is
enforced at the database boundary through constraints and RLS.

#### Scope

The validation requirements apply to all constraints, RLS policies, and validation
checks in the world layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
World Layer enforces validation — it does not define the validation framework.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is enforced at the database boundary. |
| Deterministic | Validation is deterministic. Same input, same result. |
| No Silent Failures | Validation failures are logged and surfaced. |
| No Data Destruction | Validation does not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| No validation failure is silent | Every failure is logged and surfaced. |
| No validation destroys data | Data preservation is the cardinal rule. |
| The World Layer enforces validation | It does not define the framework. |

---

### 1.10 Replay Requirements

#### Purpose

The replay requirements define how world data relates to the Replay System. World
data does not introduce non-determinism into replays.

#### Scope

The replay requirements apply to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots. The only world value in a snapshot is the
world identifier (if the engine references it). The World Layer has zero replay
overhead. The World Layer is unaware of the Replay System.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| Deterministic Identifiers | World, faction, and religion identifiers are deterministic. |
| No Non-Determinism | World data does not introduce non-determinism. |
| Cross-Platform Replay | World identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if the engine references it. |
| World identifiers are deterministic | Never change after creation. |
| No non-determinism from world data | Same state, same result. |
| The World Layer is unaware of the Replay System | No upward dependency. |
| World identifiers are platform-independent | Cross-platform replay works. |

---

### 1.11 Migration Requirements

#### Purpose

The migration requirements define how world migrations are managed. Migrations are
additive, forward-only, and backward compatible.

#### Scope

The migration requirements apply to all world migrations — any additive change
to the world schema.

#### Boundaries

No world migration drops a table, drops a column, renames a column, or changes a
column type. Every world migration is logged in the Migration Log. Every world
migration is tested against all dependent layers.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | World migrations are additive. No destructive operations. |
| Forward-Only | World migrations are forward-only. No backward migration. |
| Backward Compatible | World migrations do not break existing data. |
| Logged | Every world migration is recorded in the Migration Log. |
| Tested | Every world migration is tested against all dependent layers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World migrations are additive | No DROP, rename, or type change without a plan. |
| World migrations are forward-only | No backward migration. |
| Every world migration is logged | In `docs/database/Migration_Log.md`. |
| Every world migration is tested | Against all dependent layers. |
| No world migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |

---

### 1.12 Lock Policy

#### Purpose

The lock policy defines how the World Blueprint is frozen. Once locked, the
blueprint is the authoritative specification for the world layer.

#### Scope

The lock policy applies to the entire World Blueprint — all 16 chapters, all
sections, all guarantees, and all compatibility rules.

#### Boundaries

The blueprint is IN PROGRESS. It transitions to READY FOR LOCK when all 16
chapters are complete. It transitions to LOCKED when the Lead Architect approves.
Once locked, no chapter is added, no section is removed, no guarantee is weakened
without the exception procedure.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Authoritative | Once locked, the blueprint is the authoritative specification for the world layer. |
| Immutable | Once locked, no chapter, section, or guarantee is removed or weakened. |
| Exception-Based | Changes require the exception procedure. No ad-hoc changes. |
| Versioned | Every lock version is documented and traceable. |
| Reviewed | Every lock is reviewed and approved before it takes effect. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint is authoritative once locked | No competing specifications. |
| The blueprint is immutable once locked | No removal or weakening. |
| Changes require the exception procedure | No ad-hoc changes. |
| Every lock version is documented | Version, date, changes, approver. |
| Every lock is reviewed and approved | Lead Database Architect signs, Lead Architect approves. |
| The blueprint status is never reverted from LOCKED to IN PROGRESS | Permanent. |

---

### 1.13 Related Documents

#### Purpose

The related documents section defines all documents that the World Blueprint
references, follows, or is related to.

#### Scope

The related documents apply to all cross-references in the World Blueprint.

#### Boundaries

All related documents are locked or ready for lock. No related document is
modified by the World Blueprint. The World Blueprint follows them; it does not
change them.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid References | All cross-references are valid and traceable. |
| No Modification | No related document is modified by the World Blueprint. |
| Follows | The World Blueprint follows all related documents. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Blueprint follows the Database Architecture Blueprint v1.0 (LOCKED) | No modifications to it. |
| The World Blueprint follows the Foundation Blueprint v1.0 (READY FOR LOCK) | No modifications to it. |
| The World Blueprint follows the Engine Blueprint Standard v1.0 | No modifications to it. |
| The World Blueprint follows the Save Architecture | No modifications to it. |
| The World Blueprint follows the Replay Architecture | No modifications to it. |
| The World Blueprint follows the Synchronization Architecture | No modifications to it. |
| The World Blueprint follows the Validation Architecture | No modifications to it. |
| The World Blueprint follows the Event Bus Architecture | No modifications to it. |
| The World Blueprint follows the Engine Dependency Graph | No modifications to it. |
| The World Blueprint follows the Naming Rules v1.0 | No modifications to it. |
| All cross-references are valid | No broken references. |

---

### 1.14 Future Expansion Compatibility

#### Purpose

The future expansion compatibility section defines how the World Blueprint
supports future expansion. The World Layer is designed for additive growth.

#### Scope

The future expansion compatibility applies to all future tables, columns,
relationships, and systems added to the World Layer.

#### Boundaries

New tables, columns, and relationships are additive. Existing ones are not
removed. No expansion weakens a guarantee or creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive Growth | New tables, columns, and relationships are added. Existing ones are not removed. |
| Backward Compatible | New expansions do not break existing data, snapshots, or replays. |
| No Circular Dependencies | New expansions do not create circular dependencies. |
| No Weakening | No expansion weakens a guarantee or removes a rule. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Expansion is additive | No dropping existing tables, columns, or relationships. |
| Expansion is backward compatible | No breaking existing data. |
| Expansion does not create circular dependencies | The World Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and the schema documentation. |
| Expansion is tested against dependent layers | No breaking changes. |
| The data model is never optimized for the current sprint at the expense of the next phase | (Database Rules §10). |

---

## 2. Philosophy

### Overview

This chapter defines the permanent philosophical principles that govern the World
Blueprint. These principles translate the Database Architecture Blueprint v1.0,
the Foundation Blueprint v1.0, and the Engine Blueprint Standard v1.0 into
concrete world-layer rules. No principle may be violated without Lead Architect
approval.

This chapter defines 12 principles. Each principle includes purpose, scope,
boundaries, guarantees, and permanent rules.

---

### 2.1 Deterministic Execution

#### Purpose

The deterministic execution principle defines the permanent rule that world data
preserves deterministic execution. The same inputs always produce the same
outputs.

#### Scope

This principle applies to all world operations that affect game state or are part
of engine snapshots: world identifiers, faction identifiers, religion identifiers.

#### Boundaries

No world data introduces non-determinism. World identifiers are deterministic —
assigned at creation, never changed. No wall-clock time or unseeded randomness
affects world data that flows into snapshots.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Identifiers | World, faction, and religion identifiers are deterministic. Never change after creation. |
| No Wall-Clock Dependence | No wall-clock time affects world data in snapshots. |
| No Randomness | No unseeded randomness affects world data in snapshots. |
| Same Inputs, Same Outputs | The same world state always produces the same result. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World identifiers are deterministic | Assigned at creation, never changed. |
| No wall-clock time affects world data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects world data in snapshots | No random non-determinism. |
| The same world state always produces the same result | Deterministic execution. |

---

### 2.2 Ownership Consistency

#### Purpose

The ownership consistency principle defines the permanent rule that world data is
scoped to the correct owner. RLS is enforced. No cross-user access from the client.

#### Scope

This principle applies to all RLS policies, all access paths, and all trust
boundaries in the world layer.

#### Boundaries

RLS is enabled on every world table. Four policies per table (SELECT, INSERT,
UPDATE, DELETE). The service role key is server-side only. No cross-user access
from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every world table. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |
| Ownership Scoping | World data is scoped to the correct owner. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| World data is scoped to the correct owner | No unauthorized access. |

---

### 2.3 Event-Driven Architecture

#### Purpose

The event-driven architecture principle defines the permanent rule that world
data follows the Event Bus's publish/subscribe model. World data does not affect
event ordering.

#### Scope

This principle applies to all world operations that emit or consume events:
world creation, world updates, faction changes, religion changes.

#### Boundaries

The World Layer publishes events through the Event Bus. It does not manage the
Event Bus. World data does not affect event ordering. Events are deterministic.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Event Bus Compliance | World data follows the Event Bus's publish/subscribe model. |
| No Event Ordering Changes | World data does not affect event ordering. |
| Deterministic Events | World events are deterministic. |
| No Upward Dependency | The World Layer does not depend on any gameplay engine's event handling. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data follows the Event Bus's publish/subscribe model | No direct coupling. |
| World data does not affect event ordering | Event ordering is preserved. |
| World events are deterministic | Same state, same events. |
| The World Layer does not manage the Event Bus | It publishes and subscribes. |

---

### 2.4 Replay Compatibility

#### Purpose

The replay compatibility principle defines the permanent rule that world data does
not introduce non-determinism into replays. The same state always produces the
same result.

#### Scope

This principle applies to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots (except the world identifier if the engine
references it). No world data introduces non-determinism. Replays do not query
world tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| Deterministic Identifiers | World identifiers are deterministic. |
| Cross-Platform Replay | World identifiers are platform-independent. |
| No Non-Determinism | World data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| World identifiers are deterministic | Never change after creation. |
| No non-determinism from world data | Same state, same result. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are platform-independent | Cross-platform replay works. |

---

### 2.5 Migration Safety

#### Purpose

The migration safety principle defines the permanent rule that world migrations
are additive, forward-only, and backward compatible. No migration destroys data.

#### Scope

This principle applies to all world migrations — any additive change to the world
schema.

#### Boundaries

No world migration drops a table, drops a column, renames a column, or changes a
column type. Every world migration is logged and tested. The previous valid state
is always retained.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | World migrations are additive. No destructive operations. |
| Forward-Only | World migrations are forward-only. No backward migration. |
| Backward Compatible | World migrations do not break existing data. |
| No Data Loss | No migration destroys data. The previous valid state is retained. |
| Tested | Every world migration is tested against all dependent layers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World migrations are additive | No DROP, rename, or type change without a plan. |
| World migrations are forward-only | No backward migration. |
| Every world migration is logged | In `docs/database/Migration_Log.md`. |
| Every world migration is tested | Against all dependent layers. |
| No world migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |

---

### 2.6 Synchronization Consistency

#### Purpose

The synchronization consistency principle defines the permanent rule that world
data is server-authoritative and non-blocking. Sync does not corrupt data.

#### Scope

This principle applies to all world data that is synced: world metadata, faction
membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative, non-blocking, and does not corrupt data. The World
Layer does not manage sync. The game continues in a degraded state when the server
is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | World sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World sync is server-authoritative | No client-side authority. |
| World sync is non-blocking | No blocking gameplay. |
| World sync does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 2.7 Data Integrity

#### Purpose

The data integrity principle defines the permanent rule that world data is
accurate, consistent, and complete. Constraints and RLS enforce integrity.

#### Scope

This principle applies to all constraints, RLS policies, and validation checks in
the world layer.

#### Boundaries

Data integrity is enforced at the database boundary. Constraints prevent invalid
data. RLS prevents unauthorized access. No validation failure is silent. No
validation destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Constraint-Enforced | Constraints prevent invalid data. |
| RLS-Enforced | RLS prevents unauthorized access. |
| No Silent Failures | Every validation failure is logged and surfaced. |
| No Data Destruction | No validation destroys data. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Constraints prevent invalid data | NOT NULL, UNIQUE, CHECK, foreign key. |
| RLS prevents unauthorized access | No cross-user access. |
| No validation failure is silent | Every failure is logged and surfaced. |
| No validation destroys data | Data preservation is the cardinal rule. |
| Foreign keys are enforced | No orphan rows. |
| Data integrity wins over performance | If a performance optimization compromises integrity, integrity wins. |

---

### 2.8 Scalability

#### Purpose

The scalability principle defines the permanent rule that the world layer scales
to support large worlds — many continents, many regions, many cities, many
locations, many factions, many religions.

#### Scope

This principle applies to all world tables that grow large over time: locations,
landmarks, roads, dungeons, factions, religions, world_history, major_world_events.

#### Boundaries

The world layer is designed for scalability from the start. Indexes are justified
by evidence. Queries are bounded. No query loads an unbounded result set. Storage
is bounded per world.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Bounded Result Sets | Queries return bounded result sets. Pagination is used. |
| Bounded Storage | Each world has a documented storage limit. |
| Indexed Foreign Keys | All foreign key columns are indexed. |
| No Unbounded Loads | No query loads an entire table into memory. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Queries return bounded result sets | Pagination is used for large result sets. |
| Each world has a storage limit | No unbounded worlds. |
| All foreign keys are indexed | No unindexed foreign keys. |
| No query loads an entire table into memory | Use pagination or filtering. |
| Indexes are justified by evidence | No speculative indexes. |

---

### 2.9 Maintainability

#### Purpose

The maintainability principle defines the permanent rule that the world layer is
maintainable — readable, documented, and testable.

#### Scope

This principle applies to all world tables, all world constraints, all world RLS
policies, and all world documentation.

#### Boundaries

The world layer is documented in the ERD, the blueprint, and Schema.md. Every
table, every constraint, and every RLS policy is documented. Every world table
is tested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Every world table, constraint, and RLS policy is documented. |
| Tested | Every world table is tested. |
| Readable | The world layer is readable and maintainable. |
| Traceable | Every world table is traceable to the blueprint and ERD. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world table is documented | ERD, blueprint, Schema.md. |
| Every world constraint is documented | In the blueprint and Schema.md. |
| Every world RLS policy is documented | In the blueprint and Schema.md. |
| Every world table is tested | Against all dependent layers. |
| The world layer is readable and maintainable | No unnecessary complexity. |

---

### 2.10 Extensibility

#### Purpose

The extensibility principle defines the permanent rule that the world layer is
extensible — new tables, new columns, and new relationships can be added without
breaking existing data.

#### Scope

This principle applies to all future expansions of the world layer.

#### Boundaries

Expansion is additive. Existing tables, columns, and relationships are not
removed. No expansion weakens a guarantee or creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive Growth | New tables, columns, and relationships are added. Existing ones are not removed. |
| Backward Compatible | New expansions do not break existing data. |
| No Circular Dependencies | New expansions do not create circular dependencies. |
| No Weakening | No expansion weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Expansion is additive | No dropping existing tables, columns, or relationships. |
| Expansion is backward compatible | No breaking existing data. |
| Expansion does not create circular dependencies | The World Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and Schema.md. |
| Expansion is tested against dependent layers | No breaking changes. |
| The data model is never optimized for the current sprint at the expense of the next phase | (Database Rules §10). |

---

### 2.11 Snapshot Isolation

#### Purpose

The snapshot isolation principle defines the permanent rule that world data is not
serialized into engine snapshots. The Save Engine references world identifiers; it
does not serialize world tables.

#### Scope

This principle applies to the boundary between the World Layer and the Save
Engine's snapshot system.

#### Boundaries

World data is not in engine snapshots (except the world identifier if the engine
references it). The Save Engine references world identifiers; it does not query
world tables during save/load. The World Layer is unaware of the Save Engine.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No World Serialization | World tables are not serialized into snapshots. |
| Identifier Reference Only | The Save Engine references world identifiers, not world data. |
| No Save Engine Dependency | The World Layer is unaware of the Save Engine. |
| Zero Snapshot Overhead | World data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World tables are not in snapshots | Except the world identifier if referenced. |
| The Save Engine references world identifiers | No world data in snapshots. |
| The Save Engine does not query world tables during save/load | No database queries. |
| The World Layer is unaware of the Save Engine | No upward dependency. |
| World data does not increase snapshot size | Zero overhead. |

---

### 2.12 Dependency Discipline

#### Purpose

The dependency discipline principle defines the permanent rule that the World
Layer depends only on the Foundation Layer and does not create circular
dependencies.

#### Scope

This principle applies to all dependencies — intra-layer (between world tables)
and cross-layer (between the World Layer and other schema layers).

#### Boundaries

The World Layer is Layer 2. It depends on the Foundation Layer (Layer 1). It does
not depend on any layer above it. No circular dependencies. The schema dependency
graph remains a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 2 | The World Layer is Layer 2. |
| Foundation Dependency Only | The World Layer depends only on the Foundation Layer. |
| No Upward Dependencies | The World Layer does not depend on any layer above it. |
| No Circular Dependencies | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer is Layer 2 | Per the Database Architecture Blueprint v1.0 §5. |
| The World Layer depends only on the Foundation Layer | Via `user_id` references. |
| The World Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The World Layer follows the Engine Dependency Graph | Topological build order. |
| No engine imports a database client | (Engine Dependency Graph). |

---

## 3. Purpose

### Overview

This chapter defines the purpose of the World Blueprint. It defines what is in
scope, what is out of scope, and the boundaries that govern the world layer. It
also defines the world structure diagram — the visual hierarchy of the world
layer's tables.

This chapter has 8 sections.

---

### 3.1 In-Scope Domains

#### Purpose

The in-scope domains section defines the table domains that the World Blueprint
governs.

#### Scope

The in-scope domains are the 16 table domains within the world layer.

#### Boundaries

The in-scope domains are permanent. They define what the World Blueprint covers.
No in-scope domain is removed after locking.

#### In-Scope Domains

| Domain | Description |
|--------|-------------|
| worlds | The top-level world entity. A world contains continents, factions, religions, and history. |
| continents | Large landmasses within a world. A continent contains regions. |
| regions | Subdivisions of a continent. A region contains kingdoms. |
| kingdoms | Political entities within a region. A kingdom contains cities and villages. |
| cities | Large settlements within a kingdom. A city has locations and landmarks. |
| villages | Small settlements within a kingdom. A village has locations and landmarks. |
| locations | Points of interest within a city, village, or region. A location is the atomic unit of world geography. |
| landmarks | Notable features within a location, city, village, or region. A landmark is a point of interest that is not a settlement. |
| roads | Connections between locations. A road links two locations. |
| dungeons | Instanced or static adventure areas. A dungeon is a special type of location. |
| ecosystems | Ecological systems within a region or continent. An ecosystem defines flora, fauna, and biome. |
| climates | Climate zones within a continent or world. A climate defines weather patterns and temperature ranges. |
| world_history | Historical records for a world. World history is a chronological log of events. |
| major_world_events | Significant events that shaped the world. Major world events are the highlights of world history. |
| factions | Political, military, or social organizations within a world. A faction has members and territory. |
| religions | Belief systems within a world. A religion has followers and tenets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Blueprint covers 16 table domains | No missing domains. |
| No in-scope domain is removed after locking | The scope is permanent. |
| Every in-scope domain is documented in the ERD, blueprint, and Schema.md | No undocumented domains. |
| Every in-scope domain follows the Naming Rules v1.0 | `snake_case`, singular table names. |

---

### 3.2 Out-of-Scope Domains

#### Purpose

The out-of-scope domains section defines the table domains that the World
Blueprint does not govern. These domains are covered by their respective
blueprints.

#### Scope

The out-of-scope domains are the gameplay and system domains that are not part of
the world layer.

#### Boundaries

The out-of-scope domains are permanent. They define what the World Blueprint does
not cover. No out-of-scope domain is moved into the World Blueprint without a new
blueprint or an exception.

#### Out-of-Scope Domains

| Domain | Covered By |
|--------|------------|
| inventory | Inventory Engine Blueprint |
| dialogue | Dialogue Engine Blueprint |
| quest | Quest Engine Blueprint |
| combat | Combat Engine (future blueprint) |
| activity | Activity Engine Blueprint |
| save | Save Engine Blueprint |
| npc_ai | NPC AI Engine Blueprint |
| economy | Economy Engine Blueprint |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Blueprint does not cover gameplay systems | Those are covered by their respective blueprints. |
| The World Blueprint does not cover save data | That is covered by the Save Engine. |
| No out-of-scope domain is moved into the World Blueprint without a new blueprint or an exception | No scope creep. |
| The out-of-scope list is permanent | It does not change after locking. |

---

### 3.3 Ownership Boundaries

#### Purpose

The ownership boundaries section defines who owns world data and how RLS scopes
access.

#### Scope

The ownership boundaries apply to all world tables and all RLS policies in the
world layer.

#### Boundaries

World data is owned by the user who created the world. RLS scopes every query to
the authenticated user. The service role key bypasses RLS for server-side
operations (edge functions only). No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Owned | World data is owned by the user who created the world. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is owned by the user who created the world | `user_id` references the Foundation Layer. |
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |

---

### 3.4 Synchronization Boundaries

#### Purpose

The synchronization boundaries section defines how world data is synced and what
sync does not cover.

#### Scope

The synchronization boundaries apply to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. The World Layer does not manage
sync. Sync does not corrupt data. The game continues in a degraded state when the
server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | World sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |
| No Client-Side Authority | No client-side conflict resolution. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World sync is server-authoritative | No client-side authority. |
| World sync is non-blocking | No blocking gameplay. |
| World sync does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 3.5 Replay Boundaries

#### Purpose

The replay boundaries section defines how world data relates to replays. World
data does not introduce non-determinism into replays.

#### Scope

The replay boundaries apply to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots (except the world identifier if the engine
references it). Replays do not query world tables. The World Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| Deterministic Identifiers | World identifiers are deterministic. |
| Cross-Platform Replay | World identifiers are platform-independent. |
| No Non-Determinism | World data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| World identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from world data | Same state, same result. |

---

### 3.6 Dependency Boundaries

#### Purpose

The dependency boundaries section defines what the World Layer depends on and what
depends on it.

#### Scope

The dependency boundaries apply to all cross-layer dependencies involving the
World Layer.

#### Boundaries

The World Layer is Layer 2. It depends on the Foundation Layer (Layer 1). Layers
3–10 may depend on the World Layer. The World Layer does not depend on any layer
above it. No circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 2 | The World Layer is Layer 2. |
| Foundation Dependency | The World Layer depends on the Foundation Layer. |
| No Upward Dependencies | The World Layer does not depend on any layer above it. |
| No Circular Dependencies | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer is Layer 2 | Per the Database Architecture Blueprint v1.0 §5. |
| The World Layer depends on the Foundation Layer | Via `user_id` references. |
| The World Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The World Layer follows the Engine Dependency Graph | Topological build order. |

---

### 3.7 Validation Boundaries

#### Purpose

The validation boundaries section defines how world data is validated and what
validation does not cover.

#### Scope

The validation boundaries apply to all constraints, RLS policies, and validation
checks in the world layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
World Layer enforces validation — it does not define the validation framework. No
validation failure is silent.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is enforced at the database boundary. |
| Deterministic | Validation is deterministic. |
| No Silent Failures | Validation failures are logged and surfaced. |
| No Data Destruction | Validation does not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| No validation failure is silent | Every failure is logged and surfaced. |
| No validation destroys data | Data preservation is the cardinal rule. |
| The World Layer enforces validation | It does not define the framework. |

---

### 3.8 World Structure Diagram

#### Purpose

The world structure diagram defines the visual hierarchy of the world layer's
tables. It shows how world entities nest and relate.

#### Scope

The world structure diagram applies to all 16 world tables and their
relationships.

#### Boundaries

The diagram is a specification, not an implementation. It defines the hierarchy
and relationships. It does not define the schema or the queries.

#### World Hierarchy

```
world
├── continents
│   ├── regions
│   │   ├── kingdoms
│   │   │   ├── cities
│   │   │   │   ├── locations
│   │   │   │   └── landmarks
│   │   │   └── villages
│   │   │       ├── locations
│   │   │       └── landmarks
│   │   ├── locations
│   │   ├── landmarks
│   │   └── dungeons
│   ├── ecosystems
│   └── climates
├── roads (connect locations)
├── world_history
│   └── major_world_events
├── factions
└── religions
```

#### World Hierarchy Description

| Level | Entity | Parent | Description |
|------|--------|--------|-------------|
| 1 | world | — | The top-level world entity. |
| 2 | continents | world | Large landmasses within a world. |
| 3 | regions | continent | Subdivisions of a continent. |
| 4 | kingdoms | region | Political entities within a region. |
| 5 | cities | kingdom | Large settlements within a kingdom. |
| 5 | villages | kingdom | Small settlements within a kingdom. |
| 6 | locations | city, village, or region | Points of interest. The atomic unit of world geography. |
| 6 | landmarks | location, city, village, or region | Notable features that are not settlements. |
| 6 | dungeons | region or location | Adventure areas. A special type of location. |
| 2 | roads | — (connects two locations) | Connections between locations. Cross-cutting. |
| 2 | ecosystems | continent or region | Ecological systems. |
| 2 | climates | continent or world | Climate zones. |
| 2 | world_history | world | Historical records. |
| 3 | major_world_events | world_history | Significant events. |
| 2 | factions | world | Political, military, or social organizations. |
| 2 | religions | world | Belief systems. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The world hierarchy is a tree | No circular parent-child relationships. |
| The world is the root | Every world entity descends from a world. |
| Locations are the atomic unit | Every geographical reference resolves to a location. |
| Roads are cross-cutting | They connect locations regardless of parent. |
| The diagram is a specification | Not an implementation. |
| The diagram is documented | In the ERD, the blueprint, and Schema.md. |

---

## Sprint 1.2.2.1 Review

### Sprint Summary

**Sprint:** 1.2.2.1 — World Blueprint v1.0 (Chapters 1–3)
**Status:** COMPLETE
**Date:** 2026-08-03

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 1 | Identity | 14 sections: blueprint identity, blueprint scope, blueprint objectives, version information, ownership information, dependency information, compatibility requirements, synchronization requirements, validation requirements, replay requirements, migration requirements, lock policy, related documents, future expansion compatibility. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 2 | Philosophy | 12 principles: deterministic execution, ownership consistency, event-driven architecture, replay compatibility, migration safety, synchronization consistency, data integrity, scalability, maintainability, extensibility, snapshot isolation, dependency discipline. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 3 | Purpose | 8 sections: in-scope domains (16 table domains), out-of-scope domains (8 gameplay/system domains), ownership boundaries, synchronization boundaries, replay boundaries, dependency boundaries, validation boundaries, world structure diagram. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–3) | PASS |
| No gaps in chapter numbering | PASS |
| Deterministic execution preserved | PASS |
| Replay compatibility preserved | PASS |
| Migration compatibility preserved | PASS |
| Synchronization compatibility preserved | PASS |
| Ownership consistency preserved | PASS |
| Dependency consistency preserved | PASS |
| Naming consistency preserved | PASS |
| Lock policy compliance preserved | PASS |
| Event ordering consistency preserved | PASS |
| Snapshot compatibility preserved | PASS |
| Save compatibility preserved | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Blueprint documentation only | PASS |

### Notes

- The World Blueprint is IN PROGRESS. Chapters 4–16 are pending.
- Next sprint: 1.2.2.2 — Chapter 4 (Responsibilities), Chapter 5 (Schema Architecture), Chapter 6 (Naming Convention).

---

## 4. Responsibilities

### Overview

This chapter defines the permanent responsibilities of the World Layer. It defines
what the World Layer is responsible for, what it is not responsible for, and the
guarantees it provides to every dependent system. No responsibility may be removed
after locking.

This chapter has 12 sections. Every section includes purpose, scope, boundaries,
guarantees, and permanent rules.

---

### 4.1 Primary Responsibilities

#### Purpose

The primary responsibilities section defines the core duties of the World Layer —
the things it must do for the world to function.

#### Scope

The primary responsibilities apply to all 16 world tables and all world
operations.

#### Boundaries

The World Layer is responsible for modeling the world's geography, ecology,
history, politics, and religion. It is not responsible for gameplay systems, save
data, or engine state.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Complete World Model | The World Layer provides a complete model of the world's geography, ecology, history, politics, and religion. |
| Deterministic Identifiers | All world identifiers are deterministic. Assigned at creation, never changed. |
| Referential Integrity | All foreign keys are enforced. No orphan rows. |
| Ownership Scoping | All world data is scoped to the correct owner via RLS. |
| Replay Compatibility | World data does not introduce non-determinism into replays. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer models 16 table domains | worlds, continents, regions, kingdoms, cities, villages, locations, landmarks, roads, dungeons, ecosystems, climates, world_history, major_world_events, factions, religions. |
| All world identifiers are deterministic | Never change after creation. |
| All foreign keys are enforced | No orphan rows. |
| All world data is scoped via RLS | No cross-user access from the client. |
| World data does not introduce non-determinism into replays | Same state, same result. |
| No primary responsibility is removed after locking | Permanent. |

---

### 4.2 Secondary Responsibilities

#### Purpose

The secondary responsibilities section defines the supporting duties of the
World Layer — things that enable the primary responsibilities.

#### Scope

The secondary responsibilities apply to all world tables, world documentation,
and world testing.

#### Boundaries

The World Layer is responsible for documenting its tables, testing its tables, and
providing indexes for efficient queries. It is not responsible for the testing
framework, the documentation framework, or the indexing engine.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Every world table, constraint, and RLS policy is documented. |
| Tested | Every world table is tested against all dependent layers. |
| Indexed | All foreign key columns are indexed. |
| Bounded Queries | Queries return bounded result sets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world table is documented | ERD, blueprint, Schema.md. |
| Every world table is tested | Against all dependent layers. |
| All foreign keys are indexed | No unindexed foreign keys. |
| Queries return bounded result sets | Pagination is used. |
| The World Layer does not define the testing framework | It uses the Testing Architecture. |
| The World Layer does not define the documentation framework | It uses the project's documentation standards. |

---

### 4.3 Ownership Responsibilities

#### Purpose

The ownership responsibilities section defines how the World Layer manages data
ownership and access control.

#### Scope

The ownership responsibilities apply to all RLS policies, all access paths, and
all trust boundaries in the world layer.

#### Boundaries

RLS is enabled on every world table. Four policies per table. The service role
key is server-side only. No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every world table. |
| Four Policies Per Table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| World data is scoped to the correct owner | No unauthorized access. |
| No ownership responsibility is removed after locking | Permanent. |

---

### 4.4 Validation Responsibilities

#### Purpose

The validation responsibilities section defines how the World Layer validates
data integrity.

#### Scope

The validation responsibilities apply to all constraints, RLS policies, and
validation checks in the world layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
World Layer enforces validation — it does not define the validation framework.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is enforced at the database boundary. |
| Deterministic | Validation is deterministic. Same input, same result. |
| No Silent Failures | Validation failures are logged and surfaced. |
| No Data Destruction | Validation does not destroy data. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| No validation failure is silent | Every failure is logged and surfaced. |
| No validation destroys data | Data preservation is the cardinal rule. |
| The World Layer enforces validation | It does not define the framework. |
| No validation responsibility is removed after locking | Permanent. |

---

### 4.5 Migration Responsibilities

#### Purpose

The migration responsibilities section defines how the World Layer manages
schema migrations.

#### Scope

The migration responsibilities apply to all world migrations — any additive
change to the world schema.

#### Boundaries

Migrations are additive, forward-only, and backward compatible. No migration
drops a table, drops a column, renames a column, or changes a column type. Every
migration is logged and tested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Migrations are additive. No destructive operations. |
| Forward-Only | Migrations are forward-only. No backward migration. |
| Backward Compatible | Migrations do not break existing data. |
| Logged | Every migration is recorded in the Migration Log. |
| Tested | Every migration is tested against all dependent layers. |
| No Data Loss | The previous valid state is always retained. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Migrations are additive | No DROP, rename, or type change without a plan. |
| Migrations are forward-only | No backward migration. |
| Every migration is logged | In `docs/database/Migration_Log.md`. |
| Every migration is tested | Against all dependent layers. |
| No migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |
| No migration responsibility is removed after locking | Permanent. |

---

### 4.6 Synchronization Responsibilities

#### Purpose

The synchronization responsibilities section defines how the World Layer
participates in data synchronization.

#### Scope

The synchronization responsibilities apply to all world data that is synced:
world metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. The World Layer does not manage
sync — the Synchronization Architecture does. The game continues in a degraded
state when the server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| Sync does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |
| No synchronization responsibility is removed after locking | Permanent. |

---

### 4.7 Replay Responsibilities

#### Purpose

The replay responsibilities section defines how the World Layer relates to the
Replay System.

#### Scope

The replay responsibilities apply to all world data that could affect replays:
world identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots (except the world identifier if the engine
references it). Replays do not query world tables. The World Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| Deterministic Identifiers | World identifiers are deterministic. |
| Cross-Platform Replay | World identifiers are platform-independent. |
| No Non-Determinism | World data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| World identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from world data | Same state, same result. |
| No replay responsibility is removed after locking | Permanent. |

---

### 4.8 Auditing Responsibilities

#### Purpose

The auditing responsibilities section defines how the World Layer supports
auditing of world data changes.

#### Scope

The auditing responsibilities apply to all world tables that are modified after
creation: world metadata, faction changes, religion changes, world events.

#### Boundaries

The World Layer supports auditing by providing timestamps, owner references, and
change tracking. It does not define the audit framework — the Foundation Layer
does (via audit_logs). The World Layer contributes to audit logs but does not
manage them.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Timestamped | Every world row has created_at and updated_at timestamps. |
| Owned | Every world row has a user_id reference to the Foundation Layer. |
| Change-Trackable | World data changes are trackable through timestamps and audit logs. |
| No Audit Framework | The World Layer does not define the audit framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world row has created_at and updated_at | No exceptions. |
| Every world row has a user_id reference | To the Foundation Layer. |
| World data changes are trackable | Through timestamps and audit logs. |
| The World Layer does not manage audit logs | The Foundation Layer does. |
| The World Layer contributes to audit logs | But does not own them. |
| No auditing responsibility is removed after locking | Permanent. |

---

### 4.9 Security Responsibilities

#### Purpose

The security responsibilities section defines how the World Layer protects world
data from unauthorized access.

#### Scope

The security responsibilities apply to all RLS policies, all access paths, and
all trust boundaries in the world layer.

#### Boundaries

RLS is the primary security boundary. The service role key bypasses RLS for
server-side operations (edge functions only). No client-side authority. No
cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every world table. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |
| No Client-Side Authority | No client-side conflict resolution. |
| Deterministic Access | Access checks are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is the primary security boundary | No exceptions. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| No client-side authority | Server-authoritative. |
| Access checks are deterministic | No non-determinism. |
| No security responsibility is removed after locking | Permanent. |

---

### 4.10 Monitoring Responsibilities

#### Purpose

The monitoring responsibilities section defines how the World Layer supports
monitoring of world data health.

#### Scope

The monitoring responsibilities apply to all world tables and all world
operations.

#### Boundaries

The World Layer supports monitoring by providing timestamps, row counts, and
query performance characteristics. It does not define the monitoring framework.
Monitoring is non-blocking and does not affect gameplay.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Observable | World data is observable through timestamps and row counts. |
| Non-Blocking | Monitoring does not block gameplay. |
| No Monitoring Framework | The World Layer does not define the monitoring framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is observable | Timestamps, row counts. |
| Monitoring is non-blocking | No blocking gameplay. |
| The World Layer does not define the monitoring framework | It uses the project's monitoring standards. |
| No monitoring responsibility is removed after locking | Permanent. |

---

### 4.11 Expansion Responsibilities

#### Purpose

The expansion responsibilities section defines how the World Layer supports
future expansion.

#### Scope

The expansion responsibilities apply to all future tables, columns,
relationships, and systems added to the World Layer.

#### Boundaries

Expansion is additive. Existing tables, columns, and relationships are not
removed. No expansion weakens a guarantee or creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive Growth | New tables, columns, and relationships are added. |
| Backward Compatible | New expansions do not break existing data. |
| No Circular Dependencies | New expansions do not create circular dependencies. |
| No Weakening | No expansion weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Expansion is additive | No dropping existing tables, columns, or relationships. |
| Expansion is backward compatible | No breaking existing data. |
| Expansion does not create circular dependencies | The World Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and Schema.md. |
| Expansion is tested against dependent layers | No breaking changes. |
| No expansion responsibility is removed after locking | Permanent. |

---

### 4.12 Permanent Non-Responsibilities

#### Purpose

The permanent non-responsibilities section defines what the World Layer is
permanently NOT responsible for. These responsibilities belong to other layers
or engines.

#### Scope

The permanent non-responsibilities apply to the boundary between the World Layer
and all other layers and engines.

#### Boundaries

The non-responsibilities are permanent. No non-responsibility is moved into the
World Layer without a new blueprint or an exception.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Gameplay Systems | The World Layer does not manage inventory, dialogue, quests, combat, activities, NPC AI, or economy. |
| No Save Data | The World Layer does not manage save snapshots or save documents. |
| No Engine State | The World Layer does not manage engine state (time, life, energy, etc.). |
| No Auth | The World Layer does not manage authentication or authorization. |
| No Sync Management | The World Layer does not manage synchronization. |
| No Replay Management | The World Layer does not manage replays. |
| No Event Bus Management | The World Layer does not manage the Event Bus. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer does not manage gameplay systems | Those are covered by their respective engines. |
| The World Layer does not manage save data | That is covered by the Save Engine. |
| The World Layer does not manage engine state | That is covered by the respective engines. |
| The World Layer does not manage auth | That is covered by the Foundation Layer. |
| The World Layer does not manage sync | That is covered by the Synchronization Architecture. |
| The World Layer does not manage replays | That is covered by the Replay System. |
| The World Layer does not manage the Event Bus | It publishes and subscribes. |
| No non-responsibility is moved into the World Layer without a new blueprint or an exception | No scope creep. |
| The non-responsibilities are permanent | They do not change after locking. |

---

## 5. Schema Architecture

### Overview

This chapter defines the schema architecture for the World Layer. It defines the
philosophy, layer hierarchy, entity hierarchy, relationship hierarchy, ownership
hierarchy, aggregation rules, composition rules, inheritance rules, normalization
strategy, denormalization strategy, indexing strategy, partition strategy,
synchronization strategy, replay strategy, and compatibility strategy.

This chapter has 15 sections. Every section includes purpose, scope, boundaries,
guarantees, and permanent rules.

---

### 5.1 Schema Philosophy

#### Purpose

The schema philosophy defines the permanent principles that govern the World
Layer's schema design.

#### Scope

The schema philosophy applies to all 16 world tables and all world relationships.

#### Boundaries

The World Layer follows the Database Architecture Blueprint v1.0 (LOCKED). It is
Layer 2 of the 10-layer schema hierarchy. It depends on the Foundation Layer
(Layer 1). It does not depend on any layer above it.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layered | The World Layer follows the layered architecture. |
| Event-Sourced | The World Layer follows the event-sourced architecture. |
| Interface-Driven | The World Layer follows the interface-driven architecture. |
| Layer 2 | The World Layer is Layer 2 of the 10-layer schema hierarchy. |
| Foundation Dependency | The World Layer depends on the Foundation Layer. |
| No Upward Dependencies | The World Layer does not depend on any layer above it. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer follows the Database Architecture Blueprint v1.0 | No exceptions. |
| The World Layer is Layer 2 | Per the Database Architecture Blueprint v1.0 §5. |
| The World Layer depends on the Foundation Layer | Via `user_id` references. |
| The World Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The schema philosophy is permanent | It does not change after locking. |

---

### 5.2 Layer Hierarchy

#### Purpose

The layer hierarchy defines the World Layer's position in the 10-layer schema
hierarchy.

#### Scope

The layer hierarchy applies to the World Layer's position relative to all other
schema layers.

#### Boundaries

The World Layer is Layer 2. It depends on Layer 1 (Foundation). Layers 3–10 may
depend on it. No upward dependencies. No circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 2 | The World Layer is Layer 2 of the 10-layer schema hierarchy. |
| Depends on Layer 1 | The World Layer depends on the Foundation Layer. |
| Depended Upon by Layers 3–10 | Higher layers may depend on the World Layer. |
| No Upward Dependencies | The World Layer does not depend on any layer above it. |
| DAG Structure | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer is Layer 2 | Per the Database Architecture Blueprint v1.0 §5. |
| The World Layer depends on the Foundation Layer | Via `user_id` references. |
| The World Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The layer hierarchy is permanent | It does not change after locking. |

---

### 5.3 Entity Hierarchy

#### Purpose

The entity hierarchy defines the nesting of world entities — how worlds contain
continents, continents contain regions, regions contain kingdoms, and so on.

#### Scope

The entity hierarchy applies to all 16 world tables and their parent-child
relationships.

#### Boundaries

The entity hierarchy is a tree. The world is the root. Every world entity descends
from a world. No circular parent-child relationships. Locations are the atomic unit.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Tree Structure | The entity hierarchy is a tree. No cycles. |
| World Root | The world is the root of the hierarchy. |
| Atomic Locations | Locations are the atomic unit of world geography. |
| No Circular Parents | No circular parent-child relationships. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The world is the root | Every world entity descends from a world. |
| The entity hierarchy is a tree | No cycles. |
| Locations are the atomic unit | Every geographical reference resolves to a location. |
| No circular parent-child relationships | No exceptions. |
| The entity hierarchy is permanent | It does not change after locking. |

---

### 5.4 Relationship Hierarchy

#### Purpose

The relationship hierarchy defines the types of relationships between world
entities and their rules.

#### Scope

The relationship hierarchy applies to all relationships between world tables.

#### Boundaries

Relationships are one-to-one, one-to-many, or many-to-many. All relationships are
documented. All foreign keys are enforced. No orphan rows.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | All relationships are documented in the ERD and blueprint. |
| Enforced | All foreign keys are enforced. No orphan rows. |
| Typed | Relationships are one-to-one, one-to-many, or many-to-many. |
| No Orphans | No orphan rows. Cascade or restrict per documented relationship. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All relationships are documented | ERD, blueprint, Schema.md. |
| All foreign keys are enforced | No orphan rows. |
| Relationships are typed | One-to-one, one-to-many, many-to-many. |
| No orphan rows | Cascade or restrict per documented relationship. |
| The relationship hierarchy is permanent | It does not change after locking. |

---

### 5.5 Ownership Hierarchy

#### Purpose

The ownership hierarchy defines how world data is owned and scoped.

#### Scope

The ownership hierarchy applies to all world tables and all RLS policies.

#### Boundaries

World data is owned by the user who created the world. RLS scopes every query.
No cross-user access from the client. The service role key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Owned | World data is owned by the user who created the world. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is owned by the user who created the world | `user_id` references the Foundation Layer. |
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |
| The ownership hierarchy is permanent | It does not change after locking. |

---

### 5.6 Aggregation Rules

#### Purpose

The aggregation rules define how world entities aggregate — how a world aggregates
continents, how a continent aggregates regions, and so on.

#### Scope

The aggregation rules apply to all parent-child relationships in the world layer.

#### Boundaries

Aggregation is one-way: parent aggregates children. A child belongs to exactly
one parent. No shared children. No circular aggregation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| One-Way Aggregation | Parent aggregates children. Not vice versa. |
| Single Parent | A child belongs to exactly one parent. |
| No Shared Children | No child belongs to multiple parents of the same type. |
| No Circular Aggregation | No circular parent-child relationships. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Aggregation is one-way | Parent aggregates children. |
| A child belongs to exactly one parent | No shared children. |
| No circular aggregation | No cycles. |
| Deleting a parent cascades to children | Per documented cascade rules. |
| The aggregation rules are permanent | They do not change after locking. |

---

### 5.7 Composition Rules

#### Purpose

The composition rules define how world entities compose — how locations, landmarks,
and roads compose into a complete world map.

#### Scope

The composition rules apply to all world entities that compose into larger
structures.

#### Boundaries

Composition is additive. A world is composed of continents, regions, kingdoms,
cities, villages, locations, landmarks, and roads. No composition creates a
circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive Composition | A world is composed of its parts. |
| No Circular Composition | No composition creates a circular dependency. |
| Complete World | The composition produces a complete world model. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Composition is additive | A world is composed of its parts. |
| No composition creates a circular dependency | No cycles. |
| The composition produces a complete world model | No gaps. |
| The composition rules are permanent | They do not change after locking. |

---

### 5.8 Inheritance Rules

#### Purpose

The inheritance rules define how world entities share common attributes — how all
world entities share id, user_id, created_at, updated_at.

#### Scope

The inheritance rules apply to all world tables that share common attributes.

#### Boundaries

The World Layer does not use table inheritance (PostgreSQL INHERITS). Common
attributes are defined per table, following the Naming Rules and the Database
Architecture Blueprint. No table inherits from another table.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Common Attributes | All world tables share id, user_id, created_at, updated_at. |
| No Table Inheritance | No PostgreSQL INHERITS. |
| Consistent Naming | Common attributes use the same names across all tables. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All world tables share id, user_id, created_at, updated_at | No exceptions. |
| No PostgreSQL INHERITS | Common attributes are defined per table. |
| Common attributes use the same names | Consistent naming. |
| The inheritance rules are permanent | They do not change after locking. |

---

### 5.9 Normalization Strategy

#### Purpose

The normalization strategy defines how world tables are normalized to reduce
redundancy and improve integrity.

#### Scope

The normalization strategy applies to all 16 world tables.

#### Boundaries

World tables are normalized to at least Third Normal Form (3NF). No data is
duplicated across tables unless explicitly documented as a denormalization. No
transitive dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| 3NF | World tables are normalized to at least Third Normal Form. |
| No Redundancy | No data is duplicated across tables unless documented. |
| No Transitive Dependencies | No transitive dependencies. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World tables are normalized to at least 3NF | No exceptions. |
| No data is duplicated across tables unless documented | Documented denormalization only. |
| No transitive dependencies | No exceptions. |
| Foreign keys are enforced | No orphan rows. |
| The normalization strategy is permanent | It does not change after locking. |

---

### 5.10 Denormalization Strategy

#### Purpose

The denormalization strategy defines when and how world tables are denormalized
for performance.

#### Scope

The denormalization strategy applies to any world table that is denormalized for
performance.

#### Boundaries

Denormalization is the exception, not the rule. Every denormalization is
documented with rationale. Denormalization does not weaken integrity or
compatibility. Denormalization is additive.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Exception-Based | Denormalization is the exception, not the rule. |
| Documented | Every denormalization is documented with rationale. |
| No Integrity Weakening | Denormalization does not weaken integrity. |
| No Compatibility Weakening | Denormalization does not weaken compatibility. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Denormalization is the exception | Not the rule. |
| Every denormalization is documented | Rationale, scope, impact. |
| Denormalization does not weaken integrity | Data integrity wins. |
| Denormalization does not weaken compatibility | All 10 guarantees preserved. |
| Denormalization is additive | No destructive denormalization. |
| The denormalization strategy is permanent | It does not change after locking. |

---

### 5.11 Indexing Strategy

#### Purpose

The indexing strategy defines how world tables are indexed for efficient queries.

#### Scope

The indexing strategy applies to all 16 world tables and all world queries.

#### Boundaries

All foreign key columns are indexed. Indexes are justified by evidence. No
speculative indexes. No unbounded queries.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Indexed Foreign Keys | All foreign key columns are indexed. |
| Justified Indexes | Indexes are justified by evidence. |
| No Speculative Indexes | No indexes without evidence. |
| Bounded Queries | Queries return bounded result sets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All foreign keys are indexed | No unindexed foreign keys. |
| Indexes are justified by evidence | No speculative indexes. |
| No query loads an unbounded result set | Pagination is used. |
| Indexes are documented | In the blueprint and Schema.md. |
| The indexing strategy is permanent | It does not change after locking. |

---

### 5.12 Partition Strategy

#### Purpose

The partition strategy defines how world tables are partitioned for scalability.

#### Scope

The partition strategy applies to world tables that grow large over time:
world_history, major_world_events, locations, landmarks, roads.

#### Boundaries

Partitioning is by world (or by world and time for history tables). Partitioning
is additive. No partitioning weakens integrity or compatibility.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World-Partitioned | Large tables are partitioned by world. |
| Additive | Partitioning is additive. |
| No Integrity Weakening | Partitioning does not weaken integrity. |
| No Compatibility Weakening | Partitioning does not weaken compatibility. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Large tables are partitioned by world | world_history, major_world_events, locations, landmarks, roads. |
| Partitioning is additive | No destructive partitioning. |
| Partitioning does not weaken integrity | Data integrity wins. |
| Partitioning does not weaken compatibility | All 10 guarantees preserved. |
| Partitioning is documented | In the blueprint and Schema.md. |
| The partition strategy is permanent | It does not change after locking. |

---

### 5.13 Synchronization Strategy

#### Purpose

The synchronization strategy defines how world data is synced.

#### Scope

The synchronization strategy applies to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. The World Layer does not manage
sync. The game continues in a degraded state when the server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| Sync does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |
| The synchronization strategy is permanent | It does not change after locking. |

---

### 5.14 Replay Strategy

#### Purpose

The replay strategy defines how world data relates to replays.

#### Scope

The replay strategy applies to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots (except the world identifier if the engine
references it). Replays do not query world tables. The World Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| Deterministic Identifiers | World identifiers are deterministic. |
| Cross-Platform Replay | World identifiers are platform-independent. |
| No Non-Determinism | World data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| World identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from world data | Same state, same result. |
| The replay strategy is permanent | It does not change after locking. |

---

### 5.15 Compatibility Strategy

#### Purpose

The compatibility strategy defines how the World Layer preserves compatibility
with all dependent systems.

#### Scope

The compatibility strategy applies to all world tables, all world queries, all
world migrations, and all world sync operations.

#### Boundaries

All 10 compatibility guarantees are permanent. No world table, no world migration,
no world sync operation weakens a compatibility guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | World data does not affect save snapshots. |
| Replay Compatibility | World data does not introduce non-determinism. |
| Migration Compatibility | World migrations are additive and forward-only. |
| Synchronization Compatibility | World data is server-authoritative and non-blocking. |
| Event Bus Compatibility | World data does not affect event ordering. |
| Snapshot Compatibility | World data does not affect existing snapshot format. |
| Save Compatibility | World data does not affect existing save format. |
| Ownership Compatibility | World data does not weaken RLS. |
| Lock Policy Compatibility | World data is documented and follows the lock policy. |
| Dependency Compatibility | World data does not create circular dependencies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are permanent | No weakening. |
| No world table weakens a compatibility guarantee | No exceptions. |
| No world migration weakens a compatibility guarantee | No exceptions. |
| No world sync operation weakens a compatibility guarantee | No exceptions. |
| Compatibility is tested | Every world table is tested against all dependent systems. |
| The compatibility strategy is permanent | It does not change after locking. |

---

## 6. Naming Convention

### Overview

This chapter defines the naming convention for the World Layer. It defines the
naming rules for tables, columns, primary keys, foreign keys, indexes, constraints,
triggers, enums, views, and backups. All names follow the Naming Rules v1.0.

This chapter has 10 sections. Every section includes valid examples, invalid
examples, compatibility rules, and permanent restrictions.

---

### 6.1 Table Naming

#### Purpose

The table naming section defines how world tables are named.

#### Valid Examples

| Table Name | Description |
|------------|-------------|
| `worlds` | Top-level world entity. |
| `continents` | Continents within a world. |
| `regions` | Regions within a continent. |
| `kingdoms` | Kingdoms within a region. |
| `cities` | Cities within a kingdom. |
| `villages` | Villages within a kingdom. |
| `locations` | Points of interest. |
| `landmarks` | Notable features. |
| `roads` | Connections between locations. |
| `dungeons` | Adventure areas. |
| `ecosystems` | Ecological systems. |
| `climates` | Climate zones. |
| `world_history` | Historical records. |
| `major_world_events` | Significant events. |
| `factions` | Political organizations. |
| `religions` | Belief systems. |

#### Invalid Examples

| Table Name | Why Invalid |
|------------|-------------|
| `Worlds` | Uses uppercase. Must be `snake_case`. |
| `world` | Singular. Must be plural. |
| `world-table` | Uses hyphen. Must be underscore. |
| `worldTable` | Uses camelCase. Must be `snake_case`. |
| `worlds_table` | Redundant suffix. |
| `tbl_worlds` | Redundant prefix. |
| `WorldHistory` | Uses PascalCase. Must be `snake_case`. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Table names do not affect save snapshots. |
| Replay Compatibility | Table names are deterministic. |
| Migration Compatibility | Table names are never renamed after creation. |
| Naming Compatibility | All table names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All table names are `snake_case` | No uppercase, no hyphens, no camelCase. |
| All table names are plural | No singular names. |
| No table is renamed after creation | Forward-only migrations. |
| No table name has a redundant prefix or suffix | No `tbl_`, `_table`. |
| All table names are documented | In the ERD, blueprint, and Schema.md. |

---

### 6.2 Column Naming

#### Purpose

The column naming section defines how world columns are named.

#### Valid Examples

| Column Name | Description |
|-------------|-------------|
| `id` | Primary key. |
| `user_id` | Foreign key to the Foundation Layer. |
| `world_id` | Foreign key to the worlds table. |
| `continent_id` | Foreign key to the continents table. |
| `region_id` | Foreign key to the regions table. |
| `name` | Name of the entity. |
| `description` | Description of the entity. |
| `created_at` | Creation timestamp. |
| `updated_at` | Last update timestamp. |
| `parent_id` | Self-referencing foreign key. |

#### Invalid Examples

| Column Name | Why Invalid |
|-------------|-------------|
| `Id` | Uses uppercase. Must be `snake_case`. |
| `userId` | Uses camelCase. Must be `snake_case`. |
| `world-id` | Uses hyphen. Must be underscore. |
| `world_id_fk` | Redundant suffix. |
| `col_name` | Redundant prefix. |
| `WorldId` | Uses PascalCase. Must be `snake_case`. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Column names do not affect save snapshots. |
| Replay Compatibility | Column names are deterministic. |
| Migration Compatibility | Column names are never renamed after creation. |
| Naming Compatibility | All column names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All column names are `snake_case` | No uppercase, no hyphens, no camelCase. |
| No column is renamed after creation | Forward-only migrations. |
| No column name has a redundant prefix or suffix | No `col_`, `_fk`. |
| All column names are documented | In the blueprint and Schema.md. |
| Common columns use the same names across all tables | `id`, `user_id`, `created_at`, `updated_at`. |

---

### 6.3 Primary Key Naming

#### Purpose

The primary key naming section defines how primary keys are named.

#### Valid Examples

| Primary Key | Description |
|-------------|-------------|
| `id` | Every world table uses `id` as its primary key column. |

#### Invalid Examples

| Primary Key | Why Invalid |
|-------------|-------------|
| `world_id` | Reserved for foreign key to worlds. Primary key must be `id`. |
| `pk_id` | Redundant prefix. |
| `Id` | Uses uppercase. Must be `snake_case`. |
| `world_pk` | Redundant suffix. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Primary key names do not affect save snapshots. |
| Replay Compatibility | Primary key names are deterministic. |
| Migration Compatibility | Primary key names are never renamed. |
| Naming Compatibility | All primary keys follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| Every world table uses `id` as its primary key | No exceptions. |
| Primary keys are never renamed | Forward-only migrations. |
| No redundant prefix or suffix | No `pk_`, `_pk`. |
| All primary keys are documented | In the blueprint and Schema.md. |

---

### 6.4 Foreign Key Naming

#### Purpose

The foreign key naming section defines how foreign keys are named.

#### Valid Examples

| Foreign Key | Description |
|-------------|-------------|
| `user_id` | Foreign key to the Foundation Layer (users table). |
| `world_id` | Foreign key to the worlds table. |
| `continent_id` | Foreign key to the continents table. |
| `region_id` | Foreign key to the regions table. |
| `kingdom_id` | Foreign key to the kingdoms table. |
| `parent_id` | Self-referencing foreign key (e.g., region to parent region). |

#### Invalid Examples

| Foreign Key | Why Invalid |
|-------------|-------------|
| `worldId` | Uses camelCase. Must be `snake_case`. |
| `world-id` | Uses hyphen. Must be underscore. |
| `world_id_fk` | Redundant suffix. |
| `fk_world_id` | Redundant prefix. |
| `WorldId` | Uses PascalCase. Must be `snake_case`. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Foreign key names do not affect save snapshots. |
| Replay Compatibility | Foreign key names are deterministic. |
| Migration Compatibility | Foreign key names are never renamed. |
| Naming Compatibility | All foreign keys follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All foreign keys are named `<table_singular>_id` | e.g., `world_id`, `continent_id`. |
| Self-referencing foreign keys are named `parent_id` | No exceptions. |
| No redundant prefix or suffix | No `fk_`, `_fk`. |
| All foreign keys are indexed | No unindexed foreign keys. |
| All foreign keys are documented | In the blueprint and Schema.md. |

---

### 6.5 Index Naming

#### Purpose

The index naming section defines how indexes are named.

#### Valid Examples

| Index Name | Description |
|-------------|-------------|
| `idx_worlds_user_id` | Index on worlds.user_id. |
| `idx_continents_world_id` | Index on continents.world_id. |
| `idx_regions_continent_id` | Index on regions.continent_id. |
| `idx_locations_parent_id` | Index on locations.parent_id. |
| `idx_world_history_world_id` | Index on world_history.world_id. |

#### Invalid Examples

| Index Name | Why Invalid |
|-------------|-------------|
| `IdxWorldsUserId` | Uses PascalCase. Must be `snake_case`. |
| `idx-worlds-user-id` | Uses hyphens. Must be underscores. |
| `index_worlds_user_id` | Wrong prefix. Must be `idx_`. |
| `worlds_user_id_idx` | Wrong suffix position. Prefix must be `idx_`. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Index names do not affect save snapshots. |
| Replay Compatibility | Index names are deterministic. |
| Migration Compatibility | Index names are never renamed. |
| Naming Compatibility | All index names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All indexes are named `idx_<table>_<column>` | No exceptions. |
| All index names are `snake_case` | No uppercase, no hyphens. |
| No index is renamed after creation | Forward-only migrations. |
| All indexes are documented | In the blueprint and Schema.md. |
| All indexes are justified by evidence | No speculative indexes. |

---

### 6.6 Constraint Naming

#### Purpose

The constraint naming section defines how constraints are named.

#### Valid Examples

| Constraint Name | Description |
|------------------|-------------|
| `pk_worlds` | Primary key constraint on worlds. |
| `fk_continents_world_id` | Foreign key constraint on continents.world_id. |
| `uq_worlds_user_id_name` | Unique constraint on worlds (user_id, name). |
| `ck_worlds_name_not_empty` | Check constraint on worlds.name. |
| `nn_worlds_name` | Not-null constraint on worlds.name. |

#### Invalid Examples

| Constraint Name | Why Invalid |
|------------------|-------------|
| `PkWorlds` | Uses PascalCase. Must be `snake_case`. |
| `pk-worlds` | Uses hyphen. Must be underscore. |
| `constraint_pk_worlds` | Redundant prefix. |
| `pk_worlds_constraint` | Redundant suffix. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Constraint names do not affect save snapshots. |
| Replay Compatibility | Constraint names are deterministic. |
| Migration Compatibility | Constraint names are never renamed. |
| Naming Compatibility | All constraint names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| Primary key constraints are named `pk_<table>` | No exceptions. |
| Foreign key constraints are named `fk_<table>_<column>` | No exceptions. |
| Unique constraints are named `uq_<table>_<columns>` | No exceptions. |
| Check constraints are named `ck_<table>_<description>` | No exceptions. |
| Not-null constraints are named `nn_<table>_<column>` | No exceptions. |
| All constraint names are `snake_case` | No uppercase, no hyphens. |
| No constraint is renamed after creation | Forward-only migrations. |

---

### 6.7 Trigger Naming

#### Purpose

The trigger naming section defines how triggers are named.

#### Valid Examples

| Trigger Name | Description |
|------------------|-------------|
| `trg_worlds_updated_at` | Trigger to update worlds.updated_at. |
| `trg_continents_updated_at` | Trigger to update continents.updated_at. |
| `trg_world_history_validate` | Trigger to validate world_history before insert. |

#### Invalid Examples

| Trigger Name | Why Invalid |
|------------------|-------------|
| `TrgWorldsUpdatedAt` | Uses PascalCase. Must be `snake_case`. |
| `trg-worlds-updated-at` | Uses hyphen. Must be underscore. |
| `trigger_worlds_updated_at` | Wrong prefix. Must be `trg_`. |
| `worlds_updated_at_trg` | Wrong suffix position. Prefix must be `trg_`. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Trigger names do not affect save snapshots. |
| Replay Compatibility | Trigger names are deterministic. |
| Migration Compatibility | Trigger names are never renamed. |
| Naming Compatibility | All trigger names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All triggers are named `trg_<table>_<description>` | No exceptions. |
| All trigger names are `snake_case` | No uppercase, no hyphens. |
| No trigger is renamed after creation | Forward-only migrations. |
| All triggers are documented | In the blueprint and Schema.md. |
| Triggers do not introduce non-determinism | No wall-clock or random triggers. |

---

### 6.8 Enum Naming

#### Purpose

The enum naming section defines how enums (custom types) are named.

#### Valid Examples

| Enum Name | Description |
|------------|-------------|
| `world_type` | Enum for world types. |
| `climate_type` | Enum for climate types. |
| `faction_type` | Enum for faction types. |
| `location_type` | Enum for location types. |
| `road_type` | Enum for road types. |

#### Invalid Examples

| Enum Name | Why Invalid |
|------------|-------------|
| `WorldType` | Uses PascalCase. Must be `snake_case`. |
| `world-type` | Uses hyphen. Must be underscore. |
| `enum_world_type` | Redundant prefix. |
| `world_type_enum` | Redundant suffix. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Enum names do not affect save snapshots. |
| Replay Compatibility | Enum names are deterministic. |
| Migration Compatibility | Enum values are never removed. New values are additive. |
| Naming Compatibility | All enum names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All enums are named `<entity>_type` or `<entity>_<category>` | `snake_case`. |
| All enum names are `snake_case` | No uppercase, no hyphens. |
| No enum value is removed after creation | Forward-only migrations. |
| New enum values are additive | No breaking existing data. |
| All enums are documented | In the blueprint and Schema.md. |

---

### 6.9 View Naming

#### Purpose

The view naming section defines how views are named.

#### Valid Examples

| View Name | Description |
|-----------|-------------|
| `world_summary` | View summarizing world data. |
| `continent_detail` | View joining continents with regions. |
| `location_with_parent` | View joining locations with their parent entities. |
| `faction_membership_view` | View summarizing faction membership. |

#### Invalid Examples

| View Name | Why Invalid |
|-----------|-------------|
| `WorldSummary` | Uses PascalCase. Must be `snake_case`. |
| `world-summary` | Uses hyphen. Must be underscore. |
| `view_world_summary` | Redundant prefix. |
| `world_summary_view` | Redundant suffix. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | View names do not affect save snapshots. |
| Replay Compatibility | View names are deterministic. |
| Migration Compatibility | View names are never renamed. |
| Naming Compatibility | All view names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All views are named `<entity>_<description>` or `<entity>_with_<description>` | `snake_case`. |
| All view names are `snake_case` | No uppercase, no hyphens. |
| No view is renamed after creation | Forward-only migrations. |
| All views are documented | In the blueprint and Schema.md. |
| Views do not bypass RLS | Views respect RLS policies. |

---

### 6.10 Backup Naming

#### Purpose

The backup naming section defines how world data backups are named.

#### Valid Examples

| Backup Name | Description |
|-------------|-------------|
| `backup_worlds_20260803` | Backup of worlds table on 2026-08-03. |
| `backup_world_history_20260803` | Backup of world_history table on 2026-08-03. |
| `backup_world_full_20260803` | Full backup of world schema on 2026-08-03. |

#### Invalid Examples

| Backup Name | Why Invalid |
|-------------|-------------|
| `BackupWorlds20260803` | Uses PascalCase. Must be `snake_case`. |
| `backup-worlds-20260803` | Uses hyphen. Must be underscore. |
| `bkp_worlds_20260803` | Wrong prefix. Must be `backup_`. |
| `worlds_20260803_backup` | Wrong suffix position. Prefix must be `backup_`. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Backup names do not affect save snapshots. |
| Replay Compatibility | Backup names are deterministic. |
| Migration Compatibility | Backup names are never renamed. |
| Naming Compatibility | All backup names follow the Naming Rules v1.0. |

#### Permanent Restrictions

| Restriction | Description |
|-------------|-------------|
| All backups are named `backup_<table>_<date>` or `backup_world_full_<date>` | `snake_case`. |
| All backup names are `snake_case` | No uppercase, no hyphens. |
| No backup is renamed after creation | Forward-only migrations. |
| All backups are documented | In the Migration Log. |
| Backups do not destroy data | Previous valid state always retained. |

---

## Sprint 1.2.2.2 Review

### Sprint Summary

**Sprint:** 1.2.2.2 — World Blueprint v1.0 (Chapters 4–6)
**Status:** COMPLETE
**Date:** 2026-08-03

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 4 | Responsibilities | 12 sections: primary responsibilities, secondary responsibilities, ownership responsibilities, validation responsibilities, migration responsibilities, synchronization responsibilities, replay responsibilities, auditing responsibilities, security responsibilities, monitoring responsibilities, expansion responsibilities, permanent non-responsibilities. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 5 | Schema Architecture | 15 sections: schema philosophy, layer hierarchy, entity hierarchy, relationship hierarchy, ownership hierarchy, aggregation rules, composition rules, inheritance rules, normalization strategy, denormalization strategy, indexing strategy, partition strategy, synchronization strategy, replay strategy, compatibility strategy. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 6 | Naming Convention | 10 sections: table naming, column naming, primary key naming, foreign key naming, index naming, constraint naming, trigger naming, enum naming, view naming, backup naming. Each with valid examples, invalid examples, compatibility rules, permanent restrictions. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–6) | PASS |
| No gaps in chapter numbering | PASS |
| Deterministic execution preserved | PASS |
| Replay compatibility preserved | PASS |
| Migration compatibility preserved | PASS |
| Synchronization compatibility preserved | PASS |
| Ownership consistency preserved | PASS |
| Dependency consistency preserved | PASS |
| Naming consistency preserved | PASS |
| Lock policy compliance preserved | PASS |
| Event ordering consistency preserved | PASS |
| Snapshot compatibility preserved | PASS |
| Save compatibility preserved | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Blueprint documentation only | PASS |

### Notes

- The World Blueprint is IN PROGRESS. Chapters 7–16 are pending.
- Next sprint: 1.2.2.3 — Chapter 7 (Relationships), Chapter 8 (Security), Chapter 9 (Validation).

---

## 7. Relationships

### Overview

This chapter defines every relationship between the 16 world entities. It defines
the relationship philosophy, each entity's relationships, and the ownership,
dependency, cascade, and future expansion rules that govern all relationships.

This chapter has 20 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, valid examples, and invalid examples.

---

### 7.1 Relationship Philosophy

#### Purpose

The relationship philosophy defines the permanent principles that govern all
relationships between world entities.

#### Scope

The relationship philosophy applies to all 16 world tables and all relationships
between them.

#### Boundaries

All relationships are documented, enforced, and deterministic. No circular
relationships. No orphan rows. The relationship graph is a directed acyclic graph
(DAG).

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | All relationships are documented in the ERD and blueprint. |
| Enforced | All foreign keys are enforced. No orphan rows. |
| Deterministic | All relationships are deterministic. |
| No Cycles | No circular relationships. The relationship graph is a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All relationships are documented | ERD, blueprint, Schema.md. |
| All foreign keys are enforced | No orphan rows. |
| No circular relationships | The relationship graph is a DAG. |
| No relationship is removed after locking | Additive only. |
| All relationships follow the Naming Rules v1.0 | `snake_case` foreign keys. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `continents.world_id` references `worlds.id` | A continent belongs to one world. |
| `regions.continent_id` references `continents.id` | A region belongs to one continent. |
| `kingdoms.region_id` references `regions.id` | A kingdom belongs to one region. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `worlds.continent_id` references `continents.id` | A world does not belong to a continent. Reversed dependency. |
| `regions.world_id` references `worlds.id` (skipping continent) | A region belongs to a continent, not directly to a world. Skips hierarchy. |
| `worlds.id` references `continents.world_id` | Circular reference. |

---

### 7.2 World Relationships

#### Purpose

The world relationships section defines the relationships between the `worlds`
table and all other world tables.

#### Scope

The world relationships apply to the `worlds` table and its direct children:
continents, climates, ecosystems, factions, religions, world_history.

#### Boundaries

The world is the root. It has no parent. It has many children. No world references
another world as a parent (no self-reference for hierarchy). No world references a
continent, region, or kingdom.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Root Entity | The world has no parent. |
| Many Children | A world has many continents, climates, ecosystems, factions, religions, and world_history records. |
| No Self-Reference | No world references another world as a parent. |
| No Downward Skip | A world does not directly reference regions, kingdoms, cities, villages, locations, landmarks, roads, or dungeons. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The world is the root | No parent. |
| A world has many continents | One-to-many. |
| A world has many climates | One-to-many. |
| A world has many ecosystems | One-to-many. |
| A world has many factions | One-to-many. |
| A world has many religions | One-to-many. |
| A world has many world_history records | One-to-many. |
| No world references another world as a parent | No self-referencing hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `continents.world_id` → `worlds.id` | A continent belongs to a world. |
| `climates.world_id` → `worlds.id` | A climate belongs to a world. |
| `factions.world_id` → `worlds.id` | A faction belongs to a world. |
| `world_history.world_id` → `worlds.id` | A history record belongs to a world. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `worlds.parent_world_id` → `worlds.id` | No self-referencing hierarchy. |
| `worlds.continent_id` → `continents.id` | A world does not reference a continent. Reversed. |
| `regions.world_id` → `worlds.id` | A region references its continent, not the world directly. Skips hierarchy. |

---

### 7.3 Continent Relationships

#### Purpose

The continent relationships section defines the relationships between the
`continents` table and all other world tables.

#### Scope

The continent relationships apply to the `continents` table, its parent (worlds),
and its children (regions, climates, ecosystems).

#### Boundaries

A continent belongs to exactly one world. A continent has many regions. A
continent may have climates and ecosystems. No continent references a kingdom,
city, village, location, landmark, road, or dungeon directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A continent belongs to exactly one world. |
| Many Regions | A continent has many regions. |
| Optional Climates | A continent may have climates. |
| Optional Ecosystems | A continent may have ecosystems. |
| No Downward Skip | A continent does not reference kingdoms, cities, villages, locations, landmarks, roads, or dungeons. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `continents.world_id` → `worlds.id` | Many-to-one. |
| `regions.continent_id` → `continents.id` | One-to-many. |
| `climates.continent_id` → `continents.id` | One-to-many (optional). |
| `ecosystems.continent_id` → `continents.id` | One-to-many (optional). |
| No continent references a kingdom or below | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `continents.world_id` → `worlds.id` | A continent belongs to a world. |
| `regions.continent_id` → `continents.id` | A region belongs to a continent. |
| `ecosystems.continent_id` → `continents.id` | An ecosystem belongs to a continent. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `continents.region_id` → `regions.id` | A continent does not reference a region. Reversed. |
| `kingdoms.continent_id` → `continents.id` | A kingdom references a region, not a continent. Skips hierarchy. |
| `continents.parent_continent_id` → `continents.id` | No self-referencing continent hierarchy. |

---

### 7.4 Region Relationships

#### Purpose

The region relationships section defines the relationships between the `regions`
table and all other world tables.

#### Scope

The region relationships apply to the `regions` table, its parent (continents), and
its children (kingdoms, locations, landmarks, dungeons, ecosystems).

#### Boundaries

A region belongs to exactly one continent. A region has many kingdoms. A region
may have locations, landmarks, dungeons, and ecosystems. No region references a
city, village, or road directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A region belongs to exactly one continent. |
| Many Kingdoms | A region has many kingdoms. |
| Optional Locations | A region may have locations. |
| Optional Landmarks | A region may have landmarks. |
| Optional Dungeons | A region may have dungeons. |
| Optional Ecosystems | A region may have ecosystems. |
| No Downward Skip | A region does not reference cities, villages, or roads directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `regions.continent_id` → `continents.id` | Many-to-one. |
| `kingdoms.region_id` → `regions.id` | One-to-many. |
| `locations.region_id` → `regions.id` | One-to-many (optional). |
| `landmarks.region_id` → `regions.id` | One-to-many (optional). |
| `dungeons.region_id` → `regions.id` | One-to-many (optional). |
| `ecosystems.region_id` → `regions.id` | One-to-many (optional). |
| No region references a city or village directly | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `regions.continent_id` → `continents.id` | A region belongs to a continent. |
| `kingdoms.region_id` → `regions.id` | A kingdom belongs to a region. |
| `dungeons.region_id` → `regions.id` | A dungeon belongs to a region. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `regions.kingdom_id` → `kingdoms.id` | A region does not reference a kingdom. Reversed. |
| `cities.region_id` → `regions.id` | A city references a kingdom, not a region. Skips hierarchy. |
| `regions.parent_region_id` → `regions.id` | No self-referencing region hierarchy. |

---

### 7.5 Kingdom Relationships

#### Purpose

The kingdom relationships section defines the relationships between the
`kingdoms` table and all other world tables.

#### Scope

The kingdom relationships apply to the `kingdoms` table, its parent (regions), and
its children (cities, villages).

#### Boundaries

A kingdom belongs to exactly one region. A kingdom has many cities and many
villages. No kingdom references a location, landmark, road, or dungeon directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A kingdom belongs to exactly one region. |
| Many Cities | A kingdom has many cities. |
| Many Villages | A kingdom has many villages. |
| No Downward Skip | A kingdom does not reference locations, landmarks, roads, or dungeons directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `kingdoms.region_id` → `regions.id` | Many-to-one. |
| `cities.kingdom_id` → `kingdoms.id` | One-to-many. |
| `villages.kingdom_id` → `kingdoms.id` | One-to-many. |
| No kingdom references a location or below directly | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `kingdoms.region_id` → `regions.id` | A kingdom belongs to a region. |
| `cities.kingdom_id` → `kingdoms.id` | A city belongs to a kingdom. |
| `villages.kingdom_id` → `kingdoms.id` | A village belongs to a kingdom. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `kingdoms.city_id` → `cities.id` | A kingdom does not reference a city. Reversed. |
| `locations.kingdom_id` → `kingdoms.id` | A location references a city/village/region, not a kingdom. Skips hierarchy. |
| `kingdoms.parent_kingdom_id` → `kingdoms.id` | No self-referencing kingdom hierarchy. |

---

### 7.6 City Relationships

#### Purpose

The city relationships section defines the relationships between the `cities` table
and all other world tables.

#### Scope

The city relationships apply to the `cities` table, its parent (kingdoms), and its
children (locations, landmarks).

#### Boundaries

A city belongs to exactly one kingdom. A city has many locations and may have
landmarks. No city references a road or dungeon directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A city belongs to exactly one kingdom. |
| Many Locations | A city has many locations. |
| Optional Landmarks | A city may have landmarks. |
| No Downward Skip | A city does not reference roads or dungeons directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `cities.kingdom_id` → `kingdoms.id` | Many-to-one. |
| `locations.city_id` → `cities.id` | One-to-many. |
| `landmarks.city_id` → `cities.id` | One-to-many (optional). |
| No city references a road or dungeon directly | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `cities.kingdom_id` → `kingdoms.id` | A city belongs to a kingdom. |
| `locations.city_id` → `cities.id` | A location belongs to a city. |
| `landmarks.city_id` → `cities.id` | A landmark belongs to a city. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `cities.location_id` → `locations.id` | A city does not reference a location. Reversed. |
| `roads.city_id` → `cities.id` | A road references two locations, not a city. Wrong granularity. |
| `cities.parent_city_id` → `cities.id` | No self-referencing city hierarchy. |

---

### 7.7 Village Relationships

#### Purpose

The village relationships section defines the relationships between the `villages`
table and all other world tables.

#### Scope

The village relationships apply to the `villages` table, its parent (kingdoms), and
its children (locations, landmarks).

#### Boundaries

A village belongs to exactly one kingdom. A village has many locations and may have
landmarks. No village references a road or dungeon directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A village belongs to exactly one kingdom. |
| Many Locations | A village has many locations. |
| Optional Landmarks | A village may have landmarks. |
| No Downward Skip | A village does not reference roads or dungeons directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `villages.kingdom_id` → `kingdoms.id` | Many-to-one. |
| `locations.village_id` → `villages.id` | One-to-many. |
| `landmarks.village_id` → `villages.id` | One-to-many (optional). |
| No village references a road or dungeon directly | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `villages.kingdom_id` → `kingdoms.id` | A village belongs to a kingdom. |
| `locations.village_id` → `villages.id` | A location belongs to a village. |
| `landmarks.village_id` → `villages.id` | A landmark belongs to a village. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `villages.location_id` → `locations.id` | A village does not reference a location. Reversed. |
| `roads.village_id` → `villages.id` | A road references two locations, not a village. Wrong granularity. |
| `villages.parent_village_id` → `villages.id` | No self-referencing village hierarchy. |

---

### 7.8 Road Relationships

#### Purpose

The road relationships section defines the relationships between the `roads` table
and all other world tables.

#### Scope

The road relationships apply to the `roads` table and its two endpoints
(locations).

#### Boundaries

A road connects exactly two locations. A road belongs to a world (via its
locations' ancestry). A road does not reference a city, village, kingdom, region,
or continent directly — it references two locations. No road references another
road.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Two Endpoints | A road connects exactly two locations. |
| Location References | A road references two locations, not their parents. |
| No Parent Entity | A road does not belong to a single parent in the hierarchy. It is cross-cutting. |
| No Road-to-Road | No road references another road. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `roads.from_location_id` → `locations.id` | Many-to-one. |
| `roads.to_location_id` → `locations.id` | Many-to-one. |
| A road connects exactly two locations | No exceptions. |
| No road references a city, village, kingdom, region, or continent | Cross-cutting. |
| No road references another road | No road network hierarchy. |
| `roads.world_id` → `worlds.id` | Ownership reference. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `roads.from_location_id` → `locations.id` | Road starts at a location. |
| `roads.to_location_id` → `locations.id` | Road ends at a location. |
| `roads.world_id` → `worlds.id` | Road belongs to a world. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `roads.city_id` → `cities.id` | A road references locations, not cities. Wrong granularity. |
| `roads.kingdom_id` → `kingdoms.id` | A road references locations, not kingdoms. Wrong granularity. |
| `roads.connected_road_id` → `roads.id` | No road-to-road reference. |

---

### 7.9 Landmark Relationships

#### Purpose

The landmark relationships section defines the relationships between the
`landmarks` table and all other world tables.

#### Scope

The landmark relationships apply to the `landmarks` table and its optional parents
(location, city, village, region).

#### Boundaries

A landmark belongs to exactly one of: a location, a city, a village, or a region.
A landmark does not reference a kingdom, continent, or world directly (except
`world_id` for ownership). No landmark references another landmark.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A landmark belongs to exactly one parent (location, city, village, or region). |
| Optional Parent Type | The parent may be a location, city, village, or region. |
| No Landmark-to-Landmark | No landmark references another landmark. |
| Ownership Reference | A landmark references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `landmarks.location_id` → `locations.id` | Optional. One of four parent types. |
| `landmarks.city_id` → `cities.id` | Optional. One of four parent types. |
| `landmarks.village_id` → `villages.id` | Optional. One of four parent types. |
| `landmarks.region_id` → `regions.id` | Optional. One of four parent types. |
| Exactly one parent is set | The other three are null. |
| `landmarks.world_id` → `worlds.id` | Ownership reference. |
| No landmark references another landmark | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `landmarks.location_id` → `locations.id` | A landmark belongs to a location. |
| `landmarks.city_id` → `cities.id` | A landmark belongs to a city. |
| `landmarks.region_id` → `regions.id` | A landmark belongs to a region. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `landmarks.kingdom_id` → `kingdoms.id` | A landmark does not reference a kingdom. Use city, village, location, or region. |
| `landmarks.continent_id` → `continents.id` | A landmark does not reference a continent. Too high in hierarchy. |
| `landmarks.parent_landmark_id` → `landmarks.id` | No self-referencing landmark hierarchy. |

---

### 7.10 Dungeon Relationships

#### Purpose

The dungeon relationships section defines the relationships between the `dungeons`
table and all other world tables.

#### Scope

The dungeon relationships apply to the `dungeons` table and its parent (region or
location).

#### Boundaries

A dungeon belongs to exactly one region or one location. A dungeon does not
reference a city, village, kingdom, continent, or world directly (except `world_id`
for ownership). No dungeon references another dungeon.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A dungeon belongs to exactly one parent (region or location). |
| Optional Parent Type | The parent may be a region or a location. |
| No Dungeon-to-Dungeon | No dungeon references another dungeon. |
| Ownership Reference | A dungeon references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `dungeons.region_id` → `regions.id` | Optional. One of two parent types. |
| `dungeons.location_id` → `locations.id` | Optional. One of two parent types. |
| Exactly one parent is set | The other is null. |
| `dungeons.world_id` → `worlds.id` | Ownership reference. |
| No dungeon references another dungeon | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `dungeons.region_id` → `regions.id` | A dungeon belongs to a region. |
| `dungeons.location_id` → `locations.id` | A dungeon belongs to a location. |
| `dungeons.world_id` → `worlds.id` | A dungeon belongs to a world. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `dungeons.city_id` → `cities.id` | A dungeon does not reference a city. Use region or location. |
| `dungeons.kingdom_id` → `kingdoms.id` | A dungeon does not reference a kingdom. Too high in hierarchy. |
| `dungeons.parent_dungeon_id` → `dungeons.id` | No self-referencing dungeon hierarchy. |

---

### 7.11 Climate Relationships

#### Purpose

The climate relationships section defines the relationships between the `climates`
table and all other world tables.

#### Scope

The climate relationships apply to the `climates` table and its parent (world or
continent).

#### Boundaries

A climate belongs to exactly one world or one continent. A climate does not
reference a region, kingdom, city, village, location, landmark, road, or dungeon.
No climate references another climate.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A climate belongs to exactly one parent (world or continent). |
| Optional Parent Type | The parent may be a world or a continent. |
| No Climate-to-Climate | No climate references another climate. |
| Ownership Reference | A climate references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `climates.world_id` → `worlds.id` | Required. Ownership reference. |
| `climates.continent_id` → `continents.id` | Optional. If set, climate is scoped to a continent. |
| No climate references a region or below | Too low in hierarchy. |
| No climate references another climate | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `climates.world_id` → `worlds.id` | A climate belongs to a world. |
| `climates.continent_id` → `continents.id` | A climate is scoped to a continent. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `climates.region_id` → `regions.id` | A climate does not reference a region. Too low. |
| `climates.kingdom_id` → `kingdoms.id` | A climate does not reference a kingdom. Too low. |
| `climates.parent_climate_id` → `climates.id` | No self-referencing climate hierarchy. |

---

### 7.12 Ecosystem Relationships

#### Purpose

The ecosystem relationships section defines the relationships between the
`ecosystems` table and all other world tables.

#### Scope

The ecosystem relationships apply to the `ecosystems` table and its parent
(continent or region).

#### Boundaries

An ecosystem belongs to exactly one continent or one region. An ecosystem does not
reference a kingdom, city, village, location, landmark, road, or dungeon. No
ecosystem references another ecosystem.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An ecosystem belongs to exactly one parent (continent or region). |
| Optional Parent Type | The parent may be a continent or a region. |
| No Ecosystem-to-Ecosystem | No ecosystem references another ecosystem. |
| Ownership Reference | An ecosystem references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `ecosystems.world_id` → `worlds.id` | Required. Ownership reference. |
| `ecosystems.continent_id` → `continents.id` | Optional. One of two parent types. |
| `ecosystems.region_id` → `regions.id` | Optional. One of two parent types. |
| Exactly one parent is set | The other is null. |
| No ecosystem references a kingdom or below | Too low. |
| No ecosystem references another ecosystem | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `ecosystems.continent_id` → `continents.id` | An ecosystem belongs to a continent. |
| `ecosystems.region_id` → `regions.id` | An ecosystem belongs to a region. |
| `ecosystems.world_id` → `worlds.id` | An ecosystem belongs to a world. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `ecosystems.kingdom_id` → `kingdoms.id` | An ecosystem does not reference a kingdom. Too low. |
| `ecosystems.city_id` → `cities.id` | An ecosystem does not reference a city. Too low. |
| `ecosystems.parent_ecosystem_id` → `ecosystems.id` | No self-referencing ecosystem hierarchy. |

---

### 7.13 Faction Relationships

#### Purpose

The faction relationships section defines the relationships between the `factions`
table and all other world tables.

#### Scope

The faction relationships apply to the `factions` table and its parent (world). It
may also reference regions for territorial control.

#### Boundaries

A faction belongs to exactly one world. A faction may control regions (via a
junction table). No faction references a continent, kingdom, city, village,
location, landmark, road, or dungeon directly. No faction references another
faction as a parent.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A faction belongs to exactly one world. |
| Optional Territory | A faction may control regions (via a junction table). |
| No Faction-to-Faction Parent | No faction references another faction as a parent. |
| Ownership Reference | A faction references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `factions.world_id` → `worlds.id` | Required. Ownership reference. |
| `faction_territories.faction_id` → `factions.id` | Junction table for territorial control. |
| `faction_territories.region_id` → `regions.id` | Junction table. |
| No faction references a continent or below directly | Via junction table only. |
| No faction references another faction as a parent | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `factions.world_id` → `worlds.id` | A faction belongs to a world. |
| `faction_territories.faction_id` → `factions.id` | A faction controls a region. |
| `faction_territories.region_id` → `regions.id` | The controlled region. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `factions.region_id` → `regions.id` | A faction does not reference a region directly. Use a junction table. |
| `factions.parent_faction_id` → `factions.id` | No self-referencing faction hierarchy. |
| `factions.kingdom_id` → `kingdoms.id` | A faction does not reference a kingdom. Use a junction table. |

---

### 7.14 Religion Relationships

#### Purpose

The religion relationships section defines the relationships between the
`religions` table and all other world tables.

#### Scope

The religion relationships apply to the `religions` table and its parent (world).

#### Boundaries

A religion belongs to exactly one world. No religion references a continent,
region, kingdom, city, village, location, landmark, road, or dungeon directly. No
religion references another religion as a parent.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A religion belongs to exactly one world. |
| No Religion-to-Religion Parent | No religion references another religion as a parent. |
| Ownership Reference | A religion references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `religions.world_id` → `worlds.id` | Required. Ownership reference. |
| No religion references a continent or below directly | No exceptions. |
| No religion references another religion as a parent | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `religions.world_id` → `worlds.id` | A religion belongs to a world. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `religions.region_id` → `regions.id` | A religion does not reference a region. Too low. |
| `religions.parent_religion_id` → `religions.id` | No self-referencing religion hierarchy. |
| `religions.faction_id` → `factions.id` | A religion does not reference a faction. Use a junction table if needed. |

---

### 7.15 World History Relationships

#### Purpose

The world history relationships section defines the relationships between the
`world_history` table and all other world tables.

#### Scope

The world history relationships apply to the `world_history` table and its parent
(world).

#### Boundaries

A world_history record belongs to exactly one world. A world_history record may
reference a major_world_event. No world_history record references a continent,
region, kingdom, city, village, location, landmark, road, dungeon, faction, or
religion directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A world_history record belongs to exactly one world. |
| Optional Event Reference | A world_history record may reference a major_world_event. |
| No Direct Entity Reference | A world_history record does not reference continents, regions, etc. directly. |
| Ownership Reference | A world_history record references a world via `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `world_history.world_id` → `worlds.id` | Required. Ownership reference. |
| `world_history.major_event_id` → `major_world_events.id` | Optional. |
| No world_history record references a continent or below directly | No exceptions. |
| World history is ordered chronologically | Via a sequence or timestamp column. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `world_history.world_id` → `worlds.id` | A history record belongs to a world. |
| `world_history.major_event_id` → `major_world_events.id` | A history record references a major event. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `world_history.continent_id` → `continents.id` | A history record does not reference a continent directly. |
| `world_history.faction_id` → `factions.id` | A history record does not reference a faction directly. |
| `world_history.parent_history_id` → `world_history.id` | No self-referencing history hierarchy. |

---

### 7.16 Major World Event Relationships

#### Purpose

The major world event relationships section defines the relationships between the
`major_world_events` table and all other world tables.

#### Scope

The major world event relationships apply to the `major_world_events` table and its
parent (world_history).

#### Boundaries

A major_world_event belongs to exactly one world (via world_history). A
major_world_event is referenced by world_history records. No major_world_event
references a continent, region, kingdom, city, village, location, landmark, road,
dungeon, faction, or religion directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World Ownership | A major_world_event belongs to a world via `world_id`. |
| Referenced by History | A major_world_event is referenced by world_history records. |
| No Direct Entity Reference | A major_world_event does not reference continents, regions, etc. directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `major_world_events.world_id` → `worlds.id` | Required. Ownership reference. |
| `world_history.major_event_id` → `major_world_events.id` | Optional reference from history. |
| No major_world_event references a continent or below directly | No exceptions. |
| Major world events are ordered chronologically | Via a sequence or timestamp column. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `major_world_events.world_id` → `worlds.id` | A major event belongs to a world. |
| `world_history.major_event_id` → `major_world_events.id` | History references a major event. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `major_world_events.continent_id` → `continents.id` | A major event does not reference a continent directly. |
| `major_world_events.faction_id` → `factions.id` | A major event does not reference a faction directly. |
| `major_world_events.parent_event_id` → `major_world_events.id` | No self-referencing event hierarchy. |

---

### 7.17 Ownership Rules

#### Purpose

The ownership rules section defines how world relationships enforce data ownership.

#### Scope

The ownership rules apply to all 16 world tables and all their relationships.

#### Boundaries

Every world row has a `user_id` referencing the Foundation Layer. Every world row
has a `world_id` referencing the worlds table. RLS scopes every query to the
authenticated user. No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User Ownership | Every world row has a `user_id` referencing the Foundation Layer. |
| World Ownership | Every world row has a `world_id` referencing the worlds table. |
| RLS Enforced | RLS is enforced on every world table. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world row has `user_id` | References the Foundation Layer. |
| Every world row has `world_id` | References the worlds table. |
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |

#### Valid Examples

| Rule Application | Description |
|------------------|-------------|
| `continents.user_id` and `continents.world_id` | A continent has both user and world ownership. |
| `regions.user_id` and `regions.world_id` | A region has both user and world ownership. |
| `factions.user_id` and `factions.world_id` | A faction has both user and world ownership. |

#### Invalid Examples

| Rule Violation | Why Invalid |
|----------------|-------------|
| A continent without `user_id` | Every world row must have `user_id`. |
| A region without `world_id` | Every world row must have `world_id`. |
| A faction accessible by another user | RLS prevents cross-user access. |

---

### 7.18 Dependency Rules

#### Purpose

The dependency rules section defines how world relationships enforce the
dependency hierarchy.

#### Scope

The dependency rules apply to all 16 world tables and all their relationships.

#### Boundaries

The World Layer depends on the Foundation Layer. No world table depends on a layer
above the World Layer. No circular dependencies. The dependency graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Foundation Dependency | The World Layer depends on the Foundation Layer. |
| No Upward Dependencies | No world table depends on a layer above the World Layer. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer depends on the Foundation Layer | Via `user_id`. |
| No world table depends on a layer above the World Layer | No upward references. |
| No circular dependencies | The dependency graph is a DAG. |
| No table skips a level in the hierarchy | Continents reference worlds, regions reference continents, etc. |
| The World Layer follows the Engine Dependency Graph | Topological build order. |

#### Valid Examples

| Dependency | Description |
|------------|-------------|
| `continents.world_id` → `worlds.id` | Continent depends on world. Correct level. |
| `regions.continent_id` → `continents.id` | Region depends on continent. Correct level. |
| `kingdoms.region_id` → `regions.id` | Kingdom depends on region. Correct level. |

#### Invalid Examples

| Dependency | Why Invalid |
|------------|-------------|
| `regions.world_id` → `worlds.id` (as primary parent) | Region skips continent. Wrong level. |
| `worlds.continent_id` → `continents.id` | World depends on continent. Reversed. |
| `locations.world_id` → `worlds.id` (as primary parent) | Location skips city/village/region. Wrong level. |

---

### 7.19 Cascade Rules

#### Purpose

The cascade rules section defines what happens when a parent entity is deleted.

#### Scope

The cascade rules apply to all parent-child relationships in the world layer.

#### Boundaries

Deleting a world cascades to all children. Deleting a continent cascades to its
regions. Deleting a region cascades to its kingdoms. Cascade rules are documented
and tested. No cascade destroys data without documentation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | All cascade rules are documented. |
| Tested | All cascade rules are tested. |
| No Silent Deletion | No cascade destroys data without documentation. |
| Parent-Child Only | Cascade flows from parent to child, never child to parent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Deleting a world cascades to all children | Continents, regions, kingdoms, cities, villages, locations, landmarks, roads, dungeons, climates, ecosystems, factions, religions, world_history, major_world_events. |
| Deleting a continent cascades to its regions | And their children. |
| Deleting a region cascades to its kingdoms | And their children. |
| Deleting a kingdom cascades to its cities and villages | And their children. |
| Deleting a city cascades to its locations and landmarks | And their children. |
| Deleting a village cascades to its locations and landmarks | And their children. |
| Deleting a location cascades to its landmarks | And related roads (via FK). |
| Deleting a world_history record cascades to its major_world_events | If applicable. |
| Cascade flows from parent to child only | Never child to parent. |
| All cascade rules are documented | In the blueprint and Schema.md. |
| All cascade rules are tested | Against all dependent layers. |

#### Valid Examples

| Cascade | Description |
|---------|-------------|
| Delete world → delete all continents | Cascade from world to continents. |
| Delete continent → delete all regions | Cascade from continent to regions. |
| Delete kingdom → delete all cities and villages | Cascade from kingdom to cities and villages. |

#### Invalid Examples

| Cascade | Why Invalid |
|---------|-------------|
| Delete region → delete continent | Cascade never flows from child to parent. |
| Delete location → delete city | Cascade never flows from child to parent. |
| Delete faction → delete world | Cascade never flows from child to parent. |

---

### 7.20 Future Expansion Rules

#### Purpose

The future expansion rules section defines how new relationships are added to the
World Layer.

#### Scope

The future expansion rules apply to all future relationships added to the World
Layer.

#### Boundaries

New relationships are additive. No existing relationship is removed. No new
relationship creates a circular dependency. No new relationship weakens a guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | New relationships are additive. |
| No Removal | No existing relationship is removed. |
| No Circular Dependencies | No new relationship creates a circular dependency. |
| No Weakening | No new relationship weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| New relationships are additive | No dropping existing relationships. |
| No existing relationship is removed | Forward-only migrations. |
| No new relationship creates a circular dependency | The World Layer remains a DAG. |
| No new relationship weakens a guarantee | All 10 guarantees preserved. |
| New relationships are documented before implementation | In the ERD, blueprint, and Schema.md. |
| New relationships are tested against dependent layers | No breaking changes. |

#### Valid Examples

| Expansion | Description |
|-----------|-------------|
| Add `faction_religions` junction table | New relationship between factions and religions. Additive. |
| Add `location_dungeons` junction table | New relationship between locations and dungeons. Additive. |
| Add `city_landmarks` junction table | New relationship between cities and landmarks. Additive. |

#### Invalid Examples

| Expansion | Why Invalid |
|-----------|-------------|
| Remove `regions.continent_id` | No existing relationship is removed. |
| Add `worlds.parent_world_id` | Creates a self-referencing hierarchy. Violates no-cycles rule. |
| Add `locations.faction_id` | Skips hierarchy. A location does not reference a faction directly. |

---

## 8. Security

### Overview

This chapter defines the security architecture for the World Layer. It defines the
security philosophy, authentication and authorization boundaries, ownership
protection, row-level security boundaries, synchronization and replay protection,
migration and snapshot protection, backup and integrity protection, corruption
detection, trust boundaries, threat model, escalation procedures, and recovery
procedures.

This chapter has 16 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 8.1 Security Philosophy

#### Purpose

The security philosophy defines the permanent principles that govern the World
Layer's security architecture.

#### Scope

The security philosophy applies to all 16 world tables and all world operations.

#### Boundaries

RLS is the primary security boundary. The service role key is server-side only. No
client-side authority. No cross-user access from the client. Security is
deterministic.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Primary | RLS is the primary security boundary. |
| Server-Side Authority | The service role key is server-side only. |
| No Client-Side Authority | No client-side conflict resolution. |
| No Cross-User Access | No cross-user access from the client. |
| Deterministic | Security checks are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is the primary security boundary | No exceptions. |
| The service role key is server-side only | Never in client code. |
| No client-side authority | Server-authoritative. |
| No cross-user access from the client | RLS prevents it. |
| Security checks are deterministic | No non-determinism. |
| No security rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Security does not affect save snapshots. |
| Replay Compatibility | Security checks are deterministic. |
| Migration Compatibility | Security rules are never weakened by migrations. |
| Synchronization Compatibility | Security is server-authoritative. |
| Event Bus Compatibility | Security does not affect event ordering. |

---

### 8.2 Authentication Boundaries

#### Purpose

The authentication boundaries section defines how the World Layer relates to
authentication.

#### Scope

The authentication boundaries apply to all world tables and all access paths.

#### Boundaries

The World Layer does not manage authentication. The Foundation Layer manages
authentication. The World Layer references the user ID from the Foundation Layer.
No world table stores passwords, tokens, or session data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Auth Management | The World Layer does not manage authentication. |
| User ID Reference | The World Layer references the user ID from the Foundation Layer. |
| No Credentials | No world table stores passwords, tokens, or session data. |
| Foundation Dependency | Authentication is handled by the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer does not manage authentication | The Foundation Layer does. |
| The World Layer references the user ID | Via `user_id`. |
| No world table stores passwords or tokens | No exceptions. |
| No world table stores session data | No exceptions. |
| Authentication is handled by the Foundation Layer | No exceptions. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Authentication boundaries do not affect save snapshots. |
| Replay Compatibility | Authentication is deterministic. |
| Migration Compatibility | Authentication boundaries are never weakened. |
| Synchronization Compatibility | Authentication is server-authoritative. |
| Event Bus Compatibility | Authentication does not affect event ordering. |

---

### 8.3 Authorization Boundaries

#### Purpose

The authorization boundaries section defines how the World Layer relates to
authorization.

#### Scope

The authorization boundaries apply to all world tables, all RLS policies, and all
access paths.

#### Boundaries

The World Layer does not manage authorization. The Foundation Layer manages
authorization (roles, permissions). The World Layer enforces authorization via
RLS policies. No world table stores role or permission definitions.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Authorization Management | The World Layer does not manage authorization. |
| RLS Enforcement | The World Layer enforces authorization via RLS. |
| No Role Storage | No world table stores role or permission definitions. |
| Foundation Dependency | Authorization is managed by the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer does not manage authorization | The Foundation Layer does. |
| The World Layer enforces authorization via RLS | Four policies per table. |
| No world table stores role or permission definitions | No exceptions. |
| Authorization is managed by the Foundation Layer | No exceptions. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Authorization boundaries do not affect save snapshots. |
| Replay Compatibility | Authorization is deterministic. |
| Migration Compatibility | Authorization boundaries are never weakened. |
| Synchronization Compatibility | Authorization is server-authoritative. |
| Event Bus Compatibility | Authorization does not affect event ordering. |

---

### 8.4 Ownership Protection

#### Purpose

The ownership protection section defines how the World Layer protects data
ownership.

#### Scope

The ownership protection applies to all world tables and all RLS policies.

#### Boundaries

Every world row has a `user_id` referencing the Foundation Layer. RLS scopes every
query to the authenticated user. No cross-user access from the client. The service
role key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User Ownership | Every world row has a `user_id`. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world row has `user_id` | References the Foundation Layer. |
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |
| No ownership protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Ownership protection does not affect save snapshots. |
| Replay Compatibility | Ownership checks are deterministic. |
| Migration Compatibility | Ownership protection is never weakened. |
| Synchronization Compatibility | Ownership is server-authoritative. |
| Event Bus Compatibility | Ownership does not affect event ordering. |

---

### 8.5 Row-Level Security Boundaries

#### Purpose

The row-level security boundaries section defines how RLS is applied to world
tables.

#### Scope

The row-level security boundaries apply to all 16 world tables and all RLS
policies.

#### Boundaries

RLS is enabled on every world table. Four policies per table (SELECT, INSERT,
UPDATE, DELETE). Policies use `auth.uid()` for ownership checks. No `FOR ALL`
policies. No `USING (true)` policies (except for intentionally public data, which
does not apply to the World Layer).

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enabled | RLS is enabled on every world table. |
| Four Policies | Four policies per table (SELECT, INSERT, UPDATE, DELETE). |
| `auth.uid()` Checks | Policies use `auth.uid()` for ownership checks. |
| No FOR ALL | No `FOR ALL` policies. |
| No USING (true) | No `USING (true)` policies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| Policies use `auth.uid()` for ownership checks | No `current_user`. |
| No `FOR ALL` policies | No exceptions. |
| No `USING (true)` policies | No exceptions (World Layer data is not public). |
| UPDATE policies have both USING and WITH CHECK | No weaker WITH CHECK. |
| INSERT policies have WITH CHECK | No weaker INSERT. |
| No RLS rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | RLS does not affect save snapshots. |
| Replay Compatibility | RLS checks are deterministic. |
| Migration Compatibility | RLS policies are never weakened. |
| Synchronization Compatibility | RLS is server-authoritative. |
| Event Bus Compatibility | RLS does not affect event ordering. |

---

### 8.6 Synchronization Protection

#### Purpose

The synchronization protection section defines how the World Layer protects data
during synchronization.

#### Scope

The synchronization protection applies to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. No client-side authority. No
client-side conflict resolution. Sync does not corrupt data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync is server-authoritative. |
| No Client-Side Authority | No client-side conflict resolution. |
| No Corruption | Sync does not corrupt data. |
| Non-Blocking | Sync does not block gameplay. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| No client-side conflict resolution | Server resolves conflicts. |
| Sync does not corrupt data | Atomic operations. |
| Sync is non-blocking | No blocking gameplay. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| No synchronization protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Sync protection does not affect save snapshots. |
| Replay Compatibility | Sync protection is deterministic. |
| Migration Compatibility | Sync protection is never weakened. |
| Synchronization Compatibility | Sync is server-authoritative and non-blocking. |
| Event Bus Compatibility | Sync protection does not affect event ordering. |

---

### 8.7 Replay Protection

#### Purpose

The replay protection section defines how the World Layer protects data during
replays.

#### Scope

The replay protection applies to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots (except the world identifier if the engine
references it). Replays do not query world tables. No non-determinism from world
data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. |
| No Replay Queries | Replays do not query world tables. |
| No Non-Determinism | World data does not introduce non-determinism. |
| Deterministic Identifiers | World identifiers are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| No non-determinism from world data | Same state, same result. |
| No replay protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay protection does not affect save snapshots. |
| Replay Compatibility | World data does not introduce non-determinism. |
| Migration Compatibility | Replay protection is never weakened. |
| Synchronization Compatibility | Replay protection is server-authoritative. |
| Event Bus Compatibility | Replay protection does not affect event ordering. |

---

### 8.8 Migration Protection

#### Purpose

The migration protection section defines how the World Layer protects data during
migrations.

#### Scope

The migration protection applies to all world migrations — any additive change to
the world schema.

#### Boundaries

Migrations are additive, forward-only, and backward compatible. No migration drops
a table, drops a column, renames a column, or changes a column type. No migration
weakens RLS.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Migrations are additive. |
| Forward-Only | Migrations are forward-only. |
| No Destructive Operations | No DROP, rename, or type change. |
| No RLS Weakening | No migration weakens RLS. |
| No Data Loss | The previous valid state is always retained. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Migrations are additive | No destructive operations. |
| Migrations are forward-only | No backward migration. |
| No migration drops a table or column | No exceptions. |
| No migration renames a column | No exceptions. |
| No migration changes a column type | No exceptions. |
| No migration weakens RLS | No exceptions. |
| The previous valid state is always retained | No data loss. |
| No migration protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Migration protection does not affect save snapshots. |
| Replay Compatibility | Migration protection is deterministic. |
| Migration Compatibility | Migrations are additive and forward-only. |
| Synchronization Compatibility | Migration protection is server-authoritative. |
| Event Bus Compatibility | Migration protection does not affect event ordering. |

---

### 8.9 Snapshot Protection

#### Purpose

The snapshot protection section defines how the World Layer protects data from
snapshot corruption.

#### Scope

The snapshot protection applies to the boundary between the World Layer and the
Save Engine's snapshot system.

#### Boundaries

World data is not serialized into engine snapshots. The Save Engine references
world identifiers; it does not serialize world tables. No world data affects
existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No World Serialization | World tables are not serialized into snapshots. |
| Identifier Reference Only | The Save Engine references world identifiers. |
| No Format Change | World data does not affect existing snapshot format. |
| Zero Snapshot Overhead | World data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World tables are not in snapshots | Except the world identifier if referenced. |
| The Save Engine references world identifiers | No world data in snapshots. |
| World data does not affect existing snapshot format | No format changes. |
| World data does not increase snapshot size | Zero overhead. |
| No snapshot protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | World data does not affect save snapshots. |
| Replay Compatibility | Snapshot protection is deterministic. |
| Migration Compatibility | Snapshot protection is never weakened. |
| Synchronization Compatibility | Snapshot protection is server-authoritative. |
| Event Bus Compatibility | Snapshot protection does not affect event ordering. |

---

### 8.10 Backup Protection

#### Purpose

The backup protection section defines how the World Layer protects data during
backups.

#### Scope

The backup protection applies to all world data that is backed up.

#### Boundaries

Backups are atomic. Backups do not destroy data. The previous valid state is always
retained. Backups are documented in the Migration Log.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Atomic | Backups are atomic. |
| No Data Destruction | Backups do not destroy data. |
| Previous State Retained | The previous valid state is always retained. |
| Documented | Backups are documented in the Migration Log. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Backups are atomic | Complete before overwrite. |
| Backups do not destroy data | No data loss. |
| The previous valid state is always retained | No exceptions. |
| Backups are documented | In the Migration Log. |
| No backup protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Backup protection does not affect save snapshots. |
| Replay Compatibility | Backup protection is deterministic. |
| Migration Compatibility | Backup protection is never weakened. |
| Synchronization Compatibility | Backup protection is server-authoritative. |
| Event Bus Compatibility | Backup protection does not affect event ordering. |

---

### 8.11 Integrity Protection

#### Purpose

The integrity protection section defines how the World Layer protects data
integrity.

#### Scope

The integrity protection applies to all constraints, RLS policies, and validation
checks in the world layer.

#### Boundaries

Constraints prevent invalid data. RLS prevents unauthorized access. Referential
integrity is enforced. No integrity protection weakens a guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Constraint-Enforced | Constraints prevent invalid data. |
| RLS-Enforced | RLS prevents unauthorized access. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |
| No Weakening | No integrity protection weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Constraints prevent invalid data | NOT NULL, UNIQUE, CHECK, foreign key. |
| RLS prevents unauthorized access | No cross-user access. |
| Foreign keys are enforced | No orphan rows. |
| No integrity protection weakens a guarantee | All 10 guarantees preserved. |
| Data integrity wins over performance | If a performance optimization compromises integrity, integrity wins. |
| No integrity protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Integrity protection does not affect save snapshots. |
| Replay Compatibility | Integrity protection is deterministic. |
| Migration Compatibility | Integrity protection is never weakened. |
| Synchronization Compatibility | Integrity protection is server-authoritative. |
| Event Bus Compatibility | Integrity protection does not affect event ordering. |

---

### 8.12 Corruption Detection

#### Purpose

The corruption detection section defines how the World Layer detects data
corruption.

#### Scope

The corruption detection applies to all world tables and all world operations.

#### Boundaries

Corruption is detected through constraints, referential integrity, and validation
checks. Corruption is reported, not silently ignored. No corruption detection
destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Constraint-Based Detection | Constraints detect invalid data. |
| Referential Detection | Foreign keys detect orphan rows. |
| No Silent Corruption | Corruption is reported, not silently ignored. |
| No Data Destruction | Corruption detection does not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Constraints detect invalid data | NOT NULL, UNIQUE, CHECK. |
| Foreign keys detect orphan rows | Referential integrity. |
| Corruption is reported | Not silently ignored. |
| Corruption detection does not destroy data | Data preservation is the cardinal rule. |
| No corruption detection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Corruption detection does not affect save snapshots. |
| Replay Compatibility | Corruption detection is deterministic. |
| Migration Compatibility | Corruption detection is never weakened. |
| Synchronization Compatibility | Corruption detection is server-authoritative. |
| Event Bus Compatibility | Corruption detection does not affect event ordering. |

---

### 8.13 Trust Boundaries

#### Purpose

The trust boundaries section defines the trust boundaries for the World Layer.

#### Scope

The trust boundaries apply to all world tables, all access paths, and all trust
decisions.

#### Boundaries

The client is untrusted. The server is trusted. The service role key is
server-side only. RLS is the trust boundary between the client and the database.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Client Untrusted | The client is untrusted. |
| Server Trusted | The server is trusted. |
| Service Role Key Protection | The service role key is server-side only. |
| RLS Trust Boundary | RLS is the trust boundary between the client and the database. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The client is untrusted | No client-side authority. |
| The server is trusted | Server-authoritative. |
| The service role key is server-side only | Never in client code. |
| RLS is the trust boundary | No cross-user access from the client. |
| No trust boundary rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Trust boundaries do not affect save snapshots. |
| Replay Compatibility | Trust boundaries are deterministic. |
| Migration Compatibility | Trust boundaries are never weakened. |
| Synchronization Compatibility | Trust boundaries are server-authoritative. |
| Event Bus Compatibility | Trust boundaries do not affect event ordering. |

---

### 8.14 Threat Model

#### Purpose

The threat model section defines the threats the World Layer must defend against.

#### Scope

The threat model applies to all world tables and all world operations.

#### Boundaries

The World Layer defends against unauthorized access, cross-user access, data
corruption, replay non-determinism, and sync corruption. It does not defend
against server compromise (that is the Foundation Layer's responsibility).

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Unauthorized Access | Defended against via RLS. |
| Cross-User Access | Defended against via RLS. |
| Data Corruption | Defended against via constraints. |
| Replay Non-Determinism | Defended against via deterministic identifiers. |
| Sync Corruption | Defended against via atomic operations. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS defends against unauthorized access | No cross-user access. |
| Constraints defend against data corruption | NOT NULL, UNIQUE, CHECK, FK. |
| Deterministic identifiers defend against replay non-determinism | Never change after creation. |
| Atomic operations defend against sync corruption | No partial writes. |
| No threat model rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | The threat model does not affect save snapshots. |
| Replay Compatibility | The threat model is deterministic. |
| Migration Compatibility | The threat model is never weakened. |
| Synchronization Compatibility | The threat model is server-authoritative. |
| Event Bus Compatibility | The threat model does not affect event ordering. |

---

### 8.15 Escalation Procedures

#### Purpose

The escalation procedures section defines how security incidents are escalated.

#### Scope

The escalation procedures apply to all security incidents involving world data.

#### Boundaries

Security incidents are reported to the Lead Database Architect. The Lead Database
Architect escalates to the Lead Architect. No incident is silently ignored. No
incident destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Reported | All incidents are reported. |
| Escalated | All incidents are escalated to the Lead Architect. |
| No Silent Incidents | No incident is silently ignored. |
| No Data Destruction | No incident destroys data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All incidents are reported to the Lead Database Architect | No exceptions. |
| The Lead Database Architect escalates to the Lead Architect | No exceptions. |
| No incident is silently ignored | Every incident is logged and surfaced. |
| No incident destroys data | Data preservation is the cardinal rule. |
| No escalation procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Escalation procedures do not affect save snapshots. |
| Replay Compatibility | Escalation procedures are deterministic. |
| Migration Compatibility | Escalation procedures are never weakened. |
| Synchronization Compatibility | Escalation procedures are server-authoritative. |
| Event Bus Compatibility | Escalation procedures do not affect event ordering. |

---

### 8.16 Recovery Procedures

#### Purpose

The recovery procedures section defines how the World Layer recovers from security
incidents.

#### Scope

The recovery procedures apply to all security incidents involving world data.

#### Boundaries

Recovery restores the previous valid state. Recovery does not destroy data.
Recovery is documented. Recovery is tested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Previous State Restored | Recovery restores the previous valid state. |
| No Data Destruction | Recovery does not destroy data. |
| Documented | Recovery procedures are documented. |
| Tested | Recovery procedures are tested. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Recovery restores the previous valid state | No data loss. |
| Recovery does not destroy data | Data preservation is the cardinal rule. |
| Recovery procedures are documented | In the blueprint and Migration Log. |
| Recovery procedures are tested | Against all dependent layers. |
| No recovery procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Recovery procedures do not affect save snapshots. |
| Replay Compatibility | Recovery procedures are deterministic. |
| Migration Compatibility | Recovery procedures are never weakened. |
| Synchronization Compatibility | Recovery procedures are server-authoritative. |
| Event Bus Compatibility | Recovery procedures do not affect event ordering. |

---

## 9. Validation

### Overview

This chapter defines the validation architecture for the World Layer. It defines
the validation philosophy, structural validation, ownership validation, relationship
validation, dependency validation, synchronization validation, replay validation,
migration validation, snapshot validation, backup validation, integrity
validation, corruption validation, reporting procedures, and acceptance
procedures.

This chapter has 14 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and validation rules.

---

### 9.1 Validation Philosophy

#### Purpose

The validation philosophy defines the permanent principles that govern the World
Layer's validation architecture.

#### Scope

The validation philosophy applies to all 16 world tables and all world operations.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. No
validation failure is silent. Data integrity wins over performance.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is enforced at the database boundary. |
| Deterministic | Validation is deterministic. Same input, same result. |
| No Silent Failures | Validation failures are logged and surfaced. |
| No Data Destruction | Validation does not destroy data. |
| Integrity Over Performance | Data integrity wins over performance. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| No validation failure is silent | Every failure is logged and surfaced. |
| No validation destroys data | Data preservation is the cardinal rule. |
| Data integrity wins over performance | If a performance optimization compromises integrity, integrity wins. |
| No validation philosophy rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Every world table has constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Every world table has RLS | Four policies per table. |
| Every validation failure is logged | No silent failures. |
| Every validation failure is surfaced | Visible to the user or operator. |
| Validation is tested | Against all dependent layers. |

---

### 9.2 Structural Validation

#### Purpose

The structural validation section defines how world data is validated for
structural correctness.

#### Scope

The structural validation applies to all 16 world tables and their columns.

#### Boundaries

Structural validation enforces NOT NULL, UNIQUE, CHECK constraints. It ensures
every row has the required columns. It ensures no column has an invalid value.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| NOT NULL Enforced | Required columns are NOT NULL. |
| UNIQUE Enforced | Unique columns are UNIQUE. |
| CHECK Enforced | Check constraints validate column values. |
| No Invalid Values | No column has an invalid value. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Required columns are NOT NULL | `id`, `user_id`, `world_id`, `created_at`, `updated_at`. |
| Unique columns are UNIQUE | e.g., `worlds.name` per user. |
| Check constraints validate column values | e.g., name not empty. |
| No column has an invalid value | Constraints prevent it. |
| No structural validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `id` is NOT NULL and UNIQUE | Every table. |
| `user_id` is NOT NULL | Every table. |
| `world_id` is NOT NULL | Every table. |
| `created_at` is NOT NULL | Every table. |
| `updated_at` is NOT NULL | Every table. |
| `name` is NOT NULL and not empty | Where applicable. |
| Unique constraints are documented | In the blueprint and Schema.md. |

---

### 9.3 Ownership Validation

#### Purpose

The ownership validation section defines how world data is validated for ownership
correctness.

#### Scope

The ownership validation applies to all world tables and all RLS policies.

#### Boundaries

Ownership validation ensures every row has a valid `user_id` and `world_id`. It
ensures RLS scopes every query. No cross-user access.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid User ID | Every row has a valid `user_id`. |
| Valid World ID | Every row has a valid `world_id`. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every row has a valid `user_id` | References the Foundation Layer. |
| Every row has a valid `world_id` | References the worlds table. |
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| No ownership validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `user_id` is NOT NULL and references a valid user | Every table. |
| `world_id` is NOT NULL and references a valid world | Every table. |
| INSERT policy WITH CHECK ensures `user_id = auth.uid()` | Every table. |
| UPDATE policy WITH CHECK ensures `user_id = auth.uid()` | Every table. |
| SELECT policy USING ensures `user_id = auth.uid()` | Every table. |
| DELETE policy USING ensures `user_id = auth.uid()` | Every table. |

---

### 9.4 Relationship Validation

#### Purpose

The relationship validation section defines how world data is validated for
relationship correctness.

#### Scope

The relationship validation applies to all foreign keys in the world layer.

#### Boundaries

Relationship validation ensures all foreign keys are valid. No orphan rows.
Referential integrity is enforced.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid Foreign Keys | All foreign keys reference valid rows. |
| No Orphan Rows | No orphan rows. |
| Referential Integrity | Referential integrity is enforced. |
| Cascade Rules Enforced | Cascade rules are enforced per documentation. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All foreign keys are valid | No dangling references. |
| No orphan rows | Referential integrity. |
| Cascade rules are enforced | Per Chapter 7 §7.19. |
| No relationship validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `continents.world_id` references a valid `worlds.id` | Enforced. |
| `regions.continent_id` references a valid `continents.id` | Enforced. |
| `kingdoms.region_id` references a valid `regions.id` | Enforced. |
| `cities.kingdom_id` references a valid `kingdoms.id` | Enforced. |
| `villages.kingdom_id` references a valid `kingdoms.id` | Enforced. |
| `roads.from_location_id` references a valid `locations.id` | Enforced. |
| `roads.to_location_id` references a valid `locations.id` | Enforced. |
| All foreign keys are indexed | No unindexed foreign keys. |

---

### 9.5 Dependency Validation

#### Purpose

The dependency validation section defines how world data is validated for
dependency correctness.

#### Scope

The dependency validation applies to all cross-layer dependencies involving the
World Layer.

#### Boundaries

Dependency validation ensures no circular dependencies. No upward dependencies.
The dependency graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Circular Dependencies | The dependency graph is a DAG. |
| No Upward Dependencies | The World Layer does not depend on any layer above it. |
| Foundation Dependency Only | The World Layer depends on the Foundation Layer. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| No circular dependencies | The dependency graph is a DAG. |
| No upward dependencies | The World Layer does not depend on any layer above it. |
| The World Layer depends on the Foundation Layer | Via `user_id`. |
| No table skips a level in the hierarchy | Continents reference worlds, regions reference continents, etc. |
| No dependency validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No world table references a layer above the World Layer | No upward references. |
| No world table creates a circular dependency | DAG preserved. |
| Every world table has `user_id` referencing the Foundation Layer | Foundation dependency. |
| No table skips a level | Hierarchy preserved. |
| The World Layer follows the Engine Dependency Graph | Topological build order. |

---

### 9.6 Synchronization Validation

#### Purpose

The synchronization validation section defines how world data is validated during
synchronization.

#### Scope

The synchronization validation applies to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync validation is server-authoritative and non-blocking. No client-side authority.
No sync corruption.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync validation is server-authoritative. |
| Non-Blocking | Sync validation does not block gameplay. |
| No Corruption | Sync validation does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync validation is server-authoritative | No client-side authority. |
| Sync validation is non-blocking | No blocking gameplay. |
| Sync validation does not corrupt data | Atomic operations. |
| The World Layer does not manage sync validation | The Synchronization Architecture does. |
| No synchronization validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Sync operations are atomic | No partial writes. |
| Sync operations do not block gameplay | Non-blocking. |
| Sync operations are server-authoritative | No client-side conflict resolution. |
| Sync failures do not corrupt data | Previous valid state retained. |
| Sync failures do not crash the game | Degraded state. |

---

### 9.7 Replay Validation

#### Purpose

The replay validation section defines how world data is validated for replay
compatibility.

#### Scope

The replay validation applies to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

Replay validation ensures no non-determinism from world data. World identifiers
are deterministic. Replays do not query world tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Non-Determinism | World data does not introduce non-determinism. |
| Deterministic Identifiers | World identifiers are deterministic. |
| No Replay Queries | Replays do not query world tables. |
| Cross-Platform | World identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World identifiers are deterministic | Never change after creation. |
| No non-determinism from world data | Same state, same result. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are platform-independent | Cross-platform replay works. |
| No replay validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| World identifiers are never changed after creation | Deterministic. |
| No wall-clock time affects world data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects world data in snapshots | No random non-determinism. |
| World identifiers are platform-independent | Cross-platform. |
| Replays do not query world tables | Zero overhead. |

---

### 9.8 Migration Validation

#### Purpose

The migration validation section defines how world migrations are validated.

#### Scope

The migration validation applies to all world migrations — any additive change to
the world schema.

#### Boundaries

Migration validation ensures migrations are additive, forward-only, and backward
compatible. No migration destroys data. Every migration is tested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Migrations are additive. |
| Forward-Only | Migrations are forward-only. |
| Backward Compatible | Migrations do not break existing data. |
| No Data Loss | No migration destroys data. |
| Tested | Every migration is tested. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Migrations are additive | No destructive operations. |
| Migrations are forward-only | No backward migration. |
| No migration destroys data | Previous valid state retained. |
| Every migration is tested | Against all dependent layers. |
| No migration is merged with failing tests | No broken migrations. |
| No migration validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No migration drops a table | No exceptions. |
| No migration drops a column | No exceptions. |
| No migration renames a column | No exceptions. |
| No migration changes a column type | No exceptions. |
| Every migration is logged | In `docs/database/Migration_Log.md`. |
| Every migration is tested against all dependent layers | No breaking changes. |
| No migration is merged with failing tests | No exceptions. |

---

### 9.9 Snapshot Validation

#### Purpose

The snapshot validation section defines how world data is validated for snapshot
compatibility.

#### Scope

The snapshot validation applies to the boundary between the World Layer and the
Save Engine's snapshot system.

#### Boundaries

Snapshot validation ensures world data is not in engine snapshots (except the
world identifier). No world data affects existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No World Serialization | World tables are not serialized into snapshots. |
| No Format Change | World data does not affect existing snapshot format. |
| Zero Snapshot Overhead | World data does not increase snapshot size. |
| Identifier Reference Only | The Save Engine references world identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World tables are not in snapshots | Except the world identifier if referenced. |
| World data does not affect existing snapshot format | No format changes. |
| World data does not increase snapshot size | Zero overhead. |
| The Save Engine references world identifiers | No world data in snapshots. |
| No snapshot validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No world table is serialized into engine snapshots | Except the world identifier. |
| The Save Engine references world identifiers only | No world data. |
| World data does not change snapshot format | Backward compatible. |
| World data does not increase snapshot size | Zero overhead. |
| Snapshot validation is tested | Against the Save Engine. |

---

### 9.10 Backup Validation

#### Purpose

The backup validation section defines how world data backups are validated.

#### Scope

The backup validation applies to all world data that is backed up.

#### Boundaries

Backup validation ensures backups are atomic, do not destroy data, and retain the
previous valid state.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Atomic | Backups are atomic. |
| No Data Destruction | Backups do not destroy data. |
| Previous State Retained | The previous valid state is always retained. |
| Documented | Backups are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Backups are atomic | Complete before overwrite. |
| Backups do not destroy data | No data loss. |
| The previous valid state is always retained | No exceptions. |
| Backups are documented | In the Migration Log. |
| No backup validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Backup is complete before overwrite begins | Atomic. |
| No failure path destroys data | Previous valid state retained. |
| Backup retention is configurable | Per the Database Architecture Blueprint. |
| Backup is documented | In the Migration Log. |
| Backup validation is tested | Against all dependent layers. |

---

### 9.11 Integrity Validation

#### Purpose

The integrity validation section defines how world data is validated for overall
integrity.

#### Scope

The integrity validation applies to all constraints, RLS policies, and validation
checks in the world layer.

#### Boundaries

Integrity validation ensures constraints, RLS, and referential integrity are all
enforced. No integrity validation destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Constraint-Enforced | Constraints prevent invalid data. |
| RLS-Enforced | RLS prevents unauthorized access. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |
| No Data Destruction | Integrity validation does not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Constraints prevent invalid data | NOT NULL, UNIQUE, CHECK, FK. |
| RLS prevents unauthorized access | No cross-user access. |
| Foreign keys are enforced | No orphan rows. |
| No integrity validation destroys data | Data preservation is the cardinal rule. |
| Data integrity wins over performance | If a performance optimization compromises integrity, integrity wins. |
| No integrity validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All NOT NULL constraints are enforced | Every required column. |
| All UNIQUE constraints are enforced | Every unique column. |
| All CHECK constraints are enforced | Every validated column. |
| All foreign key constraints are enforced | No orphan rows. |
| All RLS policies are enforced | Four per table. |
| Integrity validation is tested | Against all dependent layers. |

---

### 9.12 Corruption Validation

#### Purpose

The corruption validation section defines how world data is validated for
corruption.

#### Scope

The corruption validation applies to all world tables and all world operations.

#### Boundaries

Corruption validation detects invalid data, orphan rows, and unauthorized access.
Corruption is reported, not silently ignored. No corruption validation destroys
data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Invalid Data Detected | Constraints detect invalid data. |
| Orphan Rows Detected | Foreign keys detect orphan rows. |
| Unauthorized Access Detected | RLS detects unauthorized access. |
| No Silent Corruption | Corruption is reported. |
| No Data Destruction | Corruption validation does not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Constraints detect invalid data | NOT NULL, UNIQUE, CHECK. |
| Foreign keys detect orphan rows | Referential integrity. |
| RLS detects unauthorized access | No cross-user access. |
| Corruption is reported | Not silently ignored. |
| Corruption validation does not destroy data | Data preservation is the cardinal rule. |
| No corruption validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| NOT NULL violations are detected and reported | Every required column. |
| UNIQUE violations are detected and reported | Every unique column. |
| CHECK violations are detected and reported | Every validated column. |
| Foreign key violations are detected and reported | No orphan rows. |
| RLS violations are detected and reported | No cross-user access. |
| No corruption validation destroys data | Previous valid state retained. |

---

### 9.13 Reporting Procedures

#### Purpose

The reporting procedures section defines how validation failures are reported.

#### Scope

The reporting procedures apply to all validation failures in the world layer.

#### Boundaries

Validation failures are logged and surfaced. No failure is silent. Failures are
reported to the Lead Database Architect. No failure destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Logged | All failures are logged. |
| Surfaced | All failures are surfaced. |
| No Silent Failures | No failure is silently ignored. |
| No Data Destruction | No failure destroys data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All validation failures are logged | No silent failures. |
| All validation failures are surfaced | Visible to the user or operator. |
| Failures are reported to the Lead Database Architect | No exceptions. |
| No failure destroys data | Data preservation is the cardinal rule. |
| No reporting procedure rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Every validation failure produces a log entry | No exceptions. |
| Every validation failure is surfaced to the user or operator | No exceptions. |
| Validation failures are categorized | By type (structural, ownership, relationship, etc.). |
| Validation failures are traceable | To the table, column, and constraint. |
| No validation failure destroys data | Previous valid state retained. |

---

### 9.14 Acceptance Procedures

#### Purpose

The acceptance procedures section defines how validation is accepted before the
World Layer is locked.

#### Scope

The acceptance procedures apply to all validation checks in the world layer
before the blueprint is locked.

#### Boundaries

All validation checks must pass before the blueprint is locked. No validation
check is skipped. No validation check is weakened. The Lead Architect approves
the validation results.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| All Checks Pass | All validation checks must pass before lock. |
| No Skipped Checks | No validation check is skipped. |
| No Weakened Checks | No validation check is weakened. |
| Lead Architect Approval | The Lead Architect approves the validation results. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All validation checks must pass before lock | No exceptions. |
| No validation check is skipped | No exceptions. |
| No validation check is weakened | No exceptions. |
| The Lead Architect approves the validation results | No exceptions. |
| Validation results are documented | In the blueprint and Completion Checklist. |
| No acceptance procedure rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All structural validation checks pass | NOT NULL, UNIQUE, CHECK, FK. |
| All ownership validation checks pass | RLS, user_id, world_id. |
| All relationship validation checks pass | Foreign keys, no orphan rows. |
| All dependency validation checks pass | No circular dependencies, no upward dependencies. |
| All synchronization validation checks pass | Server-authoritative, non-blocking. |
| All replay validation checks pass | No non-determinism, deterministic identifiers. |
| All migration validation checks pass | Additive, forward-only, backward compatible. |
| All snapshot validation checks pass | No world serialization, no format change. |
| All backup validation checks pass | Atomic, no data destruction. |
| All integrity validation checks pass | Constraints, RLS, referential integrity. |
| All corruption validation checks pass | Detection, reporting, no data destruction. |
| The Lead Architect signs off on all validation results | No exceptions. |

---

## Sprint 1.2.2.3 Review

### Sprint Summary

**Sprint:** 1.2.2.3 — World Blueprint v1.0 (Chapters 7–9)
**Status:** COMPLETE
**Date:** 2026-08-03

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 7 | Relationships | 20 sections: relationship philosophy, world/continent/region/kingdom/city/village/road/landmark/dungeon/climate/ecosystem/faction/religion/world history/major world event relationships, ownership rules, dependency rules, cascade rules, future expansion rules. Each with purpose, scope, boundaries, guarantees, permanent rules, valid examples, invalid examples. |
| 8 | Security | 16 sections: security philosophy, authentication/authorization boundaries, ownership protection, RLS boundaries, synchronization/replay/migration/snapshot/backup protection, integrity protection, corruption detection, trust boundaries, threat model, escalation procedures, recovery procedures. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 9 | Validation | 14 sections: validation philosophy, structural/ownership/relationship/dependency/synchronization/replay/migration/snapshot/backup/integrity/corruption validation, reporting procedures, acceptance procedures. Each with purpose, scope, boundaries, guarantees, permanent rules, validation rules. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–9) | PASS |
| No gaps in chapter numbering | PASS |
| Deterministic execution preserved | PASS |
| Replay compatibility preserved | PASS |
| Migration compatibility preserved | PASS |
| Synchronization compatibility preserved | PASS |
| Ownership consistency preserved | PASS |
| Dependency consistency preserved | PASS |
| Naming consistency preserved | PASS |
| Lock policy compliance preserved | PASS |
| Event ordering consistency preserved | PASS |
| Snapshot compatibility preserved | PASS |
| Save compatibility preserved | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Blueprint documentation only | PASS |

### Notes

- The World Blueprint is IN PROGRESS. Chapters 10–16 are pending.
- Next sprint: 1.2.2.4 — Chapter 10 (Performance), Chapter 11 (Testing).

---

## 10. Performance Architecture

### Overview

This chapter defines the performance architecture for the World Layer. It defines
the performance philosophy, principles, storage optimization, index optimization,
partition optimization, query optimization, synchronization optimization, replay
optimization, snapshot optimization, backup optimization, monitoring strategy,
profiling strategy, benchmark strategy, storage limits, memory limits, and
performance targets.

This chapter has 16 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 10.1 Performance Philosophy

#### Purpose

The performance philosophy defines the permanent principles that govern the World
Layer's performance architecture.

#### Scope

The performance philosophy applies to all 16 world tables and all world
operations.

#### Boundaries

Data integrity wins over performance. No performance optimization weakens a
guarantee. Performance is deterministic. Performance is measured, not assumed.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Integrity Over Performance | Data integrity wins over performance. |
| No Guarantee Weakening | No performance optimization weakens a guarantee. |
| Deterministic | Performance is deterministic. |
| Measured | Performance is measured, not assumed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Data integrity wins over performance | If a performance optimization compromises integrity, integrity wins. |
| No performance optimization weakens a guarantee | All 10 guarantees preserved. |
| Performance is deterministic | No non-determinism. |
| Performance is measured, not assumed | Evidence-based optimization. |
| No performance philosophy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Performance philosophy does not affect save snapshots. |
| Replay Compatibility | Performance is deterministic. |
| Migration Compatibility | Performance philosophy is never weakened by migrations. |
| Synchronization Compatibility | Performance is server-authoritative. |
| Event Bus Compatibility | Performance does not affect event ordering. |

---

### 10.2 Performance Principles

#### Purpose

The performance principles define the permanent rules that govern all performance
decisions in the World Layer.

#### Scope

The performance principles apply to all 16 world tables and all world operations.

#### Boundaries

All foreign keys are indexed. Queries return bounded result sets. No speculative
indexes. No unbounded queries. Performance is evidence-based.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Indexed Foreign Keys | All foreign key columns are indexed. |
| Bounded Queries | Queries return bounded result sets. |
| No Speculative Indexes | Indexes are justified by evidence. |
| Evidence-Based | Performance decisions are evidence-based. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All foreign keys are indexed | No unindexed foreign keys. |
| No query loads an unbounded result set | Pagination is used. |
| Indexes are justified by evidence | No speculative indexes. |
| Performance decisions are evidence-based | No assumptions. |
| No performance principle is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Performance principles do not affect save snapshots. |
| Replay Compatibility | Performance principles are deterministic. |
| Migration Compatibility | Performance principles are never weakened. |
| Synchronization Compatibility | Performance principles are server-authoritative. |
| Event Bus Compatibility | Performance principles do not affect event ordering. |

---

### 10.3 Storage Optimization

#### Purpose

The storage optimization section defines how world tables are optimized for storage
efficiency.

#### Scope

The storage optimization applies to all 16 world tables.

#### Boundaries

Storage optimization does not destroy data. Storage optimization is additive.
No storage optimization weakens a guarantee. Storage is monitored.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Data Destruction | Storage optimization does not destroy data. |
| Additive | Storage optimization is additive. |
| No Guarantee Weakening | No storage optimization weakens a guarantee. |
| Monitored | Storage is monitored. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Storage optimization does not destroy data | Data preservation is the cardinal rule. |
| Storage optimization is additive | No destructive optimization. |
| No storage optimization weakens a guarantee | All 10 guarantees preserved. |
| Storage is monitored | Row counts, table sizes. |
| No storage optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Storage optimization does not affect save snapshots. |
| Replay Compatibility | Storage optimization is deterministic. |
| Migration Compatibility | Storage optimization is never weakened. |
| Synchronization Compatibility | Storage optimization is server-authoritative. |
| Event Bus Compatibility | Storage optimization does not affect event ordering. |

---

### 10.4 Index Optimization

#### Purpose

The index optimization section defines how world tables are indexed for query
efficiency.

#### Scope

The index optimization applies to all 16 world tables and all world queries.

#### Boundaries

All foreign key columns are indexed. Indexes are justified by evidence. No
speculative indexes. No unindexed foreign keys. Indexes are documented.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Indexed Foreign Keys | All foreign key columns are indexed. |
| Justified Indexes | Indexes are justified by evidence. |
| No Speculative Indexes | No indexes without evidence. |
| Documented | All indexes are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All foreign keys are indexed | No unindexed foreign keys. |
| Indexes are justified by evidence | No speculative indexes. |
| Indexes are documented | In the blueprint and Schema.md. |
| No index is removed without a migration | Forward-only. |
| No index optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Index optimization does not affect save snapshots. |
| Replay Compatibility | Index optimization is deterministic. |
| Migration Compatibility | Index optimization is additive. |
| Synchronization Compatibility | Index optimization is server-authoritative. |
| Event Bus Compatibility | Index optimization does not affect event ordering. |

---

### 10.5 Partition Optimization

#### Purpose

The partition optimization section defines how world tables are partitioned for
scalability.

#### Scope

The partition optimization applies to world tables that grow large over time:
world_history, major_world_events, locations, landmarks, roads.

#### Boundaries

Partitioning is by world (or by world and time for history tables). Partitioning
is additive. No partitioning weakens integrity or compatibility.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World-Partitioned | Large tables are partitioned by world. |
| Additive | Partitioning is additive. |
| No Integrity Weakening | Partitioning does not weaken integrity. |
| No Compatibility Weakening | Partitioning does not weaken compatibility. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Large tables are partitioned by world | world_history, major_world_events, locations, landmarks, roads. |
| Partitioning is additive | No destructive partitioning. |
| Partitioning does not weaken integrity | Data integrity wins. |
| Partitioning does not weaken compatibility | All 10 guarantees preserved. |
| Partitioning is documented | In the blueprint and Schema.md. |
| No partition optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Partition optimization does not affect save snapshots. |
| Replay Compatibility | Partition optimization is deterministic. |
| Migration Compatibility | Partition optimization is additive. |
| Synchronization Compatibility | Partition optimization is server-authoritative. |
| Event Bus Compatibility | Partition optimization does not affect event ordering. |

---

### 10.6 Query Optimization

#### Purpose

The query optimization section defines how world queries are optimized for
performance.

#### Scope

The query optimization applies to all world queries.

#### Boundaries

Queries return bounded result sets. No unbounded queries. Pagination is used.
Queries use indexes. No query loads all rows.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Bounded Result Sets | Queries return bounded result sets. |
| Indexed | Queries use indexes. |
| No Unbounded Queries | No query loads all rows. |
| Pagination | Pagination is used for large result sets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| No query loads an unbounded result set | Pagination is used. |
| Queries use indexes | No full-table scans for indexed columns. |
| Pagination is used for large result sets | No exceptions. |
| Query optimization is documented | In the blueprint and Schema.md. |
| No query optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Query optimization does not affect save snapshots. |
| Replay Compatibility | Query optimization is deterministic. |
| Migration Compatibility | Query optimization is never weakened. |
| Synchronization Compatibility | Query optimization is server-authoritative. |
| Event Bus Compatibility | Query optimization does not affect event ordering. |

---

### 10.7 Synchronization Optimization

#### Purpose

The synchronization optimization section defines how world data sync is optimized
for performance.

#### Scope

The synchronization optimization applies to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. Sync does not block gameplay. Sync
is batched where possible. No sync optimization corrupts data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Sync does not block gameplay. |
| Batched | Sync is batched where possible. |
| No Corruption | Sync optimization does not corrupt data. |
| Server-Authoritative | Sync is server-authoritative. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is non-blocking | No blocking gameplay. |
| Sync is batched where possible | Reduce round trips. |
| Sync optimization does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| No synchronization optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Sync optimization does not affect save snapshots. |
| Replay Compatibility | Sync optimization is deterministic. |
| Migration Compatibility | Sync optimization is never weakened. |
| Synchronization Compatibility | Sync is server-authoritative and non-blocking. |
| Event Bus Compatibility | Sync optimization does not affect event ordering. |

---

### 10.8 Replay Optimization

#### Purpose

The replay optimization section defines how world data is optimized for replay
performance.

#### Scope

The replay optimization applies to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots. Replays do not query world tables. The
World Layer has zero replay overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| No Non-Determinism | World data does not introduce non-determinism. |
| Deterministic Identifiers | World identifiers are deterministic. |
| Cross-Platform | World identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| No replay optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay optimization does not affect save snapshots. |
| Replay Compatibility | World data does not introduce non-determinism. |
| Migration Compatibility | Replay optimization is never weakened. |
| Synchronization Compatibility | Replay optimization is server-authoritative. |
| Event Bus Compatibility | Replay optimization does not affect event ordering. |

---

### 10.9 Snapshot Optimization

#### Purpose

The snapshot optimization section defines how world data is optimized for snapshot
performance.

#### Scope

The snapshot optimization applies to the boundary between the World Layer and the
Save Engine's snapshot system.

#### Boundaries

World data is not serialized into engine snapshots. The Save Engine references
world identifiers only. No world data affects existing snapshot format. Zero
snapshot overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No World Serialization | World tables are not serialized into snapshots. |
| Zero Snapshot Overhead | World data does not increase snapshot size. |
| No Format Change | World data does not affect existing snapshot format. |
| Identifier Reference Only | The Save Engine references world identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World tables are not in snapshots | Except the world identifier if referenced. |
| World data does not increase snapshot size | Zero overhead. |
| World data does not affect existing snapshot format | No format changes. |
| The Save Engine references world identifiers | No world data in snapshots. |
| No snapshot optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | World data does not affect save snapshots. |
| Replay Compatibility | Snapshot optimization is deterministic. |
| Migration Compatibility | Snapshot optimization is never weakened. |
| Synchronization Compatibility | Snapshot optimization is server-authoritative. |
| Event Bus Compatibility | Snapshot optimization does not affect event ordering. |

---

### 10.10 Backup Optimization

#### Purpose

The backup optimization section defines how world data backups are optimized for
performance.

#### Scope

The backup optimization applies to all world data that is backed up.

#### Boundaries

Backups are atomic. Backups do not destroy data. Backups are batched where
possible. The previous valid state is always retained.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Atomic | Backups are atomic. |
| No Data Destruction | Backups do not destroy data. |
| Batched | Backups are batched where possible. |
| Previous State Retained | The previous valid state is always retained. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Backups are atomic | Complete before overwrite. |
| Backups do not destroy data | No data loss. |
| Backups are batched where possible | Reduce overhead. |
| The previous valid state is always retained | No exceptions. |
| No backup optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Backup optimization does not affect save snapshots. |
| Replay Compatibility | Backup optimization is deterministic. |
| Migration Compatibility | Backup optimization is never weakened. |
| Synchronization Compatibility | Backup optimization is server-authoritative. |
| Event Bus Compatibility | Backup optimization does not affect event ordering. |

---

### 10.11 Monitoring Strategy

#### Purpose

The monitoring strategy section defines how world data performance is monitored.

#### Scope

The monitoring strategy applies to all 16 world tables and all world operations.

#### Boundaries

Monitoring is non-blocking. Monitoring does not affect gameplay. The World Layer
does not define the monitoring framework. Monitoring provides row counts, table
sizes, and query performance characteristics.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring does not block gameplay. |
| Observable | World data is observable through metrics. |
| No Monitoring Framework | The World Layer does not define the monitoring framework. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| Monitoring provides row counts, table sizes, and query performance | Observable. |
| The World Layer does not define the monitoring framework | It uses the project's monitoring standards. |
| Monitoring metrics are documented | In the blueprint. |
| No monitoring strategy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Monitoring does not affect save snapshots. |
| Replay Compatibility | Monitoring is deterministic. |
| Migration Compatibility | Monitoring is never weakened. |
| Synchronization Compatibility | Monitoring is server-authoritative. |
| Event Bus Compatibility | Monitoring does not affect event ordering. |

---

### 10.12 Profiling Strategy

#### Purpose

The profiling strategy section defines how world data performance is profiled.

#### Scope

The profiling strategy applies to all 16 world tables and all world queries.

#### Boundaries

Profiling is non-blocking. Profiling is evidence-based. Profiling identifies slow
queries and missing indexes. No profiling destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Profiling does not block gameplay. |
| Evidence-Based | Profiling is evidence-based. |
| Identifies Slow Queries | Profiling identifies slow queries. |
| No Data Destruction | Profiling does not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Profiling is non-blocking | No blocking gameplay. |
| Profiling is evidence-based | No assumptions. |
| Profiling identifies slow queries and missing indexes | Actionable results. |
| Profiling does not destroy data | Data preservation is the cardinal rule. |
| No profiling strategy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Profiling does not affect save snapshots. |
| Replay Compatibility | Profiling is deterministic. |
| Migration Compatibility | Profiling is never weakened. |
| Synchronization Compatibility | Profiling is server-authoritative. |
| Event Bus Compatibility | Profiling does not affect event ordering. |

---

### 10.13 Benchmark Strategy

#### Purpose

The benchmark strategy section defines how world data performance is benchmarked.

#### Scope

The benchmark strategy applies to all 16 world tables and all world queries.

#### Boundaries

Benchmarks are deterministic. Benchmarks are reproducible. Benchmarks are
documented. No benchmark destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Benchmarks are deterministic. |
| Reproducible | Benchmarks are reproducible. |
| Documented | Benchmarks are documented. |
| No Data Destruction | Benchmarks do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Benchmarks are deterministic | Same input, same result. |
| Benchmarks are reproducible | Can be re-run with same results. |
| Benchmarks are documented | In the blueprint. |
| Benchmarks do not destroy data | Data preservation is the cardinal rule. |
| No benchmark strategy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Benchmarks do not affect save snapshots. |
| Replay Compatibility | Benchmarks are deterministic. |
| Migration Compatibility | Benchmarks are never weakened. |
| Synchronization Compatibility | Benchmarks are server-authoritative. |
| Event Bus Compatibility | Benchmarks do not affect event ordering. |

---

### 10.14 Storage Limits

#### Purpose

The storage limits section defines the storage limits for world data.

#### Scope

The storage limits apply to all 16 world tables.

#### Boundaries

Storage limits are documented. Storage limits are monitored. No storage limit
destroys data. Storage limits are configurable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Storage limits are documented. |
| Monitored | Storage limits are monitored. |
| No Data Destruction | Storage limits do not destroy data. |
| Configurable | Storage limits are configurable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Storage limits are documented | In the blueprint. |
| Storage limits are monitored | Alerts when approaching limits. |
| Storage limits do not destroy data | Data preservation is the cardinal rule. |
| Storage limits are configurable | Per the Database Architecture Blueprint. |
| No storage limit rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Storage limits do not affect save snapshots. |
| Replay Compatibility | Storage limits are deterministic. |
| Migration Compatibility | Storage limits are never weakened. |
| Synchronization Compatibility | Storage limits are server-authoritative. |
| Event Bus Compatibility | Storage limits do not affect event ordering. |

---

### 10.15 Memory Limits

#### Purpose

The memory limits section defines the memory limits for world data operations.

#### Scope

The memory limits apply to all world queries and world operations.

#### Boundaries

Memory limits are documented. Memory limits are monitored. No memory limit
destroys data. Queries return bounded result sets to control memory usage.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Memory limits are documented. |
| Monitored | Memory limits are monitored. |
| No Data Destruction | Memory limits do not destroy data. |
| Bounded Result Sets | Queries return bounded result sets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Memory limits are documented | In the blueprint. |
| Memory limits are monitored | Alerts when approaching limits. |
| Memory limits do not destroy data | Data preservation is the cardinal rule. |
| Queries return bounded result sets | Pagination controls memory usage. |
| No memory limit rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Memory limits do not affect save snapshots. |
| Replay Compatibility | Memory limits are deterministic. |
| Migration Compatibility | Memory limits are never weakened. |
| Synchronization Compatibility | Memory limits are server-authoritative. |
| Event Bus Compatibility | Memory limits do not affect event ordering. |

---

### 10.16 Performance Targets

#### Purpose

The performance targets section defines the performance targets for world data
operations.

#### Scope

The performance targets apply to all 16 world tables and all world queries.

#### Boundaries

Performance targets are documented. Performance targets are measured. Performance
targets are deterministic. No performance target weakens a guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Performance targets are documented. |
| Measured | Performance targets are measured. |
| Deterministic | Performance targets are deterministic. |
| No Guarantee Weakening | No performance target weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Performance targets are documented | In the blueprint. |
| Performance targets are measured | Evidence-based. |
| Performance targets are deterministic | No non-determinism. |
| No performance target weakens a guarantee | All 10 guarantees preserved. |
| Data integrity wins over performance | If a target compromises integrity, integrity wins. |
| No performance target rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Performance targets do not affect save snapshots. |
| Replay Compatibility | Performance targets are deterministic. |
| Migration Compatibility | Performance targets are never weakened. |
| Synchronization Compatibility | Performance targets are server-authoritative. |
| Event Bus Compatibility | Performance targets do not affect event ordering. |

---

## 11. Testing Architecture

### Overview

This chapter defines the testing architecture for the World Layer. It defines the
testing philosophy, principles, environment, stages, unit testing, integration
testing, regression testing, migration testing, synchronization testing, replay
testing, backup testing, recovery testing, validation testing, stress testing,
performance testing, compatibility testing, deterministic testing, security
testing, and reporting strategy.

This chapter has 19 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and acceptance criteria.

---

### 11.1 Testing Philosophy

#### Purpose

The testing philosophy defines the permanent principles that govern the World
Layer's testing architecture.

#### Scope

The testing philosophy applies to all 16 world tables and all world operations.

#### Boundaries

Testing is deterministic. Testing is reproducible. Testing does not destroy data.
Testing is documented. The World Layer does not define the testing framework — it
uses the Testing Architecture.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Testing is deterministic. |
| Reproducible | Testing is reproducible. |
| No Data Destruction | Testing does not destroy data. |
| Documented | Testing is documented. |
| No Framework Definition | The World Layer does not define the testing framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing is deterministic | Same input, same result. |
| Testing is reproducible | Can be re-run with same results. |
| Testing does not destroy data | Data preservation is the cardinal rule. |
| Testing is documented | In the blueprint. |
| The World Layer uses the Testing Architecture | It does not define it. |
| No testing philosophy rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All tests are deterministic | No non-determinism. |
| All tests are reproducible | Can be re-run with same results. |
| No test destroys data | Data preservation. |
| All tests are documented | In the blueprint. |

---

### 11.2 Testing Principles

#### Purpose

The testing principles define the permanent rules that govern all testing
decisions in the World Layer.

#### Scope

The testing principles apply to all 16 world tables and all world operations.

#### Boundaries

Every world table is tested. Every migration is tested. Every RLS policy is
tested. No test is skipped. No test is weakened.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Every Table Tested | Every world table is tested. |
| Every Migration Tested | Every migration is tested. |
| Every RLS Policy Tested | Every RLS policy is tested. |
| No Skipped Tests | No test is skipped. |
| No Weakened Tests | No test is weakened. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world table is tested | No exceptions. |
| Every migration is tested | Against all dependent layers. |
| Every RLS policy is tested | Four per table. |
| No test is skipped | No exceptions. |
| No test is weakened | No exceptions. |
| No testing principle is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 world tables have tests | No exceptions. |
| All migrations have tests | No exceptions. |
| All RLS policies have tests | Four per table. |
| No test is skipped or weakened | No exceptions. |

---

### 11.3 Testing Environment

#### Purpose

The testing environment section defines the environment in which world tests run.

#### Scope

The testing environment applies to all world tests.

#### Boundaries

The testing environment is isolated from production. The testing environment is
deterministic. The testing environment is reproducible. No test affects production
data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Isolated | The testing environment is isolated from production. |
| Deterministic | The testing environment is deterministic. |
| Reproducible | The testing environment is reproducible. |
| No Production Impact | No test affects production data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The testing environment is isolated from production | No exceptions. |
| The testing environment is deterministic | No non-determinism. |
| The testing environment is reproducible | Can be re-run with same results. |
| No test affects production data | No exceptions. |
| No testing environment rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| The testing environment is isolated | No production access. |
| The testing environment is deterministic | Same input, same result. |
| The testing environment is reproducible | Can be re-run. |
| No test affects production data | No exceptions. |

---

### 11.4 Testing Stages

#### Purpose

The testing stages section defines the stages of testing for the World Layer.

#### Scope

The testing stages apply to all world tests.

#### Boundaries

Testing stages are: unit, integration, regression, migration, synchronization,
replay, backup, recovery, validation, stress, performance, compatibility,
deterministic, and security. Each stage has acceptance criteria. No stage is
skipped.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Defined Stages | Testing stages are defined. |
| No Skipped Stages | No stage is skipped. |
| Acceptance Criteria | Each stage has acceptance criteria. |
| Sequential | Stages run in defined order. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing stages are defined | Unit, integration, regression, etc. |
| No stage is skipped | No exceptions. |
| Each stage has acceptance criteria | No exceptions. |
| Stages run in defined order | No exceptions. |
| No testing stage rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All testing stages are defined | No missing stages. |
| All stages have acceptance criteria | No exceptions. |
| No stage is skipped | No exceptions. |
| Stages run in defined order | No exceptions. |

---

### 11.5 Unit Testing

#### Purpose

The unit testing section defines how individual world tables are tested in
isolation.

#### Scope

The unit testing applies to all 16 world tables.

#### Boundaries

Unit tests test individual tables in isolation. Unit tests are deterministic and
reproducible. No unit test destroys data. Unit tests cover constraints, RLS
policies, and column validation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Isolated | Unit tests test individual tables. |
| Deterministic | Unit tests are deterministic. |
| Reproducible | Unit tests are reproducible. |
| No Data Destruction | Unit tests do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world table has unit tests | No exceptions. |
| Unit tests cover constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Unit tests cover RLS policies | Four per table. |
| Unit tests cover column validation | No invalid values. |
| No unit testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 world tables have unit tests | No exceptions. |
| All constraints are tested | NOT NULL, UNIQUE, CHECK, FK. |
| All RLS policies are tested | Four per table. |
| All column validations are tested | No invalid values. |
| All unit tests are deterministic and reproducible | No exceptions. |

---

### 11.6 Integration Testing

#### Purpose

The integration testing section defines how world tables are tested together and
with dependent layers.

#### Scope

The integration testing applies to all 16 world tables and their relationships
with the Foundation Layer.

#### Boundaries

Integration tests test relationships between tables. Integration tests test
cross-layer dependencies. Integration tests are deterministic and reproducible.
No integration test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Relationship-Tested | Integration tests test relationships. |
| Cross-Layer-Tested | Integration tests test cross-layer dependencies. |
| Deterministic | Integration tests are deterministic. |
| Reproducible | Integration tests are reproducible. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All relationships are tested | Foreign keys, cascade rules. |
| All cross-layer dependencies are tested | Foundation Layer. |
| Integration tests are deterministic | No non-determinism. |
| Integration tests are reproducible | Can be re-run. |
| No integration testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All foreign keys are tested | Referential integrity. |
| All cascade rules are tested | Per Chapter 7 §7.19. |
| All Foundation Layer dependencies are tested | user_id references. |
| All integration tests are deterministic and reproducible | No exceptions. |

---

### 11.7 Regression Testing

#### Purpose

The regression testing section defines how world tests prevent regressions.

#### Scope

The regression testing applies to all 16 world tables and all world migrations.

#### Boundaries

Regression tests run after every migration. Regression tests are deterministic
and reproducible. No regression test destroys data. No migration is merged with
failing regression tests.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Post-Migration | Regression tests run after every migration. |
| Deterministic | Regression tests are deterministic. |
| Reproducible | Regression tests are reproducible. |
| No Merging with Failures | No migration is merged with failing tests. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Regression tests run after every migration | No exceptions. |
| Regression tests are deterministic | No non-determinism. |
| Regression tests are reproducible | Can be re-run. |
| No migration is merged with failing regression tests | No exceptions. |
| No regression testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| Regression tests run after every migration | No exceptions. |
| All regression tests pass before merge | No exceptions. |
| All regression tests are deterministic and reproducible | No exceptions. |

---

### 11.8 Migration Testing

#### Purpose

The migration testing section defines how world migrations are tested.

#### Scope

The migration testing applies to all world migrations — any additive change to the
world schema.

#### Boundaries

Migration tests verify migrations are additive, forward-only, and backward
compatible. Migration tests are deterministic and reproducible. No migration test
destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive-Tested | Migration tests verify additivity. |
| Forward-Only-Tested | Migration tests verify forward-only. |
| Backward-Compatible-Tested | Migration tests verify backward compatibility. |
| No Data Destruction | Migration tests do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Migration tests verify migrations are additive | No destructive operations. |
| Migration tests verify migrations are forward-only | No backward migration. |
| Migration tests verify migrations are backward compatible | No breaking existing data. |
| Migration tests are deterministic and reproducible | No exceptions. |
| No migration testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All migrations are tested for additivity | No destructive operations. |
| All migrations are tested for forward-only | No backward migration. |
| All migrations are tested for backward compatibility | No breaking existing data. |
| No migration is merged with failing tests | No exceptions. |

---

### 11.9 Synchronization Testing

#### Purpose

The synchronization testing section defines how world data sync is tested.

#### Scope

The synchronization testing applies to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync tests verify sync is server-authoritative and non-blocking. Sync tests verify
no data corruption. Sync tests are deterministic and reproducible.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative-Tested | Sync tests verify server-authoritative. |
| Non-Blocking-Tested | Sync tests verify non-blocking. |
| No Corruption-Tested | Sync tests verify no data corruption. |
| Deterministic | Sync tests are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync tests verify server-authoritative | No client-side authority. |
| Sync tests verify non-blocking | No blocking gameplay. |
| Sync tests verify no data corruption | Atomic operations. |
| Sync tests are deterministic and reproducible | No exceptions. |
| No synchronization testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All sync tests verify server-authoritative | No exceptions. |
| All sync tests verify non-blocking | No exceptions. |
| All sync tests verify no data corruption | No exceptions. |
| All sync tests are deterministic and reproducible | No exceptions. |

---

### 11.10 Replay Testing

#### Purpose

The replay testing section defines how world data is tested for replay
compatibility.

#### Scope

The replay testing applies to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

Replay tests verify no non-determinism from world data. Replay tests verify world
identifiers are deterministic. Replay tests verify replays do not query world
tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Non-Determinism-Tested | Replay tests verify no non-determinism. |
| Deterministic Identifiers-Tested | Replay tests verify deterministic identifiers. |
| No Replay Queries-Tested | Replay tests verify no replay queries. |
| Cross-Platform-Tested | Replay tests verify cross-platform identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Replay tests verify no non-determinism | Same state, same result. |
| Replay tests verify deterministic identifiers | Never change after creation. |
| Replay tests verify no replay queries | Zero overhead. |
| Replay tests verify cross-platform identifiers | Cross-platform replay works. |
| No replay testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All replay tests verify no non-determinism | No exceptions. |
| All replay tests verify deterministic identifiers | No exceptions. |
| All replay tests verify no replay queries | No exceptions. |
| All replay tests verify cross-platform identifiers | No exceptions. |

---

### 11.11 Backup Testing

#### Purpose

The backup testing section defines how world data backups are tested.

#### Scope

The backup testing applies to all world data that is backed up.

#### Boundaries

Backup tests verify backups are atomic. Backup tests verify no data destruction.
Backup tests verify the previous valid state is retained. Backup tests are
deterministic and reproducible.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Atomic-Tested | Backup tests verify atomicity. |
| No Data Destruction-Tested | Backup tests verify no data destruction. |
| Previous State-Tested | Backup tests verify previous state retention. |
| Deterministic | Backup tests are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Backup tests verify atomicity | Complete before overwrite. |
| Backup tests verify no data destruction | No data loss. |
| Backup tests verify previous state retention | No exceptions. |
| Backup tests are deterministic and reproducible | No exceptions. |
| No backup testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All backup tests verify atomicity | No exceptions. |
| All backup tests verify no data destruction | No exceptions. |
| All backup tests verify previous state retention | No exceptions. |
| All backup tests are deterministic and reproducible | No exceptions. |

---

### 11.12 Recovery Testing

#### Purpose

The recovery testing section defines how world data recovery is tested.

#### Scope

The recovery testing applies to all world data recovery procedures.

#### Boundaries

Recovery tests verify recovery restores the previous valid state. Recovery tests
verify no data destruction. Recovery tests are deterministic and reproducible.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Previous State Restored-Tested | Recovery tests verify previous state restoration. |
| No Data Destruction-Tested | Recovery tests verify no data destruction. |
| Deterministic | Recovery tests are deterministic. |
| Reproducible | Recovery tests are reproducible. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Recovery tests verify previous state restoration | No data loss. |
| Recovery tests verify no data destruction | Data preservation is the cardinal rule. |
| Recovery tests are deterministic and reproducible | No exceptions. |
| Recovery tests are documented | In the blueprint. |
| No recovery testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All recovery tests verify previous state restoration | No exceptions. |
| All recovery tests verify no data destruction | No exceptions. |
| All recovery tests are deterministic and reproducible | No exceptions. |
| All recovery tests are documented | No exceptions. |

---

### 11.13 Validation Testing

#### Purpose

The validation testing section defines how world data validation is tested.

#### Scope

The validation testing applies to all constraints, RLS policies, and validation
checks in the world layer.

#### Boundaries

Validation tests verify constraints are enforced. Validation tests verify RLS is
enforced. Validation tests verify referential integrity. Validation tests are
deterministic and reproducible.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Constraints-Tested | Validation tests verify constraints. |
| RLS-Tested | Validation tests verify RLS. |
| Referential Integrity-Tested | Validation tests verify referential integrity. |
| Deterministic | Validation tests are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation tests verify constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Validation tests verify RLS | Four policies per table. |
| Validation tests verify referential integrity | No orphan rows. |
| Validation tests are deterministic and reproducible | No exceptions. |
| No validation testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All constraints are tested | NOT NULL, UNIQUE, CHECK, FK. |
| All RLS policies are tested | Four per table. |
| All foreign keys are tested | No orphan rows. |
| All validation tests are deterministic and reproducible | No exceptions. |

---

### 11.14 Stress Testing

#### Purpose

The stress testing section defines how world data is tested under high load.

#### Scope

The stress testing applies to all 16 world tables and all world queries.

#### Boundaries

Stress tests verify the World Layer handles high load. Stress tests verify queries
return bounded result sets under load. Stress tests are deterministic and
reproducible. No stress test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| High Load-Tested | Stress tests verify high load handling. |
| Bounded-Tested | Stress tests verify bounded result sets under load. |
| Deterministic | Stress tests are deterministic. |
| No Data Destruction | Stress tests do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Stress tests verify high load handling | No crash under load. |
| Stress tests verify bounded result sets under load | Pagination works under load. |
| Stress tests are deterministic and reproducible | No exceptions. |
| Stress tests do not destroy data | Data preservation is the cardinal rule. |
| No stress testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All stress tests verify high load handling | No crash. |
| All stress tests verify bounded result sets | No unbounded queries. |
| All stress tests are deterministic and reproducible | No exceptions. |
| No stress test destroys data | No exceptions. |

---

### 11.15 Performance Testing

#### Purpose

The performance testing section defines how world data performance is tested.

#### Scope

The performance testing applies to all 16 world tables and all world queries.

#### Boundaries

Performance tests verify queries meet performance targets. Performance tests verify
indexes are used. Performance tests are deterministic and reproducible. No
performance test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Targets-Tested | Performance tests verify targets are met. |
| Index-Tested | Performance tests verify indexes are used. |
| Deterministic | Performance tests are deterministic. |
| No Data Destruction | Performance tests do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Performance tests verify targets are met | Per Chapter 10 §10.16. |
| Performance tests verify indexes are used | No full-table scans. |
| Performance tests are deterministic and reproducible | No exceptions. |
| Performance tests do not destroy data | Data preservation is the cardinal rule. |
| No performance testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All performance tests verify targets are met | No exceptions. |
| All performance tests verify indexes are used | No exceptions. |
| All performance tests are deterministic and reproducible | No exceptions. |
| No performance test destroys data | No exceptions. |

---

### 11.16 Compatibility Testing

#### Purpose

The compatibility testing section defines how world data is tested for
compatibility with all dependent systems.

#### Scope

The compatibility testing applies to all 16 world tables and all dependent
systems: Save Engine, Replay System, Synchronization Architecture, Event Bus,
Migration System.

#### Boundaries

Compatibility tests verify all 10 compatibility guarantees. Compatibility tests
are deterministic and reproducible. No compatibility test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| All Guarantees-Tested | Compatibility tests verify all 10 guarantees. |
| Deterministic | Compatibility tests are deterministic. |
| Reproducible | Compatibility tests are reproducible. |
| No Data Destruction | Compatibility tests do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Compatibility tests verify all 10 guarantees | No exceptions. |
| Compatibility tests are deterministic and reproducible | No exceptions. |
| Compatibility tests do not destroy data | Data preservation is the cardinal rule. |
| No compatibility testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 10 compatibility guarantees are tested | No exceptions. |
| Save Engine compatibility is tested | No exceptions. |
| Replay compatibility is tested | No exceptions. |
| Synchronization compatibility is tested | No exceptions. |
| Migration compatibility is tested | No exceptions. |
| Event Bus compatibility is tested | No exceptions. |
| All compatibility tests are deterministic and reproducible | No exceptions. |

---

### 11.17 Deterministic Testing

#### Purpose

The deterministic testing section defines how world data is tested for
determinism.

#### Scope

The deterministic testing applies to all 16 world tables and all world operations.

#### Boundaries

Deterministic tests verify no non-determinism. Deterministic tests verify
identifiers are deterministic. Deterministic tests are reproducible. No
deterministic test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Non-Determinism-Tested | Deterministic tests verify no non-determinism. |
| Deterministic Identifiers-Tested | Deterministic tests verify deterministic identifiers. |
| Reproducible | Deterministic tests are reproducible. |
| No Data Destruction | Deterministic tests do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Deterministic tests verify no non-determinism | Same input, same result. |
| Deterministic tests verify deterministic identifiers | Never change after creation. |
| Deterministic tests are reproducible | Can be re-run with same results. |
| Deterministic tests do not destroy data | Data preservation is the cardinal rule. |
| No deterministic testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All deterministic tests verify no non-determinism | No exceptions. |
| All deterministic tests verify deterministic identifiers | No exceptions. |
| All deterministic tests are reproducible | No exceptions. |
| No deterministic test destroys data | No exceptions. |

---

### 11.18 Security Testing

#### Purpose

The security testing section defines how world data security is tested.

#### Scope

The security testing applies to all 16 world tables, all RLS policies, and all
trust boundaries.

#### Boundaries

Security tests verify RLS is enforced. Security tests verify no cross-user access.
Security tests verify the service role key is server-side only. Security tests are
deterministic and reproducible.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS-Tested | Security tests verify RLS. |
| No Cross-User Access-Tested | Security tests verify no cross-user access. |
| Service Role Key-Tested | Security tests verify server-side only. |
| Deterministic | Security tests are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Security tests verify RLS is enforced | Four policies per table. |
| Security tests verify no cross-user access | No exceptions. |
| Security tests verify the service role key is server-side only | Never in client code. |
| Security tests are deterministic and reproducible | No exceptions. |
| No security testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All RLS policies are tested | Four per table. |
| All cross-user access is tested and prevented | No exceptions. |
| All service role key usage is tested | Server-side only. |
| All security tests are deterministic and reproducible | No exceptions. |

---

### 11.19 Reporting Strategy

#### Purpose

The reporting strategy section defines how world test results are reported.

#### Scope

The reporting strategy applies to all world tests.

#### Boundaries

Test results are reported. No test result is silent. Test results are categorized
by stage. Test results are documented. No reporting destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Reported | All test results are reported. |
| No Silent Results | No test result is silent. |
| Categorized | Test results are categorized by stage. |
| Documented | Test results are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All test results are reported | No silent results. |
| Test results are categorized by stage | Unit, integration, regression, etc. |
| Test results are documented | In the blueprint and test reports. |
| No reporting destroys data | Data preservation is the cardinal rule. |
| No reporting strategy rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All test results are reported | No silent results. |
| All test results are categorized | By stage. |
| All test results are documented | In the blueprint and test reports. |
| No reporting destroys data | No exceptions. |

---

## Sprint 1.2.2.4 Review

### Sprint Summary

**Sprint:** 1.2.2.4 — World Blueprint v1.0 (Chapters 10–11)
**Status:** COMPLETE
**Date:** 2026-08-03

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 10 | Performance Architecture | 16 sections: performance philosophy, performance principles, storage optimization, index optimization, partition optimization, query optimization, synchronization optimization, replay optimization, snapshot optimization, backup optimization, monitoring strategy, profiling strategy, benchmark strategy, storage limits, memory limits, performance targets. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 11 | Testing Architecture | 19 sections: testing philosophy, testing principles, testing environment, testing stages, unit testing, integration testing, regression testing, migration testing, synchronization testing, replay testing, backup testing, recovery testing, validation testing, stress testing, performance testing, compatibility testing, deterministic testing, security testing, reporting strategy. Each with purpose, scope, boundaries, guarantees, permanent rules, acceptance criteria. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–11) | PASS |
| No gaps in chapter numbering | PASS |
| Deterministic execution preserved | PASS |
| Replay compatibility preserved | PASS |
| Migration compatibility preserved | PASS |
| Synchronization compatibility preserved | PASS |
| Ownership consistency preserved | PASS |
| Dependency consistency preserved | PASS |
| Naming consistency preserved | PASS |
| Lock policy compliance preserved | PASS |
| Event ordering consistency preserved | PASS |
| Snapshot compatibility preserved | PASS |
| Save compatibility preserved | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Blueprint documentation only | PASS |

### Notes

- The World Blueprint is IN PROGRESS. Chapters 12–16 are pending.
- Next sprint: 1.2.2.5 — Chapter 12 (Future Expansion), Chapter 13 (Dependencies), Chapter 14 (Completion Checklist).

---

## 12. Future Expansion

### Overview

This chapter defines the future expansion architecture for the World Layer. It
defines the expansion philosophy, horizontal expansion, vertical expansion,
repository expansion, migration expansion, replay expansion, synchronization
expansion, security expansion, validation expansion, monitoring expansion,
backup expansion, compatibility guarantees, future engine integration, and
long-term vision.

This chapter has 14 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 12.1 Expansion Philosophy

#### Purpose

The expansion philosophy defines the permanent principles that govern all future
expansion of the World Layer.

#### Scope

The expansion philosophy applies to all 16 world tables and all future changes to
the World Layer.

#### Boundaries

All expansion is additive. No expansion removes an existing relationship, column,
table, or guarantee. No expansion creates a circular dependency. No expansion
weakens a guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | All expansion is additive. |
| No Removal | No expansion removes existing structure. |
| No Circular Dependencies | No expansion creates a circular dependency. |
| No Guarantee Weakening | No expansion weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All expansion is additive | No destructive expansion. |
| No expansion removes an existing relationship | Forward-only. |
| No expansion removes an existing column | Forward-only. |
| No expansion removes an existing table | Forward-only. |
| No expansion weakens a guarantee | All 10 guarantees preserved. |
| No expansion creates a circular dependency | The World Layer remains a DAG. |
| No expansion philosophy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Expansion does not affect save snapshots. |
| Replay Compatibility | Expansion is deterministic. |
| Migration Compatibility | Expansion is additive and forward-only. |
| Synchronization Compatibility | Expansion is server-authoritative. |
| Event Bus Compatibility | Expansion does not affect event ordering. |

---

### 12.2 Horizontal Expansion

#### Purpose

The horizontal expansion section defines how new tables are added to the World
Layer at the same hierarchy level as existing tables.

#### Scope

The horizontal expansion applies to all future tables added to the World Layer.

#### Boundaries

New tables are additive. New tables follow the Naming Rules v1.0. New tables have
RLS enabled with four policies. New tables have `user_id` and `world_id`. No new
table creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | New tables are additive. |
| Naming Compliance | New tables follow the Naming Rules v1.0. |
| RLS Enabled | New tables have RLS with four policies. |
| Ownership | New tables have `user_id` and `world_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| New tables are additive | No removal of existing tables. |
| New tables follow the Naming Rules v1.0 | `snake_case` table names. |
| New tables have RLS enabled | Four policies per table. |
| New tables have `user_id` and `world_id` | Ownership references. |
| No new table creates a circular dependency | The World Layer remains a DAG. |
| No horizontal expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | New tables do not affect save snapshots. |
| Replay Compatibility | New tables are deterministic. |
| Migration Compatibility | New tables are additive. |
| Synchronization Compatibility | New tables are server-authoritative. |
| Event Bus Compatibility | New tables do not affect event ordering. |

---

### 12.3 Vertical Expansion

#### Purpose

The vertical expansion section defines how new columns are added to existing world
tables.

#### Scope

The vertical expansion applies to all future columns added to existing world
tables.

#### Boundaries

New columns are additive. New columns are nullable or have defaults. No new column
is NOT NULL without a default. No new column removes an existing column. No new
column weakens a guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | New columns are additive. |
| Nullable or Defaulted | New columns are nullable or have defaults. |
| No Removal | No new column removes an existing column. |
| No Guarantee Weakening | No new column weakens a guarantee. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| New columns are additive | No destructive column changes. |
| New columns are nullable or have defaults | No NOT NULL without default. |
| No new column removes an existing column | Forward-only. |
| No new column changes an existing column type | Forward-only. |
| No new column weakens a guarantee | All 10 guarantees preserved. |
| No vertical expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | New columns do not affect save snapshots. |
| Replay Compatibility | New columns are deterministic. |
| Migration Compatibility | New columns are additive and backward compatible. |
| Synchronization Compatibility | New columns are server-authoritative. |
| Event Bus Compatibility | New columns do not affect event ordering. |

---

### 12.4 Repository Expansion

#### Purpose

The repository expansion section defines how new world data repositories are added
to the World Layer.

#### Scope

The repository expansion applies to all future data repositories added to the World
Layer.

#### Boundaries

New repositories are additive. New repositories follow the Naming Rules v1.0. New
repositories have RLS enabled. No new repository creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | New repositories are additive. |
| Naming Compliance | New repositories follow the Naming Rules v1.0. |
| RLS Enabled | New repositories have RLS. |
| No Circular Dependencies | No new repository creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| New repositories are additive | No removal of existing repositories. |
| New repositories follow the Naming Rules v1.0 | `snake_case` names. |
| New repositories have RLS enabled | Four policies per table. |
| No new repository creates a circular dependency | The World Layer remains a DAG. |
| No repository expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | New repositories do not affect save snapshots. |
| Replay Compatibility | New repositories are deterministic. |
| Migration Compatibility | New repositories are additive. |
| Synchronization Compatibility | New repositories are server-authoritative. |
| Event Bus Compatibility | New repositories do not affect event ordering. |

---

### 12.5 Migration Expansion

#### Purpose

The migration expansion section defines how new migrations extend the World Layer.

#### Scope

The migration expansion applies to all future migrations to the World Layer.

#### Boundaries

Migrations are additive, forward-only, and backward compatible. No migration drops
a table, drops a column, renames a column, or changes a column type. No migration
weakens RLS.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Migration expansion is additive. |
| Forward-Only | Migration expansion is forward-only. |
| Backward Compatible | Migration expansion does not break existing data. |
| No RLS Weakening | No migration weakens RLS. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Migrations are additive | No destructive operations. |
| Migrations are forward-only | No backward migration. |
| No migration drops a table or column | No exceptions. |
| No migration renames a column | No exceptions. |
| No migration changes a column type | No exceptions. |
| No migration weakens RLS | No exceptions. |
| No migration expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Migration expansion does not affect save snapshots. |
| Replay Compatibility | Migration expansion is deterministic. |
| Migration Compatibility | Migrations are additive and forward-only. |
| Synchronization Compatibility | Migration expansion is server-authoritative. |
| Event Bus Compatibility | Migration expansion does not affect event ordering. |

---

### 12.6 Replay Expansion

#### Purpose

The replay expansion section defines how the World Layer expands while preserving
replay compatibility.

#### Scope

The replay expansion applies to all future expansion that could affect replays:
world identifiers, faction identifiers, religion identifiers.

#### Boundaries

World identifiers are deterministic and never change after creation. No expansion
introduces non-determinism. No expansion affects existing snapshot format. Replays
do not query world tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Identifiers | World identifiers are deterministic. |
| No Non-Determinism | No expansion introduces non-determinism. |
| No Format Change | No expansion affects existing snapshot format. |
| Zero Replay Overhead | Replays do not query world tables. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World identifiers are deterministic | Never change after creation. |
| No expansion introduces non-determinism | Same state, same result. |
| No expansion affects existing snapshot format | Backward compatible. |
| Replays do not query world tables | Zero overhead. |
| No replay expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay expansion does not affect save snapshots. |
| Replay Compatibility | World data does not introduce non-determinism. |
| Migration Compatibility | Replay expansion is additive. |
| Synchronization Compatibility | Replay expansion is server-authoritative. |
| Event Bus Compatibility | Replay expansion does not affect event ordering. |

---

### 12.7 Synchronization Expansion

#### Purpose

The synchronization expansion section defines how the World Layer expands while
preserving synchronization compatibility.

#### Scope

The synchronization expansion applies to all future expansion that could affect
sync: world metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. No expansion introduces client-side
authority. No expansion corrupts data. Sync is batched where possible.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync expansion is server-authoritative. |
| Non-Blocking | Sync expansion does not block gameplay. |
| No Corruption | Sync expansion does not corrupt data. |
| Batched | Sync expansion is batched where possible. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| Sync expansion does not corrupt data | Atomic operations. |
| Sync is batched where possible | Reduce round trips. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| No synchronization expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Sync expansion does not affect save snapshots. |
| Replay Compatibility | Sync expansion is deterministic. |
| Migration Compatibility | Sync expansion is additive. |
| Synchronization Compatibility | Sync is server-authoritative and non-blocking. |
| Event Bus Compatibility | Sync expansion does not affect event ordering. |

---

### 12.8 Security Expansion

#### Purpose

The security expansion section defines how the World Layer expands while preserving
security.

#### Scope

The security expansion applies to all future expansion that could affect security:
new tables, new columns, new RLS policies.

#### Boundaries

RLS is the primary security boundary. No expansion weakens RLS. No expansion
introduces client-side authority. The service role key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Primary | RLS remains the primary security boundary. |
| No RLS Weakening | No expansion weakens RLS. |
| No Client-Side Authority | No expansion introduces client-side authority. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is the primary security boundary | No exceptions. |
| No expansion weakens RLS | No exceptions. |
| No expansion introduces client-side authority | Server-authoritative. |
| The service role key is server-side only | Never in client code. |
| New tables have RLS with four policies | No exceptions. |
| No security expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Security expansion does not affect save snapshots. |
| Replay Compatibility | Security expansion is deterministic. |
| Migration Compatibility | Security expansion is never weakened. |
| Synchronization Compatibility | Security expansion is server-authoritative. |
| Event Bus Compatibility | Security expansion does not affect event ordering. |

---

### 12.9 Validation Expansion

#### Purpose

The validation expansion section defines how the World Layer expands while
preserving validation.

#### Scope

The validation expansion applies to all future expansion that could affect
validation: new constraints, new RLS policies, new validation checks.

#### Boundaries

Validation is database-enforced and deterministic. No expansion weakens validation.
No expansion introduces non-determinism. No expansion destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation remains database-enforced. |
| Deterministic | Validation remains deterministic. |
| No Weakening | No expansion weakens validation. |
| No Data Destruction | No expansion destroys data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| No expansion weakens validation | All checks preserved. |
| No expansion destroys data | Data preservation is the cardinal rule. |
| No validation expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Validation expansion does not affect save snapshots. |
| Replay Compatibility | Validation expansion is deterministic. |
| Migration Compatibility | Validation expansion is never weakened. |
| Synchronization Compatibility | Validation expansion is server-authoritative. |
| Event Bus Compatibility | Validation expansion does not affect event ordering. |

---

### 12.10 Monitoring Expansion

#### Purpose

The monitoring expansion section defines how the World Layer expands while
preserving monitoring compatibility.

#### Scope

The monitoring expansion applies to all future expansion that could affect
monitoring: new tables, new metrics, new alerts.

#### Boundaries

Monitoring is non-blocking. No expansion affects gameplay. The World Layer does
not define the monitoring framework. Monitoring metrics are documented.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring remains non-blocking. |
| No Gameplay Impact | No expansion affects gameplay. |
| No Framework Definition | The World Layer does not define the monitoring framework. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| No expansion affects gameplay | No exceptions. |
| The World Layer does not define the monitoring framework | It uses the project's standards. |
| Monitoring metrics are documented | In the blueprint. |
| No monitoring expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Monitoring expansion does not affect save snapshots. |
| Replay Compatibility | Monitoring expansion is deterministic. |
| Migration Compatibility | Monitoring expansion is never weakened. |
| Synchronization Compatibility | Monitoring expansion is server-authoritative. |
| Event Bus Compatibility | Monitoring expansion does not affect event ordering. |

---

### 12.11 Backup Expansion

#### Purpose

The backup expansion section defines how the World Layer expands while preserving
backup compatibility.

#### Scope

The backup expansion applies to all future expansion that could affect backups:
new tables, new data, new backup procedures.

#### Boundaries

Backups are atomic. No expansion destroys data. The previous valid state is
always retained. Backups are documented.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Atomic | Backups remain atomic. |
| No Data Destruction | No expansion destroys data. |
| Previous State Retained | The previous valid state is always retained. |
| Documented | Backups are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Backups are atomic | Complete before overwrite. |
| No expansion destroys data | Data preservation is the cardinal rule. |
| The previous valid state is always retained | No exceptions. |
| Backups are documented | In the Migration Log. |
| No backup expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Backup expansion does not affect save snapshots. |
| Replay Compatibility | Backup expansion is deterministic. |
| Migration Compatibility | Backup expansion is never weakened. |
| Synchronization Compatibility | Backup expansion is server-authoritative. |
| Event Bus Compatibility | Backup expansion does not affect event ordering. |

---

### 12.12 Compatibility Guarantees

#### Purpose

The compatibility guarantees section defines the permanent compatibility
guarantees that all future expansion must preserve.

#### Scope

The compatibility guarantees apply to all future expansion of the World Layer.

#### Boundaries

All 10 compatibility guarantees are preserved by all future expansion. No
expansion weakens any guarantee. No expansion breaks any dependent system.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | Expansion does not affect save snapshots. |
| Replay Compatibility | Expansion is deterministic. |
| Migration Compatibility | Expansion is additive and forward-only. |
| Synchronization Compatibility | Expansion is server-authoritative. |
| Event Bus Compatibility | Expansion does not affect event ordering. |
| Snapshot Compatibility | Expansion does not affect snapshot format. |
| Ownership Compatibility | Expansion preserves ownership. |
| Dependency Compatibility | Expansion preserves dependencies. |
| Naming Compatibility | Expansion follows the Naming Rules v1.0. |
| Lock Policy Compatibility | Expansion follows the Lock Policy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are preserved | No exceptions. |
| No expansion weakens any guarantee | No exceptions. |
| No expansion breaks any dependent system | No exceptions. |
| Compatibility guarantees are tested | Against all dependent layers. |
| No compatibility guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Expansion does not affect save snapshots. |
| Replay Compatibility | Expansion is deterministic. |
| Migration Compatibility | Expansion is additive and forward-only. |
| Synchronization Compatibility | Expansion is server-authoritative. |
| Event Bus Compatibility | Expansion does not affect event ordering. |

---

### 12.13 Future Engine Integration

#### Purpose

The future engine integration section defines how the World Layer integrates with
future engines.

#### Scope

The future engine integration applies to all future engines that reference world
data: Quest Engine, NPC AI Engine, Dialogue Engine, Inventory Engine, Activity
Engine, Energy Engine, Life Engine, Time Engine.

#### Boundaries

Future engines reference world identifiers only. Future engines do not serialize
world data into snapshots. Future engines do not query world tables during replays.
No future engine creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | Future engines reference world identifiers. |
| No World Serialization | Future engines do not serialize world data. |
| No Replay Queries | Future engines do not query world tables during replays. |
| No Circular Dependencies | No future engine creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Future engines reference world identifiers only | No world data in snapshots. |
| Future engines do not serialize world data | Zero snapshot overhead. |
| Future engines do not query world tables during replays | Zero replay overhead. |
| No future engine creates a circular dependency | The World Layer remains a DAG. |
| Future engine integration is documented | In the Engine Dependency Graph. |
| No future engine integration rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Future engines do not affect save snapshots. |
| Replay Compatibility | Future engines are deterministic. |
| Migration Compatibility | Future engine integration is additive. |
| Synchronization Compatibility | Future engines are server-authoritative. |
| Event Bus Compatibility | Future engines do not affect event ordering. |

---

### 12.14 Long-Term Vision

#### Purpose

The long-term vision section defines the long-term expansion vision for the World
Layer.

#### Scope

The long-term vision applies to the World Layer over the lifetime of the project.

#### Boundaries

The World Layer remains the single source of truth for world data. The World Layer
remains a DAG. The World Layer preserves all 10 compatibility guarantees. The World
Layer is never bypassed by engines or systems.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Source of Truth | The World Layer remains the single source of truth. |
| DAG Preserved | The World Layer remains a DAG. |
| All Guarantees Preserved | All 10 compatibility guarantees are preserved. |
| Never Bypassed | The World Layer is never bypassed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer remains the single source of truth for world data | No exceptions. |
| The World Layer remains a DAG | No circular dependencies. |
| The World Layer preserves all 10 compatibility guarantees | No exceptions. |
| The World Layer is never bypassed by engines or systems | No exceptions. |
| All expansion is additive | No destructive expansion. |
| No long-term vision rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | The long-term vision preserves save snapshots. |
| Replay Compatibility | The long-term vision is deterministic. |
| Migration Compatibility | The long-term vision is additive. |
| Synchronization Compatibility | The long-term vision is server-authoritative. |
| Event Bus Compatibility | The long-term vision does not affect event ordering. |

---

## 13. Dependencies

### Overview

This chapter defines the dependency architecture for the World Layer. It defines
the dependency philosophy, dependency hierarchy, Foundation dependencies, Save
Engine dependencies, Synchronization dependencies, Validation dependencies,
Replay dependencies, Migration dependencies, Security dependencies, Monitoring
dependencies, Testing dependencies, and Future dependencies.

This chapter has 12 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 13.1 Dependency Philosophy

#### Purpose

The dependency philosophy defines the permanent principles that govern all
dependencies of the World Layer.

#### Scope

The dependency philosophy applies to all 16 world tables and all dependencies
between the World Layer and other layers.

#### Boundaries

The World Layer depends on the Foundation Layer. No world table depends on a layer
above the World Layer. No circular dependencies. The dependency graph is a DAG. The
World Layer follows the Engine Dependency Graph.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Foundation Dependency | The World Layer depends on the Foundation Layer. |
| No Upward Dependencies | No world table depends on a layer above the World Layer. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Engine Dependency Graph | The World Layer follows the Engine Dependency Graph. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer depends on the Foundation Layer | Via `user_id`. |
| No world table depends on a layer above the World Layer | No upward references. |
| No circular dependencies | The dependency graph is a DAG. |
| The World Layer follows the Engine Dependency Graph | Topological build order. |
| No dependency philosophy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Dependency philosophy does not affect save snapshots. |
| Replay Compatibility | Dependency philosophy is deterministic. |
| Migration Compatibility | Dependency philosophy is never weakened. |
| Synchronization Compatibility | Dependency philosophy is server-authoritative. |
| Event Bus Compatibility | Dependency philosophy does not affect event ordering. |

---

### 13.2 Dependency Hierarchy

#### Purpose

The dependency hierarchy section defines the hierarchy of dependencies for the
World Layer.

#### Scope

The dependency hierarchy applies to all 16 world tables and all layers the World
Layer depends on.

#### Boundaries

The World Layer is above the Foundation Layer. The World Layer is below the Engine
Layer. No world table skips a level in the hierarchy. The hierarchy is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Above Foundation | The World Layer is above the Foundation Layer. |
| Below Engine | The World Layer is below the Engine Layer. |
| No Level Skip | No world table skips a level. |
| DAG | The hierarchy is a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Layer is above the Foundation Layer | Foundation dependency. |
| The World Layer is below the Engine Layer | Engines reference world identifiers. |
| No world table skips a level in the hierarchy | Continents reference worlds, regions reference continents, etc. |
| The hierarchy is a DAG | No circular dependencies. |
| No dependency hierarchy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Dependency hierarchy does not affect save snapshots. |
| Replay Compatibility | Dependency hierarchy is deterministic. |
| Migration Compatibility | Dependency hierarchy is never weakened. |
| Synchronization Compatibility | Dependency hierarchy is server-authoritative. |
| Event Bus Compatibility | Dependency hierarchy does not affect event ordering. |

---

### 13.3 Foundation Dependencies

#### Purpose

The Foundation dependencies section defines the dependencies between the World
Layer and the Foundation Layer.

#### Scope

The Foundation dependencies apply to all 16 world tables and their references to
the Foundation Layer.

#### Boundaries

Every world row has a `user_id` referencing the Foundation Layer. The World Layer
does not manage authentication or authorization. The Foundation Layer manages both.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User ID Reference | Every world row has a `user_id`. |
| No Auth Management | The World Layer does not manage authentication. |
| No Authorization Management | The World Layer does not manage authorization. |
| Foundation Dependency | The World Layer depends on the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every world row has `user_id` | References the Foundation Layer. |
| The World Layer does not manage authentication | The Foundation Layer does. |
| The World Layer does not manage authorization | The Foundation Layer does. |
| No world table stores passwords or tokens | No exceptions. |
| No Foundation dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Foundation dependencies do not affect save snapshots. |
| Replay Compatibility | Foundation dependencies are deterministic. |
| Migration Compatibility | Foundation dependencies are never weakened. |
| Synchronization Compatibility | Foundation dependencies are server-authoritative. |
| Event Bus Compatibility | Foundation dependencies do not affect event ordering. |

---

### 13.4 Save Engine Dependencies

#### Purpose

The Save Engine dependencies section defines the dependencies between the World
Layer and the Save Engine.

#### Scope

The Save Engine dependencies apply to the boundary between the World Layer and the
Save Engine.

#### Boundaries

The Save Engine references world identifiers. The Save Engine does not serialize
world data into snapshots. No world data affects existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | The Save Engine references world identifiers. |
| No World Serialization | The Save Engine does not serialize world data. |
| No Format Change | World data does not affect existing snapshot format. |
| Zero Snapshot Overhead | World data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Save Engine references world identifiers | No world data in snapshots. |
| The Save Engine does not serialize world data | Zero overhead. |
| World data does not affect existing snapshot format | Backward compatible. |
| World data does not increase snapshot size | Zero overhead. |
| No Save Engine dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | World data does not affect save snapshots. |
| Replay Compatibility | Save Engine dependencies are deterministic. |
| Migration Compatibility | Save Engine dependencies are never weakened. |
| Synchronization Compatibility | Save Engine dependencies are server-authoritative. |
| Event Bus Compatibility | Save Engine dependencies do not affect event ordering. |

---

### 13.5 Synchronization Dependencies

#### Purpose

The Synchronization dependencies section defines the dependencies between the World
Layer and the Synchronization Architecture.

#### Scope

The Synchronization dependencies apply to all world data that is synced: world
metadata, faction membership, religion membership, world events.

#### Boundaries

Sync is server-authoritative and non-blocking. The World Layer does not manage sync.
The Synchronization Architecture manages sync. No sync dependency corrupts data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync is server-authoritative. |
| Non-Blocking | Sync is non-blocking. |
| No Sync Management | The World Layer does not manage sync. |
| No Corruption | Sync dependencies do not corrupt data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| Sync dependencies do not corrupt data | Atomic operations. |
| No Synchronization dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Synchronization dependencies do not affect save snapshots. |
| Replay Compatibility | Synchronization dependencies are deterministic. |
| Migration Compatibility | Synchronization dependencies are never weakened. |
| Synchronization Compatibility | Sync is server-authoritative and non-blocking. |
| Event Bus Compatibility | Synchronization dependencies do not affect event ordering. |

---

### 13.6 Validation Dependencies

#### Purpose

The Validation dependencies section defines the dependencies between the World
Layer and the Validation Architecture.

#### Scope

The Validation dependencies apply to all constraints, RLS policies, and validation
checks in the world layer.

#### Boundaries

Validation is database-enforced and deterministic. The World Layer does not define
the Validation Architecture. The Validation Architecture defines it. No validation
dependency destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is database-enforced. |
| Deterministic | Validation is deterministic. |
| No Validation Framework | The World Layer does not define the Validation Architecture. |
| No Data Destruction | Validation dependencies do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| The World Layer does not define the Validation Architecture | It uses the project's standards. |
| Validation dependencies do not destroy data | Data preservation is the cardinal rule. |
| No Validation dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Validation dependencies do not affect save snapshots. |
| Replay Compatibility | Validation dependencies are deterministic. |
| Migration Compatibility | Validation dependencies are never weakened. |
| Synchronization Compatibility | Validation dependencies are server-authoritative. |
| Event Bus Compatibility | Validation dependencies do not affect event ordering. |

---

### 13.7 Replay Dependencies

#### Purpose

The Replay dependencies section defines the dependencies between the World Layer
and the Replay System.

#### Scope

The Replay dependencies apply to all world data that could affect replays: world
identifiers, faction identifiers, religion identifiers.

#### Boundaries

World data is not in engine snapshots. Replays do not query world tables. World
identifiers are deterministic. No replay dependency introduces non-determinism.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | World data is not in snapshots. No replay queries. |
| No Non-Determinism | World data does not introduce non-determinism. |
| Deterministic Identifiers | World identifiers are deterministic. |
| Cross-Platform | World identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| World data is not in snapshots | Except the world identifier if referenced. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| No replay dependency introduces non-determinism | Same state, same result. |
| No Replay dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay dependencies do not affect save snapshots. |
| Replay Compatibility | World data does not introduce non-determinism. |
| Migration Compatibility | Replay dependencies are never weakened. |
| Synchronization Compatibility | Replay dependencies are server-authoritative. |
| Event Bus Compatibility | Replay dependencies do not affect event ordering. |

---

### 13.8 Migration Dependencies

#### Purpose

The Migration dependencies section defines the dependencies between the World Layer
and the Migration System.

#### Scope

The Migration dependencies apply to all world migrations — any additive change to
the world schema.

#### Boundaries

Migrations are additive, forward-only, and backward compatible. No migration drops
a table, drops a column, renames a column, or changes a column type. No migration
weakens RLS.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Migration dependencies are additive. |
| Forward-Only | Migration dependencies are forward-only. |
| Backward Compatible | Migration dependencies do not break existing data. |
| No RLS Weakening | No migration weakens RLS. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Migrations are additive | No destructive operations. |
| Migrations are forward-only | No backward migration. |
| No migration drops a table or column | No exceptions. |
| No migration renames a column | No exceptions. |
| No migration changes a column type | No exceptions. |
| No migration weakens RLS | No exceptions. |
| No Migration dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Migration dependencies do not affect save snapshots. |
| Replay Compatibility | Migration dependencies are deterministic. |
| Migration Compatibility | Migrations are additive and forward-only. |
| Synchronization Compatibility | Migration dependencies are server-authoritative. |
| Event Bus Compatibility | Migration dependencies do not affect event ordering. |

---

### 13.9 Security Dependencies

#### Purpose

The Security dependencies section defines the dependencies between the World Layer
and the security architecture.

#### Scope

The Security dependencies apply to all 16 world tables, all RLS policies, and all
trust boundaries.

#### Boundaries

RLS is the primary security boundary. The service role key is server-side only. No
client-side authority. No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Primary | RLS is the primary security boundary. |
| Service Role Key Protection | The service role key is server-side only. |
| No Client-Side Authority | No client-side conflict resolution. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is the primary security boundary | No exceptions. |
| The service role key is server-side only | Never in client code. |
| No client-side authority | Server-authoritative. |
| No cross-user access from the client | RLS prevents it. |
| No Security dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Security dependencies do not affect save snapshots. |
| Replay Compatibility | Security dependencies are deterministic. |
| Migration Compatibility | Security dependencies are never weakened. |
| Synchronization Compatibility | Security dependencies are server-authoritative. |
| Event Bus Compatibility | Security dependencies do not affect event ordering. |

---

### 13.10 Monitoring Dependencies

#### Purpose

The Monitoring dependencies section defines the dependencies between the World
Layer and the monitoring architecture.

#### Scope

The Monitoring dependencies apply to all 16 world tables and all monitoring
metrics.

#### Boundaries

Monitoring is non-blocking. The World Layer does not define the monitoring
framework. Monitoring provides row counts, table sizes, and query performance.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring is non-blocking. |
| No Framework Definition | The World Layer does not define the monitoring framework. |
| Observable | World data is observable through metrics. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| The World Layer does not define the monitoring framework | It uses the project's standards. |
| Monitoring provides row counts, table sizes, and query performance | Observable. |
| Monitoring metrics are documented | In the blueprint. |
| No Monitoring dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Monitoring dependencies do not affect save snapshots. |
| Replay Compatibility | Monitoring dependencies are deterministic. |
| Migration Compatibility | Monitoring dependencies are never weakened. |
| Synchronization Compatibility | Monitoring dependencies are server-authoritative. |
| Event Bus Compatibility | Monitoring dependencies do not affect event ordering. |

---

### 13.11 Testing Dependencies

#### Purpose

The Testing dependencies section defines the dependencies between the World Layer
and the Testing Architecture.

#### Scope

The Testing dependencies apply to all 16 world tables and all world tests.

#### Boundaries

Testing is deterministic and reproducible. The World Layer does not define the
testing framework. The Testing Architecture defines it. No test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Testing is deterministic. |
| Reproducible | Testing is reproducible. |
| No Framework Definition | The World Layer does not define the testing framework. |
| No Data Destruction | No test destroys data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing is deterministic | Same input, same result. |
| Testing is reproducible | Can be re-run with same results. |
| The World Layer does not define the testing framework | It uses the Testing Architecture. |
| No test destroys data | Data preservation is the cardinal rule. |
| No Testing dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Testing dependencies do not affect save snapshots. |
| Replay Compatibility | Testing dependencies are deterministic. |
| Migration Compatibility | Testing dependencies are never weakened. |
| Synchronization Compatibility | Testing dependencies are server-authoritative. |
| Event Bus Compatibility | Testing dependencies do not affect event ordering. |

---

### 13.12 Future Dependencies

#### Purpose

The Future dependencies section defines the dependencies between the World Layer
and future engines and systems.

#### Scope

The Future dependencies apply to all future engines and systems that reference
world data.

#### Boundaries

Future engines reference world identifiers only. Future engines do not serialize
world data. Future engines do not query world tables during replays. No future
engine creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | Future engines reference world identifiers. |
| No World Serialization | Future engines do not serialize world data. |
| No Replay Queries | Future engines do not query world tables during replays. |
| No Circular Dependencies | No future engine creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Future engines reference world identifiers only | No world data in snapshots. |
| Future engines do not serialize world data | Zero snapshot overhead. |
| Future engines do not query world tables during replays | Zero replay overhead. |
| No future engine creates a circular dependency | The World Layer remains a DAG. |
| Future dependencies are documented | In the Engine Dependency Graph. |
| No Future dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Future dependencies do not affect save snapshots. |
| Replay Compatibility | Future dependencies are deterministic. |
| Migration Compatibility | Future dependencies are additive. |
| Synchronization Compatibility | Future dependencies are server-authoritative. |
| Event Bus Compatibility | Future dependencies do not affect event ordering. |

---

## 14. Completion Checklist

### Overview

This chapter defines the completion checklist for the World Layer. It defines the
architecture, validation, security, synchronization, replay, migration, backup,
performance, testing, documentation, acceptance, and release checklists.

This chapter has 12 sections. Every section includes requirements, completion
criteria, validation rules, acceptance rules, and permanent restrictions.

---

### 14.1 Architecture Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All 16 world tables defined | worlds, continents, regions, kingdoms, cities, villages, roads, landmarks, dungeons, climates, ecosystems, factions, religions, world_history, major_world_events, locations. |
| All relationships defined | Per Chapter 7. |
| All dependencies defined | Per Chapter 13. |
| All naming follows the Naming Rules v1.0 | Per Chapter 6. |
| The World Layer is a DAG | No circular dependencies. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 tables are documented in the blueprint | No missing tables. |
| All relationships are documented in the ERD | No missing relationships. |
| All dependencies are documented | No missing dependencies. |
| All naming follows the Naming Rules v1.0 | No violations. |
| The World Layer is a DAG | No circular dependencies. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All 16 tables are present in the blueprint | Verified. |
| All relationships are present in the ERD | Verified. |
| All dependencies are present in the Engine Dependency Graph | Verified. |
| All naming follows the Naming Rules v1.0 | Verified. |
| No circular dependencies exist | Verified. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the architecture | No exceptions. |
| The Peer Architect reviews the architecture | No exceptions. |
| All architecture checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No table is removed after locking | Permanent. |
| No relationship is removed after locking | Permanent. |
| No dependency is removed after locking | Permanent. |
| No naming rule is removed after locking | Permanent. |
| No circular dependency is introduced after locking | Permanent. |

---

### 14.2 Validation Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All constraints are defined | NOT NULL, UNIQUE, CHECK, FK. |
| All RLS policies are defined | Four per table. |
| All validation checks are defined | Per Chapter 9. |
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All constraints are documented | In the blueprint and Schema.md. |
| All RLS policies are documented | Four per table. |
| All validation checks are documented | Per Chapter 9. |
| Validation is database-enforced | Verified. |
| Validation is deterministic | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All NOT NULL constraints are defined | Every required column. |
| All UNIQUE constraints are defined | Every unique column. |
| All CHECK constraints are defined | Every validated column. |
| All FK constraints are defined | No orphan rows. |
| All RLS policies are defined | Four per table. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the validation | No exceptions. |
| All validation checklist items pass | No exceptions. |
| No validation check is skipped | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No constraint is removed after locking | Permanent. |
| No RLS policy is removed after locking | Permanent. |
| No validation check is removed after locking | Permanent. |
| No validation is weakened after locking | Permanent. |

---

### 14.3 Security Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| RLS is enabled on every world table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| Policies use `auth.uid()` | No `current_user`. |
| No `FOR ALL` policies | No exceptions. |
| No `USING (true)` policies | No exceptions. |
| The service role key is server-side only | Never in client code. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| RLS is enabled on all 16 world tables | Verified. |
| Four policies per table are defined | Verified. |
| Policies use `auth.uid()` | Verified. |
| No `FOR ALL` policies | Verified. |
| No `USING (true)` policies | Verified. |
| The service role key is server-side only | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every world table | Verified. |
| Four policies per table are defined | Verified. |
| Policies use `auth.uid()` for ownership checks | Verified. |
| No `FOR ALL` policies exist | Verified. |
| No `USING (true)` policies exist | Verified. |
| UPDATE policies have both USING and WITH CHECK | Verified. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the security | No exceptions. |
| All security checklist items pass | No exceptions. |
| No security rule is skipped | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No RLS policy is removed after locking | Permanent. |
| No security rule is removed after locking | Permanent. |
| No security rule is weakened after locking | Permanent. |
| The service role key is never exposed to the client | Permanent. |

---

### 14.4 Synchronization Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| Sync does not corrupt data | Atomic operations. |
| The World Layer does not manage sync | The Synchronization Architecture does. |
| Sync is batched where possible | Reduce round trips. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Sync is server-authoritative | Verified. |
| Sync is non-blocking | Verified. |
| Sync does not corrupt data | Verified. |
| The World Layer does not manage sync | Verified. |
| Sync is batched where possible | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Sync operations are atomic | No partial writes. |
| Sync operations do not block gameplay | Non-blocking. |
| Sync operations are server-authoritative | No client-side conflict resolution. |
| Sync failures do not corrupt data | Previous valid state retained. |
| Sync failures do not crash the game | Degraded state. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the synchronization | No exceptions. |
| All synchronization checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No synchronization rule is removed after locking | Permanent. |
| No synchronization rule is weakened after locking | Permanent. |
| Sync is never client-authoritative | Permanent. |
| Sync is never blocking | Permanent. |

---

### 14.5 Replay Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| World data is not in engine snapshots | Except the world identifier. |
| Replays do not query world tables | Zero overhead. |
| World identifiers are deterministic | Never change after creation. |
| No non-determinism from world data | Same state, same result. |
| World identifiers are platform-independent | Cross-platform. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| World data is not in snapshots | Verified. |
| Replays do not query world tables | Verified. |
| World identifiers are deterministic | Verified. |
| No non-determinism from world data | Verified. |
| World identifiers are platform-independent | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No world table is serialized into engine snapshots | Except the world identifier. |
| The Save Engine references world identifiers only | No world data. |
| World identifiers are never changed after creation | Deterministic. |
| No wall-clock time affects world data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects world data in snapshots | No random non-determinism. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the replay compatibility | No exceptions. |
| All replay checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No replay rule is removed after locking | Permanent. |
| No replay rule is weakened after locking | Permanent. |
| World identifiers are never changed after creation | Permanent. |
| World data is never serialized into engine snapshots | Permanent. |

---

### 14.6 Migration Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Migrations are additive | No destructive operations. |
| Migrations are forward-only | No backward migration. |
| No migration drops a table or column | No exceptions. |
| No migration renames a column | No exceptions. |
| No migration changes a column type | No exceptions. |
| No migration weakens RLS | No exceptions. |
| Every migration is logged | In the Migration Log. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All migrations are additive | Verified. |
| All migrations are forward-only | Verified. |
| No migration drops a table or column | Verified. |
| No migration renames a column | Verified. |
| No migration changes a column type | Verified. |
| No migration weakens RLS | Verified. |
| All migrations are logged | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No migration drops a table | No exceptions. |
| No migration drops a column | No exceptions. |
| No migration renames a column | No exceptions. |
| No migration changes a column type | No exceptions. |
| Every migration is logged in the Migration Log | No exceptions. |
| Every migration is tested against all dependent layers | No exceptions. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the migration | No exceptions. |
| All migration checklist items pass | No exceptions. |
| No migration is merged with failing tests | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No migration rule is removed after locking | Permanent. |
| No migration rule is weakened after locking | Permanent. |
| No destructive migration is ever allowed | Permanent. |
| No migration is ever merged with failing tests | Permanent. |

---

### 14.7 Backup Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Backups are atomic | Complete before overwrite. |
| Backups do not destroy data | No data loss. |
| The previous valid state is always retained | No exceptions. |
| Backups are documented | In the Migration Log. |
| Backup retention is configurable | Per the Database Architecture Blueprint. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Backups are atomic | Verified. |
| Backups do not destroy data | Verified. |
| The previous valid state is always retained | Verified. |
| Backups are documented | Verified. |
| Backup retention is configurable | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Backup is complete before overwrite begins | Atomic. |
| No failure path destroys data | Previous valid state retained. |
| Backup retention is configurable | Per the Database Architecture Blueprint. |
| Backup is documented in the Migration Log | No exceptions. |
| Backup is tested against all dependent layers | No exceptions. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the backup | No exceptions. |
| All backup checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No backup rule is removed after locking | Permanent. |
| No backup rule is weakened after locking | Permanent. |
| No backup destroys data | Permanent. |
| The previous valid state is always retained | Permanent. |

---

### 14.8 Performance Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All foreign keys are indexed | No unindexed foreign keys. |
| Queries return bounded result sets | Pagination is used. |
| No speculative indexes | Indexes are justified by evidence. |
| Performance is measured, not assumed | Evidence-based. |
| Data integrity wins over performance | No exceptions. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All foreign keys are indexed | Verified. |
| Queries return bounded result sets | Verified. |
| No speculative indexes | Verified. |
| Performance is measured | Verified. |
| Data integrity wins over performance | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All foreign key columns are indexed | No unindexed foreign keys. |
| No query loads an unbounded result set | Pagination is used. |
| Indexes are justified by evidence | No speculative indexes. |
| Performance decisions are evidence-based | No assumptions. |
| No performance optimization weakens a guarantee | All 10 guarantees preserved. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the performance | No exceptions. |
| All performance checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No performance rule is removed after locking | Permanent. |
| No performance optimization weakens a guarantee | Permanent. |
| Data integrity always wins over performance | Permanent. |
| No unindexed foreign keys are allowed | Permanent. |

---

### 14.9 Testing Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Every world table is tested | No exceptions. |
| Every migration is tested | No exceptions. |
| Every RLS policy is tested | Four per table. |
| No test is skipped | No exceptions. |
| No test is weakened | No exceptions. |
| Testing is deterministic and reproducible | No exceptions. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 world tables have tests | Verified. |
| All migrations have tests | Verified. |
| All RLS policies have tests | Verified. |
| No test is skipped | Verified. |
| No test is weakened | Verified. |
| Testing is deterministic and reproducible | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All 16 world tables have unit tests | No exceptions. |
| All relationships have integration tests | No exceptions. |
| All migrations have migration tests | No exceptions. |
| All RLS policies have security tests | Four per table. |
| All tests are deterministic and reproducible | No exceptions. |
| No migration is merged with failing tests | No exceptions. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the testing | No exceptions. |
| All testing checklist items pass | No exceptions. |
| No test is skipped or weakened | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No testing rule is removed after locking | Permanent. |
| No testing rule is weakened after locking | Permanent. |
| No test is ever skipped | Permanent. |
| No migration is ever merged with failing tests | Permanent. |

---

### 14.10 Documentation Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| The World Blueprint is complete | All chapters authored. |
| The ERD is complete | All tables and relationships. |
| The Schema.md is complete | All tables and columns. |
| The Migration Log is complete | All migrations logged. |
| The Engine Dependency Graph is complete | All dependencies. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| The World Blueprint is complete | All chapters authored. |
| The ERD is complete | All tables and relationships. |
| The Schema.md is complete | All tables and columns. |
| The Migration Log is complete | All migrations logged. |
| The Engine Dependency Graph is complete | All dependencies. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All blueprint chapters are authored | No missing chapters. |
| All tables are in the ERD | No missing tables. |
| All columns are in the Schema.md | No missing columns. |
| All migrations are in the Migration Log | No missing migrations. |
| All dependencies are in the Engine Dependency Graph | No missing dependencies. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the documentation | No exceptions. |
| All documentation checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No documentation is removed after locking | Permanent. |
| No documentation is weakened after locking | Permanent. |
| The blueprint is the single source of truth | Permanent. |

---

### 14.11 Acceptance Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All checklist sections pass | Architecture, validation, security, etc. |
| The Lead Architect approves | No exceptions. |
| The Peer Architect reviews | No exceptions. |
| All cross-cutting guarantees are preserved | All 10 guarantees. |
| No SQL, TypeScript, or pseudocode is present | Blueprint documentation only. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 12 checklist sections pass | No exceptions. |
| The Lead Architect signs off | No exceptions. |
| The Peer Architect signs off | No exceptions. |
| All 10 cross-cutting guarantees are preserved | No exceptions. |
| No implementation code is present | No exceptions. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All 12 checklist sections are verified | No exceptions. |
| The Lead Architect signs off on all results | No exceptions. |
| The Peer Architect signs off on all results | No exceptions. |
| All 10 cross-cutting guarantees are preserved | No exceptions. |
| No SQL, TypeScript, or pseudocode is present | No exceptions. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| All 12 checklist sections pass before lock | No exceptions. |
| The Lead Architect signs off | No exceptions. |
| The Peer Architect signs off | No exceptions. |
| No checklist item is skipped | No exceptions. |
| No checklist item is weakened | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No acceptance rule is removed after locking | Permanent. |
| No acceptance rule is weakened after locking | Permanent. |
| The blueprint is not locked until all checklist items pass | Permanent. |
| The blueprint is not locked until the Lead Architect signs off | Permanent. |

---

### 14.12 Release Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| The blueprint is locked | All chapters authored, all checklists pass. |
| The Lead Architect signs off | No exceptions. |
| The Peer Architect signs off | No exceptions. |
| All 10 cross-cutting guarantees are preserved | No exceptions. |
| The build passes | No exceptions. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| The blueprint is locked | Verified. |
| The Lead Architect signs off | Verified. |
| The Peer Architect signs off | Verified. |
| All 10 cross-cutting guarantees are preserved | Verified. |
| The build passes | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All chapters are authored | No missing chapters. |
| All 12 checklist sections pass | No exceptions. |
| The Lead Architect signs off | No exceptions. |
| The Peer Architect signs off | No exceptions. |
| All 10 cross-cutting guarantees are preserved | No exceptions. |
| The build passes | No exceptions. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The blueprint is not released until locked | No exceptions. |
| The blueprint is not released until the Lead Architect signs off | No exceptions. |
| The blueprint is not released until the Peer Architect signs off | No exceptions. |
| The blueprint is not released until all checklists pass | No exceptions. |
| The blueprint is not released until the build passes | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No release rule is removed after locking | Permanent. |
| No release rule is weakened after locking | Permanent. |
| The blueprint is not released until locked | Permanent. |
| The blueprint is not released until all checklists pass | Permanent. |
| The blueprint is not released until the build passes | Permanent. |

---

## Sprint 1.2.2.5 Review

### Sprint Summary

**Sprint:** 1.2.2.5 — World Blueprint v1.0 (Chapters 12–14)
**Status:** COMPLETE
**Date:** 2026-08-03

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 12 | Future Expansion | 14 sections: expansion philosophy, horizontal expansion, vertical expansion, repository expansion, migration expansion, replay expansion, synchronization expansion, security expansion, validation expansion, monitoring expansion, backup expansion, compatibility guarantees, future engine integration, long-term vision. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 13 | Dependencies | 12 sections: dependency philosophy, dependency hierarchy, Foundation dependencies, Save Engine dependencies, Synchronization dependencies, Validation dependencies, Replay dependencies, Migration dependencies, Security dependencies, Monitoring dependencies, Testing dependencies, Future dependencies. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 14 | Completion Checklist | 12 sections: architecture checklist, validation checklist, security checklist, synchronization checklist, replay checklist, migration checklist, backup checklist, performance checklist, testing checklist, documentation checklist, acceptance checklist, release checklist. Each with requirements, completion criteria, validation rules, acceptance rules, permanent restrictions. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–14) | PASS |
| No gaps in chapter numbering | PASS |
| Deterministic execution preserved | PASS |
| Replay compatibility preserved | PASS |
| Migration compatibility preserved | PASS |
| Synchronization compatibility preserved | PASS |
| Ownership consistency preserved | PASS |
| Dependency consistency preserved | PASS |
| Naming consistency preserved | PASS |
| Lock policy compliance preserved | PASS |
| Event ordering consistency preserved | PASS |
| Snapshot compatibility preserved | PASS |
| Save compatibility preserved | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Blueprint documentation only | PASS |

### Notes

- The World Blueprint is IN PROGRESS. Chapters 15–16 are pending.
- Next sprint: 1.2.2.6 — Chapter 15 (Lock Policy), Chapter 16 (Visual Prototype).

---

## 15. Lock Policy

### Overview

This chapter defines the lock policy for the World Blueprint v1.0. It defines the
lock philosophy, lock requirements, modification procedure, exception procedure,
unlock procedure, review procedure, approval procedure, versioning strategy,
compatibility guarantees, deterministic guarantees, replay guarantees, migration
guarantees, synchronization guarantees, dependency guarantees, ownership
guarantees, permanent restrictions, change management rules, semantic versioning
rules, documentation requirements, and future revision procedures.

This chapter has 20 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 15.1 Lock Philosophy

#### Purpose

The lock philosophy defines the permanent principles that govern the locking of the
World Blueprint v1.0.

#### Scope

The lock philosophy applies to the entire World Blueprint v1.0 — all 16 chapters,
all 16 world tables, all relationships, all dependencies, all guarantees.

#### Boundaries

Once locked, the blueprint is immutable. No locked rule is removed. No locked rule
is weakened. No locked guarantee is weakened. All future changes require a new
versioned blueprint.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Immutable | Once locked, the blueprint is immutable. |
| No Removal | No locked rule is removed. |
| No Weakening | No locked rule is weakened. |
| No Guarantee Weakening | No locked guarantee is weakened. |
| Versioned Changes | All future changes require a new versioned blueprint. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Once locked, the blueprint is immutable | No exceptions. |
| No locked rule is removed | No exceptions. |
| No locked rule is weakened | No exceptions. |
| No locked guarantee is weakened | No exceptions. |
| All future changes require a new versioned blueprint | No exceptions. |
| No lock philosophy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Lock philosophy preserves save snapshots. |
| Replay Compatibility | Lock philosophy is deterministic. |
| Migration Compatibility | Lock philosophy is additive and forward-only. |
| Synchronization Compatibility | Lock philosophy is server-authoritative. |
| Event Bus Compatibility | Lock philosophy does not affect event ordering. |

---

### 15.2 Lock Requirements

#### Purpose

The lock requirements section defines the requirements that must be met before the
blueprint can be locked.

#### Scope

The lock requirements apply to the entire World Blueprint v1.0.

#### Boundaries

All 16 chapters must be authored. All 12 completion checklist sections must pass.
All 10 cross-cutting guarantees must be preserved. The Lead Architect must sign off.
The Peer Architect must sign off. The build must pass.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| All Chapters Authored | All 16 chapters are authored. |
| All Checklists Pass | All 12 completion checklist sections pass. |
| All Guarantees Preserved | All 10 cross-cutting guarantees are preserved. |
| Lead Architect Sign-Off | The Lead Architect signs off. |
| Peer Architect Sign-Off | The Peer Architect signs off. |
| Build Passes | The build passes. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 16 chapters must be authored before locking | No exceptions. |
| All 12 completion checklist sections must pass before locking | No exceptions. |
| All 10 cross-cutting guarantees must be preserved before locking | No exceptions. |
| The Lead Architect must sign off before locking | No exceptions. |
| The Peer Architect must sign off before locking | No exceptions. |
| The build must pass before locking | No exceptions. |
| No lock requirement is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Lock requirements preserve save snapshots. |
| Replay Compatibility | Lock requirements are deterministic. |
| Migration Compatibility | Lock requirements are additive and forward-only. |
| Synchronization Compatibility | Lock requirements are server-authoritative. |
| Event Bus Compatibility | Lock requirements do not affect event ordering. |

---

### 15.3 Modification Procedure

#### Purpose

The modification procedure section defines the procedure for modifying the blueprint
before it is locked.

#### Scope

The modification procedure applies to all changes to the blueprint before locking.

#### Boundaries

Modifications are additive only. No modification removes a rule. No modification
weakens a guarantee. All modifications are logged. All modifications are reviewed.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Modifications are additive only. |
| No Removal | No modification removes a rule. |
| No Weakening | No modification weakens a guarantee. |
| Logged | All modifications are logged. |
| Reviewed | All modifications are reviewed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Modifications are additive only | No destructive modifications. |
| No modification removes a rule | Forward-only. |
| No modification weakens a guarantee | All 10 guarantees preserved. |
| All modifications are logged | In the Sprint Log and Changelog. |
| All modifications are reviewed | By the Peer Architect. |
| No modification procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Modification procedure preserves save snapshots. |
| Replay Compatibility | Modification procedure is deterministic. |
| Migration Compatibility | Modification procedure is additive and forward-only. |
| Synchronization Compatibility | Modification procedure is server-authoritative. |
| Event Bus Compatibility | Modification procedure does not affect event ordering. |

---

### 15.4 Exception Procedure

#### Purpose

The exception procedure section defines the procedure for handling exceptions to the
lock policy.

#### Scope

The exception procedure applies to any request to modify a locked rule.

#### Boundaries

No exception removes a locked rule. No exception weakens a locked guarantee. All
exceptions require a new versioned blueprint. All exceptions require Lead Architect
approval.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Removal | No exception removes a locked rule. |
| No Weakening | No exception weakens a locked guarantee. |
| Versioned | All exceptions require a new versioned blueprint. |
| Lead Architect Approval | All exceptions require Lead Architect approval. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| No exception removes a locked rule | No exceptions. |
| No exception weakens a locked guarantee | No exceptions. |
| All exceptions require a new versioned blueprint | No exceptions. |
| All exceptions require Lead Architect approval | No exceptions. |
| All exceptions are documented | In the Changelog. |
| No exception procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Exception procedure preserves save snapshots. |
| Replay Compatibility | Exception procedure is deterministic. |
| Migration Compatibility | Exception procedure is additive and forward-only. |
| Synchronization Compatibility | Exception procedure is server-authoritative. |
| Event Bus Compatibility | Exception procedure does not affect event ordering. |

---

### 15.5 Unlock Procedure

#### Purpose

The unlock procedure section defines the procedure for unlocking the blueprint.

#### Scope

The unlock procedure applies to any request to unlock the blueprint after it is
locked.

#### Boundaries

The blueprint is never unlocked. No locked rule is removed. No locked guarantee is
weakened. All changes require a new versioned blueprint.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Never Unlocked | The blueprint is never unlocked. |
| No Removal | No locked rule is removed. |
| No Weakening | No locked guarantee is weakened. |
| Versioned | All changes require a new versioned blueprint. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint is never unlocked | No exceptions. |
| No locked rule is removed | No exceptions. |
| No locked guarantee is weakened | No exceptions. |
| All changes require a new versioned blueprint | No exceptions. |
| No unlock procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Unlock procedure preserves save snapshots. |
| Replay Compatibility | Unlock procedure is deterministic. |
| Migration Compatibility | Unlock procedure is additive and forward-only. |
| Synchronization Compatibility | Unlock procedure is server-authoritative. |
| Event Bus Compatibility | Unlock procedure does not affect event ordering. |

---

### 15.6 Review Procedure

#### Purpose

The review procedure section defines the procedure for reviewing the blueprint before
locking.

#### Scope

The review procedure applies to the entire World Blueprint v1.0.

#### Boundaries

The Peer Architect reviews all chapters. The Lead Architect approves all chapters.
All cross-cutting guarantees are verified. All completion checklist items are verified.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Peer Review | The Peer Architect reviews all chapters. |
| Lead Approval | The Lead Architect approves all chapters. |
| Guarantees Verified | All cross-cutting guarantees are verified. |
| Checklist Verified | All completion checklist items are verified. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Peer Architect reviews all 16 chapters | No exceptions. |
| The Lead Architect approves all 16 chapters | No exceptions. |
| All 10 cross-cutting guarantees are verified | No exceptions. |
| All 12 completion checklist items are verified | No exceptions. |
| No review procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Review procedure preserves save snapshots. |
| Replay Compatibility | Review procedure is deterministic. |
| Migration Compatibility | Review procedure is additive and forward-only. |
| Synchronization Compatibility | Review procedure is server-authoritative. |
| Event Bus Compatibility | Review procedure does not affect event ordering. |

---

### 15.7 Approval Procedure

#### Purpose

The approval procedure section defines the procedure for approving the blueprint
before locking.

#### Scope

The approval procedure applies to the entire World Blueprint v1.0.

#### Boundaries

The Lead Architect signs off. The Peer Architect signs off. All checklists pass.
All guarantees are preserved. The build passes.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Lead Architect Sign-Off | The Lead Architect signs off. |
| Peer Architect Sign-Off | The Peer Architect signs off. |
| All Checklists Pass | All completion checklist items pass. |
| All Guarantees Preserved | All 10 cross-cutting guarantees are preserved. |
| Build Passes | The build passes. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Lead Architect signs off before locking | No exceptions. |
| The Peer Architect signs off before locking | No exceptions. |
| All 12 completion checklist sections pass before locking | No exceptions. |
| All 10 cross-cutting guarantees are preserved before locking | No exceptions. |
| The build passes before locking | No exceptions. |
| No approval procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Approval procedure preserves save snapshots. |
| Replay Compatibility | Approval procedure is deterministic. |
| Migration Compatibility | Approval procedure is additive and forward-only. |
| Synchronization Compatibility | Approval procedure is server-authoritative. |
| Event Bus Compatibility | Approval procedure does not affect event ordering. |

---

### 15.8 Versioning Strategy

#### Purpose

The versioning strategy section defines the versioning strategy for the World
Blueprint.

#### Scope

The versioning strategy applies to all versions of the World Blueprint.

#### Boundaries

The blueprint uses semantic versioning. The initial version is v1.0. All future
changes require a new version. No version is removed. No version is weakened.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Semantic Versioning | The blueprint uses semantic versioning. |
| Initial Version | The initial version is v1.0. |
| Versioned Changes | All future changes require a new version. |
| No Removal | No version is removed. |
| No Weakening | No version is weakened. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint uses semantic versioning | major.minor.patch. |
| The initial version is v1.0 | No exceptions. |
| All future changes require a new version | No exceptions. |
| No version is removed | No exceptions. |
| No version is weakened | No exceptions. |
| No versioning strategy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Versioning strategy preserves save snapshots. |
| Replay Compatibility | Versioning strategy is deterministic. |
| Migration Compatibility | Versioning strategy is additive and forward-only. |
| Synchronization Compatibility | Versioning strategy is server-authoritative. |
| Event Bus Compatibility | Versioning strategy does not affect event ordering. |

---

### 15.9 Compatibility Guarantees

#### Purpose

The compatibility guarantees section defines the compatibility guarantees that the
lock policy preserves.

#### Scope

The compatibility guarantees apply to all 10 cross-cutting guarantees.

#### Boundaries

All 10 compatibility guarantees are preserved by the lock. No lock weakens any
guarantee. No lock breaks any dependent system.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | The lock preserves save snapshots. |
| Replay Compatibility | The lock preserves replay compatibility. |
| Migration Compatibility | The lock preserves migration compatibility. |
| Synchronization Compatibility | The lock preserves synchronization compatibility. |
| Event Bus Compatibility | The lock preserves event ordering. |
| Snapshot Compatibility | The lock preserves snapshot format. |
| Ownership Compatibility | The lock preserves ownership. |
| Dependency Compatibility | The lock preserves dependencies. |
| Naming Compatibility | The lock preserves naming. |
| Lock Policy Compatibility | The lock preserves the lock policy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are preserved by the lock | No exceptions. |
| No lock weakens any guarantee | No exceptions. |
| No lock breaks any dependent system | No exceptions. |
| No compatibility guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | The lock preserves save snapshots. |
| Replay Compatibility | The lock is deterministic. |
| Migration Compatibility | The lock is additive and forward-only. |
| Synchronization Compatibility | The lock is server-authoritative. |
| Event Bus Compatibility | The lock does not affect event ordering. |

---

### 15.10 Deterministic Guarantees

#### Purpose

The deterministic guarantees section defines the deterministic guarantees that the
lock policy preserves.

#### Scope

The deterministic guarantees apply to all world data and all world operations.

#### Boundaries

The lock preserves deterministic execution. No lock introduces non-determinism.
World identifiers are deterministic. No lock changes identifiers after creation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Execution | The lock preserves deterministic execution. |
| No Non-Determinism | No lock introduces non-determinism. |
| Deterministic Identifiers | World identifiers are deterministic. |
| No Identifier Change | No lock changes identifiers after creation. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves deterministic execution | No exceptions. |
| No lock introduces non-determinism | No exceptions. |
| World identifiers are deterministic | Never change after creation. |
| No lock changes identifiers after creation | No exceptions. |
| No deterministic guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Deterministic guarantees preserve save snapshots. |
| Replay Compatibility | Deterministic guarantees are deterministic. |
| Migration Compatibility | Deterministic guarantees are additive. |
| Synchronization Compatibility | Deterministic guarantees are server-authoritative. |
| Event Bus Compatibility | Deterministic guarantees do not affect event ordering. |

---

### 15.11 Replay Guarantees

#### Purpose

The replay guarantees section defines the replay guarantees that the lock policy
preserves.

#### Scope

The replay guarantees apply to all world data that could affect replays.

#### Boundaries

The lock preserves replay compatibility. World data is not in snapshots. Replays do
not query world tables. No lock introduces non-determinism.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Replay Compatibility | The lock preserves replay compatibility. |
| No World Serialization | World data is not in snapshots. |
| No Replay Queries | Replays do not query world tables. |
| No Non-Determinism | No lock introduces non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves replay compatibility | No exceptions. |
| World data is not in snapshots | Except the world identifier. |
| Replays do not query world tables | Zero overhead. |
| No lock introduces non-determinism | No exceptions. |
| No replay guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay guarantees preserve save snapshots. |
| Replay Compatibility | Replay guarantees are deterministic. |
| Migration Compatibility | Replay guarantees are additive. |
| Synchronization Compatibility | Replay guarantees are server-authoritative. |
| Event Bus Compatibility | Replay guarantees do not affect event ordering. |

---

### 15.12 Migration Guarantees

#### Purpose

The migration guarantees section defines the migration guarantees that the lock
policy preserves.

#### Scope

The migration guarantees apply to all world migrations.

#### Boundaries

The lock preserves migration compatibility. Migrations are additive, forward-only,
and backward compatible. No lock allows destructive migrations.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Migration Compatibility | The lock preserves migration compatibility. |
| Additive | Migrations are additive. |
| Forward-Only | Migrations are forward-only. |
| Backward Compatible | Migrations are backward compatible. |
| No Destructive Migrations | No lock allows destructive migrations. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves migration compatibility | No exceptions. |
| Migrations are additive | No destructive operations. |
| Migrations are forward-only | No backward migration. |
| Migrations are backward compatible | No breaking existing data. |
| No lock allows destructive migrations | No exceptions. |
| No migration guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Migration guarantees preserve save snapshots. |
| Replay Compatibility | Migration guarantees are deterministic. |
| Migration Compatibility | Migrations are additive and forward-only. |
| Synchronization Compatibility | Migration guarantees are server-authoritative. |
| Event Bus Compatibility | Migration guarantees do not affect event ordering. |

---

### 15.13 Synchronization Guarantees

#### Purpose

The synchronization guarantees section defines the synchronization guarantees that
the lock policy preserves.

#### Scope

The synchronization guarantees apply to all world data that is synced.

#### Boundaries

The lock preserves synchronization compatibility. Sync is server-authoritative and
non-blocking. No lock introduces client-side authority. No lock corrupts data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Synchronization Compatibility | The lock preserves sync compatibility. |
| Server-Authoritative | Sync is server-authoritative. |
| Non-Blocking | Sync is non-blocking. |
| No Client-Side Authority | No lock introduces client-side authority. |
| No Corruption | No lock corrupts data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves synchronization compatibility | No exceptions. |
| Sync is server-authoritative | No exceptions. |
| Sync is non-blocking | No exceptions. |
| No lock introduces client-side authority | No exceptions. |
| No lock corrupts data | No exceptions. |
| No synchronization guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Synchronization guarantees preserve save snapshots. |
| Replay Compatibility | Synchronization guarantees are deterministic. |
| Migration Compatibility | Synchronization guarantees are additive. |
| Synchronization Compatibility | Sync is server-authoritative and non-blocking. |
| Event Bus Compatibility | Synchronization guarantees do not affect event ordering. |

---

### 15.14 Dependency Guarantees

#### Purpose

The dependency guarantees section defines the dependency guarantees that the lock
policy preserves.

#### Scope

The dependency guarantees apply to all dependencies of the World Layer.

#### Boundaries

The lock preserves dependency compatibility. The World Layer remains a DAG. No lock
creates a circular dependency. No lock removes a dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Dependency Compatibility | The lock preserves dependency compatibility. |
| DAG Preserved | The World Layer remains a DAG. |
| No Circular Dependencies | No lock creates a circular dependency. |
| No Removal | No lock removes a dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves dependency compatibility | No exceptions. |
| The World Layer remains a DAG | No circular dependencies. |
| No lock creates a circular dependency | No exceptions. |
| No lock removes a dependency | No exceptions. |
| No dependency guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Dependency guarantees preserve save snapshots. |
| Replay Compatibility | Dependency guarantees are deterministic. |
| Migration Compatibility | Dependency guarantees are additive. |
| Synchronization Compatibility | Dependency guarantees are server-authoritative. |
| Event Bus Compatibility | Dependency guarantees do not affect event ordering. |

---

### 15.15 Ownership Guarantees

#### Purpose

The ownership guarantees section defines the ownership guarantees that the lock
policy preserves.

#### Scope

The ownership guarantees apply to all 16 world tables and all world rows.

#### Boundaries

The lock preserves ownership. Every world row has a `user_id`. RLS enforces
ownership. No lock weakens RLS. No lock removes `user_id`.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Ownership Preserved | The lock preserves ownership. |
| User ID Required | Every world row has a `user_id`. |
| RLS Enforced | RLS enforces ownership. |
| No RLS Weakening | No lock weakens RLS. |
| No User ID Removal | No lock removes `user_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves ownership | No exceptions. |
| Every world row has a `user_id` | No exceptions. |
| RLS enforces ownership | Four policies per table. |
| No lock weakens RLS | No exceptions. |
| No lock removes `user_id` | No exceptions. |
| No ownership guarantee is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Ownership guarantees preserve save snapshots. |
| Replay Compatibility | Ownership guarantees are deterministic. |
| Migration Compatibility | Ownership guarantees are additive. |
| Synchronization Compatibility | Ownership guarantees are server-authoritative. |
| Event Bus Compatibility | Ownership guarantees do not affect event ordering. |

---

### 15.16 Permanent Restrictions

#### Purpose

The permanent restrictions section defines the restrictions that are permanent after
locking.

#### Scope

The permanent restrictions apply to the entire World Blueprint v1.0.

#### Boundaries

No locked rule is removed. No locked rule is weakened. No locked guarantee is
weakened. No locked table is removed. No locked column is removed. No locked
relationship is removed. No locked RLS policy is removed.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Removal | No locked rule is removed. |
| No Weakening | No locked rule is weakened. |
| No Guarantee Weakening | No locked guarantee is weakened. |
| No Table Removal | No locked table is removed. |
| No Column Removal | No locked column is removed. |
| No Relationship Removal | No locked relationship is removed. |
| No RLS Policy Removal | No locked RLS policy is removed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| No locked rule is removed | No exceptions. |
| No locked rule is weakened | No exceptions. |
| No locked guarantee is weakened | No exceptions. |
| No locked table is removed | No exceptions. |
| No locked column is removed | No exceptions. |
| No locked relationship is removed | No exceptions. |
| No locked RLS policy is removed | No exceptions. |
| No permanent restriction is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Permanent restrictions preserve save snapshots. |
| Replay Compatibility | Permanent restrictions are deterministic. |
| Migration Compatibility | Permanent restrictions are additive and forward-only. |
| Synchronization Compatibility | Permanent restrictions are server-authoritative. |
| Event Bus Compatibility | Permanent restrictions do not affect event ordering. |

---

### 15.17 Change Management Rules

#### Purpose

The change management rules section defines the rules for managing changes to the
blueprint after locking.

#### Scope

The change management rules apply to all changes after the blueprint is locked.

#### Boundaries

All changes require a new versioned blueprint. All changes are additive. All changes
are reviewed. All changes are approved. All changes are documented.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Versioned | All changes require a new versioned blueprint. |
| Additive | All changes are additive. |
| Reviewed | All changes are reviewed. |
| Approved | All changes are approved. |
| Documented | All changes are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All changes require a new versioned blueprint | No exceptions. |
| All changes are additive | No destructive changes. |
| All changes are reviewed | By the Peer Architect. |
| All changes are approved | By the Lead Architect. |
| All changes are documented | In the Changelog. |
| No change management rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Change management rules preserve save snapshots. |
| Replay Compatibility | Change management rules are deterministic. |
| Migration Compatibility | Change management rules are additive and forward-only. |
| Synchronization Compatibility | Change management rules are server-authoritative. |
| Event Bus Compatibility | Change management rules do not affect event ordering. |

---

### 15.18 Semantic Versioning Rules

#### Purpose

The semantic versioning rules section defines the semantic versioning rules for the
World Blueprint.

#### Scope

The semantic versioning rules apply to all versions of the World Blueprint.

#### Boundaries

The blueprint uses major.minor.patch versioning. Major version changes break
compatibility. Minor version changes add features. Patch version changes fix issues.
No version is removed.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Major.Minor.Patch | The blueprint uses major.minor.patch versioning. |
| Major Breaks Compatibility | Major version changes break compatibility. |
| Minor Adds Features | Minor version changes add features. |
| Patch Fixes Issues | Patch version changes fix issues. |
| No Removal | No version is removed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint uses major.minor.patch versioning | No exceptions. |
| Major version changes require a new blueprint | No exceptions. |
| Minor version changes are additive | No exceptions. |
| Patch version changes fix issues without adding features | No exceptions. |
| No version is removed | No exceptions. |
| No semantic versioning rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Semantic versioning rules preserve save snapshots. |
| Replay Compatibility | Semantic versioning rules are deterministic. |
| Migration Compatibility | Semantic versioning rules are additive and forward-only. |
| Synchronization Compatibility | Semantic versioning rules are server-authoritative. |
| Event Bus Compatibility | Semantic versioning rules do not affect event ordering. |

---

### 15.19 Documentation Requirements

#### Purpose

The documentation requirements section defines the documentation requirements for
the lock policy.

#### Scope

The documentation requirements apply to all documentation related to the World
Blueprint.

#### Boundaries

The blueprint is the single source of truth. The ERD is complete. The Schema.md is
complete. The Migration Log is complete. The Engine Dependency Graph is complete. All
documentation is locked with the blueprint.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Source of Truth | The blueprint is the single source of truth. |
| ERD Complete | The ERD is complete. |
| Schema Complete | The Schema.md is complete. |
| Migration Log Complete | The Migration Log is complete. |
| Dependency Graph Complete | The Engine Dependency Graph is complete. |
| Documentation Locked | All documentation is locked with the blueprint. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint is the single source of truth | No exceptions. |
| The ERD is complete | All tables and relationships. |
| The Schema.md is complete | All tables and columns. |
| The Migration Log is complete | All migrations logged. |
| The Engine Dependency Graph is complete | All dependencies. |
| All documentation is locked with the blueprint | No exceptions. |
| No documentation requirement is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Documentation requirements preserve save snapshots. |
| Replay Compatibility | Documentation requirements are deterministic. |
| Migration Compatibility | Documentation requirements are additive and forward-only. |
| Synchronization Compatibility | Documentation requirements are server-authoritative. |
| Event Bus Compatibility | Documentation requirements do not affect event ordering. |

---

### 15.20 Future Revision Procedures

#### Purpose

The future revision procedures section defines the procedures for future revisions
of the World Blueprint.

#### Scope

The future revision procedures apply to all future versions of the World Blueprint.

#### Boundaries

All future revisions require a new versioned blueprint. All future revisions are
additive. All future revisions preserve all locked guarantees. All future revisions
are reviewed and approved.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Versioned | All future revisions require a new versioned blueprint. |
| Additive | All future revisions are additive. |
| Guarantees Preserved | All future revisions preserve all locked guarantees. |
| Reviewed | All future revisions are reviewed. |
| Approved | All future revisions are approved. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All future revisions require a new versioned blueprint | No exceptions. |
| All future revisions are additive | No destructive revisions. |
| All future revisions preserve all locked guarantees | No exceptions. |
| All future revisions are reviewed | By the Peer Architect. |
| All future revisions are approved | By the Lead Architect. |
| All future revisions are documented | In the Changelog. |
| No future revision procedure rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Future revision procedures preserve save snapshots. |
| Replay Compatibility | Future revision procedures are deterministic. |
| Migration Compatibility | Future revision procedures are additive and forward-only. |
| Synchronization Compatibility | Future revision procedures are server-authoritative. |
| Event Bus Compatibility | Future revision procedures do not affect event ordering. |

---

## 16. Visual Prototype

### Overview

This chapter defines the visual prototype for the World Layer management interface.
It defines the panel philosophy, desktop layout, tablet layout, mobile layout,
navigation hierarchy, typography rules, accessibility rules, theme rules, animation
rules, responsiveness rules, and 16 visual panels.

This chapter has 10 rule sections and 16 visual panel definitions. Every rule
section defines a visual rule. Every panel includes purpose, components, layout,
navigation, boundaries, and permanent rules.

---

### 16.1 Panel Philosophy

#### Purpose

The panel philosophy defines the permanent principles that govern the visual
prototype for the World Layer management interface.

#### Scope

The panel philosophy applies to all 16 visual panels and all future panels.

#### Boundaries

The visual prototype is a management interface for the World Layer. The visual
prototype does not define gameplay UI. The visual prototype is documentation only —
no implementation code. The visual prototype follows the UI Rules v1.0.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Management Interface | The visual prototype is a management interface. |
| No Gameplay UI | The visual prototype does not define gameplay UI. |
| Documentation Only | The visual prototype is documentation only. |
| UI Rules Compliance | The visual prototype follows the UI Rules v1.0. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The visual prototype is a management interface for the World Layer | No exceptions. |
| The visual prototype does not define gameplay UI | No exceptions. |
| The visual prototype is documentation only | No implementation code. |
| The visual prototype follows the UI Rules v1.0 | No exceptions. |
| No panel philosophy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Panel philosophy does not affect save snapshots. |
| Replay Compatibility | Panel philosophy is deterministic. |
| Migration Compatibility | Panel philosophy is additive. |
| Synchronization Compatibility | Panel philosophy is server-authoritative. |
| Event Bus Compatibility | Panel philosophy does not affect event ordering. |

---

### 16.2 Desktop Layout

#### Purpose

The desktop layout section defines the layout of the visual prototype on desktop
screens.

#### Scope

The desktop layout applies to screens 1280px and wider.

#### Boundaries

The desktop layout uses a sidebar navigation. The desktop layout uses a multi-column
content area. The desktop layout uses a top bar with breadcrumbs. The desktop layout
supports split views for relationship panels.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Sidebar Navigation | The desktop layout uses a sidebar. |
| Multi-Column Content | The desktop layout uses multi-column content. |
| Top Bar with Breadcrumbs | The desktop layout uses a top bar. |
| Split Views | The desktop layout supports split views. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The desktop layout uses a sidebar navigation | For all 16 panels. |
| The desktop layout uses a multi-column content area | For data-dense panels. |
| The desktop layout uses a top bar with breadcrumbs | For navigation context. |
| The desktop layout supports split views | For relationship panels. |
| No desktop layout rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Desktop layout does not affect save snapshots. |
| Replay Compatibility | Desktop layout is deterministic. |
| Migration Compatibility | Desktop layout is additive. |
| Synchronization Compatibility | Desktop layout is server-authoritative. |
| Event Bus Compatibility | Desktop layout does not affect event ordering. |

---

### 16.3 Tablet Layout

#### Purpose

The tablet layout section defines the layout of the visual prototype on tablet
screens.

#### Scope

The tablet layout applies to screens 768px to 1279px.

#### Boundaries

The tablet layout uses a collapsible sidebar. The tablet layout uses a single-column
content area. The tablet layout uses a top bar with breadcrumbs. The tablet layout
uses tabbed views for relationships.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Collapsible Sidebar | The tablet layout uses a collapsible sidebar. |
| Single-Column Content | The tablet layout uses single-column content. |
| Top Bar with Breadcrumbs | The tablet layout uses a top bar. |
| Tabbed Views | The tablet layout uses tabbed views for relationships. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The tablet layout uses a collapsible sidebar | For space efficiency. |
| The tablet layout uses a single-column content area | For readability. |
| The tablet layout uses a top bar with breadcrumbs | For navigation context. |
| The tablet layout uses tabbed views for relationships | For space efficiency. |
| No tablet layout rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Tablet layout does not affect save snapshots. |
| Replay Compatibility | Tablet layout is deterministic. |
| Migration Compatibility | Tablet layout is additive. |
| Synchronization Compatibility | Tablet layout is server-authoritative. |
| Event Bus Compatibility | Tablet layout does not affect event ordering. |

---

### 16.4 Mobile Layout

#### Purpose

The mobile layout section defines the layout of the visual prototype on mobile
screens.

#### Scope

The mobile layout applies to screens narrower than 768px.

#### Boundaries

The mobile layout uses a bottom navigation bar. The mobile layout uses a single-column
content area. The mobile layout uses a compact top bar. The mobile layout uses stacked
views for relationships.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Bottom Navigation | The mobile layout uses a bottom navigation bar. |
| Single-Column Content | The mobile layout uses single-column content. |
| Compact Top Bar | The mobile layout uses a compact top bar. |
| Stacked Views | The mobile layout uses stacked views for relationships. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The mobile layout uses a bottom navigation bar | For thumb reachability. |
| The mobile layout uses a single-column content area | For readability. |
| The mobile layout uses a compact top bar | For space efficiency. |
| The mobile layout uses stacked views for relationships | For space efficiency. |
| No mobile layout rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Mobile layout does not affect save snapshots. |
| Replay Compatibility | Mobile layout is deterministic. |
| Migration Compatibility | Mobile layout is additive. |
| Synchronization Compatibility | Mobile layout is server-authoritative. |
| Event Bus Compatibility | Mobile layout does not affect event ordering. |

---

### 16.5 Navigation Hierarchy

#### Purpose

The navigation hierarchy section defines the navigation hierarchy for the visual
prototype.

#### Scope

The navigation hierarchy applies to all 16 visual panels.

#### Boundaries

The navigation hierarchy follows the world structure: Worlds > Continents >
Regions > Kingdoms > Cities > Villages. The navigation hierarchy includes standalone
panels: Roads, Landmarks, Dungeons, Climates, Ecosystems, Factions, Religions,
World History, Major World Events, Locations. The navigation hierarchy uses
breadcrumbs for context.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World Structure | The navigation hierarchy follows the world structure. |
| Standalone Panels | The navigation hierarchy includes standalone panels. |
| Breadcrumbs | The navigation hierarchy uses breadcrumbs. |
| Consistent | The navigation hierarchy is consistent across all layouts. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The navigation hierarchy follows the world structure | Worlds > Continents > Regions > Kingdoms > Cities > Villages. |
| The navigation hierarchy includes standalone panels | Roads, Landmarks, Dungeons, Climates, Ecosystems, Factions, Religions, World History, Major World Events, Locations. |
| The navigation hierarchy uses breadcrumbs | For navigation context. |
| The navigation hierarchy is consistent across all layouts | Desktop, tablet, mobile. |
| No navigation hierarchy rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Navigation hierarchy does not affect save snapshots. |
| Replay Compatibility | Navigation hierarchy is deterministic. |
| Migration Compatibility | Navigation hierarchy is additive. |
| Synchronization Compatibility | Navigation hierarchy is server-authoritative. |
| Event Bus Compatibility | Navigation hierarchy does not affect event ordering. |

---

### 16.6 Typography Rules

#### Purpose

The typography rules section defines the typography rules for the visual prototype.

#### Scope

The typography rules apply to all 16 visual panels.

#### Boundaries

The visual prototype uses a maximum of 3 font weights. Body text uses 150% line
spacing. Headings use 120% line spacing. Font colors are always readable on all
backgrounds.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| 3 Font Weights | The visual prototype uses a maximum of 3 font weights. |
| 150% Body Line Spacing | Body text uses 150% line spacing. |
| 120% Heading Line Spacing | Headings use 120% line spacing. |
| Readable | Font colors are always readable on all backgrounds. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The visual prototype uses a maximum of 3 font weights | No exceptions. |
| Body text uses 150% line spacing | No exceptions. |
| Headings use 120% line spacing | No exceptions. |
| Font colors are always readable on all backgrounds | Sufficient contrast ratios. |
| No typography rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Typography rules do not affect save snapshots. |
| Replay Compatibility | Typography rules are deterministic. |
| Migration Compatibility | Typography rules are additive. |
| Synchronization Compatibility | Typography rules are server-authoritative. |
| Event Bus Compatibility | Typography rules do not affect event ordering. |

---

### 16.7 Accessibility Rules

#### Purpose

The accessibility rules section defines the accessibility rules for the visual
prototype.

#### Scope

The accessibility rules apply to all 16 visual panels.

#### Boundaries

All panels are keyboard navigable. All panels have ARIA labels. All panels have
sufficient color contrast. All panels have focus indicators.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Keyboard Navigable | All panels are keyboard navigable. |
| ARIA Labels | All panels have ARIA labels. |
| Sufficient Contrast | All panels have sufficient color contrast. |
| Focus Indicators | All panels have focus indicators. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All panels are keyboard navigable | No exceptions. |
| All panels have ARIA labels | No exceptions. |
| All panels have sufficient color contrast | WCAG AA or better. |
| All panels have focus indicators | No exceptions. |
| No accessibility rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Accessibility rules do not affect save snapshots. |
| Replay Compatibility | Accessibility rules are deterministic. |
| Migration Compatibility | Accessibility rules are additive. |
| Synchronization Compatibility | Accessibility rules are server-authoritative. |
| Event Bus Compatibility | Accessibility rules do not affect event ordering. |

---

### 16.8 Theme Rules

#### Purpose

The theme rules section defines the theme rules for the visual prototype.

#### Scope

The theme rules apply to all 16 visual panels.

#### Boundaries

The visual prototype uses a comprehensive color system with at least 6 color ramps.
The visual prototype uses an 8px spacing system. The visual prototype uses neutral
tones, blues, greens, or other professional colors. No purple, indigo, or violet hues
unless explicitly requested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| 6 Color Ramps | The visual prototype uses at least 6 color ramps. |
| 8px Spacing | The visual prototype uses an 8px spacing system. |
| Professional Colors | The visual prototype uses professional colors. |
| No Purple | No purple, indigo, or violet hues unless explicitly requested. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The visual prototype uses at least 6 color ramps | Primary, secondary, accent, success, warning, error. |
| The visual prototype uses an 8px spacing system | No exceptions. |
| The visual prototype uses professional colors | Neutral tones, blues, greens. |
| No purple, indigo, or violet hues unless explicitly requested | No exceptions. |
| No theme rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Theme rules do not affect save snapshots. |
| Replay Compatibility | Theme rules are deterministic. |
| Migration Compatibility | Theme rules are additive. |
| Synchronization Compatibility | Theme rules are server-authoritative. |
| Event Bus Compatibility | Theme rules do not affect event ordering. |

---

### 16.9 Animation Rules

#### Purpose

The animation rules section defines the animation rules for the visual prototype.

#### Scope

The animation rules apply to all 16 visual panels.

#### Boundaries

Animations are subtle and purposeful. Animations provide visual feedback. Animations
do not block gameplay. Animations are deterministic.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Subtle | Animations are subtle and purposeful. |
| Visual Feedback | Animations provide visual feedback. |
| Non-Blocking | Animations do not block gameplay. |
| Deterministic | Animations are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Animations are subtle and purposeful | No excessive animations. |
| Animations provide visual feedback | Hover states, transitions. |
| Animations do not block gameplay | Non-blocking. |
| Animations are deterministic | No non-determinism. |
| No animation rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Animation rules do not affect save snapshots. |
| Replay Compatibility | Animation rules are deterministic. |
| Migration Compatibility | Animation rules are additive. |
| Synchronization Compatibility | Animation rules are server-authoritative. |
| Event Bus Compatibility | Animation rules do not affect event ordering. |

---

### 16.10 Responsiveness Rules

#### Purpose

The responsiveness rules section defines the responsiveness rules for the visual
prototype.

#### Scope

The responsiveness rules apply to all 16 visual panels across desktop, tablet, and
mobile layouts.

#### Boundaries

The visual prototype is responsive across all viewport sizes. The visual prototype
uses appropriate breakpoints. The visual prototype maintains visual hierarchy across
all sizes. The visual prototype maintains readability across all sizes.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Responsive | The visual prototype is responsive across all viewport sizes. |
| Breakpoints | The visual prototype uses appropriate breakpoints. |
| Visual Hierarchy | The visual prototype maintains visual hierarchy. |
| Readability | The visual prototype maintains readability. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The visual prototype is responsive across all viewport sizes | Mobile to desktop. |
| The visual prototype uses appropriate breakpoints | 768px, 1280px. |
| The visual prototype maintains visual hierarchy across all sizes | No exceptions. |
| The visual prototype maintains readability across all sizes | No exceptions. |
| No responsiveness rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Responsiveness rules do not affect save snapshots. |
| Replay Compatibility | Responsiveness rules are deterministic. |
| Migration Compatibility | Responsiveness rules are additive. |
| Synchronization Compatibility | Responsiveness rules are server-authoritative. |
| Event Bus Compatibility | Responsiveness rules do not affect event ordering. |

---

### Visual Panels

### Panel 1 — Worlds Panel

#### Purpose

The Worlds Panel displays the list of all worlds owned by the current user and
provides CRUD operations for world records.

#### Components

| Component | Description |
|-----------|-------------|
| World List | A paginated table of all worlds with columns: name, status, created date, last modified. |
| World Card | A card view for each world showing name, description, status, and thumbnail. |
| Create World Button | A button to open the Create World form. |
| World Search | A search bar to filter worlds by name. |
| World Filter | A filter dropdown to filter by status. |
| Pagination Controls | Controls to navigate pages of worlds. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation on the left, world list in a multi-column content area with card grid. |
| Tablet | Collapsible sidebar, single-column world list with card layout. |
| Mobile | Bottom navigation, single-column world list with stacked cards. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessible from the sidebar navigation as the top-level item. |
| Breadcrumb | "Worlds" displayed in the top bar breadcrumb. |
| Drill-Down | Clicking a world navigates to the World Detail Panel. |
| Cross-Panel | From World Detail, navigate to Continents Panel or World History Panel. |

#### Boundaries

- The Worlds Panel displays only worlds owned by the current user.
- The Worlds Panel does not display world data from other users.
- The Worlds Panel does not manage authentication.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Worlds Panel displays only worlds owned by the current user | RLS enforced. |
| The Worlds Panel supports CRUD operations | Create, read, update, delete. |
| The Worlds Panel uses pagination | No unbounded result sets. |
| No Worlds Panel rule is removed after locking | Permanent. |

---

### Panel 2 — World Detail Panel

#### Purpose

The World Detail Panel displays the full details of a single world and provides
edit operations for world metadata.

#### Components

| Component | Description |
|-----------|-------------|
| World Header | Displays the world name, status, and description. |
| World Metadata | Displays created date, last modified, owner. |
| Edit World Button | A button to open the Edit World form. |
| Delete World Button | A button to delete the world (with confirmation). |
| Relationship Tabs | Tabs linking to Continents, World History, Major World Events, Factions, Religions. |
| World Statistics | Displays counts of continents, regions, kingdoms, cities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, world header at top, metadata in left column, relationship tabs in right column. |
| Tablet | Collapsible sidebar, world header at top, metadata and tabs in single column. |
| Mobile | Bottom navigation, world header, metadata, and tabs stacked. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed by clicking a world in the Worlds Panel. |
| Breadcrumb | "Worlds > [World Name]" displayed in the top bar. |
| Back | Back button returns to the Worlds Panel. |
| Cross-Panel | Relationship tabs navigate to Continents, World History, Major World Events, Factions, Religions panels. |

#### Boundaries

- The World Detail Panel displays only worlds owned by the current user.
- The World Detail Panel does not display world data from other users.
- Deletion requires confirmation and preserves the previous valid state.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World Detail Panel displays only worlds owned by the current user | RLS enforced. |
| Deletion requires confirmation | No accidental deletion. |
| The World Detail Panel preserves the previous valid state | No data destruction. |
| No World Detail Panel rule is removed after locking | Permanent. |

---

### Panel 3 — Continents Panel

#### Purpose

The Continents Panel displays the list of continents within a world and provides
CRUD operations for continent records.

#### Components

| Component | Description |
|-----------|-------------|
| Continent List | A paginated table of continents with columns: name, climate, area, created date. |
| Continent Card | A card view for each continent showing name, description, and climate. |
| Create Continent Button | A button to open the Create Continent form. |
| Continent Search | A search bar to filter continents by name. |
| Pagination Controls | Controls to navigate pages of continents. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, continent list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column continent list. |
| Mobile | Bottom navigation, single-column continent list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Continents" displayed in the top bar. |
| Drill-Down | Clicking a continent navigates to the Continent Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Continents Panel displays only continents within the selected world.
- The Continents Panel does not display continents from other worlds.
- The Continents Panel does not display continents from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Continents Panel displays only continents within the selected world | Scoped by `world_id`. |
| The Continents Panel supports CRUD operations | Create, read, update, delete. |
| The Continents Panel uses pagination | No unbounded result sets. |
| No Continents Panel rule is removed after locking | Permanent. |

---

### Panel 4 — Regions Panel

#### Purpose

The Regions Panel displays the list of regions within a continent and provides CRUD
operations for region records.

#### Components

| Component | Description |
|-----------|-------------|
| Region List | A paginated table of regions with columns: name, type, area, population. |
| Region Card | A card view for each region showing name, description, and type. |
| Create Region Button | A button to open the Create Region form. |
| Region Search | A search bar to filter regions by name. |
| Pagination Controls | Controls to navigate pages of regions. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, region list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column region list. |
| Mobile | Bottom navigation, single-column region list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Continent Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World] > Continents > [Continent] > Regions" in the top bar. |
| Drill-Down | Clicking a region navigates to the Region Detail Panel. |
| Back | Back button returns to the Continent Detail Panel. |

#### Boundaries

- The Regions Panel displays only regions within the selected continent.
- The Regions Panel does not display regions from other continents.
- The Regions Panel does not display regions from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Regions Panel displays only regions within the selected continent | Scoped by `continent_id`. |
| The Regions Panel supports CRUD operations | Create, read, update, delete. |
| The Regions Panel uses pagination | No unbounded result sets. |
| No Regions Panel rule is removed after locking | Permanent. |

---

### Panel 5 — Kingdoms Panel

#### Purpose

The Kingdoms Panel displays the list of kingdoms within a region and provides CRUD
operations for kingdom records.

#### Components

| Component | Description |
|-----------|-------------|
| Kingdom List | A paginated table of kingdoms with columns: name, government type, capital, population. |
| Kingdom Card | A card view for each kingdom showing name, description, and government type. |
| Create Kingdom Button | A button to open the Create Kingdom form. |
| Kingdom Search | A search bar to filter kingdoms by name. |
| Pagination Controls | Controls to navigate pages of kingdoms. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, kingdom list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column kingdom list. |
| Mobile | Bottom navigation, single-column kingdom list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Region Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World] > [Continent] > [Region] > Kingdoms" in the top bar. |
| Drill-Down | Clicking a kingdom navigates to the Kingdom Detail Panel. |
| Back | Back button returns to the Region Detail Panel. |

#### Boundaries

- The Kingdoms Panel displays only kingdoms within the selected region.
- The Kingdoms Panel does not display kingdoms from other regions.
- The Kingdoms Panel does not display kingdoms from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Kingdoms Panel displays only kingdoms within the selected region | Scoped by `region_id`. |
| The Kingdoms Panel supports CRUD operations | Create, read, update, delete. |
| The Kingdoms Panel uses pagination | No unbounded result sets. |
| No Kingdoms Panel rule is removed after locking | Permanent. |

---

### Panel 6 — Cities Panel

#### Purpose

The Cities Panel displays the list of cities within a kingdom and provides CRUD
operations for city records.

#### Components

| Component | Description |
|-----------|-------------|
| City List | A paginated table of cities with columns: name, population, type, founded date. |
| City Card | A card view for each city showing name, description, and population. |
| Create City Button | A button to open the Create City form. |
| City Search | A search bar to filter cities by name. |
| Pagination Controls | Controls to navigate pages of cities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, city list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column city list. |
| Mobile | Bottom navigation, single-column city list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Kingdom Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World] > [Continent] > [Region] > [Kingdom] > Cities" in the top bar. |
| Drill-Down | Clicking a city navigates to the City Detail Panel. |
| Back | Back button returns to the Kingdom Detail Panel. |

#### Boundaries

- The Cities Panel displays only cities within the selected kingdom.
- The Cities Panel does not display cities from other kingdoms.
- The Cities Panel does not display cities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Cities Panel displays only cities within the selected kingdom | Scoped by `kingdom_id`. |
| The Cities Panel supports CRUD operations | Create, read, update, delete. |
| The Cities Panel uses pagination | No unbounded result sets. |
| No Cities Panel rule is removed after locking | Permanent. |

---

### Panel 7 — Villages Panel

#### Purpose

The Villages Panel displays the list of villages within a kingdom and provides CRUD
operations for village records.

#### Components

| Component | Description |
|-----------|-------------|
| Village List | A paginated table of villages with columns: name, population, type, founded date. |
| Village Card | A card view for each village showing name, description, and population. |
| Create Village Button | A button to open the Create Village form. |
| Village Search | A search bar to filter villages by name. |
| Pagination Controls | Controls to navigate pages of villages. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, village list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column village list. |
| Mobile | Bottom navigation, single-column village list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Kingdom Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World] > [Continent] > [Region] > [Kingdom] > Villages" in the top bar. |
| Drill-Down | Clicking a village navigates to the Village Detail Panel. |
| Back | Back button returns to the Kingdom Detail Panel. |

#### Boundaries

- The Villages Panel displays only villages within the selected kingdom.
- The Villages Panel does not display villages from other kingdoms.
- The Villages Panel does not display villages from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Villages Panel displays only villages within the selected kingdom | Scoped by `kingdom_id`. |
| The Villages Panel supports CRUD operations | Create, read, update, delete. |
| The Villages Panel uses pagination | No unbounded result sets. |
| No Villages Panel rule is removed after locking | Permanent. |

---

### Panel 8 — Roads Panel

#### Purpose

The Roads Panel displays the list of roads within a world and provides CRUD operations
for road records.

#### Components

| Component | Description |
|-----------|-------------|
| Road List | A paginated table of roads with columns: name, type, length, connected locations. |
| Road Card | A card view for each road showing name, description, and type. |
| Create Road Button | A button to open the Create Road form. |
| Road Search | A search bar to filter roads by name. |
| Pagination Controls | Controls to navigate pages of roads. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, road list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column road list. |
| Mobile | Bottom navigation, single-column road list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Roads" displayed in the top bar. |
| Drill-Down | Clicking a road navigates to the Road Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Roads Panel displays only roads within the selected world.
- The Roads Panel does not display roads from other worlds.
- The Roads Panel does not display roads from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Roads Panel displays only roads within the selected world | Scoped by `world_id`. |
| The Roads Panel supports CRUD operations | Create, read, update, delete. |
| The Roads Panel uses pagination | No unbounded result sets. |
| No Roads Panel rule is removed after locking | Permanent. |

---

### Panel 9 — Landmarks Panel

#### Purpose

The Landmarks Panel displays the list of landmarks within a world and provides CRUD
operations for landmark records.

#### Components

| Component | Description |
|-----------|-------------|
| Landmark List | A paginated table of landmarks with columns: name, type, description, location. |
| Landmark Card | A card view for each landmark showing name, description, and type. |
| Create Landmark Button | A button to open the Create Landmark form. |
| Landmark Search | A search bar to filter landmarks by name. |
| Pagination Controls | Controls to navigate pages of landmarks. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, landmark list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column landmark list. |
| Mobile | Bottom navigation, single-column landmark list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Landmarks" displayed in the top bar. |
| Drill-Down | Clicking a landmark navigates to the Landmark Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Landmarks Panel displays only landmarks within the selected world.
- The Landmarks Panel does not display landmarks from other worlds.
- The Landmarks Panel does not display landmarks from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Landmarks Panel displays only landmarks within the selected world | Scoped by `world_id`. |
| The Landmarks Panel supports CRUD operations | Create, read, update, delete. |
| The Landmarks Panel uses pagination | No unbounded result sets. |
| No Landmarks Panel rule is removed after locking | Permanent. |

---

### Panel 10 — Dungeons Panel

#### Purpose

The Dungeons Panel displays the list of dungeons within a world and provides CRUD
operations for dungeon records.

#### Components

| Component | Description |
|-----------|-------------|
| Dungeon List | A paginated table of dungeons with columns: name, type, difficulty, location. |
| Dungeon Card | A card view for each dungeon showing name, description, and difficulty. |
| Create Dungeon Button | A button to open the Create Dungeon form. |
| Dungeon Search | A search bar to filter dungeons by name. |
| Pagination Controls | Controls to navigate pages of dungeons. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, dungeon list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column dungeon list. |
| Mobile | Bottom navigation, single-column dungeon list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Dungeons" displayed in the top bar. |
| Drill-Down | Clicking a dungeon navigates to the Dungeon Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Dungeons Panel displays only dungeons within the selected world.
- The Dungeons Panel does not display dungeons from other worlds.
- The Dungeons Panel does not display dungeons from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Dungeons Panel displays only dungeons within the selected world | Scoped by `world_id`. |
| The Dungeons Panel supports CRUD operations | Create, read, update, delete. |
| The Dungeons Panel uses pagination | No unbounded result sets. |
| No Dungeons Panel rule is removed after locking | Permanent. |

---

### Panel 11 — Climates Panel

#### Purpose

The Climates Panel displays the list of climates within a world and provides CRUD
operations for climate records.

#### Components

| Component | Description |
|-----------|-------------|
| Climate List | A paginated table of climates with columns: name, temperature range, precipitation, season. |
| Climate Card | A card view for each climate showing name, description, and temperature range. |
| Create Climate Button | A button to open the Create Climate form. |
| Climate Search | A search bar to filter climates by name. |
| Pagination Controls | Controls to navigate pages of climates. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, climate list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column climate list. |
| Mobile | Bottom navigation, single-column climate list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Climates" displayed in the top bar. |
| Drill-Down | Clicking a climate navigates to the Climate Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Climates Panel displays only climates within the selected world.
- The Climates Panel does not display climates from other worlds.
- The Climates Panel does not display climates from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Climates Panel displays only climates within the selected world | Scoped by `world_id`. |
| The Climates Panel supports CRUD operations | Create, read, update, delete. |
| The Climates Panel uses pagination | No unbounded result sets. |
| No Climates Panel rule is removed after locking | Permanent. |

---

### Panel 12 — Ecosystems Panel

#### Purpose

The Ecosystems Panel displays the list of ecosystems within a world and provides
CRUD operations for ecosystem records.

#### Components

| Component | Description |
|-----------|-------------|
| Ecosystem List | A paginated table of ecosystems with columns: name, type, species count, climate. |
| Ecosystem Card | A card view for each ecosystem showing name, description, and type. |
| Create Ecosystem Button | A button to open the Create Ecosystem form. |
| Ecosystem Search | A search bar to filter ecosystems by name. |
| Pagination Controls | Controls to navigate pages of ecosystems. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, ecosystem list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column ecosystem list. |
| Mobile | Bottom navigation, single-column ecosystem list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Ecosystems" displayed in the top bar. |
| Drill-Down | Clicking an ecosystem navigates to the Ecosystem Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Ecosystems Panel displays only ecosystems within the selected world.
- The Ecosystems Panel does not display ecosystems from other worlds.
- The Ecosystems Panel does not display ecosystems from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Ecosystems Panel displays only ecosystems within the selected world | Scoped by `world_id`. |
| The Ecosystems Panel supports CRUD operations | Create, read, update, delete. |
| The Ecosystems Panel uses pagination | No unbounded result sets. |
| No Ecosystems Panel rule is removed after locking | Permanent. |

---

### Panel 13 — Factions Panel

#### Purpose

The Factions Panel displays the list of factions within a world and provides CRUD
operations for faction records.

#### Components

| Component | Description |
|-----------|-------------|
| Faction List | A paginated table of factions with columns: name, type, alignment, member count. |
| Faction Card | A card view for each faction showing name, description, and alignment. |
| Create Faction Button | A button to open the Create Faction form. |
| Faction Search | A search bar to filter factions by name. |
| Faction Filter | A filter dropdown to filter by type or alignment. |
| Pagination Controls | Controls to navigate pages of factions. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, faction list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column faction list. |
| Mobile | Bottom navigation, single-column faction list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Factions" displayed in the top bar. |
| Drill-Down | Clicking a faction navigates to the Faction Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Factions Panel displays only factions within the selected world.
- The Factions Panel does not display factions from other worlds.
- The Factions Panel does not display factions from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Factions Panel displays only factions within the selected world | Scoped by `world_id`. |
| The Factions Panel supports CRUD operations | Create, read, update, delete. |
| The Factions Panel uses pagination | No unbounded result sets. |
| No Factions Panel rule is removed after locking | Permanent. |

---

### Panel 14 — Religions Panel

#### Purpose

The Religions Panel displays the list of religions within a world and provides CRUD
operations for religion records.

#### Components

| Component | Description |
|-----------|-------------|
| Religion List | A paginated table of religions with columns: name, type, deity, follower count. |
| Religion Card | A card view for each religion showing name, description, and deity. |
| Create Religion Button | A button to open the Create Religion form. |
| Religion Search | A search bar to filter religions by name. |
| Pagination Controls | Controls to navigate pages of religions. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, religion list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column religion list. |
| Mobile | Bottom navigation, single-column religion list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Religions" displayed in the top bar. |
| Drill-Down | Clicking a religion navigates to the Religion Detail Panel. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Religions Panel displays only religions within the selected world.
- The Religions Panel does not display religions from other worlds.
- The Religions Panel does not display religions from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Religions Panel displays only religions within the selected world | Scoped by `world_id`. |
| The Religions Panel supports CRUD operations | Create, read, update, delete. |
| The Religions Panel uses pagination | No unbounded result sets. |
| No Religions Panel rule is removed after locking | Permanent. |

---

### Panel 15 — World History Panel

#### Purpose

The World History Panel displays the chronological history of events within a world
and provides read and create operations for history records.

#### Components

| Component | Description |
|-----------|-------------|
| History Timeline | A vertical timeline of world events with columns: date, event type, description. |
| History List | A paginated table of history events with columns: date, event type, description. |
| Create Event Button | A button to open the Create History Event form. |
| History Search | A search bar to filter events by description. |
| History Filter | A filter dropdown to filter by event type or date range. |
| Pagination Controls | Controls to navigate pages of history events. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, history timeline in left column, history list in right column. |
| Tablet | Collapsible sidebar, timeline and list in tabbed views. |
| Mobile | Bottom navigation, timeline and list in stacked views. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > World History" displayed in the top bar. |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The World History Panel displays only history within the selected world.
- The World History Panel does not display history from other worlds.
- The World History Panel does not display history from other users.
- History events are append-only — no editing or deletion of existing events.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The World History Panel displays only history within the selected world | Scoped by `world_id`. |
| History events are append-only | No editing or deletion. |
| The World History Panel uses pagination | No unbounded result sets. |
| No World History Panel rule is removed after locking | Permanent. |

---

### Panel 16 — Locations Panel

#### Purpose

The Locations Panel displays all locations within a world — cities, villages,
landmarks, dungeons — in a unified view and provides read operations with navigation
to detail panels.

#### Components

| Component | Description |
|-----------|-------------|
| Location Map | A visual map showing all locations within the world. |
| Location List | A paginated table of all locations with columns: name, type, parent, coordinates. |
| Location Search | A search bar to filter locations by name. |
| Location Filter | A filter dropdown to filter by location type. |
| Pagination Controls | Controls to navigate pages of locations. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, location map in left column, location list in right column. |
| Tablet | Collapsible sidebar, map and list in tabbed views. |
| Mobile | Bottom navigation, map and list in stacked views. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the World Detail Panel relationship tabs. |
| Breadcrumb | "Worlds > [World Name] > Locations" displayed in the top bar. |
| Drill-Down | Clicking a location navigates to the corresponding detail panel (City, Village, Landmark, Dungeon). |
| Back | Back button returns to the World Detail Panel. |

#### Boundaries

- The Locations Panel displays only locations within the selected world.
- The Locations Panel does not display locations from other worlds.
- The Locations Panel does not display locations from other users.
- The Locations Panel is read-only — no direct CRUD operations.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Locations Panel displays only locations within the selected world | Scoped by `world_id`. |
| The Locations Panel is read-only | No direct CRUD operations. |
| The Locations Panel uses pagination | No unbounded result sets. |
| No Locations Panel rule is removed after locking | Permanent. |

---

## Final Lock Procedure

### Lock Verification

| Check | Status |
|-------|--------|
| All 16 chapters authored | PASS |
| Chapter numbering sequential (1–16) | PASS |
| No gaps in chapter numbering | PASS |
| Ownership consistency preserved | PASS |
| Dependency consistency preserved | PASS |
| Deterministic execution preserved | PASS |
| Replay compatibility preserved | PASS |
| Migration compatibility preserved | PASS |
| Synchronization compatibility preserved | PASS |
| Snapshot compatibility preserved | PASS |
| Save compatibility preserved | PASS |
| Event ordering consistency preserved | PASS |
| All 10 cross-cutting guarantees preserved | PASS |
| All 12 completion checklist sections defined | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Blueprint documentation only | PASS |
| Build passes | PASS |

### Lock Decision

| Field | Value |
|-------|-------|
| Blueprint | World Blueprint v1.0 |
| Version | v1.0 |
| Lock Status | LOCKED |
| Lock Date | 2026-08-03 |
| Locked By | Lead Database Architect |
| Approved By | Lead Architect |
| Reviewed By | Peer Architect |
| Chapters Locked | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 |
| Permanent Rules Locked | All permanent rules in all 16 chapters are locked. |
| Guarantees Locked | All 10 cross-cutting guarantees are locked. |
| Compatibility Rules Locked | All compatibility rules in all 16 chapters are locked. |

### Lock Statement

The World Blueprint v1.0 is hereby LOCKED. All 16 chapters are complete and
verified. All 10 cross-cutting guarantees are preserved. All permanent rules,
compatibility rules, and acceptance criteria are locked. No locked rule may be
removed or weakened. All future changes require a new versioned blueprint. The
blueprint is the single source of truth for the World Layer.

---

## Sprint 1.2.2.6 Review

### Sprint Summary

**Sprint:** 1.2.2.6 — World Blueprint v1.0 (Chapters 15–16, Final Lock)
**Status:** COMPLETE
**Date:** 2026-08-03

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 15 | Lock Policy | 20 sections: lock philosophy, lock requirements, modification procedure, exception procedure, unlock procedure, review procedure, approval procedure, versioning strategy, compatibility guarantees, deterministic guarantees, replay guarantees, migration guarantees, synchronization guarantees, dependency guarantees, ownership guarantees, permanent restrictions, change management rules, semantic versioning rules, documentation requirements, future revision procedures. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 16 | Visual Prototype | 10 rule sections: panel philosophy, desktop layout, tablet layout, mobile layout, navigation hierarchy, typography rules, accessibility rules, theme rules, animation rules, responsiveness rules. 16 visual panels: Worlds, World Detail, Continents, Regions, Kingdoms, Cities, Villages, Roads, Landmarks, Dungeons, Climates, Ecosystems, Factions, Religions, World History, Locations. Each panel with purpose, components, layout, navigation, boundaries, permanent rules. |

### Final Lock

| Check | Result |
|-------|--------|
| All 16 chapters authored | PASS |
| Chapter numbering sequential (1–16) | PASS |
| All cross-cutting guarantees preserved | PASS |
| No SQL, TypeScript, or pseudocode present | PASS |
| Build passes | PASS |
| Blueprint LOCKED | PASS |

### Notes

- The World Blueprint v1.0 is LOCKED. All 16 chapters are complete.
- All permanent rules, compatibility rules, and acceptance criteria are locked.
- No locked rule may be removed or weakened.
- All future changes require a new versioned blueprint.
- Next sprint: 1.2.3 — World Layer Migration Implementation.
