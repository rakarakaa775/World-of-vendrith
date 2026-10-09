# Terrain System — Current Implementation Gap Audit

- **Audit date:** 2026-10-09
- **Branch inspected:** `feat/vendrith-ecc-v1`
- **Type:** Repository-source audit; no code changed by this audit
- **Specification:** [TERRAIN_SYSTEM_SPECIFICATION_V1.md](./TERRAIN_SYSTEM_SPECIFICATION_V1.md)
- **Historical baseline:** [MAP_EDITOR_TERRAIN_REFERENCE_AUDIT_2026-10-01.md](./MAP_EDITOR_TERRAIN_REFERENCE_AUDIT_2026-10-01.md)
- **Confidence:** Source inspection of selected files and repository search. No local checkout, runtime session, database query, or test execution was performed in this audit.

## 1. Executive summary

The current branch has a more developed terrain foundation than the 2026-10-01 audit described in some areas. The current roadmap records terrain paint tools, fill, selection, water-depth derivation, neighbor/shoreline masks, transition validation, deterministic visual variation, and render-time autotile projection as implemented. Source files for these paths exist.

The main concerns found in the selected source are **consistency between the semantic terrain vocabulary and the binding loader**, **palette fallback behavior versus the approved-asset requirement**, and **incomplete transition coverage**. These should be validated and corrected before claiming production-ready terrain transitions.

This audit does not change runtime code and does not claim tests passed.

## 2. Files inspected

- `apps/map-editor/editor/terrain-engine.ts`
- `apps/map-editor/editor/terrain-resolver.ts`
- `apps/map-editor/editor/terrain-transition-registry.ts`
- `apps/map-editor/editor/terrain-asset-binding-loader.ts`
- `apps/map-editor/editor/terrain-autotile-apply.ts`
- `apps/map-editor/editor/terrain-validation.ts`
- `apps/map-editor/editor/tile-palette.ts`
- `apps/map-editor/components/editor-shell.tsx`
- `docs/map-editor/WORLD_MAP_EDITOR_COMPLETION_ROADMAP.md`
- `apps/map-editor/editor/terrain-engine.test.ts`
- `apps/map-editor/editor/terrain-resolver.test.ts`
- `apps/map-editor/editor/terrain-autotile-apply.test.ts`
- `apps/map-editor/tests/terrain-asset-binding.test.ts`

The test files were located through repository search, but their tests were not executed.

## 3. Findings

### F-01 — Terrain vocabulary and runtime binding whitelist disagree

**Severity:** High  
**Evidence:**
- `terrain-engine.ts` defines 17 keys: `grass`, `grassalt`, `sand`, `redsand`, `dirt`, `dirt2`, `pavement`, `water`, `deepwater`, `deepwater2`, `brackish`, `tallgrass`, `hole`, `holek`, `holemid`, `lava`, `lavarock`.
- `tile-palette.ts` also exposes 17 starter palette definitions.
- `terrain-asset-binding-loader.ts` accepts only six keys: `grass`, `sand`, `dirt`, `pavement`, `water`, `deepwater`.

**Impact:** Palette-visible/engine-recognized keys such as `grassalt`, `redsand`, `deepwater2`, `brackish`, `tallgrass`, holes, and lava variants cannot be accepted by this binding loader. Some may intentionally be non-bindable, derived, decorative, or staged, but that intent is not represented by a shared explicit capability contract in the inspected files.

**Recommendation:** Define an explicit policy per key: authorable terrain, derived water band, decoration/object, hazard terrain, or disabled/staged. Reuse a single canonical registry or add an explicit binding eligibility list. Do not simply widen the loader to all 17 keys until approval, asset provenance, and gameplay semantics are verified.

### F-02 — Palette fallback can expose options without approved registry rows

**Severity:** High  
**Evidence:** `loadTerrainTiles()` queries `asset_registry` with `status = approved`, but if there is no Supabase client, a query error, or no matching row, it returns `STARTER_TILES` or constructs a starter option for the missing row. Those entries include a display name/asset name even when no approved registry row was returned.

