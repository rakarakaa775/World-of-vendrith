# Life Blueprint

> The Vendrith World — Life Database Blueprint.
>
> This blueprint defines the life layer of the database schema: lives, races,
> species, classes, subclasses, attributes, statistics, traits, titles,
> reputations, alignments, bloodlines, heritages, statuses, ages, and lifespans.
> It is a design document only — no SQL, no TypeScript, no pseudocode, no
> implementation code.
>
> The blueprint follows the Database Architecture Blueprint v1.0 (LOCKED), the
> Foundation Blueprint v1.0 (READY FOR LOCK), the World Blueprint v1.0 (LOCKED),
> the Engine Blueprint Standard v1.0, the Save Architecture, the Replay
> Architecture, the Synchronization Architecture, the Validation Architecture,
> the Event Bus Architecture, the Engine Dependency Graph, and the Naming Rules
> v1.0.
>
> **Blueprint Version:** v1.0 — Sprint 1.2.4.6
> **Blueprint Status:** IN PROGRESS
> **Lock Status:** IN PROGRESS
> **Owner:** Lead Database Architect

---

## Pending Chapters Table

| Chapter | Title | Sprint | Status |
|---------|-------|--------|--------|
| 1 | Identity | 1.2.4.1 | COMPLETE |
| 2 | Philosophy | 1.2.4.1 | COMPLETE |
| 3 | Purpose | 1.2.4.1 | COMPLETE |
| 4 | Responsibilities | 1.2.4.2 | COMPLETE |
| 5 | Schema Architecture | 1.2.4.2 | COMPLETE |
| 6 | Naming Convention | 1.2.4.2 | COMPLETE |
| 7 | Relationships | 1.2.4.3 | COMPLETE |
| 8 | Security | 1.2.4.3 | COMPLETE |
| 9 | Validation | 1.2.4.3 | COMPLETE |
| 10 | Performance | 1.2.4.4 | COMPLETE |
| 11 | Testing | 1.2.4.4 | COMPLETE |
| 12 | Future Expansion | 1.2.4.5 | COMPLETE |
| 13 | Dependencies | 1.2.4.5 | COMPLETE |
| 14 | Completion Checklist | 1.2.4.6 | COMPLETE |
| 15 | Lock Policy | 1.2.4.6 | COMPLETE |
| 16 | Visual Prototype | 1.2.4.6 | COMPLETE |

**Chapters 1–3 authored in Sprint 1.2.4.1. Chapters 4–6 authored in Sprint
1.2.4.2. Chapters 7–9 authored in Sprint 1.2.4.3. Chapters 10–11 authored in Sprint
1.2.4.4. Chapters 12–13 authored in Sprint 1.2.4.5. Chapters 14–16 authored in
Sprint 1.2.4.6. All 16 chapters are complete. The blueprint is READY FOR LOCK.**

---

## Document Control

| Field | Value |
|-------|-------|
| Blueprint Name | Life Blueprint |
| Blueprint Version | v1.0 — Sprint 1.2.4.6 |
| Blueprint Status | READY FOR LOCK |
| Lock Status | READY FOR LOCK |
| Phase | 1.2 — Database Schema Design |
| Sprint | 1.2.4.6 — Chapters 14–16 |
| Owner | Lead Database Architect |
| Approver | Lead Architect |
| Reviewer | Peer Architect |
| Chapters Completed | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 |
| Chapters Pending | None |
| Last Update | 2026-08-04 — Sprint 1.2.4.6 authored (Chapters 14–16). All 16 chapters complete. Blueprint is READY FOR LOCK. |
| Next Sprint | None — Blueprint complete, ready for lock review and approval. |
| Related Architecture | Database Architecture Blueprint v1.0 (LOCKED), Foundation Blueprint v1.0 (READY FOR LOCK), World Blueprint v1.0 (LOCKED) |

---

## 1. Identity

### Overview

This chapter defines the permanent identity record for the Life Blueprint. The
Life Blueprint defines the life layer of the database schema — the tables that
manage lives, races, species, classes, subclasses, attributes, statistics,
traits, titles, reputations, alignments, bloodlines, heritages, statuses, ages,
and lifespans. These tables are the third layer of the database schema, built on
top of the Foundation Layer and the World Layer. Every gameplay system that
references a character's identity, biology, capabilities, lineage, or life
state depends on the Life Layer.

The identity attributes below are permanent. They do not change when individual
tables are added, removed, or restructured. They identify the blueprint, not the
specific tables within it.

This chapter has 14 sections.

---

### 1.1 Blueprint Identity

#### Purpose

The blueprint identity defines the permanent name, abbreviation, domain, layer,
and schema group for the Life Blueprint.

#### Scope

The blueprint identity applies to the entire Life Blueprint — all 16 chapters
and all tables within the life layer.

#### Boundaries

The blueprint identity is permanent. It does not change when tables are added or
restructured. It identifies the blueprint, not the tables within it.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Permanent Name | The blueprint name is `Life Blueprint` (abbreviated `LB`). It does not change. |
| Permanent Layer | The Life Layer is Layer 3 of the 10-layer schema hierarchy. It does not change. |
| Permanent Domain | The domain is Database Schema Design. It does not change. |
| Permanent Schema Group | The schema group is Life. It does not change. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint name is `Life Blueprint` | Abbreviated `LB`. Used in documentation, cross-references, sprint logs, and the migration log. |
| The Life Layer is Layer 3 of the 10-layer schema hierarchy | Per the Database Architecture Blueprint v1.0 §5. |
| The Life Layer must be designed and locked before any layer above it | Layers 4–10 may depend on the Life Layer. |
| The blueprint name does not change when tables are added or restructured | It identifies the layer, not the tables. |

---

### 1.2 Blueprint Scope

#### Purpose

The blueprint scope defines what the Life Blueprint covers and what it does not
cover.

#### Scope

The blueprint scope applies to all tables in the life layer: lives, races,
species, classes, subclasses, attributes, statistics, traits, titles,
reputations, alignments, bloodlines, heritages, statuses, ages, and lifespans.

#### Boundaries

The Life Blueprint covers the life data — the biological identity, racial
classification, species classification, class system, subclass system,
attribute system, statistical system, trait system, title system, reputation
system, alignment system, bloodline system, heritage system, status system,
age system, and lifespan system that define a character's life. It does not
cover gameplay systems (inventory, dialogue, quests, combat, activities, NPC AI,
economy), world geography, or save data. Those are covered by their respective
blueprints.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Life Identity | The blueprint covers lives — the core life entity for each character. |
| Life Biology | The blueprint covers races, species, bloodlines, heritages, ages, and lifespans. |
| Life Capabilities | The blueprint covers classes, subclasses, attributes, statistics, and traits. |
| Life Social | The blueprint covers titles, reputations, and alignments. |
| Life State | The blueprint covers statuses. |
| No Gameplay Systems | The blueprint does not cover inventory, dialogue, quests, combat, activities, NPC AI, or economy. |
| No World Geography | The blueprint does not cover worlds, continents, regions, or locations. |
| No Save Data | The blueprint does not cover save snapshots or save documents. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Blueprint covers 16 table domains | lives, races, species, classes, subclasses, attributes, statistics, traits, titles, reputations, alignments, bloodlines, heritages, statuses, ages, lifespans. |
| The Life Blueprint does not cover gameplay systems | Those are covered by their respective blueprints. |
| The Life Blueprint does not cover world geography | That is covered by the World Blueprint. |
| The Life Blueprint does not cover save data | That is covered by the Save Engine. |
| The scope is permanent | It does not change when tables are added or restructured. |

---

### 1.3 Blueprint Objectives

#### Purpose

The blueprint objectives define what the Life Blueprint aims to achieve.

#### Scope

The blueprint objectives apply to the entire Life Blueprint — all 16 chapters
and all tables within the life layer.

#### Boundaries

The objectives are goals, not guarantees. They define what the blueprint aims to
achieve, not what it promises. The guarantees are defined in Chapter 2
(Philosophy) and the compatibility rules throughout the blueprint.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Complete Life Model | The blueprint provides a complete model of a character's life identity, biology, capabilities, social standing, and life state. |
| Replay-Compatible | The blueprint ensures life data does not introduce non-determinism into replays. |
| Migration-Safe | The blueprint ensures life migrations are additive, forward-only, and backward compatible. |
| Sync-Compatible | The blueprint ensures life data is server-authoritative and non-blocking. |
| Ownership-Safe | The blueprint ensures life data is scoped to the correct owner. |
| Performant | The blueprint ensures life queries are efficient and non-blocking. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The blueprint provides a complete life model | No gaps in identity, biology, capabilities, social standing, or life state. |
| The blueprint is replay-compatible | Life data does not introduce non-determinism. |
| The blueprint is migration-safe | Migrations are additive and forward-only. |
| The blueprint is sync-compatible | Life data is server-authoritative and non-blocking. |
| The blueprint is ownership-safe | Life data is scoped to the correct owner. |
| The blueprint is performant | Life queries are efficient and non-blocking. |

---

### 1.4 Version Information

#### Purpose

The version information defines the current version, status, sprint, and chapter
completion for the Life Blueprint.

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

The ownership information defines who owns, approves, and reviews the Life
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

The dependency information defines what the Life Blueprint depends on and what
depends on it.

#### Scope

The dependency information applies to all cross-layer dependencies involving the
Life Layer.

#### Boundaries

The Life Layer is Layer 3 of the 10-layer schema hierarchy. It depends on the
Foundation Layer (Layer 1) and the World Layer (Layer 2). Layers 4–10 may depend
on the Life Layer. The Life Layer does not depend on any layer above it. No
circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 3 | The Life Layer is Layer 3 of the 10-layer schema hierarchy. |
| Foundation Dependency | The Life Layer depends on the Foundation Layer (Layer 1) for user identity and ownership scoping. |
| World Dependency | The Life Layer depends on the World Layer (Layer 2) for world context — a life exists within a world. |
| No Upward Dependencies | The Life Layer does not depend on any layer above it. |
| No Circular Dependencies | The Life Layer does not create circular dependencies. |
| DAG Structure | The schema dependency graph remains a directed acyclic graph. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer is Layer 3 | Per the Database Architecture Blueprint v1.0 §5. |
| The Life Layer depends on the Foundation Layer | Via `user_id` references. No copies of foundation data. |
| The Life Layer depends on the World Layer | Via `world_id` references. No copies of world data. |
| The Life Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The Life Layer follows the Engine Dependency Graph | Topological build order. |
| No engine imports a database client | (Engine Dependency Graph). |

---

### 1.7 Compatibility Requirements

#### Purpose

The compatibility requirements define what the Life Blueprint must be compatible
with — the Save Engine, the Replay System, the Event Bus, the Synchronization
Architecture, and every other dependent system.

#### Scope

The compatibility requirements apply to all life tables, all life queries, all
life migrations, and all life sync operations.

#### Boundaries

All 10 compatibility guarantees are permanent. No life table, no life migration,
no life sync operation weakens a compatibility guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | Life data does not affect save snapshots. The user ID is the only foundation reference. |
| Replay Compatibility | Life data does not introduce non-determinism into replays. |
| Migration Compatibility | Life migrations are additive, forward-only, and backward compatible. |
| Synchronization Compatibility | Life data is server-authoritative and non-blocking. |
| Event Bus Compatibility | Life data does not affect event ordering. |
| Snapshot Compatibility | Life data does not affect existing snapshot format. |
| Save Compatibility | Life data does not affect existing save format. |
| Ownership Compatibility | Life data does not weaken RLS. |
| Lock Policy Compatibility | Life data is documented and follows the lock policy. |
| Dependency Compatibility | Life data does not create circular dependencies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are permanent | No weakening. |
| No life table weakens a compatibility guarantee | No exceptions. |
| No life migration weakens a compatibility guarantee | No exceptions. |
| No life sync operation weakens a compatibility guarantee | No exceptions. |
| Compatibility is tested | Every life table is tested against all dependent systems. |

---

### 1.8 Synchronization Requirements

#### Purpose

The synchronization requirements define how life data is synced. Life data is
server-authoritative. Sync is non-blocking.

#### Scope

The synchronization requirements apply to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

#### Boundaries

Sync is server-authoritative, non-blocking, and does not corrupt data. The Life
Layer does not manage sync — the Synchronization Architecture does. The game
continues in a degraded state when the server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Life sync is server-authoritative. No client-side authority. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life sync is server-authoritative | No client-side authority. |
| Life sync is non-blocking | No blocking gameplay. |
| Life sync does not corrupt data | Atomic operations. |
| The Life Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 1.9 Validation Requirements

#### Purpose

The validation requirements define how life data is validated. Validation is
enforced at the database boundary through constraints and RLS.

#### Scope

The validation requirements apply to all constraints, RLS policies, and
validation checks in the life layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
Life Layer enforces validation — it does not define the validation framework.

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
| The Life Layer enforces validation | It does not define the framework. |

---

### 1.10 Replay Requirements

#### Purpose

The replay requirements define how life data relates to the Replay System. Life
data does not introduce non-determinism into replays.

#### Scope

The replay requirements apply to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots. The only life value in a snapshot is the
life identifier (if the engine references it). The Life Layer has zero replay
overhead. The Life Layer is unaware of the Replay System.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Life, race, and class identifiers are deterministic. |
| No Non-Determinism | Life data does not introduce non-determinism. |
| Cross-Platform Replay | Life identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if the engine references it. |
| Life identifiers are deterministic | Never change after creation. |
| No non-determinism from life data | Same state, same result. |
| The Life Layer is unaware of the Replay System | No upward dependency. |
| Life identifiers are platform-independent | Cross-platform replay works. |

---

### 1.11 Migration Requirements

#### Purpose

The migration requirements define how life migrations are managed. Migrations
are additive, forward-only, and backward compatible.

#### Scope

The migration requirements apply to all life migrations — any additive change
to the life schema.

#### Boundaries

No life migration drops a table, drops a column, renames a column, or changes a
column type. Every life migration is logged in the Migration Log. Every life
migration is tested against all dependent layers.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Life migrations are additive. No destructive operations. |
| Forward-Only | Life migrations are forward-only. No backward migration. |
| Backward Compatible | Life migrations do not break existing data. |
| Logged | Every life migration is recorded in the Migration Log. |
| Tested | Every life migration is tested against all dependent layers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life migrations are additive | No DROP, rename, or type change without a plan. |
| Life migrations are forward-only | No backward migration. |
| Every life migration is logged | In `docs/database/Migration_Log.md`. |
| Every life migration is tested | Against all dependent layers. |
| No life migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |

---

### 1.12 Lock Policy

#### Purpose

The lock policy defines how the Life Blueprint is frozen. Once locked, the
blueprint is the authoritative specification for the life layer.

#### Scope

The lock policy applies to the entire Life Blueprint — all 16 chapters, all
sections, all guarantees, and all compatibility rules.

#### Boundaries

The blueprint is IN PROGRESS. It transitions to READY FOR LOCK when all 16
chapters are complete. It transitions to LOCKED when the Lead Architect approves.
Once locked, no chapter is added, no section is removed, no guarantee is weakened
without the exception procedure.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Authoritative | Once locked, the blueprint is the authoritative specification for the life layer. |
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

The related documents section defines all documents that the Life Blueprint
references, follows, or is related to.

#### Scope

The related documents apply to all cross-references in the Life Blueprint.

#### Boundaries

All related documents are locked or ready for lock. No related document is
modified by the Life Blueprint. The Life Blueprint follows them; it does not
change them.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid References | All cross-references are valid and traceable. |
| No Modification | No related document is modified by the Life Blueprint. |
| Follows | The Life Blueprint follows all related documents. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Blueprint follows the Database Architecture Blueprint v1.0 (LOCKED) | No modifications to it. |
| The Life Blueprint follows the Foundation Blueprint v1.0 (READY FOR LOCK) | No modifications to it. |
| The Life Blueprint follows the World Blueprint v1.0 (LOCKED) | No modifications to it. |
| The Life Blueprint follows the Engine Blueprint Standard v1.0 | No modifications to it. |
| The Life Blueprint follows the Save Architecture | No modifications to it. |
| The Life Blueprint follows the Replay Architecture | No modifications to it. |
| The Life Blueprint follows the Synchronization Architecture | No modifications to it. |
| The Life Blueprint follows the Validation Architecture | No modifications to it. |
| The Life Blueprint follows the Event Bus Architecture | No modifications to it. |
| The Life Blueprint follows the Engine Dependency Graph | No modifications to it. |
| The Life Blueprint follows the Naming Rules v1.0 | No modifications to it. |
| All cross-references are valid | No broken references. |

---

### 1.14 Future Expansion Compatibility

#### Purpose

The future expansion compatibility section defines how the Life Blueprint
supports future expansion. The Life Layer is designed for additive growth.

#### Scope

The future expansion compatibility applies to all future tables, columns,
relationships, and systems added to the Life Layer.

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
| Expansion does not create circular dependencies | The Life Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and the schema documentation. |
| Expansion is tested against dependent layers | No breaking changes. |
| The data model is never optimized for the current sprint at the expense of the next phase | (Database Rules §10). |

---

## 2. Philosophy

### Overview

This chapter defines the permanent philosophical principles that govern the Life
Blueprint. These principles translate the Database Architecture Blueprint v1.0,
the Foundation Blueprint v1.0, the World Blueprint v1.0, and the Engine Blueprint
Standard v1.0 into concrete life-layer rules. No principle may be violated
without Lead Architect approval.

This chapter defines 12 principles. Each principle includes purpose, scope,
boundaries, guarantees, and permanent rules.

---

### 2.1 Deterministic Execution

#### Purpose

The deterministic execution principle defines the permanent rule that life data
preserves deterministic execution. The same inputs always produce the same
outputs.

#### Scope

This principle applies to all life operations that affect game state or are part
of engine snapshots: life identifiers, race identifiers, class identifiers,
attribute values, status values.

#### Boundaries

No life data introduces non-determinism. Life identifiers are deterministic —
assigned at creation, never changed. Attribute calculations are deterministic.
No wall-clock time or unseeded randomness affects life data that flows into
snapshots.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Identifiers | Life, race, class, and subclass identifiers are deterministic. Never change after creation. |
| No Wall-Clock Dependence | No wall-clock time affects life data in snapshots. |
| No Randomness | No unseeded randomness affects life data in snapshots. |
| Same Inputs, Same Outputs | The same life state always produces the same result. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life identifiers are deterministic | Assigned at creation, never changed. |
| No wall-clock time affects life data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects life data in snapshots | No random non-determinism. |
| The same life state always produces the same result | Deterministic execution. |

---

### 2.2 Ownership Consistency

#### Purpose

The ownership consistency principle defines the permanent rule that life data is
scoped to the correct owner. RLS is enforced. No cross-user access from the
client.

#### Scope

This principle applies to all RLS policies, all access paths, and all trust
boundaries in the life layer.

#### Boundaries

RLS is enabled on every life table. Four policies per table (SELECT, INSERT,
UPDATE, DELETE). The service role key is server-side only. No cross-user access
from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every life table. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |
| Ownership Scoping | Life data is scoped to the correct owner. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| Life data is scoped to the correct owner | No unauthorized access. |

---

### 2.3 Event-Driven Architecture

#### Purpose

The event-driven architecture principle defines the permanent rule that life data
follows the Event Bus's publish/subscribe model. Life data does not affect event
ordering.

#### Scope

This principle applies to all life operations that emit or consume events: life
creation, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

#### Boundaries

The Life Layer publishes events through the Event Bus. It does not manage the
Event Bus. Life data does not affect event ordering. Events are deterministic.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Event Bus Compliance | Life data follows the Event Bus's publish/subscribe model. |
| No Event Ordering Changes | Life data does not affect event ordering. |
| Deterministic Events | Life events are deterministic. |
| No Upward Dependency | The Life Layer does not depend on any gameplay engine's event handling. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data follows the Event Bus's publish/subscribe model | No direct coupling. |
| Life data does not affect event ordering | Event ordering is preserved. |
| Life events are deterministic | Same state, same events. |
| The Life Layer does not manage the Event Bus | It publishes and subscribes. |

---

### 2.4 Replay Compatibility

#### Purpose

The replay compatibility principle defines the permanent rule that life data does
not introduce non-determinism into replays. The same state always produces the
same result.

#### Scope

This principle applies to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots (except the life identifier if the engine
references it). No life data introduces non-determinism. Replays do not query
life tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| Cross-Platform Replay | Life identifiers are platform-independent. |
| No Non-Determinism | Life data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Life identifiers are deterministic | Never change after creation. |
| No non-determinism from life data | Same state, same result. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are platform-independent | Cross-platform replay works. |

---

### 2.5 Migration Safety

#### Purpose

The migration safety principle defines the permanent rule that life migrations
are additive, forward-only, and backward compatible. No migration destroys data.

