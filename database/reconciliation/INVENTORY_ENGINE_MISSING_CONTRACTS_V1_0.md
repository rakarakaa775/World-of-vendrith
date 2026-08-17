# Vandrith World — Inventory Engine Missing Contracts v1.0

**Date:** 2026-08-17
**Repository:** `rakarakaa775/World-of-vendrith`
**Branch:** `main`

## 1. Purpose

This document records Inventory Engine runtime contracts that were identified as missing or not yet verified during Supabase runtime reconciliation.

This document is a design and audit record.

It does NOT apply SQL and does NOT modify the existing database schema.

Existing migrations must not be rewritten solely to satisfy this audit.

---

## 2. Verified Inventory Foundation

The current Supabase runtime contains the following Inventory-related structures:

- `items`
- `item_instances`
- `containers`
- `inventory_entries`
- `inventory_aggregates`
- `inventory_consumptions`
- `inventory_transfers`

Verified runtime contracts include:

- `consume_inventory_item(...)`
- `transfer_inventory(...)`
- `transfer_inventory_instance(...)`
- `execute_eat_activity_inventory(...)`
- `complete_eat_activity_with_inventory(...)`

---

## 3. Existing Verified Rules

### Item Definition

Items expose:

- `stackable`
- `max_stack_size`
- `base_weight`
- `base_durability`
- `base_value`

### Quantity

Inventory quantities are constrained to positive values.

### Containers

Containers expose:

- capacity
- owner information
- container type
- access mode
- lock/status information

### Inventory Aggregate

`inventory_aggregates` provides aggregate state including:

- total weight
- used capacity

Non-negative constraints are present for aggregate values.

### Consumption

Inventory consumption has been runtime-tested successfully.

The tested lifecycle was:

1. Inventory entry exists.
2. Item is consumed.
3. Inventory entry is removed.
4. Item instance lifecycle becomes consumed.
5. Consumption history is recorded.
6. Temporary test fixtures are removed.

Status: VERIFIED.

---

## 4. Missing Contract — Add Item

A canonical Inventory Engine operation should exist for adding an item to a container.

Conceptual contract:

`add_inventory_item(...)`

Responsibilities:

1. Validate item existence.
2. Validate destination container.
3. Validate ownership/access rules.
4. Validate item lifecycle.
5. Validate quantity.
6. Resolve stack behavior.
7. Enforce `max_stack_size`.
8. Validate capacity.
9. Create or update the appropriate inventory entry.
10. Synchronize inventory aggregate state.
11. Return a deterministic success or rejection result.

The canonical add-item operation should become the preferred entry point for gameplay systems.

---

## 5. Missing Contract — Stack Merge

Stackable items should use deterministic merge behavior.

Conceptual rules:

1. Identify compatible entries within the same container.
2. Determine remaining stack capacity.
3. Merge quantity into existing stacks where possible.
4. Create additional entries only when necessary.
5. Never exceed `max_stack_size`.
6. Preserve item-instance semantics where the item is instance-based.
7. Return the final quantity placement.

The exact implementation must be determined from the repository/runtime contract before migration work begins.

---

## 6. Missing Contract — Stack Limit Enforcement

`items.max_stack_size` exists, but runtime enforcement has not yet been verified.

The Inventory Engine must guarantee:

`quantity <= max_stack_size`

for every applicable stack entry.

This rule must be enforced by the canonical add/transfer path rather than relying on NPC AI or client code.

Status: NOT VERIFIED.

---

## 7. Missing Contract — Weight Calculation

The Inventory Engine must define how item weight is calculated.

The calculation should distinguish between:

- base item weight
- quantity
- instance-specific weight when applicable

Conceptual result:

`entry_weight = item_weight × quantity`

The final formula must respect any instance-specific rules defined by the repository/runtime.

Status: NOT VERIFIED.

---

## 8. Missing Contract — Capacity Validation

Before adding or moving items into a container, the Inventory Engine should validate:

1. Current used capacity.
2. Incoming item weight/capacity contribution.
3. Container capacity.
4. Resulting total usage.

