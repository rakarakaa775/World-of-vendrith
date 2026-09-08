# Supabase Migration Source Parity — 2026-09-09

## Conclusion

**Parity is NOT complete.**

The live Supabase project contains a substantially larger applied migration history than the exact SQL migration source currently committed under `supabase/migrations/`.

This is an identified repository-source gap, not evidence of a runtime database failure.

## Evidence

### Live runtime

Supabase migration ledger was inspected directly for project `ojtmfokjcirvjvhnbnos`.

Latest observed migration:

`20260831165526_register_mountain_assets_v1`

### Uploaded source/checkpoint archives

The inspected checkpoint archives contain exactly one executable Supabase migration source:

`supabase/migrations/20260908_inventory_mutation_gateways.sql`

The older handoff/source archive contains migration documentation, but `Migration_Log.md` explicitly states that no migrations had been applied and contains no executable migration chain. `Migration_Order.md` is a design/order document for 16 world-layer migrations, not SQL implementation.

Therefore those historical documents cannot be used to reconstruct the live migration SQL.

## Repository rule

- exact verified migration SQL belongs under `supabase/migrations/`;
- runtime reconciliation SQL remains under `database/reconciliation/`;
- historical migration plans remain documentation;
- missing SQL is not fabricated from migration names.

## Parity table

| Evidence | State |
|---|---|
| Live Supabase migration ledger | Extensive; through at least 20260831165526 |
| GitHub exact Supabase migration source | Partial |
| Uploaded checkpoint exact migration source | One migration |
| Historical migration plan | Documentation only |
| Safe reconstruction of missing SQL | Not available |

## Action taken

No missing migration SQL was invented or copied from assumptions.

No production database change was made.

No existing migration was renamed or rewritten.

## Next safe route

To achieve full source parity, recover the exact SQL for missing applied migrations from an authoritative source such as the original migration repository/export or another verified source snapshot. Once recovered, add them in original migration order and verify content against the authoritative source.

Until then:

- Supabase is authoritative for current runtime state.
- GitHub is authoritative for currently committed source.
- Uploaded archives are evidence of what source was actually available.
