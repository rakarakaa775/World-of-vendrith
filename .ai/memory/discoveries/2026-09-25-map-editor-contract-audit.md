# Vendrith Map Editor Contract Audit — 2026-09-25

## Scope
Audit of the active Map Editor contracts on branch `feat/vendrith-ecc-v1`, covering MapDocument, history, serialization, persistence/conflict handling, assets, and live Supabase security posture.

## Evidence
- Active implementation: `apps/map-editor/`
- Live Supabase project: `The world Vendrith`
- Database engine observed: PostgreSQL 17.6
- Audit uses repository source plus live database metadata/advisors.

## Findings

### 1. MapDocument — STRONG FOUNDATION
`MapDocument` is a serializable domain model with:
- schema version 1
- identity: id/name/mapType
- dimensions/tile size
- layers, cells and objects
- parent/child playable relationships

`map-serialization.ts` validates identity, dimensions, layer semantics, cell counts, object fields, and relationship metadata before accepting persisted snapshots.

Important boundary: the in-memory `MapDocument.version` is the document schema version, while Supabase `version_number` is persistence/concurrency state. These must remain separate.

### 2. History — STRONG CLIENT CONTRACT
The editor uses `map-history.ts` through `createHistory`, `commitHistory`, `undoHistory`, and `redoHistory`. Editing operations commit complete immutable MapDocument states.

This is simple and robust for current editor scale. However, it is snapshot-oriented rather than a durable command log. Do not treat browser history as the authoritative persistence history.

The database also contains an editor command-history subsystem, but the current React editor path primarily uses local MapHistory. These are two different layers and should not be conflated.

### 3. Persistence — STRONG, WITH CLEAR SEPARATION
The persistence stack is layered:
1. runtime snapshot for fast editor recovery
2. durable `map_versions` history
3. RPC merge gateway for optimistic concurrency
4. projection into runtime/map-cell structures
5. browser crash-recovery journal

`loadMapDocumentSnapshot` correctly falls back from an invalid/missing runtime snapshot to the newest durable version.

`saveWithConflictDetection` performs a three-way merge before committing and rebases a conflict-free save onto the latest remote version.

### 4. Conflict model — STRONG BUT SNAPSHOT-GRANULAR
Three-way merge operates at:
- terrain cell
- object
- layer metadata
- map metadata

This supports concurrent edits to independent cells/objects.

Risk: merge equality is JSON-string equality and object-level conflict detection treats the entire object as one unit. Two users changing different fields of the same object can still conflict. This is acceptable for now but should be documented as intentional behavior.

### 5. Map type contract — OPEN GAP
The editor has:
- `world`
- `region`
- `playable`

The legacy database `maps.map_type` contract historically exposes `world`, `exterior`, and `interior`.

The authoritative resolver intentionally fails closed for non-world mappings instead of inventing a conversion. This is correct. Do not loosen this check until the hierarchy identity contract is made explicit and tested end-to-end.

### 6. Asset contract — GOOD PROVENANCE GATE
Runtime terrain bindings require:
- valid terrain key
- mask 0–255
- non-empty asset id
- approved candidate
- approved asset
- non-empty license registry id
- autotile-capable asset for transition masks

Base mask 255 is allowed without the autotile-capable flag.

The live `asset_registry` table is RLS-protected and has authenticated/anonymous read policies limited to approved assets with verified license registry records and allowed/credit-required usage.

The editor therefore has a useful provenance boundary: it does not invent runtime asset IDs.

Remaining gap: the full asset-library read model and verified selection UX are not yet the editor's primary workflow.

### 7. Supabase security — SIGNIFICANTLY HARDENED, NEEDS CONTINUOUS REVIEW
Live inspection confirms RLS is enabled on the core editor tables:
- `maps`
- `map_versions`
- `map_editor_save_slots`
- `asset_registry`
- `map_cells`

Core save/load RPCs use explicit security boundaries. Several privileged editor RPCs are SECURITY DEFINER, so their function bodies/search_path/grants must remain under security review.

Current Supabase security advisors report:
- 68 public tables with RLS enabled but no policies (INFO)
- 52 functions with mutable search_path (WARN)

These findings span the wider Vendrith database, not only the Map Editor. They should not be interpreted as proof that the editor's save path is insecure, but they are technical debt requiring triage.

### 8. Save slots — FUNCTIONALLY SEPARATE
Save slots persist a game-save snapshot built from the authoritative World Map plus an optional Exterior map. This is distinct from editor version history.

That separation is good: editor undo/versioning should not be treated as player save-slot history.

## Contract risks to track

| Area | Status | Risk |
|---|---|---|
| MapDocument schema | Strong | Version migration strategy is still v1-only |
| Serialization validation | Strong | Add explicit upper bounds for dimensions/cell counts later |
| Client history | Strong | Snapshot memory cost can grow for large maps |
| Durable persistence | Strong | Production smoke verification still needed |
| Three-way merge | Strong | Same-object field edits conflict as a whole |
| Map type identity | Open | Non-world mapping must be formalized |
| Terrain assets | Strong | Asset-library selection UX still incomplete |
| Asset provenance | Strong | Continue enforcing registry/license gate |
| Supabase RLS | Hardened | Wider DB advisor debt remains |
| SECURITY DEFINER RPCs | Sensitive | Keep grants/search_path/body audits mandatory |
| Browser verification | Open | Production editor flow still needs automated verification |

## Recommended next implementation order

1. **Do not redesign MapDocument.**
2. Add/expand contract tests around serialization and MapDocument invariants.
3. Add tests for three-way merge edge cases: independent cells, same-cell edits, object field edits, deletion-vs-edit, layer deletion.
4. Formalize the non-world hierarchy identity mapping before expanding region/interior editor persistence.
5. Finish the verified asset-library read model and selection contract.
6. Run a real production persistence smoke test: login → load authoritative map → edit → save → reload → verify version → recover after runtime snapshot failure.
7. Add browser verification for the deployed Map Editor.
8. Separately triage the wider Supabase advisor findings, starting with SECURITY DEFINER functions and mutable search_path.

## Audit conclusion

**Architecture is not greenfield.** The current Map Editor has a coherent domain/persistence foundation and should be evolved incrementally.

The next engineering phase should be **contract tests + production verification + identity/asset contract completion**, not a rewrite and not adding Phaser yet.
