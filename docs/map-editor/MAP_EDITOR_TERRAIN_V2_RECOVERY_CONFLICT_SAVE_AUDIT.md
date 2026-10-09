# Terrain v2 Recovery and Conflict-Save Audit

Status: source audit; no active-path changes.
Branch: `feat/vendrith-ecc-v1`
Roadmap: Terrain semantics v2 — recovery/conflict-save integration gate.

## Findings

### 1. V2 local crash recovery

File: `apps/map-editor/editor/map-crash-recovery-v2.ts`

- Stores one combined `MapDocumentV2State` snapshot per map ID under a v2-specific local-storage prefix.
- Read path checks the envelope's map ID, timestamp shape, snapshot string, requested map ID, and v2 snapshot parser.
- V1 snapshots are not upgraded to initialized v2 recovery state.
- `has(mapId)` now uses the same validated read path; malformed keys do not advertise a valid recovery.
- The journal remains opt-in and is not connected to the active editor shell.

Regression tests in `map-crash-recovery-v2.test.ts` cover round-trip, wrong requested ID, malformed JSON, clearing a single map, envelope ID mismatch, embedded snapshot ID mismatch, rejection of v1 snapshots, and invalid timestamps. Tests have been authored but not executed in this environment.

### 2. Active v1 crash recovery

File: `apps/map-editor/editor/map-crash-recovery.ts`

- Persists only a serialized `MapDocument`.
- Does not carry terrain semantics or a v2 schema/version discriminator.
- `has(mapId)` currently checks only key existence; it may report true for an unreadable entry. This behavior belongs to the existing v1 path and is not changed by this audit.
- Do not route initialized v2 state through this journal because terrain semantics would be lost.

### 3. Active conflict-save path

File: `apps/map-editor/editor/map-conflict-save-controller.ts`

- API takes `local`, `base`, and remote values as `MapDocument`.
- Three-way merge uses `mergeMapDocumentsThreeWay`.
- Persistence serializes a resolved `MapDocument` through the existing v1 merge persistence path.
- Terrain trace helpers compare document/tile traces; they do not establish preservation of the separate `TerrainSemanticsSection` used by v2.
- Therefore this path cannot safely accept initialized v2 state until a semantics-aware merge contract and tests exist.

### 4. Required gates before integration

1. Keep the current v1 recovery and conflict-save paths unchanged until a dedicated migration is ready.
2. Define v2 recovery adoption as a single validated state transition; do not update the editor if any envelope, identity, or semantics check fails.
3. Define v2 conflict resolution explicitly:
   - merge terrain semantics by coordinates with deterministic conflict reporting, or
   - reject semantic conflicts and require user resolution.
   Never silently drop semantics or treat document-only merge as a full v2 merge.
4. Keep the active Save/Load path version-dispatched. A v2 envelope must never be sent to a v1 RPC/consumer without an explicit compatible contract.
5. Test same-cell terrain edits, independent document edits, concurrent terrain edits, map identity mismatch, invalid semantics, post-merge serialization round-trip, and recovery after interrupted writes.
6. Run focused Vitest, full app Vitest, typecheck, and production build; record actual output or keep the gate open.

## Verification limits

This is a source-level repository audit, not proof of deployed Supabase RPC definitions or runtime behavior. No database, RPC, schema, production data, active UI, or production runtime was changed. CI and local test execution have not been verified for the audited commits.
