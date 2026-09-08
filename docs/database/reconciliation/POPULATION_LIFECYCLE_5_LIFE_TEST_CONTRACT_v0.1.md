# Population Lifecycle — 5-Life Test Contract v0.1

Status: TEST DESIGN / NOT PRODUCTION
Date: 2026-09-09

## Purpose

Validate the population lifecycle contract against the existing five-Life fixture before any 25-NPC expansion. Tests must run in an isolated/test world and must not mutate the production fixture.

## Fixture roles

The current five-Life fixture provides:

- three household/family-connected Village residents;
- one Village Life without a household assignment;
- one Forest Life outside the Village;
- existing schedules and AI profiles;
- relationship storage available but no current relationship rows.

The test harness must resolve actual IDs at runtime rather than hard-code Life IDs.

## Test A — Relationship prerequisite

Goal: establish that the existing social interaction path can create/evolve a relationship between two eligible Lives.

Given:
- two distinct eligible Lives;
- both exist and are addressable by the authenticated test actor.

When:
- execute the existing social interaction function.

Then:
- no self-relationship is created;
- a relationship row can be created when none exists;
- subsequent interaction can evolve the relationship;
- no duplicate relationship is produced by retrying the same logical interaction where idempotency is expected by the existing function.

This test is a prerequisite for Marriage testing; it does not declare that social strength alone should trigger marriage.

## Test B — Newcomer / Migration In

Goal: validate residence transition into the Village without duplicating membership or residence state.

Given:
- an eligible non-resident Life;
- a valid destination Village/location.

When:
- the lifecycle consequence is invoked once, then retried.

Then:
- the Life has the intended destination residence;
- household assignment follows the explicit policy;
- required family membership is not duplicated;
- repeated execution is idempotent;
- a single lifecycle history record is produced for the logical transition.

## Test C — Migration Out

Goal: validate a resident leaving the Village.

Given:
- an eligible Village resident;
- a valid destination.

When:
- migration-out consequence is invoked once, then retried.

Then:
- Village residence is closed/changed as intended;
- household/family state is resolved according to policy;
- owned/shared inventory is not orphaned;
- repeated execution does not create duplicate departure state/history.

## Test D — Marriage

Goal: validate marriage as a multi-system transition.

Given:
- two distinct eligible Lives;
- an active relationship satisfying the project's marriage eligibility rule;
- explicit household/family policy configured for the test.

When:
- marriage consequence is invoked once, then retried.

Then:
- the relationship enters the intended marriage state;
- family memberships are updated exactly once;
- household merge or residence decision is applied exactly once;
- inventory ownership/access remains resolvable;
- history records the transition exactly once;
- retry produces no duplicate marriage/family/household transition.

The test must not assume which partner moves until that policy is explicitly selected.

## Test E — Birth

Goal: validate child creation and parent linkage.

Given:
- a valid parent pair under the project's birth policy;
- a valid birth location.

When:
- birth consequence is invoked once, then retried.

Then:
- exactly one child Life is created;
- exactly one `birth_records` row links the child to the parents;
- child household/family assignment is valid;
- required Life initialization is complete;
- retry does not create a second child.

This test remains optional until demographic/birth policy is explicitly specified.

## Test F — Terminal departure/death

Goal: validate cleanup of a terminal Life transition.

Given:
- an active Life with current household/family/activity state.

When:
- terminal consequence is invoked once, then retried.

Then:
- Life status changes exactly once;
- future activity/schedule behavior is resolved according to policy;
- household/family/relationship state is closed or retained according to policy;
- inventory ownership remains valid;
- history is recorded once.

## Cross-cutting assertions

Every lifecycle test must assert:

1. no duplicate Life is created;
2. no invalid foreign keys are introduced;
3. no duplicate active membership is introduced;
4. no orphaned inventory/container ownership is introduced;
5. retrying the same logical event is safe;
6. simulation can continue after the transition;
7. history is attributable to the logical lifecycle event.

## Execution order

1. Relationship prerequisite
2. Newcomer/Migration In
3. Migration Out
4. Marriage
5. Birth (when policy is ready)
6. Terminal departure/death
7. Simulation continuation smoke test

## Pass criteria

The 5-Life lifecycle suite passes only when all required tests complete without invariant violations and the resulting state can continue through simulation ticks.

A failed test must be diagnosed before scaling the fixture to 25 Lives.

## Safety boundary

This is a test contract only. It does not add event definitions, lifecycle functions, constraints, or production data.
