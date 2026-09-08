# Time Event / Lifecycle Audit — 2026-09-09

## Finding

The runtime has a generic, persistent time-event execution engine.

Core tables:

- `time_events`
- `event_executions`
- `event_definitions`
- `history_events`

Core functions include:

- `claim_due_time_events`
- `dispatch_due_time_events`
- `execute_time_event`
- `complete_time_event`
- `fail_time_event`
- `retry_time_event`
- `apply_time_event_consequence`
- `record_time_event_history`
- `recover_stale_time_events`

`time_events` supports scheduled time, payload, priority, recurrence, chaining, retry count, retry delay, and maximum retries.

## Current registered definitions

The current `event_definitions` table contains only:

- `world_pause`
- `world_resume`

Therefore the generic event engine exists, but Marriage, Migration, Newcomer Arrival, and Birth are NOT currently registered as event definitions based on the live catalog query.

## Important distinction

This means we should not claim that the population lifecycle is already event-driven merely because the generic event engine exists.

The engine is a reusable foundation. Population lifecycle event types still need to be explicitly defined and wired to consequences if that is the intended design.

## Consequence for next phase

The next safe design task is to specify lifecycle event contracts without immediately changing production:

- newcomer_arrival
- migration_in
- migration_out
- marriage
- birth
- death/departure as appropriate

For each event, define payload, condition, consequence, affected Life(s), location/household changes, relationship/family changes, history record, and idempotency behavior.

No production data or schema was modified by this audit.
