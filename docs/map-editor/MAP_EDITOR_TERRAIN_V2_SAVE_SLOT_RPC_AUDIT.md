# Game Save v2 — Save Slot RPC Contract Audit

Status: read-only deployed-function audit plus source review. No SQL or production database changes.

## Scope and source

Reviewed the active Save Slot caller in `apps/map-editor/components/vendrith-world-builder-app.tsx`, the repository migration `supabase/migrations/20260915220000_map_editor_save_slot_rpc_v1.sql` on `main`, and the actual deployed definitions of both Save Slot RPCs through a read-only query to `pg_get_functiondef`. The deployed definitions differ in details from the repository migration: they use `public.map_editor_can_access_v1` for access checks and the deployed load RPC explicitly checks `map_type='world'`.

## What the RPC actually validates

The save RPC checks:

- authenticated user exists;
- slot number is between 1 and 12;
- requested map belongs to the authenticated user;
- snapshot is non-null JSON object;
- version number is positive;
- the referenced `map_versions` row matches map ID, version ID, version number, and user.

It then stores the supplied `p_snapshot` independently from the referenced version row. It does not inspect the nested Game Save schema/version, parse nested map documents, validate world/exterior map types, or prove the supplied snapshot equals the referenced version snapshot.

The deployed load RPC checks authentication, map access, and World Map type, then returns the stored snapshot and version metadata. It does not revalidate the nested snapshot or verify that the stored version reference and snapshot remain consistent.

## Implications for terrain semantics v2

1. JSONB object acceptance is not sufficient to guarantee that a Game Save v2 envelope is valid.
2. The v1 RPC signature can physically accept a v2 object, but the active frontend consumer still assumes the v1 nested MapDocument shape. Therefore, v2 must not be enabled merely because JSONB can store it.
3. The world version reference does not currently prove that the embedded world document is identical to that version snapshot; the recommended target invariant remains to enforce this in the RPC.
4. The v2 adapter validates the world/exterior pair's map types and semantics format, but caller-level identity checks against the authoritative world ID still need to be preserved.
5. The selected target invariant is that the embedded World Map document exactly matches the `document` member of the referenced canonical map-version snapshot. Exterior data is independent. The active loader also supports legacy single-map snapshots, so RPC validation must dispatch by schema instead of rejecting all non-Game-Save envelopes.

## Live read-only data audit — 2026-10-10

The deployed RPC definitions were inspected without invoking either RPC or changing database state. An aggregate read-only query examined three Save Slot rows:

- Slots 1 and 2 use `vandrith.game-save` version 1.
- Slot 3 uses the legacy `vandrith.map-document` version 1 envelope, which contains a single World Map document.
- All three slot snapshots match the referenced `map_versions.snapshot.document` under schema-aware comparison; all three world identities and map types match the slot's map. The referenced version envelopes are valid.
- No slot row was changed. The earlier schema-agnostic count treated the legacy envelope as if it were a missing Game Save `world` field; that was a false positive, not evidence of divergent world content.

The active `loadSlot` consumer already falls back to parsing a legacy map-document snapshot as a World-only save. This behavior is now represented by the pure `parseGameSaveSlotSnapshot` helper and regression tests, and the active loader calls that helper. A legacy slot restores no exterior because none is present; it must not invent one.

## Version-reference invariant — recommended contract

The active frontend saves the authoritative world first, then fetches the `map_versions` row for the exact `worldVersion`, and passes that row's ID/number alongside a Game Save envelope whose `world` field is the saved `MapDocument`. The durable map-version serializer uses the canonical wrapper `{ schema, version, document }`, while the Game Save v1 envelope embeds the raw `MapDocument`.

Recommended invariant for a future reviewed RPC migration: the embedded world document must equal the `document` member of the referenced version snapshot under JSONB structural equality, while the exterior remains an independently saved member of the Game Save envelope. The referenced version is therefore not merely arbitrary provenance; it anchors the exact world revision represented by the slot. This comparison must first validate that the version snapshot has the expected schema/version/document shape.

This is a contract recommendation based on repository source, not an assertion about the deployed function. The current RPC source does not enforce this equality, so frontend sequencing alone is not a durable integrity guarantee. Do not change or apply SQL until the deployed function is inspected, a separate migration is reviewed, and regression tests cover mismatched world/version pairs.

## Integration gates

- Keep active Save/Load on v1 until the editor can own and restore world/exterior `MapEditorState` atomically.
- Keep the pure `parseGameSaveSlotSnapshot` boundary and its active loader integration. It dispatches between current Game Save v1 and legacy map-document v1, checks authoritative world ID/type and exterior type/space, and rejects unsupported formats atomically.
- Preserve existing slot ownership, version ID/number and RPC error handling.
- Decide whether an RPC versioned contract is needed only after the frontend adapter and tests are stable.
- Any SQL change must be a separately reviewed migration; do not edit or apply production DB changes as part of this audit.
- Verify the actual deployed function definition before relying on repository migration source as a production guarantee.

## Verification

Read-only inspection of deployed RPC definitions and aggregate Save Slot invariants, plus repository source review. No tests, typecheck, build, migration application, Save Slot RPC invocation, or production database mutation occurred.
