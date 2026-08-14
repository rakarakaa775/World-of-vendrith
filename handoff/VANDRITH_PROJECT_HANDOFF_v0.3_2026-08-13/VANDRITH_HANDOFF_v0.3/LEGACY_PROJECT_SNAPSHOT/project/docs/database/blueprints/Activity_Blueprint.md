# Activity Blueprint

> The Vendrith World — Activity Database Blueprint.
>
> This blueprint defines the activity layer of the database schema: activities,
> professions, jobs, skills, abilities, talents, crafts, recipes, tools, resources,
> harvesting, gathering, mining, fishing, farming, cooking, smithing, alchemy,
> enchanting, experience, mastery, and progression. It is a design document only —
> no SQL, no TypeScript, no pseudocode, no implementation code.
>
> The blueprint follows the Database Architecture Blueprint v1.0 (LOCKED), the
> Foundation Blueprint v1.0 (READY FOR LOCK), the World Blueprint v1.0 (LOCKED),
> the Life Blueprint v1.0 (READY FOR LOCK), the Engine Blueprint Standard v1.0,
> the Save Architecture, the Replay Architecture, the Synchronization
> Architecture, the Validation Architecture, the Event Bus Architecture, the
> Engine Dependency Graph, and the Naming Rules v1.0.
>
> **Blueprint Version:** v1.0 — Sprint 1.2.5.6
> **Blueprint Status:** READY FOR LOCK
> **Lock Status:** READY FOR LOCK
> **Owner:** Lead Database Architect

---

## Pending Chapters Table

| Chapter | Title | Sprint | Status |
|---------|-------|--------|--------|
| 1 | Identity | 1.2.5.1 | COMPLETE |
| 2 | Philosophy | 1.2.5.1 | COMPLETE |
| 3 | Purpose | 1.2.5.1 | COMPLETE |
| 4 | Responsibilities | 1.2.5.2 | COMPLETE |
| 5 | Schema Architecture | 1.2.5.2 | COMPLETE |
| 6 | Naming Convention | 1.2.5.2 | COMPLETE |
| 7 | Relationships | 1.2.5.3 | COMPLETE |
| 8 | Security | 1.2.5.3 | COMPLETE |
| 9 | Validation | 1.2.5.3 | COMPLETE |
| 10 | Performance Architecture | 1.2.5.4 | COMPLETE |
| 11 | Testing Architecture | 1.2.5.4 | COMPLETE |
| 12 | Future Expansion | 1.2.5.5 | COMPLETE |
| 13 | Dependencies | 1.2.5.5 | COMPLETE |
| 14 | Completion Checklist | 1.2.5.6 | COMPLETE |
| 15 | Lock Policy | 1.2.5.6 | COMPLETE |
| 16 | Visual Prototype | 1.2.5.6 | COMPLETE |

**Chapters 1–3 authored in Sprint 1.2.5.1. Chapters 4–6 authored in Sprint
1.2.5.2. Chapters 7–9 authored in Sprint 1.2.5.3. Chapters 10–11 authored in Sprint
1.2.5.4. Chapters 12–13 authored in Sprint 1.2.5.5. Chapters 14–16 authored in
Sprint 1.2.5.6. All 16 chapters are complete. The blueprint is READY FOR LOCK.**

---

## Document Control

| Field | Value |
|-------|-------|
| Blueprint Name | Activity Blueprint |
| Blueprint Version | v1.0 — Sprint 1.2.5.6 |
| Blueprint Status | READY FOR LOCK |
| Lock Status | READY FOR LOCK |
| Phase | 1.2 — Database Schema Design |
| Sprint | 1.2.5.6 — Chapters 14–16 |
| Owner | Lead Database Architect |
| Approver | Lead Architect |
| Reviewer | Peer Architect |
| Chapters Completed | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 |
| Chapters Pending | None |
| Blueprint Completion | 100% |
| Last Update | 2026-08-07 — Sprint 1.2.5.6 authored (Chapters 14–16). Blueprint is READY FOR LOCK. |
| Next Sprint | None — Blueprint is complete and ready for lock. |
| Related Architecture | Database Architecture Blueprint v1.0 (LOCKED), Foundation Blueprint v1.0 (READY FOR LOCK), World Blueprint v1.0 (LOCKED), Life Blueprint v1.0 (READY FOR LOCK) |

---

## 1. Identity

### Overview

This chapter defines the permanent identity record for the Activity Blueprint. The
Activity Blueprint defines the activity layer of the database schema — the tables
that manage activities, professions, jobs, skills, abilities, talents, crafts,
recipes, tools, resources, harvesting, gathering, mining, fishing, farming,
cooking, smithing, alchemy, enchanting, experience, mastery, and progression.
These tables are the fourth layer of the database schema, built on top of the
Foundation Layer, the World Layer, and the Life Layer. Every gameplay system that
references a character's activities, professions, skills, crafting, resource
gathering, or progression depends on the Activity Layer.

The identity attributes below are permanent. They do not change when individual
tables are added, removed, or restructured. They identify the blueprint, not the
specific tables within it.

This chapter has 14 sections.

---

### 1.1 Blueprint Identity

#### Purpose

The blueprint identity defines the permanent name, abbreviation, domain, layer,
and schema group for the Activity Blueprint.

#### Scope

The blueprint identity applies to the entire Activity Blueprint — all 16 chapters
and all tables within the activity layer.

#### Boundaries

The blueprint identity is permanent. It does not change when tables are added or
restructured. It identifies the blueprint, not the tables within it.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Permanent Name | The blueprint name is `Activity Blueprint` (abbreviated `AB`). It does not change. |
| Permanent Layer | The Activity Layer is Layer 4 of the 10-layer schema hierarchy. It does not change. |
| Permanent Domain | The domain is Database Schema Design. It does not change. |
| Permanent Schema Group | The schema group is Activity. It does not change. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint name is `Activity Blueprint` | Abbreviated `AB`. Used in documentation, cross-references, sprint logs, and the migration log. |
| The Activity Layer is Layer 4 of the 10-layer schema hierarchy | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer must be designed and locked before any layer above it | Layers 5–10 may depend on the Activity Layer. |
| The blueprint name does not change when tables are added or restructured | It identifies the layer, not the tables. |

---

### 1.2 Blueprint Scope

#### Purpose

The blueprint scope defines what the Activity Blueprint covers and what it does not
cover.

#### Scope

The blueprint scope applies to all tables in the activity layer: activities,
professions, jobs, skills, abilities, talents, crafts, recipes, tools, resources,
harvesting, gathering, mining, fishing, farming, cooking, smithing, alchemy,
enchanting, experience, mastery, and progression.

#### Boundaries

The Activity Blueprint covers the activity data — the profession system, job
system, skill system, ability system, talent system, crafting system, recipe system,
tool system, resource system, harvesting system, gathering system, mining system,
fishing system, farming system, cooking system, smithing system, alchemy system,
enchanting system, experience system, mastery system, and progression system that
define a character's activities and progression. It does not cover gameplay systems
(inventory, dialogue, quests, combat, NPC AI, economy), world geography, life
identity, or save data. Those are covered by their respective blueprints.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Activity Identity | The blueprint covers activities — the core activity entity for each character's actions. |
| Activity Professions | The blueprint covers professions, jobs, skills, abilities, and talents. |
| Activity Crafting | The blueprint covers crafts, recipes, tools, and resources. |
| Activity Gathering | The blueprint covers harvesting, gathering, mining, fishing, and farming. |
| Activity Production | The blueprint covers cooking, smithing, alchemy, and enchanting. |
| Activity Progression | The blueprint covers experience, mastery, and progression. |
| No Gameplay Systems | The blueprint does not cover inventory, dialogue, quests, combat, NPC AI, or economy. |
| No World Geography | The blueprint does not cover worlds, continents, regions, or locations. |
| No Life Identity | The blueprint does not cover lives, races, species, classes, or attributes. |
| No Save Data | The blueprint does not cover save snapshots or save documents. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Blueprint covers 23 table domains | activities, professions, jobs, skills, abilities, talents, crafts, recipes, tools, resources, harvesting, gathering, mining, fishing, farming, cooking, smithing, alchemy, enchanting, experience, mastery, progression. |
| The Activity Blueprint does not cover gameplay systems | Those are covered by their respective blueprints. |
| The Activity Blueprint does not cover world geography | That is covered by the World Blueprint. |
| The Activity Blueprint does not cover life identity | That is covered by the Life Blueprint. |
| The Activity Blueprint does not cover save data | That is covered by the Save Engine. |
| The scope is permanent | It does not change when tables are added or restructured. |

---

### 1.3 Blueprint Objectives

#### Purpose

The blueprint objectives define what the Activity Blueprint aims to achieve.

#### Scope

The blueprint objectives apply to the entire Activity Blueprint — all 16 chapters
and all tables within the activity layer.

#### Boundaries

The objectives are goals, not guarantees. They define what the blueprint aims to
achieve, not what it promises. The guarantees are defined in Chapter 2
(Philosophy) and the compatibility rules throughout the blueprint.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Complete Activity Model | The blueprint provides a complete model of a character's activities, professions, skills, crafting, resource gathering, and progression. |
| Replay-Compatible | The blueprint ensures activity data does not introduce non-determinism into replays. |
| Migration-Safe | The blueprint ensures activity migrations are additive, forward-only, and backward compatible. |
| Sync-Compatible | The blueprint ensures activity data is server-authoritative and non-blocking. |
| Ownership-Safe | The blueprint ensures activity data is scoped to the correct owner. |
| Performant | The blueprint ensures activity queries are efficient and non-blocking. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint provides a complete activity model | No gaps in professions, skills, crafting, gathering, or progression. |
| The blueprint is replay-compatible | Activity data does not introduce non-determinism. |
| The blueprint is migration-safe | Migrations are additive and forward-only. |
| The blueprint is sync-compatible | Activity data is server-authoritative and non-blocking. |
| The blueprint is ownership-safe | Activity data is scoped to the correct owner. |
| The blueprint is performant | Activity queries are efficient and non-blocking. |

---

### 1.4 Version Information

#### Purpose

The version information defines the current version, status, sprint, and chapter
completion for the Activity Blueprint.

#### Scope

The version information applies to the blueprint version — the version number in
the document control panel.

#### Boundaries

The initial version is v1.0. All 16 chapters are authored. The blueprint is
READY FOR LOCK. It transitions to LOCKED when the Lead Architect approves.

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
| The blueprint is READY FOR LOCK now that all 16 chapters are complete | No partial locking. |
| The blueprint cannot be reviewed, approved, or locked until all chapters are complete | No exceptions. |
| Every version is traceable | Sprint, date, changes. |

---

### 1.5 Ownership Information

#### Purpose

The ownership information defines who owns, approves, and reviews the Activity
Blueprint.

#### Scope

The ownership information applies to the blueprint ownership — the owner,
approver, and reviewer.

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

The dependency information defines what the Activity Blueprint depends on and what
depends on it.

#### Scope

The dependency information applies to all cross-layer dependencies involving the
Activity Layer.

#### Boundaries

The Activity Layer is Layer 4 of the 10-layer schema hierarchy. It depends on the
Foundation Layer (Layer 1), the World Layer (Layer 2), and the Life Layer (Layer 3).
Layers 5–10 may depend on the Activity Layer. The Activity Layer does not depend on
any layer above it. No circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 4 | The Activity Layer is Layer 4 of the 10-layer schema hierarchy. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer (Layer 1) for user identity and ownership scoping. |
| World Dependency | The Activity Layer depends on the World Layer (Layer 2) for world context — activities occur within a world. |
| Life Dependency | The Activity Layer depends on the Life Layer (Layer 3) for life context — activities are performed by a life. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |
| No Circular Dependencies | The Activity Layer does not create circular dependencies. |
| DAG Structure | The schema dependency graph remains a directed acyclic graph. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer is Layer 4 | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer depends on the Foundation Layer | Via `user_id` references. No copies of foundation data. |
| The Activity Layer depends on the World Layer | Via `world_id` references. No copies of world data. |
| The Activity Layer depends on the Life Layer | Via `life_id` references. No copies of life data. |
| The Activity Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The Activity Layer follows the Engine Dependency Graph | Topological build order. |
| No engine imports a database client | (Engine Dependency Graph). |

---

### 1.7 Compatibility Requirements

#### Purpose

The compatibility requirements define what the Activity Blueprint must be compatible
with — the Save Engine, the Replay System, the Event Bus, the Synchronization
Architecture, and every other dependent system.

#### Scope

The compatibility requirements apply to all activity tables, all activity queries,
all activity migrations, and all activity sync operations.

#### Boundaries

All 10 compatibility guarantees are permanent. No activity table, no activity
migration, no activity sync operation weakens a compatibility guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | Activity data does not affect save snapshots. The user ID is the only foundation reference. |
| Replay Compatibility | Activity data does not introduce non-determinism into replays. |
| Migration Compatibility | Activity migrations are additive, forward-only, and backward compatible. |
| Synchronization Compatibility | Activity data is server-authoritative and non-blocking. |
| Event Bus Compatibility | Activity data does not affect event ordering. |
| Snapshot Compatibility | Activity data does not affect existing snapshot format. |
| Save Compatibility | Activity data does not affect existing save format. |
| Ownership Compatibility | Activity data does not weaken RLS. |
| Lock Policy Compatibility | Activity data is documented and follows the lock policy. |
| Dependency Compatibility | Activity data does not create circular dependencies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are permanent | No weakening. |
| No activity table weakens a compatibility guarantee | No exceptions. |
| No activity migration weakens a compatibility guarantee | No exceptions. |
| No activity sync operation weakens a compatibility guarantee | No exceptions. |
| Compatibility is tested | Every activity table is tested against all dependent systems. |

---

### 1.8 Synchronization Requirements

#### Purpose

The synchronization requirements define how activity data is synced. Activity data
is server-authoritative. Sync is non-blocking.

#### Scope

The synchronization requirements apply to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, resource gathering results, experience changes, mastery changes,
progression changes.

#### Boundaries

Sync is server-authoritative, non-blocking, and does not corrupt data. The Activity
Layer does not manage sync — the Synchronization Architecture does. The game
continues in a degraded state when the server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Activity sync is server-authoritative. No client-side authority. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity sync is server-authoritative | No client-side authority. |
| Activity sync is non-blocking | No blocking gameplay. |
| Activity sync does not corrupt data | Atomic operations. |
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 1.9 Validation Requirements

#### Purpose

The validation requirements define how activity data is validated. Validation is
enforced at the database boundary through constraints and RLS.

#### Scope

The validation requirements apply to all constraints, RLS policies, and
validation checks in the activity layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
Activity Layer enforces validation — it does not define the validation framework.

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
| The Activity Layer enforces validation | It does not define the framework. |

---

### 1.10 Replay Requirements

#### Purpose

The replay requirements define how activity data relates to the Replay System.
Activity data does not introduce non-determinism into replays.

#### Scope

The replay requirements apply to all activity data that could affect replays:
activity identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots. The only activity value in a snapshot is
the activity identifier (if the engine references it). The Activity Layer has zero
replay overhead. The Activity Layer is unaware of the Replay System.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Activity, profession, skill, and ability identifiers are deterministic. |
| No Non-Determinism | Activity data does not introduce non-determinism. |
| Cross-Platform Replay | Activity identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if the engine references it. |
| Activity identifiers are deterministic | Never change after creation. |
| No non-determinism from activity data | Same state, same result. |
| The Activity Layer is unaware of the Replay System | No upward dependency. |
| Activity identifiers are platform-independent | Cross-platform replay works. |

---

### 1.11 Migration Requirements

#### Purpose

The migration requirements define how activity migrations are managed. Migrations
are additive, forward-only, and backward compatible.

#### Scope

The migration requirements apply to all activity migrations — any additive change
to the activity schema.

#### Boundaries

No activity migration drops a table, drops a column, renames a column, or changes a
column type. Every activity migration is logged in the Migration Log. Every
activity migration is tested against all dependent layers.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Activity migrations are additive. No destructive operations. |
| Forward-Only | Activity migrations are forward-only. No backward migration. |
| Backward Compatible | Activity migrations do not break existing data. |
| Logged | Every activity migration is recorded in the Migration Log. |
| Tested | Every activity migration is tested against all dependent layers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity migrations are additive | No DROP, rename, or type change without a plan. |
| Activity migrations are forward-only | No backward migration. |
| Every activity migration is logged | In `docs/database/Migration_Log.md`. |
| Every activity migration is tested | Against all dependent layers. |
| No activity migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |

---

### 1.12 Lock Policy

#### Purpose

The lock policy defines how the Activity Blueprint is frozen. Once locked, the
blueprint is the authoritative specification for the activity layer.

#### Scope

The lock policy applies to the entire Activity Blueprint — all 16 chapters, all
sections, all guarantees, and all compatibility rules.

#### Boundaries

The blueprint is READY FOR LOCK. All 16 chapters are complete. It transitions to
LOCKED when the Lead Architect approves.
Once locked, no chapter is added, no section is removed, no guarantee is weakened
without the exception procedure.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Authoritative | Once locked, the blueprint is the authoritative specification for the activity layer. |
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

The related documents section defines all documents that the Activity Blueprint
references, follows, or is related to.

#### Scope

The related documents apply to all cross-references in the Activity Blueprint.

#### Boundaries

All related documents are locked or ready for lock. No related document is
modified by the Activity Blueprint. The Activity Blueprint follows them; it does not
change them.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid References | All cross-references are valid and traceable. |
| No Modification | No related document is modified by the Activity Blueprint. |
| Follows | The Activity Blueprint follows all related documents. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Blueprint follows the Database Architecture Blueprint v1.0 (LOCKED) | No modifications to it. |
| The Activity Blueprint follows the Foundation Blueprint v1.0 (READY FOR LOCK) | No modifications to it. |
| The Activity Blueprint follows the World Blueprint v1.0 (LOCKED) | No modifications to it. |
| The Activity Blueprint follows the Life Blueprint v1.0 (READY FOR LOCK) | No modifications to it. |
| The Activity Blueprint follows the Engine Blueprint Standard v1.0 | No modifications to it. |
| The Activity Blueprint follows the Save Architecture | No modifications to it. |
| The Activity Blueprint follows the Replay Architecture | No modifications to it. |
| The Activity Blueprint follows the Synchronization Architecture | No modifications to it. |
| The Activity Blueprint follows the Validation Architecture | No modifications to it. |
| The Activity Blueprint follows the Event Bus Architecture | No modifications to it. |
| The Activity Blueprint follows the Engine Dependency Graph | No modifications to it. |
| The Activity Blueprint follows the Naming Rules v1.0 | No modifications to it. |
| All cross-references are valid | No broken references. |

---

### 1.14 Future Expansion Compatibility

#### Purpose

The future expansion compatibility section defines how the Activity Blueprint
supports future expansion. The Activity Layer is designed for additive growth.

#### Scope

The future expansion compatibility applies to all future tables, columns,
relationships, and systems added to the Activity Layer.

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
| Expansion does not create circular dependencies | The Activity Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and the schema documentation. |
| Expansion is tested against dependent layers | No breaking changes. |
| The data model is never optimized for the current sprint at the expense of the next phase | (Database Rules §10). |

---

## 2. Philosophy

### Overview

This chapter defines the permanent philosophical principles that govern the Activity
Blueprint. These principles translate the Database Architecture Blueprint v1.0,
the Foundation Blueprint v1.0, the World Blueprint v1.0, the Life Blueprint v1.0,
and the Engine Blueprint Standard v1.0 into concrete activity-layer rules. No
principle may be violated without Lead Architect approval.

This chapter defines 12 principles. Each principle includes purpose, scope,
boundaries, guarantees, and permanent rules.

---

### 2.1 Deterministic Execution

#### Purpose

The deterministic execution principle defines the permanent rule that activity data
preserves deterministic execution. The same inputs always produce the same
outputs.

#### Scope

This principle applies to all activity operations that affect game state or are part
of engine snapshots: activity identifiers, profession identifiers, skill identifiers,
ability identifiers, experience values, mastery values, progression values.

#### Boundaries

No activity data introduces non-determinism. Activity identifiers are
deterministic — assigned at creation, never changed. Experience calculations are
deterministic. No wall-clock time or unseeded randomness affects activity data that
flows into snapshots.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Identifiers | Activity, profession, skill, and ability identifiers are deterministic. Never change after creation. |
| No Wall-Clock Dependence | No wall-clock time affects activity data in snapshots. |
| No Randomness | No unseeded randomness affects activity data in snapshots. |
| Same Inputs, Same Outputs | The same activity state always produces the same result. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity identifiers are deterministic | Assigned at creation, never changed. |
| No wall-clock time affects activity data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects activity data in snapshots | No random non-determinism. |
| The same activity state always produces the same result | Deterministic execution. |

---

### 2.2 Ownership Consistency

#### Purpose

The ownership consistency principle defines the permanent rule that activity data is
scoped to the correct owner. RLS is enforced. No cross-user access from the
client.

#### Scope

This principle applies to all RLS policies, all access paths, and all trust
boundaries in the activity layer.

#### Boundaries

RLS is enabled on every activity table. Four policies per table (SELECT, INSERT,
UPDATE, DELETE). The service role key is server-side only. No cross-user access
from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every activity table. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |
| Ownership Scoping | Activity data is scoped to the correct owner. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| Activity data is scoped to the correct owner | No unauthorized access. |

---

### 2.3 Event-Driven Architecture

#### Purpose

The event-driven architecture principle defines the permanent rule that activity
data follows the Event Bus's publish/subscribe model. Activity data does not affect
event ordering.

#### Scope

This principle applies to all activity operations that emit or consume events:
activity creation, profession selection, skill changes, ability changes, talent
changes, crafting results, gathering results, experience changes, mastery changes,
progression changes.

#### Boundaries

The Activity Layer publishes events through the Event Bus. It does not manage the
Event Bus. Activity data does not affect event ordering. Events are deterministic.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Event Bus Compliance | Activity data follows the Event Bus's publish/subscribe model. |
| No Event Ordering Changes | Activity data does not affect event ordering. |
| Deterministic Events | Activity events are deterministic. |
| No Upward Dependency | The Activity Layer does not depend on any gameplay engine's event handling. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data follows the Event Bus's publish/subscribe model | No direct coupling. |
| Activity data does not affect event ordering | Event ordering is preserved. |
| Activity events are deterministic | Same state, same events. |
| The Activity Layer does not manage the Event Bus | It publishes and subscribes. |

---

### 2.4 Replay Compatibility

#### Purpose

The replay compatibility principle defines the permanent rule that activity data
does not introduce non-determinism into replays. The same state always produces
the same result.

#### Scope

This principle applies to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots (except the activity identifier if the
engine references it). No activity data introduces non-determinism. Replays do not
query activity tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| Cross-Platform Replay | Activity identifiers are platform-independent. |
| No Non-Determinism | Activity data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Activity identifiers are deterministic | Never change after creation. |
| No non-determinism from activity data | Same state, same result. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are platform-independent | Cross-platform replay works. |

---

### 2.5 Migration Safety

#### Purpose

The migration safety principle defines the permanent rule that activity migrations
are additive, forward-only, and backward compatible. No migration destroys data.

#### Scope

This principle applies to all activity migrations — any additive change to the
activity schema.

#### Boundaries

No activity migration drops a table, drops a column, renames a column, or changes a
column type. Every activity migration is logged and tested. The previous valid
state is always retained.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Activity migrations are additive. No destructive operations. |
| Forward-Only | Activity migrations are forward-only. No backward migration. |
| Backward Compatible | Activity migrations do not break existing data. |
| No Data Loss | No migration destroys data. The previous valid state is retained. |
| Tested | Every activity migration is tested against all dependent layers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity migrations are additive | No DROP, rename, or type change without a plan. |
| Activity migrations are forward-only | No backward migration. |
| Every activity migration is logged | In `docs/database/Migration_Log.md`. |
| Every activity migration is tested | Against all dependent layers. |
| No activity migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |

---

### 2.6 Synchronization Consistency

#### Purpose

The synchronization consistency principle defines the permanent rule that activity
data is server-authoritative and non-blocking. Sync does not corrupt data.

#### Scope

This principle applies to all activity data that is synced: activity metadata,
profession selection, skill changes, ability changes, talent changes, crafting
results, gathering results, experience changes, mastery changes, progression
changes.

#### Boundaries

Sync is server-authoritative, non-blocking, and does not corrupt data. The Activity
Layer does not manage sync. The game continues in a degraded state when the server
is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Activity sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity sync is server-authoritative | No client-side authority. |
| Activity sync is non-blocking | No blocking gameplay. |
| Activity sync does not corrupt data | Atomic operations. |
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 2.7 Data Integrity

#### Purpose

The data integrity principle defines the permanent rule that activity data is
accurate, consistent, and complete. Constraints and RLS enforce integrity.

#### Scope

This principle applies to all constraints, RLS policies, and validation checks in
the activity layer.

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

The scalability principle defines the permanent rule that the activity layer scales
to support many activities per life, many professions, many skills, many abilities,
many talents, many crafts, many recipes, and many resources.

#### Scope

This principle applies to all activity tables that grow large over time: skills,
abilities, talents, crafts, recipes, tools, resources, experience, mastery,
progression.

#### Boundaries

The activity layer is designed for scalability from the start. Indexes are
justified by evidence. Queries are bounded. No query loads an unbounded result set.
Storage is bounded per life.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Bounded Result Sets | Queries return bounded result sets. Pagination is used. |
| Bounded Storage | Each life has a documented storage limit. |
| Indexed Foreign Keys | All foreign key columns are indexed. |
| No Unbounded Loads | No query loads an entire table into memory. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Queries return bounded result sets | Pagination is used for large result sets. |
| Each life has a storage limit | No unbounded activities. |
| All foreign keys are indexed | No unindexed foreign keys. |
| No query loads an entire table into memory | Use pagination or filtering. |
| Indexes are justified by evidence | No speculative indexes. |

---

### 2.9 Maintainability

#### Purpose

The maintainability principle defines the permanent rule that the activity layer is
maintainable — readable, documented, and testable.

#### Scope

This principle applies to all activity tables, all activity constraints, all
activity RLS policies, and all activity documentation.

#### Boundaries

The activity layer is documented in the ERD, the blueprint, and Schema.md. Every
table, every constraint, and every RLS policy is documented. Every activity table
is tested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Every activity table, constraint, and RLS policy is documented. |
| Tested | Every activity table is tested. |
| Readable | The activity layer is readable and maintainable. |
| Traceable | Every activity table is traceable to the blueprint and ERD. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity table is documented | ERD, blueprint, Schema.md. |
| Every activity constraint is documented | In the blueprint and Schema.md. |
| Every activity RLS policy is documented | In the blueprint and Schema.md. |
| Every activity table is tested | Against all dependent layers. |
| The activity layer is readable and maintainable | No unnecessary complexity. |

