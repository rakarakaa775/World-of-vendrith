# Supabase Runtime Reconciliation — 2026-09-08

Project: The world Vendrith  
Ref: `ojtmfokjcirvjvhnbnos`

## Verified

Supabase was checked before packaging this checkpoint. The latest observed migration history begins at `20260831165526`.

### Inventory

Captured exactly in `supabase/migrations/20260908_inventory_mutation_gateways.sql`:

- `add_inventory_item_authorized`
- `consume_inventory_item_authorized`
- `transfer_inventory_authorized`
- `transfer_inventory_instance_authorized`
- `apply_item_durability_damage`
- `repair_item_instance`

The gateways bind `auth.uid()` to the actor life and validate container authorization before reaching protected core mutations. Anonymous/public EXECUTE is revoked for these gateways; authenticated EXECUTE is granted.

### Editor

Editor ownership/security hardening is present in the live Supabase runtime. The exact SQL source for those patches is not present in the uploaded checkpoint source tree, so this checkpoint records the runtime state without fabricating a migration.

### Testing

Inventory E2E lifecycle remains pending because the runtime has no suitable `user_lives` test actor. No production fixture was fabricated.

## Repository rule

Future database changes must be captured as additive migrations in `supabase/migrations/`. Runtime-only changes must not be represented as source-controlled migrations until their exact SQL is available.
