# Vandrith Map Editor — Foundation Requirements Matrix

**Status:** Foundation audit requirements v0.1  
**Source:** `BLUEPRINT.md` plus the Map Editor Bible, audited roadmap/phase goals, Save/Load Contract, Database Contract, Technical specification, Game Design and 2026-09-16 audit.  
**Purpose:** Turn the construction blueprint into testable implementation requirements.

| ID | Requirement | Acceptance evidence | Phase |
|---|---|---|---|
| MAP-001 | Every map has a stable explicit `map_id`. | Create/open/save/load preserves the same ID. | 1–2 |
| MAP-002 | Editor supports `world`, `region`, `playable`. | Each type can be created, parsed and validated. | 1–2 |
| MAP-003 | Hierarchy is explicit and deterministic. | World→Region→Playable relationships are stored as references. | 1–2 |
| MAP-004 | Interior belongs unambiguously to a Playable map. | Parent reference points to the owning Playable map. | 1–2 |
| STATE-001 | `activeMapId` and persistence target cannot silently diverge. | Switching maps updates or invalidates persistence state deterministically. | 1 |
| STATE-002 | Stale documents cannot be published to a newly selected map. | Navigation change followed by edit/save cannot cross identities. | 1 |
| STATE-003 | Failed load/save never destroys current local editing state. | Injected persistence failure leaves document/history unchanged. | 1, 3–4 |
| DOC-001 | `MapDocument` is the canonical editor source of truth. | Renderer and persistence consume document state rather than owning it. | 1–2 |
| DOC-002 | Grid dimensions determine cell count. | `cells.length === width * height` for every document. | 2 |
| SER-001 | Serialization envelope is deterministic. | Serialize→parse→serialize is stable for supported schema. | 2 |
| SER-002 | Parsed document identity must match the requested map. | Mismatched IDs are rejected before adoption. | 2–4 |
| SER-003 | Schema/version validation rejects malformed snapshots. | Invalid envelope/version/required fields return validation error. | 2–4 |
| EDIT-001 | Normal editing is independent of network state. | Paint/erase/move/undo/redo works while persistence is unavailable. | 1 |
| EDIT-002 | History boundaries are explicit. | Open/load creates a new history boundary; ordinary edits do not reset history. | 1–2 |
| RENDER-001 | Renderer is not the source of truth. | Rebuilding renderer from document reproduces the same visual state. | 1 |
| RENDER-002 | Ordinary edits do not recreate the entire Pixi application. | Instrumentation shows persistent renderer lifecycle during painting. | 1 |
| ASSET-001 | Storage does not imply approval/activation. | Unapproved staged asset cannot enter an active binding. | 6–7 |
| ASSET-002 | Asset provenance and approval are traceable. | Asset record includes source/license/approval information. | 6–7 |
| TERRAIN-001 | Terrain references stable bindings rather than hard-coded render assumptions. | Terrain can resolve through registry/binding to an approved asset. | 6 |
| SAVE-001 | Save target identity is verified before commit. | Local document ID, active map ID and connected map ID agree. | 3 |
| SAVE-002 | Save is version-aware. | Remote version mismatch enters conflict handling rather than blind overwrite. | 3 |
| SAVE-003 | Server success is required before reporting persistence success. | UI success state follows confirmed RPC/transaction result. | 3 |
| LOAD-001 | Load resolves the requested map explicitly. | Requested ID is passed through to authoritative retrieval. | 4 |
| LOAD-002 | Load validates snapshot identity before adoption. | `document.id !== requestedMapId` is rejected. | 4 |
| SLOT-001 | Slots represent snapshots, not maps. | Slot stores map/version/snapshot metadata and no independent map identity. | 4 |
| SLOT-002 | Supported slot range is 1–12. | UI/backend contract agrees on allowed range. | 4 |
| MERGE-001 | Three-way merge requires identical map identity. | Base/local/remote with different IDs are rejected. | 3 |
| PROJ-001 | Gameplay projections are derived from authoritative snapshots. | Rebuild reproduces projections without becoming canonical state. | 5 |
| PROJ-002 | Projection failure cannot destroy editor state. | Transaction/error test preserves local document. | 5 |
| OWN-001 | Ownership is enforced server-side. | Unauthorized map access/save is rejected by backend contract. | 3 |
| ERR-001 | Persistence errors are classified. | Auth/map/validation/conflict/server/transport states are distinguishable. | 3–4 |
| TEST-001 | World, Region and Playable are covered by the same foundation test matrix. | Each type passes identity/serialization/persistence boundary tests. | 8 |
| DOC-001A | Implementation updates are traceable. | Change Log and Status Log receive entries in the same work session. | All |

## Foundation implementation order

1. Stabilize editor state and renderer lifecycle.
2. Lock MapDocument/grid/serialization validation.
3. Implement persistence identity and version guards.
4. Implement Load/Save Slot boundaries.
5. Verify derived projections.
6. Integrate terrain/environment/world relationships.
7. Expand authoring features.
8. Run release verification.

## Current audit mapping

The immediate foundation focus is `STATE-001`, `STATE-002`, `STATE-003`, `RENDER-001`, `RENDER-002`, and `DOC-002`. The current repository already contains substantial persistence contracts, so implementation should not replace them until these foundation invariants are verified.