**Impact:** This may be acceptable as a clearly labeled local development/demo mode, but it conflicts with the specification's production principle that palette availability should reflect approved authoring options. A fallback label alone does not prove that a runtime asset is present, licensed, or approved.

**Recommendation:** Separate development/demo fallback from production mode. In production, show only registry-approved and semantically enabled entries; when registry loading fails, show a visible unavailable/error state rather than implying approval. Preserve a deliberately configured offline test fixture only if it is unmistakably non-production.

### F-03 — Transition catalog is intentionally small; production transition coverage remains incomplete

**Severity:** High for visual completeness; not necessarily a logic defect  
**Evidence:** `terrain-transition-registry.ts` currently declares two verified pairs: `grass -> water` and `grass -> dirt`. The roadmap states that the authoritative database has rule tiles for some masks but the approved runtime workbench does not cover all terrain/mask combinations, and explicitly prohibits synthesizing bindings or bypassing approval.

**Impact:** The resolver can calculate masks and return safe fallback visuals, but this does not establish that all edge/corner and mixed-terrain visuals are complete. A fallback is a safety behavior, not proof of a production-complete transition catalog.

**Recommendation:** Generate a coverage report from actual approved binding data: per eligible terrain key, base binding, required masks/transition pairs, exact approved binding counts, missing cases, and fallback counts. Do not require a blanket 256 bindings per terrain; define the required set for the chosen topology and actual art.

### F-04 — Binding loader's `complete` diagnostic is too coarse for readiness claims

**Severity:** Medium  
**Evidence:** `terrain-asset-binding-loader.ts` sets `diagnostics.complete` when the total number of unique accepted terrain/mask bindings equals exactly 256.

**Impact:** A global count of 256 does not prove that each enabled terrain has the needed base/transition coverage. It can also be misleading if a future catalog has more or fewer than 256 valid bindings, or if the art only requires a normalized subset of masks.

**Recommendation:** Replace or supplement the boolean with meaningful coverage diagnostics: eligible terrain count, base-binding coverage, required normalized-mask coverage per terrain, transition pair coverage, rejected rows, duplicate keys, and explicit unresolved conditions. Preserve backwards compatibility if consumers depend on the current field.

### F-05 — Water bands are modeled as derived terrain keys; authoring policy needs to stay explicit

**Severity:** Medium  
**Evidence:** `terrain-engine.ts` includes `water`, `brackish`, `deepwater2`, and `deepwater`; `applyWaterDepthGradient()` derives water depth from distance to non-water terrain. The completion roadmap states water is derived and hidden from the manual palette, while `tile-palette.ts` defines entries for all four water keys. `editor-shell.tsx` imports `loadTerrainTiles` and filters water keys for the “BASIC” count, but the exact visible selection behavior needs runtime verification.

**Impact:** A semantic key may be valid for rendering while not being a directly paintable authoring tool. If these states are not clearly separated, a user may paint a derived water band that the derivation pass later overwrites.

**Recommendation:** Explicitly mark keys as authorable, derived-only, or render-only. Verify the UI actually hides derived water bands from selection while retaining them for renderer/resolver use. Add a test that authoring operations cannot accidentally persist a derived water depth contrary to the documented contract.

### F-06 — Resolver correctly separates logical terrain from visual projection, but all paths must be audited together

**Severity:** Positive finding with follow-up  
**Evidence:** `terrain-resolver.ts` documents that `MapDocument` remains semantic/source data and derives render masks/bindings without persisting a render variant. `terrain-autotile-apply.ts` returns variants while preserving the original document reference.

**Impact:** This matches the intended architecture. However, `resolveTerrainVariant()` and `resolveTerrainRenderCell()` are separate paths, so callers must use the intended approved-binding-aware path for production rendering. A direct resolver fallback must not be mistaken for an approved binding.

**Recommendation:** Trace production renderer and preview callers to verify which resolver path they use. Add a regression test ensuring no production path bypasses approval-aware binding resolution.

### F-07 — Neighbor mask contract is explicit in code, but documentation must mirror it exactly