---

### 2.10 Extensibility

#### Purpose

The extensibility principle defines the permanent rule that the activity layer is
extensible — new tables, new columns, and new relationships can be added without
breaking existing data.

#### Scope

This principle applies to all future expansions of the activity layer.

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
| Expansion does not create circular dependencies | The Activity Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and Schema.md. |
| Expansion is tested against dependent layers | No breaking changes. |
| The data model is never optimized for the current sprint at the expense of the next phase | (Database Rules §10). |

---

### 2.11 Snapshot Isolation

#### Purpose

The snapshot isolation principle defines the permanent rule that activity data is not
serialized into engine snapshots. The Save Engine references activity identifiers; it
does not serialize activity tables.

#### Scope

This principle applies to the boundary between the Activity Layer and the Save
Engine's snapshot system.

#### Boundaries

Activity data is not in engine snapshots (except the activity identifier if the
engine references it). The Save Engine references activity identifiers; it does not
query activity tables during save/load. The Activity Layer is unaware of the Save
Engine.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Activity Serialization | Activity tables are not serialized into snapshots. |
| Identifier Reference Only | The Save Engine references activity identifiers, not activity data. |
| No Save Engine Dependency | The Activity Layer is unaware of the Save Engine. |
| Zero Snapshot Overhead | Activity data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity tables are not in snapshots | Except the activity identifier if referenced. |
| The Save Engine references activity identifiers | No activity data in snapshots. |
| The Save Engine does not query activity tables during save/load | No database queries. |
| The Activity Layer is unaware of the Save Engine | No upward dependency. |
| Activity data does not increase snapshot size | Zero overhead. |

---

### 2.12 Dependency Discipline

#### Purpose

The dependency discipline principle defines the permanent rule that the Activity
Layer depends only on the Foundation Layer, the World Layer, and the Life Layer and
does not create circular dependencies.

#### Scope

This principle applies to all dependencies — intra-layer (between activity tables)
and cross-layer (between the Activity Layer and other schema layers).

#### Boundaries

The Activity Layer is Layer 4. It depends on the Foundation Layer (Layer 1), the
World Layer (Layer 2), and the Life Layer (Layer 3). It does not depend on any layer
above it. No circular dependencies. The schema dependency graph remains a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 4 | The Activity Layer is Layer 4. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |
| No Circular Dependencies | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer is Layer 4 | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer depends on the Foundation Layer | Via `user_id` references. |
| The Activity Layer depends on the World Layer | Via `world_id` references. |
| The Activity Layer depends on the Life Layer | Via `life_id` references. |
| The Activity Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The Activity Layer follows the Engine Dependency Graph | Topological build order. |
| No engine imports a database client | (Engine Dependency Graph). |

---

## 3. Purpose

### Overview

This chapter defines the purpose of the Activity Blueprint. It defines what is in
scope, what is out of scope, and the boundaries that govern the activity layer. It
also defines the activity structure diagram — the visual hierarchy of the activity
layer's tables.

This chapter has 8 sections.

---

### 3.1 In-Scope Domains

#### Purpose

The in-scope domains section defines the table domains that the Activity Blueprint
governs.

#### Scope

The in-scope domains are the 23 table domains within the activity layer.

#### Boundaries

The in-scope domains are permanent. They define what the Activity Blueprint covers.
No in-scope domain is removed after locking.

#### In-Scope Domains

| Domain | Description |
|--------|-------------|
| activities | The top-level activity entity. An activity is a persistent record of a character's action within a world. It references the user, world, and life it belongs to. |
| professions | Profession records for a life. A profession defines the character's primary trade or occupation. |
| jobs | Job records for a life. A job is a specific instance of work within a profession. |
| skills | Skill records for a life. Skills are learned capabilities that a character can develop and improve. |
| abilities | Ability records for a life. Abilities are active or passive powers a character can use. |
| talents | Talent records for a life. Talents are special innate or acquired aptitudes that modify capabilities. |
| crafts | Craft records for a life. A craft is a production discipline (e.g., blacksmithing, tailoring, woodworking). |
| recipes | Recipe records for a craft. A recipe defines the inputs, tools, and outputs of a crafting process. |
| tools | Tool records for a life. Tools are items used in crafting, gathering, and production activities. |
| resources | Resource records for a world. Resources are raw materials available in the world for gathering and crafting. |
| harvesting | Harvesting records for a life. Harvesting is the activity of collecting raw materials from plants or creatures. |
| gathering | Gathering records for a life. Gathering is the general activity of collecting scattered resources. |
| mining | Mining records for a life. Mining is the activity of extracting minerals and ores from the earth. |
| fishing | Fishing records for a life. Fishing is the activity of catching fish from bodies of water. |
| farming | Farming records for a life. Farming is the activity of cultivating crops and raising livestock. |
| cooking | Cooking records for a life. Cooking is the production activity of transforming ingredients into food. |
| smithing | Smithing records for a life. Smithing is the production activity of forging metal into tools, weapons, and armor. |
| alchemy | Alchemy records for a life. Alchemy is the production activity of brewing potions and elixirs. |
| enchanting | Enchanting records for a life. Enchanting is the production activity of imbuing items with magical properties. |
| experience | Experience records for a life. Experience tracks the accumulated points a character has earned through activities. |
| mastery | Mastery records for a life. Mastery tracks the level of expertise a character has achieved in a specific skill, craft, or profession. |
| progression | Progression records for a life. Progression tracks the overall advancement of a character through the activity system. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Blueprint covers 23 table domains | No missing domains. |
| No in-scope domain is removed after locking | The scope is permanent. |
| Every in-scope domain is documented in the ERD, blueprint, and Schema.md | No undocumented domains. |
| Every in-scope domain follows the Naming Rules v1.0 | `snake_case`, singular table names. |

---

### 3.2 Out-of-Scope Domains

#### Purpose

The out-of-scope domains section defines the table domains that the Activity
Blueprint does not govern. These domains are covered by their respective
blueprints.

#### Scope

The out-of-scope domains are the gameplay and system domains that are not part of
the activity layer.

#### Boundaries

The out-of-scope domains are permanent. They define what the Activity Blueprint
does not cover. No out-of-scope domain is moved into the Activity Blueprint without
a new blueprint or an exception.

#### Out-of-Scope Domains

| Domain | Covered By |
|--------|------------|
| inventory | Inventory Engine Blueprint |
| dialogue | Dialogue Engine Blueprint |
| quest | Quest Engine Blueprint |
| combat | Combat Engine (future blueprint) |
| energy | Energy Engine Blueprint |
| save | Save Engine Blueprint |
| npc_ai | NPC AI Engine Blueprint |
| economy | Economy Engine Blueprint |
| world | World Blueprint |
| life | Life Blueprint |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Blueprint does not cover gameplay systems | Those are covered by their respective blueprints. |
| The Activity Blueprint does not cover world geography | That is covered by the World Blueprint. |
| The Activity Blueprint does not cover life identity | That is covered by the Life Blueprint. |
| The Activity Blueprint does not cover save data | That is covered by the Save Engine. |
| No out-of-scope domain is moved into the Activity Blueprint without a new blueprint or an exception | No scope creep. |
| The out-of-scope list is permanent | It does not change after locking. |

---

### 3.3 Ownership Boundaries

#### Purpose

The ownership boundaries section defines who owns activity data and how RLS scopes
access.

#### Scope

The ownership boundaries apply to all activity tables and all RLS policies in the
activity layer.

#### Boundaries

Activity data is owned by the user who created the life. RLS scopes every query to
the authenticated user. The service role key bypasses RLS for server-side
operations (edge functions only). No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Owned | Activity data is owned by the user who created the life. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is owned by the user who created the life | `user_id` references the Foundation Layer. |
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |

---

### 3.4 Synchronization Boundaries

#### Purpose

The synchronization boundaries section defines how activity data is synced and what
sync does not cover.

#### Scope

The synchronization boundaries apply to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes,
progression changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Activity Layer does not manage
sync. Sync does not corrupt data. The game continues in a degraded state when the
server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Activity sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |
| No Client-Side Authority | No client-side conflict resolution. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity sync is server-authoritative | No client-side authority. |
| Activity sync is non-blocking | No blocking gameplay. |
| Activity sync does not corrupt data | Atomic operations. |
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 3.5 Replay Boundaries

#### Purpose

The replay boundaries section defines how activity data relates to replays. Activity
data does not introduce non-determinism into replays.

#### Scope

The replay boundaries apply to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots (except the activity identifier if the
engine references it). Replays do not query activity tables. The Activity Layer has
zero replay overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| Cross-Platform Replay | Activity identifiers are platform-independent. |
| No Non-Determinism | Activity data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| Activity identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from activity data | Same state, same result. |

---

### 3.6 Dependency Boundaries

#### Purpose

The dependency boundaries section defines what the Activity Layer depends on and
what depends on it.

#### Scope

The dependency boundaries apply to all cross-layer dependencies involving the
Activity Layer.

#### Boundaries

The Activity Layer is Layer 4. It depends on the Foundation Layer (Layer 1), the
World Layer (Layer 2), and the Life Layer (Layer 3). Layers 5–10 may depend on the
Activity Layer. The Activity Layer does not depend on any layer above it. No
circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 4 | The Activity Layer is Layer 4. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |
| No Circular Dependencies | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer is Layer 4 | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer depends on the Foundation Layer | Via `user_id` references. |
| The Activity Layer depends on the World Layer | Via `world_id` references. |
| The Activity Layer depends on the Life Layer | Via `life_id` references. |
| The Activity Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The Activity Layer follows the Engine Dependency Graph | Topological build order. |

---

### 3.7 Validation Boundaries

#### Purpose

The validation boundaries section defines how activity data is validated and what
validation does not cover.

#### Scope

The validation boundaries apply to all constraints, RLS policies, and validation
checks in the activity layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
Activity Layer enforces validation — it does not define the validation framework. No
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
| The Activity Layer enforces validation | It does not define the framework. |

---

### 3.8 Activity Structure Diagram

#### Purpose

The activity structure diagram defines the visual hierarchy of the activity layer's
tables. It shows how activity entities nest and relate.

#### Scope

The activity structure diagram applies to all 23 activity tables and their
relationships.

#### Boundaries

The diagram is a specification, not an implementation. It defines the hierarchy
and relationships. It does not define the schema or the queries.

#### Activity Hierarchy

```
activity
├── professions
│   └── jobs
├── skills
├── abilities
├── talents
├── crafts
│   └── recipes
├── tools
├── resources
├── harvesting
├── gathering
├── mining
├── fishing
├── farming
├── cooking
├── smithing
├── alchemy
├── enchanting
├── experience
├── mastery
└── progression
```

#### Activity Hierarchy Description

| Level | Entity | Parent | Description |
|------|--------|--------|-------------|
| 1 | activity | — | The top-level activity entity. References the user (Foundation Layer), the world (World Layer), and the life (Life Layer). |
| 2 | professions | activity | Profession records for a life. |
| 3 | jobs | profession | Job records within a profession. |
| 2 | skills | activity | Skill records for a life. |
| 2 | abilities | activity | Ability records for a life. |
| 2 | talents | activity | Talent records for a life. |
| 2 | crafts | activity | Craft records for a life. |
| 3 | recipes | craft | Recipe records within a craft. |
| 2 | tools | activity | Tool records for a life. |
| 2 | resources | activity | Resource records for a world. |
| 2 | harvesting | activity | Harvesting records for a life. |
| 2 | gathering | activity | Gathering records for a life. |
| 2 | mining | activity | Mining records for a life. |
| 2 | fishing | activity | Fishing records for a life. |
| 2 | farming | activity | Farming records for a life. |
| 2 | cooking | activity | Cooking records for a life. |
| 2 | smithing | activity | Smithing records for a life. |
| 2 | alchemy | activity | Alchemy records for a life. |
| 2 | enchanting | activity | Enchanting records for a life. |
| 2 | experience | activity | Experience records for a life. |
| 2 | mastery | activity | Mastery records for a life. |
| 2 | progression | activity | Progression records for a life. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The activity hierarchy is a tree | No circular parent-child relationships. |
| Activity is the root | Every activity entity descends from an activity. |
| Activity references the Foundation Layer | Via `user_id`. |
| Activity references the World Layer | Via `world_id`. |
| Activity references the Life Layer | Via `life_id`. |
| The diagram is a specification | Not an implementation. |
| The diagram is documented | In the ERD, the blueprint, and Schema.md. |

---

## Sprint 1.2.5.1 Review

### Sprint Summary

**Sprint:** 1.2.5.1 — Activity Blueprint v1.0 (Chapters 1–3)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 1 | Identity | 14 sections: blueprint identity, blueprint scope, blueprint objectives, version information, ownership information, dependency information, compatibility requirements, synchronization requirements, validation requirements, replay requirements, migration requirements, lock policy, related documents, future expansion compatibility. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 2 | Philosophy | 12 principles: deterministic execution, ownership consistency, event-driven architecture, replay compatibility, migration safety, synchronization consistency, data integrity, scalability, maintainability, extensibility, snapshot isolation, dependency discipline. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 3 | Purpose | 8 sections: in-scope domains, out-of-scope domains, ownership boundaries, synchronization boundaries, replay boundaries, dependency boundaries, validation boundaries, activity structure diagram. Each with purpose, scope, boundaries, guarantees, permanent rules. |

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

- The Activity Blueprint is IN PROGRESS. Chapters 1–3 are complete. Chapters 4–16 are pending.
- Next sprint: 1.2.5.2 — Chapter 4 (Responsibilities), Chapter 5 (Schema Architecture), Chapter 6 (Naming Convention).

---

## 4. Responsibilities

### Overview

This chapter defines the permanent responsibilities of the Activity Layer. It defines
what the Activity Layer is responsible for, what it is not responsible for, and the
guarantees it provides to every dependent system. No responsibility may be removed
after locking.

This chapter has 12 sections. Every section includes purpose, scope, boundaries,
guarantees, and permanent rules.

---

### 4.1 Primary Responsibilities

#### Purpose

The primary responsibilities section defines the core duties of the Activity Layer —
the things it must do for the activity system to function.

#### Scope

The primary responsibilities apply to all 23 activity tables and all activity
operations.

#### Boundaries

The Activity Layer is responsible for modeling a character's activities, professions,
jobs, skills, abilities, talents, crafts, recipes, tools, resources, harvesting,
gathering, mining, fishing, farming, cooking, smithing, alchemy, enchanting,
experience, mastery, and progression. It is not responsible for gameplay systems, save
data, or engine state.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Complete Activity Model | The Activity Layer provides a complete model of a character's activities, professions, skills, crafting, resource gathering, and progression. |
| Deterministic Identifiers | All activity identifiers are deterministic. Assigned at creation, never changed. |
| Referential Integrity | All foreign keys are enforced. No orphan rows. |
| Ownership Scoping | All activity data is scoped to the correct owner via RLS. |
| Replay Compatibility | Activity data does not introduce non-determinism into replays. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer models 23 table domains | activities, professions, jobs, skills, abilities, talents, crafts, recipes, tools, resources, harvesting, gathering, mining, fishing, farming, cooking, smithing, alchemy, enchanting, experience, mastery, progression. |
| All activity identifiers are deterministic | Never change after creation. |
| All foreign keys are enforced | No orphan rows. |
| All activity data is scoped via RLS | No cross-user access from the client. |
| Activity data does not introduce non-determinism into replays | Same state, same result. |
| No primary responsibility is removed after locking | Permanent. |

---

### 4.2 Secondary Responsibilities

#### Purpose

The secondary responsibilities section defines the supporting duties of the
Activity Layer — things that enable the primary responsibilities.

#### Scope

The secondary responsibilities apply to all activity tables, activity documentation,
and activity testing.

#### Boundaries

The Activity Layer is responsible for documenting its tables, testing its tables, and
providing indexes for efficient queries. It is not responsible for the testing
framework, the documentation framework, or the indexing engine.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Every activity table, constraint, and RLS policy is documented. |
| Tested | Every activity table is tested against all dependent layers. |
| Indexed | All foreign key columns are indexed. |
| Bounded Queries | Queries return bounded result sets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity table is documented | ERD, blueprint, Schema.md. |
| Every activity table is tested | Against all dependent layers. |
| All foreign keys are indexed | No unindexed foreign keys. |
| Queries return bounded result sets | Pagination is used. |
| The Activity Layer does not define the testing framework | It uses the Testing Architecture. |
| The Activity Layer does not define the documentation framework | It uses the project's documentation standards. |

---

### 4.3 Ownership Responsibilities

#### Purpose

The ownership responsibilities section defines how the Activity Layer manages data
ownership and access control.

#### Scope

The ownership responsibilities apply to all RLS policies, all access paths, and all
trust boundaries in the activity layer.

#### Boundaries

RLS is enabled on every activity table. Four policies per table. The service role
key is server-side only. No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every activity table. |
| Four Policies Per Table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| Activity data is scoped to the correct owner | No unauthorized access. |
| No ownership responsibility is removed after locking | Permanent. |

---

### 4.4 Validation Responsibilities

#### Purpose

The validation responsibilities section defines how the Activity Layer validates data
integrity.

#### Scope

The validation responsibilities apply to all constraints, RLS policies, and
validation checks in the activity layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
Activity Layer enforces validation — it does not define the validation framework.

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
| The Activity Layer enforces validation | It does not define the framework. |
| No validation responsibility is removed after locking | Permanent. |

---

### 4.5 Migration Responsibilities

#### Purpose

The migration responsibilities section defines how the Activity Layer manages schema
migrations.

#### Scope

The migration responsibilities apply to all activity migrations — any additive change
to the activity schema.

#### Boundaries

Migrations are additive, forward-only, and backward compatible. No migration drops a
table, drops a column, renames a column, or changes a column type. Every migration is
logged and tested.

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

The synchronization responsibilities section defines how the Activity Layer
participates in data synchronization.

#### Scope

The synchronization responsibilities apply to all activity data that is synced:
activity metadata, profession selection, skill changes, ability changes, talent
changes, crafting results, gathering results, experience changes, mastery changes,
progression changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Activity Layer does not manage
sync — the Synchronization Architecture does. The game continues in a degraded state
when the server is unreachable.

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
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |
| No synchronization responsibility is removed after locking | Permanent. |

---

### 4.7 Replay Responsibilities

#### Purpose

The replay responsibilities section defines how the Activity Layer relates to the
Replay System.

#### Scope

The replay responsibilities apply to all activity data that could affect replays:
activity identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots (except the activity identifier if the engine
references it). Replays do not query activity tables. The Activity Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| Cross-Platform Replay | Activity identifiers are platform-independent. |
| No Non-Determinism | Activity data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| Activity identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from activity data | Same state, same result. |
| No replay responsibility is removed after locking | Permanent. |

---

### 4.8 Auditing Responsibilities

#### Purpose

The auditing responsibilities section defines how the Activity Layer supports auditing
of activity data changes.

#### Scope

The auditing responsibilities apply to all activity tables that are modified after
creation: activity metadata, profession changes, skill changes, ability changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

#### Boundaries

The Activity Layer supports auditing by providing timestamps, owner references, and
change tracking. It does not define the audit framework — the Foundation Layer does
(via audit_logs). The Activity Layer contributes to audit logs but does not manage them.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Timestamped | Every activity row has created_at and updated_at timestamps. |
| Owned | Every activity row has a user_id reference to the Foundation Layer. |
| Change-Trackable | Activity data changes are trackable through timestamps and audit logs. |
| No Audit Framework | The Activity Layer does not define the audit framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity row has created_at and updated_at | No exceptions. |
| Every activity row has a user_id reference | To the Foundation Layer. |
| Activity data changes are trackable | Through timestamps and audit logs. |
| The Activity Layer does not manage audit logs | The Foundation Layer does. |
| The Activity Layer contributes to audit logs | But does not own them. |
| No auditing responsibility is removed after locking | Permanent. |

---

### 4.9 Security Responsibilities

#### Purpose

The security responsibilities section defines how the Activity Layer protects activity
data from unauthorized access.

#### Scope

The security responsibilities apply to all RLS policies, all access paths, and all
trust boundaries in the activity layer.

#### Boundaries

RLS is the primary security boundary. The service role key bypasses RLS for
server-side operations (edge functions only). No client-side authority. No cross-user
access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every activity table. |
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

The monitoring responsibilities section defines how the Activity Layer supports
monitoring of activity data health.

#### Scope

The monitoring responsibilities apply to all activity tables and all activity
operations.

#### Boundaries

The Activity Layer supports monitoring by providing timestamps, row counts, and query
performance characteristics. It does not define the monitoring framework. Monitoring
is non-blocking and does not affect gameplay.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Observable | Activity data is observable through timestamps and row counts. |
| Non-Blocking | Monitoring does not block gameplay. |
| No Monitoring Framework | The Activity Layer does not define the monitoring framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is observable | Timestamps, row counts. |
| Monitoring is non-blocking | No blocking gameplay. |
| The Activity Layer does not define the monitoring framework | It uses the project's monitoring standards. |
| No monitoring responsibility is removed after locking | Permanent. |

---

### 4.11 Expansion Responsibilities

#### Purpose

The expansion responsibilities section defines how the Activity Layer supports future
expansion.

#### Scope

The expansion responsibilities apply to all future tables, columns, relationships, and
systems added to the Activity Layer.

#### Boundaries

Expansion is additive. Existing tables, columns, and relationships are not removed.
No expansion weakens a guarantee or creates a circular dependency.

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
| Expansion does not create circular dependencies | The Activity Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and Schema.md. |
| Expansion is tested against dependent layers | No breaking changes. |
| No expansion responsibility is removed after locking | Permanent. |

---

### 4.12 Permanent Non-Responsibilities

#### Purpose

The permanent non-responsibilities section defines what the Activity Layer is
permanently NOT responsible for. These responsibilities belong to other layers or
engines.

#### Scope

The permanent non-responsibilities apply to the boundary between the Activity Layer and
all other layers and engines.

#### Boundaries

The non-responsibilities are permanent. No non-responsibility is moved into the
Activity Layer without a new blueprint or an exception.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Gameplay Systems | The Activity Layer does not manage inventory, dialogue, quests, combat, NPC AI, or economy. |
| No Save Data | The Activity Layer does not manage save snapshots or save documents. |
| No Engine State | The Activity Layer does not manage engine state (time, life, energy, etc.). |
| No Auth | The Activity Layer does not manage authentication or authorization. |
| No Sync Management | The Activity Layer does not manage synchronization. |
| No Replay Management | The Activity Layer does not manage replays. |
| No Event Bus Management | The Activity Layer does not manage the Event Bus. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer does not manage gameplay systems | Those are covered by their respective engines. |
| The Activity Layer does not manage save data | That is covered by the Save Engine. |
| The Activity Layer does not manage engine state | That is covered by the respective engines. |
| The Activity Layer does not manage auth | That is covered by the Foundation Layer. |
| The Activity Layer does not manage sync | That is covered by the Synchronization Architecture. |
| The Activity Layer does not manage replays | That is covered by the Replay System. |
| The Activity Layer does not manage the Event Bus | It publishes and subscribes. |
| No non-responsibility is moved into the Activity Layer without a new blueprint or an exception | No scope creep. |
| The non-responsibilities are permanent | They do not change after locking. |

---

## 5. Schema Architecture

### Overview

This chapter defines the schema architecture for the Activity Layer. It defines the
philosophy, layer hierarchy, entity hierarchy, relationship hierarchy, ownership
hierarchy, aggregation rules, composition rules, inheritance rules, normalization
strategy, denormalization strategy, indexing strategy, partition strategy,
synchronization strategy, replay strategy, and compatibility strategy.

This chapter has 15 sections. Every section includes purpose, scope, boundaries,
guarantees, and permanent rules.

---

### 5.1 Schema Philosophy

#### Purpose

The schema philosophy defines the permanent principles that govern the Activity
Layer's schema design.

#### Scope

The schema philosophy applies to all 23 activity tables and all activity relationships.

#### Boundaries

The Activity Layer follows the Database Architecture Blueprint v1.0 (LOCKED). It is
Layer 4 of the 10-layer schema hierarchy. It depends on the Foundation Layer (Layer
1), the World Layer (Layer 2), and the Life Layer (Layer 3). It does not depend on any
layer above it.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layered | The Activity Layer follows the layered architecture. |
| Event-Sourced | The Activity Layer follows the event-sourced architecture. |
| Interface-Driven | The Activity Layer follows the interface-driven architecture. |
| Layer 4 | The Activity Layer is Layer 4 of the 10-layer schema hierarchy. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer follows the Database Architecture Blueprint v1.0 | No exceptions. |
| The Activity Layer is Layer 4 | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer depends on the Foundation Layer | Via `user_id` references. |
| The Activity Layer depends on the World Layer | Via `world_id` references. |
| The Activity Layer depends on the Life Layer | Via `life_id` references. |
| The Activity Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The schema philosophy is permanent | It does not change after locking. |

---

### 5.2 Layer Hierarchy

#### Purpose

The layer hierarchy defines the Activity Layer's position in the 10-layer schema
hierarchy.

#### Scope

The layer hierarchy applies to the Activity Layer's position relative to all other
schema layers.

#### Boundaries

The Activity Layer is Layer 4. It depends on Layer 1 (Foundation), Layer 2 (World), and
Layer 3 (Life). Layers 5–10 may depend on it. No upward dependencies. No circular
dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 4 | The Activity Layer is Layer 4 of the 10-layer schema hierarchy. |
| Depends on Layer 1 | The Activity Layer depends on the Foundation Layer. |
| Depends on Layer 2 | The Activity Layer depends on the World Layer. |
| Depends on Layer 3 | The Activity Layer depends on the Life Layer. |
| Depended Upon by Layers 5–10 | Higher layers may depend on the Activity Layer. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |
| DAG Structure | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer is Layer 4 | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer depends on the Foundation Layer | Via `user_id` references. |
| The Activity Layer depends on the World Layer | Via `world_id` references. |
| The Activity Layer depends on the Life Layer | Via `life_id` references. |
| The Activity Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The layer hierarchy is permanent | It does not change after locking. |

---

### 5.3 Entity Hierarchy

#### Purpose

The entity hierarchy defines the nesting of activity entities — how an activity contains
professions, professions contain jobs, crafts contain recipes, and so on.

#### Scope

The entity hierarchy applies to all 23 activity tables and their parent-child
relationships.

#### Boundaries

