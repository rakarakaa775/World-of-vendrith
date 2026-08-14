# World Layer Ownership Rules v1.0

> **Phase:** 1.2.3 — World Layer Migration Implementation
> **Sprint:** 1.2.3.1
> **Blueprint:** World Blueprint v1.0 (LOCKED)
> **Status:** IN PROGRESS
> **Owner:** Lead Database Architect

---

## 1. Overview

### 1.1 Purpose

This document defines the ownership rules for all 16 world tables. Every world row
is owned by exactly one user. Ownership is enforced by Row Level Security (RLS).
No user can access another user's world data.

### 1.2 Scope

The ownership rules apply to all 16 world tables and all rows within those tables.

### 1.3 Boundaries

- Every world row has a `user_id` column. No exceptions.
- Ownership is enforced by RLS. No exceptions.
- No user can read, create, update, or delete another user's world data.
- The `user_id` column is never null, never editable by the client, and never
  changed after creation.
- This document does not contain SQL implementation.

---

## 2. Ownership Model

### 2.1 Ownership Principle

Every world row belongs to exactly one user. The user who creates a world row owns
it. Ownership is permanent — it cannot be transferred. Ownership is inherited —
all child rows belong to the same user as their parent.

### 2.2 Ownership Column

| Property | Value |
|----------|-------|
| Column Name | `user_id` |
| Type | UUID |
| Nullable | No (NOT NULL) |
| Default | None (set by the server) |
| Editable by Client | No |
| Changeable After Creation | No |
| Indexed | Yes |
| Foreign Key | References `auth.users(id)` |

### 2.3 Ownership Inheritance

| Rule | Description |
|------|-------------|
| Parent Ownership | A child row belongs to the same user as its parent. |
| Inherited at Creation | The `user_id` of a child is set to the `user_id` of its parent at creation time. |
| No Transfer | Ownership cannot be transferred after creation. |
| No Cross-User Children | A child cannot belong to a different user than its parent. |

---

## 3. RLS Policy Rules

### 3.1 Policy Requirements

Every world table has exactly four RLS policies — one per CRUD verb. No table uses
`FOR ALL`. No table uses `USING (true)` as a shortcut.

| Policy | Command | Description |
|--------|---------|-------------|
| `select_own_[table]` | SELECT | Users can read only their own rows. |
| `insert_own_[table]` | INSERT | Users can create rows only for themselves. |
| `update_own_[table]` | UPDATE | Users can update only their own rows. |
| `delete_own_[table]` | DELETE | Users can delete only their own rows. |

### 3.2 Policy Predicates

| Command | USING | WITH CHECK |
|---------|-------|------------|
| SELECT | `auth.uid() = user_id` | N/A |
| INSERT | N/A | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` | N/A |

### 3.3 Policy Naming Convention

| Rule | Description |
|------|-------------|
| Format | `[verb]_own_[table_name]` |
| Verb | `select`, `insert`, `update`, or `delete` |
| Table Name | The snake_case table name |
| Examples | `select_own_worlds`, `insert_own_continents`, `update_own_regions`, `delete_own_kingdoms` |

### 3.4 Policy Scope

| Rule | Description |
|------|-------------|
| TO authenticated | All policies are scoped to the `authenticated` role. |
| No anon access | The `anon` role has no access to world tables. |
| No public access | No world data is public. |
| No shared access | No world data is shared between users. |

---

## 4. Per-Table Ownership Rules

### 4.1 Table Ownership Summary

| Table | `user_id` | Parent | Ownership Inheritance |
|-------|-----------|--------|----------------------|
| `worlds` | Required | None | Set by server from `auth.uid()`. |
| `continents` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `regions` | Required | `continents` | Must match parent `continents.user_id`. |
| `kingdoms` | Required | `regions` | Must match parent `regions.user_id`. |
| `cities` | Required | `kingdoms` | Must match parent `kingdoms.user_id`. |
| `villages` | Required | `kingdoms` | Must match parent `kingdoms.user_id`. |
| `roads` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `landmarks` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `dungeons` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `climates` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `ecosystems` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `factions` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `religions` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `world_history` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `major_world_events` | Required | `worlds` | Must match parent `worlds.user_id`. |
| `locations` | Required | `worlds` | Must match parent `worlds.user_id`. |

### 4.2 Ownership Validation Rules

| Rule | Description |
|------|-------------|
| `user_id` Required | Every row must have a `user_id`. No null values. |
| `user_id` Immutable | `user_id` cannot be changed after creation. |
| `user_id` Server-Set | `user_id` is set by the server, never by the client. |
| Parent Match | A child's `user_id` must match its parent's `user_id`. |
| No Cross-User | No row can reference a parent owned by a different user. |

---

## 5. Ownership Guarantees

| Guarantee | Description |
|-----------|-------------|
| Ownership Preserved | Every row has a `user_id`. Ownership is never lost. |
| RLS Enforced | RLS enforces ownership on all 16 tables. |
| No Cross-User Access | No user can access another user's world data. |
| No Client Manipulation | `user_id` is never set or changed by the client. |
| Parent-Child Consistency | A child's `user_id` always matches its parent's `user_id`. |
| No Weakening | No migration weakens RLS or removes `user_id`. |

---

## 6. Ownership Verification

### 6.1 Verification Checks

| Check | Description |
|-------|-------------|
| `user_id` Column Exists | Every table has a `user_id` column. |
| `user_id` Not Null | `user_id` is NOT NULL on every table. |
| `user_id` Indexed | `user_id` has an index on every table. |
| RLS Enabled | RLS is enabled on every table. |
| Four Policies | Every table has exactly four RLS policies. |
| No FOR ALL | No table uses `FOR ALL`. |
| No USING (true) | No policy uses `USING (true)` as a shortcut. |
| Parent Match | Every child's `user_id` matches its parent's `user_id`. |

### 6.2 Verification Procedure

| Step | Action |
|------|--------|
| 1 | After each migration, verify `user_id` column exists and is NOT NULL. |
| 2 | After each migration, verify RLS is enabled. |
| 3 | After each migration, verify four policies exist. |
| 4 | After each migration, verify no `FOR ALL` or `USING (true)`. |
| 5 | After all migrations, verify parent-child `user_id` consistency. |
| 6 | Log all verification results. |

---

## 7. Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No `user_id` Removal | `user_id` is never removed from any table. |
| No RLS Disable | RLS is never disabled on any table. |
| No Policy Removal | RLS policies are never removed from any table. |
| No Policy Weakening | RLS policies are never weakened. |
| No Public Access | No world table is ever made public. |
| No Anon Access | No world table is ever accessible by the `anon` role. |
| No Ownership Transfer | Ownership is never transferred after creation. |
| No Cross-User Access | No user ever accesses another user's world data. |

---

## 8. Document Control

| Field | Value |
|-------|-------|
| Document | Ownership Rules v1.0 |
| Phase | 1.2.3 — World Layer Migration Implementation |
| Sprint | 1.2.3.1 |
| Blueprint | World Blueprint v1.0 (LOCKED) |
| Status | IN PROGRESS |
| Owner | Lead Database Architect |
| Created | 2026-08-03 |
| Last Update | 2026-08-03 — Sprint 1.2.3.1 authored. Ownership rules defined. |
| Next Sprint | 1.2.3.2 — Migration implementation (SQL migrations for tables 01–04) |
