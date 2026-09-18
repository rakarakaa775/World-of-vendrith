# Map Editor Phase 3 — Hierarchy Persistence Migration Design

**Status:** Design only — no production migration applied
**Date:** 2026-09-19
**Scope:** Align Map Editor `world | region | playable` semantics with legacy `public.maps` `world | exterior | interior` without redefining legacy meanings.

## 1. Evidence

The live database currently has exactly one `public.maps` row: the authoritative World Map, with `map_type = world`. The live constraint is `world | exterior | interior`. There is no Map Editor identity/hierarchy table and no `parent_map_id` on `public.maps`.

The Map Editor contracts explicitly choose **Option B**: a separate identity/hierarchy mapping layer.

## 2. Fixed semantic mapping

| Editor semantic | Legacy maps semantic | Parent |
|---|---|---|
| world | world | none |
| region | no legacy type is reinterpreted | one world editor identity |
| playable exterior | exterior, when a legacy map row is required | one region editor identity |
| playable interior | interior, when applicable | one playable editor identity |

The existing `maps.map_type` values must remain unchanged.

## 3. Proposed logical identity layer

Use a dedicated Map Editor table (physical name to be finalized before applying SQL) containing at minimum:

- `editor_map_id` — stable MapDocument identity / primary key;
- `legacy_map_id` — nullable FK to `public.maps(id)`;
- `world_id` — FK to `worlds(id)`;
- `map_type` — `world | region | playable`;
- `parent_editor_map_id` — nullable self-reference;
- `playable_parent_id` — nullable/explicit relation for interior ownership where needed;
- `legacy_map_kind` — `world | exterior | interior`, nullable for editor-only Region;
- ownership and timestamps.

The physical model may normalize interior ownership into a relation table if that is required to preserve building semantics.

## 4. Required invariants

1. Every editor map has exactly one stable editor identity.
2. `MapDocument.id = editor_map_id`.
3. World has no parent.
4. Region has exactly one World parent.
5. Playable has exactly one Region parent, unless a future approved exception exists.
6. Interior has exactly one owning Playable parent.
7. Parent and child share `world_id`.
8. Self-parenting and cycles are rejected.
9. A legacy `maps.id` is not mapped to multiple editor identities in the same applicable scope.
10. Existing legacy map-type semantics are never renamed or repurposed.
11. Authoritative versions and save slots remain keyed to the stable editor identity used by the persistence boundary.
12. MapDocument remains canonical; hierarchy rows are identity/relationship metadata, not a second document store.

## 5. Migration sequence

### Migration A — identity/hierarchy schema
Create the dedicated table(s), keys, uniqueness constraints, indexes, ownership/RLS, and same-world/cycle validation.

### Migration B — controlled RPC surface
Create authenticated/server-controlled RPCs for create/open/update hierarchy identities. RPCs must resolve ownership server-side and must not trust client-supplied map type, parent, or legacy mapping as authorization.

### Migration C — World bootstrap mapping
Create exactly one editor identity for the existing authoritative World Map and map it to the existing `maps.id`. Do not duplicate or rewrite the World Map.

### Migration D — persistence bridge
Update the Map Editor authoritative resolver/commit boundary so editor identity resolves to the mapped legacy `maps.id` where a legacy row is required. Preserve the existing `map_editor_commit_merge_v1` version-aware commit foundation unless concrete SQL evidence requires a compatible wrapper.

### Migration E — child creation
Only after A–D are verified should Region and Playable creation become durable. Region may exist as an editor identity without a legacy map row; Playable Exterior/Interior may map to legacy rows according to the documented rules.

## 6. RLS/security requirements

- authenticated access only;
- owner derived from `auth.uid()`;
- child creation requires ownership of the parent editor identity;
- mapped legacy row must belong to the same `world_id`;
- direct browser writes to protected hierarchy columns are not relied upon for authorization;
- RPCs use pinned `search_path` and server-side ownership checks.

## 7. Backward compatibility

No ALTER of the existing `maps.map_type` vocabulary.
No `parent_map_id` addition to `public.maps` as part of this design.
No change to existing World Map identity.
No migration of existing `interior` building semantics into editor `playable` semantics by inference.

## 8. Verification gate before production SQL

Before applying any migration, verify:

- current migration history/source parity;
- all existing `maps` rows and legacy references;
- existing building/interior relationships;
- existing RLS/policies on `maps`;
- existing version/save-slot foreign keys and assumptions;
- exact signatures of persistence/access RPCs;
- World identity bootstrap target;
- rollback behavior.

Then apply migrations one at a time, re-audit Supabase, run focused tests/build, and verify World Save/Load remains unchanged.

## 9. Current decision

The contract mapping is now explicit. The earlier Phase 3 blocker is resolved at the **design-contract level**, but Phase 3 is **not complete**. Production schema/RPC implementation requires the migration-level verification gate above and must not be invented from the mapping alone.
