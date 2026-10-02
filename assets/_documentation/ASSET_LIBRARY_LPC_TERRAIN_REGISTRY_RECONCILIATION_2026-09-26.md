# Asset Library — LPC Terrains Registry Reconciliation — 2026-09-26

## Result

The repository contains exactly 59 `lpc_terrain__*.png` files under `assets/world/world/02_TILES_AND_TERRAIN/`.

All 59 now have Asset Library registry records in Supabase.

## Provenance boundary

Source family: [LPC] Terrains  
https://opengameart.org/content/lpc-terrains  
CC-BY-SA 4.0 / CC-BY-SA 3.0 as applicable to the source package. Complete attribution from CREDITS-terrain.txt is required.

The license/source record is verified at the source-family level. This does not verify that every repository binary is byte-identical to the source package.

All 59 newly reconciled registry records therefore remain:

- `status = pending`
- `binary_verification_status = pending`

No checksum was invented.

## Water bindings

22 water-related records were populated in `world_water_bindings` as `candidate`:

- open water
- deep water
- brackish water
- cold water
- coastal/shallow shoreline transitions
- cold/snow water transitions

## Transition bindings

30 transition records were populated in `world_transition_bindings` as `candidate`.

They cover cold water/grass, cold water/sand/red sand, cold water/snow, coastal/shallow water/grass/sand/red sand, snow/cold water, snow/water, ice/grass/sand/red sand/snow, snow/ice, grass/grass variant, sand/red sand, hole/grass, and lava/grass.

No duplicate transition key was detected in verification.

## Important distinction

Classification and semantic binding are not approval.

The next verification stage must compute/check the actual repository binaries and reconcile SHA-256 identity before any of these records are promoted from pending/candidate to verified.

## Live verification

- LPC terrain registry: **59**
- pending binary registry: **59**
- water bindings: **22**
- transition bindings: **30**
- duplicate transition keys: **0**

## Repository migration

`supabase/migrations/20260926103000_asset_library_lpc_terrain_registry_reconciliation_v1.sql`

Commit: `a200028fa250239aace9b6e0c2ca73329ee03294`
