# Test Environment Blocker — 2026-09-09

## Verified state

The connected Supabase project is the production reference and remains untouched by lifecycle testing.

The project exposes 219 public routines in the current runtime schema. The connected development branch previously reported `MIGRATIONS_FAILED`, and creating a new Supabase development branch is unavailable on the current plan.

## Test consequence

The executable Test A runner is intentionally blocked from the production hostname. Therefore the positive lifecycle mutation test cannot be honestly reported as passed from the current environment.

## Required environment

One of the following is required before execution:

1. a separately provisioned non-production Supabase project with a schema equivalent to the audited runtime contract; or
2. a plan/environment that permits a disposable Supabase branch, after confirming cost and provisioning health.

The existing failed development branch should not be treated as an execution target until its migration failure is diagnosed and the schema is verified healthy.

## Exit criteria

Test A can move from `BLOCKED` to `EXECUTABLE` when:

- target hostname is not the protected production project;
- authentication test user exists;
- fixture setup credential exists for that non-production target;
- required Life Core tables/functions are present;
- gateway call succeeds through an authenticated client;
- teardown succeeds.

## Safety

This document records an environment blocker only. No production data, schema, grants, policies, functions, or migration ledger entries were modified.
