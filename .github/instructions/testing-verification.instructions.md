---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,.github/workflows/**/*,.ai/skills/verification/**/*"
---

# Vendrith testing and verification instructions

Before changing tests or verification workflows, inspect .ai/skills/verification/SKILL.md, the affected domain contracts, and the existing CI workflow.

## Verification ladder
Use the smallest appropriate pipeline for the change, then expand according to risk:

1. TYPECHECK
2. LINT
3. FOCUSED TESTS
4. MAP EDITOR TEST SUITE
5. BUILD
6. BROWSER/RUNTIME VERIFICATION
7. FINAL DIFF REVIEW

Do not claim a stage passed unless it was actually run or the corresponding GitHub Actions result was verified.

## Test quality
- Test behavior and contracts, not implementation details.
- Preserve existing assertions when fixing failures; investigate the contract mismatch first.
- Prefer deterministic, isolated tests with explicit fixtures.
- Cover invalid inputs and failure paths at trust boundaries.
- Add regression coverage for every discovered bug that changes a contract.
- Do not weaken, skip, or delete a test solely to make CI pass.

## Map Editor coverage
When relevant, verify:
- MapDocument schema and serialization round trips.
- Map history and undo/redo semantics.
- Terrain masks and deterministic autotiling.
- Render-diff and incremental rendering behavior.
- Save-slot validation and world/playable-map relationships.
- Three-way merge, deletion-vs-edit behavior, and stale-version conflict handling.
- Asset provenance and approval gates.

## CI and workflow changes
- Keep workflow changes minimal and explicit.
- Do not introduce credentials, tokens, or environment-specific secrets into workflow files.
- Prefer reproducible dependency installation and pinned/lockfile-consistent tooling.
- Ensure workflow assertions reflect the actual contract rather than a weaker substitute.

## Final review
Before completion, inspect the final diff, changed files, test results, and any architectural documentation that should be updated. Record durable decisions in .ai/memory/ when appropriate.
