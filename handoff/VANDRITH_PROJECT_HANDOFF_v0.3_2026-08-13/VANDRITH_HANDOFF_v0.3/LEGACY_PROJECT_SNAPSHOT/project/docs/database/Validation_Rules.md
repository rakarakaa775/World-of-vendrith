# World Layer Validation Rules v1.0

> **Phase:** 1.2.3 — World Layer Migration Implementation
> **Sprint:** 1.2.3.1
> **Blueprint:** World Blueprint v1.0 (LOCKED)
> **Status:** IN PROGRESS
> **Owner:** Lead Database Architect

---

## 1. Overview

### 1.1 Purpose

This document defines the validation strategy and rules for all 16 world table
migrations. It defines what is validated, when validation occurs, how validation
is performed, and what happens when validation fails.

### 1.2 Scope

The validation rules apply to all 16 world table migrations and all data within
those tables.

### 1.3 Boundaries

- Validation is performed at the database level (constraints) and the application
  level (input validation).
- Validation does not define gameplay logic.
- Validation does not define UI validation rules.
- This document does not contain SQL implementation.
- This document defines the rules that the SQL implementation must enforce.

---

## 2. Validation Strategy

### 2.1 Validation Principles

| Principle | Description |
|-----------|-------------|
| Defense in Depth | Validation occurs at multiple layers: application input, database constraint, and RLS. |
| Fail Fast | Invalid data is rejected as early as possible. |
| Never Trust Client | All client input is validated server-side. |
| Deterministic | Validation is deterministic. The same input always produces the same result. |
| No Silent Acceptance | Invalid data is never silently accepted. |
| No Data Loss | Validation never destroys valid data. |
| Atomic | Validation is atomic within a transaction. |

### 2.2 Validation Layers

| Layer | Description |
|-------|-------------|
| Layer 1 — Application Input | The application validates input before sending it to the database. |
| Layer 2 — Database Constraint | The database validates data through constraints (NOT NULL, CHECK, UNIQUE, FOREIGN KEY). |
| Layer 3 — RLS Ownership | RLS validates that the user owns the data they are accessing. |

### 2.3 Validation Scope

| Scope | Description |
|-------|-------------|
| Structural | Column types, nullability, and constraints. |
| Relational | Foreign key validity and parent-child consistency. |
| Ownership | `user_id` matches `auth.uid()` and parent `user_id`. |
| Business | Enum values, length limits, and domain-specific rules. |
| Migration | Migration order, dependency, and rollback consistency. |

---

## 3. Structural Validation Rules

### 3.1 Column Validation

| Rule | Description |
|------|-------------|
| NOT NULL | Required columns are NOT NULL. |
| Type Correct | Column types match the blueprint specification. |
| Length Limits | String columns have length limits where specified. |
| CHECK Constraints | Domain-specific constraints are enforced with CHECK. |
| UNIQUE Constraints | Unique columns are enforced with UNIQUE. |
| Default Values | Columns with defaults are specified. |

### 3.2 Timestamp Validation

| Rule | Description |
|------|-------------|
| `created_at` | NOT NULL, defaults to `now()`. |
| `updated_at` | NOT NULL, defaults to `now()`, updated on modification. |
| Immutable `created_at` | `created_at` cannot be changed after creation. |
| Monotonic | `created_at` is monotonically increasing within a table. |

### 3.3 Primary Key Validation

| Rule | Description |
|------|-------------|
| UUID Primary Key | Every table uses a UUID primary key. |
| NOT NULL | Primary key is NOT NULL. |
| UNIQUE | Primary key is UNIQUE. |
| Default | Primary key defaults to `gen_random_uuid()`. |
| Immutable | Primary key never changes after creation. |

---

## 4. Relational Validation Rules

### 4.1 Foreign Key Validation

| Rule | Description |
|------|-------------|
| Foreign Key Required | Every table except `worlds` has a foreign key to its parent. |
| NOT NULL | Foreign key columns are NOT NULL. |
| RESTRICT | Foreign keys use ON DELETE RESTRICT. No cascade. |
| Index | Every foreign key has an index. |
| Valid Reference | Foreign keys must reference an existing parent row. |
| Same User | The parent row must belong to the same user as the child. |

### 4.2 Parent-Child Consistency

| Rule | Description |
|------|-------------|
| Parent Exists | A child cannot be created without a parent. |
| Same Ownership | A child's `user_id` must match its parent's `user_id`. |
| No Cross-User Parent | A child cannot reference a parent owned by a different user. |
| No Orphaned Children | A parent cannot be deleted while children exist (RESTRICT). |

---

## 5. Ownership Validation Rules

### 5.1 RLS Validation

| Rule | Description |
|------|-------------|
| RLS Enabled | RLS is enabled on every table. |
| Four Policies | Every table has four policies (SELECT, INSERT, UPDATE, DELETE). |
| `auth.uid()` Check | Every policy checks `auth.uid() = user_id`. |
| No `FOR ALL` | No table uses `FOR ALL`. |
| No `USING (true)` | No policy uses `USING (true)` as a shortcut. |
| TO authenticated | All policies are scoped to `authenticated`. |

### 5.2 Ownership Validation Checks