#### Scope

This principle applies to all life migrations — any additive change to the life
schema.

#### Boundaries

No life migration drops a table, drops a column, renames a column, or changes a
column type. Every life migration is logged and tested. The previous valid state
is always retained.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | Life migrations are additive. No destructive operations. |
| Forward-Only | Life migrations are forward-only. No backward migration. |
| Backward Compatible | Life migrations do not break existing data. |
| No Data Loss | No migration destroys data. The previous valid state is retained. |
| Tested | Every life migration is tested against all dependent layers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life migrations are additive | No DROP, rename, or type change without a plan. |
| Life migrations are forward-only | No backward migration. |
| Every life migration is logged | In `docs/database/Migration_Log.md`. |
| Every life migration is tested | Against all dependent layers. |
| No life migration is merged with failing tests | No broken migrations. |
| The previous valid state is always retained | No data loss. |

---

### 2.6 Synchronization Consistency

#### Purpose

The synchronization consistency principle defines the permanent rule that life
data is server-authoritative and non-blocking. Sync does not corrupt data.

#### Scope

This principle applies to all life data that is synced: life metadata, race
selection, class selection, attribute changes, status changes, title changes,
reputation changes.

#### Boundaries

Sync is server-authoritative, non-blocking, and does not corrupt data. The Life
Layer does not manage sync. The game continues in a degraded state when the server
is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Life sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life sync is server-authoritative | No client-side authority. |
| Life sync is non-blocking | No blocking gameplay. |
| Life sync does not corrupt data | Atomic operations. |
| The Life Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 2.7 Data Integrity

#### Purpose

The data integrity principle defines the permanent rule that life data is
accurate, consistent, and complete. Constraints and RLS enforce integrity.

#### Scope

This principle applies to all constraints, RLS policies, and validation checks in
the life layer.

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

The scalability principle defines the permanent rule that the life layer scales
to support many lives per user, many races, many classes, many traits, many
titles, and many reputations.

#### Scope

This principle applies to all life tables that grow large over time: traits,
titles, reputations, attributes, statistics, statuses.

#### Boundaries

The life layer is designed for scalability from the start. Indexes are justified
by evidence. Queries are bounded. No query loads an unbounded result set. Storage
is bounded per life.

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
| Each life has a storage limit | No unbounded lives. |
| All foreign keys are indexed | No unindexed foreign keys. |
| No query loads an entire table into memory | Use pagination or filtering. |
| Indexes are justified by evidence | No speculative indexes. |

---

### 2.9 Maintainability

#### Purpose

The maintainability principle defines the permanent rule that the life layer is
maintainable — readable, documented, and testable.

#### Scope

This principle applies to all life tables, all life constraints, all life RLS
policies, and all life documentation.

#### Boundaries

The life layer is documented in the ERD, the blueprint, and Schema.md. Every
table, every constraint, and every RLS policy is documented. Every life table
is tested.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Every life table, constraint, and RLS policy is documented. |
| Tested | Every life table is tested. |
| Readable | The life layer is readable and maintainable. |
| Traceable | Every life table is traceable to the blueprint and ERD. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life table is documented | ERD, blueprint, Schema.md. |
| Every life constraint is documented | In the blueprint and Schema.md. |
| Every life RLS policy is documented | In the blueprint and Schema.md. |
| Every life table is tested | Against all dependent layers. |
| The life layer is readable and maintainable | No unnecessary complexity. |

---

### 2.10 Extensibility

#### Purpose

The extensibility principle defines the permanent rule that the life layer is
extensible — new tables, new columns, and new relationships can be added without
breaking existing data.

#### Scope

This principle applies to all future expansions of the life layer.

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
| Expansion does not create circular dependencies | The Life Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and Schema.md. |
| Expansion is tested against dependent layers | No breaking changes. |
| The data model is never optimized for the current sprint at the expense of the next phase | (Database Rules §10). |

---

### 2.11 Snapshot Isolation

#### Purpose

The snapshot isolation principle defines the permanent rule that life data is not
serialized into engine snapshots. The Save Engine references life identifiers; it
does not serialize life tables.

#### Scope

This principle applies to the boundary between the Life Layer and the Save
Engine's snapshot system.

#### Boundaries

Life data is not in engine snapshots (except the life identifier if the engine
references it). The Save Engine references life identifiers; it does not query
life tables during save/load. The Life Layer is unaware of the Save Engine.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Life Serialization | Life tables are not serialized into snapshots. |
| Identifier Reference Only | The Save Engine references life identifiers, not life data. |
| No Save Engine Dependency | The Life Layer is unaware of the Save Engine. |
| Zero Snapshot Overhead | Life data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life tables are not in snapshots | Except the life identifier if referenced. |
| The Save Engine references life identifiers | No life data in snapshots. |
| The Save Engine does not query life tables during save/load | No database queries. |
| The Life Layer is unaware of the Save Engine | No upward dependency. |
| Life data does not increase snapshot size | Zero overhead. |

---

### 2.12 Dependency Discipline

#### Purpose

The dependency discipline principle defines the permanent rule that the Life
Layer depends only on the Foundation Layer and the World Layer and does not
create circular dependencies.

#### Scope

This principle applies to all dependencies — intra-layer (between life tables)
and cross-layer (between the Life Layer and other schema layers).

#### Boundaries

The Life Layer is Layer 3. It depends on the Foundation Layer (Layer 1) and the
World Layer (Layer 2). It does not depend on any layer above it. No circular
dependencies. The schema dependency graph remains a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 3 | The Life Layer is Layer 3. |
| Foundation Dependency | The Life Layer depends on the Foundation Layer. |
| World Dependency | The Life Layer depends on the World Layer. |
| No Upward Dependencies | The Life Layer does not depend on any layer above it. |
| No Circular Dependencies | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer is Layer 3 | Per the Database Architecture Blueprint v1.0 §5. |
| The Life Layer depends on the Foundation Layer | Via `user_id` references. |
| The Life Layer depends on the World Layer | Via `world_id` references. |
| The Life Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The Life Layer follows the Engine Dependency Graph | Topological build order. |
| No engine imports a database client | (Engine Dependency Graph). |

---

## 3. Purpose

### Overview

This chapter defines the purpose of the Life Blueprint. It defines what is in
scope, what is out of scope, and the boundaries that govern the life layer. It
also defines the life structure diagram — the visual hierarchy of the life
layer's tables.

This chapter has 8 sections.

---

### 3.1 In-Scope Domains

#### Purpose

The in-scope domains section defines the table domains that the Life Blueprint
governs.

#### Scope

The in-scope domains are the 16 table domains within the life layer.

#### Boundaries

The in-scope domains are permanent. They define what the Life Blueprint covers.
No in-scope domain is removed after locking.

#### In-Scope Domains

| Domain | Description |
|--------|-------------|
| lives | The top-level life entity. A life is the persistent identity of a character within a world. It references the user who owns it and the world it exists in. |
| races | Racial classifications for a life. A race defines the biological heritage and innate traits of a character. |
| species | Species classifications for a life. A species defines the biological category above race. |
| classes | Primary character classes. A class defines the character's primary occupation, skill set, and progression path. |
| subclasses | Specializations within a class. A subclass refines the class with specific abilities and modifiers. |
| attributes | Core attributes for a life. Attributes are the fundamental characteristics that define a character's capabilities (e.g., strength, agility, intellect). |
| statistics | Derived statistics for a life. Statistics are calculated from attributes and other factors (e.g., health, stamina, mana). |
| traits | Character traits for a life. Traits are distinctive features that modify behavior or capabilities (e.g., brave, cautious, ambitious). |
| titles | Earned or bestowed titles for a life. Titles are formal designations that reflect achievements or social standing. |
| reputations | Reputation values for a life. Reputations track a character's standing with factions, regions, or organizations. |
| alignments | Alignment values for a life. Alignments define a character's moral and ethical orientation. |
| bloodlines | Bloodline records for a life. Bloodlines trace hereditary lines and inherited traits. |
| heritages | Heritage records for a life. Heritages define cultural and ancestral background. |
| statuses | Status effects for a life. Statuses are temporary or permanent conditions that affect a character (e.g., healthy, injured, cursed). |
| ages | Age records for a life. Age tracks the chronological age of a character. |
| lifespans | Lifespan records for a life. Lifespans define the expected and maximum duration of a character's life. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Blueprint covers 16 table domains | No missing domains. |
| No in-scope domain is removed after locking | The scope is permanent. |
| Every in-scope domain is documented in the ERD, blueprint, and Schema.md | No undocumented domains. |
| Every in-scope domain follows the Naming Rules v1.0 | `snake_case`, singular table names. |

---

### 3.2 Out-of-Scope Domains

#### Purpose

The out-of-scope domains section defines the table domains that the Life
Blueprint does not govern. These domains are covered by their respective
blueprints.

#### Scope

The out-of-scope domains are the gameplay and system domains that are not part of
the life layer.

#### Boundaries

The out-of-scope domains are permanent. They define what the Life Blueprint does
not cover. No out-of-scope domain is moved into the Life Blueprint without a new
blueprint or an exception.

#### Out-of-Scope Domains

| Domain | Covered By |
|--------|------------|
| inventory | Inventory Engine Blueprint |
| dialogue | Dialogue Engine Blueprint |
| quest | Quest Engine Blueprint |
| combat | Combat Engine (future blueprint) |
| activity | Activity Engine Blueprint |
| energy | Energy Engine Blueprint |
| save | Save Engine Blueprint |
| npc_ai | NPC AI Engine Blueprint |
| economy | Economy Engine Blueprint |
| world | World Blueprint |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Blueprint does not cover gameplay systems | Those are covered by their respective blueprints. |
| The Life Blueprint does not cover world geography | That is covered by the World Blueprint. |
| The Life Blueprint does not cover save data | That is covered by the Save Engine. |
| No out-of-scope domain is moved into the Life Blueprint without a new blueprint or an exception | No scope creep. |
| The out-of-scope list is permanent | It does not change after locking. |

---

### 3.3 Ownership Boundaries

#### Purpose

The ownership boundaries section defines who owns life data and how RLS scopes
access.

#### Scope

The ownership boundaries apply to all life tables and all RLS policies in the
life layer.

#### Boundaries

Life data is owned by the user who created the life. RLS scopes every query to
the authenticated user. The service role key bypasses RLS for server-side
operations (edge functions only). No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Owned | Life data is owned by the user who created the life. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is owned by the user who created the life | `user_id` references the Foundation Layer. |
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |

---

### 3.4 Synchronization Boundaries

#### Purpose

The synchronization boundaries section defines how life data is synced and what
sync does not cover.

#### Scope

The synchronization boundaries apply to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Life Layer does not manage
sync. Sync does not corrupt data. The game continues in a degraded state when the
server is unreachable.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Life sync is server-authoritative. |
| Non-Blocking | Sync does not block gameplay. |
| No Corruption | Sync does not corrupt data. |
| Degraded State | The game continues when the server is unreachable. |
| No Client-Side Authority | No client-side conflict resolution. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life sync is server-authoritative | No client-side authority. |
| Life sync is non-blocking | No blocking gameplay. |
| Life sync does not corrupt data | Atomic operations. |
| The Life Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |

---

### 3.5 Replay Boundaries

#### Purpose

The replay boundaries section defines how life data relates to replays. Life data
does not introduce non-determinism into replays.

#### Scope

The replay boundaries apply to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots (except the life identifier if the engine
references it). Replays do not query life tables. The Life Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| Cross-Platform Replay | Life identifiers are platform-independent. |
| No Non-Determinism | Life data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| Life identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from life data | Same state, same result. |

---

### 3.6 Dependency Boundaries

#### Purpose

The dependency boundaries section defines what the Life Layer depends on and what
depends on it.

#### Scope

The dependency boundaries apply to all cross-layer dependencies involving the
Life Layer.

#### Boundaries

The Life Layer is Layer 3. It depends on the Foundation Layer (Layer 1) and the
World Layer (Layer 2). Layers 4–10 may depend on the Life Layer. The Life Layer
does not depend on any layer above it. No circular dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 3 | The Life Layer is Layer 3. |
| Foundation Dependency | The Life Layer depends on the Foundation Layer. |
| World Dependency | The Life Layer depends on the World Layer. |
| No Upward Dependencies | The Life Layer does not depend on any layer above it. |
| No Circular Dependencies | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer is Layer 3 | Per the Database Architecture Blueprint v1.0 §5. |
| The Life Layer depends on the Foundation Layer | Via `user_id` references. |
| The Life Layer depends on the World Layer | Via `world_id` references. |
| The Life Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The Life Layer follows the Engine Dependency Graph | Topological build order. |

---

### 3.7 Validation Boundaries

#### Purpose

The validation boundaries section defines how life data is validated and what
validation does not cover.

#### Scope

The validation boundaries apply to all constraints, RLS policies, and validation
checks in the life layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
Life Layer enforces validation — it does not define the validation framework. No
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
| The Life Layer enforces validation | It does not define the framework. |

---

### 3.8 Life Structure Diagram

#### Purpose

The life structure diagram defines the visual hierarchy of the life layer's
tables. It shows how life entities nest and relate.

#### Scope

The life structure diagram applies to all 16 life tables and their relationships.

#### Boundaries

The diagram is a specification, not an implementation. It defines the hierarchy
and relationships. It does not define the schema or the queries.

#### Life Hierarchy

```
life
├── races
├── species
├── classes
│   └── subclasses
├── attributes
│   └── statistics
├── traits
├── titles
├── reputations
├── alignments
├── bloodlines
├── heritages
├── statuses
├── ages
└── lifespans
```

#### Life Hierarchy Description

| Level | Entity | Parent | Description |
|------|--------|--------|-------------|
| 1 | life | — | The top-level life entity. References the user (Foundation Layer) and the world (World Layer). |
| 2 | races | life | Racial classifications for a life. |
| 2 | species | life | Species classifications for a life. |
| 2 | classes | life | Primary character classes. |
| 3 | subclasses | class | Specializations within a class. |
| 2 | attributes | life | Core attributes for a life. |
| 3 | statistics | attribute | Derived statistics calculated from attributes. |
| 2 | traits | life | Character traits for a life. |
| 2 | titles | life | Earned or bestowed titles for a life. |
| 2 | reputations | life | Reputation values for a life. |
| 2 | alignments | life | Alignment values for a life. |
| 2 | bloodlines | life | Bloodline records for a life. |
| 2 | heritages | life | Heritage records for a life. |
| 2 | statuses | life | Status effects for a life. |
| 2 | ages | life | Age records for a life. |
| 2 | lifespans | life | Lifespan records for a life. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The life hierarchy is a tree | No circular parent-child relationships. |
| Life is the root | Every life entity descends from a life. |
| Life references the Foundation Layer | Via `user_id`. |
| Life references the World Layer | Via `world_id`. |
| The diagram is a specification | Not an implementation. |
| The diagram is documented | In the ERD, the blueprint, and Schema.md. |

---

## 4. Responsibilities

### Overview

This chapter defines the permanent responsibilities of the Life Layer. It defines
what the Life Layer is responsible for, what it is not responsible for, and the
guarantees it provides to every dependent system. No responsibility may be removed
after locking.

This chapter has 12 sections. Every section includes purpose, scope, boundaries,
guarantees, and permanent rules.

---

### 4.1 Primary Responsibilities

#### Purpose

The primary responsibilities section defines the core duties of the Life Layer —
the things it must do for a character's life to function.

#### Scope

The primary responsibilities apply to all 16 life tables and all life
operations.

#### Boundaries

The Life Layer is responsible for modeling a character's life identity, biology,
capabilities, social standing, and life state. It is not responsible for gameplay
systems, save data, or engine state.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Complete Life Model | The Life Layer provides a complete model of a character's life identity, biology, capabilities, social standing, and life state. |
| Deterministic Identifiers | All life identifiers are deterministic. Assigned at creation, never changed. |
| Referential Integrity | All foreign keys are enforced. No orphan rows. |
| Ownership Scoping | All life data is scoped to the correct owner via RLS. |
| Replay Compatibility | Life data does not introduce non-determinism into replays. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer models 16 table domains | lives, races, species, classes, subclasses, attributes, statistics, traits, titles, reputations, alignments, bloodlines, heritages, statuses, ages, lifespans. |
| All life identifiers are deterministic | Never change after creation. |
| All foreign keys are enforced | No orphan rows. |
| All life data is scoped via RLS | No cross-user access from the client. |
| Life data does not introduce non-determinism into replays | Same state, same result. |
| No primary responsibility is removed after locking | Permanent. |

---

### 4.2 Secondary Responsibilities

#### Purpose

The secondary responsibilities section defines the supporting duties of the
Life Layer — things that enable the primary responsibilities.

#### Scope

The secondary responsibilities apply to all life tables, life documentation,
and life testing.

#### Boundaries

The Life Layer is responsible for documenting its tables, testing its tables, and
providing indexes for efficient queries. It is not responsible for the testing
framework, the documentation framework, or the indexing engine.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Documented | Every life table, constraint, and RLS policy is documented. |
| Tested | Every life table is tested against all dependent layers. |
| Indexed | All foreign key columns are indexed. |
| Bounded Queries | Queries return bounded result sets. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life table is documented | ERD, blueprint, Schema.md. |
| Every life table is tested | Against all dependent layers. |
| All foreign keys are indexed | No unindexed foreign keys. |
| Queries return bounded result sets | Pagination is used. |
| The Life Layer does not define the testing framework | It uses the Testing Architecture. |
| The Life Layer does not define the documentation framework | It uses the project's documentation standards. |

---

### 4.3 Ownership Responsibilities

#### Purpose

The ownership responsibilities section defines how the Life Layer manages data
ownership and access control.

#### Scope

The ownership responsibilities apply to all RLS policies, all access paths, and
all trust boundaries in the life layer.

#### Boundaries

RLS is enabled on every life table. Four policies per table. The service role
key is server-side only. No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every life table. |
| Four Policies Per Table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. Never FOR ALL. |
| The service role key is server-side only | Never in client code. |
| No cross-user access from the client | RLS prevents it. |
| Life data is scoped to the correct owner | No unauthorized access. |
| No ownership responsibility is removed after locking | Permanent. |

---

### 4.4 Validation Responsibilities

#### Purpose

The validation responsibilities section defines how the Life Layer validates
data integrity.

#### Scope

The validation responsibilities apply to all constraints, RLS policies, and
validation checks in the life layer.

#### Boundaries

Validation is database-enforced, deterministic, and does not destroy data. The
Life Layer enforces validation — it does not define the validation framework.

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
| The Life Layer enforces validation | It does not define the framework. |
| No validation responsibility is removed after locking | Permanent. |

---

### 4.5 Migration Responsibilities

#### Purpose

The migration responsibilities section defines how the Life Layer manages
schema migrations.

#### Scope

The migration responsibilities apply to all life migrations — any additive
change to the life schema.

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

The synchronization responsibilities section defines how the Life Layer
participates in data synchronization.

#### Scope

The synchronization responsibilities apply to all life data that is synced:
life metadata, race selection, class selection, attribute changes, status
changes, title changes, reputation changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Life Layer does not manage
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
| The Life Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |
| No synchronization responsibility is removed after locking | Permanent. |

---

### 4.7 Replay Responsibilities

#### Purpose

The replay responsibilities section defines how the Life Layer relates to the
Replay System.

#### Scope

The replay responsibilities apply to all life data that could affect replays:
life identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots (except the life identifier if the engine
references it). Replays do not query life tables. The Life Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| Cross-Platform Replay | Life identifiers are platform-independent. |
| No Non-Determinism | Life data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| Life identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from life data | Same state, same result. |
| No replay responsibility is removed after locking | Permanent. |

---

### 4.8 Auditing Responsibilities

#### Purpose

The auditing responsibilities section defines how the Life Layer supports
auditing of life data changes.

#### Scope

The auditing responsibilities apply to all life tables that are modified after
creation: life metadata, race changes, class changes, attribute changes, status
changes, title changes, reputation changes.

#### Boundaries

The Life Layer supports auditing by providing timestamps, owner references, and
change tracking. It does not define the audit framework — the Foundation Layer
does (via audit_logs). The Life Layer contributes to audit logs but does not
manage them.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Timestamped | Every life row has created_at and updated_at timestamps. |
| Owned | Every life row has a user_id reference to the Foundation Layer. |
| Change-Trackable | Life data changes are trackable through timestamps and audit logs. |
| No Audit Framework | The Life Layer does not define the audit framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life row has created_at and updated_at | No exceptions. |
| Every life row has a user_id reference | To the Foundation Layer. |
| Life data changes are trackable | Through timestamps and audit logs. |
| The Life Layer does not manage audit logs | The Foundation Layer does. |
| The Life Layer contributes to audit logs | But does not own them. |
| No auditing responsibility is removed after locking | Permanent. |

---

