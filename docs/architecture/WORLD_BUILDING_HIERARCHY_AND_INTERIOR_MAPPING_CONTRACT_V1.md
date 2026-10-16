# World Building Hierarchy & Building Interior Mapping Contract v1

Status: Design contract / implementation gate
Product: **World of Vendrith — World Building**
Required branch: `feat/vendrith-ecc-v1`

## 1. Purpose

Define how World, Region, Playable, and Interior content relate before changing runtime schemas or persistence. The hierarchy describes map scopes and derived content; it does not mean four independent copies of the asset library.

## 2. World → Region → Playable hierarchy

The default expansion rule is:

- 1 World seed expands into 4 Region seeds.
- Each Region seed expands into 4 Playable seeds.
- Therefore, 1 World has 4 Regions and 16 Playable maps (4 × 4).

This is a generation/layout rule, not a rule that every child map must blindly duplicate every parent object.

### 2.1 Asset and seed semantics

- The Asset Library is shared across World, Region, Playable, and Interior. Layer/map role determines valid use; it does not fork or duplicate the binary asset library.
- Keep **generation seed**, **map/document ID**, and **source-object ID** distinct. A generation seed makes generation reproducible; it is not a map identifier.
- A parent object may produce child representations through an explicit derivation/link. Do not create untracked permanent copies merely because a child map is generated.
- Example: a grass source object in World may inform four Region representations and sixteen Playable representations. Child placements may vary by position, rotation, density, or approved variation while retaining provenance to the source.
- Child-specific edits must have a defined override policy. Regeneration must not silently erase authored child changes. Choose and document whether an edit is an override, a detached object, or a regeneration input.
- Repeated generation with the same inputs and generation seed must be deterministic. Changing the seed may produce a new result but must not overwrite authored data without an explicit action.

## 3. Map roles

- **WORLD** — natural environment and large-scale natural terrain.
- **REGION** — regional context and structures/locations appropriate to the region.
- **PLAYABLE** — concrete exterior gameplay space.
- **INTERIOR** — indoor spatial representation linked to a building or structure.

These are map/content roles, not separate asset libraries. Existing role validation remains authoritative; this contract does not authorize moving assets between roles without auditing current rules.

## 4. Building exterior → Interior mapping

Interior is a spatial representation of a building's interior, linked to the building and its footprint/structure. It is **not** a fixed number of Interior maps per building and is not a fixed pair of maps per Playable map.

### 4.1 Example mapping

For the example building:
- Exterior: 6 wall pieces + 6 roof pieces = 12 exterior elements.
- Interior representation: 12 floor elements + 12 boundary-wall elements, aligned to the corresponding footprint/structural layout.

This is an example of the agreed mapping, not a universal formula for all buildings. The roof is an exterior element and may be hidden or replaced in Interior view so the inside can be seen. Do not interpret the example as requiring every building to have exactly 12 interior elements.

### 4.2 General rules

- Interior geometry must derive from the building's actual footprint, wall segments, openings, floors, and structural metadata—not merely from the building name or a hard-coded element count.
- Floor and boundary-wall elements must align with the intended interior footprint and remain linked to the source building/structural segments.
- Doorways, windows, entrances, stairs, multiple floors, courtyards, and irregular footprints must be representable. A castle or inn can have more elements and floors than a small house.
- Exterior roof rendering and Interior visibility are presentation/state concerns; hiding the roof must not delete or mutate the authored roof assets.
- If a building's footprint changes, report affected Interior elements and validate the mapping before applying a destructive regeneration.
- Support manual Interior edits as explicit overrides or detached elements. Rebuilding the exterior must not silently destroy them.
- Validate for duplicate element IDs, invalid references, disconnected/out-of-bounds floor cells, wall/footprint mismatches, and unresolved openings.

## 5. Identity, provenance, and persistence

A future implementation should model these concepts explicitly (names are conceptual, not a mandate to introduce schema fields without audit):

- map/document identity and role;
- parent map and child map relationship;
- generation seed/version;
- source object identity and derived-object provenance;
- building identity and footprint/structural element references;
- Interior element type and source structural reference;
- authored override/detachment state;
- generator/schema version for safe regeneration.

Save/load must round-trip these relationships. A successful save must not flatten source/derived links or convert a generated view into unrelated duplicates. Legacy documents require compatibility handling rather than silent reinterpretation.

## 6. Required verification before implementation is considered complete

1. Hierarchy cardinality: 1 World → 4 Region → 16 Playable under the default rule.
2. Shared asset identity: one asset reference can be used across allowed map roles without duplicating the asset binary.
3. Determinism: same source + configuration + generation seed yields the same derived layout.
4. Provenance: derived child elements can be traced to their source; IDs remain unique.
5. Override safety: child edits survive ordinary regeneration according to the documented policy.
6. Interior example: the 6-wall/6-roof exterior example maps to 12 floor and 12 boundary-wall elements as specified.
7. Variable building sizes: small and large/irregular buildings do not depend on a fixed 12-element Interior limit.
8. Roof visibility: Interior view can hide exterior roof rendering without deleting roof data.
9. Save/load round-trip preserves map relationships, provenance, overrides, and Interior structure.
10. Invalid or stale mappings are rejected or surfaced with actionable diagnostics; they are not silently repaired into destructive changes.

## 7. Safe implementation sequence

1. Audit the existing map/document model, building placement model, asset registry, map-role validation, save/load adapters, and tests.
2. Record the current behavior and identify the smallest compatible extension; do not duplicate an existing contract.
3. Add pure model/generation logic and unit tests before wiring it into UI or persistence.
4. Add fixture-based Save → Load → Save round-trip tests, including legacy data.
5. Add UI for previewing hierarchy and Interior mapping only after model invariants pass.
6. Run focused tests, typecheck, and production build as available.
7. Do not change production database schemas or run production migrations as part of this contract. Do not require a paid Supabase branch.

## 8. Non-goals and guardrails

- This document alone does not claim that hierarchy generation or Interior generation is implemented.
- Do not create a new Git branch; work on `feat/vendrith-ecc-v1`.
- Preserve existing user changes and inspect working-tree state before local edits.
- Do not add automatic destructive regeneration, unreviewed database migrations, or paid-service dependencies.
- Keep `apps/map-editor/` as a compatibility path for now; product-facing terminology is **World of Vendrith — World Building**.
