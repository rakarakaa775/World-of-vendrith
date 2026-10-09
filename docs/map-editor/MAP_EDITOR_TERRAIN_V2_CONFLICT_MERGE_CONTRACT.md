# Terrain v2 Three-Way Conflict Merge Contract

Status: opt-in pure merge helper; integration gate remains closed.
Branch: `feat/vendrith-ecc-v1`
Roadmap: Terrain semantics v2 — recovery/conflict-save integration.

## Goal

Merge `TerrainSemanticsSection` independently from the existing `MapDocument` three-way merge without silently losing, inventing, or overwriting terrain semantics. This helper is deliberately not wired into the active v1 conflict-save controller.

Implementation:
- `apps/map-editor/editor/terrain-semantics-merge.ts`
- `apps/map-editor/editor/terrain-semantics-merge.test.ts`

## Preconditions

The caller must establish all of the following before invoking the helper:

1. Base, local, and remote documents have the same map ID.
2. Base, local, and remote documents have identical width and height.
3. Each semantics section is present as an initialized v2 section. Legacy v1 state with `terrainSemantics: null` is not an empty semantics section and must not be passed as one.
4. The document merge itself is validated independently. A semantic merge does not resolve document metadata, tile, object, layer, or map-type conflicts.

The helper validates all three semantic sections against the supplied dimensions. Identity and dimension equality are caller preconditions because those values are not stored in a `TerrainSemanticsSection`.

## Three-way policy

Each coordinate is treated as one atomic sparse record. A missing record is a meaningful value (no explicit semantic annotation), not an instruction to infer terrain from tile graphics.

For each coordinate, compare base (B), local (L), and remote (R):

- If L equals R, accept that value.
- Else if L equals B, accept R.
- Else if R equals B, accept L.
- Otherwise report a semantic conflict and retain L only as a deterministic preview value.

Deleting a record follows the same rules. Two sides deleting the same record is not a conflict; deletion on one side and an unchanged other side accepts the deletion; deletion versus a changed record is a conflict.

Equality is evaluated on validated/canonicalized records. Output records are deterministic row-major order (y, then x).

## Result and persistence rule

The result contains a candidate `terrainSemantics` section and explicit conflicts with coordinate, ID, and base/local/remote values. A candidate returned alongside one or more conflicts is only a preview: **callers must not persist or auto-adopt it** until every conflict has been resolved. A conflict-free semantic result still cannot be persisted unless the separate MapDocument merge is also conflict-free and all document/semantics invariants pass.

## Dimension and identity changes

This first contract intentionally rejects neither identity nor dimensions itself because the helper does not receive document identities. Callers MUST reject mismatched map IDs and dimension changes before calling it. Resize policy remains the existing explicit behavior: shrinking may clip out-of-bounds records and expansion does not invent records. Combining a resize with concurrent semantic edits requires a separate policy and tests; do not auto-merge it under this contract.

## Required tests

The focused suite covers independent coordinate edits, identical same-coordinate edits, divergent edits, deletion-versus-edit, one-sided deletion, invalid/out-of-bounds semantics, and deterministic output ordering.

Before integration, add controller-level tests for:
- document conflict and semantic conflict reported independently;
- dimension changes or map identity mismatch rejected before semantic merge;
- v2 serialize/parse round-trip after conflict-free merge;
- no persistence call when either conflict list is non-empty;
- explicit user resolution followed by a clean re-merge/validation.

## Combined v2 merge gate

A second opt-in helper, `apps/map-editor/editor/map-terrain-v2-merge.ts`, now composes the existing MapDocument three-way merge with the terrain-semantic merge. It validates each v2 state, rejects differing map identities and dimensions, and returns `status: "merged"` only when both merge layers are conflict-free. Otherwise it returns `status: "conflict"`, both conflict collections, a reason, and a preview that must not be adopted or persisted. It has no persistence dependency and is not wired into the active v1 controller.

Its tests cover clean independent edits across document and semantics, document-only conflict, terrain-only conflict, simultaneous document+terrain conflicts, identity mismatch, dimension mismatch, and invalid semantics. These are source-level tests until executed in a real test runner.

## Rollout gate

- Keep active `map-conflict-save-controller.ts`, v1 serializer/RPC, live editor UI, and production database unchanged.
- Run focused Vitest, full app tests, typecheck, and build in CI/local runtime; record actual results.
- Integrate only through an explicit version-dispatched v2 save boundary after controller and persistence contracts are reviewed.
- No test pass, production readiness, or database behavior is implied by the existence of the helper.
