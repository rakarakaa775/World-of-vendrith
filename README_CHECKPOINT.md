# VANDRITH PROJECT CHECKPOINT — 2026-09

Checkpoint baseline prepared from the uploaded project sources.

## Scope

Included:
- `Vendrith World Simulation.zip` as the primary uploaded project/source snapshot.
- `VANDRITH_PROJECT_HANDOFF_v0.3_2026-08-13.zip` as an explicit historical source archive.
- Existing documentation, blueprints, project snapshot, and source artifacts contained in those uploads.
- Checkpoint metadata describing the current Supabase runtime baseline.

Intentionally NOT included:
- Game Master Asset package — maintained in GitHub separately.
- LPC Asset Library package — maintained in GitHub separately.
- Newly reconstructed SQL migrations — no SQL migration files were present in the uploaded World Simulation ZIP, so none are fabricated here.

## Important source status

The uploaded `Vendrith World Simulation.zip` contains a historical `VANDRITH_HANDOFF_v0.3` package and its legacy project snapshot. It also contains the handoff/audit documentation needed to understand the historical state.

The historical handoff states that its database/engine implementation was not yet complete. This checkpoint does NOT silently replace those historical statements with reconstructed implementation claims.

The current Supabase runtime was separately inspected on 2026-09-07 and is substantially newer than the August 13 handoff. Therefore:

**Supabase runtime state is the current runtime reference; the uploaded source packages are the source/documentation archive.**

## Supabase runtime reference

Project: `The world Vendrith`
Project ref: `ojtmfokjcirvjvhnbnos`
Region: `ap-northeast-1`
Database: PostgreSQL 17
Runtime status: ACTIVE_HEALTHY

Migration history was queried directly from Supabase on 2026-09-07. The latest migration observed is:

`20260831165526_register_mountain_assets_v1`

The full migration SQL history is NOT embedded in this checkpoint because the uploaded source snapshot contains no `.sql` migration files. Do not treat the historical migration documentation as a complete copy of the current Supabase database.

## Asset policy

Game Master assets and LPC asset library are intentionally external to this checkpoint and remain managed in the existing GitHub repository.

## Recommended repository use

This checkpoint should be treated as a recovery/baseline archive for:
1. project documentation,
2. world-simulation source snapshot,
3. historical handoff material,
4. reconciliation reference against current Supabase.

It should not be treated as a claim that the uploaded source tree exactly reproduces the current Supabase schema.