### 4.9 Security Responsibilities

#### Purpose

The security responsibilities section defines how the Life Layer protects life
data from unauthorized access.

#### Scope

The security responsibilities apply to all RLS policies, all access paths, and
all trust boundaries in the life layer.

#### Boundaries

RLS is the primary security boundary. The service role key bypasses RLS for
server-side operations (edge functions only). No client-side authority. No
cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enforced | RLS is enforced on every life table. |
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

The monitoring responsibilities section defines how the Life Layer supports
monitoring of life data health.

#### Scope

The monitoring responsibilities apply to all life tables and all life
operations.

#### Boundaries

The Life Layer supports monitoring by providing timestamps, row counts, and
query performance characteristics. It does not define the monitoring framework.
Monitoring is non-blocking and does not affect gameplay.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Observable | Life data is observable through timestamps and row counts. |
| Non-Blocking | Monitoring does not block gameplay. |
| No Monitoring Framework | The Life Layer does not define the monitoring framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is observable | Timestamps, row counts. |
| Monitoring is non-blocking | No blocking gameplay. |
| The Life Layer does not define the monitoring framework | It uses the project's monitoring standards. |
| No monitoring responsibility is removed after locking | Permanent. |

---

### 4.11 Expansion Responsibilities

#### Purpose

The expansion responsibilities section defines how the Life Layer supports
future expansion.

#### Scope

The expansion responsibilities apply to all future tables, columns,
relationships, and systems added to the Life Layer.

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
| Expansion does not create circular dependencies | The Life Layer remains a DAG. |
| Expansion is documented before implementation | In the ERD, the blueprint, and Schema.md. |
| Expansion is tested against dependent layers | No breaking changes. |
| No expansion responsibility is removed after locking | Permanent. |

---

### 4.12 Permanent Non-Responsibilities

#### Purpose

The permanent non-responsibilities section defines what the Life Layer is
permanently NOT responsible for. These responsibilities belong to other layers
or engines.

#### Scope

The permanent non-responsibilities apply to the boundary between the Life Layer
and all other layers and engines.

#### Boundaries

The non-responsibilities are permanent. No non-responsibility is moved into the
Life Layer without a new blueprint or an exception.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Gameplay Systems | The Life Layer does not manage inventory, dialogue, quests, combat, activities, NPC AI, or economy. |
| No Save Data | The Life Layer does not manage save snapshots or save documents. |
| No Engine State | The Life Layer does not manage engine state (time, energy, etc.). |
| No Auth | The Life Layer does not manage authentication or authorization. |
| No World Geography | The Life Layer does not manage world geography, continents, regions, or locations. |
| No Sync Management | The Life Layer does not manage synchronization. |
| No Replay Management | The Life Layer does not manage replays. |
| No Event Bus Management | The Life Layer does not manage the Event Bus. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer does not manage gameplay systems | Those are covered by their respective engines. |
| The Life Layer does not manage save data | That is covered by the Save Engine. |
| The Life Layer does not manage engine state | That is covered by the respective engines. |
| The Life Layer does not manage auth | That is covered by the Foundation Layer. |
| The Life Layer does not manage world geography | That is covered by the World Layer. |
| The Life Layer does not manage sync | That is covered by the Synchronization Architecture. |
| The Life Layer does not manage replays | That is covered by the Replay System. |
| The Life Layer does not manage the Event Bus | It publishes and subscribes. |
| No non-responsibility is moved into the Life Layer without a new blueprint or an exception | No scope creep. |
| The non-responsibilities are permanent | They do not change after locking. |

---

## 5. Schema Architecture

### Overview

This chapter defines the schema architecture for the Life Layer. It defines the
philosophy, layer hierarchy, entity hierarchy, relationship hierarchy, ownership
hierarchy, aggregation rules, composition rules, inheritance rules, normalization
strategy, denormalization strategy, indexing strategy, partition strategy,
synchronization strategy, replay strategy, and compatibility strategy.

This chapter has 15 sections. Every section includes purpose, scope, boundaries,
guarantees, and permanent rules.

---

### 5.1 Schema Philosophy

#### Purpose

The schema philosophy defines the permanent principles that govern the Life
Layer's schema design.

#### Scope

The schema philosophy applies to all 16 life tables and all life relationships.

#### Boundaries

The Life Layer follows the Database Architecture Blueprint v1.0 (LOCKED). It is
Layer 3 of the 10-layer schema hierarchy. It depends on the Foundation Layer
(Layer 1) and the World Layer (Layer 2). It does not depend on any layer above
it.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layered | The Life Layer follows the layered architecture. |
| Event-Sourced | The Life Layer follows the event-sourced architecture. |
| Interface-Driven | The Life Layer follows the interface-driven architecture. |
| Layer 3 | The Life Layer is Layer 3 of the 10-layer schema hierarchy. |
| Foundation Dependency | The Life Layer depends on the Foundation Layer. |
| World Dependency | The Life Layer depends on the World Layer. |
| No Upward Dependencies | The Life Layer does not depend on any layer above it. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer follows the Database Architecture Blueprint v1.0 | No exceptions. |
| The Life Layer is Layer 3 | Per the Database Architecture Blueprint v1.0 §5. |
| The Life Layer depends on the Foundation Layer | Via `user_id` references. |
| The Life Layer depends on the World Layer | Via `world_id` references. |
| The Life Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The schema philosophy is permanent | It does not change after locking. |

---

### 5.2 Layer Hierarchy

#### Purpose

The layer hierarchy defines the Life Layer's position in the 10-layer schema
hierarchy.

#### Scope

The layer hierarchy applies to the Life Layer's position relative to all other
schema layers.

#### Boundaries

The Life Layer is Layer 3. It depends on Layer 1 (Foundation) and Layer 2
(World). Layers 4–10 may depend on it. No upward dependencies. No circular
dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Layer 3 | The Life Layer is Layer 3 of the 10-layer schema hierarchy. |
| Depends on Layer 1 | The Life Layer depends on the Foundation Layer. |
| Depends on Layer 2 | The Life Layer depends on the World Layer. |
| Depended Upon by Layers 4–10 | Higher layers may depend on the Life Layer. |
| No Upward Dependencies | The Life Layer does not depend on any layer above it. |
| DAG Structure | The schema dependency graph remains a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer is Layer 3 | Per the Database Architecture Blueprint v1.0 §5. |
| The Life Layer depends on the Foundation Layer | Via `user_id` references. |
| The Life Layer depends on the World Layer | Via `world_id` references. |
| The Life Layer does not depend on any layer above it | No upward references. |
| No circular dependencies | The schema dependency graph remains a DAG. |
| The layer hierarchy is permanent | It does not change after locking. |

---

### 5.3 Entity Hierarchy

#### Purpose

The entity hierarchy defines the nesting of life entities — how a life contains
races, species, classes, subclasses, attributes, statistics, traits, titles,
reputations, alignments, bloodlines, heritages, statuses, ages, and lifespans.

#### Scope

The entity hierarchy applies to all 16 life tables and their parent-child
relationships.

#### Boundaries

The entity hierarchy is a tree. The life is the root. Every life entity descends
from a life. No circular parent-child relationships. Attributes and subclasses
are nested under their parent entities.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Tree Structure | The entity hierarchy is a tree. No cycles. |
| Life Root | The life is the root of the hierarchy. |
| No Circular Parents | No circular parent-child relationships. |
| Nested Specialization | Subclasses nest under classes. Statistics nest under attributes. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The life is the root | Every life entity descends from a life. |
| The entity hierarchy is a tree | No cycles. |
| No circular parent-child relationships | No exceptions. |
| Subclasses belong to exactly one class | No shared subclasses. |
| Statistics belong to exactly one attribute | No shared statistics. |
| The entity hierarchy is permanent | It does not change after locking. |

---

### 5.4 Relationship Hierarchy

#### Purpose

The relationship hierarchy defines the types of relationships between life
entities and their rules.

#### Scope

The relationship hierarchy applies to all relationships between life tables.

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

The ownership hierarchy defines how life data is owned and scoped.

#### Scope

The ownership hierarchy applies to all life tables and all RLS policies.

#### Boundaries

Life data is owned by the user who created the life. RLS scopes every query.
No cross-user access from the client. The service role key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User-Owned | Life data is owned by the user who created the life. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is owned by the user who created the life | `user_id` references the Foundation Layer. |
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |
| The ownership hierarchy is permanent | It does not change after locking. |

---

### 5.6 Aggregation Rules

#### Purpose

The aggregation rules define how life entities aggregate — how a life aggregates
races, classes, attributes, traits, titles, reputations, alignments,
bloodlines, heritages, statuses, ages, and lifespans.

#### Scope

The aggregation rules apply to all parent-child relationships in the life layer.

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

The composition rules define how life entities compose — how races, species,
classes, subclasses, attributes, statistics, traits, titles, reputations,
alignments, bloodlines, heritages, statuses, ages, and lifespans compose into a
complete life model.

#### Scope

The composition rules apply to all life entities that compose into larger
structures.

#### Boundaries

Composition is additive. A life is composed of its race, species, class,
subclass, attributes, statistics, traits, titles, reputations, alignments,
bloodlines, heritages, statuses, age, and lifespan. No composition creates a
circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive Composition | A life is composed of its parts. |
| No Circular Composition | No composition creates a circular dependency. |
| Complete Life | The composition produces a complete life model. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Composition is additive | A life is composed of its parts. |
| No composition creates a circular dependency | No cycles. |
| The composition produces a complete life model | No gaps. |
| The composition rules are permanent | They do not change after locking. |

---

### 5.8 Inheritance Rules

#### Purpose

The inheritance rules define how life entities share common attributes — how all
life tables share id, user_id, created_at, updated_at.

#### Scope

The inheritance rules apply to all life tables that share common attributes.

#### Boundaries

The Life Layer does not use table inheritance (PostgreSQL INHERITS). Common
attributes are defined per table, following the Naming Rules and the Database
Architecture Blueprint. No table inherits from another table.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Common Attributes | All life tables share id, user_id, created_at, updated_at. |
| No Table Inheritance | No PostgreSQL INHERITS. |
| Consistent Naming | Common attributes use the same names across all tables. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All life tables share id, user_id, created_at, updated_at | No exceptions. |
| No PostgreSQL INHERITS | Common attributes are defined per table. |
| Common attributes use the same names | Consistent naming. |
| The inheritance rules are permanent | They do not change after locking. |

---

### 5.9 Normalization Strategy

#### Purpose

The normalization strategy defines how life tables are normalized to reduce
redundancy and improve integrity.

#### Scope

The normalization strategy applies to all 16 life tables.

#### Boundaries

Life tables are normalized to at least Third Normal Form (3NF). No data is
duplicated across tables unless explicitly documented as a denormalization. No
transitive dependencies.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| 3NF | Life tables are normalized to at least Third Normal Form. |
| No Redundancy | No data is duplicated across tables unless documented. |
| No Transitive Dependencies | No transitive dependencies. |
| Referential Integrity | Foreign keys are enforced. No orphan rows. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life tables are normalized to at least 3NF | No exceptions. |
| No data is duplicated across tables unless documented | Documented denormalization only. |
| No transitive dependencies | No exceptions. |
| Foreign keys are enforced | No orphan rows. |
| The normalization strategy is permanent | It does not change after locking. |

---

### 5.10 Denormalization Strategy

#### Purpose

The denormalization strategy defines when and how life tables are denormalized
for performance.

#### Scope

The denormalization strategy applies to any life table that is denormalized for
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

The indexing strategy defines how life tables are indexed for efficient queries.

#### Scope

The indexing strategy applies to all 16 life tables and all life queries.

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

The partition strategy defines how life tables are partitioned for scalability.

#### Scope

The partition strategy applies to life tables that grow large over time:
traits, titles, reputations, attributes, statistics, statuses.

#### Boundaries

Partitioning is by life (or by life and time for status history). Partitioning
is additive. No partitioning weakens integrity or compatibility.

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
| Large tables are partitioned by life | traits, titles, reputations, attributes, statistics, statuses. |
| Partitioning is additive | No destructive partitioning. |
| Partitioning does not weaken integrity | Data integrity wins. |
| Partitioning does not weaken compatibility | All 10 guarantees preserved. |
| Partitioning is documented | In the blueprint and Schema.md. |
| The partition strategy is permanent | It does not change after locking. |

---

### 5.13 Synchronization Strategy

#### Purpose

The synchronization strategy defines how life data is synced.

#### Scope

The synchronization strategy applies to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Life Layer does not manage
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
| The Life Layer does not manage sync | The Synchronization Architecture does. |
| The game continues in a degraded state | No crash on sync failure. |
| The synchronization strategy is permanent | It does not change after locking. |

---

### 5.14 Replay Strategy

#### Purpose

The replay strategy defines how life data relates to replays.

#### Scope

The replay strategy applies to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots (except the life identifier if the engine
references it). Replays do not query life tables. The Life Layer has zero replay
overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| Cross-Platform Replay | Life identifiers are platform-independent. |
| No Non-Determinism | Life data does not introduce non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| Life identifiers are platform-independent | Cross-platform replay works. |
| No non-determinism from life data | Same state, same result. |
| The replay strategy is permanent | It does not change after locking. |

---

### 5.15 Compatibility Strategy

#### Purpose

The compatibility strategy defines how the Life Layer preserves compatibility
with all dependent systems.

#### Scope

The compatibility strategy applies to all life tables, all life queries, all
life migrations, and all life sync operations.

#### Boundaries

All 10 compatibility guarantees are permanent. No life table, no life migration,
no life sync operation weakens a compatibility guarantee.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Save Engine Compatibility | Life data does not affect save snapshots. |
| Replay Compatibility | Life data does not introduce non-determinism. |
| Migration Compatibility | Life migrations are additive and forward-only. |
| Synchronization Compatibility | Life data is server-authoritative and non-blocking. |
| Event Bus Compatibility | Life data does not affect event ordering. |
| Snapshot Compatibility | Life data does not affect existing snapshot format. |
| Save Compatibility | Life data does not affect existing save format. |
| Ownership Compatibility | Life data does not weaken RLS. |
| Lock Policy Compatibility | Life data is documented and follows the lock policy. |
| Dependency Compatibility | Life data does not create circular dependencies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| All 10 compatibility guarantees are permanent | No weakening. |
| No life table weakens a compatibility guarantee | No exceptions. |
| No life migration weakens a compatibility guarantee | No exceptions. |
| No life sync operation weakens a compatibility guarantee | No exceptions. |
| Compatibility is tested | Every life table is tested against all dependent systems. |
| The compatibility strategy is permanent | It does not change after locking. |

---

## 6. Naming Convention

### Overview

This chapter defines the naming convention for the Life Layer. It defines the
naming rules for tables, columns, primary keys, foreign keys, indexes, constraints,
triggers, enums, views, and backups. All names follow the Naming Rules v1.0.

This chapter has 10 sections. Every section includes valid examples, invalid
examples, compatibility rules, and permanent restrictions.

---

### 6.1 Table Naming

#### Purpose

The table naming section defines how life tables are named.

#### Valid Examples

| Table Name | Description |
|------------|-------------|
| `lives` | Top-level life entity. |
| `races` | Racial classifications for a life. |
| `species` | Species classifications for a life. |
| `classes` | Primary character classes. |
| `subclasses` | Specializations within a class. |
| `attributes` | Core attributes for a life. |
| `statistics` | Derived statistics for a life. |
| `traits` | Character traits for a life. |
| `titles` | Earned or bestowed titles for a life. |
| `reputations` | Reputation values for a life. |
| `alignments` | Alignment values for a life. |
| `bloodlines` | Bloodline records for a life. |
| `heritages` | Heritage records for a life. |
| `statuses` | Status effects for a life. |
| `ages` | Age records for a life. |
| `lifespans` | Lifespan records for a life. |

#### Invalid Examples

| Table Name | Why Invalid |
|------------|-------------|
| `Lives` | Uses uppercase. Must be `snake_case`. |
| `life` | Singular. Must be plural. |
| `life-table` | Uses hyphen. Must be underscore. |
| `lifeTable` | Uses camelCase. Must be `snake_case`. |
| `lives_table` | Redundant suffix. |
| `tbl_lives` | Redundant prefix. |
| `LifeHistory` | Uses PascalCase. Must be `snake_case`. |

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

The column naming section defines how life columns are named.

#### Valid Examples

| Column Name | Description |
|-------------|-------------|
| `id` | Primary key. |
| `user_id` | Foreign key to the Foundation Layer. |
| `world_id` | Foreign key to the World Layer. |
| `life_id` | Foreign key to the lives table. |
| `race_id` | Foreign key to the races table. |
| `class_id` | Foreign key to the classes table. |
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
| `life-id` | Uses hyphen. Must be underscore. |
| `life_id_fk` | Redundant suffix. |
| `col_name` | Redundant prefix. |
| `LifeId` | Uses PascalCase. Must be `snake_case`. |

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
| `id` | Every life table uses `id` as its primary key column. |

#### Invalid Examples

| Primary Key | Why Invalid |
|-------------|-------------|
| `life_id` | Reserved for foreign key to lives. Primary key must be `id`. |
| `pk_id` | Redundant prefix. |
| `Id` | Uses uppercase. Must be `snake_case`. |
| `life_pk` | Redundant suffix. |

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
| Every life table uses `id` as its primary key | No exceptions. |
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
| `life_id` | Foreign key to the lives table. |
| `race_id` | Foreign key to the races table. |
| `class_id` | Foreign key to the classes table. |
| `parent_id` | Self-referencing foreign key (e.g., subclass to parent subclass). |

#### Invalid Examples

| Foreign Key | Why Invalid |
|-------------|-------------|
| `lifeId` | Uses camelCase. Must be `snake_case`. |
| `life-id` | Uses hyphen. Must be underscore. |
| `life_id_fk` | Redundant suffix. |
| `fk_life_id` | Redundant prefix. |
| `LifeId` | Uses PascalCase. Must be `snake_case`. |

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
| All foreign keys are named `<table_singular>_id` | e.g., `life_id`, `race_id`. |
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
| `idx_lives_user_id` | Index on lives.user_id. |
| `idx_races_life_id` | Index on races.life_id. |
| `idx_subclasses_class_id` | Index on subclasses.class_id. |
| `idx_statistics_attribute_id` | Index on statistics.attribute_id. |
| `idx_traits_life_id` | Index on traits.life_id. |

#### Invalid Examples

| Index Name | Why Invalid |
|-------------|-------------|
| `IdxLivesUserId` | Uses PascalCase. Must be `snake_case`. |
| `idx-lives-user-id` | Uses hyphens. Must be underscores. |
| `index_lives_user_id` | Wrong prefix. Must be `idx_`. |
| `lives_user_id_idx` | Wrong suffix position. Prefix must be `idx_`. |

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
| `pk_lives` | Primary key constraint on lives. |
| `fk_races_life_id` | Foreign key constraint on races.life_id. |
| `uq_lives_user_id_name` | Unique constraint on lives (user_id, name). |
| `ck_lives_name_not_empty` | Check constraint on lives.name. |
| `nn_lives_name` | Not-null constraint on lives.name. |

#### Invalid Examples

| Constraint Name | Why Invalid |
|------------------|-------------|
| `PkLives` | Uses PascalCase. Must be `snake_case`. |
| `pk-lives` | Uses hyphen. Must be underscore. |
| `constraint_pk_lives` | Redundant prefix. |
| `pk_lives_constraint` | Redundant suffix. |

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
| `trg_lives_updated_at` | Trigger to update lives.updated_at. |
| `trg_races_updated_at` | Trigger to update races.updated_at. |
| `trg_statuses_validate` | Trigger to validate statuses before insert. |

#### Invalid Examples

| Trigger Name | Why Invalid |
|------------------|-------------|
| `TrgLivesUpdatedAt` | Uses PascalCase. Must be `snake_case`. |
| `trg-lives-updated-at` | Uses hyphen. Must be underscore. |
| `trigger_lives_updated_at` | Wrong prefix. Must be `trg_`. |
| `lives_updated_at_trg` | Wrong suffix position. Prefix must be `trg_`. |

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
| `race_type` | Enum for race types. |
| `class_type` | Enum for class types. |
| `alignment_type` | Enum for alignment types. |
| `status_type` | Enum for status types. |
| `trait_type` | Enum for trait types. |
| `reputation_level` | Enum for reputation levels. |
| `title_rarity` | Enum for title rarity levels. |

#### Invalid Examples

| Enum Name | Why Invalid |
|------------|-------------|
| `RaceType` | Uses PascalCase. Must be `snake_case`. |
| `race-type` | Uses hyphen. Must be underscore. |
| `enum_race_type` | Redundant prefix. |
| `race_type_enum` | Redundant suffix. |

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
| `life_summary` | View summarizing life data. |
| `race_detail` | View joining races with lives. |
| `class_with_subclasses` | View joining classes with subclasses. |
| `attribute_with_statistics` | View joining attributes with statistics. |

