# Vendrith Terrain Canonical-State Boundary Audit v1

Status: **Confirmed editor-side contract gap; runtime mapping remains unverified.**
Target branch: `feat/vendrith-ecc-v1`
Related documents:
- `docs/architecture/VENDRITH_TERRAIN_DATA_SPEC_V1.md`
- `docs/architecture/VENDRITH_TERRAIN_RUNTIME_INTEGRATION_AUDIT_V1.md`
- `docs/map-editor/blueprint/WORLD_MAP_EDITOR_COMPLETION_BLUEPRINT.md`

## 1. Finding: water is derived, but materialized into persisted terrain cells

### Evidence

1. `apps/map-editor/editor/terrain-engine.ts` defines `applyWaterDepthGradient(document, layerId)`. It computes distance from land, then returns a new `MapDocument` whose ground-layer `cells[].tileId` values are rewritten among `water`, `brackish`, `deepwater2`, and `deepwater`.
2. `apps/map-editor/editor/terrain-paint.ts` calls `applyWaterDepthGradient(next, layerId)` after a logical terrain edit, then calculates affected terrain cells and render variants.
3. `apps/map-editor/components/vendrith-world-builder-app.tsx` also applies the gradient during normalization of older saved documents.
4. `apps/map-editor/editor/terrain-engine.test.ts` tests the deterministic output and exact depth-band tile IDs, including a 64×64 water body and the no-land World Map floor.
5. `docs/map-editor/blueprint/WORLD_MAP_EDITOR_COMPLETION_BLUEPRINT.md` states that water depth is derived and recomputed after load, while also explicitly describing writing derived terrain into the ground projection under the current contract.

### Interpretation

Water depth is **algorithmically derived**, but the current editor representation materializes that result into the ground cell `tileId` values. Since `MapDocument` is serialized and saved, the materialized depth bands can be persisted as part of the snapshot. Therefore the current model is not the same as a purely transient render-only water-depth cache.

This is not automatically a bug: materialization can be a deliberate compatibility strategy. It is, however, a contract boundary that must be explicit before future terrain features are added.

## 2. Decisions to preserve for now

Until the editor/runtime mapping and persistence contracts are verified:

- Keep `MapDocument.version = 1`; do not add required fields or change the meaning of existing `tileId` values.
- Preserve the existing deterministic gradient and the `deepwater` floor for a World Map with no land.
- Keep render masks, shoreline masks, approved asset selection, and Pixi/render output derived and rebuildable.
- Do not add a separate water-depth table or write to production runtime persistence from the editor.
- Do not reinterpret `water`, `brackish`, `deepwater2`, and `deepwater` as measured physical depths. They are current semantic/display bands driven by distance-to-land.

## 3. Questions that need explicit answers

1. Should saved `MapDocument` ground cells represent authored land/water surface only, with depth bands derived on load; or should the derived bands remain materialized for compatibility?
2. If bands remain materialized, how is authored water distinguished from engine-generated depth bands during future edits, import/export, and recovery?
3. Does production runtime consume these four tile IDs directly, or does an adapter transform them into another representation?
4. Must undo/redo record only authored input and rebuild bands, or preserve before/after materialized bands exactly?
5. What is the migration path if a future schema introduces explicit water-body IDs, elevation, or hydrology?

## 4. Safe next step

Before any code change, trace `terrain-paint.ts` through editor commands/history, save/load, and the production runtime adapter. Then add a mapping table showing which fields are authored, derived, materialized, and consumed by runtime. Any later change must include round-trip, undo/redo, deterministic rebuild, and legacy-save regression tests.

## 5. Scope and verification

- This is a source-level audit only.
- Existing terrain engine tests were inspected, not executed in this audit.
- Runtime `WorldDefinition`, adapter, mutation-batch and recovery source paths remain unconfirmed through the connected GitHub search interface.
- No application code, database schema, live data, or production runtime was changed.
