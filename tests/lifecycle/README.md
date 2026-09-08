# Vandrith Lifecycle Test Harness

## Purpose

This directory defines the safe integration-test boundary for population lifecycle work. Tests must execute against an authenticated test user and disposable fixture data, never the production five-Life fixture.

## Current status

The repository currently does not contain an existing Supabase Auth test client or Edge Function harness. This first artifact therefore specifies the harness contract without pretending that executable tests already exist.

## Test flow

1. Provision a disposable Supabase test environment.
2. Create/sign in a dedicated test user through normal Supabase Auth.
3. Create two fixture Lives and corresponding `user_lives` ownership rows.
4. Execute the existing `execute_social_interaction()` RPC as the authenticated user.
5. Assert the expected interaction/relationship changes.
6. Repeat only the logical lifecycle operation whose idempotency is being tested.
7. Remove the disposable fixture or destroy the test environment.

## Safety rules

- Never disable authentication or RLS for the test.
- Never modify the production five-Life fixture merely to make a test pass.
- Never assume a social interaction is idempotent.
- Lifecycle-event idempotency must be tested separately from social-interaction behavior.
- Record before/after counts for `social_interactions` and `relationships`.

## First executable target

Test A from `docs/database/reconciliation/POPULATION_LIFECYCLE_5_LIFE_TEST_CONTRACT_v0.1.md`.

The executable implementation should be added only after the repository has a valid Supabase client/test configuration and a disposable database target.

## Required environment configuration

The eventual harness should receive test-only configuration through environment variables. Secrets must not be committed to GitHub.

No database schema or production data is changed by this specification.
