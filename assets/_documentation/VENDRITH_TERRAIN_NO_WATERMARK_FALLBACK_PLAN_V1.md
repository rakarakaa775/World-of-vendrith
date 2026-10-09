# Vendrith Terrain No-Watermark Fallback Plan V1

Status: APPROVED DIRECTION — planning only; no production art is promoted by this document.

## Decision

OpenArt watermarked previews are concept references only. Do not place them in runtime asset directories, bind them to terrain keys, crop around or erase watermarks, or describe them as production-ready source files. Do not require a paid upgrade merely to continue terrain engineering.

## Goal

Continue the original Vendrith hand-painted 2.5D terrain pipeline without depending on a watermarked AI export. The runtime target remains an orthogonal grid with 32×32 runtime tiles and a possible 64×64 master workflow, subject to renderer validation.

## Preferred fallback order

1. **Original hand-authored source** — draw new terrain tiles in a pixel-art/raster editor from a written visual standard, with no tracing or reuse of third-party pixels.
2. **Programmatically generated base material** — generate original RGBA grass, dirt, sand and water base tiles from deterministic rules (layered color fields, clusters, noise, and controlled edge shapes). Keep source code and parameters so the result is reproducible. This is a technical prototype, not automatically final art.
3. **Approved open-license assets** — only when the exact source file, license text, attribution obligations, and modifications are recorded and reviewed. Existing assets remain quarantined until this gate passes.
4. **AI concept references** — use only for broad mood/color guidance; do not ship watermarked previews or trace their specific shapes.

## Technical sequence

1. Lock the visual standard: orthogonal top-down 2.5D, consistent upper-left light, restrained palette, readable silhouettes, no perspective mismatch.
2. Produce one original base tile per material before attempting a full atlas.
3. Validate tile dimensions, PNG/RGBA output, alpha behavior, seamless edge continuity, and visual readability at native 32×32 size.
4. Implement and test the 8-neighbor mask convention against the current runtime; do not assume a generated 3×3 concept sheet corresponds to runtime mask indices.
5. Create grass↔dirt transition variants only after base materials pass review. Verify all required masks and corners, not just one attractive sample.
6. Record SHA-256, provenance, license status, material, role, dimensions, and validation status in each asset metadata record.
7. Bind to runtime only after visual review, metadata validation, license review, and renderer tests pass.

## Stop conditions

- A watermark is present or clean export provenance is uncertain.
- License or attribution requirements cannot be established.
- A tile has seams, inconsistent lighting, muddy silhouettes, or unreadable transitions at native size.
- A non-base transition mask is missing or the renderer's mask-bit ordering has not been verified.
- Metadata or automated checks fail.

## Current status

- T0/T1/T2 OpenArt outputs remain concept-only.
- No watermarked preview is promoted as a runtime asset.
- No production tile or runtime binding is claimed by this plan.
- Next practical implementation task: inspect the actual mask-bit ordering in the current terrain code, then build a small reproducible QA harness for original tiles. This work can proceed without any image-generation credits.