#### Invalid Examples

| View Name | Why Invalid |
|-----------|-------------|
| `LifeSummary` | Uses PascalCase. Must be `snake_case`. |
| `life-summary` | Uses hyphen. Must be underscore. |
| `view_life_summary` | Redundant prefix. |
| `life_summary_view` | Redundant suffix. |

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

The backup naming section defines how life data backups are named.

#### Valid Examples

| Backup Name | Description |
|-------------|-------------|
| `backup_lives_20260804` | Backup of lives table on 2026-08-04. |
| `backup_statuses_20260804` | Backup of statuses table on 2026-08-04. |
| `backup_life_full_20260804` | Full backup of life schema on 2026-08-04. |

#### Invalid Examples

| Backup Name | Why Invalid |
|-------------|-------------|
| `BackupLives20260804` | Uses PascalCase. Must be `snake_case`. |
| `backup-lives-20260804` | Uses hyphen. Must be underscore. |
| `bkp_lives_20260804` | Wrong prefix. Must be `backup_`. |
| `lives_20260804_backup` | Wrong suffix position. Prefix must be `backup_`. |

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
| All backups are named `backup_<table>_<date>` or `backup_life_full_<date>` | `snake_case`. |
| All backup names are `snake_case` | No uppercase, no hyphens. |
| No backup is renamed after creation | Forward-only migrations. |
| All backups are documented | In the Migration Log. |
| Backups do not destroy data | Previous valid state always retained. |

---

## Sprint 1.2.4.1 Review

### Sprint Summary

**Sprint:** 1.2.4.1 — Life Blueprint v1.0 (Chapters 1–3)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 1 | Identity | 14 sections: blueprint identity, blueprint scope, blueprint objectives, version information, ownership information, dependency information, compatibility requirements, synchronization requirements, validation requirements, replay requirements, migration requirements, lock policy, related documents, future expansion compatibility. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 2 | Philosophy | 12 principles: deterministic execution, ownership consistency, event-driven architecture, replay compatibility, migration safety, synchronization consistency, data integrity, scalability, maintainability, extensibility, snapshot isolation, dependency discipline. Each with purpose, scope, boundaries, guarantees, permanent rules. |
| 3 | Purpose | 8 sections: in-scope domains (16 table domains), out-of-scope domains (10 gameplay/system/world domains), ownership boundaries, synchronization boundaries, replay boundaries, dependency boundaries, validation boundaries, life structure diagram. |

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

- The Life Blueprint is IN PROGRESS. Chapters 4–16 are pending.
- Next sprint: 1.2.4.2 — Chapter 4 (Responsibilities), Chapter 5 (Schema Architecture), Chapter 6 (Naming Convention).

---

## Sprint 1.2.4.2 Review

### Sprint Summary

**Sprint:** 1.2.4.2 — Life Blueprint v1.0 (Chapters 4–6)
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

- The Life Blueprint is IN PROGRESS. Chapters 7–16 are pending.
- Next sprint: 1.2.4.3 — Chapter 7 (Relationships), Chapter 8 (Security), Chapter 9 (Validation).

---

## 7. Relationships

### Overview

This chapter defines every relationship between the 16 life entities. It defines
the relationship philosophy, each entity's relationships, and the ownership,
dependency, cascade, and future expansion rules that govern all relationships.

This chapter has 20 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, valid examples, and invalid examples.

---

### 7.1 Relationship Philosophy

#### Purpose

The relationship philosophy defines the permanent principles that govern all
relationships between life entities.

#### Scope

The relationship philosophy applies to all 16 life tables and all relationships
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
| `races.life_id` references `lives.id` | A race belongs to one life. |
| `subclasses.class_id` references `classes.id` | A subclass belongs to one class. |
| `statistics.attribute_id` references `attributes.id` | A statistic belongs to one attribute. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `lives.race_id` references `races.id` | A life does not belong to a race. Reversed dependency. |
| `attributes.subclass_id` references `subclasses.id` (skipping class) | An attribute belongs to a life, not a subclass. Skips hierarchy. |
| `lives.id` references `races.life_id` | Circular reference. |

---

### 7.2 Life Relationships

#### Purpose

The life relationships section defines the relationships between the `lives` table
and all other life tables.

#### Scope

The life relationships apply to the `lives` table and its direct children:
races, species, classes, subclasses, attributes, statistics, traits, titles,
reputations, alignments, bloodlines, heritages, statuses, ages, lifespans.

#### Boundaries

The life is the root. It has no parent. It has many children. No life references
another life as a parent (no self-reference for hierarchy). No life references a
race, class, or attribute directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Root Entity | The life has no parent. |
| Many Children | A life has many races, classes, attributes, traits, titles, reputations, alignments, bloodlines, heritages, statuses, ages, and lifespans. |
| No Self-Reference | No life references another life as a parent. |
| No Downward Skip | A life does not directly reference subclasses, statistics, or specific traits. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The life is the root | No parent. |
| A life has many races | One-to-many. |
| A life has many classes | One-to-many. |
| A life has many attributes | One-to-many. |
| A life has many traits | One-to-many. |
| A life has many titles | One-to-many. |
| A life has many reputations | One-to-many. |
| A life has many alignments | One-to-many. |
| A life has many bloodlines | One-to-many. |
| A life has many heritages | One-to-many. |
| A life has many statuses | One-to-many. |
| A life has many ages | One-to-many. |
| A life has many lifespans | One-to-many. |
| No life references another life as a parent | No self-referencing hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `races.life_id` → `lives.id` | A race belongs to a life. |
| `classes.life_id` → `lives.id` | A class belongs to a life. |
| `attributes.life_id` → `lives.id` | An attribute belongs to a life. |
| `statuses.life_id` → `lives.id` | A status belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `lives.parent_life_id` → `lives.id` | No self-referencing hierarchy. |
| `lives.race_id` → `races.id` | A life does not reference a race. Reversed. |
| `subclasses.life_id` → `lives.id` | A subclass references its class, not the life directly. Skips hierarchy. |

---

### 7.3 Race Relationships

#### Purpose

The race relationships section defines the relationships between the `races` table
and all other life tables.

#### Scope

The race relationships apply to the `races` table, its parent (lives), and its
children (species, bloodlines, heritages).

#### Boundaries

A race belongs to exactly one life. A race has many species. A race may have
bloodlines and heritages. No race references a class, subclass, attribute,
statistic, trait, title, reputation, alignment, status, age, or lifespan directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A race belongs to exactly one life. |
| Many Species | A race has many species. |
| Optional Bloodlines | A race may have bloodlines. |
| Optional Heritages | A race may have heritages. |
| No Downward Skip | A race does not reference classes, attributes, traits, titles, or statuses directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `races.life_id` → `lives.id` | Many-to-one. |
| `species.race_id` → `races.id` | One-to-many. |
| `bloodlines.race_id` → `races.id` | One-to-many (optional). |
| `heritages.race_id` → `races.id` | One-to-many (optional). |
| No race references a class or below | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `races.life_id` → `lives.id` | A race belongs to a life. |
| `species.race_id` → `races.id` | A species belongs to a race. |
| `bloodlines.race_id` → `races.id` | A bloodline belongs to a race. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `races.class_id` → `classes.id` | A race does not reference a class. Wrong domain. |
| `classes.race_id` → `races.id` | A class references a life, not a race. Skips hierarchy. |
| `races.parent_race_id` → `races.id` | No self-referencing race hierarchy. |

---

### 7.4 Species Relationships

#### Purpose

The species relationships section defines the relationships between the `species`
table and all other life tables.

#### Scope

The species relationships apply to the `species` table, its parent (races), and
its optional children (bloodlines, heritages).

#### Boundaries

A species belongs to exactly one race. A species may have bloodlines and
heritages. No species references a class, subclass, attribute, statistic, trait,
title, reputation, alignment, status, age, or lifespan directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A species belongs to exactly one race. |
| Optional Bloodlines | A species may have bloodlines. |
| Optional Heritages | A species may have heritages. |
| No Downward Skip | A species does not reference classes, attributes, traits, or statuses directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `species.race_id` → `races.id` | Many-to-one. |
| `bloodlines.species_id` → `species.id` | One-to-many (optional). |
| `heritages.species_id` → `species.id` | One-to-many (optional). |
| No species references a class or below | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `species.race_id` → `races.id` | A species belongs to a race. |
| `bloodlines.species_id` → `species.id` | A bloodline belongs to a species. |
| `heritages.species_id` → `species.id` | A heritage belongs to a species. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `species.class_id` → `classes.id` | A species does not reference a class. Wrong domain. |
| `attributes.species_id` → `species.id` | An attribute references a life, not a species. Wrong granularity. |
| `species.parent_species_id` → `species.id` | No self-referencing species hierarchy. |

---

### 7.5 Class Relationships

#### Purpose

The class relationships section defines the relationships between the `classes`
table and all other life tables.

#### Scope

The class relationships apply to the `classes` table, its parent (lives), and its
children (subclasses).

#### Boundaries

A class belongs to exactly one life. A class has many subclasses. No class
references a race, species, attribute, statistic, trait, title, reputation,
alignment, bloodline, heritage, status, age, or lifespan directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A class belongs to exactly one life. |
| Many Subclasses | A class has many subclasses. |
| No Downward Skip | A class does not reference races, attributes, traits, or statuses directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `classes.life_id` → `lives.id` | Many-to-one. |
| `subclasses.class_id` → `classes.id` | One-to-many. |
| No class references a race or below | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `classes.life_id` → `lives.id` | A class belongs to a life. |
| `subclasses.class_id` → `classes.id` | A subclass belongs to a class. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `classes.race_id` → `races.id` | A class does not reference a race. Wrong domain. |
| `attributes.class_id` → `classes.id` | An attribute references a life, not a class. Wrong granularity. |
| `classes.parent_class_id` → `classes.id` | No self-referencing class hierarchy. |

---

### 7.6 Subclass Relationships

#### Purpose

The subclass relationships section defines the relationships between the
`subclasses` table and all other life tables.

#### Scope

The subclass relationships apply to the `subclasses` table, its parent (classes),
and its optional children (traits).

#### Boundaries

A subclass belongs to exactly one class. A subclass may have traits. No subclass
references a race, species, attribute, statistic, title, reputation, alignment,
bloodline, heritage, status, age, or lifespan directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A subclass belongs to exactly one class. |
| Optional Traits | A subclass may have traits. |
| No Downward Skip | A subclass does not reference races, attributes, or statuses directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `subclasses.class_id` → `classes.id` | Many-to-one. |
| `traits.subclass_id` → `subclasses.id` | One-to-many (optional). |
| No subclass references a race or below | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `subclasses.class_id` → `classes.id` | A subclass belongs to a class. |
| `traits.subclass_id` → `subclasses.id` | A trait belongs to a subclass. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `subclasses.race_id` → `races.id` | A subclass does not reference a race. Wrong domain. |
| `attributes.subclass_id` → `subclasses.id` | An attribute references a life, not a subclass. Wrong granularity. |
| `subclasses.parent_subclass_id` → `subclasses.id` | No self-referencing subclass hierarchy. |

---

### 7.7 Attribute Relationships

#### Purpose

The attribute relationships section defines the relationships between the
`attributes` table and all other life tables.

#### Scope

The attribute relationships apply to the `attributes` table, its parent (lives),
and its children (statistics).

#### Boundaries

An attribute belongs to exactly one life. An attribute has many statistics. No
attribute references a race, species, class, subclass, trait, title, reputation,
alignment, bloodline, heritage, status, age, or lifespan directly.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An attribute belongs to exactly one life. |
| Many Statistics | An attribute has many statistics. |
| No Downward Skip | An attribute does not reference races, classes, traits, or statuses directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `attributes.life_id` → `lives.id` | Many-to-one. |
| `statistics.attribute_id` → `attributes.id` | One-to-many. |
| No attribute references a race or below | Hierarchy preserved. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `attributes.life_id` → `lives.id` | An attribute belongs to a life. |
| `statistics.attribute_id` → `attributes.id` | A statistic belongs to an attribute. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `attributes.class_id` → `classes.id` | An attribute does not reference a class. Wrong domain. |
| `traits.attribute_id` → `attributes.id` | A trait references a life or subclass, not an attribute. Wrong granularity. |
| `attributes.parent_attribute_id` → `attributes.id` | No self-referencing attribute hierarchy. |

---

### 7.8 Statistic Relationships

#### Purpose

The statistic relationships section defines the relationships between the
`statistics` table and all other life tables.

#### Scope

The statistic relationships apply to the `statistics` table and its parent
(attributes).

#### Boundaries

A statistic belongs to exactly one attribute. No statistic references a race,
species, class, subclass, trait, title, reputation, alignment, bloodline,
heritage, status, age, or lifespan directly. No statistic references another
statistic.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A statistic belongs to exactly one attribute. |
| No Statistic-to-Statistic | No statistic references another statistic. |
| No Downward Skip | A statistic does not reference races, classes, or traits directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `statistics.attribute_id` → `attributes.id` | Many-to-one. |
| No statistic references a race or below | Hierarchy preserved. |
| No statistic references another statistic | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `statistics.attribute_id` → `attributes.id` | A statistic belongs to an attribute. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `statistics.class_id` → `classes.id` | A statistic does not reference a class. Wrong domain. |
| `statistics.parent_statistic_id` → `statistics.id` | No self-referencing statistic hierarchy. |
| `traits.statistic_id` → `statistics.id` | A trait references a life or subclass, not a statistic. Wrong granularity. |

---

### 7.9 Trait Relationships

#### Purpose

The trait relationships section defines the relationships between the `traits`
table and all other life tables.

#### Scope

The trait relationships apply to the `traits` table, its parent (lives), and its
optional parent (subclasses).

#### Boundaries

A trait belongs to exactly one life. A trait may optionally belong to a subclass.
No trait references a race, species, class, attribute, statistic, title,
reputation, alignment, bloodline, heritage, status, age, or lifespan directly.
No trait references another trait.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A trait belongs to exactly one life. |
| Optional Subclass | A trait may belong to a subclass. |
| No Trait-to-Trait | No trait references another trait. |
| No Downward Skip | A trait does not reference races, attributes, or statuses directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `traits.life_id` → `lives.id` | Required. Ownership reference. |
| `traits.subclass_id` → `subclasses.id` | Optional. If set, trait is scoped to a subclass. |
| No trait references a race or below | Hierarchy preserved. |
| No trait references another trait | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `traits.life_id` → `lives.id` | A trait belongs to a life. |
| `traits.subclass_id` → `subclasses.id` | A trait is scoped to a subclass. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `traits.race_id` → `races.id` | A trait does not reference a race. Wrong domain. |
| `traits.parent_trait_id` → `traits.id` | No self-referencing trait hierarchy. |
| `attributes.trait_id` → `traits.id` | An attribute references a life, not a trait. Wrong granularity. |

---

### 7.10 Title Relationships

#### Purpose

The title relationships section defines the relationships between the `titles`
table and all other life tables.

#### Scope

The title relationships apply to the `titles` table and its parent (lives).

#### Boundaries

A title belongs to exactly one life. No title references a race, species, class,
subclass, attribute, statistic, trait, reputation, alignment, bloodline, heritage,
status, age, or lifespan directly. No title references another title.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A title belongs to exactly one life. |
| No Title-to-Title | No title references another title. |
| No Downward Skip | A title does not reference races, classes, or attributes directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `titles.life_id` → `lives.id` | Required. Ownership reference. |
| No title references a race or below | Hierarchy preserved. |
| No title references another title | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `titles.life_id` → `lives.id` | A title belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `titles.race_id` → `races.id` | A title does not reference a race. Wrong domain. |
| `titles.parent_title_id` → `titles.id` | No self-referencing title hierarchy. |
| `reputations.title_id` → `titles.id` | A reputation references a life, not a title. Wrong granularity. |

---

### 7.11 Reputation Relationships

#### Purpose

The reputation relationships section defines the relationships between the
`reputations` table and all other life tables.

#### Scope

The reputation relationships apply to the `reputations` table and its parent
(lives).

#### Boundaries

A reputation belongs to exactly one life. No reputation references a race,
species, class, subclass, attribute, statistic, trait, title, alignment,
bloodline, heritage, status, age, or lifespan directly. No reputation references
another reputation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A reputation belongs to exactly one life. |
| No Reputation-to-Reputation | No reputation references another reputation. |
| No Downward Skip | A reputation does not reference races, classes, or attributes directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `reputations.life_id` → `lives.id` | Required. Ownership reference. |
| No reputation references a race or below | Hierarchy preserved. |
| No reputation references another reputation | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `reputations.life_id` → `lives.id` | A reputation belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `reputations.race_id` → `races.id` | A reputation does not reference a race. Wrong domain. |
| `reputations.parent_reputation_id` → `reputations.id` | No self-referencing reputation hierarchy. |
| `titles.reputation_id` → `reputations.id` | A title references a life, not a reputation. Wrong granularity. |

---

### 7.12 Alignment Relationships

#### Purpose

The alignment relationships section defines the relationships between the
`alignments` table and all other life tables.

#### Scope

The alignment relationships apply to the `alignments` table and its parent
(lives).

#### Boundaries

An alignment belongs to exactly one life. No alignment references a race,
species, class, subclass, attribute, statistic, trait, title, reputation,
bloodline, heritage, status, age, or lifespan directly. No alignment references
another alignment.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An alignment belongs to exactly one life. |
| No Alignment-to-Alignment | No alignment references another alignment. |
| No Downward Skip | An alignment does not reference races, classes, or attributes directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `alignments.life_id` → `lives.id` | Required. Ownership reference. |
| No alignment references a race or below | Hierarchy preserved. |
| No alignment references another alignment | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `alignments.life_id` → `lives.id` | An alignment belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `alignments.race_id` → `races.id` | An alignment does not reference a race. Wrong domain. |
| `alignments.parent_alignment_id` → `alignments.id` | No self-referencing alignment hierarchy. |
| `reputations.alignment_id` → `alignments.id` | A reputation references a life, not an alignment. Wrong granularity. |

---

### 7.13 Bloodline Relationships

#### Purpose

The bloodline relationships section defines the relationships between the
`bloodlines` table and all other life tables.

#### Scope

The bloodline relationships apply to the `bloodlines` table and its optional
parents (race or species).

#### Boundaries

A bloodline belongs to exactly one race or one species. No bloodline references a
class, subclass, attribute, statistic, trait, title, reputation, alignment,
heritage, status, age, or lifespan directly. No bloodline references another
bloodline.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A bloodline belongs to exactly one parent (race or species). |
| Optional Parent Type | The parent may be a race or a species. |
| No Bloodline-to-Bloodline | No bloodline references another bloodline. |
| Ownership Reference | A bloodline references a life via `life_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `bloodlines.life_id` → `lives.id` | Required. Ownership reference. |
| `bloodlines.race_id` → `races.id` | Optional. One of two parent types. |
| `bloodlines.species_id` → `species.id` | Optional. One of two parent types. |
| Exactly one parent is set | The other is null. |
| No bloodline references a class or below | Hierarchy preserved. |
| No bloodline references another bloodline | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `bloodlines.race_id` → `races.id` | A bloodline belongs to a race. |
| `bloodlines.species_id` → `species.id` | A bloodline belongs to a species. |
| `bloodlines.life_id` → `lives.id` | A bloodline belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `bloodlines.class_id` → `classes.id` | A bloodline does not reference a class. Wrong domain. |
| `bloodlines.parent_bloodline_id` → `bloodlines.id` | No self-referencing bloodline hierarchy. |
| `heritages.bloodline_id` → `bloodlines.id` | A heritage references a race or species, not a bloodline. Wrong granularity. |

---

### 7.14 Heritage Relationships

#### Purpose

The heritage relationships section defines the relationships between the
`heritages` table and all other life tables.

#### Scope

The heritage relationships apply to the `heritages` table and its optional
parents (race or species).

#### Boundaries

A heritage belongs to exactly one race or one species. No heritage references a
class, subclass, attribute, statistic, trait, title, reputation, alignment,
bloodline, status, age, or lifespan directly. No heritage references another
heritage.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A heritage belongs to exactly one parent (race or species). |
| Optional Parent Type | The parent may be a race or a species. |
| No Heritage-to-Heritage | No heritage references another heritage. |
| Ownership Reference | A heritage references a life via `life_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `heritages.life_id` → `lives.id` | Required. Ownership reference. |
| `heritages.race_id` → `races.id` | Optional. One of two parent types. |
| `heritages.species_id` → `species.id` | Optional. One of two parent types. |
| Exactly one parent is set | The other is null. |
| No heritage references a class or below | Hierarchy preserved. |
| No heritage references another heritage | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `heritages.race_id` → `races.id` | A heritage belongs to a race. |
| `heritages.species_id` → `species.id` | A heritage belongs to a species. |
| `heritages.life_id` → `lives.id` | A heritage belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `heritages.class_id` → `classes.id` | A heritage does not reference a class. Wrong domain. |
| `heritages.parent_heritage_id` → `heritages.id` | No self-referencing heritage hierarchy. |
| `bloodlines.heritage_id` → `heritages.id` | A bloodline references a race or species, not a heritage. Wrong granularity. |