The operation must reject the transaction when the destination cannot accommodate the item.

NPC AI must never implement this calculation independently.

Status: NOT VERIFIED.

---

## 9. Missing Contract — Aggregate Synchronization

`inventory_aggregates` exists as a runtime structure, but automatic synchronization after inventory mutation has not yet been verified.

The canonical Inventory Engine should define how:

- item addition
- item removal
- quantity change
- transfer
- consumption

update aggregate state.

The aggregate must remain consistent with the underlying inventory entries.

Status: NOT VERIFIED.

---

## 10. Missing Contract — Transfer Integration

Transfer functions already exist:

- `transfer_inventory(...)`
- `transfer_inventory_instance(...)`

However, complete runtime verification is still pending.

Transfer behavior must preserve:

- source inventory correctness
- destination inventory correctness
- quantity correctness
- stack rules
- capacity rules
- ownership/access rules
- transfer history

Status: CONTRACT VERIFIED / RUNTIME TEST PENDING.

---

## 11. NPC AI Dependency Contract

NPC AI must not directly manipulate:

- `inventory_entries`
- `item_instances`
- `inventory_aggregates`

Instead:

NPC AI should request an Inventory Engine operation.

Example:

NPC AI:

`"Take 5 food items."`

Inventory Engine:

1. Validate request.
2. Validate item.
3. Validate stack.
4. Validate capacity.
5. Perform mutation.
6. Return success/rejection.
7. Provide resulting inventory state.

This keeps Inventory Engine as the authoritative source of inventory state.

---

## 12. Required Runtime Tests

Before Inventory Engine v1.0 is considered stable, the following tests should be completed:

1. Add item test.
2. Stack merge test.
3. Maximum stack limit test.
4. Capacity rejection test.
5. Capacity success test.
6. Aggregate synchronization test.
7. Transfer stack test.
8. Transfer instance test.
9. Consumption regression test.
10. Activity ↔ Inventory integration test.
11. Equipment test.
12. Durability test.

All temporary fixtures must be removed after testing.

---

## 13. Migration Safety Policy

No migration should be created solely because a runtime structure exists in Supabase.

A new migration should only be created when:

1. The required contract is confirmed.
2. The repository implementation is defined.
3. The migration is replayable on a clean database.
4. Existing migrations do not need to be rewritten.
5. The migration does not duplicate already-applied runtime structures.

---

## 14. Current Status

| Contract | Status |
|---|---|
| Item Definition | VERIFIED |
| Item Instance | VERIFIED |
| Container | VERIFIED |
| Inventory Entry | VERIFIED |
| Consumption | VERIFIED / TEST PASS |
| Consumption History | VERIFIED / TEST PASS |
| Transfer Contract | VERIFIED |
| Add Item | MISSING |
| Stack Merge | NOT VERIFIED |
| Max Stack Enforcement | NOT VERIFIED |
| Weight Calculation | NOT VERIFIED |
| Capacity Validation | NOT VERIFIED |
| Aggregate Synchronization | NOT VERIFIED |
| Transfer Runtime | TEST PENDING |
| Equipment | NOT VERIFIED |
| Durability | NOT VERIFIED |
| Activity Integration | PARTIAL |

---

## 15. Next Work

The next implementation phase is:

1. Define the canonical add-item contract.
2. Define stack merge behavior.
3. Define capacity and weight rules.
4. Define aggregate synchronization.
5. Implement only the required runtime changes.
6. Test with temporary fixtures.
7. Verify transfer behavior.
8. Verify Activity ↔ Inventory integration.
9. Reconcile the resulting implementation with GitHub.
10. Finalize Inventory Engine v1.0.

Only after these contracts are sufficiently stable should Inventory become a dependency for NPC AI Engine.

---

## 16. Safety Note

This document is an audit/design record only.

No SQL is applied by this document.

The existing GitHub migration history must remain preserved.

Future migrations must be based on the finalized runtime contract and must be replayable on a clean database.
