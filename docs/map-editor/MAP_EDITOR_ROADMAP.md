# Vandrith Map Editor — Master Roadmap

**Document status:** Audited roadmap baseline / living plan  
**Audit date:** 2026-09-16  
**Authority:** This roadmap defines the required implementation order. Work must follow the roadmap unless a documented roadmap revision is approved first.

## 1. Roadmap rule

The Map Editor must be built in phase order. A later phase must not be used to hide an unresolved foundation problem from an earlier phase.

Every phase has a gate: its goal, required evidence, dependencies, and exit criteria must be satisfied before implementation proceeds to the next phase.

This roadmap intentionally contains **no completion checkboxes**. Phase state is recorded in the Status Log and detailed evidence belongs in the Change Log and relevant technical documents.

## 2. Product scope covered by the roadmap

The roadmap covers one Map Editor architecture capable of authoring three map scales:

- **World Map** — macro world geography and high-level links.
- **Kingdom/Region Map** — regional geography, territory, settlements, routes and regional POIs.
- **Playable Map** — fine-grained gameplay spaces with terrain, objects, collision, navigation and gameplay anchors.

The three scales share the same MapDocument, serialization, persistence, version, save-slot and ownership foundations. Scale-specific behavior is implemented through explicit map-type capability profiles.

## 3. Phase sequence

### Phase 0 — Foundation Audit

Audit the existing repository, MapDocument model, editor state, serializer, three map-type semantics, Supabase schema, RPCs, ownership/RLS, deployment path, asset library/provenance, and current runtime behavior. Establish the actual source of truth and identify contradictions, missing contracts, regressions, and unknowns.

**Gate:** A written audit identifies what is authoritative, what is derived, what is currently working, what is broken, what each map type requires, what assets are approved/reviewed, and what must not be changed during subsequent phases.

### Phase 1 — Stable Editor Core

Establish a deterministic editing surface independent of persistence. Validate canvas rendering, tool behavior, layer behavior, object editing, undo/redo, history boundaries, and map-type capability boundaries.

**Gate:** Normal editing is stable, no flicker occurs, and persistence/network state cannot reset local editing history.

### Phase 2 — MapDocument & Serialization Contract

Lock the canonical MapDocument structure, map-type identity semantics, layer semantics, serialization envelope, validation, compatibility versioning, scale-specific capability fields, and round-trip behavior.

**Gate:** A World, Region, and Playable MapDocument can reliably serialize, parse, validate, and round-trip without loss or ambiguity.

### Phase 3 — Persistence Foundation

Implement and verify authentication, map resolution, authoritative version reads/writes, RPC contracts, ownership enforcement, error taxonomy, and server-confirmed persistence for all three map types.

**Gate:** Each map type can save an authoritative version with a diagnosable success/error result and no canvas side effects.

### Phase 4 — Save Slots & Load System

Implement Save Slot 1–12, Load Latest, Load Slot, explicit load boundaries, snapshot isolation, and safe failure behavior across World, Region, and Playable maps.

**Gate:** A saved slot remains unchanged after later edits and loading it restores the exact stored MapDocument for each map type.

### Phase 5 — Derived Projections

Build and verify projections from authoritative MapDocument state into appropriate gameplay representations. World Maps primarily project high-level geographic/link information; Region Maps project regional geography/routes/POIs; Playable Maps project detailed cells, objects, geometry, navigation, and runtime snapshots.

**Gate:** Projections can be rebuilt deterministically and projection failures cannot destroy editor state.

### Phase 6 — Terrain, Environment & World Integration

Integrate terrain bindings, topology, seasonal variants, weather/environment context, coordinate profiles, World/Region relationships, Region/Playable links, and relevant map metadata.

**Gate:** Environment and world systems consume stable map/terrain identity without coupling themselves to canvas implementation details.

### Phase 7 — Full Authoring Feature Set

Complete and harden advanced authoring workflows: buildings, stamps, copy/paste, collision authoring, navigation tools, selection/manipulation, map-scale capability profiles, and future map authoring extensions that have approved design contracts.

**Gate:** Feature behavior conforms to Game Design, Technical Architecture, and MapDocument contracts for the applicable map type.

### Phase 8 — Verification, Recovery & Release

Run the complete testing matrix, regression tests, persistence recovery tests, malformed snapshot tests, stale-version tests, refresh/reconnect tests, projection rebuild tests, asset-reference validation, three-map integration tests, and deployment verification.

**Gate:** Release candidate satisfies the technical and product definitions of done with evidence recorded in the logs.

## 4. Dependency order

```text
Foundation Audit
      ↓
Stable Editor Core
      ↓
MapDocument + Serialization
      ↓
Persistence Foundation
      ↓
Save Slots + Load
      ↓
Derived Projections
      ↓
Terrain/Environment/World Integration
      ↓
Full Authoring Features
      ↓
Verification + Release
```

## 5. Current audit reset

The previous implementation progress is **not treated as phase completion**. Existing code and database objects are evidence to audit, not proof that a roadmap phase is complete.

All previous roadmap checkmarks/checklists are intentionally reset. The project starts the new audit cycle at **Phase 0 — Foundation Audit**.

Known September 16, 2026 issues that must be investigated during the audit include canvas flicker caused by an incorrect history synchronization approach and an unresolved Save error. The audit must determine their actual root causes before another persistence architecture change is attempted.

## 6. Work authorization rule

Implementation work should be performed against the current roadmap phase only. If work reveals that the roadmap order, phase boundary, goal, map-scale scope, or asset boundary is wrong, pause implementation, document the finding, update the roadmap and phase-goals document, and record the change in both project logs before proceeding.

## 7. Evidence rule

A phase is not considered complete because code exists. Completion requires evidence from the appropriate test, database inspection, runtime verification, asset audit, or documented architectural review.

## 8. Asset-library rule

The asset library is a storage/staging system and is part of the Foundation Audit. Assets must be classified by intended consumer (`map-editor`, `life-build`, `inventory`, etc.) and, where relevant, by map scale. Storage must not automatically activate an asset in code. Provenance, license/credit and approval state must remain traceable.

## 9. Change-control rule

Every roadmap change must update:

- this roadmap;
- `MAP_EDITOR_PHASE_GOALS.md` when phase goals or gates change;
- `MAP_EDITOR_BIBLE.md` when the roadmap rule or project authority changes;
- `MAP_EDITOR_CHANGELOG.md`;
- `MAP_EDITOR_STATUS_LOG.md`.