| Check | Description |
|-------|-------------|
| `user_id` Required | Every row has a `user_id`. |
| `user_id` NOT NULL | `user_id` is never null. |
| `user_id` Immutable | `user_id` cannot be changed after creation. |
| `user_id` Server-Set | `user_id` is set by the server, not the client. |
| Parent Match | Child `user_id` matches parent `user_id`. |

---

## 6. Business Validation Rules

### 6.1 Enum Validation

| Rule | Description |
|------|-------------|
| Enum Columns | Enum columns accept only valid enum values. |
| CHECK Constraint | Enum values are enforced with CHECK constraints. |
| No Invalid Values | Invalid enum values are rejected. |
| Default Values | Enum columns have default values where specified. |

### 6.2 String Validation

| Rule | Description |
|------|-------------|
| NOT NULL | Required string columns are NOT NULL. |
| Length Limit | String columns have maximum length limits. |
| Non-Empty | Required string columns must be non-empty. |
| No Trimming Required | The database does not trim strings. The application is responsible. |

### 6.3 Numeric Validation

| Rule | Description |
|------|-------------|
| NOT NULL | Required numeric columns are NOT NULL. |
| Non-Negative | Numeric columns that represent counts or measurements are non-negative. |
| CHECK Constraint | Numeric ranges are enforced with CHECK constraints. |
| Default Values | Numeric columns have default values where specified. |

---

## 7. Migration Validation Rules

### 7.1 Migration Order Validation

| Rule | Description |
|------|-------------|
| Sequential | Migrations execute in sequential order (01 through 16). |
| No Gaps | No migration is skipped. |
| No Reordering | The order is fixed. |
| Parent Before Child | A parent migration must complete before its child. |
| Foundation First | Foundation Layer must be complete before World Layer. |

### 7.2 Migration Dependency Validation

| Rule | Description |
|------|-------------|
| DAG Preserved | The dependency graph remains a DAG. |
| No Cycles | No circular dependencies are created. |
| Parent Exists | The parent table exists before the child migration runs. |
| Foreign Key Valid | The foreign key references an existing table. |
| No Sibling Dependencies | No migration depends on a sibling. |

### 7.3 Rollback Validation

| Rule | Description |
|------|-------------|
| Atomic | A failed migration is fully rolled back. |
| No Partial State | No partial state remains after rollback. |
| No Data Loss | Rollback does not destroy existing data. |
| No Cascade | Rollback does not cascade to dependent tables. |
| Forward Recovery | The system recovers forward by fixing and re-running. |
| Logged | All rollbacks are logged. |

---

## 8. Validation Guarantees

| Guarantee | Description |
|-----------|-------------|
| Structural Integrity | All structural constraints are enforced. |
| Relational Integrity | All foreign keys are valid. |
| Ownership Integrity | All rows are owned by the correct user. |
| Business Integrity | All business rules are enforced. |
| Migration Integrity | All migrations are ordered and validated. |
| Rollback Integrity | All rollbacks are atomic and logged. |
| Deterministic | Validation is deterministic. |
| No Silent Acceptance | Invalid data is never silently accepted. |

---

## 9. Validation Verification

### 9.1 Post-Migration Checks

| Check | Description |
|-------|-------------|
| Table Exists | The table has been created. |
| Columns Correct | All columns exist with correct types and constraints. |
| RLS Enabled | RLS is enabled. |
| Policies Exist | Four policies exist. |
| Foreign Key Valid | Foreign key references the correct parent table. |
| Indexes Exist | All required indexes exist. |
| `user_id` Exists | `user_id` column exists and is NOT NULL. |
| Timestamps Exist | `created_at` and `updated_at` exist. |
| Primary Key Valid | Primary key is UUID, NOT NULL, UNIQUE. |

### 9.2 Post-All-Migrations Checks

| Check | Description |
|-------|-------------|
| All Tables Exist | All 16 tables exist. |
| No Cycles | The dependency graph is acyclic. |
| No Orphans | No orphaned rows exist. |
| Ownership Consistent | All parent-child `user_id` values match. |
| All RLS Enabled | RLS is enabled on all 16 tables. |
| All Policies Exist | All 16 tables have four policies each. |
| All Indexes Exist | All required indexes exist. |

---

## 10. Permanent Restrictions

| Restriction | Description |
|--------------|-------------|
| No Constraint Removal | No constraint is removed after migration. |
| No Constraint Weakening | No constraint is weakened after migration. |
| No RLS Disable | RLS is never disabled. |
| No Policy Removal | RLS policies are never removed. |
| No Validation Bypass | No validation is ever bypassed. |
| No Silent Acceptance | Invalid data is never silently accepted. |
| No Data Loss | Validation never destroys valid data. |

---

## 11. Document Control

| Field | Value |
|-------|-------|
| Document | Validation Rules v1.0 |
| Phase | 1.2.3 — World Layer Migration Implementation |
| Sprint | 1.2.3.1 |
| Blueprint | World Blueprint v1.0 (LOCKED) |
| Status | IN PROGRESS |
| Owner | Lead Database Architect |
| Created | 2026-08-03 |
| Last Update | 2026-08-03 — Sprint 1.2.3.1 authored. Validation rules defined. |
| Next Sprint | 1.2.3.2 — Migration implementation (SQL migrations for tables 01–04) |