---

### 7.15 Status Relationships

#### Purpose

The status relationships section defines the relationships between the `statuses`
table and all other life tables.

#### Scope

The status relationships apply to the `statuses` table and its parent (lives).

#### Boundaries

A status belongs to exactly one life. No status references a race, species,
class, subclass, attribute, statistic, trait, title, reputation, alignment,
bloodline, heritage, age, or lifespan directly. No status references another
status.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A status belongs to exactly one life. |
| No Status-to-Status | No status references another status. |
| No Downward Skip | A status does not reference races, classes, or attributes directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `statuses.life_id` → `lives.id` | Required. Ownership reference. |
| No status references a race or below | Hierarchy preserved. |
| No status references another status | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `statuses.life_id` → `lives.id` | A status belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `statuses.race_id` → `races.id` | A status does not reference a race. Wrong domain. |
| `statuses.parent_status_id` → `statuses.id` | No self-referencing status hierarchy. |
| `traits.status_id` → `statuses.id` | A trait references a life or subclass, not a status. Wrong granularity. |

---

### 7.16 Age Relationships

#### Purpose

The age relationships section defines the relationships between the `ages` table
and all other life tables.

#### Scope

The age relationships apply to the `ages` table and its parent (lives).

#### Boundaries

An age belongs to exactly one life. No age references a race, species, class,
subclass, attribute, statistic, trait, title, reputation, alignment, bloodline,
heritage, status, or lifespan directly. No age references another age.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | An age belongs to exactly one life. |
| No Age-to-Age | No age references another age. |
| No Downward Skip | An age does not reference races, classes, or attributes directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `ages.life_id` → `lives.id` | Required. Ownership reference. |
| No age references a race or below | Hierarchy preserved. |
| No age references another age | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `ages.life_id` → `lives.id` | An age belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `ages.race_id` → `races.id` | An age does not reference a race. Wrong domain. |
| `ages.parent_age_id` → `ages.id` | No self-referencing age hierarchy. |
| `statuses.age_id` → `ages.id` | A status references a life, not an age. Wrong granularity. |

---

### 7.17 Lifespan Relationships

#### Purpose

The lifespan relationships section defines the relationships between the
`lifespans` table and all other life tables.

#### Scope

The lifespan relationships apply to the `lifespans` table and its parent (lives).

#### Boundaries

A lifespan belongs to exactly one life. No lifespan references a race, species,
class, subclass, attribute, statistic, trait, title, reputation, alignment,
bloodline, heritage, status, or age directly. No lifespan references another
lifespan.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Parent | A lifespan belongs to exactly one life. |
| No Lifespan-to-Lifespan | No lifespan references another lifespan. |
| No Downward Skip | A lifespan does not reference races, classes, or attributes directly. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| `lifespans.life_id` → `lives.id` | Required. Ownership reference. |
| No lifespan references a race or below | Hierarchy preserved. |
| No lifespan references another lifespan | No hierarchy. |

#### Valid Examples

| Relationship | Description |
|--------------|-------------|
| `lifespans.life_id` → `lives.id` | A lifespan belongs to a life. |

#### Invalid Examples

| Relationship | Why Invalid |
|--------------|-------------|
| `lifespans.race_id` → `races.id` | A lifespan does not reference a race. Wrong domain. |
| `lifespans.parent_lifespan_id` → `lifespans.id` | No self-referencing lifespan hierarchy. |
| `ages.lifespan_id` → `lifespans.id` | An age references a life, not a lifespan. Wrong granularity. |

---

### 7.18 Ownership Rules

#### Purpose

The ownership rules section defines how life relationships enforce data ownership.

#### Scope

The ownership rules apply to all 16 life tables and all their relationships.

#### Boundaries

Every life row has a `user_id` referencing the Foundation Layer. Every life row
has a `life_id` referencing the lives table. RLS scopes every query to the
authenticated user. No cross-user access from the client.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User Ownership | Every life row has a `user_id` referencing the Foundation Layer. |
| Life Ownership | Every life row has a `life_id` referencing the lives table. |
| RLS Enforced | RLS is enforced on every life table. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life row has `user_id` | References the Foundation Layer. |
| Every life row has `life_id` | References the lives table. |
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| The service role key is server-side only | Never in client code. |

#### Valid Examples

| Rule Application | Description |
|------------------|-------------|
| `races.user_id` and `races.life_id` | A race has both user and life ownership. |
| `classes.user_id` and `classes.life_id` | A class has both user and life ownership. |
| `statuses.user_id` and `statuses.life_id` | A status has both user and life ownership. |

#### Invalid Examples

| Rule Violation | Why Invalid |
|----------------|-------------|
| A race without `user_id` | Every life row must have `user_id`. |
| A class without `life_id` | Every life row must have `life_id`. |
| A status accessible by another user | RLS prevents cross-user access. |

---

### 7.19 Dependency Rules

#### Purpose

The dependency rules section defines how life relationships enforce the
dependency hierarchy.

#### Scope

The dependency rules apply to all 16 life tables and all their relationships.

#### Boundaries

The Life Layer depends on the Foundation Layer and the World Layer. No life table
depends on a layer above the Life Layer. No circular dependencies. The dependency
graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Foundation Dependency | The Life Layer depends on the Foundation Layer. |
| World Dependency | The Life Layer depends on the World Layer. |
| No Upward Dependencies | No life table depends on a layer above the Life Layer. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer depends on the Foundation Layer | Via `user_id`. |
| The Life Layer depends on the World Layer | Via `world_id`. |
| No life table depends on a layer above the Life Layer | No upward references. |
| No circular dependencies | The dependency graph is a DAG. |
| No table skips a level in the hierarchy | Races reference lives, subclasses reference classes, statistics reference attributes. |
| The Life Layer follows the Engine Dependency Graph | Topological build order. |

#### Valid Examples

| Dependency | Description |
|------------|-------------|
| `races.life_id` → `lives.id` | Race depends on life. Correct level. |
| `subclasses.class_id` → `classes.id` | Subclass depends on class. Correct level. |
| `statistics.attribute_id` → `attributes.id` | Statistic depends on attribute. Correct level. |

#### Invalid Examples

| Dependency | Why Invalid |
|------------|-------------|
| `subclasses.life_id` → `lives.id` (as primary parent) | Subclass skips class. Wrong level. |
| `lives.race_id` → `races.id` | Life depends on race. Reversed. |
| `statistics.life_id` → `lives.id` (as primary parent) | Statistic skips attribute. Wrong level. |

---

### 7.20 Cascade Rules

#### Purpose

The cascade rules section defines what happens when a parent entity is deleted.

#### Scope

The cascade rules apply to all parent-child relationships in the life layer.

#### Boundaries

Deleting a life cascades to all children. Deleting a race cascades to its species.
Deleting a class cascades to its subclasses. Cascade rules are documented and
tested. No cascade destroys data without documentation.

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
| Deleting a life cascades to all children | Races, species, classes, subclasses, attributes, statistics, traits, titles, reputations, alignments, bloodlines, heritages, statuses, ages, lifespans. |
| Deleting a race cascades to its species | And their children. |
| Deleting a class cascades to its subclasses | And their children. |
| Deleting an attribute cascades to its statistics | And their children. |
| Deleting a subclass cascades to its traits | If applicable. |
| Cascade flows from parent to child only | Never child to parent. |
| All cascade rules are documented | In the blueprint and Schema.md. |
| All cascade rules are tested | Against all dependent layers. |

#### Valid Examples

| Cascade | Description |
|---------|-------------|
| Delete life → delete all races | Cascade from life to races. |
| Delete class → delete all subclasses | Cascade from class to subclasses. |
| Delete attribute → delete all statistics | Cascade from attribute to statistics. |

#### Invalid Examples

| Cascade | Why Invalid |
|---------|-------------|
| Delete race → delete life | Cascade never flows from child to parent. |
| Delete subclass → delete class | Cascade never flows from child to parent. |
| Delete statistic → delete attribute | Cascade never flows from child to parent. |

---

### 7.21 Future Expansion Rules

#### Purpose

The future expansion rules section defines how new relationships are added to the
Life Layer.

#### Scope

The future expansion rules apply to all future relationships added to the Life
Layer.

#### Boundaries

New relationships are additive. No existing relationship is removed. No new
relationship creates a circular dependency. No new relationship weakens a
guarantee.

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
| No new relationship creates a circular dependency | The Life Layer remains a DAG. |
| No new relationship weakens a guarantee | All 10 guarantees preserved. |
| New relationships are documented before implementation | In the ERD, blueprint, and Schema.md. |
| New relationships are tested against dependent layers | No breaking changes. |

#### Valid Examples

| Expansion | Description |
|-----------|-------------|
| Add `life_titles` junction table | New relationship between lives and titles. Additive. |
| Add `class_traits` junction table | New relationship between classes and traits. Additive. |
| Add `race_attributes` junction table | New relationship between races and attributes. Additive. |

#### Invalid Examples

| Expansion | Why Invalid |
|-----------|-------------|
| Remove `subclasses.class_id` | No existing relationship is removed. |
| Add `lives.parent_life_id` | Creates a self-referencing hierarchy. Violates no-cycles rule. |
| Add `attributes.class_id` | Skips hierarchy. An attribute does not reference a class directly. |

---

## 8. Security

### Overview

This chapter defines the security architecture for the Life Layer. It defines the
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

The security philosophy defines the permanent principles that govern the Life
Layer's security architecture.

#### Scope

The security philosophy applies to all 16 life tables and all life operations.

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

The authentication boundaries section defines how the Life Layer relates to
authentication.

#### Scope

The authentication boundaries apply to all life tables and all access paths.

#### Boundaries

The Life Layer does not manage authentication. The Foundation Layer manages
authentication. The Life Layer references the user ID from the Foundation Layer.
No life table stores passwords, tokens, or session data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Auth Management | The Life Layer does not manage authentication. |
| User ID Reference | The Life Layer references the user ID from the Foundation Layer. |
| No Credentials | No life table stores passwords, tokens, or session data. |
| Foundation Dependency | Authentication is handled by the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer does not manage authentication | The Foundation Layer does. |
| The Life Layer references the user ID | Via `user_id`. |
| No life table stores passwords or tokens | No exceptions. |
| No life table stores session data | No exceptions. |
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

The authorization boundaries section defines how the Life Layer relates to
authorization.

#### Scope

The authorization boundaries apply to all life tables, all RLS policies, and all
access paths.

#### Boundaries

The Life Layer does not manage authorization. The Foundation Layer manages
authorization (roles, permissions). The Life Layer enforces authorization via
RLS policies. No life table stores role or permission definitions.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Authorization Management | The Life Layer does not manage authorization. |
| RLS Enforcement | The Life Layer enforces authorization via RLS. |
| No Role Storage | No life table stores role or permission definitions. |
| Foundation Dependency | Authorization is managed by the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer does not manage authorization | The Foundation Layer does. |
| The Life Layer enforces authorization via RLS | Four policies per table. |
| No life table stores role or permission definitions | No exceptions. |
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

The ownership protection section defines how the Life Layer protects data
ownership.

#### Scope

The ownership protection applies to all life tables and all RLS policies.

#### Boundaries

Every life row has a `user_id` referencing the Foundation Layer. RLS scopes every
query to the authenticated user. No cross-user access from the client. The service
role key is server-side only.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User Ownership | Every life row has a `user_id`. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |
| Service Role Key Protection | The service role key is server-side only. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life row has `user_id` | References the Foundation Layer. |
| RLS is enabled on every life table | No exceptions. |
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

The row-level security boundaries section defines how RLS is applied to life
tables.

#### Scope

The row-level security boundaries apply to all 16 life tables and all RLS
policies.

#### Boundaries

RLS is enabled on every life table. Four policies per table (SELECT, INSERT,
UPDATE, DELETE). Policies use `auth.uid()` for ownership checks. No `FOR ALL`
policies. No `USING (true)` policies (except for intentionally public data, which
does not apply to the Life Layer).

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| RLS Enabled | RLS is enabled on every life table. |
| Four Policies | Four policies per table (SELECT, INSERT, UPDATE, DELETE). |
| `auth.uid()` Checks | Policies use `auth.uid()` for ownership checks. |
| No FOR ALL | No `FOR ALL` policies. |
| No USING (true) | No `USING (true)` policies. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| Policies use `auth.uid()` for ownership checks | No `current_user`. |
| No `FOR ALL` policies | No exceptions. |
| No `USING (true)` policies | No exceptions (Life Layer data is not public). |
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

The synchronization protection section defines how the Life Layer protects data
during synchronization.

#### Scope

The synchronization protection applies to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

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
| The Life Layer does not manage sync | The Synchronization Architecture does. |
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

The replay protection section defines how the Life Layer protects data during
replays.

#### Scope

The replay protection applies to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots (except the life identifier if the engine
references it). Replays do not query life tables. No non-determinism from life
data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. |
| No Replay Queries | Replays do not query life tables. |
| No Non-Determinism | Life data does not introduce non-determinism. |
| Deterministic Identifiers | Life identifiers are deterministic. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| No non-determinism from life data | Same state, same result. |
| No replay protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay protection does not affect save snapshots. |
| Replay Compatibility | Life data does not introduce non-determinism. |
| Migration Compatibility | Replay protection is never weakened. |
| Synchronization Compatibility | Replay protection is server-authoritative. |
| Event Bus Compatibility | Replay protection does not affect event ordering. |

---

### 8.8 Migration Protection

#### Purpose

The migration protection section defines how the Life Layer protects data during
migrations.

#### Scope

The migration protection applies to all life migrations — any additive change to
the life schema.

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

The snapshot protection section defines how the Life Layer protects data from
snapshot corruption.

#### Scope

The snapshot protection applies to the boundary between the Life Layer and the
Save Engine's snapshot system.

#### Boundaries

Life data is not serialized into engine snapshots. The Save Engine references
life identifiers; it does not serialize life tables. No life data affects
existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Life Serialization | Life tables are not serialized into snapshots. |
| Identifier Reference Only | The Save Engine references life identifiers. |
| No Format Change | Life data does not affect existing snapshot format. |
| Zero Snapshot Overhead | Life data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life tables are not in snapshots | Except the life identifier if referenced. |
| The Save Engine references life identifiers | No life data in snapshots. |
| Life data does not affect existing snapshot format | No format changes. |
| Life data does not increase snapshot size | Zero overhead. |
| No snapshot protection rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Life data does not affect save snapshots. |
| Replay Compatibility | Snapshot protection is deterministic. |
| Migration Compatibility | Snapshot protection is never weakened. |
| Synchronization Compatibility | Snapshot protection is server-authoritative. |
| Event Bus Compatibility | Snapshot protection does not affect event ordering. |

---

### 8.10 Backup Protection

#### Purpose

The backup protection section defines how the Life Layer protects data during
backups.

#### Scope

The backup protection applies to all life data that is backed up.

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

The integrity protection section defines how the Life Layer protects data
integrity.

#### Scope

The integrity protection applies to all constraints, RLS policies, and validation
checks in the life layer.

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

The corruption detection section defines how the Life Layer detects data
corruption.

#### Scope

The corruption detection applies to all life tables and all life operations.

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

The trust boundaries section defines the trust boundaries for the Life Layer.

#### Scope

The trust boundaries apply to all life tables, all access paths, and all trust
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

The threat model section defines the threats the Life Layer must defend against.

#### Scope

The threat model applies to all life tables and all life operations.

#### Boundaries

The Life Layer defends against unauthorized access, cross-user access, data
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

The escalation procedures apply to all security incidents involving life data.

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

The recovery procedures section defines how the Life Layer recovers from security
incidents.

#### Scope

The recovery procedures apply to all security incidents involving life data.

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

This chapter defines the validation architecture for the Life Layer. It defines the
validation philosophy, structural validation, ownership validation, relationship
validation, dependency validation, synchronization validation, replay validation,
migration validation, snapshot validation, backup validation, integrity
validation, corruption validation, reporting procedures, and acceptance
procedures.

This chapter has 14 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and validation rules.

---

### 9.1 Validation Philosophy

#### Purpose

The validation philosophy defines the permanent principles that govern the Life
Layer's validation architecture.

#### Scope

The validation philosophy applies to all 16 life tables and all life operations.

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
| Every life table has constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Every life table has RLS | Four policies per table. |
| Every validation failure is logged | No silent failures. |
| Every validation failure is surfaced | Visible to the user or operator. |
| Validation is tested | Against all dependent layers. |

---

### 9.2 Structural Validation

#### Purpose

The structural validation section defines how life data is validated for
structural correctness.

#### Scope

The structural validation applies to all 16 life tables and their columns.

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
| Required columns are NOT NULL | `id`, `user_id`, `life_id`, `created_at`, `updated_at`. |
| Unique columns are UNIQUE | e.g., `lives.name` per user. |
| Check constraints validate column values | e.g., name not empty. |
| No column has an invalid value | Constraints prevent it. |
| No structural validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `id` is NOT NULL and UNIQUE | Every table. |
| `user_id` is NOT NULL | Every table. |
| `life_id` is NOT NULL | Every table (except lives). |
| `created_at` is NOT NULL | Every table. |
| `updated_at` is NOT NULL | Every table. |
| `name` is NOT NULL and not empty | Where applicable. |
| Unique constraints are documented | In the blueprint and Schema.md. |

---

### 9.3 Ownership Validation

#### Purpose

The ownership validation section defines how life data is validated for ownership
correctness.

#### Scope

The ownership validation applies to all life tables and all RLS policies.

#### Boundaries

Ownership validation ensures every row has a valid `user_id` and `life_id`. It
ensures RLS scopes every query. No cross-user access.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Valid User ID | Every row has a valid `user_id`. |
| Valid Life ID | Every row has a valid `life_id`. |
| RLS-Scoped | Every query is scoped to the authenticated user. |
| No Cross-User Access | No cross-user access from the client. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every row has a valid `user_id` | References the Foundation Layer. |
| Every row has a valid `life_id` | References the lives table. |
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| No cross-user access from the client | RLS prevents it. |
| No ownership validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `user_id` is NOT NULL and references a valid user | Every table. |
| `life_id` is NOT NULL and references a valid life | Every table (except lives). |
| INSERT policy WITH CHECK ensures `user_id = auth.uid()` | Every table. |
| UPDATE policy WITH CHECK ensures `user_id = auth.uid()` | Every table. |
| SELECT policy USING ensures `user_id = auth.uid()` | Every table. |
| DELETE policy USING ensures `user_id = auth.uid()` | Every table. |

---

### 9.4 Relationship Validation

#### Purpose

The relationship validation section defines how life data is validated for
relationship correctness.

#### Scope

The relationship validation applies to all foreign keys in the life layer.

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
| Cascade rules are enforced | Per Chapter 7 §7.20. |
| No relationship validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| `races.life_id` references a valid `lives.id` | Enforced. |
| `species.race_id` references a valid `races.id` | Enforced. |
| `subclasses.class_id` references a valid `classes.id` | Enforced. |
| `statistics.attribute_id` references a valid `attributes.id` | Enforced. |
| `traits.life_id` references a valid `lives.id` | Enforced. |
| `bloodlines.race_id` or `bloodlines.species_id` references a valid parent | Enforced. |
| `heritages.race_id` or `heritages.species_id` references a valid parent | Enforced. |
| All foreign keys are indexed | No unindexed foreign keys. |

---

### 9.5 Dependency Validation

#### Purpose

The dependency validation section defines how life data is validated for
dependency correctness.

#### Scope

The dependency validation applies to all cross-layer dependencies involving the
Life Layer.

#### Boundaries

Dependency validation ensures no circular dependencies. No upward dependencies.
The dependency graph is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Circular Dependencies | The dependency graph is a DAG. |
| No Upward Dependencies | The Life Layer does not depend on any layer above it. |
| Foundation Dependency Only | The Life Layer depends on the Foundation Layer and the World Layer. |
| Hierarchy Preserved | No table skips a level in the hierarchy. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| No circular dependencies | The dependency graph is a DAG. |
| No upward dependencies | The Life Layer does not depend on any layer above it. |
| The Life Layer depends on the Foundation Layer | Via `user_id`. |
| The Life Layer depends on the World Layer | Via `world_id`. |
| No table skips a level in the hierarchy | Races reference lives, subclasses reference classes, statistics reference attributes. |
| No dependency validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No life table references a layer above the Life Layer | No upward references. |
| No life table creates a circular dependency | DAG preserved. |
| Every life table has `user_id` referencing the Foundation Layer | Foundation dependency. |
| Every life table has `world_id` referencing the World Layer | World dependency. |
| No table skips a level | Hierarchy preserved. |
| The Life Layer follows the Engine Dependency Graph | Topological build order. |

