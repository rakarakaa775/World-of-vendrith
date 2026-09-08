# RUNTIME MUTATION-CHAIN AUDIT — 2026-09-09

## Scope

Read-only audit of the current Supabase runtime for:

Simulation Tick → Time Events → Activity → Inventory → Needs/Energy → Skill XP → History/Audit.

Supabase project: `The world Vendrith`
Project ref: `ojtmfokjcirvjvhnbnos`

## Results

### Simulation

- Simulation clock locking: PASS
- World isolation: PASS
- Pause protection: PASS
- Tick orchestration: PASS
- Client direct execution: blocked

### Time Events

- Authoritative simulation time: PASS
- Atomic event claim: PASS
- `FOR UPDATE SKIP LOCKED`: PASS
- Execution ledger: PASS
- Condition validation: PASS
- Consequence execution: PASS
- Failure handling: PASS
- Retry limit/delay: PASS
- Recurrence: PASS
- Recurrence definition validation: PASS
- Event chain validation: PASS
- Client direct execution: blocked

### Activity

- Planning: PASS
- AI decision binding: PASS
- Completion gating: PASS
- Interruption/cancellation: PASS
- Reevaluation: PASS
- Activity → Energy: PASS
- Activity → Needs: PASS
- Activity → Food: PASS
- Activity → Skill XP: PASS
- XP idempotency: PASS

### Inventory / Durability

- Inventory consume: PASS
- Inventory transfer: PASS
- Container authorization: PASS
- Container locking: PASS
- Consumption history: PASS
- Eat → Energy/Hunger: PASS
- Durability damage: PASS
- Durability repair: PASS
- Durability history: PASS

### History / Audit Ledger

- Specialized history tables: PASS
- RLS enabled: PASS
- Client INSERT: blocked
- Client UPDATE: blocked
- Client DELETE: blocked
- Engine history recording: PASS
- Ledger immutability boundary: PASS

## Runtime forensic check

Current Activity records inspected:

- completed: 57
- running: 5
- planned: 2
- scheduled: 3
- cancelled: 1
- total: 68

Consistency findings:

- orphan actor: 0
- orphan activity definition: 0
- duplicate XP keys: 0
- cancelled activity XP awards: 0
- cancelled activity food consumptions: 0

The single cancelled activity has `cancelled_at` and reason `regression_test`, with no XP or food consumption. This is consistent with the cancellation lifecycle.

## Known technical debt / follow-up

1. `grant_activity_skill_experience()` is a legacy/other path without its own idempotency guard. The audited completion path uses the idempotent award ledger.
2. `vandrith_simulation_tick()` contains a redundant scheduled→running processing block. This is cleanup, not a confirmed production defect.
3. Fresh end-to-end actor testing is currently blocked because the runtime has no `user_lives` fixture available. No production fixture was inserted merely to obtain a test PASS.

## Decision

No production schema/function patch was applied from this audit.

The findings above are runtime evidence and should not be interpreted as proof that every historical/source migration is present in GitHub.
