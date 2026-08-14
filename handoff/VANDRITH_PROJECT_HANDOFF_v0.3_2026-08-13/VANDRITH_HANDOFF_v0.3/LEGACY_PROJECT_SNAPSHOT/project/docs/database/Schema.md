# Database Schema

> The Vendrith World — database schema documentation template.

## 1. Overview
_(To be defined — high-level description of the database shape once the first migration is planned.)_

## 2. Conventions
- Tables: `snake_case`, plural (`characters`, `activities`).
- Columns: `snake_case` (`created_at`, `user_id`).
- Foreign keys: `<referenced_table_singular>_id` (`character_id`).
- Timestamps: `created_at`, `updated_at` (timestamptz, default now()).

## 3. Tables
_(None defined yet. No SQL, no tables until the first persistence milestone.)_

### Table: `<name>`
- **Purpose:** _(to be defined)_
- **Columns:** _(to be defined)_
- **Foreign Keys:** _(to be defined)_
- **RLS Policies:** _(to be defined — SELECT/INSERT/UPDATE/DELETE, scoped to `authenticated`)_

## 4. Row Level Security
- RLS enabled on every table.
- Four policies per table (SELECT, INSERT, UPDATE, DELETE). Never `FOR ALL`.
- Ownership via `auth.uid()`. Never `current_user`.

## 5. Migrations
- DDL goes through migration files only.
- Migrations are ordered, named, and never edited after apply.
- See `Migration_Log.md`.

## Status
Template only. No schema exists yet.
