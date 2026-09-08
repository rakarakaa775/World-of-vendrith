# Runtime ↔ Repository Coverage Matrix — 2026-09-09

## Scope

This matrix compares the current live Supabase runtime with the source-controlled GitHub repository. It is a coverage assessment, not a claim that missing source can be reconstructed.

## Runtime inventory

Direct runtime inspection found:

- 178 public base tables
- 219 public routines
- 59 public triggers
- 152 public RLS policies

The runtime contains the audited mutation-chain functions, including simulation tick, time-event execution, activity lifecycle, inventory mutation, durability, skill XP, and history recording routines.

## Repository coverage

| Runtime area | Live runtime | Exact source in GitHub | Coverage |
|---|---|---|---|
| Foundation / simulation | Present | Historical database migration 0001 exists | Partial |
| Energy recovery | Present | database migrations 0002–0005 exist | Partial |
| Inventory mutation gateways | Present | supabase/migrations/20260908_inventory_mutation_gateways.sql | Exact captured source |
| Time-event engine | Present | No complete current migration chain source identified | Runtime-only/partial |
| Activity engine | Present | No complete current migration chain source identified | Runtime-only/partial |
| Inventory engine | Present | Gateway source exists; full runtime implementation not fully mirrored | Partial |
| Durability | Present | No complete current migration chain source identified | Runtime-only/partial |
| Skill XP | Present | No complete current migration chain source identified | Runtime-only/partial |
| History/Audit | Present | Historical package contains design/history material; current runtime source not fully mirrored | Partial |
| RLS policies | 152 policies | Not fully represented as exact current migration source | Runtime-only/partial |
| Triggers | 59 triggers | Not fully represented as exact current migration source | Runtime-only/partial |

## Important distinction

A runtime object being present does not mean its exact SQL source is present in GitHub. An older repository migration with a similarly named object does not prove that it matches the current runtime definition.

Safe classifications:

- Exact — exact SQL is captured and identified.
- Partial — some source exists, but not the complete current runtime definition.
- Runtime-only/partial — runtime object is verified, but complete current SQL source is not captured.
- Historical — source describes an earlier design/state and is not current runtime source.

## Current high-value gap

The largest source-control gap is the current Supabase migration chain between the historical repository migrations and the live runtime migration ledger.

The live runtime has migrations through at least 20260831165526_register_mountain_assets_v1, while GitHub currently has one exact migration under supabase/migrations/: 20260908_inventory_mutation_gateways.sql.

## No automatic remediation

No SQL was generated from runtime metadata. No runtime function was dumped and converted into a fake migration. No production database change was made.

## Recommended recovery order

1. Recover the authoritative missing migration SQL.
2. Preserve original migration timestamps/order.
3. Compare recovered definitions against the live runtime.
4. Commit exact source under supabase/migrations/.
5. Only then mark runtime/repository coverage as exact.
6. Add automated parity checks so future runtime changes cannot silently diverge from GitHub.

## Current verdict

Runtime health: PASS for the audited mutation chain.

Repository source parity: INCOMPLETE.

This is a documentation/source-recovery issue, not a confirmed runtime defect.
