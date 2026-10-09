# Save Slot Integrity Remediation Contract

Status: design and regression coverage only. No production RPC or database changes have been applied.

## Verified live state — 2026-10-10

Read-only inspection of the deployed `map_editor_save_slot_v1` and `map_editor_load_save_slot_v1` definitions confirmed that the RPCs do not validate the relationship between the slot snapshot and its referenced immutable world version.

An aggregate, schema-aware inspection of the three existing Save Slot rows found:

- Slots 1 and 2 use `vandrith.game-save` version 1.
- Slot 3 uses the legacy `vandrith.map-document` version 1 envelope and represents a World-only save.
- For all three slots, the embedded World Map document equals the referenced `map_versions.snapshot.document`; world identity, map type, and version-envelope shape are valid.
- No existing slot was updated. The legacy slot remains supported by the current frontend fallback.

A schema-agnostic query initially flagged the legacy row because it has no top-level `world` field. That was a false positive; comparisons must dispatch by the snapshot schema.

## Canonical invariant

For every slot, its version reference must resolve to the same `map_id` and `version_number`, and the referenced version snapshot must be a canonical `vandrith.map-document` version 1 envelope containing a World Map document.

Supported slot snapshot formats on load:

1. Current `vandrith.game-save` version 1: `world` must be a World Map whose ID equals the slot map ID; `exterior` must be null or an exterior playable map. The embedded `world` document must be structurally equal to the referenced version's `document`.
2. Legacy `vandrith.map-document` version 1: `document` must be the World Map with the correct identity and type, and it must be structurally equal to the referenced version's `document`. This format restores no exterior and must not synthesize one.

Future Save Slot writes should accept only the current Game Save v1 envelope. This prevents new legacy-shaped writes while retaining compatibility for existing legacy rows.

## RPC hardening requirements

A separately reviewed migration should:

- Keep `SECURITY DEFINER`, the fixed `search_path`, authentication, `map_editor_can_access_v1`, World Map type checks, and authenticated-only grants.
- Reject unsupported/malformed snapshots before writing.
- Check the world ID/type and exterior type/space.
- Resolve the exact referenced version row and validate its canonical envelope.
- Reject writes when the embedded world differs from the referenced version document.
- On load, dispatch by schema, validate the version reference, preserve legacy World-only loads, and fail closed on unsupported snapshots or mismatches.
- Return stable error codes rather than partial snapshot payloads.
- Never rewrite existing slot rows as part of the RPC migration.

## Required verification before applying SQL

- Unit tests for current Game Save v1 and legacy map-document v1 parsing, authoritative identity mismatch, unsupported versions, wrong map type, invalid exterior, and atomic rejection.
- Database-level tests for valid current saves, valid legacy loads, missing version references, wrong map/version pair, mismatched embedded world, malformed version envelope, unsupported slot schema, invalid world identity/type, and invalid exterior type/space.
- Full Map Editor Vitest suite, TypeScript typecheck, and production build on the exact feature-branch commit.
- Review the migration against the actual deployed function definition and ensure existing rows pass schema-aware validation.
- Apply only through a separately approved migration after the above gates; no ad-hoc SQL update or bulk rewrite of slot data.
- After application, verify the deployed function definitions and run read-only integrity counts again.

## Current implementation boundary

`parseGameSaveSlotSnapshot` is the pure frontend dispatch boundary and is used by the active Load Slot handler. It accepts the two supported formats, validates authoritative world identity/type and exterior type/space, and rejects unsupported formats before editor state adoption.

The helper's regression tests have been committed but have not yet been executed in this environment. The migration remains a required future step; this document does not authorize production changes.
