# Terrain v2 Editor-State Integration Contract

Status: design contract only; no live editor or persistence behavior changed.
Roadmap: Terrain semantics v2 — editor-state and persistence integration gate.

## Purpose

Define the safe integration boundary between the opt-in `MapEditorState` / `GameSaveStateV2` modules and the existing document-only editor. This contract is intentionally additive. It does not authorize changing production RPCs, schema, or data.

## Current boundary

- `map-editor-state-v2.ts` models a map as either `legacy` (no terrain semantics) or `initialized` (validated terrain semantics).
- `map-editor-state-history-v2.ts` stores document and semantics together in one history entry and rejects cross-map commits.
- `game-save-state-v2.ts` parses the whole world/exterior envelope atomically, supports v1 saves as legacy state, validates map types, and exposes an authoritative-world-ID guard. Its serializer now canonicalizes legacy maps through the parser instead of treating `serializeMapDocument` alone as validation.
- The live editor shell, active Save Slot consumer, v1 recovery journal, and conflict-save path still use `MapDocument` / v1 payloads. The v2 adapter is not wired into them.

## Required state invariants

1. **Pair is atomic.** A load produces either a fully validated `{ world, exterior }` pair or no state change. Never apply world and then discover that exterior is invalid.
2. **World identity is authoritative.** Before adoption, compare the parsed world's ID to the caller's authoritative world ID. Reject blank expected IDs and mismatches.
3. **Map types are strict.** World must be `mapType === "world"`. A non-null exterior must be `mapType === "playable"` and `playableSpace === "exterior"`.
4. **Legacy is not initialized.** A v1 save or nested v1 map becomes `kind: "legacy"` with `terrainSemantics: null`. Never infer land, water, depth, or coast semantics from tile IDs or map type.
5. **Semantics travel with the document.** Editing, undo/redo, crash recovery, conflict resolution, and resize must not update a document while accidentally retaining semantics from a different revision.
6. **Map identity changes reset history.** A different map ID creates a new history timeline. Same-map resize clips out-of-bounds semantic records according to the existing pure state helper; it must not invent new records.
7. **No partial recovery.** Malformed journal entries, invalid semantics, unsupported versions, or wrong map identity are rejected without mutating the active editor state.
8. **V1 remains isolated.** Do not send a v2 envelope to a v1 consumer unless that consumer explicitly dispatches by version and uses the v2 parser.

## Required integration sequence

### Gate A — Pure state-pair adoption

- Add a small pure adoption/validation boundary only if existing parser helpers do not already cover the needed behavior.
- Validate the complete pair and authoritative identity before invoking any UI setter.
- Keep the returned pair immutable at the boundary; do not mutate current state while parsing.
- Add regression tests for valid pair, absent exterior, invalid exterior type/space, malformed world, wrong world ID, blank expected ID, and atomic rejection.

### Gate B — Editor state and history

- Introduce a single owner for the current world/exterior editor-state pair; avoid two independent setters that can expose mixed revisions.
- Record a pair-level history entry if undo/redo is expected to span both maps. Each map's terrain semantics must stay coupled to its own document.
- Preserve existing v1 `EditorShell` behavior until all required callbacks and UI interactions are migrated and tested.
- Map switches reset the appropriate history and recovery scope.

### Gate C — Recovery and conflict-save

- Define the v2 recovery journal format separately from the existing v1 journal.
- Recovery validates map ID, snapshot schema/version, semantics, and world/exterior pair before state adoption.
- Conflict resolution must merge or reject the combined state deliberately; do not silently merge documents while dropping or misapplying terrain semantics.
- Keep recovery and conflict-save opt-in until tests cover interrupted writes, malformed data, and identity mismatch.

### Gate D — Save Slot and RPC compatibility

- Audit the deployed RPC contract separately; repository SQL source alone does not prove the deployed function definition.
- Adopt the reviewed target invariant that the embedded world `MapDocument` must structurally match the `document` member of the referenced canonical map-version snapshot; the exterior is independent. The current RPC source does not enforce this equality, so a separately reviewed migration and deployed-function audit are required before treating it as guaranteed.
- Dispatch load by envelope version. V1 continues through the v1 parser; v2 goes through `parseGameSaveStateV2ForWorld`.
- Validate both inbound parsing and outbound serialization; malformed legacy `MapDocument` values must be rejected before a v2 Game Save envelope is emitted.
- Do not write v2 through the active v1 path until the consumer, tests, and RPC contract all agree.
- No production SQL/schema/data changes without a separate reviewed migration and explicit approval.

### Gate E — Verification and rollout

Required before activation:
- focused parser/pair/history/recovery/conflict-save tests;
- full Vitest suite;
- TypeScript typecheck;
- production build;
- CI result tied to the exact commit;
- browser-level Save Slot round-trip verification;
- rollback plan preserving v1 saves.

A source file or test being committed is not evidence that tests passed. If the available workflow cannot execute tests, report them as pending and do not activate the integration.

## Out of scope

This contract does not change live UI, active Save/Load, Save Slot RPC payloads, Supabase schema/data, production runtime navigation, or existing v1 recovery behavior.

## Next concrete step

Continue the Save Slot audit by resolving the version-reference invariant (snapshot equality versus provenance/concurrency metadata) and verifying the actual deployed RPC definition. Then obtain real CI/local results for the focused and full test suites, typecheck, and build before considering any active integration.