The entity hierarchy is a tree. The activity is the root. Every activity entity descends
from an activity. No circular parent-child relationships. Activity references the user
(Foundation Layer), the world (World Layer), and the life (Life Layer).

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Tree Structure | The entity hierarchy is a tree. No cycles. |
| Activity Root | The activity is the root of the hierarchy. |
| No Circular Parents | No circular parent-child relationships. |
| Cross-Layer References | Activity references the Foundation, World, and Life layers via identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The activity is the root | Every activity entity descends from an activity. |
| The entity hierarchy is a tree | No cycles. |
| Activity references the Foundation Layer | Via `user_id`. |
| Activity references the World Layer | Via `world_id`. |
| Activity references the Life Layer | Via `life_id`. |
| No circular parent-child relationships | No exceptions. |
| The entity hierarchy is permanent | It does not change after locking. |

---

### 5.4 Relationship Hierarchy

#### Purpose

The relationship hierarchy defines the types of relationships between activity entities
and their rules.

#### Scope

The relationship hierarchy applies to all relationships between activity tables.

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

The ownership hierarchy defines how activity data is owned and scoped.

#### Scope

The ownership hierarchy applies to all activity tables and all RLS policies.

#### Boundaries

Activity data is owned by the user who created the life. RLS scopes every query. No
cross-user access from the client. The service role key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Owned | Activity data is owned by the user who created the life. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is owned by the user who created the life | `user_id` references the Foundation Layer. |
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |
| The ownership hierarchy is permanent | It does not change after locking. |

---

### 5.6 Aggregation Rules

#### Purpose

The aggregation rules define how activity entities aggregate — how an activity aggregates
professions, skills, abilities, talents, crafts, tools, and so on.

#### Scope

The aggregation rules apply to all parent-child relationships in the activity layer.

#### Boundaries

Aggregation is one-way: parent aggregates children. A child belongs to exactly one
parent. No shared children. No circular aggregation.

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

The composition rules define how activity entities compose — how professions, skills,
crafts, recipes, tools, resources, and progression compose into a complete activity
model.

#### Scope

The composition rules apply to all activity entities that compose into larger
structures.

#### Boundaries

Composition is additive. An activity is composed of professions, skills, abilities,
talents, crafts, recipes, tools, resources, gathering activities, production activities,
experience, mastery, and progression. No composition creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive Composition | An activity is composed of its parts. |
| No Circular Composition | No composition creates a circular dependency. |
| Complete Activity | The composition produces a complete activity model. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Composition is additive | An activity is composed of its parts. |
| No composition creates a circular dependency | No cycles. |
| The composition produces a complete activity model | No gaps. |
| The composition rules are permanent | They do not change after locking. |

---

### 5.8 Inheritance Rules

#### Purpose

The inheritance rules define how activity entities share common attributes — how all
activity tables share id, user_id, world_id, life_id, activity_id, created_at,
updated_at.

#### Scope

The inheritance rules apply to all activity tables that share common attributes.

#### Boundaries

The Activity Layer does not use table inheritance (PostgreSQL INHERITS). Common
attributes are defined per table, following the Naming Rules and the Database
Architecture Blueprint. No table inherits from another table.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Common Attributes | All activity tables share id, user_id, world_id, life_id, activity_id, created_at, updated_at. |
| No Table Inheritance | No PostgreSQL INHERITS. |
| Consistent Naming | Common attributes use the same names across all tables. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All activity tables share id, user_id, world_id, life_id, activity_id, created_at, updated_at | No exceptions. |
| No PostgreSQL INHERITS | Common attributes are defined per table. |
| Common attributes use the same names | Consistent naming. |
| The inheritance rules are permanent | They do not change after locking. |

---

### 5.9 Normalization Strategy

#### Purpose

The normalization strategy defines how activity tables are normalized to reduce
redundancy and improve integrity.

#### Scope

The normalization strategy applies to all 23 activity tables.

#### Boundaries

Activity tables are normalized to at least Third Normal Form (3NF). No data is duplicated
across tables unless explicitly documented as a denormalization. No transitive
dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| 3NF | Activity tables are normalized to at least Third Normal Form. |
| No Redundancy | No data is duplicated across tables unless documented. |
| No Transitive Dependencies | No transitive dependencies. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity tables are normalized to at least 3NF | No exceptions. |
| No data is duplicated across tables unless documented | Documented denormalization only. |
| No transitive dependencies | No exceptions. |
| Foreign keys are enforced | No orphan rows. |
| The normalization strategy is permanent | It does not change after locking. |

---

### 5.10 Denormalization Strategy

#### Purpose

The denormalization strategy defines when and how activity tables are denormalized for
performance.

#### Scope

The denormalization strategy applies to any activity table that is denormalized for
performance.

#### Boundaries

Denormalization is the exception, not the rule. Every denormalization is documented with
rationale. Denormalization does not weaken integrity or compatibility. Denormalization
is additive.

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

The indexing strategy defines how activity tables are indexed for efficient queries.

#### Scope

The indexing strategy applies to all 23 activity tables and all activity queries.

#### Boundaries

All foreign key columns are indexed. Indexes are justified by evidence. No speculative
indexes. No unbounded queries.

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

The partition strategy defines how activity tables are partitioned for scalability.

#### Scope

The partition strategy applies to activity tables that grow large over time: skills,
abilities, talents, crafts, recipes, tools, resources, experience, mastery, progression.

#### Boundaries

Partitioning is by user (or by user and life for life-scoped tables). Partitioning is
additive. No partitioning weakens integrity or compatibility.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Partitioned | Large tables are partitioned by user. |
| Additive | Partitioning is additive. |
| No Integrity Weakening | Partitioning does not weaken integrity. |
| No Compatibility Weakening | Partitioning does not weaken compatibility. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Large tables are partitioned by user | skills, abilities, talents, crafts, recipes, tools, resources, experience, mastery, progression. |
| Partitioning is additive | No destructive partitioning. |
| Partitioning does not weaken integrity | Data integrity wins. |
| Partitioning does not weaken compatibility | All 10 guarantees preserved. |
| Partitioning is documented | In the blueprint and Schema.md. |
| The partition strategy is permanent | It does not change after locking. |

---

### 5.13 Synchronization Strategy

#### Purpose

The synchronization strategy defines how activity data is synced.

#### Scope

The synchronization strategy applies to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Activity Layer does not manage sync.
The game continues in a degraded state when the server is unreachable.

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
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |
| The synchronization strategy is permanent | It does not change after locking. |

---

### 5.14 Replay Strategy

#### Purpose

The replay strategy defines how activity data relates to replays.

#### Scope

The replay strategy applies to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots (except the activity identifier if the engine
references it). Replays do not query activity tables. The Activity Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| Cross-Platform Replay | Activity identifiers are platform-independent. |
| No Non-Determinism | Activity data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| Activity identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from activity data | Same state, same result. |
| The replay strategy is permanent | It does not change after locking. |

---

### 5.15 Compatibility Strategy

#### Purpose

The compatibility strategy defines how the Activity Layer preserves compatibility with
all dependent systems.

#### Scope

The compatibility strategy applies to all activity tables, all activity queries, all
activity migrations, and all activity sync operations.

#### Boundaries

All 10 compatibility guarantees are permanent. No activity table, no activity migration,
no activity sync operation weakens a compatibility guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | Activity data does not affect save snapshots. |
| Replay Compatibility | Activity data does not introduce non-determinism. |
| Migration Compatibility | Activity migrations are additive and forward-only. |
| Synchronization Compatibility | Activity data is server-authoritative and non-blocking. |
| Event Bus Compatibility | Activity data does not affect event ordering. |
| Snapshot Compatibility | Activity data does not affect existing snapshot format. |
| Save Compatibility | Activity data does not affect existing save format. |
| Ownership Compatibility | Activity data does not weaken RLS. |
| Lock Policy Compatibility | Activity data is documented and follows the lock policy. |
| Dependency Compatibility | Activity data does not create circular dependencies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are permanent | No weakening. |
| No activity table weakens a compatibility guarantee | No exceptions. |
| No activity migration weakens a compatibility guarantee | No exceptions. |
| No activity sync operation weakens a compatibility guarantee | No exceptions. |
| Compatibility is tested | Every activity table is tested against all dependent systems. |
| The compatibility strategy is permanent | It does not change after locking. |

---

## 6. Naming Convention

### Overview

This chapter defines the naming convention for the Activity Layer. It defines the naming
rules for tables, columns, primary keys, foreign keys, indexes, constraints, triggers,
enums, views, and backups. All names follow the Naming Rules v1.0.

This chapter has 10 sections. Every section includes valid examples, invalid examples,
compatibility rules, and permanent restrictions.

---

### 6.1 Table Naming

#### Purpose

The table naming section defines how activity tables are named.

#### Valid Examples

| Table Name | Description |
|------------|-------------|
| `activities` | Top-level activity entity. |
| `professions` | Profession records for a life. |
| `jobs` | Job records within a profession. |
| `skills` | Skill records for a life. |
| `abilities` | Ability records for a life. |
| `talents` | Talent records for a life. |
| `crafts` | Craft records for a life. |
| `recipes` | Recipe records within a craft. |
| `tools` | Tool records for a life. |
| `resources` | Resource records for a world. |
| `harvesting` | Harvesting records for a life. |
| `gathering` | Gathering records for a life. |
| `mining` | Mining records for a life. |
| `fishing` | Fishing records for a life. |
| `farming` | Farming records for a life. |
| `cooking` | Cooking records for a life. |
| `smithing` | Smithing records for a life. |
| `alchemy` | Alchemy records for a life. |
| `enchanting` | Enchanting records for a life. |
| `experience` | Experience records for a life. |
| `mastery` | Mastery records for a life. |
| `progression` | Progression records for a life. |

#### Invalid Examples

| Table Name | Why Invalid |
|------------|-------------|
| `Activities` | Uses uppercase. Must be `snake_case`. |
| `activity` | Singular. Must be plural. |
| `activity-table` | Uses hyphen. Must be underscore. |
| `activityTable` | Uses camelCase. Must be `snake_case`. |
| `activities_table` | Redundant suffix. |
| `tbl_activities` | Redundant prefix. |
| `ActivityProfessions` | Uses PascalCase. Must be `snake_case`. |

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

The column naming section defines how activity columns are named.

#### Valid Examples

| Column Name | Description |
|-------------|-------------|
| `id` | Primary key. |
| `user_id` | Foreign key to the Foundation Layer. |
| `world_id` | Foreign key to the World Layer. |
| `life_id` | Foreign key to the Life Layer. |
| `activity_id` | Foreign key to the activities table. |
| `profession_id` | Foreign key to the professions table. |
| `craft_id` | Foreign key to the crafts table. |
| `skill_id` | Foreign key to the skills table. |
| `name` | Name of the entity. |
| `description` | Description of the entity. |
| `level` | Level of a skill, ability, or mastery. |
| `experience_points` | Accumulated experience points. |
| `is_active` | Boolean flag for active status. |
| `created_at` | Creation timestamp. |
| `updated_at` | Last update timestamp. |

#### Invalid Examples

| Column Name | Why Invalid |
|-------------|-------------|
| `Id` | Uses uppercase. Must be `snake_case`. |
| `userId` | Uses camelCase. Must be `snake_case`. |
| `activity-id` | Uses hyphen. Must be underscore. |
| `activity_id_fk` | Redundant suffix. |
| `col_name` | Redundant prefix. |
| `ActivityId` | Uses PascalCase. Must be `snake_case`. |

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
| Common columns use the same names across all tables | `id`, `user_id`, `world_id`, `life_id`, `activity_id`, `created_at`, `updated_at`. |

---

### 6.3 Primary Key Naming

#### Purpose

The primary key naming section defines how primary keys are named.

#### Valid Examples

| Primary Key | Description |
|-------------|-------------|
| `id` | Every activity table uses `id` as its primary key column. |

#### Invalid Examples

| Primary Key | Why Invalid |
|-------------|-------------|
| `activity_id` | Reserved for foreign key to activities. Primary key must be `id`. |
| `pk_id` | Redundant prefix. |
| `Id` | Uses uppercase. Must be `snake_case`. |
| `activity_pk` | Redundant suffix. |

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
| Every activity table uses `id` as its primary key | No exceptions. |
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
| `world_id` | Foreign key to the World Layer (worlds table). |
| `life_id` | Foreign key to the Life Layer (lives table). |
| `activity_id` | Foreign key to the activities table. |
| `profession_id` | Foreign key to the professions table. |
| `craft_id` | Foreign key to the crafts table. |
| `skill_id` | Foreign key to the skills table. |
| `recipe_id` | Foreign key to the recipes table. |

#### Invalid Examples

| Foreign Key | Why Invalid |
|-------------|-------------|
| `activityId` | Uses camelCase. Must be `snake_case`. |
| `activity-id` | Uses hyphen. Must be underscore. |
| `activity_id_fk` | Redundant suffix. |
| `fk_activity_id` | Redundant prefix. |
| `ActivityId` | Uses PascalCase. Must be `snake_case`. |

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
| All foreign keys are named `<table_singular>_id` | e.g., `activity_id`, `profession_id`. |
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
| `idx_activities_user_id` | Index on activities.user_id. |
| `idx_professions_activity_id` | Index on professions.activity_id. |
| `idx_skills_life_id` | Index on skills.life_id. |
| `idx_recipes_craft_id` | Index on recipes.craft_id. |
| `idx_experience_life_id` | Index on experience.life_id. |

#### Invalid Examples

| Index Name | Why Invalid |
|-------------|-------------|
| `IdxActivitiesUserId` | Uses PascalCase. Must be `snake_case`. |
| `idx-activities-user-id` | Uses hyphens. Must be underscores. |
| `index_activities_user_id` | Wrong prefix. Must be `idx_`. |
| `activities_user_id_idx` | Wrong suffix position. Prefix must be `idx_`. |

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
| `pk_activities` | Primary key constraint on activities. |
| `fk_professions_activity_id` | Foreign key constraint on professions.activity_id. |
| `uq_activities_life_id_name` | Unique constraint on activities (life_id, name). |
| `ck_activities_name_not_empty` | Check constraint on activities.name. |
| `nn_activities_name` | Not-null constraint on activities.name. |

#### Invalid Examples

| Constraint Name | Why Invalid |
|------------------|-------------|
| `PkActivities` | Uses PascalCase. Must be `snake_case`. |
| `pk-activities` | Uses hyphen. Must be underscore. |
| `constraint_pk_activities` | Redundant prefix. |
| `pk_activities_constraint` | Redundant suffix. |

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
| `trg_activities_updated_at` | Trigger to update activities.updated_at. |
| `trg_professions_updated_at` | Trigger to update professions.updated_at. |
| `trg_experience_validate` | Trigger to validate experience before insert. |

#### Invalid Examples

| Trigger Name | Why Invalid |
|------------------|-------------|
| `TrgActivitiesUpdatedAt` | Uses PascalCase. Must be `snake_case`. |
| `trg-activities-updated-at` | Uses hyphen. Must be underscore. |
| `trigger_activities_updated_at` | Wrong prefix. Must be `trg_`. |
| `activities_updated_at_trg` | Wrong suffix position. Prefix must be `trg_`. |

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
| `profession_type` | Enum for profession types. |
| `skill_type` | Enum for skill types. |
| `ability_type` | Enum for ability types. |
| `talent_type` | Enum for talent types. |
| `craft_type` | Enum for craft types. |
| `resource_type` | Enum for resource types. |
| `gathering_type` | Enum for gathering activity types. |

#### Invalid Examples

| Enum Name | Why Invalid |
|------------|-------------|
| `ProfessionType` | Uses PascalCase. Must be `snake_case`. |
| `profession-type` | Uses hyphen. Must be underscore. |
| `enum_profession_type` | Redundant prefix. |
| `profession_type_enum` | Redundant suffix. |

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
| `activity_summary` | View summarizing activity data. |
| `profession_detail` | View joining professions with jobs. |
| `skill_with_mastery` | View joining skills with mastery records. |
| `craft_with_recipes` | View joining crafts with recipes. |

#### Invalid Examples

| View Name | Why Invalid |
|-----------|-------------|
| `ActivitySummary` | Uses PascalCase. Must be `snake_case`. |
| `activity-summary` | Uses hyphen. Must be underscore. |
| `view_activity_summary` | Redundant prefix. |
| `activity_summary_view` | Redundant suffix. |

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

The backup naming section defines how activity data backups are named.

#### Valid Examples

| Backup Name | Description |
|-------------|-------------|
| `backup_activities_20260804` | Backup of activities table on 2026-08-04. |
| `backup_professions_20260804` | Backup of professions table on 2026-08-04. |
| `backup_activity_full_20260804` | Full backup of activity schema on 2026-08-04. |

#### Invalid Examples

| Backup Name | Why Invalid |
|-------------|-------------|
| `BackupActivities20260804` | Uses PascalCase. Must be `snake_case`. |
| `backup-activities-20260804` | Uses hyphen. Must be underscore. |
| `bkp_activities_20260804` | Wrong prefix. Must be `backup_`. |
| `activities_20260804_backup` | Wrong suffix position. Prefix must be `backup_`. |

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
| All backups are named `backup_<table>_<date>` or `backup_activity_full_<date>` | `snake_case`. |
| All backup names are `snake_case` | No uppercase, no hyphens. |
| No backup is renamed after creation | Forward-only migrations. |
| All backups are documented | In the Migration Log. |
| Backups do not destroy data | Previous valid state always retained. |

---

## Sprint 1.2.5.2 Review

### Sprint Summary

**Sprint:** 1.2.5.2 — Activity Blueprint v1.0 (Chapters 4–6)
**Status:** COMPLETE
**Date:** 2026-08-04

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

- The Activity Blueprint is IN PROGRESS. Chapters 1–6 are complete. Chapters 7–16 are pending.
- Next sprint: 1.2.5.3 — Chapter 7 (Relationships), Chapter 8 (Security), Chapter 9 (Validation).

---

## 7. Relationships

### Overview

This chapter defines the relationships between the 23 activity tables and all other
database layers. It defines the relationship philosophy, per-table relationships for
all 23 activity domains, ownership rules, dependency rules, cascade rules, and future
expansion rules.

This chapter has 27 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, valid examples, and invalid examples.

---

### 7.1 Relationship Philosophy

#### Purpose

The relationship philosophy defines the permanent principles that govern the
Activity Layer's relationships.

#### Scope

The relationship philosophy applies to all 23 activity tables and all activity
relationships.

#### Boundaries

The Activity Layer follows the Database Architecture Blueprint v1.0 (LOCKED). It is
Layer 4. It depends on the Foundation Layer (Layer 1), the World Layer (Layer 2), and
the Life Layer (Layer 3). No activity table depends on a layer above the Activity Layer.
No circular dependencies. The dependency graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layered | The Activity Layer follows the layered architecture. |
| Layer 4 | The Activity Layer is Layer 4 of the 10-layer schema hierarchy. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer follows the Database Architecture Blueprint v1.0 | No exceptions. |
| The Activity Layer is Layer 4 | Per the Database Architecture Blueprint v1.0 §5. |
| The Activity Layer depends on the Foundation Layer | Via `user_id`. |
| The Activity Layer depends on the World Layer | Via `world_id`. |
| The Activity Layer depends on the Life Layer | Via `life_id`. |
| No activity table depends on a layer above the Activity Layer | No upward references. |
| No circular dependencies | The dependency graph remains a DAG. |
| No table skips a level in the hierarchy | Activities reference lives, professions reference activities, etc. |
| The relationship philosophy is permanent | It does not change after locking. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `activities.life_id` → `lives.id` | Activity depends on life. Correct level. |
| `professions.activity_id` → `activities.id` | Profession depends on activity. Correct level. |
| `skills.life_id` → `lives.id` | Skill depends on life. Correct level. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `activities.profession_id` → `professions.id` | Activity does not reference a profession. Reversed. |
| `lives.activity_id` → `activities.id` | Life depends on activity. Upward dependency. |
| `activities.parent_activity_id` → `activities.id` | No self-referencing activity hierarchy. |

---

### 7.2 Activities Relationships

#### Purpose

The activities relationships section defines the relationships between the
`activities` table and all other tables.

#### Scope

The activities relationships apply to the `activities` table, its parents (Foundation,
World, Life), and its children (professions, jobs, skills, abilities, talents, crafts,
recipes, tools, resources, harvesting, gathering, mining, fishing, farming, cooking,
smithing, alchemy, enchanting, experience, mastery, progression).

#### Boundaries

An activity belongs to exactly one life. An activity belongs to one user (via the
Foundation Layer) and one world (via the World Layer). An activity has many professions,
skills, abilities, talents, crafts, tools, and progression records. No activity
references another activity directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An activity belongs to exactly one life. |
| User Ownership | An activity references a user via `user_id`. |
| World Ownership | An activity references a world via `world_id`. |
| Many Children | An activity has many professions, skills, abilities, talents, crafts, tools, and progression records. |
| No Activity-to-Activity | No activity references another activity. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `activities.user_id` → `users.id` | Required. Foundation Layer ownership. |
| `activities.world_id` → `worlds.id` | Required. World Layer ownership. |
| `activities.life_id` → `lives.id` | Required. Life Layer parent. |
| `professions.activity_id` → `activities.id` | One-to-many. |
| `skills.activity_id` → `activities.id` | One-to-many. |
| `abilities.activity_id` → `activities.id` | One-to-many. |
| `talents.activity_id` → `activities.id` | One-to-many. |
| `crafts.activity_id` → `activities.id` | One-to-many. |
| `tools.activity_id` → `activities.id` | One-to-many. |
| `experience.activity_id` → `activities.id` | One-to-one. |
| `mastery.activity_id` → `activities.id` | One-to-one. |
| `progression.activity_id` → `activities.id` | One-to-one. |
| No activity references another activity | No self-referencing hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `activities.life_id` → `lives.id` | An activity belongs to a life. |
| `professions.activity_id` → `activities.id` | A profession belongs to an activity. |
| `skills.activity_id` → `activities.id` | A skill belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `activities.profession_id` → `professions.id` | An activity does not reference a profession. Reversed. |
| `lives.activity_id` → `activities.id` | A life does not reference an activity. Upward dependency. |
| `activities.parent_activity_id` → `activities.id` | No self-referencing activity hierarchy. |

---

### 7.3 Professions Relationships

#### Purpose

The professions relationships section defines the relationships between the
`professions` table and all other tables.

#### Scope

The professions relationships apply to the `professions` table, its parent (activities),
and its children (jobs).

#### Boundaries

A profession belongs to exactly one activity. A profession has many jobs. No profession
references a skill, ability, talent, or craft directly. No profession references another
profession.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A profession belongs to exactly one activity. |
| Many Jobs | A profession has many jobs. |
| No Direct Skill Reference | A profession does not reference a skill directly. |
| No Profession-to-Profession | No profession references another profession. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `professions.activity_id` → `activities.id` | Many-to-one. |
| `jobs.profession_id` → `professions.id` | One-to-many. |
| No profession references a skill or ability directly | Use the activity as the bridge. |
| No profession references another profession | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `professions.activity_id` → `activities.id` | A profession belongs to an activity. |
| `jobs.profession_id` → `professions.id` | A job belongs to a profession. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `professions.skill_id` → `skills.id` | A profession does not reference a skill directly. |
| `professions.parent_profession_id` → `professions.id` | No self-referencing profession hierarchy. |
| `professions.life_id` → `lives.id` | A profession references an activity, not a life. Skips hierarchy. |

---

### 7.4 Jobs Relationships

#### Purpose

The jobs relationships section defines the relationships between the `jobs` table and
all other tables.

#### Scope

The jobs relationships apply to the `jobs` table and its parent (professions).

#### Boundaries

A job belongs to exactly one profession. No job references a skill, ability, talent, or
craft directly. No job references another job.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A job belongs to exactly one profession. |
| No Direct Skill Reference | A job does not reference a skill directly. |
| No Job-to-Job | No job references another job. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `jobs.profession_id` → `professions.id` | Many-to-one. |
| No job references a skill or ability directly | Use the profession as the bridge. |
| No job references another job | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `jobs.profession_id` → `professions.id` | A job belongs to a profession. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `jobs.skill_id` → `skills.id` | A job does not reference a skill directly. |
| `jobs.parent_job_id` → `jobs.id` | No self-referencing job hierarchy. |
| `jobs.activity_id` → `activities.id` | A job references a profession, not an activity. Skips hierarchy. |

---

### 7.5 Skills Relationships

#### Purpose

The skills relationships section defines the relationships between the `skills` table
and all other tables.

#### Scope

The skills relationships apply to the `skills` table, its parent (activities), and its
children (experience, mastery).

#### Boundaries

A skill belongs to exactly one activity. A skill may have experience and mastery
records. No skill references a profession or job directly. No skill references another
skill.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A skill belongs to exactly one activity. |
| Optional Experience | A skill may have an experience record. |
| Optional Mastery | A skill may have a mastery record. |
| No Skill-to-Skill | No skill references another skill. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `skills.activity_id` → `activities.id` | Many-to-one. |
| `skills.life_id` → `lives.id` | Required. Life Layer ownership. |
| `experience.skill_id` → `skills.id` | One-to-one (optional). |
| `mastery.skill_id` → `skills.id` | One-to-one (optional). |
| No skill references a profession directly | Use the activity as the bridge. |
| No skill references another skill | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `skills.activity_id` → `activities.id` | A skill belongs to an activity. |
| `experience.skill_id` → `skills.id` | Experience for a skill. |
| `mastery.skill_id` → `skills.id` | Mastery for a skill. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `skills.profession_id` → `professions.id` | A skill does not reference a profession directly. |
| `skills.parent_skill_id` → `skills.id` | No self-referencing skill hierarchy. |
| `skills.job_id` → `jobs.id` | A skill does not reference a job. Wrong granularity. |

---

### 7.6 Abilities Relationships

#### Purpose

The abilities relationships section defines the relationships between the `abilities`
table and all other tables.

#### Scope

The abilities relationships apply to the `abilities` table and its parent (activities).

#### Boundaries

An ability belongs to exactly one activity. No ability references a profession, job, or
skill directly. No ability references another ability.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An ability belongs to exactly one activity. |
| No Direct Profession Reference | An ability does not reference a profession directly. |
| No Ability-to-Ability | No ability references another ability. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `abilities.activity_id` → `activities.id` | Many-to-one. |
| `abilities.life_id` → `lives.id` | Required. Life Layer ownership. |
| No ability references a profession or job directly | Use the activity as the bridge. |
| No ability references another ability | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `abilities.activity_id` → `activities.id` | An ability belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `abilities.profession_id` → `professions.id` | An ability does not reference a profession directly. |
| `abilities.parent_ability_id` → `abilities.id` | No self-referencing ability hierarchy. |
| `abilities.skill_id` → `skills.id` | An ability does not reference a skill. Wrong granularity. |

