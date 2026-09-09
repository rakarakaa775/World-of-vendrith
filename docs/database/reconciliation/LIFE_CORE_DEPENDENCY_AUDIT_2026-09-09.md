# Life Core Dependency Audit — 2026-09-09

## Trigger audit

The live database exposes two triggers on the audited Life core tables:

- `trg_life_attributes_updated_at` — BEFORE UPDATE on `life_attributes`, calls `set_updated_at()`.
- `trg_lives_updated_at` — BEFORE UPDATE on `lives`, calls `set_updated_at()`.

No trigger was observed on `user_lives`, `life_emotions`, `relationships`, or `social_interactions` in the audited trigger metadata.

## Function dependency audit

Verified public functions relevant to the Life → Social → Relationship path:

- `set_updated_at()` → trigger function.
- `get_life_social_targets(uuid)` → authenticated read gateway.
- `execute_social_interaction(uuid, uuid, text, timestamptz)` → authenticated mutation gateway.
- `apply_relationship_change(uuid, uuid, numeric, text, uuid, jsonb)` → internal relationship mutation primitive.
- `evolve_social_relationship(uuid, uuid, timestamptz)` → relationship evolution primitive.

## Fixture implication

The positive Test A path does not require a synthetic trigger to be created: the live schema already contains the required `updated_at` triggers for `lives` and `life_attributes`.

The test fixture should avoid unnecessary updates to those tables. If an update is required, the test should treat the trigger-managed timestamp as database-owned behavior rather than setting it manually.

No trigger behavior was inferred for tables where no trigger was observed.

## Safety

This audit is observational. No triggers, functions, tables, policies, grants, or data were modified.
