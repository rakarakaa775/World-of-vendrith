# Lives / Needs / Skills Runtime Baseline — 2026-09-09

## Scope

Initial P1 runtime baseline for the Lives / Needs / Skills domain. This is a runtime inspection record, not a replacement for missing migration source.

## Runtime tables identified

- `life_identity`
- `life_attributes`
- `life_skills`
- `life_needs`
- `life_energy`
- `life_emotions`
- `life_emotion_history`
- `life_currency`
- `attribute_definitions`
- `energy_recovery_rules`
- `energy_history`
- `life_ai_profiles`
- `life_ai_goals`
- `life_ai_decisions`
- `ai_activity_need_rules`
- `activity_attribute_affinities`
- `activity_skill_affinities`
- `activity_skill_xp_awards`
- `occupation_skill_affinities`
- plus NPC seed and dialogue-related tables.

## Core runtime structure

The current schema separates life state into focused tables rather than one monolithic character table:

`life_identity`
`life_attributes`
`life_skills`
`life_needs`
`life_energy`
`life_emotions`
`life_currency`

`attribute_definitions` provides metadata for attributes, including code/name/category, numeric bounds, mutability, dialogue usability, AI usability, and active state.

`life_needs` includes current/target values and simulation time, while `life_energy` tracks current/max energy, fatigue, and state.

## Source parity

The runtime structure is verified, but the exact current migration chain creating these objects is not yet recovered from the available repository/archive evidence.

Therefore these objects remain **runtime evidence / source-recovery targets**.

## Test-data implication

The project intentionally begins with a minimal world and a single village for incremental simulation testing. The existence of only a small amount of world data is therefore not treated as a missing-content defect.

Likewise, runtime table existence does not imply that a full population fixture should be created at this stage.

## Safety decision

Do not seed additional lives/NPCs merely to make the tables appear populated. Test fixtures should be introduced only when the E2E test plan requires them.

No production data or schema was modified by this baseline audit.
