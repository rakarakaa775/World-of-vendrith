# Population Lifecycle Contract v0.1

Status: DESIGN / NOT PRODUCTION
Date: 2026-09-09

## Purpose

Define the minimum state-transition contract for population lifecycle events using the existing Vandrith runtime primitives. This document is a design contract, not an implementation migration.

## Shared event envelope

Every lifecycle event should be represented by the existing time-event infrastructure and carry:

- `event_type`
- `world_id`
- `scheduled_time`
- deterministic/idempotency key
- actor/subject Life IDs as applicable
- payload containing only event-specific inputs
- cause/source metadata

Every consequence must be safe to retry without duplicating Life, household membership, relationship, inventory transfer, or history.

## 1. Newcomer Arrival

Trigger: an external/temporary Life becomes a resident candidate for a village.

Conditions:
- target settlement exists and is active;
- Life exists and is eligible to enter;
- destination location is valid;
- admission rule passes.

Consequences:
- assign destination location;
- create or assign household when required;
- establish required family membership only when appropriate;
- preserve/create employment and schedule according to the newcomer template;
- record lifecycle history.

Must not duplicate an existing resident transition.

## 2. Migration In

Trigger: a Life changes settlement/residence into the village.

Conditions:
- source and destination are valid;
- Life is eligible to move;
- destination capacity/admission policy passes;
- no identical migration transition is already applied.

Consequences:
- update residence/location;
- update household membership as required;
- preserve or update schedule/activity context;
- record migration history.

## 3. Migration Out

Trigger: a resident leaves the village.

Conditions:
- Life is an eligible current resident;
- destination is valid;
- no duplicate departure transition exists.

Consequences:
- remove/close village residence assignment;
- close or transfer household membership as appropriate;
- update location;
- resolve household/container ownership before departure;
- record migration history.

## 4. Marriage

Trigger: two compatible Lives reach a marriage decision.

Conditions:
- both Lives exist and are eligible;
- a valid active relationship exists;
- marriage has not already been applied to this pair;
- family/household policy allows the transition.

Consequences:
- record marriage relationship state;
- update family memberships;
- perform household merge or residence decision according to explicit policy;
- resolve household/shared inventory ownership where applicable;
- record history.

The contract deliberately does not prescribe which partner moves until the project's household policy is explicitly established.

## 5. Birth

Trigger: simulation determines that a birth occurs.

Conditions:
- valid parent pair when applicable;
- birth event has not already been applied;
- destination settlement/location is valid.

Consequences:
- create exactly one child Life;
- create `birth_records` entry;
- assign child to appropriate household/family;
- initialize required Life components;
- record history.

The exact demographic/age/sex generation policy remains a separate design decision.

## 6. Departure / Death

Trigger: Life reaches a terminal departure condition.

Conditions:
- Life is currently alive/active as appropriate;
- terminal transition has not already been applied.

Consequences:
- transition Life status;
- close active relationships/memberships where required;
- resolve household and inventory ownership;
- stop future activities/schedules as required;
- record terminal history.

## Explicit non-goals

This contract does not define:

- demographic probabilities;
- romance probability;
- exact marriage eligibility rules;
- household merge winner;
- migration capacity numbers;
- newborn sex/trait probabilities;
- population cap enforcement;
- AI goal generation.

Those require source-backed design decisions before implementation.

## Implementation boundary

Use the existing `time_events` / `event_definitions` infrastructure. Do not introduce a second event scheduler.

Implement lifecycle consequences through narrowly scoped functions with explicit idempotency checks. Prefer existing `relationships`, `family_memberships`, `households`, `lives`, `birth_records`, location, inventory, activity, and history primitives.

## Test sequence

1. unit-level consequence tests;
2. isolated 5-Life lifecycle tests;
3. isolated 25-NPC stress test;
4. only after PASS, consider permanent 75-NPC village seeding.

No production data or schema is changed by this document.
