# NPC / Life Automatic Seeding Discovery — 2026-09-09

## Confirmed name

The runtime contains the function:

`public.seed_npc_from_catalog(p_seed_key text) → uuid`

This is the automatic Life/NPC creation mechanism we were looking for.

## How it works

The function reads an active row from `npc_seed_catalog`, then creates a Life and initializes its related state from catalog JSON:

`npc_seed_catalog`
→ `lives`
→ `life_identity`
→ `life_ai_profiles`
→ `life_attributes`
→ `life_needs`
→ `life_skills`
→ optional `employment`
→ `npc_seed_runs`
→ `npc_seed_entries`

It also resolves the configured `location_name`, optional household, and optional occupation.

If the seed was already materialized, the function returns the latest existing Life instead of creating a duplicate. This provides deterministic/idempotent seed behavior for the same seed key.

## Current catalog

Five active test seeds exist:

- `CRESCENT-MOON-TEST-001` — Aldren Vale — Crescent Moon Village — NPC-FARMER — AI-WORKER
- `CRESCENT-MOON-TEST-002` — Elira Vale — Crescent Moon Village — NPC-FARMER — AI-FAMILY
- `CRESCENT-MOON-TEST-003` — Tomas Vale — Crescent Moon Village — NPC-CHILD — AI-CHILD
- `CRESCENT-MOON-TEST-004` — Bram Stone — Crescent Moon Village — NPC-MINER — AI-WORKER
- `CRESCENT-MOON-TEST-005` — Mira Ashwood — Crescent Forest — NPC-HEALER — AI-CAREGIVER

Each seed carries a deterministic seed marker in metadata.

## Important distinction

This mechanism is **seed/catalog driven**, not yet proven to be a population auto-scaler that creates 75–100 residents automatically.

Therefore:

- `seed_npc_from_catalog` = confirmed Life/NPC materialization mechanism.
- automatic Village population target 75–100 = project design requirement, not yet proven to be implemented by this function.
- migration/newcomer/marriage population flow = separate lifecycle system to audit.

## Decision

We have found the name of the previously remembered automatic Life system: **NPC seed catalog + `seed_npc_from_catalog`**.

No new NPCs were seeded during this audit.

No production schema or data was modified.