---

### 7.7 Talents Relationships

#### Purpose

The talents relationships section defines the relationships between the `talents` table
and all other tables.

#### Scope

The talents relationships apply to the `talents` table and its parent (activities).

#### Boundaries

A talent belongs to exactly one activity. No talent references a profession, job, skill,
or ability directly. No talent references another talent.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A talent belongs to exactly one activity. |
| No Direct Profession Reference | A talent does not reference a profession directly. |
| No Talent-to-Talent | No talent references another talent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `talents.activity_id` → `activities.id` | Many-to-one. |
| `talents.life_id` → `lives.id` | Required. Life Layer ownership. |
| No talent references a profession or skill directly | Use the activity as the bridge. |
| No talent references another talent | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `talents.activity_id` → `activities.id` | A talent belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `talents.profession_id` → `professions.id` | A talent does not reference a profession directly. |
| `talents.parent_talent_id` → `talents.id` | No self-referencing talent hierarchy. |
| `talents.ability_id` → `abilities.id` | A talent does not reference an ability. Wrong granularity. |

---

### 7.8 Crafts Relationships

#### Purpose

The crafts relationships section defines the relationships between the `crafts` table and
all other tables.

#### Scope

The crafts relationships apply to the `crafts` table, its parent (activities), and its
children (recipes).

#### Boundaries

A craft belongs to exactly one activity. A craft has many recipes. No craft references a
profession, skill, or tool directly. No craft references another craft.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A craft belongs to exactly one activity. |
| Many Recipes | A craft has many recipes. |
| No Direct Profession Reference | A craft does not reference a profession directly. |
| No Craft-to-Craft | No craft references another craft. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `crafts.activity_id` → `activities.id` | Many-to-one. |
| `crafts.life_id` → `lives.id` | Required. Life Layer ownership. |
| `recipes.craft_id` → `crafts.id` | One-to-many. |
| No craft references a profession directly | Use the activity as the bridge. |
| No craft references another craft | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `crafts.activity_id` → `activities.id` | A craft belongs to an activity. |
| `recipes.craft_id` → `crafts.id` | A recipe belongs to a craft. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `crafts.profession_id` → `professions.id` | A craft does not reference a profession directly. |
| `crafts.parent_craft_id` → `crafts.id` | No self-referencing craft hierarchy. |
| `crafts.tool_id` → `tools.id` | A craft does not reference a tool. Wrong granularity. |

---

### 7.9 Recipes Relationships

#### Purpose

The recipes relationships section defines the relationships between the `recipes` table
and all other tables.

#### Scope

The recipes relationships apply to the `recipes` table and its parent (crafts).

#### Boundaries

A recipe belongs to exactly one craft. No recipe references a profession, skill, or tool
directly. No recipe references another recipe.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A recipe belongs to exactly one craft. |
| No Direct Profession Reference | A recipe does not reference a profession directly. |
| No Recipe-to-Recipe | No recipe references another recipe. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `recipes.craft_id` → `crafts.id` | Many-to-one. |
| `recipes.activity_id` → `activities.id` | Required. Activity Layer ownership. |
| No recipe references a profession or skill directly | Use the craft as the bridge. |
| No recipe references another recipe | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `recipes.craft_id` → `crafts.id` | A recipe belongs to a craft. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `recipes.profession_id` → `professions.id` | A recipe does not reference a profession directly. |
| `recipes.parent_recipe_id` → `recipes.id` | No self-referencing recipe hierarchy. |
| `recipes.tool_id` → `tools.id` | A recipe does not reference a tool. Wrong granularity. |

---

### 7.10 Tools Relationships

#### Purpose

The tools relationships section defines the relationships between the `tools` table and
all other tables.

#### Scope

The tools relationships apply to the `tools` table and its parent (activities).

#### Boundaries

A tool belongs to exactly one activity. No tool references a profession, craft, or
recipe directly. No tool references another tool.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A tool belongs to exactly one activity. |
| No Direct Profession Reference | A tool does not reference a profession directly. |
| No Tool-to-Tool | No tool references another tool. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `tools.activity_id` → `activities.id` | Many-to-one. |
| `tools.life_id` → `lives.id` | Required. Life Layer ownership. |
| No tool references a profession or craft directly | Use the activity as the bridge. |
| No tool references another tool | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `tools.activity_id` → `activities.id` | A tool belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `tools.profession_id` → `professions.id` | A tool does not reference a profession directly. |
| `tools.parent_tool_id` → `tools.id` | No self-referencing tool hierarchy. |
| `tools.recipe_id` → `recipes.id` | A tool does not reference a recipe. Wrong granularity. |

---

### 7.11 Resources Relationships

#### Purpose

The resources relationships section defines the relationships between the `resources`
table and all other tables.

#### Scope

The resources relationships apply to the `resources` table and its parent (World Layer).

#### Boundaries

A resource belongs to a world (via the World Layer). A resource is referenced by
harvesting, gathering, mining, fishing, and farming tables. No resource references an
activity, profession, or life directly. No resource references another resource.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World Ownership | A resource belongs to a world via `world_id`. |
| Referenced by Gathering Tables | Resources are referenced by harvesting, gathering, mining, fishing, farming. |
| No Direct Activity Reference | A resource does not reference an activity directly. |
| No Resource-to-Resource | No resource references another resource. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `resources.world_id` → `worlds.id` | Required. World Layer ownership. |
| `resources.user_id` → `users.id` | Required. Foundation Layer ownership. |
| `harvesting.resource_id` → `resources.id` | One-to-many (optional). |
| `gathering.resource_id` → `resources.id` | One-to-many (optional). |
| `mining.resource_id` → `resources.id` | One-to-many (optional). |
| `fishing.resource_id` → `resources.id` | One-to-many (optional). |
| `farming.resource_id` → `resources.id` | One-to-many (optional). |
| No resource references an activity or life directly | Resources are world-scoped. |
| No resource references another resource | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `resources.world_id` → `worlds.id` | A resource belongs to a world. |
| `harvesting.resource_id` → `resources.id` | Harvesting references a resource. |
| `mining.resource_id` → `resources.id` | Mining references a resource. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `resources.activity_id` → `activities.id` | A resource does not reference an activity. Wrong layer. |
| `resources.parent_resource_id` → `resources.id` | No self-referencing resource hierarchy. |
| `resources.life_id` → `lives.id` | A resource does not reference a life. Wrong layer. |

---

### 7.12 Harvesting Relationships

#### Purpose

The harvesting relationships section defines the relationships between the `harvesting`
table and all other tables.

#### Scope

The harvesting relationships apply to the `harvesting` table, its parent (activities),
and its reference (resources).

#### Boundaries

A harvesting record belongs to exactly one activity. A harvesting record references a
resource. No harvesting record references a profession or craft directly. No harvesting
record references another harvesting record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A harvesting record belongs to exactly one activity. |
| Resource Reference | A harvesting record references a resource. |
| No Direct Profession Reference | A harvesting record does not reference a profession directly. |
| No Harvesting-to-Harvesting | No harvesting record references another harvesting record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `harvesting.activity_id` → `activities.id` | Many-to-one. |
| `harvesting.life_id` → `lives.id` | Required. Life Layer ownership. |
| `harvesting.resource_id` → `resources.id` | Many-to-one (optional). |
| No harvesting record references a profession directly | Use the activity as the bridge. |
| No harvesting record references another harvesting record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `harvesting.activity_id` → `activities.id` | Harvesting belongs to an activity. |
| `harvesting.resource_id` → `resources.id` | Harvesting references a resource. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `harvesting.profession_id` → `professions.id` | Harvesting does not reference a profession directly. |
| `harvesting.parent_harvesting_id` → `harvesting.id` | No self-referencing harvesting hierarchy. |
| `harvesting.craft_id` → `crafts.id` | Harvesting does not reference a craft. Wrong granularity. |

---

### 7.13 Gathering Relationships

#### Purpose

The gathering relationships section defines the relationships between the `gathering`
table and all other tables.

#### Scope

The gathering relationships apply to the `gathering` table, its parent (activities), and
its reference (resources).

#### Boundaries

A gathering record belongs to exactly one activity. A gathering record references a
resource. No gathering record references a profession or craft directly. No gathering
record references another gathering record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A gathering record belongs to exactly one activity. |
| Resource Reference | A gathering record references a resource. |
| No Direct Profession Reference | A gathering record does not reference a profession directly. |
| No Gathering-to-Gathering | No gathering record references another gathering record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `gathering.activity_id` → `activities.id` | Many-to-one. |
| `gathering.life_id` → `lives.id` | Required. Life Layer ownership. |
| `gathering.resource_id` → `resources.id` | Many-to-one (optional). |
| No gathering record references a profession directly | Use the activity as the bridge. |
| No gathering record references another gathering record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `gathering.activity_id` → `activities.id` | Gathering belongs to an activity. |
| `gathering.resource_id` → `resources.id` | Gathering references a resource. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `gathering.profession_id` → `professions.id` | Gathering does not reference a profession directly. |
| `gathering.parent_gathering_id` → `gathering.id` | No self-referencing gathering hierarchy. |
| `gathering.craft_id` → `crafts.id` | Gathering does not reference a craft. Wrong granularity. |

---

### 7.14 Mining Relationships

#### Purpose

The mining relationships section defines the relationships between the `mining` table
and all other tables.

#### Scope

The mining relationships apply to the `mining` table, its parent (activities), and its
reference (resources).

#### Boundaries

A mining record belongs to exactly one activity. A mining record references a resource.
No mining record references a profession or craft directly. No mining record references
another mining record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A mining record belongs to exactly one activity. |
| Resource Reference | A mining record references a resource. |
| No Direct Profession Reference | A mining record does not reference a profession directly. |
| No Mining-to-Mining | No mining record references another mining record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `mining.activity_id` → `activities.id` | Many-to-one. |
| `mining.life_id` → `lives.id` | Required. Life Layer ownership. |
| `mining.resource_id` → `resources.id` | Many-to-one (optional). |
| No mining record references a profession directly | Use the activity as the bridge. |
| No mining record references another mining record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `mining.activity_id` → `activities.id` | Mining belongs to an activity. |
| `mining.resource_id` → `resources.id` | Mining references a resource. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `mining.profession_id` → `professions.id` | Mining does not reference a profession directly. |
| `mining.parent_mining_id` → `mining.id` | No self-referencing mining hierarchy. |
| `mining.craft_id` → `crafts.id` | Mining does not reference a craft. Wrong granularity. |

---

### 7.15 Fishing Relationships

#### Purpose

The fishing relationships section defines the relationships between the `fishing` table
and all other tables.

#### Scope

The fishing relationships apply to the `fishing` table, its parent (activities), and its
reference (resources).

#### Boundaries

A fishing record belongs to exactly one activity. A fishing record references a resource.
No fishing record references a profession or craft directly. No fishing record references
another fishing record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A fishing record belongs to exactly one activity. |
| Resource Reference | A fishing record references a resource. |
| No Direct Profession Reference | A fishing record does not reference a profession directly. |
| No Fishing-to-Fishing | No fishing record references another fishing record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `fishing.activity_id` → `activities.id` | Many-to-one. |
| `fishing.life_id` → `lives.id` | Required. Life Layer ownership. |
| `fishing.resource_id` → `resources.id` | Many-to-one (optional). |
| No fishing record references a profession directly | Use the activity as the bridge. |
| No fishing record references another fishing record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `fishing.activity_id` → `activities.id` | Fishing belongs to an activity. |
| `fishing.resource_id` → `resources.id` | Fishing references a resource. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `fishing.profession_id` → `professions.id` | Fishing does not reference a profession directly. |
| `fishing.parent_fishing_id` → `fishing.id` | No self-referencing fishing hierarchy. |
| `fishing.craft_id` → `crafts.id` | Fishing does not reference a craft. Wrong granularity. |

---

### 7.16 Farming Relationships

#### Purpose

The farming relationships section defines the relationships between the `farming` table
and all other tables.

#### Scope

The farming relationships apply to the `farming` table, its parent (activities), and its
reference (resources).

#### Boundaries

A farming record belongs to exactly one activity. A farming record references a
resource. No farming record references a profession or craft directly. No farming record
references another farming record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A farming record belongs to exactly one activity. |
| Resource Reference | A farming record references a resource. |
| No Direct Profession Reference | A farming record does not reference a profession directly. |
| No Farming-to-Farming | No farming record references another farming record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `farming.activity_id` → `activities.id` | Many-to-one. |
| `farming.life_id` → `lives.id` | Required. Life Layer ownership. |
| `farming.resource_id` → `resources.id` | Many-to-one (optional). |
| No farming record references a profession directly | Use the activity as the bridge. |
| No farming record references another farming record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `farming.activity_id` → `activities.id` | Farming belongs to an activity. |
| `farming.resource_id` → `resources.id` | Farming references a resource. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `farming.profession_id` → `professions.id` | Farming does not reference a profession directly. |
| `farming.parent_farming_id` → `farming.id` | No self-referencing farming hierarchy. |
| `farming.craft_id` → `crafts.id` | Farming does not reference a craft. Wrong granularity. |

---

### 7.17 Cooking Relationships

#### Purpose

The cooking relationships section defines the relationships between the `cooking` table
and all other tables.

#### Scope

The cooking relationships apply to the `cooking` table and its parent (activities).

#### Boundaries

A cooking record belongs to exactly one activity. No cooking record references a
profession, craft, or recipe directly. No cooking record references another cooking
record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A cooking record belongs to exactly one activity. |
| No Direct Profession Reference | A cooking record does not reference a profession directly. |
| No Cooking-to-Cooking | No cooking record references another cooking record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `cooking.activity_id` → `activities.id` | Many-to-one. |
| `cooking.life_id` → `lives.id` | Required. Life Layer ownership. |
| No cooking record references a profession directly | Use the activity as the bridge. |
| No cooking record references another cooking record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `cooking.activity_id` → `activities.id` | Cooking belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `cooking.profession_id` → `professions.id` | Cooking does not reference a profession directly. |
| `cooking.parent_cooking_id` → `cooking.id` | No self-referencing cooking hierarchy. |
| `cooking.recipe_id` → `recipes.id` | Cooking does not reference a recipe. Wrong granularity. |

---

### 7.18 Smithing Relationships

#### Purpose

The smithing relationships section defines the relationships between the `smithing`
table and all other tables.

#### Scope

The smithing relationships apply to the `smithing` table and its parent (activities).

#### Boundaries

A smithing record belongs to exactly one activity. No smithing record references a
profession, craft, or recipe directly. No smithing record references another smithing
record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A smithing record belongs to exactly one activity. |
| No Direct Profession Reference | A smithing record does not reference a profession directly. |
| No Smithing-to-Smithing | No smithing record references another smithing record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `smithing.activity_id` → `activities.id` | Many-to-one. |
| `smithing.life_id` → `lives.id` | Required. Life Layer ownership. |
| No smithing record references a profession directly | Use the activity as the bridge. |
| No smithing record references another smithing record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `smithing.activity_id` → `activities.id` | Smithing belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `smithing.profession_id` → `professions.id` | Smithing does not reference a profession directly. |
| `smithing.parent_smithing_id` → `smithing.id` | No self-referencing smithing hierarchy. |
| `smithing.recipe_id` → `recipes.id` | Smithing does not reference a recipe. Wrong granularity. |

---

### 7.19 Alchemy Relationships

#### Purpose

The alchemy relationships section defines the relationships between the `alchemy` table
and all other tables.

#### Scope

The alchemy relationships apply to the `alchemy` table and its parent (activities).

#### Boundaries

An alchemy record belongs to exactly one activity. No alchemy record references a
profession, craft, or recipe directly. No alchemy record references another alchemy
record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An alchemy record belongs to exactly one activity. |
| No Direct Profession Reference | An alchemy record does not reference a profession directly. |
| No Alchemy-to-Alchemy | No alchemy record references another alchemy record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `alchemy.activity_id` → `activities.id` | Many-to-one. |
| `alchemy.life_id` → `lives.id` | Required. Life Layer ownership. |
| No alchemy record references a profession directly | Use the activity as the bridge. |
| No alchemy record references another alchemy record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `alchemy.activity_id` → `activities.id` | Alchemy belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `alchemy.profession_id` → `professions.id` | Alchemy does not reference a profession directly. |
| `alchemy.parent_alchemy_id` → `alchemy.id` | No self-referencing alchemy hierarchy. |
| `alchemy.recipe_id` → `recipes.id` | Alchemy does not reference a recipe. Wrong granularity. |

---

### 7.20 Enchanting Relationships

#### Purpose

The enchanting relationships section defines the relationships between the `enchanting`
table and all other tables.

#### Scope

The enchanting relationships apply to the `enchanting` table and its parent (activities).

#### Boundaries

An enchanting record belongs to exactly one activity. No enchanting record references a
profession, craft, or recipe directly. No enchanting record references another
enchanting record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An enchanting record belongs to exactly one activity. |
| No Direct Profession Reference | An enchanting record does not reference a profession directly. |
| No Enchanting-to-Enchanting | No enchanting record references another enchanting record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `enchanting.activity_id` → `activities.id` | Many-to-one. |
| `enchanting.life_id` → `lives.id` | Required. Life Layer ownership. |
| No enchanting record references a profession directly | Use the activity as the bridge. |
| No enchanting record references another enchanting record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `enchanting.activity_id` → `activities.id` | Enchanting belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `enchanting.profession_id` → `professions.id` | Enchanting does not reference a profession directly. |
| `enchanting.parent_enchanting_id` → `enchanting.id` | No self-referencing enchanting hierarchy. |
| `enchanting.recipe_id` → `recipes.id` | Enchanting does not reference a recipe. Wrong granularity. |

---

### 7.21 Experience Relationships

#### Purpose

The experience relationships section defines the relationships between the `experience`
table and all other tables.

#### Scope

The experience relationships apply to the `experience` table, its parent (activities),
and its reference (skills).

#### Boundaries

An experience record belongs to exactly one activity. An experience record may reference
a skill. No experience record references a profession or craft directly. No experience
record references another experience record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An experience record belongs to exactly one activity. |
| Optional Skill Reference | An experience record may reference a skill. |
| No Direct Profession Reference | An experience record does not reference a profession directly. |
| No Experience-to-Experience | No experience record references another experience record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `experience.activity_id` → `activities.id` | One-to-one. |
| `experience.life_id` → `lives.id` | Required. Life Layer ownership. |
| `experience.skill_id` → `skills.id` | One-to-one (optional). |
| No experience record references a profession directly | Use the activity as the bridge. |
| No experience record references another experience record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `experience.activity_id` → `activities.id` | Experience belongs to an activity. |
| `experience.skill_id` → `skills.id` | Experience for a skill. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `experience.profession_id` → `professions.id` | Experience does not reference a profession directly. |
| `experience.parent_experience_id` → `experience.id` | No self-referencing experience hierarchy. |
| `experience.craft_id` → `crafts.id` | Experience does not reference a craft. Wrong granularity. |

---

### 7.22 Mastery Relationships

#### Purpose

The mastery relationships section defines the relationships between the `mastery` table
and all other tables.

#### Scope

The mastery relationships apply to the `mastery` table, its parent (activities), and its
reference (skills).

#### Boundaries

A mastery record belongs to exactly one activity. A mastery record may reference a
skill. No mastery record references a profession or craft directly. No mastery record
references another mastery record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A mastery record belongs to exactly one activity. |
| Optional Skill Reference | A mastery record may reference a skill. |
| No Direct Profession Reference | A mastery record does not reference a profession directly. |
| No Mastery-to-Mastery | No mastery record references another mastery record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `mastery.activity_id` → `activities.id` | One-to-one. |
| `mastery.life_id` → `lives.id` | Required. Life Layer ownership. |
| `mastery.skill_id` → `skills.id` | One-to-one (optional). |
| No mastery record references a profession directly | Use the activity as the bridge. |
| No mastery record references another mastery record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `mastery.activity_id` → `activities.id` | Mastery belongs to an activity. |
| `mastery.skill_id` → `skills.id` | Mastery for a skill. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `mastery.profession_id` → `professions.id` | Mastery does not reference a profession directly. |
| `mastery.parent_mastery_id` → `mastery.id` | No self-referencing mastery hierarchy. |
| `mastery.craft_id` → `crafts.id` | Mastery does not reference a craft. Wrong granularity. |

---

### 7.23 Progression Relationships

#### Purpose

The progression relationships section defines the relationships between the
`progression` table and all other tables.

#### Scope

The progression relationships apply to the `progression` table and its parent
(activities).

#### Boundaries

A progression record belongs to exactly one activity. No progression record references a
profession, skill, or craft directly. No progression record references another
progression record.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A progression record belongs to exactly one activity. |
| No Direct Profession Reference | A progression record does not reference a profession directly. |
| No Progression-to-Progression | No progression record references another progression record. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `progression.activity_id` → `activities.id` | One-to-one. |
| `progression.life_id` → `lives.id` | Required. Life Layer ownership. |
| No progression record references a profession directly | Use the activity as the bridge. |
| No progression record references another progression record | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `progression.activity_id` → `activities.id` | Progression belongs to an activity. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `progression.profession_id` → `professions.id` | Progression does not reference a profession directly. |
| `progression.parent_progression_id` → `progression.id` | No self-referencing progression hierarchy. |
| `progression.skill_id` → `skills.id` | Progression does not reference a skill. Wrong granularity. |

---

### 7.24 Ownership Rules

#### Purpose

The ownership rules section defines how activity relationships enforce data ownership.

#### Scope

The ownership rules apply to all 23 activity tables and all their relationships.

#### Boundaries

Every activity row has a `user_id` referencing the Foundation Layer. Every activity row
has a `world_id` referencing the World Layer. Every activity row has a `life_id`
referencing the Life Layer. RLS scopes every query to the authenticated user. No
cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User Ownership | Every activity row has a `user_id` referencing the Foundation Layer. |
| World Ownership | Every activity row has a `world_id` referencing the World Layer. |
| Life Ownership | Every activity row has a `life_id` referencing the Life Layer. |
| RLS Enforced | RLS is enforced on every activity table. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity row has `user_id` | References the Foundation Layer. |
| Every activity row has `world_id` | References the World Layer. |
| Every activity row has `life_id` | References the Life Layer. |
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |

#### Valid Examples

| Rule Application | Description |
|------------------|-------------|
| `professions.user_id` and `professions.activity_id` | A profession has both user and activity ownership. |
| `skills.user_id` and `skills.life_id` | A skill has both user and life ownership. |
| `crafts.user_id` and `crafts.activity_id` | A craft has both user and activity ownership. |

#### Invalid Examples

| Rule Violation | Why Invalid |
|----------------|-------------|
| A profession without `user_id` | Every activity row must have `user_id`. |
| A skill without `life_id` | Every activity row must have `life_id`. |
| A craft accessible by another user | RLS prevents cross-user access. |

---

### 7.25 Dependency Rules

#### Purpose

The dependency rules section defines how activity relationships enforce the dependency
hierarchy.

#### Scope

The dependency rules apply to all 23 activity tables and all their relationships.

#### Boundaries

The Activity Layer depends on the Foundation Layer, the World Layer, and the Life Layer.
No activity table depends on a layer above the Activity Layer. No circular dependencies.
The dependency graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| No Upward Dependencies | No activity table depends on a layer above the Activity Layer. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer depends on the Foundation Layer | Via `user_id`. |
| The Activity Layer depends on the World Layer | Via `world_id`. |
| The Activity Layer depends on the Life Layer | Via `life_id`. |
| No activity table depends on a layer above the Activity Layer | No upward references. |
| No circular dependencies | The dependency graph remains a DAG. |
| No table skips a level in the hierarchy | Professions reference activities, jobs reference professions, etc. |
| The Activity Layer follows the Engine Dependency Graph | Topological build order. |

#### Valid Examples

| Dependency | Description |
|------------|-------------|
| `activities.life_id` → `lives.id` | Activity depends on life. Correct level. |
| `professions.activity_id` → `activities.id` | Profession depends on activity. Correct level. |
| `recipes.craft_id` → `crafts.id` | Recipe depends on craft. Correct level. |

#### Invalid Examples

| Dependency | Why Invalid |
|------------|-------------|
| `activities.profession_id` → `professions.id` | Activity depends on profession. Reversed. |
| `lives.activity_id` → `activities.id` | Life depends on activity. Upward dependency. |
| `professions.life_id` → `lives.id` (as primary parent) | Profession skips activity. Wrong level. |

---

### 7.26 Cascade Rules

#### Purpose

The cascade rules section defines what happens when a parent entity is deleted.

#### Scope

The cascade rules apply to all parent-child relationships in the activity layer.

#### Boundaries

Deleting a life cascades to all activities. Deleting an activity cascades to all
children. Cascade rules are documented and tested. No cascade destroys data without
documentation. Cascade flows from parent to child only.

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
| Deleting a life cascades to all activities | And their children. |
| Deleting an activity cascades to all children | Professions, jobs, skills, abilities, talents, crafts, recipes, tools, harvesting, gathering, mining, fishing, farming, cooking, smithing, alchemy, enchanting, experience, mastery, progression. |
| Deleting a profession cascades to its jobs | And their children. |
| Deleting a craft cascades to its recipes | And their children. |
| Cascade flows from parent to child only | Never child to parent. |
| All cascade rules are documented | In the blueprint and Schema.md. |
| All cascade rules are tested | Against all dependent layers. |

#### Valid Examples

| Cascade | Description |
|---------|-------------|
| Delete life → delete all activities | Cascade from life to activities. |
| Delete activity → delete all professions | Cascade from activity to professions. |
| Delete craft → delete all recipes | Cascade from craft to recipes. |

#### Invalid Examples

| Cascade | Why Invalid |
|---------|-------------|
| Delete profession → delete activity | Cascade never flows from child to parent. |
| Delete recipe → delete craft | Cascade never flows from child to parent. |
| Delete skill → delete life | Cascade never flows from child to parent. |

---

### 7.27 Future Expansion Rules

#### Purpose

The future expansion rules section defines how new relationships are added to the
Activity Layer.

#### Scope

The future expansion rules apply to all future relationships added to the Activity
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
| No new relationship creates a circular dependency | The Activity Layer remains a DAG. |
| No new relationship weakens a guarantee | All 10 guarantees preserved. |
| New relationships are documented before implementation | In the ERD, blueprint, and Schema.md. |
| New relationships are tested against dependent layers | No breaking changes. |

#### Valid Examples

| Expansion | Description |
|-----------|-------------|
| Add `skill_prerequisites` junction table | New relationship between skills. Additive. |
| Add `recipe_tools` junction table | New relationship between recipes and tools. Additive. |
| Add `profession_crafts` junction table | New relationship between professions and crafts. Additive. |

