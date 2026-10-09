# Game Save v2 — Save Slot RPC Contract Audit

Status: source audit only. No SQL or production database changes.

## Scope and source

Reviewed the repository's `main` version of `supabase/migrations/20260915220000_map_editor_save_slot_rpc_v1.sql` as the available RPC contract source, alongside the active Save Slot caller in `apps/map-editor/components/vendrith-world-builder-app.tsx`. The migration file was not present at that path on `feat/vendrith-ecc-v1` during this audit, so this is not proof of the live deployed function definition.

## What the RPC actually validates

The save RPC checks:

- authenticated user exists;
- slot number is between 1 and 12;
- requested map belongs to the authenticated user;
- snapshot is non-null JSON object;
- version number is positive;
- the referenced `map_versions` row matches map ID, version ID, version number, and user.

It then stores the supplied `p_snapshot` independently from the referenced version row. It does not inspect the nested Game Save schema/version, parse nested map documents, validate world/exterior map types, or prove the supplied snapshot equals the referenced version snapshot.

The load RPC checks authentication and map ownership, then returns the stored snapshot and version metadata. It does not revalidate the nested snapshot or verify that the stored version reference and snapshot remain consistent.

## Implications for terrain semantics v2

1. JSONB object acceptance is not sufficient to guarantee that a Game Save v2 envelope is valid.
2. The v1 RPC signature can physically accept a v2 object, but the active frontend consumer still assumes the v1 nested MapDocument shape. Therefore, v2 must not be enabled merely because JSONB can store it.
3. The world version reference is metadata for the authoritative world version; it does not currently prove that the embedded world document is identical to that version snapshot.
4. The v2 adapter validates the world/exterior pair's map types and semantics format, but caller-level identity checks against the authoritative world ID still need to be preserved.
5. A robust future contract must choose and document one invariant: either the Save Slot snapshot must exactly match the referenced world version, or the slot envelope is an independent combined game save and the version reference is explicitly only a concurrency/provenance anchor. The current implementation does not enforce either equality invariant.

## Integration gates

- Keep active Save/Load on v1 until the editor can own and restore world/exterior `MapEditorState` atomically.
- Add a pure frontend boundary that parses the whole save, checks authoritative world ID, checks exterior type and `playableSpace === "exterior"`, and returns no partial result on failure.
- Preserve existing slot ownership, version ID/number and RPC error handling.
- Decide whether an RPC versioned contract is needed only after the frontend adapter and tests are stable.
- Any SQL change must be a separately reviewed migration; do not edit or apply production DB changes as part of this audit.
- Verify the actual deployed function definition before relying on repository migration source as a production guarantee.

## Verification

Static source review only. No tests, typecheck, build, migration, RPC invocation, or production database mutation occurred.