---

### 9.6 Synchronization Validation

#### Purpose

The synchronization validation section defines how life data is validated during
synchronization.

#### Scope

The synchronization validation applies to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

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
| The Life Layer does not manage sync validation | The Synchronization Architecture does. |
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

The replay validation section defines how life data is validated for replay
compatibility.

#### Scope

The replay validation applies to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Replay validation ensures no non-determinism from life data. Life identifiers
are deterministic. Replays do not query life tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Non-Determinism | Life data does not introduce non-determinism. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| No Replay Queries | Replays do not query life tables. |
| Cross-Platform | Life identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life identifiers are deterministic | Never change after creation. |
| No non-determinism from life data | Same state, same result. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are platform-independent | Cross-platform replay works. |
| No replay validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| Life identifiers are never changed after creation | Deterministic. |
| No wall-clock time affects life data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects life data in snapshots | No random non-determinism. |
| Life identifiers are platform-independent | Cross-platform. |
| Replays do not query life tables | Zero overhead. |

---

### 9.8 Migration Validation

#### Purpose

The migration validation section defines how life migrations are validated.

#### Scope

The migration validation applies to all life migrations — any additive change to
the life schema.

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

The snapshot validation section defines how life data is validated for snapshot
compatibility.

#### Scope

The snapshot validation applies to the boundary between the Life Layer and the
Save Engine's snapshot system.

#### Boundaries

Snapshot validation ensures life data is not in engine snapshots (except the
life identifier). No life data affects existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Life Serialization | Life tables are not serialized into snapshots. |
| No Format Change | Life data does not affect existing snapshot format. |
| Zero Snapshot Overhead | Life data does not increase snapshot size. |
| Identifier Reference Only | The Save Engine references life identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life tables are not in snapshots | Except the life identifier if referenced. |
| Life data does not affect existing snapshot format | No format changes. |
| Life data does not increase snapshot size | Zero overhead. |
| The Save Engine references life identifiers | No life data in snapshots. |
| No snapshot validation rule is removed after locking | Permanent. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No life table is serialized into engine snapshots | Except the life identifier. |
| The Save Engine references life identifiers only | No life data. |
| Life data does not change snapshot format | Backward compatible. |
| Life data does not increase snapshot size | Zero overhead. |
| Snapshot validation is tested | Against the Save Engine. |

---

### 9.10 Backup Validation

#### Purpose

The backup validation section defines how life data backups are validated.

#### Scope

The backup validation applies to all life data that is backed up.

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

The integrity validation section defines how life data is validated for overall
integrity.

#### Scope

The integrity validation applies to all constraints, RLS policies, and validation
checks in the life layer.

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

The corruption validation section defines how life data is validated for
corruption.

#### Scope

The corruption validation applies to all life tables and all life operations.

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

The reporting procedures apply to all validation failures in the life layer.

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
Life Layer is locked.

#### Scope

The acceptance procedures apply to all validation checks in the life layer
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
| All ownership validation checks pass | RLS, user_id, life_id. |
| All relationship validation checks pass | Foreign keys, no orphan rows. |
| All dependency validation checks pass | No circular dependencies, no upward dependencies. |
| All synchronization validation checks pass | Server-authoritative, non-blocking. |
| All replay validation checks pass | No non-determinism, deterministic identifiers. |
| All migration validation checks pass | Additive, forward-only, backward compatible. |
| All snapshot validation checks pass | No life serialization, no format change. |
| All backup validation checks pass | Atomic, no data destruction. |
| All integrity validation checks pass | Constraints, RLS, referential integrity. |
| All corruption validation checks pass | Detection, reporting, no data destruction. |
| The Lead Architect signs off on all validation results | No exceptions. |

---

## Sprint 1.2.4.3 Review

### Sprint Summary

**Sprint:** 1.2.4.3 — Life Blueprint v1.0 (Chapters 7–9)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 7 | Relationships | 21 sections: relationship philosophy, life/race/species/class/subclass/attribute/statistic/trait/title/reputation/alignment/bloodline/heritage/status/age/lifespan relationships, ownership rules, dependency rules, cascade rules, future expansion rules. Each with purpose, scope, boundaries, guarantees, permanent rules, valid examples, invalid examples. |
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

- The Life Blueprint is IN PROGRESS. Chapters 10–16 are pending.
- Next sprint: 1.2.4.4 — Chapter 10 (Performance), Chapter 11 (Testing).

---

## 10. Performance Architecture

### Overview

This chapter defines the performance architecture for the Life Layer. It defines
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

The performance philosophy defines the permanent principles that govern the Life
Layer's performance architecture.

#### Scope

The performance philosophy applies to all 16 life tables and all life operations.

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
decisions in the Life Layer.

#### Scope

The performance principles apply to all 16 life tables and all life operations.

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

The storage optimization section defines how life tables are optimized for storage
efficiency.

#### Scope

The storage optimization applies to all 16 life tables.

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

The index optimization section defines how life tables are indexed for query
efficiency.

#### Scope

The index optimization applies to all 16 life tables and all life queries.

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

The partition optimization section defines how life tables are partitioned for
scalability.

#### Scope

The partition optimization applies to life tables that grow large over time:
traits, statistics, reputations, titles, statuses.

#### Boundaries

Partitioning is by life (or by user for multi-life tables). Partitioning is
additive. No partitioning weakens integrity or compatibility.

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
| Large tables are partitioned by life | traits, statistics, reputations, titles, statuses. |
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

The query optimization section defines how life queries are optimized for
performance.

#### Scope

The query optimization applies to all life queries.

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

The synchronization optimization section defines how life data sync is optimized
for performance.

#### Scope

The synchronization optimization applies to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

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
| The Life Layer does not manage sync | The Synchronization Architecture does. |
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

The replay optimization section defines how life data is optimized for replay
performance.

#### Scope

The replay optimization applies to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots. Replays do not query life tables. The Life
Layer has zero replay overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| No Non-Determinism | Life data does not introduce non-determinism. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| Cross-Platform | Life identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| No replay optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay optimization does not affect save snapshots. |
| Replay Compatibility | Life data does not introduce non-determinism. |
| Migration Compatibility | Replay optimization is never weakened. |
| Synchronization Compatibility | Replay optimization is server-authoritative. |
| Event Bus Compatibility | Replay optimization does not affect event ordering. |

---

### 10.9 Snapshot Optimization

#### Purpose

The snapshot optimization section defines how life data is optimized for snapshot
performance.

#### Scope

The snapshot optimization applies to the boundary between the Life Layer and the
Save Engine's snapshot system.

#### Boundaries

Life data is not serialized into engine snapshots. The Save Engine references
life identifiers only. No life data affects existing snapshot format. Zero
snapshot overhead.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| No Life Serialization | Life tables are not serialized into snapshots. |
| Zero Snapshot Overhead | Life data does not increase snapshot size. |
| No Format Change | Life data does not affect existing snapshot format. |
| Identifier Reference Only | The Save Engine references life identifiers. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life tables are not in snapshots | Except the life identifier if referenced. |
| Life data does not increase snapshot size | Zero overhead. |
| Life data does not affect existing snapshot format | No format changes. |
| The Save Engine references life identifiers | No life data in snapshots. |
| No snapshot optimization rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Life data does not affect save snapshots. |
| Replay Compatibility | Snapshot optimization is deterministic. |
| Migration Compatibility | Snapshot optimization is never weakened. |
| Synchronization Compatibility | Snapshot optimization is server-authoritative. |
| Event Bus Compatibility | Snapshot optimization does not affect event ordering. |

---

### 10.10 Backup Optimization

#### Purpose

The backup optimization section defines how life data backups are optimized for
performance.

#### Scope

The backup optimization applies to all life data that is backed up.

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

The monitoring strategy section defines how life data performance is monitored.

#### Scope

The monitoring strategy applies to all 16 life tables and all life operations.

#### Boundaries

Monitoring is non-blocking. Monitoring does not affect gameplay. The Life Layer
does not define the monitoring framework. Monitoring provides row counts, table
sizes, and query performance characteristics.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring does not block gameplay. |
| Observable | Life data is observable through metrics. |
| No Monitoring Framework | The Life Layer does not define the monitoring framework. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| Monitoring provides row counts, table sizes, and query performance | Observable. |
| The Life Layer does not define the monitoring framework | It uses the project's monitoring standards. |
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

The profiling strategy section defines how life data performance is profiled.

#### Scope

The profiling strategy applies to all 16 life tables and all life queries.

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

The benchmark strategy section defines how life data performance is benchmarked.

#### Scope

The benchmark strategy applies to all 16 life tables and all life queries.

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

The storage limits section defines the storage limits for life data.

#### Scope

The storage limits apply to all 16 life tables.

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

The memory limits section defines the memory limits for life data operations.

#### Scope

The memory limits apply to all life queries and life operations.

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

The performance targets section defines the performance targets for life data
operations.

#### Scope

The performance targets apply to all 16 life tables and all life queries.

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

This chapter defines the testing architecture for the Life Layer. It defines the
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

The testing philosophy defines the permanent principles that govern the Life
Layer's testing architecture.

#### Scope

The testing philosophy applies to all 16 life tables and all life operations.

#### Boundaries

Testing is deterministic. Testing is reproducible. Testing does not destroy data.
Testing is documented. The Life Layer does not define the testing framework — it
uses the Testing Architecture.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Testing is deterministic. |
| Reproducible | Testing is reproducible. |
| No Data Destruction | Testing does not destroy data. |
| Documented | Testing is documented. |
| No Framework Definition | The Life Layer does not define the testing framework. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing is deterministic | Same input, same result. |
| Testing is reproducible | Can be re-run with same results. |
| Testing does not destroy data | Data preservation is the cardinal rule. |
| Testing is documented | In the blueprint. |
| The Life Layer uses the Testing Architecture | It does not define it. |
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
decisions in the Life Layer.

#### Scope

The testing principles apply to all 16 life tables and all life operations.

#### Boundaries

Every life table is tested. Every migration is tested. Every RLS policy is
tested. No test is skipped. No test is weakened.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Every Table Tested | Every life table is tested. |
| Every Migration Tested | Every migration is tested. |
| Every RLS Policy Tested | Every RLS policy is tested. |
| No Skipped Tests | No test is skipped. |
| No Weakened Tests | No test is weakened. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life table is tested | No exceptions. |
| Every migration is tested | Against all dependent layers. |
| Every RLS policy is tested | Four per table. |
| No test is skipped | No exceptions. |
| No test is weakened | No exceptions. |
| No testing principle is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 life tables have tests | No exceptions. |
| All migrations have tests | No exceptions. |
| All RLS policies have tests | Four per table. |
| No test is skipped or weakened | No exceptions. |

---

### 11.3 Testing Environment

#### Purpose

The testing environment section defines the environment in which life tests run.

#### Scope

The testing environment applies to all life tests.

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

The testing stages section defines the stages of testing for the Life Layer.

#### Scope

The testing stages apply to all life tests.

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

The unit testing section defines how individual life tables are tested in
isolation.

#### Scope

The unit testing applies to all 16 life tables.

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
| Every life table has unit tests | No exceptions. |
| Unit tests cover constraints | NOT NULL, UNIQUE, CHECK, FK. |
| Unit tests cover RLS policies | Four per table. |
| Unit tests cover column validation | No invalid values. |
| No unit testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 life tables have unit tests | No exceptions. |
| All constraints are tested | NOT NULL, UNIQUE, CHECK, FK. |
| All RLS policies are tested | Four per table. |
| All column validations are tested | No invalid values. |
| All unit tests are deterministic and reproducible | No exceptions. |

---

### 11.6 Integration Testing

#### Purpose

The integration testing section defines how life tables are tested together and
with dependent layers.

#### Scope

The integration testing applies to all 16 life tables and their relationships
with the Foundation Layer and the World Layer.

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
| All cross-layer dependencies are tested | Foundation Layer, World Layer. |
| Integration tests are deterministic | No non-determinism. |
| Integration tests are reproducible | Can be re-run. |
| No integration testing rule is removed after locking | Permanent. |

#### Acceptance Criteria

| Criterion | Description |
|-----------|-------------|
| All foreign keys are tested | Referential integrity. |
| All cascade rules are tested | Per Chapter 7 §7.20. |
| All Foundation Layer dependencies are tested | user_id references. |
| All World Layer dependencies are tested | world_id references. |
| All integration tests are deterministic and reproducible | No exceptions. |

---

### 11.7 Regression Testing

#### Purpose

The regression testing section defines how life tests prevent regressions.

#### Scope

The regression testing applies to all 16 life tables and all life migrations.

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

The migration testing section defines how life migrations are tested.

#### Scope

The migration testing applies to all life migrations — any additive change to the
life schema.

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

The synchronization testing section defines how life data sync is tested.

#### Scope

The synchronization testing applies to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

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

The replay testing section defines how life data is tested for replay
compatibility.

#### Scope

The replay testing applies to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Replay tests verify no non-determinism from life data. Replay tests verify life
identifiers are deterministic. Replay tests verify replays do not query life
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

The backup testing section defines how life data backups are tested.

#### Scope

The backup testing applies to all life data that is backed up.

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

The recovery testing section defines how life data recovery is tested.

#### Scope

The recovery testing applies to all life data recovery procedures.

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

The validation testing section defines how life data validation is tested.

#### Scope

The validation testing applies to all constraints, RLS policies, and validation
checks in the life layer.

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

The stress testing section defines how life data is tested under high load.

#### Scope

The stress testing applies to all 16 life tables and all life queries.

#### Boundaries

Stress tests verify the Life Layer handles high load. Stress tests verify queries
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

The performance testing section defines how life data performance is tested.

#### Scope

The performance testing applies to all 16 life tables and all life queries.

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

The compatibility testing section defines how life data is tested for
compatibility with all dependent systems.

#### Scope

The compatibility testing applies to all 16 life tables and all dependent
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

The deterministic testing section defines how life data is tested for
determinism.

#### Scope

The deterministic testing applies to all 16 life tables and all life operations.

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

The security testing section defines how life data security is tested.

#### Scope

The security testing applies to all 16 life tables, all RLS policies, and all
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

The reporting strategy section defines how life test results are reported.

#### Scope

The reporting strategy applies to all life tests.

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

## Sprint 1.2.4.4 Review

### Sprint Summary

**Sprint:** 1.2.4.4 — Life Blueprint v1.0 (Chapters 10–11)
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

- The Life Blueprint is IN PROGRESS. Chapters 14–16 are pending.
- Next sprint: 1.2.4.6 — Chapter 14 (Completion Checklist), Chapter 15 (Lock Policy).

---

## 12. Future Expansion

### Overview

This chapter defines the future expansion architecture for the Life Layer. It
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
expansion of the Life Layer.

#### Scope

The expansion philosophy applies to all 16 life tables and all future changes to
the Life Layer.

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
| No expansion creates a circular dependency | The Life Layer remains a DAG. |
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

The horizontal expansion section defines how new tables are added to the Life
Layer at the same hierarchy level as existing tables.

#### Scope

The horizontal expansion applies to all future tables added to the Life Layer.

#### Boundaries