#### Invalid Examples

| Expansion | Why Invalid |
|-----------|-------------|
| Remove `professions.activity_id` | No existing relationship is removed. |
| Add `activities.parent_activity_id` | Creates a self-referencing hierarchy. Violates no-cycles rule. |
| Add `skills.profession_id` | Skips hierarchy. A skill does not reference a profession directly. |

---

## 8. Security

### Overview

This chapter defines the security architecture for the Activity Layer. It defines the
security philosophy, authentication and authorization boundaries, ownership protection,
row-level security boundaries, synchronization and replay protection, migration and
snapshot protection, backup and integrity protection, corruption detection, trust
boundaries, threat model, escalation procedures, and recovery procedures.

This chapter has 16 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 8.1 Security Philosophy

#### Purpose

The security philosophy defines the permanent principles that govern the Activity
Layer's security architecture.

#### Scope

The security philosophy applies to all 23 activity tables and all activity operations.

#### Boundaries

RLS is the primary security boundary. The service role key is server-side only. No
client-side authority. No cross-user access from the client. Security is deterministic.

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

The authentication boundaries section defines how the Activity Layer relates to
authentication.

#### Scope

The authentication boundaries apply to all activity tables and all access paths.

#### Boundaries

The Activity Layer does not manage authentication. The Foundation Layer manages
authentication. The Activity Layer references the user ID from the Foundation Layer.
No activity table stores passwords, tokens, or session data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Auth Management | The Activity Layer does not manage authentication. |
| User ID Reference | The Activity Layer references the user ID from the Foundation Layer. |
| No Credentials | No activity table stores passwords, tokens, or session data. |
| Foundation Dependency | Authentication is handled by the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer does not manage authentication | The Foundation Layer does. |
| The Activity Layer references the user ID | Via `user_id`. |
| No activity table stores passwords or tokens | No exceptions. |
| No activity table stores session data | No exceptions. |
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

The authorization boundaries section defines how the Activity Layer relates to
authorization.

#### Scope

The authorization boundaries apply to all activity tables, all RLS policies, and all
access paths.

#### Boundaries

The Activity Layer does not manage authorization. The Foundation Layer manages
authorization (roles, permissions). The Activity Layer enforces authorization via RLS
policies. No activity table stores role or permission definitions.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Authorization Management | The Activity Layer does not manage authorization. |
| RLS Enforcement | The Activity Layer enforces authorization via RLS. |
| No Role Storage | No activity table stores role or permission definitions. |
| Foundation Dependency | Authorization is managed by the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer does not manage authorization | The Foundation Layer does. |
| The Activity Layer enforces authorization via RLS | Four policies per table. |
| No activity table stores role or permission definitions | No exceptions. |
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

The ownership protection section defines how the Activity Layer protects data
ownership.

#### Scope

The ownership protection applies to all activity tables and all RLS policies.

#### Boundaries

Every activity row has a `user_id` referencing the Foundation Layer. RLS scopes every
query to the authenticated user. No cross-user access from the client. The service role
key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User Ownership | Every activity row has a `user_id`. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity row has `user_id` | References the Foundation Layer. |
| RLS is enabled on every activity table | No exceptions. |
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

The row-level security boundaries section defines how RLS is applied to activity
tables.

#### Scope

The row-level security boundaries apply to all 23 activity tables and all RLS policies.

#### Boundaries

RLS is enabled on every activity table. Four policies per table (SELECT, INSERT,
UPDATE, DELETE). Policies use `auth.uid()` for ownership checks. No `FOR ALL` policies.
No `USING (true)` policies (activity data is not public).

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enabled | RLS is enabled on every activity table. |
| Four Policies | Four policies per table (SELECT, INSERT, UPDATE, DELETE). |
| `auth.uid()` Checks | Policies use `auth.uid()` for ownership checks. |
| No FOR ALL | No `FOR ALL` policies. |
| No USING (true) | No `USING (true)` policies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| Policies use `auth.uid()` for ownership checks | No `current_user`. |
| No `FOR ALL` policies | No exceptions. |
| No `USING (true)` policies | No exceptions (activity data is not public). |
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

The synchronization protection section defines how the Activity Layer protects data
during synchronization.

#### Scope

The synchronization protection applies to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

#### Boundaries

Sync is server-authoritative and non-blocking. No client-side authority. No client-side
conflict resolution. Sync does not corrupt data.

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
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
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

The replay protection section defines how the Activity Layer protects data during
replays.

#### Scope

The replay protection applies to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots (except the activity identifier if the engine
references it). Replays do not query activity tables. No non-determinism from activity
data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. |
| No Replay Queries | Replays do not query activity tables. |
| No Non-Determinism | Activity data does not introduce non-determinism. |
| Deterministic Identifiers | Activity identifiers are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| No non-determinism from activity data | Same state, same result. |
| No replay protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay protection does not affect save snapshots. |
| Replay Compatibility | Activity data does not introduce non-determinism. |
| Migration Compatibility | Replay protection is never weakened. |
| Synchronization Compatibility | Replay protection is server-authoritative. |
| Event Bus Compatibility | Replay protection does not affect event ordering. |

---

### 8.8 Migration Protection

#### Purpose

The migration protection section defines how the Activity Layer protects data during
migrations.

#### Scope

The migration protection applies to all activity migrations — any additive change to
the activity schema.

#### Boundaries

Migrations are additive, forward-only, and backward compatible. No migration drops a
table, drops a column, renames a column, or changes a column type. No migration weakens
RLS.

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

The snapshot protection section defines how the Activity Layer protects data from
snapshot corruption.

#### Scope

The snapshot protection applies to the boundary between the Activity Layer and the
Save Engine's snapshot system.

#### Boundaries

Activity data is not serialized into engine snapshots. The Save Engine references
activity identifiers; it does not serialize activity tables. No activity data affects
existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Activity Serialization | Activity tables are not serialized into snapshots. |
| Identifier Reference Only | The Save Engine references activity identifiers. |
| No Format Change | Activity data does not affect existing snapshot format. |
| Zero Snapshot Overhead | Activity data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity tables are not in snapshots | Except the activity identifier if referenced. |
| The Save Engine references activity identifiers | No activity data in snapshots. |
| Activity data does not affect existing snapshot format | No format changes. |
| Activity data does not increase snapshot size | Zero overhead. |
| No snapshot protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Activity data does not affect save snapshots. |
| Replay Compatibility | Snapshot protection is deterministic. |
| Migration Compatibility | Snapshot protection is never weakened. |
| Synchronization Compatibility | Snapshot protection is server-authoritative. |
| Event Bus Compatibility | Snapshot protection does not affect event ordering. |

---

### 8.10 Backup Protection

#### Purpose

The backup protection section defines how the Activity Layer protects data during
backups.

#### Scope

The backup protection applies to all activity data that is backed up.

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

The integrity protection section defines how the Activity Layer protects data
integrity.

#### Scope

The integrity protection applies to all constraints, RLS policies, and validation
checks in the activity layer.

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

The corruption detection section defines how the Activity Layer detects data
corruption.

#### Scope

The corruption detection applies to all activity tables and all activity operations.

#### Boundaries

Corruption is detected through constraints, referential integrity, and validation
checks. Corruption is reported, not silently ignored. No corruption detection destroys
data.

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

The trust boundaries section defines the trust boundaries for the Activity Layer.

#### Scope

The trust boundaries apply to all activity tables, all access paths, and all trust
decisions.

#### Boundaries

The client is untrusted. The server is trusted. The service role key is server-side
only. RLS is the trust boundary between the client and the database.

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

The threat model section defines the threats the Activity Layer must defend against.

#### Scope

The threat model applies to all activity tables and all activity operations.

#### Boundaries

