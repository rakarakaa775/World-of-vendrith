# Vandrith Foundation Lock

**Status:** LOCKED — 2026-09-18
**Baseline purpose:** Freeze the Map Editor foundation after the verified Save/Load foundation and the first approved terrain asset intake.

## Locked foundation surfaces

The following are now treated as stable contracts and must not be redesigned for ordinary feature work:

- MapDocument identity and map-type semantics.
- Map serialization envelope and validation contract.
- Editor history/state ownership and load replacement boundary.
- Authoritative map/version persistence contract.
- Save, Load Latest, and Save Slot/Load Slot persistence boundaries.
- Map ownership/access validation.
- Existing Supabase map persistence RPC contracts.
- Save-slot snapshot semantics.
- Existing terrain approval boundary and provenance/licensing records.
- Asset registry identity/provenance model.
- Map Editor asset scope contract (`world`, `region`, `playable`).
- Asset staging boundary: `assets/map-editor/terrain/`.
- Repository asset registry as the authoritative storage/provenance record.

## Locked asset intake baseline

The following two original terrain assets are part of this baseline:

- `assets/map-editor/terrain/tile_grass.png`
- `assets/map-editor/terrain/tile_dirt.png`

Their approval, provenance, license, registry IDs, and SHA-256 checksums are recorded in `assets/_documentation/ASSET_LIBRARY_REGISTRY.md`.

## Error-handling rule

If a later feature or deployment exposes an error:

1. Reproduce and identify the failing boundary.
2. Prefer a fix outside the locked foundation.
3. Use an adapter, caller-side correction, validation, migration-safe additive layer, or test where appropriate.
4. Do not alter a locked contract merely to make a new feature fit.
5. A foundation change is permitted only when evidence proves the locked contract itself is incorrect, unsafe, or causes data loss.
6. Any such exception requires a documented change-control decision and a new lock baseline.

## Asset rule after lock

New assets are additive. They must pass the existing approval, provenance, licensing, naming, registry, and scope rules. Adding an asset must not redefine the foundation or silently activate the asset in runtime code.

## Explicit non-locks

This lock does not claim that every future feature is complete. It freezes the current foundation contracts so future work builds on them. Open feature work, browser/deployment verification, and future asset additions remain separate workstreams.

## Baseline reference

Locked immediately after the verified terrain asset transfer and registry update. The Git commit containing this document is the reference point for future foundation comparisons.