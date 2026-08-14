# Vandrith World

Vandrith World — Land of the Fate.

This repository is the development source of truth for the Vandrith World project.

## Repository Structure

- `database/` — active database specifications, migrations, and validation artifacts.
- `handoff/` — preserved project handoff and legacy project documentation.
- `archive/` — immutable project package/checkpoint archives.
- `README.md` — repository entry point.

## Database Status

Current database implementation checkpoint:

- Table Specification: v0.1
- SQL Migration: `0001_vandrith_foundation_and_simulation.sql`
- D47 Static Validation: PASS
- D48 SQL Validation: PASS
- Live Supabase execution: pending

## Important

The files under `database/` are the active implementation artifacts.

The files under `handoff/` are preserved historical/project-context documents and should not be modified casually.

The archive contains the complete project package used to establish this repository checkpoint.

## Development Rule

Do not recreate the database schema or ERD from scratch when an existing authoritative artifact already exists.

Changes must be made deliberately and recorded through Git history.