**Severity:** Medium  
**Evidence:** `terrain-engine.ts` defines bits: N=1, E=2, S=4, W=8, NE=16, SE=32, SW=64, NW=128. `terrainCornerMask()` only marks a corner when the diagonal and both adjacent cardinal cells match. Out-of-bounds cells resolve to null.

**Impact:** The new specification must preserve this established bit order. Generic examples from other engines must not be copied in a way that silently changes it.

**Recommendation:** Add a direct link from the spec's mask contract to the implementation/test fixture; include a table of bit, offset, meaning, and boundary behavior. Keep corner-mask semantics separately documented from the 8-bit neighbor mask.

### F-08 — Current roadmap records broad implementation progress, but browser/runtime verification is not uniformly complete

**Severity:** Medium  
**Evidence:** `WORLD_MAP_EDITOR_COMPLETION_ROADMAP.md` marks many terrain and editor functions complete, while its diagnostic-view section still marks browser click-level verification pending for several views. This audit did not execute tests or a browser session.

**Impact:** A source-level implementation checkbox is not equivalent to proof of deployed behavior, and no current test results should be inferred from this document.

**Recommendation:** Keep source/unit, integration, database/binding, and browser/runtime evidence as separate status fields. Re-run targeted terrain tests and perform a live editor smoke test before closing the readiness audit.

## 4. Status matrix

| Area | Source-level assessment | Next evidence needed |
|---|---|---|
| Semantic terrain model | Present, 17 keys in engine | Confirm each key's role and canonical ownership |
| Palette | Present, 17 starter options | Verify production filtering and registry-failure behavior |
| 8-neighbor mask | Present, bit order explicit | Run unit tests and link mask contract |
| Corner mask | Present, constrained by diagonal + cardinals | Visual fixtures for all relevant junction shapes |
| Paint/erase/fill/shape tools | Roadmap marks core tools implemented | Re-run tests and verify runtime/undo/redo |
| Water depth | Derived gradient exists; roadmap says tested | Re-run targeted large-water regression |
| Transition registry | Two explicit verified pairs in source | Compare against current authoritative workbench |
| Binding approval | Loader checks candidate, asset, license ID, key and mask | Verify production callers and current data |
| Binding coverage | Incomplete by roadmap/source evidence | Build per-terrain required-mask coverage report |
| Variation | Roadmap marks deterministic utility implemented | Confirm caller integration and deterministic fixtures |
| Persistence | Existing MapDocument/persistence should remain authoritative | Verify save/load and runtime recovery on current branch |
| Browser UX | Some diagnostic views marked pending | Browser smoke test and evidence capture |

## 5. Recommended remediation order

1. **Reconcile terrain-key policy (F-01, F-05).** Decide which keys are directly paintable, derived-only, decorative, hazard, or staged.
2. **Harden palette mode behavior (F-02).** Ensure production UI cannot imply approval from starter fallbacks.
3. **Audit production resolver call sites (F-06).** Verify approved-binding-aware resolution is used wherever required.
4. **Improve coverage diagnostics (F-03, F-04).** Report real required coverage rather than a global count.
5. **Lock down topology tests (F-07).** Verify exact bit order, boundaries, corner rules, and junction fixtures.
6. **Run targeted test/runtime verification (F-08).** Record actual commands, counts, outcomes, and environment; do not infer success from source.

## 6. Explicitly not done

- No runtime source files changed.
- No Supabase query or schema mutation performed.
- No asset or binding was approved or created.
- No npm/Vitest test command was run.
- No browser interaction or deployment verification was performed.
- No new branch was created.

## 7. Conclusion

Vendrith has a substantial terrain foundation: semantic keys, neighbor masks, corner masks, derived water depth, transition classification, render-time resolution, safe fallbacks, and authoring tools are represented in source and the current roadmap. The next priority is not rebuilding terrain from scratch. It is reconciling the 17-key semantic/palette vocabulary with the six-key binding loader, making production palette approval behavior unambiguous, and measuring transition coverage using the real approved binding catalog.

This audit should be updated after targeted tests and a live runtime/binding check.
