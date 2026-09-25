# Vendrith repository instructions

Read `AGENTS.md` first. It is the canonical repository-wide agent guidance; this file adds GitHub Copilot-specific context.

## Project
Vendrith is a Next.js/React + TypeScript game-development project centered on a PixiJS Map Editor. Domain map data must remain independent from rendering.

## Working rules
- Work on the requested feature branch; do not modify `main` unless explicitly requested.
- Inspect existing contracts, tests, and `.ai/` guidance before changing Map Editor behavior.
- For unfamiliar APIs or external assets, research authoritative sources before implementation.
- Preserve typed, serializable, versioned domain state.
- Keep PixiJS as a rendering/interaction layer, not the canonical map-data model.
- Do not add Phaser to the active editor stack unless explicitly required by an architecture decision.
- Preserve asset provenance, licensing, and attribution metadata.
- Never commit secrets or credentials.
- Prefer small, reviewable commits.

## Map Editor
Use the repository's preferred flow: Tool -> Command -> State -> Renderer.

When changing terrain, serialization, persistence, history, conflict resolution, or save-slot behavior:
- update the relevant contract tests;
- preserve backward/forward validation boundaries;
- keep local editor history separate from durable database history;
- treat durable map versions as authoritative when resolving recovery/conflicts;
- fail closed when asset provenance or approval metadata is incomplete.

## Validation
Use the smallest appropriate validation pipeline for the change, then expand when risk warrants it:
1. typecheck/lint for affected code;
2. focused unit/contract tests;
3. Map Editor test suite;
4. build/runtime or browser verification when UI/runtime behavior changes;
5. review the final diff and document durable architectural decisions under `.ai/memory/`.

Do not claim a check passed unless it was actually run or its GitHub Actions result was verified.