The Activity Layer defends against unauthorized access, cross-user access, data
corruption, replay non-determinism, and sync corruption. It does not defend against
server compromise (that is the Foundation Layer's responsibility).

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

The escalation procedures apply to all security incidents involving activity data.

#### Boundaries

Security incidents are reported to the Lead Database Architect. The Lead Database
Architect escalates to the Lead Architect. No incident is silently ignored. No incident
destroys data.

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

The recovery procedures section defines how the Activity Layer recovers from security
incidents.

#### Scope

The recovery procedures apply to all security incidents involving activity data.

#### Boundaries

Recovery restores the previous valid state. Recovery does not destroy data. Recovery is
documented. Recovery is tested.

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

This chapter defines the validation architecture for the Activity Layer. It defines the
validation philosophy, structural validation, ownership validation, relationship
validation, dependency validation, synchronization validation, replay validation,
migration validation, snapshot validation, backup validation, integrity validation,
corruption validation, reporting procedures, and acceptance procedures.

This chapter has 14 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and validation rules.

---

### 9.1 Validation Philosophy

#### Purpose

The validation philosophy defines the permanent principles that govern the Activity
Layer's validation architecture.

#### Scope

The validation philosophy applies to all 23 activity tables and all activity
operations.

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
| Every activity table has constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Every activity table has RLS | Four policies per table. |
| Every validation failure is logged | No silent failures. |
| Every validation failure is surfaced | Visible to the user or operator. |
| Validation is tested | Against all dependent layers. |

---

### 9.2 Structural Validation

#### Purpose

The structural validation section defines how activity data is validated for structural
correctness.

#### Scope

The structural validation applies to all 23 activity tables and their columns.

#### Boundaries

Structural validation enforces NOT NULL, UNIQUE, CHECK constraints. It ensures every row
has the required columns. It ensures no column has an invalid value.

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
| Required columns are NOT NULL | `id`, `user_id`, `world_id`, `life_id`, `activity_id`, `created_at`, `updated_at`. |
| Unique columns are UNIQUE | e.g., `activities.life_id` per life (one activity per life). |
| Check constraints validate column values | e.g., name not empty, level >= 0. |
| No column has an invalid value | Constraints prevent it. |
| No structural validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `id` is NOT NULL and UNIQUE | Every table. |
| `user_id` is NOT NULL | Every table. |
| `world_id` is NOT NULL | Every table. |
| `life_id` is NOT NULL | Every table. |
| `activity_id` is NOT NULL | Every child table (professions, skills, etc.). |
| `created_at` is NOT NULL | Every table. |
| `updated_at` is NOT NULL | Every table. |
| `name` is NOT NULL and not empty | Where applicable. |
| `level` is >= 0 | Where applicable (skills, abilities, mastery). |
| `experience_points` is >= 0 | Where applicable (experience). |
| Unique constraints are documented | In the blueprint and Schema.md. |

---

### 9.3 Ownership Validation

#### Purpose

The ownership validation section defines how activity data is validated for ownership
correctness.

#### Scope

The ownership validation applies to all activity tables and all RLS policies.

#### Boundaries

Ownership validation ensures every row has a valid `user_id`, `world_id`, and
`life_id`. It ensures RLS scopes every query. No cross-user access.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid User ID | Every row has a valid `user_id`. |
| Valid World ID | Every row has a valid `world_id`. |
| Valid Life ID | Every row has a valid `life_id`. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every row has a valid `user_id` | References the Foundation Layer. |
| Every row has a valid `world_id` | References the World Layer. |
| Every row has a valid `life_id` | References the Life Layer. |
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| No ownership validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `user_id` is NOT NULL and references a valid user | Every table. |
| `world_id` is NOT NULL and references a valid world | Every table. |
| `life_id` is NOT NULL and references a valid life | Every table. |
| INSERT policy WITH CHECK ensures `user_id = auth.uid()` | Every table. |
| UPDATE policy WITH CHECK ensures `user_id = auth.uid()` | Every table. |
| SELECT policy USING ensures `user_id = auth.uid()` | Every table. |
| DELETE policy USING ensures `user_id = auth.uid()` | Every table. |

---

### 9.4 Relationship Validation

#### Purpose

The relationship validation section defines how activity data is validated for
relationship correctness.

#### Scope

The relationship validation applies to all foreign keys in the activity layer.

#### Boundaries

Relationship validation ensures all foreign keys are valid. No orphan rows. Referential
integrity is enforced.

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
| Cascade rules are enforced | Per Chapter 7 §7.26. |
| No relationship validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `activities.life_id` references a valid `lives.id` | Enforced. |
| `professions.activity_id` references a valid `activities.id` | Enforced. |
| `jobs.profession_id` references a valid `professions.id` | Enforced. |
| `skills.activity_id` references a valid `activities.id` | Enforced. |
| `abilities.activity_id` references a valid `activities.id` | Enforced. |
| `talents.activity_id` references a valid `activities.id` | Enforced. |
| `crafts.activity_id` references a valid `activities.id` | Enforced. |
| `recipes.craft_id` references a valid `crafts.id` | Enforced. |
| `tools.activity_id` references a valid `activities.id` | Enforced. |
| `resources.world_id` references a valid `worlds.id` | Enforced. |
| `harvesting.resource_id` references a valid `resources.id` | Enforced. |
| `gathering.resource_id` references a valid `resources.id` | Enforced. |
| `mining.resource_id` references a valid `resources.id` | Enforced. |
| `fishing.resource_id` references a valid `resources.id` | Enforced. |
| `farming.resource_id` references a valid `resources.id` | Enforced. |
| `experience.skill_id` references a valid `skills.id` | Enforced. |
| `mastery.skill_id` references a valid `skills.id` | Enforced. |
| All foreign keys are indexed | No unindexed foreign keys. |

---

### 9.5 Dependency Validation

#### Purpose

The dependency validation section defines how activity data is validated for dependency
correctness.

#### Scope

The dependency validation applies to all cross-layer dependencies involving the
Activity Layer.

#### Boundaries

Dependency validation ensures no circular dependencies. No upward dependencies. The
dependency graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Circular Dependencies | The dependency graph is a DAG. |
| No Upward Dependencies | The Activity Layer does not depend on any layer above it. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| No circular dependencies | The dependency graph is a DAG. |
| No upward dependencies | The Activity Layer does not depend on any layer above it. |
| The Activity Layer depends on the Foundation Layer | Via `user_id`. |
| The Activity Layer depends on the World Layer | Via `world_id`. |
| The Activity Layer depends on the Life Layer | Via `life_id`. |
| No table skips a level in the hierarchy | Professions reference activities, jobs reference professions, etc. |
| No dependency validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No activity table references a layer above the Activity Layer | No upward references. |
| No activity table creates a circular dependency | DAG preserved. |
| Every activity table has `user_id` referencing the Foundation Layer | Foundation dependency. |
| Every activity table has `world_id` referencing the World Layer | World dependency. |
| Every activity table has `life_id` referencing the Life Layer | Life dependency. |
| No table skips a level | Hierarchy preserved. |
| The Activity Layer follows the Engine Dependency Graph | Topological build order. |

---

### 9.6 Synchronization Validation

#### Purpose

The synchronization validation section defines how activity data is validated during
synchronization.

#### Scope

The synchronization validation applies to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

#### Boundaries

Sync validation is server-authoritative and non-blocking. No client-side authority. No
sync corruption.

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
| The Activity Layer does not manage sync validation | The Synchronization Architecture does. |
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

The replay validation section defines how activity data is validated for replay
compatibility.

#### Scope

The replay validation applies to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Replay validation ensures no non-determinism from activity data. Activity identifiers
are deterministic. Replays do not query activity tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Non-Determinism | Activity data does not introduce non-determinism. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| No Replay Queries | Replays do not query activity tables. |
| Cross-Platform | Activity identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity identifiers are deterministic | Never change after creation. |
| No non-determinism from activity data | Same state, same result. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are platform-independent | Cross-platform replay works. |
| No replay validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Activity identifiers are never changed after creation | Deterministic. |
| No wall-clock time affects activity data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects activity data in snapshots | No random non-determinism. |
| Activity identifiers are platform-independent | Cross-platform. |
| Replays do not query activity tables | Zero overhead. |

---

### 9.8 Migration Validation

#### Purpose

The migration validation section defines how activity migrations are validated.

#### Scope

The migration validation applies to all activity migrations — any additive change to
the activity schema.

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

The snapshot validation section defines how activity data is validated for snapshot
compatibility.

#### Scope

The snapshot validation applies to the boundary between the Activity Layer and the
Save Engine's snapshot system.

#### Boundaries

Snapshot validation ensures activity data is not in engine snapshots (except the
activity identifier). No activity data affects existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Activity Serialization | Activity tables are not serialized into snapshots. |
| No Format Change | Activity data does not affect existing snapshot format. |
| Zero Snapshot Overhead | Activity data does not increase snapshot size. |
| Identifier Reference Only | The Save Engine references activity identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity tables are not in snapshots | Except the activity identifier if referenced. |
| Activity data does not affect existing snapshot format | No format changes. |
| Activity data does not increase snapshot size | Zero overhead. |
| The Save Engine references activity identifiers | No activity data in snapshots. |
| No snapshot validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No activity table is serialized into engine snapshots | Except the activity identifier. |
| The Save Engine references activity identifiers only | No activity data. |
| Activity data does not change snapshot format | Backward compatible. |
| Activity data does not increase snapshot size | Zero overhead. |
| Snapshot validation is tested | Against the Save Engine. |

---

### 9.10 Backup Validation

#### Purpose

The backup validation section defines how activity data backups are validated.

#### Scope

The backup validation applies to all activity data that is backed up.

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

The integrity validation section defines how activity data is validated for overall
integrity.

#### Scope

The integrity validation applies to all constraints, RLS policies, and validation
checks in the activity layer.

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

The corruption validation section defines how activity data is validated for
corruption.

#### Scope

The corruption validation applies to all activity tables and all activity operations.

#### Boundaries

Corruption validation detects invalid data, orphan rows, and unauthorized access.
Corruption is reported, not silently ignored. No corruption validation destroys data.

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

The reporting procedures apply to all validation failures in the activity layer.

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
Activity Layer is locked.

#### Scope

The acceptance procedures apply to all validation checks in the activity layer before
the blueprint is locked.

#### Boundaries

All validation checks must pass before the blueprint is locked. No validation check is
skipped. No validation check is weakened. The Lead Architect approves the validation
results.

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
| All ownership validation checks pass | RLS, user_id, world_id, life_id. |
| All relationship validation checks pass | Foreign keys, no orphan rows. |
| All dependency validation checks pass | No circular dependencies, no upward dependencies. |
| All synchronization validation checks pass | Server-authoritative, non-blocking. |
| All replay validation checks pass | No non-determinism, deterministic identifiers. |
| All migration validation checks pass | Additive, forward-only, backward compatible. |
| All snapshot validation checks pass | No activity serialization, no format change. |
| All backup validation checks pass | Atomic, no data destruction. |
| All integrity validation checks pass | Constraints, RLS, referential integrity. |
| All corruption validation checks pass | Detection, reporting, no data destruction. |
| The Lead Architect signs off on all validation results | No exceptions. |

---

## Sprint 1.2.5.3 Review

### Sprint Summary

**Sprint:** 1.2.5.3 — Activity Blueprint v1.0 (Chapters 7–9)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 7 | Relationships | 27 sections: relationship philosophy, activities/professions/jobs/skills/abilities/talents/crafts/recipes/tools/resources/harvesting/gathering/mining/fishing/farming/cooking/smithing/alchemy/enchanting/experience/mastery/progression relationships, ownership rules, dependency rules, cascade rules, future expansion rules. Each with purpose, scope, boundaries, guarantees, permanent rules, valid examples, invalid examples. |
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

- The Activity Blueprint is IN PROGRESS. Chapters 1–9 are complete. Chapters 10–16 are pending.
- Next sprint: 1.2.5.4 — Chapter 10 (Performance), Chapter 11 (Testing).

---

## 10. Performance Architecture

### Overview

This chapter defines the performance architecture for the Activity Layer. It defines
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

The performance philosophy defines the permanent principles that govern the Activity
Layer's performance architecture.

#### Scope

The performance philosophy applies to all 23 activity tables and all activity
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
decisions in the Activity Layer.

#### Scope

The performance principles apply to all 23 activity tables and all activity operations.

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

The storage optimization section defines how activity tables are optimized for storage
efficiency.

#### Scope

The storage optimization applies to all 23 activity tables.

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

The index optimization section defines how activity tables are indexed for query
efficiency.

#### Scope

The index optimization applies to all 23 activity tables and all activity queries.

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

The partition optimization section defines how activity tables are partitioned for
scalability.

#### Scope

The partition optimization applies to activity tables that grow large over time:
experience, mastery, progression, harvesting, gathering, mining, fishing, farming.

#### Boundaries

Partitioning is by life (or by life and time for experience and progression tables).
Partitioning is additive. No partitioning weakens integrity or compatibility.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Life-Partitioned | Large tables are partitioned by life. |
| Additive | Partitioning is additive. |
| No Integrity Weakening | Partitioning does not weaken integrity. |
| No Compatibility Weakening | Partitioning does not weaken compatibility. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Large tables are partitioned by life | experience, mastery, progression, harvesting, gathering, mining, fishing, farming. |
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

The query optimization section defines how activity queries are optimized for
performance.

#### Scope

The query optimization applies to all activity queries.

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

The synchronization optimization section defines how activity data sync is optimized
for performance.

#### Scope

The synchronization optimization applies to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

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
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
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

The replay optimization section defines how activity data is optimized for replay
performance.

#### Scope

The replay optimization applies to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots. Replays do not query activity tables. The
Activity Layer has zero replay overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| No Non-Determinism | Activity data does not introduce non-determinism. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| Cross-Platform | Activity identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| No replay optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay optimization does not affect save snapshots. |
| Replay Compatibility | Activity data does not introduce non-determinism. |
| Migration Compatibility | Replay optimization is never weakened. |
| Synchronization Compatibility | Replay optimization is server-authoritative. |
| Event Bus Compatibility | Replay optimization does not affect event ordering. |

---

### 10.9 Snapshot Optimization

#### Purpose

The snapshot optimization section defines how activity data is optimized for snapshot
performance.

#### Scope

The snapshot optimization applies to the boundary between the Activity Layer and the
Save Engine's snapshot system.

#### Boundaries

Activity data is not serialized into engine snapshots. The Save Engine references
activity identifiers only. No activity data affects existing snapshot format. Zero
snapshot overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Activity Serialization | Activity tables are not serialized into snapshots. |
| Zero Snapshot Overhead | Activity data does not increase snapshot size. |
| No Format Change | Activity data does not affect existing snapshot format. |
| Identifier Reference Only | The Save Engine references activity identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity tables are not in snapshots | Except the activity identifier if referenced. |
| Activity data does not increase snapshot size | Zero overhead. |
| Activity data does not affect existing snapshot format | No format changes. |
| The Save Engine references activity identifiers | No activity data in snapshots. |
| No snapshot optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Activity data does not affect save snapshots. |
| Replay Compatibility | Snapshot optimization is deterministic. |
| Migration Compatibility | Snapshot optimization is never weakened. |
| Synchronization Compatibility | Snapshot optimization is server-authoritative. |
| Event Bus Compatibility | Snapshot optimization does not affect event ordering. |

---

### 10.10 Backup Optimization

#### Purpose

The backup optimization section defines how activity data backups are optimized for
performance.

#### Scope

The backup optimization applies to all activity data that is backed up.

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

The monitoring strategy section defines how activity data performance is monitored.

#### Scope

The monitoring strategy applies to all 23 activity tables and all activity operations.

#### Boundaries

Monitoring is non-blocking. Monitoring does not affect gameplay. The Activity Layer
does not define the monitoring framework. Monitoring provides row counts, table
sizes, and query performance characteristics.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring does not block gameplay. |
| Observable | Activity data is observable through metrics. |
| No Monitoring Framework | The Activity Layer does not define the monitoring framework. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| Monitoring provides row counts, table sizes, and query performance | Observable. |
| The Activity Layer does not define the monitoring framework | It uses the project's monitoring standards. |
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

The profiling strategy section defines how activity data performance is profiled.

#### Scope

The profiling strategy applies to all 23 activity tables and all activity queries.

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

The benchmark strategy section defines how activity data performance is benchmarked.

#### Scope

The benchmark strategy applies to all 23 activity tables and all activity queries.

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

The storage limits section defines the storage limits for activity data.

#### Scope

The storage limits apply to all 23 activity tables.

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

The memory limits section defines the memory limits for activity data operations.

#### Scope

The memory limits apply to all activity queries and activity operations.

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

The performance targets section defines the performance targets for activity data
operations.

#### Scope

The performance targets apply to all 23 activity tables and all activity queries.

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

This chapter defines the testing architecture for the Activity Layer. It defines the
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

The testing philosophy defines the permanent principles that govern the Activity
Layer's testing architecture.

#### Scope

The testing philosophy applies to all 23 activity tables and all activity operations.

#### Boundaries

Testing is deterministic. Testing is reproducible. Testing does not destroy data.
Testing is documented. The Activity Layer does not define the testing framework — it
uses the Testing Architecture.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Testing is deterministic. |
| Reproducible | Testing is reproducible. |
| No Data Destruction | Testing does not destroy data. |
| Documented | Testing is documented. |
| No Framework Definition | The Activity Layer does not define the testing framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing is deterministic | Same input, same result. |
| Testing is reproducible | Can be re-run with same results. |
| Testing does not destroy data | Data preservation is the cardinal rule. |
| Testing is documented | In the blueprint. |
| The Activity Layer uses the Testing Architecture | It does not define it. |
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
decisions in the Activity Layer.

#### Scope

The testing principles apply to all 23 activity tables and all activity operations.

#### Boundaries

Every activity table is tested. Every migration is tested. Every RLS policy is
tested. No test is skipped. No test is weakened.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Every Table Tested | Every activity table is tested. |
| Every Migration Tested | Every migration is tested. |
| Every RLS Policy Tested | Every RLS policy is tested. |
| No Skipped Tests | No test is skipped. |
| No Weakened Tests | No test is weakened. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity table is tested | No exceptions. |
| Every migration is tested | Against all dependent layers. |
| Every RLS policy is tested | Four per table. |
| No test is skipped | No exceptions. |
| No test is weakened | No exceptions. |
| No testing principle is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 23 activity tables have tests | No exceptions. |
| All migrations have tests | No exceptions. |
| All RLS policies have tests | Four per table. |
| No test is skipped or weakened | No exceptions. |

---

### 11.3 Testing Environment

#### Purpose

The testing environment section defines the environment in which activity tests run.

#### Scope

The testing environment applies to all activity tests.

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

The testing stages section defines the stages of testing for the Activity Layer.

#### Scope

The testing stages apply to all activity tests.

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

The unit testing section defines how individual activity tables are tested in
isolation.

#### Scope

The unit testing applies to all 23 activity tables.

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
| Every activity table has unit tests | No exceptions. |
| Unit tests cover constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Unit tests cover RLS policies | Four per table. |
| Unit tests cover column validation | No invalid values. |
| No unit testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 23 activity tables have unit tests | No exceptions. |
| All constraints are tested | NOT NULL, UNIQUE, CHECK, FK. |
| All RLS policies are tested | Four per table. |
| All column validations are tested | No invalid values. |
| All unit tests are deterministic and reproducible | No exceptions. |

---

### 11.6 Integration Testing

#### Purpose

The integration testing section defines how activity tables are tested together and
with dependent layers.

#### Scope

The integration testing applies to all 23 activity tables and their relationships
with the Foundation Layer, World Layer, and Life Layer.

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
| All cross-layer dependencies are tested | Foundation Layer, World Layer, Life Layer. |
| Integration tests are deterministic | No non-determinism. |
| Integration tests are reproducible | Can be re-run. |
| No integration testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All foreign keys are tested | Referential integrity. |
| All cascade rules are tested | Per Chapter 7 §7.26. |
| All Foundation Layer dependencies are tested | user_id references. |
| All World Layer dependencies are tested | world_id references. |
| All Life Layer dependencies are tested | life_id references. |
| All integration tests are deterministic and reproducible | No exceptions. |

---

### 11.7 Regression Testing

#### Purpose

The regression testing section defines how activity tests prevent regressions.

#### Scope

The regression testing applies to all 23 activity tables and all activity migrations.

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

The migration testing section defines how activity migrations are tested.

#### Scope

The migration testing applies to all activity migrations — any additive change to the
activity schema.

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

The synchronization testing section defines how activity data sync is tested.

#### Scope

The synchronization testing applies to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

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

The replay testing section defines how activity data is tested for replay
compatibility.

#### Scope

The replay testing applies to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Replay tests verify no non-determinism from activity data. Replay tests verify activity
identifiers are deterministic. Replay tests verify replays do not query activity
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

The backup testing section defines how activity data backups are tested.

#### Scope

The backup testing applies to all activity data that is backed up.

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

The recovery testing section defines how activity data recovery is tested.

#### Scope

The recovery testing applies to all activity data recovery procedures.

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

The validation testing section defines how activity data validation is tested.

#### Scope

The validation testing applies to all constraints, RLS policies, and validation
checks in the activity layer.

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

The stress testing section defines how activity data is tested under high load.

#### Scope

The stress testing applies to all 23 activity tables and all activity queries.

#### Boundaries

Stress tests verify the Activity Layer handles high load. Stress tests verify queries
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

The performance testing section defines how activity data performance is tested.

#### Scope

The performance testing applies to all 23 activity tables and all activity queries.

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

The compatibility testing section defines how activity data is tested for
compatibility with all dependent systems.

#### Scope

The compatibility testing applies to all 23 activity tables and all dependent
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

The deterministic testing section defines how activity data is tested for
determinism.

#### Scope

The deterministic testing applies to all 23 activity tables and all activity operations.

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

The security testing section defines how activity data security is tested.

#### Scope

The security testing applies to all 23 activity tables, all RLS policies, and all
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

The reporting strategy section defines how activity test results are reported.

#### Scope

The reporting strategy applies to all activity tests.

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

## Sprint 1.2.5.4 Review

### Sprint Summary

**Sprint:** 1.2.5.4 — Activity Blueprint v1.0 (Chapters 10–11)
**Status:** COMPLETE
**Date:** 2026-08-04

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

- The Activity Blueprint is IN PROGRESS. Chapters 1–11 are complete. Chapters 12–16 are pending.
- Next sprint: 1.2.5.5 — Chapter 12 (Future Expansion), Chapter 13 (Dependencies), Chapter 14 (Completion Checklist).

---

## 12. Future Expansion

### Overview

This chapter defines the future expansion architecture for the Activity Layer. It
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
expansion of the Activity Layer.

#### Scope

The expansion philosophy applies to all 23 activity tables and all future changes to
the Activity Layer.

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
| No expansion creates a circular dependency | The Activity Layer remains a DAG. |
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

The horizontal expansion section defines how new tables are added to the Activity
Layer at the same hierarchy level as existing tables.

#### Scope

The horizontal expansion applies to all future tables added to the Activity Layer.

#### Boundaries

New tables are additive. New tables follow the Naming Rules v1.0. New tables have
RLS enabled with four policies. New tables have `user_id`, `world_id`, and
`life_id`. No new table creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | New tables are additive. |
| Naming Compliance | New tables follow the Naming Rules v1.0. |
| RLS Enabled | New tables have RLS with four policies. |
| Ownership | New tables have `user_id`, `world_id`, and `life_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| New tables are additive | No removal of existing tables. |
| New tables follow the Naming Rules v1.0 | `snake_case` table names. |
| New tables have RLS enabled | Four policies per table. |
| New tables have `user_id`, `world_id`, and `life_id` | Ownership references. |
| No new table creates a circular dependency | The Activity Layer remains a DAG. |
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

The vertical expansion section defines how new columns are added to existing activity
tables.

#### Scope

The vertical expansion applies to all future columns added to existing activity
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

The repository expansion section defines how new activity data repositories are added
to the Activity Layer.

#### Scope

The repository expansion applies to all future data repositories added to the Activity
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
| No new repository creates a circular dependency | The Activity Layer remains a DAG. |
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

The migration expansion section defines how new migrations extend the Activity Layer.

#### Scope

The migration expansion applies to all future migrations to the Activity Layer.

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

The replay expansion section defines how the Activity Layer expands while preserving
replay compatibility.

#### Scope

The replay expansion applies to all future expansion that could affect replays:
activity identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity identifiers are deterministic and never change after creation. No expansion
introduces non-determinism. No expansion affects existing snapshot format. Replays
do not query activity tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Identifiers | Activity identifiers are deterministic. |
| No Non-Determinism | No expansion introduces non-determinism. |
| No Format Change | No expansion affects existing snapshot format. |
| Zero Replay Overhead | Replays do not query activity tables. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity identifiers are deterministic | Never change after creation. |
| No expansion introduces non-determinism | Same state, same result. |
| No expansion affects existing snapshot format | Backward compatible. |
| Replays do not query activity tables | Zero overhead. |
| No replay expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay expansion does not affect save snapshots. |
| Replay Compatibility | Activity data does not introduce non-determinism. |
| Migration Compatibility | Replay expansion is additive. |
| Synchronization Compatibility | Replay expansion is server-authoritative. |
| Event Bus Compatibility | Replay expansion does not affect event ordering. |

---

### 12.7 Synchronization Expansion

#### Purpose

The synchronization expansion section defines how the Activity Layer expands while
preserving synchronization compatibility.

#### Scope

The synchronization expansion applies to all future expansion that could affect
sync: activity metadata, profession selection, skill changes, ability changes,
talent changes, crafting results, gathering results, experience changes, mastery
changes, progression changes.

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
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
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

The security expansion section defines how the Activity Layer expands while preserving
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

The validation expansion section defines how the Activity Layer expands while
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

The monitoring expansion section defines how the Activity Layer expands while
preserving monitoring compatibility.

#### Scope

The monitoring expansion applies to all future expansion that could affect
monitoring: new tables, new metrics, new alerts.

#### Boundaries

Monitoring is non-blocking. No expansion affects gameplay. The Activity Layer does
not define the monitoring framework. Monitoring metrics are documented.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring remains non-blocking. |
| No Gameplay Impact | No expansion affects gameplay. |
| No Framework Definition | The Activity Layer does not define the monitoring framework. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| No expansion affects gameplay | No exceptions. |
| The Activity Layer does not define the monitoring framework | It uses the project's standards. |
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

The backup expansion section defines how the Activity Layer expands while preserving
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

The compatibility guarantees apply to all future expansion of the Activity Layer.

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

The future engine integration section defines how the Activity Layer integrates with
future engines.

#### Scope

The future engine integration applies to all future engines that reference activity
data: Quest Engine, NPC AI Engine, Dialogue Engine, Inventory Engine, Energy
Engine, Time Engine.

#### Boundaries

Future engines reference activity identifiers only. Future engines do not serialize
activity data into snapshots. Future engines do not query activity tables during
replays. No future engine creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | Future engines reference activity identifiers. |
| No Activity Serialization | Future engines do not serialize activity data. |
| No Replay Queries | Future engines do not query activity tables during replays. |
| No Circular Dependencies | No future engine creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Future engines reference activity identifiers only | No activity data in snapshots. |
| Future engines do not serialize activity data | Zero snapshot overhead. |
| Future engines do not query activity tables during replays | Zero replay overhead. |
| No future engine creates a circular dependency | The Activity Layer remains a DAG. |
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

The long-term vision section defines the long-term expansion vision for the Activity
Layer.

#### Scope

The long-term vision applies to the Activity Layer over the lifetime of the project.

#### Boundaries

The Activity Layer remains the single source of truth for activity data. The
Activity Layer remains a DAG. The Activity Layer preserves all 10 compatibility
guarantees. The Activity Layer is never bypassed by engines or systems.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Source of Truth | The Activity Layer remains the single source of truth. |
| DAG Preserved | The Activity Layer remains a DAG. |
| All Guarantees Preserved | All 10 compatibility guarantees are preserved. |
| Never Bypassed | The Activity Layer is never bypassed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer remains the single source of truth for activity data | No exceptions. |
| The Activity Layer remains a DAG | No circular dependencies. |
| The Activity Layer preserves all 10 compatibility guarantees | No exceptions. |
| The Activity Layer is never bypassed by engines or systems | No exceptions. |
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

This chapter defines the dependency architecture for the Activity Layer. It defines
the dependency philosophy, dependency hierarchy, Foundation dependencies, World
dependencies, Life dependencies, Save Engine dependencies, Synchronization
dependencies, Validation dependencies, Replay dependencies, Migration dependencies,
Security dependencies, Monitoring dependencies, Testing dependencies, and Future
dependencies.

This chapter has 14 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 13.1 Dependency Philosophy

#### Purpose

The dependency philosophy defines the permanent principles that govern all
dependencies of the Activity Layer.

#### Scope

The dependency philosophy applies to all 23 activity tables and all dependencies
between the Activity Layer and other layers.

#### Boundaries

The Activity Layer depends on the Foundation Layer, the World Layer, and the Life
Layer. No activity table depends on a layer above the Activity Layer. No circular
dependencies. The dependency graph is a DAG. The Activity Layer follows the Engine
Dependency Graph.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |
| World Dependency | The Activity Layer depends on the World Layer. |
| Life Dependency | The Activity Layer depends on the Life Layer. |
| No Upward Dependencies | No activity table depends on a layer above the Activity Layer. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Engine Dependency Graph | The Activity Layer follows the Engine Dependency Graph. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer depends on the Foundation Layer | Via `user_id`. |
| The Activity Layer depends on the World Layer | Via `world_id`. |
| The Activity Layer depends on the Life Layer | Via `life_id`. |
| No activity table depends on a layer above the Activity Layer | No upward references. |
| No circular dependencies | The dependency graph is a DAG. |
| The Activity Layer follows the Engine Dependency Graph | Topological build order. |
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
Activity Layer.

#### Scope

The dependency hierarchy applies to all 23 activity tables and all layers the
Activity Layer depends on.

#### Boundaries

The Activity Layer is above the Foundation Layer, the World Layer, and the Life
Layer. The Activity Layer is below the Engine Layer. No activity table skips a
level in the hierarchy. The hierarchy is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Above Foundation | The Activity Layer is above the Foundation Layer. |
| Above World | The Activity Layer is above the World Layer. |
| Above Life | The Activity Layer is above the Life Layer. |
| Below Engine | The Activity Layer is below the Engine Layer. |
| No Level Skip | No activity table skips a level. |
| DAG | The hierarchy is a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Layer is above the Foundation Layer | Foundation dependency. |
| The Activity Layer is above the World Layer | World dependency. |
| The Activity Layer is above the Life Layer | Life dependency. |
| The Activity Layer is below the Engine Layer | Engines reference activity identifiers. |
| No activity table skips a level in the hierarchy | Activities reference lives, professions reference lives, skills reference lives, etc. |
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

The Foundation dependencies section defines the dependencies between the Activity
Layer and the Foundation Layer.

#### Scope

The Foundation dependencies apply to all 23 activity tables and their references to
the Foundation Layer.

#### Boundaries

Every activity row has a `user_id` referencing the Foundation Layer. The Activity
Layer does not manage authentication or authorization. The Foundation Layer manages
both.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User ID Reference | Every activity row has a `user_id`. |
| No Auth Management | The Activity Layer does not manage authentication. |
| No Authorization Management | The Activity Layer does not manage authorization. |
| Foundation Dependency | The Activity Layer depends on the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity row has `user_id` | References the Foundation Layer. |
| The Activity Layer does not manage authentication | The Foundation Layer does. |
| The Activity Layer does not manage authorization | The Foundation Layer does. |
| No activity table stores passwords or tokens | No exceptions. |
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

### 13.4 World Dependencies

#### Purpose

The World dependencies section defines the dependencies between the Activity Layer
and the World Layer.

#### Scope

The World dependencies apply to all 23 activity tables and their references to the
World Layer.

#### Boundaries

Activity tables that reference world data have a `world_id` referencing the World
Layer. The Activity Layer does not manage world geography or world factions. The
World Layer manages those.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World ID Reference | Activity tables that reference world data have a `world_id`. |
| No World Geography Management | The Activity Layer does not manage world geography. |
| No Faction Management | The Activity Layer does not manage world factions. |
| World Dependency | The Activity Layer depends on the World Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity tables that reference world data have `world_id` | References the World Layer. |
| The Activity Layer does not manage world geography | The World Layer does. |
| The Activity Layer does not manage world factions | The World Layer does. |
| No activity table stores world geography data | No exceptions. |
| No World dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | World dependencies do not affect save snapshots. |
| Replay Compatibility | World dependencies are deterministic. |
| Migration Compatibility | World dependencies are never weakened. |
| Synchronization Compatibility | World dependencies are server-authoritative. |
| Event Bus Compatibility | World dependencies do not affect event ordering. |

---

### 13.5 Life Dependencies

#### Purpose

The Life dependencies section defines the dependencies between the Activity Layer
and the Life Layer.

#### Scope

The Life dependencies apply to all 23 activity tables and their references to the
Life Layer.

#### Boundaries

Every activity row has a `life_id` referencing the Life Layer. The Activity Layer
does not manage life attributes, races, classes, or statuses. The Life Layer manages
those.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Life ID Reference | Every activity row has a `life_id`. |
| No Attribute Management | The Activity Layer does not manage life attributes. |
| No Race or Class Management | The Activity Layer does not manage races or classes. |
| Life Dependency | The Activity Layer depends on the Life Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every activity row has `life_id` | References the Life Layer. |
| The Activity Layer does not manage life attributes | The Life Layer does. |
| The Activity Layer does not manage races or classes | The Life Layer does. |
| No activity table stores life attribute data | No exceptions. |
| No Life dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Life dependencies do not affect save snapshots. |
| Replay Compatibility | Life dependencies are deterministic. |
| Migration Compatibility | Life dependencies are never weakened. |
| Synchronization Compatibility | Life dependencies are server-authoritative. |
| Event Bus Compatibility | Life dependencies do not affect event ordering. |

---

### 13.6 Save Engine Dependencies

#### Purpose

The Save Engine dependencies section defines the dependencies between the Activity
Layer and the Save Engine.

#### Scope

The Save Engine dependencies apply to the boundary between the Activity Layer and the
Save Engine.

#### Boundaries

The Save Engine references activity identifiers. The Save Engine does not serialize
activity data into snapshots. No activity data affects existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | The Save Engine references activity identifiers. |
| No Activity Serialization | The Save Engine does not serialize activity data. |
| No Format Change | Activity data does not affect existing snapshot format. |
| Zero Snapshot Overhead | Activity data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Save Engine references activity identifiers | No activity data in snapshots. |
| The Save Engine does not serialize activity data | Zero overhead. |
| Activity data does not affect existing snapshot format | Backward compatible. |
| Activity data does not increase snapshot size | Zero overhead. |
| No Save Engine dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Activity data does not affect save snapshots. |
| Replay Compatibility | Save Engine dependencies are deterministic. |
| Migration Compatibility | Save Engine dependencies are never weakened. |
| Synchronization Compatibility | Save Engine dependencies are server-authoritative. |
| Event Bus Compatibility | Save Engine dependencies do not affect event ordering. |

---

### 13.7 Synchronization Dependencies

#### Purpose

The Synchronization dependencies section defines the dependencies between the Activity
Layer and the Synchronization Architecture.

#### Scope

The Synchronization dependencies apply to all activity data that is synced: activity
metadata, profession selection, skill changes, ability changes, talent changes,
crafting results, gathering results, experience changes, mastery changes, progression
changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Activity Layer does not manage
sync. The Synchronization Architecture manages sync. No sync dependency corrupts
data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync is server-authoritative. |
| Non-Blocking | Sync is non-blocking. |
| No Sync Management | The Activity Layer does not manage sync. |
| No Corruption | Sync dependencies do not corrupt data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
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

### 13.8 Validation Dependencies

#### Purpose

The Validation dependencies section defines the dependencies between the Activity
Layer and the Validation Architecture.

#### Scope

The Validation dependencies apply to all constraints, RLS policies, and validation
checks in the activity layer.

#### Boundaries

Validation is database-enforced and deterministic. The Activity Layer does not define
the Validation Architecture. The Validation Architecture defines it. No validation
dependency destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is database-enforced. |
| Deterministic | Validation is deterministic. |
| No Validation Framework | The Activity Layer does not define the Validation Architecture. |
| No Data Destruction | Validation dependencies do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| The Activity Layer does not define the Validation Architecture | It uses the project's standards. |
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

### 13.9 Replay Dependencies

#### Purpose

The Replay dependencies section defines the dependencies between the Activity Layer
and the Replay System.

#### Scope

The Replay dependencies apply to all activity data that could affect replays: activity
identifiers, profession identifiers, skill identifiers, ability identifiers,
experience values, mastery values, progression values.

#### Boundaries

Activity data is not in engine snapshots. Replays do not query activity tables.
Activity identifiers are deterministic. No replay dependency introduces
non-determinism.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Activity data is not in snapshots. No replay queries. |
| No Non-Determinism | Activity data does not introduce non-determinism. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| Cross-Platform | Activity identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Activity data is not in snapshots | Except the activity identifier if referenced. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| No replay dependency introduces non-determinism | Same state, same result. |
| No Replay dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay dependencies do not affect save snapshots. |
| Replay Compatibility | Activity data does not introduce non-determinism. |
| Migration Compatibility | Replay dependencies are never weakened. |
| Synchronization Compatibility | Replay dependencies are server-authoritative. |
| Event Bus Compatibility | Replay dependencies do not affect event ordering. |

---

### 13.10 Migration Dependencies

#### Purpose

The Migration dependencies section defines the dependencies between the Activity Layer
and the Migration System.

#### Scope

The Migration dependencies apply to all activity migrations — any additive change to
the activity schema.

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

### 13.11 Security Dependencies

#### Purpose

The Security dependencies section defines the dependencies between the Activity Layer
and the security architecture.

#### Scope

The Security dependencies apply to all 23 activity tables, all RLS policies, and all
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

### 13.12 Monitoring Dependencies

#### Purpose

The Monitoring dependencies section defines the dependencies between the Activity
Layer and the monitoring architecture.

#### Scope

The Monitoring dependencies apply to all 23 activity tables and all monitoring
metrics.

#### Boundaries

Monitoring is non-blocking. The Activity Layer does not define the monitoring
framework. Monitoring provides row counts, table sizes, and query performance.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring is non-blocking. |
| No Framework Definition | The Activity Layer does not define the monitoring framework. |
| Observable | Activity data is observable through metrics. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| The Activity Layer does not define the monitoring framework | It uses the project's standards. |
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

### 13.13 Testing Dependencies

#### Purpose

The Testing dependencies section defines the dependencies between the Activity Layer
and the Testing Architecture.

#### Scope

The Testing dependencies apply to all 23 activity tables and all activity tests.

#### Boundaries

Testing is deterministic and reproducible. The Activity Layer does not define the
testing framework. The Testing Architecture defines it. No test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Testing is deterministic. |
| Reproducible | Testing is reproducible. |
| No Framework Definition | The Activity Layer does not define the testing framework. |
| No Data Destruction | No test destroys data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing is deterministic | Same input, same result. |
| Testing is reproducible | Can be re-run with same results. |
| The Activity Layer does not define the testing framework | It uses the Testing Architecture. |
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

### 13.14 Future Dependencies

#### Purpose

The Future dependencies section defines the dependencies between the Activity Layer
and future engines and systems.

#### Scope

The Future dependencies apply to all future engines and systems that reference
activity data.

#### Boundaries

Future engines reference activity identifiers only. Future engines do not serialize
activity data. Future engines do not query activity tables during replays. No future
engine creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | Future engines reference activity identifiers. |
| No Activity Serialization | Future engines do not serialize activity data. |
| No Replay Queries | Future engines do not query activity tables during replays. |
| No Circular Dependencies | No future engine creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Future engines reference activity identifiers only | No activity data in snapshots. |
| Future engines do not serialize activity data | Zero snapshot overhead. |
| Future engines do not query activity tables during replays | Zero replay overhead. |
| No future engine creates a circular dependency | The Activity Layer remains a DAG. |
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

## Sprint 1.2.5.5 Review

### Sprint Summary

**Sprint:** 1.2.5.5 — Activity Blueprint v1.0 (Chapters 12–13)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 12 | Future Expansion | 14 sections: expansion philosophy, horizontal expansion, vertical expansion, repository expansion, migration expansion, replay expansion, synchronization expansion, security expansion, validation expansion, monitoring expansion, backup expansion, compatibility guarantees, future engine integration, long-term vision. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 13 | Dependencies | 14 sections: dependency philosophy, dependency hierarchy, Foundation dependencies, World dependencies, Life dependencies, Save Engine dependencies, Synchronization dependencies, Validation dependencies, Replay dependencies, Migration dependencies, Security dependencies, Monitoring dependencies, Testing dependencies, Future dependencies. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–13) | PASS |
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

- The Activity Blueprint is IN PROGRESS. Chapters 1–13 are complete. Chapters 14–16 are pending.
- Next sprint: 1.2.5.6 — Chapter 14 (Completion Checklist), Chapter 15 (Lock Policy), Chapter 16 (Visual Prototype).

---

## 14. Completion Checklist

### Overview

This chapter defines the completion checklist for the Activity Layer. It defines the
architecture, ownership, relationship, synchronization, replay, migration, security,
validation, performance, monitoring, documentation, and release checklists.

This chapter has 12 sections. Every section includes requirements, completion
criteria, validation rules, acceptance rules, and permanent restrictions.

---

### 14.1 Architecture Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All 23 activity tables defined | activities, professions, jobs, skills, abilities, talents, crafts, recipes, tools, resources, harvesting, gathering, mining, fishing, farming, cooking, smithing, alchemy, enchanting, experience, mastery, progression, activity_dashboard. |
| All relationships defined | Per Chapter 7. |
| All dependencies defined | Per Chapter 13. |
| All naming follows the Naming Rules v1.0 | Per Chapter 6. |
| The Activity Layer is a DAG | No circular dependencies. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 23 tables are documented in the blueprint | No missing tables. |
| All relationships are documented in the ERD | No missing relationships. |
| All dependencies are documented | No missing dependencies. |
| All naming follows the Naming Rules v1.0 | No violations. |
| The Activity Layer is a DAG | No circular dependencies. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All 23 tables are present in the blueprint | Verified. |
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

### 14.2 Ownership Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Every activity row has `user_id` | References the Foundation Layer. |
| Every activity row has `world_id` | References the World Layer. |
| Every activity row has `life_id` | References the Life Layer. |
| RLS enforces ownership | Four policies per table. |
| No cross-user access from the client | RLS prevents it. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 23 tables have `user_id` | Verified. |
| All 23 tables have `world_id` | Verified. |
| All 23 tables have `life_id` | Verified. |
| RLS enforces ownership on all 23 tables | Verified. |
| No cross-user access is possible from the client | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Every activity row has `user_id` | No exceptions. |
| Every activity row has `world_id` | No exceptions. |
| Every activity row has `life_id` | No exceptions. |
| RLS policies use `auth.uid()` for ownership checks | No `current_user`. |
| No cross-user access is possible from the client | RLS enforced. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the ownership model | No exceptions. |
| All ownership checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No ownership rule is removed after locking | Permanent. |
| No ownership rule is weakened after locking | Permanent. |
| `user_id` is never removed from an activity table | Permanent. |
| `world_id` is never removed from an activity table | Permanent. |
| `life_id` is never removed from an activity table | Permanent. |

---

### 14.3 Relationship Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All Foundation relationships defined | `user_id` references. |
| All World relationships defined | `world_id` references. |
| All Life relationships defined | `life_id` references. |
| All intra-layer relationships defined | Per Chapter 7. |
| All relationships are documented in the ERD | No missing relationships. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All Foundation relationships are documented | Verified. |
| All World relationships are documented | Verified. |
| All Life relationships are documented | Verified. |
| All intra-layer relationships are documented | Verified. |
| The ERD is complete for the Activity Layer | No missing relationships. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All foreign keys are defined | No orphan rows. |
| All foreign keys are indexed | No unindexed foreign keys. |
| All relationships are documented in the ERD | No exceptions. |
| No relationship creates a circular dependency | DAG preserved. |
| All relationships follow the Naming Rules v1.0 | `snake_case`. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the relationships | No exceptions. |
| All relationship checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No relationship is removed after locking | Permanent. |
| No relationship is weakened after locking | Permanent. |
| No foreign key is removed after locking | Permanent. |
| No relationship creates a circular dependency | Permanent. |

---

### 14.4 Synchronization Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| Sync does not corrupt data | Atomic operations. |
| The Activity Layer does not manage sync | The Synchronization Architecture does. |
| Sync is batched where possible | Reduce round trips. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Sync is server-authoritative | Verified. |
| Sync is non-blocking | Verified. |
| Sync does not corrupt data | Verified. |
| The Activity Layer does not manage sync | Verified. |
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

### 14.5 Replay Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Activity data is not in engine snapshots | Except the activity identifier. |
| Replays do not query activity tables | Zero overhead. |
| Activity identifiers are deterministic | Never change after creation. |
| No non-determinism from activity data | Same state, same result. |
| Activity identifiers are platform-independent | Cross-platform. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Activity data is not in snapshots | Verified. |
| Replays do not query activity tables | Verified. |
| Activity identifiers are deterministic | Verified. |
| No non-determinism from activity data | Verified. |
| Activity identifiers are platform-independent | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No activity table is serialized into engine snapshots | Except the activity identifier. |
| The Save Engine references activity identifiers only | No activity data. |
| Activity identifiers are never changed after creation | Deterministic. |
| No wall-clock time affects activity data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects activity data in snapshots | No random non-determinism. |

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
| Activity identifiers are never changed after creation | Permanent. |
| Activity data is never serialized into engine snapshots | Permanent. |

---

### 14.6 Migration Completion Checklist

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

### 14.7 Security Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| RLS is enabled on every activity table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| Policies use `auth.uid()` | No `current_user`. |
| No `FOR ALL` policies | No exceptions. |
| No `USING (true)` policies | No exceptions. |
| The service role key is server-side only | Never in client code. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| RLS is enabled on all 23 activity tables | Verified. |
| Four policies per table are defined | Verified. |
| Policies use `auth.uid()` | Verified. |
| No `FOR ALL` policies | Verified. |
| No `USING (true)` policies | Verified. |
| The service role key is server-side only | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every activity table | Verified. |
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

### 14.8 Validation Completion Checklist

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

### 14.9 Performance Completion Checklist

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

### 14.10 Monitoring Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| Monitoring does not affect gameplay | No exceptions. |
| The Activity Layer does not define the monitoring framework | It uses the project's standards. |
| Monitoring metrics are documented | In the blueprint. |
| Monitoring provides row counts, table sizes, and query performance | Observable. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Monitoring is non-blocking | Verified. |
| Monitoring does not affect gameplay | Verified. |
| The Activity Layer does not define the monitoring framework | Verified. |
| Monitoring metrics are documented | Verified. |
| Monitoring provides row counts, table sizes, and query performance | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Monitoring operations are non-blocking | No exceptions. |
| Monitoring does not affect gameplay performance | No exceptions. |
| The Activity Layer does not define the monitoring framework | No exceptions. |
| Monitoring metrics are documented in the blueprint | No exceptions. |
| Monitoring provides row counts, table sizes, and query performance | No exceptions. |

#### Acceptance Rules

| Rule | Description |
|------|-------------|
| The Lead Architect approves the monitoring | No exceptions. |
| All monitoring checklist items pass | No exceptions. |

#### Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No monitoring rule is removed after locking | Permanent. |
| No monitoring rule is weakened after locking | Permanent. |
| Monitoring is never blocking | Permanent. |
| Monitoring metrics are always documented | Permanent. |

---

### 14.11 Documentation Completion Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| The Activity Blueprint is complete | All 16 chapters authored. |
| The ERD is complete | All tables and relationships. |
| The Schema.md is complete | All tables and columns. |
| The Migration Log is complete | All migrations logged. |
| The Engine Dependency Graph is complete | All dependencies. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| The Activity Blueprint is complete | All chapters authored. |
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

### 14.12 Release Completion Checklist

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

## 15. Lock Policy

### Overview

This chapter defines the lock policy for the Activity Blueprint v1.0. It defines the
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
Activity Blueprint v1.0.

#### Scope

The lock philosophy applies to the entire Activity Blueprint v1.0 — all 16 chapters,
all 23 activity tables, all relationships, all dependencies, all guarantees.

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

The lock requirements apply to the entire Activity Blueprint v1.0.

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

The review procedure applies to the entire Activity Blueprint v1.0.

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

The approval procedure applies to the entire Activity Blueprint v1.0.

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

The versioning strategy section defines the versioning strategy for the Activity
Blueprint.

#### Scope

The versioning strategy applies to all versions of the Activity Blueprint.

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

The deterministic guarantees apply to all activity data and all activity operations.

#### Boundaries

The lock preserves deterministic execution. No lock introduces non-determinism.
Activity identifiers are deterministic. No lock changes identifiers after creation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Execution | The lock preserves deterministic execution. |
| No Non-Determinism | No lock introduces non-determinism. |
| Deterministic Identifiers | Activity identifiers are deterministic. |
| No Identifier Change | No lock changes identifiers after creation. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves deterministic execution | No exceptions. |
| No lock introduces non-determinism | No exceptions. |
| Activity identifiers are deterministic | Never change after creation. |
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

The replay guarantees apply to all activity data that could affect replays.

#### Boundaries

The lock preserves replay compatibility. Activity data is not in snapshots. Replays
do not query activity tables. No lock introduces non-determinism.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Replay Compatibility | The lock preserves replay compatibility. |
| No Activity Serialization | Activity data is not in snapshots. |
| No Replay Queries | Replays do not query activity tables. |
| No Non-Determinism | No lock introduces non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves replay compatibility | No exceptions. |
| Activity data is not in snapshots | Except the activity identifier. |
| Replays do not query activity tables | Zero overhead. |
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

The migration guarantees apply to all activity migrations.

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

The synchronization guarantees apply to all activity data that is synced.

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

The dependency guarantees apply to all dependencies of the Activity Layer.

#### Boundaries

The lock preserves dependency compatibility. The Activity Layer remains a DAG. No
lock creates a circular dependency. No lock removes a dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Dependency Compatibility | The lock preserves dependency compatibility. |
| DAG Preserved | The Activity Layer remains a DAG. |
| No Circular Dependencies | No lock creates a circular dependency. |
| No Removal | No lock removes a dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves dependency compatibility | No exceptions. |
| The Activity Layer remains a DAG | No circular dependencies. |
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

The ownership guarantees apply to all 23 activity tables and all activity rows.

#### Boundaries

The lock preserves ownership. Every activity row has a `user_id`, `world_id`, and
`life_id`. RLS enforces ownership. No lock weakens RLS. No lock removes `user_id`,
`world_id`, or `life_id`.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Ownership Preserved | The lock preserves ownership. |
| User ID Required | Every activity row has a `user_id`. |
| World ID Required | Every activity row has a `world_id`. |
| Life ID Required | Every activity row has a `life_id`. |
| RLS Enforced | RLS enforces ownership. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves ownership | No exceptions. |
| Every activity row has a `user_id` | No exceptions. |
| Every activity row has a `world_id` | No exceptions. |
| Every activity row has a `life_id` | No exceptions. |
| RLS enforces ownership | Four policies per table. |
| No lock weakens RLS | No exceptions. |
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

The permanent restrictions apply to the entire Activity Blueprint v1.0.

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
Activity Blueprint.

#### Scope

The semantic versioning rules apply to all versions of the Activity Blueprint.

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

The documentation requirements apply to all documentation related to the Activity
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
of the Activity Blueprint.

#### Scope

The future revision procedures apply to all future versions of the Activity Blueprint.

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

This chapter defines the visual prototype for the Activity Layer management interface.
It defines the panel philosophy, desktop layout, tablet layout, mobile layout,
navigation hierarchy, typography rules, accessibility rules, theme rules, animation
rules, responsiveness rules, and 23 visual panels.

This chapter has 10 rule sections and 23 visual panel definitions. Every rule
section defines a visual rule. Every panel includes purpose, components, layout,
navigation, boundaries, and permanent rules.

---

### 16.1 Panel Philosophy

#### Purpose

The panel philosophy defines the permanent principles that govern the visual
prototype for the Activity Layer management interface.

#### Scope

The panel philosophy applies to all 23 visual panels and all future panels.

#### Boundaries

The visual prototype is a management interface for the Activity Layer. The visual
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
| The visual prototype is a management interface for the Activity Layer | No exceptions. |
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
| The desktop layout uses a sidebar navigation | For all 23 panels. |
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

The navigation hierarchy applies to all 23 visual panels.

#### Boundaries

The navigation hierarchy follows the activity structure: Activities > Professions >
Jobs > Skills > Abilities > Talents. The navigation hierarchy includes crafting
panels: Crafts > Recipes > Tools > Resources. The navigation hierarchy includes
harvesting panels: Harvesting > Gathering > Mining > Fishing > Farming. The navigation
hierarchy includes production panels: Cooking > Smithing > Alchemy > Enchanting. The
navigation hierarchy includes progression panels: Experience > Mastery > Progression.
The navigation hierarchy includes the Activity Dashboard as the top-level overview.
The navigation hierarchy uses breadcrumbs for context.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Activity Structure | The navigation hierarchy follows the activity structure. |
| Crafting Panels | The navigation hierarchy includes crafting panels. |
| Harvesting Panels | The navigation hierarchy includes harvesting panels. |
| Production Panels | The navigation hierarchy includes production panels. |
| Breadcrumbs | The navigation hierarchy uses breadcrumbs. |
| Consistent | The navigation hierarchy is consistent across all layouts. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The navigation hierarchy follows the activity structure | Activities > Professions > Jobs > Skills > Abilities > Talents. |
| The navigation hierarchy includes crafting panels | Crafts > Recipes > Tools > Resources. |
| The navigation hierarchy includes harvesting panels | Harvesting > Gathering > Mining > Fishing > Farming. |
| The navigation hierarchy includes production panels | Cooking > Smithing > Alchemy > Enchanting. |
| The navigation hierarchy includes progression panels | Experience > Mastery > Progression. |
| The navigation hierarchy includes the Activity Dashboard | Top-level overview. |
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

The typography rules apply to all 23 visual panels.

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

The accessibility rules apply to all 23 visual panels.

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

The theme rules apply to all 23 visual panels.

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

The animation rules apply to all 23 visual panels.

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

The responsiveness rules apply to all 23 visual panels across desktop, tablet, and
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

### Panel 1 — Activities Panel

#### Purpose

The Activities Panel displays the list of all activities owned by the current user
and provides CRUD operations for activity records.

#### Components

| Component | Description |
|-----------|-------------|
| Activity List | A paginated table of all activities with columns: name, type, profession, status, created date. |
| Activity Card | A card view for each activity showing name, type, profession, and status. |
| Create Activity Button | A button to open the Create Activity form. |
| Activity Search | A search bar to filter activities by name. |
| Activity Filter | A filter dropdown to filter by type or status. |
| Pagination Controls | Controls to navigate pages of activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation on the left, activity list in a multi-column content area with card grid. |
| Tablet | Collapsible sidebar, single-column activity list with card layout. |
| Mobile | Bottom navigation, single-column activity list with stacked cards. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessible from the sidebar navigation as the top-level item. |
| Breadcrumb | "Activities" displayed in the top bar breadcrumb. |
| Drill-Down | Clicking an activity navigates to the Activity Detail view. |
| Cross-Panel | From Activity Detail, navigate to Professions, Skills, or Experience panels. |

#### Boundaries

- The Activities Panel displays only activities owned by the current user.
- The Activities Panel does not display activity data from other users.
- The Activities Panel does not manage authentication.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activities Panel displays only activities owned by the current user | RLS enforced. |
| The Activities Panel supports CRUD operations | Create, read, update, delete. |
| The Activities Panel uses pagination | No unbounded result sets. |
| No Activities Panel rule is removed after locking | Permanent. |

---

### Panel 2 — Professions Panel

#### Purpose

The Professions Panel displays the list of professions available to a life and
provides CRUD operations for profession records.

#### Components

| Component | Description |
|-----------|-------------|
| Profession List | A paginated table of professions with columns: name, description, activity type, created date. |
| Profession Card | A card view for each profession showing name, description, and activity type. |
| Create Profession Button | A button to open the Create Profession form. |
| Profession Search | A search bar to filter professions by name. |
| Pagination Controls | Controls to navigate pages of professions. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, profession list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column profession list. |
| Mobile | Bottom navigation, single-column profession list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Activities Panel or sidebar. |
| Breadcrumb | "Activities > Professions" displayed in the top bar. |
| Drill-Down | Clicking a profession navigates to the Profession Detail view. |
| Cross-Panel | From Profession Detail, navigate to Jobs, Skills, or Crafts panels. |

#### Boundaries

- The Professions Panel displays only professions within the selected life.
- The Professions Panel does not display professions from other lives.
- The Professions Panel does not display professions from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Professions Panel displays only professions within the selected life | Scoped by `life_id`. |
| The Professions Panel supports CRUD operations | Create, read, update, delete. |
| The Professions Panel uses pagination | No unbounded result sets. |
| No Professions Panel rule is removed after locking | Permanent. |

---

### Panel 3 — Jobs Panel

#### Purpose

The Jobs Panel displays the list of jobs available to a profession and provides CRUD
operations for job records.

#### Components

| Component | Description |
|-----------|-------------|
| Job List | A paginated table of jobs with columns: name, profession, description, requirements. |
| Job Card | A card view for each job showing name, profession, and description. |
| Create Job Button | A button to open the Create Job form. |
| Job Search | A search bar to filter jobs by name. |
| Pagination Controls | Controls to navigate pages of jobs. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, job list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column job list. |
| Mobile | Bottom navigation, single-column job list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Professions Panel. |
| Breadcrumb | "Activities > Professions > Jobs" displayed in the top bar. |
| Drill-Down | Clicking a job navigates to the Job Detail view. |
| Back | Back button returns to the Professions Panel. |

#### Boundaries

- The Jobs Panel displays only jobs within the selected profession.
- The Jobs Panel does not display jobs from other professions.
- The Jobs Panel does not display jobs from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Jobs Panel displays only jobs within the selected profession | Scoped by `profession_id`. |
| The Jobs Panel supports CRUD operations | Create, read, update, delete. |
| The Jobs Panel uses pagination | No unbounded result sets. |
| No Jobs Panel rule is removed after locking | Permanent. |

---

### Panel 4 — Skills Panel

#### Purpose

The Skills Panel displays the list of skills available to a life and provides CRUD
operations for skill records.

#### Components

| Component | Description |
|-----------|-------------|
| Skill List | A paginated table of skills with columns: name, description, level, category. |
| Skill Card | A card view for each skill showing name, description, and level. |
| Create Skill Button | A button to open the Create Skill form. |
| Skill Search | A search bar to filter skills by name. |
| Skill Filter | A filter dropdown to filter by category. |
| Pagination Controls | Controls to navigate pages of skills. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, skill list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column skill list. |
| Mobile | Bottom navigation, single-column skill list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Activities Panel or sidebar. |
| Breadcrumb | "Activities > Skills" displayed in the top bar. |
| Drill-Down | Clicking a skill navigates to the Skill Detail view. |
| Cross-Panel | From Skill Detail, navigate to Abilities or Talents panels. |

#### Boundaries

- The Skills Panel displays only skills within the selected life.
- The Skills Panel does not display skills from other lives.
- The Skills Panel does not display skills from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Skills Panel displays only skills within the selected life | Scoped by `life_id`. |
| The Skills Panel supports CRUD operations | Create, read, update, delete. |
| The Skills Panel uses pagination | No unbounded result sets. |
| No Skills Panel rule is removed after locking | Permanent. |

---

### Panel 5 — Abilities Panel

#### Purpose

The Abilities Panel displays the list of abilities available to a life and provides
CRUD operations for ability records.

#### Components

| Component | Description |
|-----------|-------------|
| Ability List | A paginated table of abilities with columns: name, description, skill, unlock level. |
| Ability Card | A card view for each ability showing name, description, and skill. |
| Create Ability Button | A button to open the Create Ability form. |
| Ability Search | A search bar to filter abilities by name. |
| Pagination Controls | Controls to navigate pages of abilities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, ability list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column ability list. |
| Mobile | Bottom navigation, single-column ability list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Skills Panel. |
| Breadcrumb | "Activities > Skills > Abilities" displayed in the top bar. |
| Drill-Down | Clicking an ability navigates to the Ability Detail view. |
| Back | Back button returns to the Skills Panel. |

#### Boundaries

- The Abilities Panel displays only abilities within the selected life.
- The Abilities Panel does not display abilities from other lives.
- The Abilities Panel does not display abilities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Abilities Panel displays only abilities within the selected life | Scoped by `life_id`. |
| The Abilities Panel supports CRUD operations | Create, read, update, delete. |
| The Abilities Panel uses pagination | No unbounded result sets. |
| No Abilities Panel rule is removed after locking | Permanent. |

---

### Panel 6 — Talents Panel

#### Purpose

The Talents Panel displays the list of talents available to a life and provides CRUD
operations for talent records.

#### Components

| Component | Description |
|-----------|-------------|
| Talent List | A paginated table of talents with columns: name, description, category, points. |
| Talent Card | A card view for each talent showing name, description, and category. |
| Create Talent Button | A button to open the Create Talent form. |
| Talent Search | A search bar to filter talents by name. |
| Talent Filter | A filter dropdown to filter by category. |
| Pagination Controls | Controls to navigate pages of talents. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, talent list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column talent list. |
| Mobile | Bottom navigation, single-column talent list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Skills Panel or sidebar. |
| Breadcrumb | "Activities > Talents" displayed in the top bar. |
| Drill-Down | Clicking a talent navigates to the Talent Detail view. |
| Back | Back button returns to the Skills Panel. |

#### Boundaries

- The Talents Panel displays only talents within the selected life.
- The Talents Panel does not display talents from other lives.
- The Talents Panel does not display talents from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Talents Panel displays only talents within the selected life | Scoped by `life_id`. |
| The Talents Panel supports CRUD operations | Create, read, update, delete. |
| The Talents Panel uses pagination | No unbounded result sets. |
| No Talents Panel rule is removed after locking | Permanent. |

---

### Panel 7 — Crafts Panel

#### Purpose

The Crafts Panel displays the list of crafts available to a life and provides CRUD
operations for craft records.

#### Components

| Component | Description |
|-----------|-------------|
| Craft List | A paginated table of crafts with columns: name, profession, description, created date. |
| Craft Card | A card view for each craft showing name, profession, and description. |
| Create Craft Button | A button to open the Create Craft form. |
| Craft Search | A search bar to filter crafts by name. |
| Pagination Controls | Controls to navigate pages of crafts. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, craft list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column craft list. |
| Mobile | Bottom navigation, single-column craft list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Professions Panel or sidebar. |
| Breadcrumb | "Activities > Crafts" displayed in the top bar. |
| Drill-Down | Clicking a craft navigates to the Craft Detail view. |
| Cross-Panel | From Craft Detail, navigate to Recipes or Tools panels. |

#### Boundaries

- The Crafts Panel displays only crafts within the selected life.
- The Crafts Panel does not display crafts from other lives.
- The Crafts Panel does not display crafts from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Crafts Panel displays only crafts within the selected life | Scoped by `life_id`. |
| The Crafts Panel supports CRUD operations | Create, read, update, delete. |
| The Crafts Panel uses pagination | No unbounded result sets. |
| No Crafts Panel rule is removed after locking | Permanent. |

---

### Panel 8 — Recipes Panel

#### Purpose

The Recipes Panel displays the list of recipes available to a craft and provides CRUD
operations for recipe records.

#### Components

| Component | Description |
|-----------|-------------|
| Recipe List | A paginated table of recipes with columns: name, craft, ingredients, result, created date. |
| Recipe Card | A card view for each recipe showing name, craft, and result. |
| Create Recipe Button | A button to open the Create Recipe form. |
| Recipe Search | A search bar to filter recipes by name. |
| Pagination Controls | Controls to navigate pages of recipes. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, recipe list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column recipe list. |
| Mobile | Bottom navigation, single-column recipe list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Crafts Panel. |
| Breadcrumb | "Activities > Crafts > Recipes" displayed in the top bar. |
| Drill-Down | Clicking a recipe navigates to the Recipe Detail view. |
| Cross-Panel | From Recipe Detail, navigate to Tools or Resources panels. |
| Back | Back button returns to the Crafts Panel. |

#### Boundaries

- The Recipes Panel displays only recipes within the selected craft.
- The Recipes Panel does not display recipes from other crafts.
- The Recipes Panel does not display recipes from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Recipes Panel displays only recipes within the selected craft | Scoped by `craft_id`. |
| The Recipes Panel supports CRUD operations | Create, read, update, delete. |
| The Recipes Panel uses pagination | No unbounded result sets. |
| No Recipes Panel rule is removed after locking | Permanent. |

---

### Panel 9 — Tools Panel

#### Purpose

The Tools Panel displays the list of tools available to a life and provides CRUD
operations for tool records.

#### Components

| Component | Description |
|-----------|-------------|
| Tool List | A paginated table of tools with columns: name, type, description, durability. |
| Tool Card | A card view for each tool showing name, type, and description. |
| Create Tool Button | A button to open the Create Tool form. |
| Tool Search | A search bar to filter tools by name. |
| Tool Filter | A filter dropdown to filter by type. |
| Pagination Controls | Controls to navigate pages of tools. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, tool list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column tool list. |
| Mobile | Bottom navigation, single-column tool list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Crafts Panel or sidebar. |
| Breadcrumb | "Activities > Tools" displayed in the top bar. |
| Drill-Down | Clicking a tool navigates to the Tool Detail view. |
| Back | Back button returns to the Crafts Panel. |

#### Boundaries

- The Tools Panel displays only tools within the selected life.
- The Tools Panel does not display tools from other lives.
- The Tools Panel does not display tools from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Tools Panel displays only tools within the selected life | Scoped by `life_id`. |
| The Tools Panel supports CRUD operations | Create, read, update, delete. |
| The Tools Panel uses pagination | No unbounded result sets. |
| No Tools Panel rule is removed after locking | Permanent. |

---

### Panel 10 — Resources Panel

#### Purpose

The Resources Panel displays the list of resources available to a life and provides
CRUD operations for resource records.

#### Components

| Component | Description |
|-----------|-------------|
| Resource List | A paginated table of resources with columns: name, type, description, rarity. |
| Resource Card | A card view for each resource showing name, type, and rarity. |
| Create Resource Button | A button to open the Create Resource form. |
| Resource Search | A search bar to filter resources by name. |
| Resource Filter | A filter dropdown to filter by type or rarity. |
| Pagination Controls | Controls to navigate pages of resources. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, resource list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column resource list. |
| Mobile | Bottom navigation, single-column resource list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Crafts Panel or sidebar. |
| Breadcrumb | "Activities > Resources" displayed in the top bar. |
| Drill-Down | Clicking a resource navigates to the Resource Detail view. |
| Back | Back button returns to the Crafts Panel. |

#### Boundaries

- The Resources Panel displays only resources within the selected life.
- The Resources Panel does not display resources from other lives.
- The Resources Panel does not display resources from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Resources Panel displays only resources within the selected life | Scoped by `life_id`. |
| The Resources Panel supports CRUD operations | Create, read, update, delete. |
| The Resources Panel uses pagination | No unbounded result sets. |
| No Resources Panel rule is removed after locking | Permanent. |

---

### Panel 11 — Harvesting Panel

#### Purpose

The Harvesting Panel displays the list of harvesting activities available to a life
and provides CRUD operations for harvesting records.

#### Components

| Component | Description |
|-----------|-------------|
| Harvesting List | A paginated table of harvesting activities with columns: type, location, yield, created date. |
| Harvesting Card | A card view for each harvesting activity showing type, location, and yield. |
| Create Harvesting Button | A button to open the Create Harvesting form. |
| Harvesting Search | A search bar to filter by type. |
| Pagination Controls | Controls to navigate pages of harvesting activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, harvesting list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column harvesting list. |
| Mobile | Bottom navigation, single-column harvesting list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level harvesting item. |
| Breadcrumb | "Activities > Harvesting" displayed in the top bar. |
| Drill-Down | Clicking a harvesting activity navigates to the Harvesting Detail view. |
| Cross-Panel | From Harvesting Detail, navigate to Gathering, Mining, Fishing, or Farming panels. |

#### Boundaries

- The Harvesting Panel displays only harvesting activities within the selected life.
- The Harvesting Panel does not display harvesting activities from other lives.
- The Harvesting Panel does not display harvesting activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Harvesting Panel displays only harvesting activities within the selected life | Scoped by `life_id`. |
| The Harvesting Panel supports CRUD operations | Create, read, update, delete. |
| The Harvesting Panel uses pagination | No unbounded result sets. |
| No Harvesting Panel rule is removed after locking | Permanent. |

---

### Panel 12 — Gathering Panel

#### Purpose

The Gathering Panel displays the list of gathering activities available to a life and
provides CRUD operations for gathering records.

#### Components

| Component | Description |
|-----------|-------------|
| Gathering List | A paginated table of gathering activities with columns: resource, location, yield, created date. |
| Gathering Card | A card view for each gathering activity showing resource, location, and yield. |
| Create Gathering Button | A button to open the Create Gathering form. |
| Gathering Search | A search bar to filter by resource. |
| Pagination Controls | Controls to navigate pages of gathering activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, gathering list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column gathering list. |
| Mobile | Bottom navigation, single-column gathering list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Harvesting Panel. |
| Breadcrumb | "Activities > Harvesting > Gathering" displayed in the top bar. |
| Drill-Down | Clicking a gathering activity navigates to the Gathering Detail view. |
| Back | Back button returns to the Harvesting Panel. |

#### Boundaries

- The Gathering Panel displays only gathering activities within the selected life.
- The Gathering Panel does not display gathering activities from other lives.
- The Gathering Panel does not display gathering activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Gathering Panel displays only gathering activities within the selected life | Scoped by `life_id`. |
| The Gathering Panel supports CRUD operations | Create, read, update, delete. |
| The Gathering Panel uses pagination | No unbounded result sets. |
| No Gathering Panel rule is removed after locking | Permanent. |

---

### Panel 13 — Mining Panel

#### Purpose

The Mining Panel displays the list of mining activities available to a life and
provides CRUD operations for mining records.

#### Components

| Component | Description |
|-----------|-------------|
| Mining List | A paginated table of mining activities with columns: material, location, yield, created date. |
| Mining Card | A card view for each mining activity showing material, location, and yield. |
| Create Mining Button | A button to open the Create Mining form. |
| Mining Search | A search bar to filter by material. |
| Pagination Controls | Controls to navigate pages of mining activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, mining list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column mining list. |
| Mobile | Bottom navigation, single-column mining list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Harvesting Panel. |
| Breadcrumb | "Activities > Harvesting > Mining" displayed in the top bar. |
| Drill-Down | Clicking a mining activity navigates to the Mining Detail view. |
| Back | Back button returns to the Harvesting Panel. |

#### Boundaries

- The Mining Panel displays only mining activities within the selected life.
- The Mining Panel does not display mining activities from other lives.
- The Mining Panel does not display mining activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Mining Panel displays only mining activities within the selected life | Scoped by `life_id`. |
| The Mining Panel supports CRUD operations | Create, read, update, delete. |
| The Mining Panel uses pagination | No unbounded result sets. |
| No Mining Panel rule is removed after locking | Permanent. |

---

### Panel 14 — Fishing Panel

#### Purpose

The Fishing Panel displays the list of fishing activities available to a life and
provides CRUD operations for fishing records.

#### Components

| Component | Description |
|-----------|-------------|
| Fishing List | A paginated table of fishing activities with columns: catch, location, yield, created date. |
| Fishing Card | A card view for each fishing activity showing catch, location, and yield. |
| Create Fishing Button | A button to open the Create Fishing form. |
| Fishing Search | A search bar to filter by catch. |
| Pagination Controls | Controls to navigate pages of fishing activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, fishing list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column fishing list. |
| Mobile | Bottom navigation, single-column fishing list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Harvesting Panel. |
| Breadcrumb | "Activities > Harvesting > Fishing" displayed in the top bar. |
| Drill-Down | Clicking a fishing activity navigates to the Fishing Detail view. |
| Back | Back button returns to the Harvesting Panel. |

#### Boundaries

- The Fishing Panel displays only fishing activities within the selected life.
- The Fishing Panel does not display fishing activities from other lives.
- The Fishing Panel does not display fishing activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Fishing Panel displays only fishing activities within the selected life | Scoped by `life_id`. |
| The Fishing Panel supports CRUD operations | Create, read, update, delete. |
| The Fishing Panel uses pagination | No unbounded result sets. |
| No Fishing Panel rule is removed after locking | Permanent. |

---

### Panel 15 — Farming Panel

#### Purpose

The Farming Panel displays the list of farming activities available to a life and
provides CRUD operations for farming records.

#### Components

| Component | Description |
|-----------|-------------|
| Farming List | A paginated table of farming activities with columns: crop, field, yield, created date. |
| Farming Card | A card view for each farming activity showing crop, field, and yield. |
| Create Farming Button | A button to open the Create Farming form. |
| Farming Search | A search bar to filter by crop. |
| Pagination Controls | Controls to navigate pages of farming activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, farming list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column farming list. |
| Mobile | Bottom navigation, single-column farming list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Harvesting Panel. |
| Breadcrumb | "Activities > Harvesting > Farming" displayed in the top bar. |
| Drill-Down | Clicking a farming activity navigates to the Farming Detail view. |
| Back | Back button returns to the Harvesting Panel. |

#### Boundaries

- The Farming Panel displays only farming activities within the selected life.
- The Farming Panel does not display farming activities from other lives.
- The Farming Panel does not display farming activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Farming Panel displays only farming activities within the selected life | Scoped by `life_id`. |
| The Farming Panel supports CRUD operations | Create, read, update, delete. |
| The Farming Panel uses pagination | No unbounded result sets. |
| No Farming Panel rule is removed after locking | Permanent. |

---

### Panel 16 — Cooking Panel

#### Purpose

The Cooking Panel displays the list of cooking activities available to a life and
provides CRUD operations for cooking records.

#### Components

| Component | Description |
|-----------|-------------|
| Cooking List | A paginated table of cooking activities with columns: recipe, ingredients, result, created date. |
| Cooking Card | A card view for each cooking activity showing recipe, ingredients, and result. |
| Create Cooking Button | A button to open the Create Cooking form. |
| Cooking Search | A search bar to filter by recipe. |
| Pagination Controls | Controls to navigate pages of cooking activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, cooking list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column cooking list. |
| Mobile | Bottom navigation, single-column cooking list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level production item. |
| Breadcrumb | "Activities > Cooking" displayed in the top bar. |
| Drill-Down | Clicking a cooking activity navigates to the Cooking Detail view. |
| Cross-Panel | From Cooking Detail, navigate to Recipes or Resources panels. |

#### Boundaries

- The Cooking Panel displays only cooking activities within the selected life.
- The Cooking Panel does not display cooking activities from other lives.
- The Cooking Panel does not display cooking activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Cooking Panel displays only cooking activities within the selected life | Scoped by `life_id`. |
| The Cooking Panel supports CRUD operations | Create, read, update, delete. |
| The Cooking Panel uses pagination | No unbounded result sets. |
| No Cooking Panel rule is removed after locking | Permanent. |

---

### Panel 17 — Smithing Panel

#### Purpose

The Smithing Panel displays the list of smithing activities available to a life and
provides CRUD operations for smithing records.

#### Components

| Component | Description |
|-----------|-------------|
| Smithing List | A paginated table of smithing activities with columns: recipe, materials, result, created date. |
| Smithing Card | A card view for each smithing activity showing recipe, materials, and result. |
| Create Smithing Button | A button to open the Create Smithing form. |
| Smithing Search | A search bar to filter by recipe. |
| Pagination Controls | Controls to navigate pages of smithing activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, smithing list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column smithing list. |
| Mobile | Bottom navigation, single-column smithing list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level production item. |
| Breadcrumb | "Activities > Smithing" displayed in the top bar. |
| Drill-Down | Clicking a smithing activity navigates to the Smithing Detail view. |
| Cross-Panel | From Smithing Detail, navigate to Recipes or Tools panels. |

#### Boundaries

- The Smithing Panel displays only smithing activities within the selected life.
- The Smithing Panel does not display smithing activities from other lives.
- The Smithing Panel does not display smithing activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Smithing Panel displays only smithing activities within the selected life | Scoped by `life_id`. |
| The Smithing Panel supports CRUD operations | Create, read, update, delete. |
| The Smithing Panel uses pagination | No unbounded result sets. |
| No Smithing Panel rule is removed after locking | Permanent. |

---

### Panel 18 — Alchemy Panel

#### Purpose

The Alchemy Panel displays the list of alchemy activities available to a life and
provides CRUD operations for alchemy records.

#### Components

| Component | Description |
|-----------|-------------|
| Alchemy List | A paginated table of alchemy activities with columns: recipe, reagents, result, created date. |
| Alchemy Card | A card view for each alchemy activity showing recipe, reagents, and result. |
| Create Alchemy Button | A button to open the Create Alchemy form. |
| Alchemy Search | A search bar to filter by recipe. |
| Pagination Controls | Controls to navigate pages of alchemy activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, alchemy list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column alchemy list. |
| Mobile | Bottom navigation, single-column alchemy list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level production item. |
| Breadcrumb | "Activities > Alchemy" displayed in the top bar. |
| Drill-Down | Clicking an alchemy activity navigates to the Alchemy Detail view. |
| Cross-Panel | From Alchemy Detail, navigate to Recipes or Resources panels. |

#### Boundaries

- The Alchemy Panel displays only alchemy activities within the selected life.
- The Alchemy Panel does not display alchemy activities from other lives.
- The Alchemy Panel does not display alchemy activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Alchemy Panel displays only alchemy activities within the selected life | Scoped by `life_id`. |
| The Alchemy Panel supports CRUD operations | Create, read, update, delete. |
| The Alchemy Panel uses pagination | No unbounded result sets. |
| No Alchemy Panel rule is removed after locking | Permanent. |

---

### Panel 19 — Enchanting Panel

#### Purpose

The Enchanting Panel displays the list of enchanting activities available to a life
and provides CRUD operations for enchanting records.

#### Components

| Component | Description |
|-----------|-------------|
| Enchanting List | A paginated table of enchanting activities with columns: recipe, materials, result, created date. |
| Enchanting Card | A card view for each enchanting activity showing recipe, materials, and result. |
| Create Enchanting Button | A button to open the Create Enchanting form. |
| Enchanting Search | A search bar to filter by recipe. |
| Pagination Controls | Controls to navigate pages of enchanting activities. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, enchanting list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column enchanting list. |
| Mobile | Bottom navigation, single-column enchanting list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level production item. |
| Breadcrumb | "Activities > Enchanting" displayed in the top bar. |
| Drill-Down | Clicking an enchanting activity navigates to the Enchanting Detail view. |
| Cross-Panel | From Enchanting Detail, navigate to Recipes or Tools panels. |

#### Boundaries

- The Enchanting Panel displays only enchanting activities within the selected life.
- The Enchanting Panel does not display enchanting activities from other lives.
- The Enchanting Panel does not display enchanting activities from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Enchanting Panel displays only enchanting activities within the selected life | Scoped by `life_id`. |
| The Enchanting Panel supports CRUD operations | Create, read, update, delete. |
| The Enchanting Panel uses pagination | No unbounded result sets. |
| No Enchanting Panel rule is removed after locking | Permanent. |

---

### Panel 20 — Experience Panel

#### Purpose

The Experience Panel displays the experience data for a life and provides CRUD
operations for experience records.

#### Components

| Component | Description |
|-----------|-------------|
| Experience Table | A paginated table of experience records with columns: activity, amount, source, created date. |
| Experience Summary | A summary card showing total experience, current level, and next level threshold. |
| Create Experience Button | A button to open the Create Experience form. |
| Experience Search | A search bar to filter by activity or source. |
| Pagination Controls | Controls to navigate pages of experience records. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, experience summary at top, experience table in a multi-column content area. |
| Tablet | Collapsible sidebar, summary and table in single column. |
| Mobile | Bottom navigation, summary and table stacked. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level progression item. |
| Breadcrumb | "Activities > Experience" displayed in the top bar. |
| Cross-Panel | Navigate to Mastery or Progression panels. |

#### Boundaries

- The Experience Panel displays only experience data within the selected life.
- The Experience Panel does not display experience data from other lives.
- The Experience Panel does not display experience data from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Experience Panel displays only experience data within the selected life | Scoped by `life_id`. |
| The Experience Panel supports CRUD operations | Create, read, update, delete. |
| The Experience Panel uses pagination | No unbounded result sets. |
| No Experience Panel rule is removed after locking | Permanent. |

---

### Panel 21 — Mastery Panel

#### Purpose

The Mastery Panel displays the mastery data for a life and provides CRUD operations
for mastery records.

#### Components

| Component | Description |
|-----------|-------------|
| Mastery Table | A paginated table of mastery records with columns: skill, level, points, created date. |
| Mastery Summary | A summary card showing total masteries, highest mastery, and average mastery level. |
| Create Mastery Button | A button to open the Create Mastery form. |
| Mastery Search | A search bar to filter by skill. |
| Pagination Controls | Controls to navigate pages of mastery records. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, mastery summary at top, mastery table in a multi-column content area. |
| Tablet | Collapsible sidebar, summary and table in single column. |
| Mobile | Bottom navigation, summary and table stacked. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level progression item. |
| Breadcrumb | "Activities > Mastery" displayed in the top bar. |
| Cross-Panel | Navigate to Skills or Progression panels. |

#### Boundaries

- The Mastery Panel displays only mastery data within the selected life.
- The Mastery Panel does not display mastery data from other lives.
- The Mastery Panel does not display mastery data from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Mastery Panel displays only mastery data within the selected life | Scoped by `life_id`. |
| The Mastery Panel supports CRUD operations | Create, read, update, delete. |
| The Mastery Panel uses pagination | No unbounded result sets. |
| No Mastery Panel rule is removed after locking | Permanent. |

---

### Panel 22 — Progression Panel

#### Purpose

The Progression Panel displays the progression data for a life and provides CRUD
operations for progression records.

#### Components

| Component | Description |
|-----------|-------------|
| Progression Table | A paginated table of progression records with columns: milestone, status, date achieved, created date. |
| Progression Summary | A summary card showing total milestones, completed milestones, and current progression path. |
| Create Progression Button | A button to open the Create Progression form. |
| Progression Search | A search bar to filter by milestone. |
| Progression Filter | A filter dropdown to filter by status. |
| Pagination Controls | Controls to navigate pages of progression records. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, progression summary at top, progression table in a multi-column content area. |
| Tablet | Collapsible sidebar, summary and table in single column. |
| Mobile | Bottom navigation, summary and table stacked. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the sidebar as a top-level progression item. |
| Breadcrumb | "Activities > Progression" displayed in the top bar. |
| Cross-Panel | Navigate to Experience or Mastery panels. |

#### Boundaries

- The Progression Panel displays only progression data within the selected life.
- The Progression Panel does not display progression data from other lives.
- The Progression Panel does not display progression data from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Progression Panel displays only progression data within the selected life | Scoped by `life_id`. |
| The Progression Panel supports CRUD operations | Create, read, update, delete. |
| The Progression Panel uses pagination | No unbounded result sets. |
| No Progression Panel rule is removed after locking | Permanent. |

---

### Panel 23 — Activity Dashboard

#### Purpose

The Activity Dashboard displays a top-level overview of all activity data for a life
and provides navigation to all activity panels.

#### Components

| Component | Description |
|-----------|-------------|
| Activity Overview | A summary card showing total activities, active professions, and total experience. |
| Profession Summary | A summary card showing the current professions and their levels. |
| Skill Summary | A summary card showing total skills, mastered skills, and average skill level. |
| Crafting Summary | A summary card showing total crafts, recipes known, and tools owned. |
| Harvesting Summary | A summary card showing total harvesting activities and total yield. |
| Production Summary | A summary card showing total cooking, smithing, alchemy, and enchanting activities. |
| Progression Summary | A summary card showing current level, total experience, and mastery count. |
| Quick Navigation | A grid of navigation links to all 22 activity panels. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, dashboard cards in a multi-column grid layout. |
| Tablet | Collapsible sidebar, dashboard cards in a two-column grid. |
| Mobile | Bottom navigation, dashboard cards in a single-column stacked layout. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessible from the sidebar navigation as the top-level dashboard item. |
| Breadcrumb | "Activity Dashboard" displayed in the top bar breadcrumb. |
| Cross-Panel | Each summary card links to its corresponding detail panel. |
| Quick Navigation | The quick navigation grid links to all 22 activity panels. |

#### Boundaries

- The Activity Dashboard displays only activity data within the selected life.
- The Activity Dashboard does not display activity data from other lives.
- The Activity Dashboard does not display activity data from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Activity Dashboard displays only activity data within the selected life | Scoped by `life_id`. |
| The Activity Dashboard provides navigation to all 22 activity panels | No missing links. |
| The Activity Dashboard uses summary cards | No unbounded result sets. |
| No Activity Dashboard rule is removed after locking | Permanent. |

---

## Sprint 1.2.5.6 Review

### Sprint Summary

**Sprint:** 1.2.5.6 — Activity Blueprint v1.0 (Chapters 14–16)
**Status:** COMPLETE
**Date:** 2026-08-07

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 14 | Completion Checklist | 12 sections: architecture, ownership, relationship, synchronization, replay, migration, security, validation, performance, monitoring, documentation, release. Each with requirements, completion criteria, validation rules, acceptance rules, permanent restrictions. |
| 15 | Lock Policy | 20 sections: lock philosophy, lock requirements, modification procedure, exception procedure, unlock procedure, review procedure, approval procedure, versioning strategy, compatibility guarantees, deterministic guarantees, replay guarantees, migration guarantees, synchronization guarantees, dependency guarantees, ownership guarantees, permanent restrictions, change management rules, semantic versioning rules, documentation requirements, future revision procedures. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 16 | Visual Prototype | 10 rule sections: panel philosophy, desktop layout, tablet layout, mobile layout, navigation hierarchy, typography rules, accessibility rules, theme rules, animation rules, responsiveness rules. 23 visual panels: Activities, Professions, Jobs, Skills, Abilities, Talents, Crafts, Recipes, Tools, Resources, Harvesting, Gathering, Mining, Fishing, Farming, Cooking, Smithing, Alchemy, Enchanting, Experience, Mastery, Progression, Activity Dashboard. Each rule section with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. Each panel with purpose, components, layout, navigation, boundaries, permanent rules. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–16) | PASS |
| No gaps in chapter numbering | PASS |
| All 23 activity tables documented | PASS |
| All 23 visual panels defined | PASS |
| All 12 completion checklist sections authored | PASS |
| All 20 lock policy sections authored | PASS |
| All 10 visual prototype rule sections authored | PASS |
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
| Build passes | PASS |

### Notes

- The Activity Blueprint v1.0 is COMPLETE. All 16 chapters are authored.
- Blueprint Completion = 100%.
- Status = READY FOR LOCK.
- Next step: Lead Architect sign-off, Peer Architect sign-off, and blueprint lock.

---

## Sprint 1.2.5.6 Audit Report

### Audit Summary

**Audit Date:** 2026-08-07
**Auditor:** Lead Database Architect
**Blueprint:** Activity Blueprint v1.0
**Sprint:** 1.2.5.6
**Result:** PASS

### Audit Scope

This audit covers the verification of Sprint 1.2.5.6 deliverables: Chapter 14
(Completion Checklist), Chapter 15 (Lock Policy), Chapter 16 (Visual Prototype),
header metadata updates, completion percentage updates, stale entry removal, section
numbering consistency, and implementation code absence verification.

### Audit Checks

| # | Check | Expected | Actual | Result |
|---|-------|----------|--------|--------|
| 1 | Chapter 14 exists | 1 chapter header + 12 sections | 1 header + 12 sections (14.1–14.12) | PASS |
| 2 | Chapter 15 exists | 1 chapter header + 20 sections | 1 header + 20 sections (15.1–15.20) | PASS |
| 3 | Chapter 16 exists | 1 chapter header + 10 rule sections + 23 panels | 1 header + 10 sections (16.1–16.10) + 23 panels (1–23) | PASS |
| 4 | Chapter numbering sequential | 1–16, no gaps | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 | PASS |
| 5 | Section numbering Ch 14 | 14.1–14.12, no gaps | 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10, 14.11, 14.12 | PASS |
| 6 | Section numbering Ch 15 | 15.1–15.20, no gaps | 15.1 through 15.20 sequential | PASS |
| 7 | Section numbering Ch 16 | 16.1–16.10, no gaps | 16.1 through 16.10 sequential | PASS |
| 8 | Panel numbering | Panels 1–23, no gaps | Panel 1 through Panel 23 sequential | PASS |
| 9 | No SQL code | 0 matches | 0 matches | PASS |
| 10 | No TypeScript code | 0 matches | 0 matches | PASS |
| 11 | No React code | 0 matches | 0 matches | PASS |
| 12 | No API code | 0 matches | 0 matches | PASS |
| 13 | No pseudocode | 0 matches | 0 matches | PASS |
| 14 | Blueprint version updated | v1.0 — Sprint 1.2.5.6 | v1.0 — Sprint 1.2.5.6 | PASS |
| 15 | Blueprint status updated | READY FOR LOCK | READY FOR LOCK | PASS |
| 16 | Lock status updated | READY FOR LOCK | READY FOR LOCK | PASS |
| 17 | Chapters completed field | 1–16 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 | PASS |
| 18 | Chapters pending field | None | None | PASS |
| 19 | Blueprint completion | 100% | 100% | PASS |
| 20 | Last update date | 2026-08-07 | 2026-08-07 | PASS |
| 21 | Next sprint | None | None — Blueprint is complete and ready for lock. | PASS |
| 22 | Pending chapters table | All 16 COMPLETE | All 16 marked COMPLETE | PASS |
| 23 | No stale PENDING entries in chapter table | 0 PENDING | 0 PENDING | PASS |
| 24 | Build passes | Exit code 0 | Exit code 0 | PASS |

### Audit Findings

No findings. All 24 audit checks passed.

### Audit Conclusion

The Activity Blueprint v1.0 Sprint 1.2.5.6 deliverables are complete, consistent,
and verified. The blueprint is READY FOR LOCK.

---

## Sprint 1.2.5.6 Validation Report

### Validation Summary

**Validation Date:** 2026-08-07
**Validator:** Lead Database Architect
**Blueprint:** Activity Blueprint v1.0
**Sprint:** 1.2.5.6
**Result:** PASS

### Validation Scope

This validation covers the structural, content, and cross-cutting validation of
Sprint 1.2.5.6 deliverables against the blueprint's 10 cross-cutting guarantees and
the project's documentation standards.

### Structural Validation

| # | Validation | Expected | Actual | Result |
|---|------------|----------|--------|--------|
| 1 | Chapter 14 header present | `## 14. Completion Checklist` | Present at expected location | PASS |
| 2 | Chapter 15 header present | `## 15. Lock Policy` | Present at expected location | PASS |
| 3 | Chapter 16 header present | `## 16. Visual Prototype` | Present at expected location | PASS |
| 4 | Chapter 14 section count | 12 | 12 (14.1–14.12) | PASS |
| 5 | Chapter 15 section count | 20 | 20 (15.1–15.20) | PASS |
| 6 | Chapter 16 rule section count | 10 | 10 (16.1–16.10) | PASS |
| 7 | Chapter 16 panel count | 23 | 23 (Panel 1–Panel 23) | PASS |
| 8 | Sprint review present | `## Sprint 1.2.5.6 Review` | Present | PASS |
| 9 | Audit report present | `## Sprint 1.2.5.6 Audit Report` | Present | PASS |
| 10 | Validation report present | `## Sprint 1.2.5.6 Validation Report` | Present | PASS |

### Content Validation

| # | Validation | Expected | Actual | Result |
|---|------------|----------|--------|--------|
| 1 | Ch 14 sections have Requirements, Completion Criteria, Validation Rules, Acceptance Rules, Permanent Restrictions | 5 subsections per section | All 12 sections have 5 subsections | PASS |
| 2 | Ch 15 sections have Purpose, Scope, Boundaries, Guarantees, Permanent Rules, Compatibility Rules | 6 subsections per section | All 20 sections have 6 subsections | PASS |
| 3 | Ch 16 rule sections have Purpose, Scope, Boundaries, Guarantees, Permanent Rules, Compatibility Rules | 6 subsections per section | All 10 rule sections have 6 subsections | PASS |
| 4 | Ch 16 panels have Purpose, Components, Layout, Navigation, Boundaries, Permanent Rules | 6 subsections per panel | All 23 panels have 6 subsections | PASS |
| 5 | No implementation code (SQL) | 0 matches | 0 matches | PASS |
| 6 | No implementation code (TypeScript) | 0 matches | 0 matches | PASS |
| 7 | No implementation code (React) | 0 matches | 0 matches | PASS |
| 8 | No implementation code (API) | 0 matches | 0 matches | PASS |
| 9 | No pseudocode | 0 matches | 0 matches | PASS |
| 10 | Blueprint documentation only | Yes | Yes | PASS |

### Cross-Cutting Guarantee Validation

| # | Guarantee | Preserved | Result |
|---|-----------|-----------|--------|
| 1 | Save Engine Compatibility | Yes — Ch 14–16 compatibility rules preserve save snapshots | PASS |
| 2 | Replay Compatibility | Yes — Ch 14–16 compatibility rules are deterministic | PASS |
| 3 | Migration Compatibility | Yes — Ch 14–16 compatibility rules are additive and forward-only | PASS |
| 4 | Synchronization Compatibility | Yes — Ch 14–16 compatibility rules are server-authoritative | PASS |
| 5 | Event Bus Compatibility | Yes — Ch 14–16 compatibility rules do not affect event ordering | PASS |
| 6 | Ownership Consistency | Yes — Ch 14–16 preserve user_id, world_id, life_id scoping | PASS |
| 7 | Dependency Consistency | Yes — Ch 14–16 preserve DAG and no circular dependencies | PASS |
| 8 | Naming Consistency | Yes — Ch 14–16 follow Naming Rules v1.0 | PASS |
| 9 | Lock Policy Compliance | Yes — Ch 15 defines and enforces the lock policy | PASS |
| 10 | Event Ordering Consistency | Yes — Ch 14–16 do not affect event ordering | PASS |

### Validation Findings

No findings. All structural, content, and cross-cutting guarantee validations passed.

### Validation Conclusion

The Activity Blueprint v1.0 Sprint 1.2.5.6 deliverables are structurally complete,
content-valid, and preserve all 10 cross-cutting guarantees. The blueprint is
READY FOR LOCK.

---

## Sprint 1.2.5.6 Final Status Report

### Final Status

**Blueprint:** Activity Blueprint v1.0
**Sprint:** 1.2.5.6 — Chapters 14–16
**Date:** 2026-08-07
**Status:** COMPLETE
**Blueprint Completion:** 100%
**Blueprint Status:** READY FOR LOCK

### Chapters Delivered

| Chapter | Title | Sections | Status |
|---------|-------|----------|--------|
| 14 | Completion Checklist | 12 sections (14.1–14.12) | COMPLETE |
| 15 | Lock Policy | 20 sections (15.1–15.20) | COMPLETE |
| 16 | Visual Prototype | 10 rule sections (16.1–16.10) + 23 panels | COMPLETE |

### Blueprint Chapter Summary (All 16 Chapters)

| Chapter | Title | Sprint | Status |
|---------|-------|--------|--------|
| 1 | Identity | 1.2.5.1 | COMPLETE |
| 2 | Philosophy | 1.2.5.1 | COMPLETE |
| 3 | Purpose | 1.2.5.1 | COMPLETE |
| 4 | Responsibilities | 1.2.5.2 | COMPLETE |
| 5 | Schema Architecture | 1.2.5.2 | COMPLETE |
| 6 | Naming Convention | 1.2.5.2 | COMPLETE |
| 7 | Relationships | 1.2.5.3 | COMPLETE |
| 8 | Security | 1.2.5.3 | COMPLETE |
| 9 | Validation | 1.2.5.3 | COMPLETE |
| 10 | Performance Architecture | 1.2.5.4 | COMPLETE |
| 11 | Testing Architecture | 1.2.5.4 | COMPLETE |
| 12 | Future Expansion | 1.2.5.5 | COMPLETE |
| 13 | Dependencies | 1.2.5.5 | COMPLETE |
| 14 | Completion Checklist | 1.2.5.6 | COMPLETE |
| 15 | Lock Policy | 1.2.5.6 | COMPLETE |
| 16 | Visual Prototype | 1.2.5.6 | COMPLETE |

### Verification Results

| Verification | Result |
|--------------|--------|
| All 16 chapters authored | PASS |
| All 12 Ch 14 sections authored | PASS |
| All 20 Ch 15 sections authored | PASS |
| All 10 Ch 16 rule sections authored | PASS |
| All 23 Ch 16 panels authored | PASS |
| Section numbering sequential, no gaps | PASS |
| No stale PENDING entries in chapter table | PASS |
| Header metadata updated | PASS |
| Completion percentage = 100% | PASS |
| No SQL, TypeScript, React, API, or pseudocode | PASS |
| All 10 cross-cutting guarantees preserved | PASS |
| Build passes (exit code 0) | PASS |
| Audit report produced | PASS |
| Validation report produced | PASS |

### Next Steps

1. Lead Architect sign-off.
2. Peer Architect sign-off.
3. Blueprint lock — transition status from READY FOR LOCK to LOCKED.
4. No further sprints required for Activity Blueprint v1.0.

### Final Statement

The Activity Blueprint v1.0 is complete. All 16 chapters are authored. All 12
completion checklist sections pass. All 20 lock policy sections are defined. All 10
visual prototype rule sections and all 23 visual panels are defined. The blueprint
contains no implementation code. All 10 cross-cutting guarantees are preserved. The
build passes. The blueprint is READY FOR LOCK.
