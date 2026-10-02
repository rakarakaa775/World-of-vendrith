---
applyTo: "assets/**/*,apps/map-editor/**/*.{ts,tsx},database/**/*"
---

# Vendrith asset pipeline instructions

Before changing asset intake, terrain binding, tileset integration, or asset metadata, inspect `.ai/skills/asset-pipeline/SKILL.md`, provenance records, license metadata, relevant database contracts, and focused tests.

## Provenance boundary
- Follow SOURCE -> IDENTIFY -> LICENSE -> METADATA -> VALIDATE -> IMPORT -> NORMALIZE -> INDEX -> USE.
- Preserve creator, source URL, license, attribution requirements, and usage restrictions.
- Do not infer or fabricate missing authorship, licensing, or provenance.
- Unclear or conflicting licenses remain unresolved and must not be treated as approved.
- Never bypass an approval or provenance gate merely because an asset appears visually suitable.

## Asset metadata
- Keep asset identity stable across normalization and indexing.
- Preserve source and attribution metadata when copying or transforming assets.
- Record transformations when they materially affect the asset or its provenance.
- Keep terrain/tileset bindings auditable and explainable.

## Terrain and tilesets
- Verify external tileset formats and terrain conventions before mapping tile IDs.
- Preserve the source terrain mask/corner ordering; do not introduce a second convention.
- Deterministic autotiling mappings require focused contract tests.
- Fail closed when required asset approval, license, or provenance metadata is missing.
- Do not silently substitute an unverified asset for an approved binding.

## Database integration
- Treat database approval/provenance records as authoritative at the configured trust boundary.
- Keep asset registry, binding candidates, provenance verification, and license registry semantics distinct.
- Do not mutate production asset approvals without explicit authorization.
- Keep migrations and binding changes covered by focused tests.

## Verification
- Test license/provenance gates, invalid metadata, terrain mappings, and import/normalization round trips.
- Review the final diff for accidental asset duplication, metadata loss, or unapproved source usage.
- For external assets, retain enough provenance to reproduce the source and attribution decision.
