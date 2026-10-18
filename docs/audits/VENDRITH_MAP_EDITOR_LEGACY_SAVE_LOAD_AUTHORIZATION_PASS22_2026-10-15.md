# Vendrith Map Editor — Legacy Save/Load Authorization Review (Pass 22)
**Date:** 2026-10-15  
**Repository:** `rakarakaa775/World-of-vendrith`  
**Branch / HEAD observed:** `feat/vendrith-ecc-v1` / `d5d03536`

## Scope and safety
Read-only inspection of hosted `map_editor_save_slots` RLS/policies/grants and the live legacy Save/Load RPC definitions. No functions were invoked to mutate data; no production writes or schema changes occurred.

## Hosted contract observed
- `map_editor_save_slots` has RLS enabled, but not FORCE RLS.
- Authenticated policies include owner-scoped SELECT/INSERT/UPDATE/DELETE, plus `map_editor_save_slots_canonical_world_select`, which permits SELECT for rows whose map belongs to the configured canonical World UUID without checking `created_by` on the slot.
- Table grants to `anon` and `authenticated` include broad privileges, including UPDATE, DELETE and TRUNCATE. RLS policies target authenticated users, and RLS does not protect TRUNCATE. This broad ACL is a hardening concern even though PostgREST normally exposes row operations rather than arbitrary TRUNCATE.
- `map_editor_save_slot_v1(uuid, smallint, text, uuid, integer, jsonb)` and `map_editor_load_save_slot_v1(uuid, smallint)` are SECURITY DEFINER and executable by authenticated users, not anon.
- `map_editor_can_access_v1(uuid)` is SECURITY DEFINER and treats a map as accessible either when `created_by=auth.uid()` or when it is a World with the configured canonical World UUID.

## Potential cross-user slot isolation defect
The live legacy Save RPC:
1. checks `map_editor_can_access_v1(p_map_id)`, which permits access to the shared canonical World;
2. checks that the supplied version belongs to the map, but does not require that version or slot belongs to the current user;
3. upserts on `(map_id, slot_number)` and updates label/version/snapshot without a `created_by = auth.uid()` conflict predicate.

The live Load RPC checks map access, then selects the slot by only `map_id` and `slot_number`, without filtering `created_by`. Combined with the canonical-world SELECT policy, this creates a **credible cross-user save-slot read/write risk if the canonical World is intentionally shared across users**. The source evidence is sufficient to prioritize an isolation review, but a full user-role test against a disposable copy is required before declaring an exploit confirmed in production behavior.

## Candidate hardening comparison
The local atomic Save candidate explicitly checks `maps.created_by = auth.uid()` and its slot upsert includes `WHERE map_editor_save_slots.created_by = v_uid`; the validated Load candidate filters the slot by `created_by = v_uid`. These are meaningful ownership protections, but the Save candidate's owner-only map check may conflict with the current shared canonical World access model. Product semantics must be decided before application: per-user slots on a shared World versus owner-only World saves. Do not apply the candidate blindly.

## Required next actions
1. Add a disposable PostgreSQL regression fixture with two authenticated users sharing the canonical World: user A creates a slot; user B attempts to load and overwrite the same slot. Assert the intended product policy explicitly.
2. Review `map_editor_save_slots` table grants, especially anon/authenticated TRUNCATE and direct DML, alongside RLS and function execution privileges.
3. Choose a clear key/ownership model for save slots. If slots are per-user, the unique key likely needs user ownership (e.g. map/user/slot), and both legacy/new RPCs must enforce it. If shared slots are intended, document that explicitly and protect writes with a separate authority model.
4. Only after those decisions, reconcile and test the new atomic Save/validated Load candidates in disposable PostgreSQL; no hosted application or migration-ledger repair in this pass.

Foundation 11-table specification and ERD remain unchanged.
