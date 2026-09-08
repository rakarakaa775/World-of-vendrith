# Supabase Source Map

## `migrations/`
Exact migration SQL captured for the Supabase runtime when the source is available and suitable for source control.

Current captured migration:

- `20260908_inventory_mutation_gateways.sql`

## Runtime parity

The live Supabase project contains a substantially larger migration history than this repository. Missing migration bodies are intentionally not fabricated from migration names. Use the live migration ledger as runtime evidence until exact source is recovered.

## Rule

New database changes should be added as additive migrations here with their exact SQL. Runtime-only patches belong in reconciliation records until exact migration source is available.