New tables are additive. New tables follow the Naming Rules v1.0. New tables have
RLS enabled with four policies. New tables have `user_id` and `life_id`. No new
table creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Additive | New tables are additive. |
| Naming Compliance | New tables follow the Naming Rules v1.0. |
| RLS Enabled | New tables have RLS with four policies. |
| Ownership | New tables have `user_id` and `life_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| New tables are additive | No removal of existing tables. |
| New tables follow the Naming Rules v1.0 | `snake_case` table names. |
| New tables have RLS enabled | Four policies per table. |
| New tables have `user_id` and `life_id` | Ownership references. |
| No new table creates a circular dependency | The Life Layer remains a DAG. |
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

The vertical expansion section defines how new columns are added to existing life
tables.

#### Scope

The vertical expansion applies to all future columns added to existing life
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

The repository expansion section defines how new life data repositories are added
to the Life Layer.

#### Scope

The repository expansion applies to all future data repositories added to the Life
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
| No new repository creates a circular dependency | The Life Layer remains a DAG. |
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

The migration expansion section defines how new migrations extend the Life Layer.

#### Scope

The migration expansion applies to all future migrations to the Life Layer.

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

The replay expansion section defines how the Life Layer expands while preserving
replay compatibility.

#### Scope

The replay expansion applies to all future expansion that could affect replays:
life identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life identifiers are deterministic and never change after creation. No expansion
introduces non-determinism. No expansion affects existing snapshot format. Replays
do not query life tables.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Identifiers | Life identifiers are deterministic. |
| No Non-Determinism | No expansion introduces non-determinism. |
| No Format Change | No expansion affects existing snapshot format. |
| Zero Replay Overhead | Replays do not query life tables. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life identifiers are deterministic | Never change after creation. |
| No expansion introduces non-determinism | Same state, same result. |
| No expansion affects existing snapshot format | Backward compatible. |
| Replays do not query life tables | Zero overhead. |
| No replay expansion rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay expansion does not affect save snapshots. |
| Replay Compatibility | Life data does not introduce non-determinism. |
| Migration Compatibility | Replay expansion is additive. |
| Synchronization Compatibility | Replay expansion is server-authoritative. |
| Event Bus Compatibility | Replay expansion does not affect event ordering. |

---

### 12.7 Synchronization Expansion

#### Purpose

The synchronization expansion section defines how the Life Layer expands while
preserving synchronization compatibility.

#### Scope

The synchronization expansion applies to all future expansion that could affect
sync: life metadata, race selection, class selection, attribute changes, status
changes, title changes, reputation changes.

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
| The Life Layer does not manage sync | The Synchronization Architecture does. |
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

The security expansion section defines how the Life Layer expands while preserving
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

The validation expansion section defines how the Life Layer expands while
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

The monitoring expansion section defines how the Life Layer expands while
preserving monitoring compatibility.

#### Scope

The monitoring expansion applies to all future expansion that could affect
monitoring: new tables, new metrics, new alerts.

#### Boundaries

Monitoring is non-blocking. No expansion affects gameplay. The Life Layer does
not define the monitoring framework. Monitoring metrics are documented.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring remains non-blocking. |
| No Gameplay Impact | No expansion affects gameplay. |
| No Framework Definition | The Life Layer does not define the monitoring framework. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| No expansion affects gameplay | No exceptions. |
| The Life Layer does not define the monitoring framework | It uses the project's standards. |
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

The backup expansion section defines how the Life Layer expands while preserving
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

The compatibility guarantees apply to all future expansion of the Life Layer.

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

The future engine integration section defines how the Life Layer integrates with
future engines.

#### Scope

The future engine integration applies to all future engines that reference life
data: Quest Engine, NPC AI Engine, Dialogue Engine, Inventory Engine, Activity
Engine, Energy Engine, Time Engine.

#### Boundaries

Future engines reference life identifiers only. Future engines do not serialize
life data into snapshots. Future engines do not query life tables during replays.
No future engine creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | Future engines reference life identifiers. |
| No Life Serialization | Future engines do not serialize life data. |
| No Replay Queries | Future engines do not query life tables during replays. |
| No Circular Dependencies | No future engine creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Future engines reference life identifiers only | No life data in snapshots. |
| Future engines do not serialize life data | Zero snapshot overhead. |
| Future engines do not query life tables during replays | Zero replay overhead. |
| No future engine creates a circular dependency | The Life Layer remains a DAG. |
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

The long-term vision section defines the long-term expansion vision for the Life
Layer.

#### Scope

The long-term vision applies to the Life Layer over the lifetime of the project.

#### Boundaries

The Life Layer remains the single source of truth for life data. The Life Layer
remains a DAG. The Life Layer preserves all 10 compatibility guarantees. The Life
Layer is never bypassed by engines or systems.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Single Source of Truth | The Life Layer remains the single source of truth. |
| DAG Preserved | The Life Layer remains a DAG. |
| All Guarantees Preserved | All 10 compatibility guarantees are preserved. |
| Never Bypassed | The Life Layer is never bypassed. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer remains the single source of truth for life data | No exceptions. |
| The Life Layer remains a DAG | No circular dependencies. |
| The Life Layer preserves all 10 compatibility guarantees | No exceptions. |
| The Life Layer is never bypassed by engines or systems | No exceptions. |
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

This chapter defines the dependency architecture for the Life Layer. It defines
the dependency philosophy, dependency hierarchy, Foundation dependencies, World
dependencies, Save Engine dependencies, Synchronization dependencies, Validation
dependencies, Replay dependencies, Migration dependencies, Security dependencies,
Monitoring dependencies, Testing dependencies, and Future dependencies.

This chapter has 12 sections. Every section includes purpose, scope, boundaries,
guarantees, permanent rules, and compatibility rules.

---

### 13.1 Dependency Philosophy

#### Purpose

The dependency philosophy defines the permanent principles that govern all
dependencies of the Life Layer.

#### Scope

The dependency philosophy applies to all 16 life tables and all dependencies
between the Life Layer and other layers.

#### Boundaries

The Life Layer depends on the Foundation Layer and the World Layer. No life table
depends on a layer above the Life Layer. No circular dependencies. The dependency
graph is a DAG. The Life Layer follows the Engine Dependency Graph.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Foundation Dependency | The Life Layer depends on the Foundation Layer. |
| World Dependency | The Life Layer depends on the World Layer. |
| No Upward Dependencies | No life table depends on a layer above the Life Layer. |
| No Circular Dependencies | The dependency graph is a DAG. |
| Engine Dependency Graph | The Life Layer follows the Engine Dependency Graph. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer depends on the Foundation Layer | Via `user_id`. |
| The Life Layer depends on the World Layer | Via `world_id`. |
| No life table depends on a layer above the Life Layer | No upward references. |
| No circular dependencies | The dependency graph is a DAG. |
| The Life Layer follows the Engine Dependency Graph | Topological build order. |
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
Life Layer.

#### Scope

The dependency hierarchy applies to all 16 life tables and all layers the Life
Layer depends on.

#### Boundaries

The Life Layer is above the Foundation Layer and the World Layer. The Life Layer
is below the Engine Layer. No life table skips a level in the hierarchy. The
hierarchy is a DAG.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Above Foundation | The Life Layer is above the Foundation Layer. |
| Above World | The Life Layer is above the World Layer. |
| Below Engine | The Life Layer is below the Engine Layer. |
| No Level Skip | No life table skips a level. |
| DAG | The hierarchy is a DAG. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Layer is above the Foundation Layer | Foundation dependency. |
| The Life Layer is above the World Layer | World dependency. |
| The Life Layer is below the Engine Layer | Engines reference life identifiers. |
| No life table skips a level in the hierarchy | Lives reference users and worlds, races reference lives, classes reference lives, etc. |
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

The Foundation dependencies section defines the dependencies between the Life
Layer and the Foundation Layer.

#### Scope

The Foundation dependencies apply to all 16 life tables and their references to
the Foundation Layer.

#### Boundaries

Every life row has a `user_id` referencing the Foundation Layer. The Life Layer
does not manage authentication or authorization. The Foundation Layer manages
both.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| User ID Reference | Every life row has a `user_id`. |
| No Auth Management | The Life Layer does not manage authentication. |
| No Authorization Management | The Life Layer does not manage authorization. |
| Foundation Dependency | The Life Layer depends on the Foundation Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Every life row has `user_id` | References the Foundation Layer. |
| The Life Layer does not manage authentication | The Foundation Layer does. |
| The Life Layer does not manage authorization | The Foundation Layer does. |
| No life table stores passwords or tokens | No exceptions. |
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

The World dependencies section defines the dependencies between the Life Layer
and the World Layer.

#### Scope

The World dependencies apply to all 16 life tables and their references to the
World Layer.

#### Boundaries

Life tables that reference world data have a `world_id` referencing the World
Layer. The Life Layer does not manage world geography or world factions. The World
Layer manages those.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| World ID Reference | Life tables that reference world data have a `world_id`. |
| No World Geography Management | The Life Layer does not manage world geography. |
| No Faction Management | The Life Layer does not manage world factions. |
| World Dependency | The Life Layer depends on the World Layer. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life tables that reference world data have `world_id` | References the World Layer. |
| The Life Layer does not manage world geography | The World Layer does. |
| The Life Layer does not manage world factions | The World Layer does. |
| No life table stores world geography data | No exceptions. |
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

### 13.5 Save Engine Dependencies

#### Purpose

The Save Engine dependencies section defines the dependencies between the Life
Layer and the Save Engine.

#### Scope

The Save Engine dependencies apply to the boundary between the Life Layer and the
Save Engine.

#### Boundaries

The Save Engine references life identifiers. The Save Engine does not serialize
life data into snapshots. No life data affects existing snapshot format.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | The Save Engine references life identifiers. |
| No Life Serialization | The Save Engine does not serialize life data. |
| No Format Change | Life data does not affect existing snapshot format. |
| Zero Snapshot Overhead | Life data does not increase snapshot size. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Save Engine references life identifiers | No life data in snapshots. |
| The Save Engine does not serialize life data | Zero overhead. |
| Life data does not affect existing snapshot format | Backward compatible. |
| Life data does not increase snapshot size | Zero overhead. |
| No Save Engine dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Life data does not affect save snapshots. |
| Replay Compatibility | Save Engine dependencies are deterministic. |
| Migration Compatibility | Save Engine dependencies are never weakened. |
| Synchronization Compatibility | Save Engine dependencies are server-authoritative. |
| Event Bus Compatibility | Save Engine dependencies do not affect event ordering. |

---

### 13.6 Synchronization Dependencies

#### Purpose

The Synchronization dependencies section defines the dependencies between the Life
Layer and the Synchronization Architecture.

#### Scope

The Synchronization dependencies apply to all life data that is synced: life
metadata, race selection, class selection, attribute changes, status changes,
title changes, reputation changes.

#### Boundaries

Sync is server-authoritative and non-blocking. The Life Layer does not manage sync.
The Synchronization Architecture manages sync. No sync dependency corrupts data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Server-Authoritative | Sync is server-authoritative. |
| Non-Blocking | Sync is non-blocking. |
| No Sync Management | The Life Layer does not manage sync. |
| No Corruption | Sync dependencies do not corrupt data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Sync is server-authoritative | No client-side authority. |
| Sync is non-blocking | No blocking gameplay. |
| The Life Layer does not manage sync | The Synchronization Architecture does. |
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

### 13.7 Validation Dependencies

#### Purpose

The Validation dependencies section defines the dependencies between the Life
Layer and the Validation Architecture.

#### Scope

The Validation dependencies apply to all constraints, RLS policies, and validation
checks in the life layer.

#### Boundaries

Validation is database-enforced and deterministic. The Life Layer does not define
the Validation Architecture. The Validation Architecture defines it. No validation
dependency destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Database-Enforced | Validation is database-enforced. |
| Deterministic | Validation is deterministic. |
| No Validation Framework | The Life Layer does not define the Validation Architecture. |
| No Data Destruction | Validation dependencies do not destroy data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Validation is database-enforced | Constraints and RLS. |
| Validation is deterministic | No non-determinism. |
| The Life Layer does not define the Validation Architecture | It uses the project's standards. |
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

### 13.8 Replay Dependencies

#### Purpose

The Replay dependencies section defines the dependencies between the Life Layer
and the Replay System.

#### Scope

The Replay dependencies apply to all life data that could affect replays: life
identifiers, race identifiers, class identifiers, attribute values, status
values.

#### Boundaries

Life data is not in engine snapshots. Replays do not query life tables. Life
identifiers are deterministic. No replay dependency introduces non-determinism.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Zero Replay Overhead | Life data is not in snapshots. No replay queries. |
| No Non-Determinism | Life data does not introduce non-determinism. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| Cross-Platform | Life identifiers are platform-independent. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Life data is not in snapshots | Except the life identifier if referenced. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| No replay dependency introduces non-determinism | Same state, same result. |
| No Replay dependency rule is removed after locking | Permanent. |

#### Compatibility Rules

| Rule | Description |
|------|-------------|
| Save Engine Compatibility | Replay dependencies do not affect save snapshots. |
| Replay Compatibility | Life data does not introduce non-determinism. |
| Migration Compatibility | Replay dependencies are never weakened. |
| Synchronization Compatibility | Replay dependencies are server-authoritative. |
| Event Bus Compatibility | Replay dependencies do not affect event ordering. |

---

### 13.9 Migration Dependencies

#### Purpose

The Migration dependencies section defines the dependencies between the Life Layer
and the Migration System.

#### Scope

The Migration dependencies apply to all life migrations — any additive change to
the life schema.

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

### 13.10 Security Dependencies

#### Purpose

The Security dependencies section defines the dependencies between the Life Layer
and the security architecture.

#### Scope

The Security dependencies apply to all 16 life tables, all RLS policies, and all
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

### 13.11 Monitoring Dependencies

#### Purpose

The Monitoring dependencies section defines the dependencies between the Life
Layer and the monitoring architecture.

#### Scope

The Monitoring dependencies apply to all 16 life tables and all monitoring
metrics.

#### Boundaries

Monitoring is non-blocking. The Life Layer does not define the monitoring
framework. Monitoring provides row counts, table sizes, and query performance.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Non-Blocking | Monitoring is non-blocking. |
| No Framework Definition | The Life Layer does not define the monitoring framework. |
| Observable | Life data is observable through metrics. |
| Documented | Monitoring metrics are documented. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Monitoring is non-blocking | No blocking gameplay. |
| The Life Layer does not define the monitoring framework | It uses the project's standards. |
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

### 13.12 Testing Dependencies

#### Purpose

The Testing dependencies section defines the dependencies between the Life Layer
and the Testing Architecture.

#### Scope

The Testing dependencies apply to all 16 life tables and all life tests.

#### Boundaries

Testing is deterministic and reproducible. The Life Layer does not define the
testing framework. The Testing Architecture defines it. No test destroys data.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic | Testing is deterministic. |
| Reproducible | Testing is reproducible. |
| No Framework Definition | The Life Layer does not define the testing framework. |
| No Data Destruction | No test destroys data. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Testing is deterministic | Same input, same result. |
| Testing is reproducible | Can be re-run with same results. |
| The Life Layer does not define the testing framework | It uses the Testing Architecture. |
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

### 13.13 Future Dependencies

#### Purpose

The Future dependencies section defines the dependencies between the Life Layer
and future engines and systems.

#### Scope

The Future dependencies apply to all future engines and systems that reference
life data.

#### Boundaries

Future engines reference life identifiers only. Future engines do not serialize
life data. Future engines do not query life tables during replays. No future
engine creates a circular dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Identifier Reference Only | Future engines reference life identifiers. |
| No Life Serialization | Future engines do not serialize life data. |
| No Replay Queries | Future engines do not query life tables during replays. |
| No Circular Dependencies | No future engine creates a circular dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| Future engines reference life identifiers only | No life data in snapshots. |
| Future engines do not serialize life data | Zero snapshot overhead. |
| Future engines do not query life tables during replays | Zero replay overhead. |
| No future engine creates a circular dependency | The Life Layer remains a DAG. |
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

## Sprint 1.2.4.5 Review

### Sprint Summary

**Sprint:** 1.2.4.5 — Life Blueprint v1.0 (Chapters 12–13)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 12 | Future Expansion | 14 sections: expansion philosophy, horizontal expansion, vertical expansion, repository expansion, migration expansion, replay expansion, synchronization expansion, security expansion, validation expansion, monitoring expansion, backup expansion, compatibility guarantees, future engine integration, long-term vision. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 13 | Dependencies | 13 sections: dependency philosophy, dependency hierarchy, Foundation dependencies, World dependencies, Save Engine dependencies, Synchronization dependencies, Validation dependencies, Replay dependencies, Migration dependencies, Security dependencies, Monitoring dependencies, Testing dependencies, Future dependencies. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |

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

- The Life Blueprint is IN PROGRESS. Chapters 14–16 are pending.
- Next sprint: 1.2.4.6 — Chapter 14 (Completion Checklist), Chapter 15 (Lock Policy).

## 14. Completion Checklist

### Overview

This chapter defines the completion checklist for the Life Layer. It defines the
architecture, validation, security, synchronization, replay, migration, backup,
performance, testing, documentation, acceptance, and release checklists.

This chapter has 12 sections. Every section includes requirements, completion
criteria, validation rules, acceptance rules, and permanent restrictions.

---

### 14.1 Architecture Checklist

#### Requirements

| Requirement | Description |
|-------------|-------------|
| All 16 life tables defined | lives, races, species, classes, subclasses, attributes, statistics, traits, titles, reputations, alignments, bloodlines, heritages, statuses, ages, lifespans. |
| All relationships defined | Per Chapter 7. |
| All dependencies defined | Per Chapter 13. |
| All naming follows the Naming Rules v1.0 | Per Chapter 6. |
| The Life Layer is a DAG | No circular dependencies. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 tables are documented in the blueprint | No missing tables. |
| All relationships are documented in the ERD | No missing relationships. |
| All dependencies are documented | No missing dependencies. |
| All naming follows the Naming Rules v1.0 | No violations. |
| The Life Layer is a DAG | No circular dependencies. |

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
| RLS is enabled on every life table | No exceptions. |
| Four policies per table | SELECT, INSERT, UPDATE, DELETE. |
| Policies use `auth.uid()` | No `current_user`. |
| No `FOR ALL` policies | No exceptions. |
| No `USING (true)` policies | No exceptions. |
| The service role key is server-side only | Never in client code. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| RLS is enabled on all 16 life tables | Verified. |
| Four policies per table are defined | Verified. |
| Policies use `auth.uid()` | Verified. |
| No `FOR ALL` policies | Verified. |
| No `USING (true)` policies | Verified. |
| The service role key is server-side only | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| RLS is enabled on every life table | Verified. |
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
| The Life Layer does not manage sync | The Synchronization Architecture does. |
| Sync is batched where possible | Reduce round trips. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Sync is server-authoritative | Verified. |
| Sync is non-blocking | Verified. |
| Sync does not corrupt data | Verified. |
| The Life Layer does not manage sync | Verified. |
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
| Life data is not in engine snapshots | Except the life identifier. |
| Replays do not query life tables | Zero overhead. |
| Life identifiers are deterministic | Never change after creation. |
| No non-determinism from life data | Same state, same result. |
| Life identifiers are platform-independent | Cross-platform. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| Life data is not in snapshots | Verified. |
| Replays do not query life tables | Verified. |
| Life identifiers are deterministic | Verified. |
| No non-determinism from life data | Verified. |
| Life identifiers are platform-independent | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| No life table is serialized into engine snapshots | Except the life identifier. |
| The Save Engine references life identifiers only | No life data. |
| Life identifiers are never changed after creation | Deterministic. |
| No wall-clock time affects life data in snapshots | No time-based non-determinism. |
| No unseeded randomness affects life data in snapshots | No random non-determinism. |

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
| Life identifiers are never changed after creation | Permanent. |
| Life data is never serialized into engine snapshots | Permanent. |

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
| Every life table is tested | No exceptions. |
| Every migration is tested | No exceptions. |
| Every RLS policy is tested | Four per table. |
| No test is skipped | No exceptions. |
| No test is weakened | No exceptions. |
| Testing is deterministic and reproducible | No exceptions. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| All 16 life tables have tests | Verified. |
| All migrations have tests | Verified. |
| All RLS policies have tests | Verified. |
| No test is skipped | Verified. |
| No test is weakened | Verified. |
| Testing is deterministic and reproducible | Verified. |

#### Validation Rules

| Rule | Description |
|------|-------------|
| All 16 life tables have unit tests | No exceptions. |
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
| The Life Blueprint is complete | All chapters authored. |
| The ERD is complete | All tables and relationships. |
| The Schema.md is complete | All tables and columns. |
| The Migration Log is complete | All migrations logged. |
| The Engine Dependency Graph is complete | All dependencies. |

#### Completion Criteria

| Criterion | Description |
|-----------|-------------|
| The Life Blueprint is complete | All chapters authored. |
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

---

## 15. Lock Policy

### Overview

This chapter defines the lock policy for the Life Blueprint v1.0. It defines the
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
Life Blueprint v1.0.

#### Scope

The lock philosophy applies to the entire Life Blueprint v1.0 — all 16 chapters,
all 16 life tables, all relationships, all dependencies, all guarantees.

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

The lock requirements apply to the entire Life Blueprint v1.0.

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

The review procedure applies to the entire Life Blueprint v1.0.

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

The approval procedure applies to the entire Life Blueprint v1.0.

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

The versioning strategy section defines the versioning strategy for the Life
Blueprint.

#### Scope

The versioning strategy applies to all versions of the Life Blueprint.

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

The deterministic guarantees apply to all life data and all life operations.

#### Boundaries

The lock preserves deterministic execution. No lock introduces non-determinism.
Life identifiers are deterministic. No lock changes identifiers after creation.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Deterministic Execution | The lock preserves deterministic execution. |
| No Non-Determinism | No lock introduces non-determinism. |
| Deterministic Identifiers | Life identifiers are deterministic. |
| No Identifier Change | No lock changes identifiers after creation. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves deterministic execution | No exceptions. |
| No lock introduces non-determinism | No exceptions. |
| Life identifiers are deterministic | Never change after creation. |
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

The replay guarantees apply to all life data that could affect replays.

#### Boundaries

The lock preserves replay compatibility. Life data is not in snapshots. Replays do
not query life tables. No lock introduces non-determinism.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Replay Compatibility | The lock preserves replay compatibility. |
| No Life Serialization | Life data is not in snapshots. |
| No Replay Queries | Replays do not query life tables. |
| No Non-Determinism | No lock introduces non-determinism. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves replay compatibility | No exceptions. |
| Life data is not in snapshots | Except the life identifier. |
| Replays do not query life tables | Zero overhead. |
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

The migration guarantees apply to all life migrations.

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

The synchronization guarantees apply to all life data that is synced.

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

The dependency guarantees apply to all dependencies of the Life Layer.

#### Boundaries

The lock preserves dependency compatibility. The Life Layer remains a DAG. No lock
creates a circular dependency. No lock removes a dependency.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Dependency Compatibility | The lock preserves dependency compatibility. |
| DAG Preserved | The Life Layer remains a DAG. |
| No Circular Dependencies | No lock creates a circular dependency. |
| No Removal | No lock removes a dependency. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves dependency compatibility | No exceptions. |
| The Life Layer remains a DAG | No circular dependencies. |
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

The ownership guarantees apply to all 16 life tables and all life rows.

#### Boundaries

The lock preserves ownership. Every life row has a `user_id`. RLS enforces
ownership. No lock weakens RLS. No lock removes `user_id`.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Ownership Preserved | The lock preserves ownership. |
| User ID Required | Every life row has a `user_id`. |
| RLS Enforced | RLS enforces ownership. |
| No RLS Weakening | No lock weakens RLS. |
| No User ID Removal | No lock removes `user_id`. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The lock preserves ownership | No exceptions. |
| Every life row has a `user_id` | No exceptions. |
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

The permanent restrictions apply to the entire Life Blueprint v1.0.

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
Life Blueprint.

#### Scope

The semantic versioning rules apply to all versions of the Life Blueprint.

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

The documentation requirements apply to all documentation related to the Life
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
of the Life Blueprint.

#### Scope

The future revision procedures apply to all future versions of the Life Blueprint.

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

This chapter defines the visual prototype for the Life Layer management interface.
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
prototype for the Life Layer management interface.

#### Scope

The panel philosophy applies to all 16 visual panels and all future panels.

#### Boundaries

The visual prototype is a management interface for the Life Layer. The visual
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
| The visual prototype is a management interface for the Life Layer | No exceptions. |
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

The navigation hierarchy follows the life structure: Lives > Races > Species >
Classes > Subclasses. The navigation hierarchy includes standalone panels:
Attributes, Statistics, Traits, Titles, Reputations, Alignments, Bloodlines,
Heritages, Statuses, Ages, Lifespans. The navigation hierarchy uses breadcrumbs for
context.

#### Guarantees

| Guarantee | Description |
|-----------|-------------|
| Life Structure | The navigation hierarchy follows the life structure. |
| Standalone Panels | The navigation hierarchy includes standalone panels. |
| Breadcrumbs | The navigation hierarchy uses breadcrumbs. |
| Consistent | The navigation hierarchy is consistent across all layouts. |

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The navigation hierarchy follows the life structure | Lives > Races > Species > Classes > Subclasses. |
| The navigation hierarchy includes standalone panels | Attributes, Statistics, Traits, Titles, Reputations, Alignments, Bloodlines, Heritages, Statuses, Ages, Lifespans. |
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

### Panel 1 — Lives Panel

#### Purpose

The Lives Panel displays the list of all lives owned by the current user and
provides CRUD operations for life records.

#### Components

| Component | Description |
|-----------|-------------|
| Life List | A paginated table of all lives with columns: name, race, class, status, created date. |
| Life Card | A card view for each life showing name, race, class, status, and thumbnail. |
| Create Life Button | A button to open the Create Life form. |
| Life Search | A search bar to filter lives by name. |
| Life Filter | A filter dropdown to filter by status. |
| Pagination Controls | Controls to navigate pages of lives. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation on the left, life list in a multi-column content area with card grid. |
| Tablet | Collapsible sidebar, single-column life list with card layout. |
| Mobile | Bottom navigation, single-column life list with stacked cards. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessible from the sidebar navigation as the top-level item. |
| Breadcrumb | "Lives" displayed in the top bar breadcrumb. |
| Drill-Down | Clicking a life navigates to the Life Detail Panel. |
| Cross-Panel | From Life Detail, navigate to Races Panel or Classes Panel. |

#### Boundaries

- The Lives Panel displays only lives owned by the current user.
- The Lives Panel does not display life data from other users.
- The Lives Panel does not manage authentication.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Lives Panel displays only lives owned by the current user | RLS enforced. |
| The Lives Panel supports CRUD operations | Create, read, update, delete. |
| The Lives Panel uses pagination | No unbounded result sets. |
| No Lives Panel rule is removed after locking | Permanent. |

---

### Panel 2 — Life Detail Panel

#### Purpose

The Life Detail Panel displays the full details of a single life and provides
edit operations for life metadata.

#### Components

| Component | Description |
|-----------|-------------|
| Life Header | Displays the life name, race, class, and status. |
| Life Metadata | Displays created date, last modified, owner. |
| Edit Life Button | A button to open the Edit Life form. |
| Delete Life Button | A button to delete the life (with confirmation). |
| Relationship Tabs | Tabs linking to Races, Classes, Attributes, Statistics, Traits, Titles, Reputations. |
| Life Statistics | Displays counts of attributes, statistics, traits, titles. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, life header at top, metadata in left column, relationship tabs in right column. |
| Tablet | Collapsible sidebar, life header at top, metadata and tabs in single column. |
| Mobile | Bottom navigation, life header, metadata, and tabs stacked. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed by clicking a life in the Lives Panel. |
| Breadcrumb | "Lives > [Life Name]" displayed in the top bar. |
| Back | Back button returns to the Lives Panel. |
| Cross-Panel | Relationship tabs navigate to Races, Classes, Attributes, Statistics, Traits, Titles, Reputations panels. |

#### Boundaries

- The Life Detail Panel displays only lives owned by the current user.
- The Life Detail Panel does not display life data from other users.
- Deletion requires confirmation and preserves the previous valid state.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Life Detail Panel displays only lives owned by the current user | RLS enforced. |
| Deletion requires confirmation | No accidental deletion. |
| The Life Detail Panel preserves the previous valid state | No data destruction. |
| No Life Detail Panel rule is removed after locking | Permanent. |

---

### Panel 3 — Races Panel

#### Purpose

The Races Panel displays the list of races available to a life and provides CRUD
operations for race records.

#### Components

| Component | Description |
|-----------|-------------|
| Race List | A paginated table of races with columns: name, species, description, created date. |
| Race Card | A card view for each race showing name, description, and species. |
| Create Race Button | A button to open the Create Race form. |
| Race Search | A search bar to filter races by name. |
| Pagination Controls | Controls to navigate pages of races. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, race list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column race list. |
| Mobile | Bottom navigation, single-column race list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Races" displayed in the top bar. |
| Drill-Down | Clicking a race navigates to the Race Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Races Panel displays only races within the selected life.
- The Races Panel does not display races from other lives.
- The Races Panel does not display races from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Races Panel displays only races within the selected life | Scoped by `life_id`. |
| The Races Panel supports CRUD operations | Create, read, update, delete. |
| The Races Panel uses pagination | No unbounded result sets. |
| No Races Panel rule is removed after locking | Permanent. |

---

### Panel 4 — Species Panel

#### Purpose

The Species Panel displays the list of species available to a life and provides CRUD
operations for species records.

#### Components

| Component | Description |
|-----------|-------------|
| Species List | A paginated table of species with columns: name, description, traits. |
| Species Card | A card view for each species showing name, description, and traits. |
| Create Species Button | A button to open the Create Species form. |
| Species Search | A search bar to filter species by name. |
| Pagination Controls | Controls to navigate pages of species. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, species list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column species list. |
| Mobile | Bottom navigation, single-column species list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Species" displayed in the top bar. |
| Drill-Down | Clicking a species navigates to the Species Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Species Panel displays only species within the selected life.
- The Species Panel does not display species from other lives.
- The Species Panel does not display species from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Species Panel displays only species within the selected life | Scoped by `life_id`. |
| The Species Panel supports CRUD operations | Create, read, update, delete. |
| The Species Panel uses pagination | No unbounded result sets. |
| No Species Panel rule is removed after locking | Permanent. |

---

### Panel 5 — Classes Panel

#### Purpose

The Classes Panel displays the list of classes available to a life and provides CRUD
operations for class records.

#### Components

| Component | Description |
|-----------|-------------|
| Class List | A paginated table of classes with columns: name, description, base attributes. |
| Class Card | A card view for each class showing name, description, and base attributes. |
| Create Class Button | A button to open the Create Class form. |
| Class Search | A search bar to filter classes by name. |
| Pagination Controls | Controls to navigate pages of classes. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, class list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column class list. |
| Mobile | Bottom navigation, single-column class list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Classes" displayed in the top bar. |
| Drill-Down | Clicking a class navigates to the Class Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Classes Panel displays only classes within the selected life.
- The Classes Panel does not display classes from other lives.
- The Classes Panel does not display classes from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Classes Panel displays only classes within the selected life | Scoped by `life_id`. |
| The Classes Panel supports CRUD operations | Create, read, update, delete. |
| The Classes Panel uses pagination | No unbounded result sets. |
| No Classes Panel rule is removed after locking | Permanent. |

---

### Panel 6 — Subclasses Panel

#### Purpose

The Subclasses Panel displays the list of subclasses available to a class and provides
CRUD operations for subclass records.

#### Components

| Component | Description |
|-----------|-------------|
| Subclass List | A paginated table of subclasses with columns: name, parent class, description. |
| Subclass Card | A card view for each subclass showing name, description, and parent class. |
| Create Subclass Button | A button to open the Create Subclass form. |
| Subclass Search | A search bar to filter subclasses by name. |
| Pagination Controls | Controls to navigate pages of subclasses. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, subclass list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column subclass list. |
| Mobile | Bottom navigation, single-column subclass list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Class Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life] > Classes > [Class] > Subclasses" in the top bar. |
| Drill-Down | Clicking a subclass navigates to the Subclass Detail Panel. |
| Back | Back button returns to the Class Detail Panel. |

#### Boundaries

- The Subclasses Panel displays only subclasses within the selected class.
- The Subclasses Panel does not display subclasses from other classes.
- The Subclasses Panel does not display subclasses from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Subclasses Panel displays only subclasses within the selected class | Scoped by `class_id`. |
| The Subclasses Panel supports CRUD operations | Create, read, update, delete. |
| The Subclasses Panel uses pagination | No unbounded result sets. |
| No Subclasses Panel rule is removed after locking | Permanent. |

---

### Panel 7 — Attributes Panel

#### Purpose

The Attributes Panel displays the list of attributes for a life and provides CRUD
operations for attribute records.

#### Components

| Component | Description |
|-----------|-------------|
| Attribute List | A paginated table of attributes with columns: name, value, type, modified date. |
| Attribute Card | A card view for each attribute showing name, value, and type. |
| Create Attribute Button | A button to open the Create Attribute form. |
| Attribute Search | A search bar to filter attributes by name. |
| Pagination Controls | Controls to navigate pages of attributes. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, attribute list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column attribute list. |
| Mobile | Bottom navigation, single-column attribute list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Attributes" displayed in the top bar. |
| Drill-Down | Clicking an attribute navigates to the Attribute Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Attributes Panel displays only attributes within the selected life.
- The Attributes Panel does not display attributes from other lives.
- The Attributes Panel does not display attributes from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Attributes Panel displays only attributes within the selected life | Scoped by `life_id`. |
| The Attributes Panel supports CRUD operations | Create, read, update, delete. |
| The Attributes Panel uses pagination | No unbounded result sets. |
| No Attributes Panel rule is removed after locking | Permanent. |

---

### Panel 8 — Statistics Panel

#### Purpose

The Statistics Panel displays the list of statistics for a life and provides CRUD
operations for statistic records.

#### Components

| Component | Description |
|-----------|-------------|
| Statistic List | A paginated table of statistics with columns: name, value, type, modified date. |
| Statistic Card | A card view for each statistic showing name, value, and type. |
| Create Statistic Button | A button to open the Create Statistic form. |
| Statistic Search | A search bar to filter statistics by name. |
| Pagination Controls | Controls to navigate pages of statistics. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, statistic list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column statistic list. |
| Mobile | Bottom navigation, single-column statistic list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Statistics" displayed in the top bar. |
| Drill-Down | Clicking a statistic navigates to the Statistic Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Statistics Panel displays only statistics within the selected life.
- The Statistics Panel does not display statistics from other lives.
- The Statistics Panel does not display statistics from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Statistics Panel displays only statistics within the selected life | Scoped by `life_id`. |
| The Statistics Panel supports CRUD operations | Create, read, update, delete. |
| The Statistics Panel uses pagination | No unbounded result sets. |
| No Statistics Panel rule is removed after locking | Permanent. |

---

### Panel 9 — Traits Panel

#### Purpose

The Traits Panel displays the list of traits for a life and provides CRUD operations
for trait records.

#### Components

| Component | Description |
|-----------|-------------|
| Trait List | A paginated table of traits with columns: name, description, type, source. |
| Trait Card | A card view for each trait showing name, description, and type. |
| Create Trait Button | A button to open the Create Trait form. |
| Trait Search | A search bar to filter traits by name. |
| Pagination Controls | Controls to navigate pages of traits. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, trait list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column trait list. |
| Mobile | Bottom navigation, single-column trait list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Traits" displayed in the top bar. |
| Drill-Down | Clicking a trait navigates to the Trait Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Traits Panel displays only traits within the selected life.
- The Traits Panel does not display traits from other lives.
- The Traits Panel does not display traits from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Traits Panel displays only traits within the selected life | Scoped by `life_id`. |
| The Traits Panel supports CRUD operations | Create, read, update, delete. |
| The Traits Panel uses pagination | No unbounded result sets. |
| No Traits Panel rule is removed after locking | Permanent. |

---

### Panel 10 — Titles Panel

#### Purpose

The Titles Panel displays the list of titles for a life and provides CRUD operations
for title records.

#### Components

| Component | Description |
|-----------|-------------|
| Title List | A paginated table of titles with columns: name, description, earned date. |
| Title Card | A card view for each title showing name, description, and earned date. |
| Create Title Button | A button to open the Create Title form. |
| Title Search | A search bar to filter titles by name. |
| Pagination Controls | Controls to navigate pages of titles. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, title list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column title list. |
| Mobile | Bottom navigation, single-column title list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Titles" displayed in the top bar. |
| Drill-Down | Clicking a title navigates to the Title Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Titles Panel displays only titles within the selected life.
- The Titles Panel does not display titles from other lives.
- The Titles Panel does not display titles from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Titles Panel displays only titles within the selected life | Scoped by `life_id`. |
| The Titles Panel supports CRUD operations | Create, read, update, delete. |
| The Titles Panel uses pagination | No unbounded result sets. |
| No Titles Panel rule is removed after locking | Permanent. |

---

### Panel 11 — Reputations Panel

#### Purpose

The Reputations Panel displays the list of reputations for a life and provides CRUD
operations for reputation records.

#### Components

| Component | Description |
|-----------|-------------|
| Reputation List | A paginated table of reputations with columns: faction, value, level, modified date. |
| Reputation Card | A card view for each reputation showing faction, value, and level. |
| Create Reputation Button | A button to open the Create Reputation form. |
| Reputation Search | A search bar to filter reputations by faction. |
| Pagination Controls | Controls to navigate pages of reputations. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, reputation list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column reputation list. |
| Mobile | Bottom navigation, single-column reputation list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Reputations" displayed in the top bar. |
| Drill-Down | Clicking a reputation navigates to the Reputation Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Reputations Panel displays only reputations within the selected life.
- The Reputations Panel does not display reputations from other lives.
- The Reputations Panel does not display reputations from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Reputations Panel displays only reputations within the selected life | Scoped by `life_id`. |
| The Reputations Panel supports CRUD operations | Create, read, update, delete. |
| The Reputations Panel uses pagination | No unbounded result sets. |
| No Reputations Panel rule is removed after locking | Permanent. |

---

### Panel 12 — Alignments Panel

#### Purpose

The Alignments Panel displays the list of alignments for a life and provides CRUD
operations for alignment records.

#### Components

| Component | Description |
|-----------|-------------|
| Alignment List | A paginated table of alignments with columns: name, axis, description. |
| Alignment Card | A card view for each alignment showing name, axis, and description. |
| Create Alignment Button | A button to open the Create Alignment form. |
| Alignment Search | A search bar to filter alignments by name. |
| Pagination Controls | Controls to navigate pages of alignments. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, alignment list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column alignment list. |
| Mobile | Bottom navigation, single-column alignment list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Alignments" displayed in the top bar. |
| Drill-Down | Clicking an alignment navigates to the Alignment Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Alignments Panel displays only alignments within the selected life.
- The Alignments Panel does not display alignments from other lives.
- The Alignments Panel does not display alignments from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Alignments Panel displays only alignments within the selected life | Scoped by `life_id`. |
| The Alignments Panel supports CRUD operations | Create, read, update, delete. |
| The Alignments Panel uses pagination | No unbounded result sets. |
| No Alignments Panel rule is removed after locking | Permanent. |

---

### Panel 13 — Bloodlines Panel

#### Purpose

The Bloodlines Panel displays the list of bloodlines for a life and provides CRUD
operations for bloodline records.

#### Components

| Component | Description |
|-----------|-------------|
| Bloodline List | A paginated table of bloodlines with columns: name, description, potency. |
| Bloodline Card | A card view for each bloodline showing name, description, and potency. |
| Create Bloodline Button | A button to open the Create Bloodline form. |
| Bloodline Search | A search bar to filter bloodlines by name. |
| Pagination Controls | Controls to navigate pages of bloodlines. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, bloodline list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column bloodline list. |
| Mobile | Bottom navigation, single-column bloodline list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Bloodlines" displayed in the top bar. |
| Drill-Down | Clicking a bloodline navigates to the Bloodline Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Bloodlines Panel displays only bloodlines within the selected life.
- The Bloodlines Panel does not display bloodlines from other lives.
- The Bloodlines Panel does not display bloodlines from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Bloodlines Panel displays only bloodlines within the selected life | Scoped by `life_id`. |
| The Bloodlines Panel supports CRUD operations | Create, read, update, delete. |
| The Bloodlines Panel uses pagination | No unbounded result sets. |
| No Bloodlines Panel rule is removed after locking | Permanent. |

---

### Panel 14 — Heritages Panel

#### Purpose

The Heritages Panel displays the list of heritages for a life and provides CRUD
operations for heritage records.

#### Components

| Component | Description |
|-----------|-------------|
| Heritage List | A paginated table of heritages with columns: name, description, source. |
| Heritage Card | A card view for each heritage showing name, description, and source. |
| Create Heritage Button | A button to open the Create Heritage form. |
| Heritage Search | A search bar to filter heritages by name. |
| Pagination Controls | Controls to navigate pages of heritages. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, heritage list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column heritage list. |
| Mobile | Bottom navigation, single-column heritage list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Heritages" displayed in the top bar. |
| Drill-Down | Clicking a heritage navigates to the Heritage Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Heritages Panel displays only heritages within the selected life.
- The Heritages Panel does not display heritages from other lives.
- The Heritages Panel does not display heritages from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Heritages Panel displays only heritages within the selected life | Scoped by `life_id`. |
| The Heritages Panel supports CRUD operations | Create, read, update, delete. |
| The Heritages Panel uses pagination | No unbounded result sets. |
| No Heritages Panel rule is removed after locking | Permanent. |

---

### Panel 15 — Statuses Panel

#### Purpose

The Statuses Panel displays the list of statuses for a life and provides CRUD
operations for status records.

#### Components

| Component | Description |
|-----------|-------------|
| Status List | A paginated table of statuses with columns: name, type, duration, severity. |
| Status Card | A card view for each status showing name, type, and duration. |
| Create Status Button | A button to open the Create Status form. |
| Status Search | A search bar to filter statuses by name. |
| Pagination Controls | Controls to navigate pages of statuses. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, status list in a multi-column content area. |
| Tablet | Collapsible sidebar, single-column status list. |
| Mobile | Bottom navigation, single-column status list. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Statuses" displayed in the top bar. |
| Drill-Down | Clicking a status navigates to the Status Detail Panel. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Statuses Panel displays only statuses within the selected life.
- The Statuses Panel does not display statuses from other lives.
- The Statuses Panel does not display statuses from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Statuses Panel displays only statuses within the selected life | Scoped by `life_id`. |
| The Statuses Panel supports CRUD operations | Create, read, update, delete. |
| The Statuses Panel uses pagination | No unbounded result sets. |
| No Statuses Panel rule is removed after locking | Permanent. |

---

### Panel 16 — Ages and Lifespans Panel

#### Purpose

The Ages and Lifespans Panel displays the age and lifespan data for a life and
provides CRUD operations for age and lifespan records.

#### Components

| Component | Description |
|-----------|-------------|
| Age Display | Displays the current age, birth date, and aging rate for the selected life. |
| Lifespan Display | Displays the expected lifespan, maximum lifespan, and aging modifiers. |
| Edit Age Button | A button to open the Edit Age form. |
| Edit Lifespan Button | A button to open the Edit Lifespan form. |
| Age History | A timeline view showing age progression and milestones. |

#### Layout

| Area | Description |
|------|-------------|
| Desktop | Sidebar navigation, age display in left column, lifespan display in right column, age history below. |
| Tablet | Collapsible sidebar, age and lifespan displays stacked, age history below. |
| Mobile | Bottom navigation, age, lifespan, and history stacked. |

#### Navigation

| Navigation | Description |
|------------|-------------|
| Entry Point | Accessed from the Life Detail Panel relationship tabs. |
| Breadcrumb | "Lives > [Life Name] > Ages and Lifespans" displayed in the top bar. |
| Back | Back button returns to the Life Detail Panel. |

#### Boundaries

- The Ages and Lifespans Panel displays only age and lifespan data within the selected life.
- The Ages and Lifespans Panel does not display age data from other lives.
- The Ages and Lifespans Panel does not display age data from other users.

#### Permanent Rules

| Rule | Description |
|------|-------------|
| The Ages and Lifespans Panel displays only age data within the selected life | Scoped by `life_id`. |
| The Ages and Lifespans Panel supports CRUD operations | Create, read, update, delete. |
| The Ages and Lifespans Panel uses pagination | No unbounded result sets. |
| No Ages and Lifespans Panel rule is removed after locking | Permanent. |

---

## Sprint 1.2.4.6 Review

### Sprint Summary

**Sprint:** 1.2.4.6 — Life Blueprint v1.0 (Chapters 14–16)
**Status:** COMPLETE
**Date:** 2026-08-04

### Chapters Authored

| Chapter | Title | Sections |
|---------|-------|----------|
| 14 | Completion Checklist | 12 sections: architecture checklist, validation checklist, security checklist, synchronization checklist, replay checklist, migration checklist, backup checklist, performance checklist, testing checklist, documentation checklist, acceptance checklist, release checklist. Each with requirements, completion criteria, validation rules, acceptance rules, permanent restrictions. |
| 15 | Lock Policy | 20 sections: lock philosophy, lock requirements, modification procedure, exception procedure, unlock procedure, review procedure, approval procedure, versioning strategy, compatibility guarantees, deterministic guarantees, replay guarantees, migration guarantees, synchronization guarantees, dependency guarantees, ownership guarantees, permanent restrictions, change management rules, semantic versioning rules, documentation requirements, future revision procedures. Each with purpose, scope, boundaries, guarantees, permanent rules, compatibility rules. |
| 16 | Visual Prototype | 10 rule sections: panel philosophy, desktop layout, tablet layout, mobile layout, navigation hierarchy, typography rules, accessibility rules, theme rules, animation rules, responsiveness rules. 16 visual panel definitions: Lives, Life Detail, Races, Species, Classes, Subclasses, Attributes, Statistics, Traits, Titles, Reputations, Alignments, Bloodlines, Heritages, Statuses, Ages and Lifespans. Each panel with purpose, components, layout, navigation, boundaries, permanent rules. |

### Cross-Cutting Validation

| Check | Result |
|-------|--------|
| Chapter numbering sequential (1–16) | PASS |
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

- The Life Blueprint v1.0 is COMPLETE. All 16 chapters are authored.
- The blueprint is READY FOR LOCK pending Lead Architect and Peer Architect sign-off.
- No further sprints are required for the Life Blueprint.
