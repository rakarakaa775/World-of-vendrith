# Vendrith Grass–Dirt Source Intake and Tile QA Plan

**Branch:** `feat/vendrith-ecc-v1`  
**Related concept:** `VENDRITH_GRASS_DIRT_TRANSITION_PROTOTYPE_T2.md`  
**Status:** Prepared; blocked on obtaining an unwatermarked source export.

## Current evidence

- OpenArt reports T2 generation `bGfxQrjvxaoprdHarYSp` as completed.
- Provider-reported output metadata is 1024×1024 PNG.
- The currently available result URL is a watermarked preview. It is not accepted as a production source.
- A follow-up generation request for a 3×3 transition study was rejected for insufficient OpenArt credits. No repeat attempt was made.
- No file has been downloaded, extracted, checked for alpha, hashed, or added to runtime asset folders.

## Source intake gate

Before local processing, obtain the original image using OpenArt's own project/result interface and export/download controls. Preserve the original filename and record the export date and source generation ID. Do not attempt to remove or crop out a watermark as a substitute for obtaining the permitted clean source.

If a clean source export is not available, stop at concept/reference status. Do not add the watermarked preview to the game.

## Proposed first prototype deliverable

Create one small manually refined grass–dirt transition sample from the clean source:

- Master canvas: 64×64 px RGBA PNG.
- Runtime candidate: 32×32 px RGBA PNG, only after the renderer scale check confirms this size is correct.
- Material pair: `grass` + `dirt`.
- Role: `transition`.
- Orthogonal tile grid; hand-painted oblique lighting is allowed, diamond/isometric grid geometry is not.
- Lighting direction: upper-left.
- Keep transition edge inside the cell unless the renderer contract explicitly supports overhang.
- Maintain legibility at 1:1 and normal gameplay zoom.

This is a prototype target, not a claim that these files exist.

## Required QA sequence

1. **Source:** verify clean export, generation ID, and provenance.
2. **Visual:** inspect material separation, color harmony, brushwork, edge shape, and accidental artifacts.
3. **Binary:** verify file opens, PNG format, exact dimensions, RGBA mode, and alpha behavior.
4. **Integrity:** calculate SHA-256 on the final exact file bytes.
5. **Metadata:** populate `VENDRITH_TERRAIN_ASSET_METADATA_V1.schema.json`; validate against the schema with a real JSON Schema validator.
6. **Seams:** test every intended edge/corner configuration in a contact sheet and on a repeated map grid.
7. **Renderer:** test the actual map editor / Pixi draw path and the correct 8-neighbor mask mapping. Do not guess mask IDs from the artwork.
8. **Governance:** ensure provenance and license registry evidence are complete; keep status at `draft` or `visual_review` until all gates pass.
9. **Integration:** only after approval, create the reviewed binding candidate; do not mutate runtime database rows as part of concept intake.

## Stop conditions

Reject or pause if any of these are true:

- Only a watermarked preview is available.
- The transition becomes muddy or changes apparent light direction.
- Repeated tiles expose seams or inconsistent texture scale.
- The PNG dimensions, alpha mode, metadata, checksum, or schema validation do not match.
- Provenance/license status or required runtime binding evidence is missing.

## Current decision

**No production asset promotion yet.** The most useful next action is obtaining the clean T2 source export. Until then, repository-side work is limited to documentation and test planning; it cannot honestly establish visual quality, seam integrity, or runtime compatibility.
