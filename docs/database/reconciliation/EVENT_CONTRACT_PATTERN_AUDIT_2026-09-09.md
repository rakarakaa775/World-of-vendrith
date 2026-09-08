# Event Contract Pattern Audit — 2026-09-09

## Verified pattern

`event_definitions` uses a generic contract:

- `event_type`
- `condition_type`
- `consequence_type`
- `condition_config` JSONB
- `consequence_config` JSONB
- `enabled`

The two currently registered definitions demonstrate a condition → consequence pattern.

### world_pause

Condition:
`world_status` with `expected_status = active`

Consequence:
`world_status` with `target_status = paused`

### world_resume

Condition:
`world_status` with `expected_status = paused`

Consequence:
`world_status` with `target_status = active`

## Time-event execution contract

`time_events` provides the runtime envelope around an event definition:

- world scope;
- event type;
- scheduled time;
- status;
- payload;
- priority;
- optional recurrence;
- optional chain metadata;
- retry policy.

`event_executions` records claim/execution status and errors.

## Current runtime state

At the time of this audit there are no rows in `time_events` and no rows in `event_executions`.

Therefore the infrastructure is present, but there is no live queued event workload to use as an execution example.

## Lifecycle event design implication

For future population lifecycle events, preserve the same generic pattern rather than introducing bespoke scheduling tables. Candidate event types can be represented as definitions plus payload-driven time events.

However, the exact condition/consequence types for marriage, migration, newcomer arrival, and birth are **not established by the current runtime catalog**. They must be specified from the project's design before implementation.

## Safe next step

Create a source-backed lifecycle event specification first. Do not insert new event definitions into production until their payload, condition, consequence, affected entities, idempotency key, and history behavior are agreed and tested.

No production data or schema was modified.
