# Vandrith World — Supabase Runtime Reconciliation

**Date:** 2026-08-17  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch:** `main`

## 1. Purpose

This document records the reconciliation between the GitHub repository migration history and the current Supabase runtime implementation.

This is a reconciliation record, not a new database migration.

The existing migrations `0001` through `0005` are preserved and must not be rewritten.

---

## 2. Repository Baseline

The GitHub repository currently contains the following database migrations:

- `0001_vandrith_foundation_and_simulation.sql`
- `0002_energy_recovery_v1_0_rules.sql`
- `0003_fix_eat_food_recovery_trigger_v1_0.sql`
- `0004_energy_history_recovery_events_v1_0.sql`
- `0005_fix_energy_trigger_order_for_recovery.sql`

The repository was synchronized with `origin/main` before this reconciliation.

Working tree baseline:

- Branch: `main`
- Remote: `origin/main`
- Status: clean
- Latest baseline commit: `4dd0ee1`

---

## 3. Supabase Runtime Status

The current Supabase runtime was verified to contain the following Life/Dialogue-related tables.

### Life / Attribute

- `attribute_definitions`
- `life_attributes`

### Emotion

- `emotion_definitions`
- `life_emotions`
- `life_emotion_history`

### Dialogue

- `dialogue_conversations`
- `dialogue_nodes`
- `dialogue_lines`
- `dialogue_choices`
- `dialogue_conditions`
- `dialogue_sessions`
- `dialogue_states`
- `dialogue_history`
- `dialogue_relationships`
- `dialogue_reputations`
- `dialogue_memories`

### Relationship

- `relationships`

---

## 4. Life Engine Reconciliation

The Life Engine implementation currently exposes attribute definitions that can participate in dialogue conditions.

Relevant attributes include:

- `ambition`
- `curiosity`
- `generosity`
- `patience`
- `risk_tolerance`
- `sociability`
- `trust`
- `work_ethic`

The dialogue system can evaluate applicable Life attributes through:

`evaluate_attribute_condition(...)`

The attribute contract distinguishes dialogue-usable attributes from attributes that are not currently exposed to dialogue logic.

### Status

- Life Engine runtime: VERIFIED
- Attribute definition layer: VERIFIED
- Dialogue attribute evaluation function: VERIFIED
- Life/Dialogue runtime integration: VERIFIED
- Full 21-chapter blueprint completion: NOT VERIFIED BY THIS AUDIT

---

## 5. Emotion Reconciliation

The current runtime contains:

- emotion definitions
- current Life emotion state
- emotion history
- emotion change contract
- emotion condition evaluation

Relevant runtime functions include:

- `apply_emotion_change(...)`
- `evaluate_emotion_condition(...)`

Emotion conditions can therefore participate in dialogue choice resolution.

### Status

- Emotion state storage: VERIFIED
- Emotion history: VERIFIED
- Emotion change contract: VERIFIED
- Dialogue emotion evaluation: VERIFIED

---

## 6. Dialogue Engine Reconciliation

The current runtime contains the core Dialogue Engine structures:

### Conversation

`dialogue_conversations`

### Nodes

`dialogue_nodes`

### Lines

`dialogue_lines`

### Choices

`dialogue_choices`

### Conditions

`dialogue_conditions`

### Runtime Sessions

`dialogue_sessions`

### Runtime State

`dialogue_states`

### History

`dialogue_history`

### Relationship / Reputation / Memory context

- `dialogue_relationships`
- `dialogue_reputations`
- `dialogue_memories`

---

## 7. Dialogue Condition Resolution

The current Dialogue Engine supports condition evaluation using multiple Life-state sources.

### Attribute

Uses Life attributes such as personality tendencies.

### Relationship

Uses relationship state between Life entities.

### Emotion

Uses current emotional intensity.

The unified choice resolver is:

`resolve_dialogue_choices(...)`

The resolver evaluates available choices against the current dialogue context.

---

## 8. Dialogue Runtime

The current runtime contains:

`start_dialogue_session(...)`

and

`advance_dialogue_session(...)`

The runtime therefore has an explicit session lifecycle:

1. Start a dialogue session.
2. Resolve the current node.
3. Determine available choices.
4. Validate the selected choice.
5. Advance to the target node.
6. Complete the session when the target is terminal.

---

## 9. Personality-Driven Dialogue Contract

The design contract is that an NPC's personality/Life attributes can influence the dialogue choices available to the player. The underlying attribute-condition function is verified in Supabase; end-to-end personality-differentiated NPC dialogue behavior is not verified by this audit.

Example:

### NPC personality profile A

Available choices may resolve to:

- A
- B
- C

### NPC personality profile B

Available choices may resolve to:

- D
- E
- F

The system should therefore treat personality as a condition source rather than hard-coding a separate dialogue tree for every personality.

This keeps dialogue content data-driven.

---

## 10. Relationship Consequence Contract

The current runtime also contains:

`apply_relationship_change(...)`

This provides the canonical contract for changing an existing relationship as a consequence of gameplay/dialogue.

The function operates on an existing relationship and applies a strength delta.

Dialogue consequences should use this contract rather than directly manipulating relationship state.

---

## 11. Migration Reconciliation Policy

The GitHub migration history and Supabase migration history are currently not numerically identical.

Therefore:

- Existing GitHub migrations `0001`–`0005` are preserved.
- Supabase runtime state is treated as the current implementation reference.
- This document records the runtime state without pretending that the historical migration numbers are identical.
- No duplicate migration should be executed against the current Supabase project merely to make the numbers appear identical.
- Future database changes should be represented by new repository migrations.
- Existing migrations should not be rewritten solely for reconciliation.

---

## 12. Current Reconciliation Status

| Area | GitHub | Supabase | Status |
|---|---|---|---|
| Foundation | Present | Present | Reconciled |
| Energy | Present through `0005` | Present | Reconciled |
| Life Attributes | Documentation/blueprint | Verified runtime | Runtime ahead |
| Emotion | Partial/blueprint | Verified runtime | Runtime ahead |
| Dialogue Foundation | Blueprint/runtime work | Verified runtime | Runtime ahead |
| Dialogue Conditions | Not fully represented | Verified runtime | Runtime ahead |
| Dialogue Runtime | Not fully represented | Verified runtime | Runtime ahead |
| Relationship Change | Not represented in old migrations | Verified runtime | Runtime ahead |

---

## 13. Important Safety Note

This reconciliation file does NOT apply SQL.

It exists to make the repository aware of the current Supabase implementation before future migrations are authored.

The next database migration must be based on the actual repository state and must be replayable on a clean database.

---

## 14. Next Planned Work

After this reconciliation is committed:

1. Verify the repository diff.
2. Commit the reconciliation record.
3. Push it to GitHub.
4. Re-verify GitHub.
5. Continue Dialogue Engine work if required.
6. Only then proceed to NPC AI Engine when the Dialogue Engine contract is sufficiently stable.

