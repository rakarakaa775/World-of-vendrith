# Vendrith External Resource Audit & Engineering Rules v1

**Status:** Adopted working rules for future implementation
**Audit date:** 2026-10-17
**Scope:** World of Vendrith, especially Map Editor and Creator AI
**Required branch:** `feat/vendrith-ecc-v1`

## Purpose

External repositories and articles are references, not authorities over Vendrith architecture. We audit patterns, risks, fit, and verification cost before adopting anything. Preserve existing project contracts unless a documented decision authorizes a change.

## Four-resource audit

### 1. Open Higgsfield AI — reference implementation
Source: https://github.com/sunnychase/open-higgsfield-ai

**Useful patterns**
- Model/provider catalog separated from UI controls.
- Submit/poll asynchronous job flow with a request identifier.
- Model capability metadata for controls such as resolution/aspect ratio.
- Generation history and previews as first-class UX.

**Risks / do not copy blindly**
- The project is an image/cinema studio, not a map editor or game engine.
- Its documented API key flow uses browser localStorage. Vendrith must not expose provider secrets in client bundles, browser storage, logs, or committed files.
- The remote Muapi dependency and its costs/availability must be explicit; “open source” does not mean model inference is free.

**Vendrith decision:** Adopt only the general provider-catalog, typed asynchronous job, progress/result/error, and history/preview patterns where they fit Asset Library or AI-generated asset workflows. Server-side credentials and ownership checks are mandatory.

### 2. Ornith-1 repository — model/provider integration reference
Source: https://github.com/ornith-ai/Ornith-1

**Useful patterns**
- OpenAI-compatible serving interface can reduce coupling to one model vendor.
- Model checkpoints and quantization/runtime choices are explicit.
- Tool calls can be routed through a structured interface instead of parsing free-form text.

**Risks / do not copy blindly**
- The larger model variants require substantial GPU/multi-GPU resources; local or hosted deployment is not assumed affordable.
- Compatibility with an OpenAI-style API does not itself establish quality, safe tool use, latency, or licensing suitability for every deployment.
- A model must not receive direct authority over repository writes, map state, database operations, or deployment.

**Vendrith decision:** Keep `ModelProviderPort` and the existing provider adapter boundary. Consider Ornith only as an optional provider after a cost/latency/tool-call evaluation; do not make it a required dependency.

### 3. Ornith-1.5 article — self-improvement research
Source: https://ornith.ai/ornith_1_5.html

**Useful ideas**
- Evaluate agents against repeatable tasks and measurable outcomes.
- Treat task generation, scaffolding, solution attempts, and reward/evaluation as distinct stages.
- Track evidence and compare results rather than trusting self-reported success.

**Risks / do not copy blindly**
- The described self-improvement/training loop is research infrastructure, not a drop-in feature for Vendrith.
- Training or reinforcement-learning loops add compute cost, evaluation complexity, and risk of optimizing a proxy instead of game-engine correctness.
- Generated tests/tasks need validation; model-generated evidence cannot be its own sole proof.

**Vendrith decision:** Adopt deterministic evaluation fixtures, regression tasks, explicit success criteria, and reviewable run traces. Defer model self-training, autonomous policy updates, and reinforcement-learning infrastructure.

### 4. Developer Roadmap — information architecture reference
Source: https://github.com/kamranahmedse/developer-roadmap

**Useful patterns**
- Structured, metadata-driven learning/reference content.
- Clear progression, dependencies, and navigation through complex subject areas.
- Separate content data from its visualization/presentation.

**Risks / do not copy blindly**
- A learning-roadmap product is not a map-authoring engine.
- Do not copy roadmap content, illustrations, or media wholesale.
- Do not add tutorials, roadmap UI, or a new framework before core Map Editor acceptance gates are met.

**Vendrith decision:** Apply the data/presentation separation and explicit metadata/dependency concepts to internal documentation, asset catalogs, and phase gates. Keep the existing Next.js + TypeScript + PixiJS architecture.

## Mandatory engineering rules from this audit

1. **Inspect before changing:** verify repository, branch, current HEAD, worktree state, instructions, architecture, and relevant tests before implementation. Never create a branch for this workflow.
2. **Spec before code:** clarify acceptance criteria and unknowns; write or update a short spec and split the work into small, ordered tasks.
3. **One source of truth:** preserve canonical `MapDocument` / `MapHistory`; derived render state, projections, previews, and caches must not become competing authorities.
4. **Propose → policy → execute → verify:** AI output is a proposal only. Existing policy, ownership, validation, collision, and game rules remain authoritative.
5. **Smallest safe change:** no broad refactors or duplicate systems to fix a local defect. Keep diffs scoped and reviewable.
6. **Test the behavior, not just the helper:** add regression tests for the failure mode, run focused tests, then run typecheck/build and relevant wider suites when available.
7. **Evidence-based completion:** report exact checks and outcomes. Never call a test, browser check, CI run, or deployment successful unless observed for the exact change.
8. **Fail closed on invalid state:** reject malformed or out-of-scope assets, stale versions, unauthorized actions, and invalid terrain/object data; do not silently repair or bypass validation.
9. **Security and cost by default:** secrets server-side; ownership validated at trusted boundaries; no paid Supabase branch, no production DB/schema changes without explicit approval; no unapproved deployment/promotion.
10. **Document traceability:** record material changes in the Map Editor Change Log and Status Log, including tests, limitations, and remaining verification.
11. **Roadmap gates are mandatory:** complete the current Map Editor phase and its exit criteria before starting later phases. Browser behavior must be verified where a phase requires it.
12. **No external dependency by imitation:** external repositories/articles inform design decisions, but every adoption needs a concrete Vendrith use case, risk assessment, and acceptance test.
13. **No repeated loops:** after a task passes its gate, mark it complete and move to the next open roadmap item; do not keep redoing Save/Load unless new evidence shows a regression.
14. **Keep the user’s constraints:** remain on `feat/vendrith-ecc-v1`; preserve uncommitted work; never stage broad changes; do not touch production DB; do not introduce paid services as a requirement.

## Immediate Map Editor continuation

Repository audit indicates Save Slot CI coverage has advanced, but hosted authenticated non-production integration and browser/session E2E are still release blockers. Do not mislabel those as complete.

The completion roadmap identifies **Phase 2F — Object / Asset Placement** as an open area, with remaining requirements including scatter, deterministic random placement, and collision-aware placement. Before implementing, inspect the current placement model, tool routing, MapDocument mutation path, collision rules, asset-scope/approval validation, and tests. All placements must commit through the canonical editor history path (for example, the documented `commit(result.document)` boundary) so rendering, undo/redo, and persistence stay consistent.

### Phase 2F acceptance gate
- Object placement is represented in canonical MapDocument state, not canvas-only visuals.
- Selection, move, delete, copy/paste, and stamps preserve identity and map-scale eligibility.
- Collision-aware placement refuses invalid overlap/blocked cells without bypassing existing collision/navigation rules.
- Scatter/random placement is deterministic for a recorded seed and inputs.
- Undo/redo and save/load round-trip placement results.
- Regression tests cover valid placement, rejected placement, deterministic repeatability, undo/redo, and serialization round-trip.
- Browser click-level verification is recorded separately from unit tests.
- No production database changes or new paid dependencies are required.

## Verification status

- This document records an audit and rules; it does not claim the external projects were installed or integrated.
- Desktop Commander devices were offline during this session, so local worktree cleanliness and browser interaction could not be inspected through that connection.
- The GitHub branch `feat/vendrith-ecc-v1` exists. Before code changes, re-verify its latest HEAD and inspect the current placement implementation and tests.
