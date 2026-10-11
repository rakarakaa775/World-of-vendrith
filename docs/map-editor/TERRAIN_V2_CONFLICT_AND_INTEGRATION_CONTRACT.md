# Terrain v2 Conflict and Editor Integration Contract

Status: design contract; not activated in the live editor.
Target branch: `feat/vendrith-ecc-v1`.
Scope: client-side authoring state and testable adapters only. This contract does not authorize production database changes, Supabase migrations, or a change to the existing v1 Save/Load path.

## 1. Required invariants

1. A persisted v2 snapshot is one logical state: `MapDocument` plus `terrainSemantics`.
2. Parsing and recovery validate both parts before returning either part. Invalid terrain semantics reject the entire v2 snapshot.
3. Map identity and dimensions must match the expected map and the baseline used for a save.
4. A v1 snapshot has no terrain semantics. Loading v1 must not fabricate terrain values or silently label it as v2.
5. The live editor remains on the existing v1 path until the integration gate in section 6 passes.

## 2. Three-way terrain conflict policy

A save attempt must carry a base snapshot, the user's local snapshot, and the latest authoritative snapshot. Terrain cells are keyed by integer coordinate `(x, y)`; absence of a key is a meaningful value (deletion), not an instruction to ignore that cell.

For each coordinate, compare base `B`, local `L`, and remote `R`:

- If `L = B`, accept `R` (the user did not change this cell).
- Else if `R = B`, accept `L` (the remote side did not change this cell).
- Else if `L = R`, accept that shared value.
- Otherwise, report a conflict for this coordinate and do not write the merged snapshot.

Equality must compare the full normalized cell value, including surface, feature, depth, and any other schema-defined fields. Missing/deleted cells participate in the same comparison. Never resolve a conflict by silently preferring local or remote.

A merge must be rejected when map IDs differ, map dimensions differ, terrain schema/version is unsupported, either input fails validation, or duplicate coordinates are present. The result must pass the same terrain validator as normal v2 serialization.

## 3. Save Slot atomicity

The document snapshot and its Save Slot reference must not become observably inconsistent.

- Validate and serialize the complete v2 state before beginning a write.
- Use a single transactional persistence operation for the snapshot and slot pointer where the backing store supports transactions.
- Where storage is multi-key and non-transactional (for example, browser local storage), write an immutable, versioned snapshot first, then update the slot pointer as the final commit marker. A failed pointer update must leave the previous pointer and previous valid snapshot usable; an orphaned immutable snapshot may be garbage-collected later.
- Never update World/Exterior documents separately from their terrain semantics.
- Return a structured result distinguishing validation failure, conflict, storage failure, and success. Do not report success until the commit marker is confirmed.
- A retry must use a freshly read baseline; it must not replay a stale merged result over newer data.

The browser-storage protocol must be tested with injected failures at every write boundary. If the implementation cannot preserve the old valid slot after a failure, it is not ready for activation.

## 4. Recovery and history

- Crash recovery stores and restores document plus terrain semantics as one state.
- Undo and redo move the same combined state; neither may restore the document without its terrain semantics.
- A corrupt or invalid recovery entry is ignored as a whole and must not be partially applied.
- Recovery must not clear a valid entry until the user accepts/discards it or a successful replacement is confirmed.

## 5. Conflict reporting

A conflict result should include the map identity, the affected coordinates, and the base/local/remote values (including explicit absence for deletions). The UI must present the conflict without mutating the map. Resolution is a separate user action; after resolution, validate and retry against a fresh baseline.

## 6. Activation gate

Do not wire v2 into the primary editor until all of these are true:

- [ ] Unit tests cover the three-way cell merge table, including additions, edits, deletions, same-value edits, and true conflicts.
- [ ] Validation tests reject duplicate/out-of-bounds coordinates, invalid surfaces, unsupported schema versions, mismatched identity, and dimension mismatch.
- [ ] Save Slot failure-injection tests prove the previous valid slot remains loadable after failures at each write boundary.
- [ ] World Map and Exterior round-trip tests preserve document and terrain semantics together.
- [ ] Undo/redo, resize, crash recovery, and journal/checkpoint tests prove the combined-state invariant.
- [ ] Browser tests cover save, reload, recover, conflict presentation, and storage failures.
- [ ] Typecheck, build, focused tests, and full CI pass on this branch.
- [ ] The live editor integration is a separate reviewed change, with no production database or migration changes in this scope.

Until every gate is checked with evidence, v2 remains opt-in and the existing v1 editor behavior remains authoritative.
