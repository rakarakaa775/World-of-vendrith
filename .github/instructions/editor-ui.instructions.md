---
applyTo: "apps/map-editor/components/**/*.tsx,apps/map-editor/**/*.tsx"
---

# Vendrith Map Editor UI instructions

Before changing editor UI, inspect `.ai/skills/editor-ui/SKILL.md`, the Map Editor contracts, and the relevant component tests.

## UI architecture
- Optimize for editor productivity and clarity rather than marketing-page aesthetics.
- Keep toolbar, tool palette, panels, canvas overlays, inspector, dialogs, and status/conflict feedback clearly separated.
- Prefer existing shared components and composition over bespoke markup.
- Keep transient UI state separate from canonical MapDocument/domain state.
- Do not let presentation state silently mutate persistent map data.

## Interaction states
- Every interactive control should have clear hover, focus, disabled, loading, and error behavior when applicable.
- Long-running save/load/version actions must prevent duplicate submission.
- Destructive actions require appropriate confirmation.
- Surface meaningful state transitions, including saving, saved, loading, conflicts, and failures.
- Provide useful empty/loading/error states for panels and asset browsers.

## Accessibility
- Preserve keyboard accessibility and predictable focus.
- Use semantic controls and labels where possible.
- Do not make essential editor actions mouse-only.

## Map Editor integrity
- UI changes must preserve Tool -> Command -> State -> Renderer boundaries.
- Save/version dialogs must not bypass persistence validation or authoritative-version rules.
- Conflict feedback must reflect the actual conflict/recovery state rather than inventing UI-only success.
- Asset and license metadata shown to users must remain consistent with the approved provenance boundary.

## Verification
- Add or update focused component/interaction tests for changed behavior.
- For runtime UI changes, verify the relevant browser surface when practical.
- Review disabled/loading/error states, keyboard behavior, and destructive-action paths before claiming completion.
