# NPC Population Invariant Audit — 2026-09-09

## Scope

Review structural database constraints relevant to scaling the current Life fixture toward a 25-NPC isolated stress test.

## Verified protections

### Life

- Primary key on `lives.id`.
- Foreign keys from `lives.location_id` to `locations.id` and `lives.household_id` to `households.id`.
- Status/death-date checks exist.

### Relationships

- Primary key on `relationships.id`.
- Both endpoints have foreign keys to `lives.id`.
- A database check prevents the two relationship endpoints from being the same Life.

### Family memberships

- Primary key on `family_memberships.id`.
- `life_id` and `family_id` are foreign keys.
- Required columns are protected by NOT NULL checks.

### Schedules

- Primary key on `schedules.id`.
- `life_id` is a foreign key.
- Schedule entries reference both their schedule and an activity definition.
- Start/end minute checks exist.

### Inventory

- Containers reference their owning Life through `owner_life_id`.
- Inventory aggregates have `life_id` as their primary key and foreign key.
- Inventory entries reference containers and item/item-instance records.
- Quantity, capacity, and weight checks exist.
- A unique constraint exists for the inventory-entry identity combination.

## Gaps / limitations

The current constraint audit does NOT establish:

- one active household per Life;
- one active family membership per Life;
- uniqueness of a relationship pair independent of direction;
- schedule overlap prevention;
- mandatory inventory container for every Life;
- population-cap enforcement;
- village residency invariants;
- migration/marriage event idempotency.

These may be enforced by application functions/triggers rather than table constraints, so absence here is not automatically a defect.

## Current data signal

The runtime currently has only two containers with an owning Life, while five Lives exist. This confirms that not every Life currently has a personally owned container, which may be intentional.

## Stress-test decision

Do not add broad database constraints merely to make the 25-NPC test pass. First identify which invariants are intended business rules and where the existing runtime enforces them.

Next audit target: triggers/functions that enforce lifecycle and integrity rules, followed by isolated 25-NPC test execution.

No production data or schema was modified.
