# Vendrith Terrain Concept Review — T0/T1

**Status:** Concept generation completed; visual QA and production extraction are still pending.  
**Branch:** `feat/vendrith-ecc-v1`  
**Purpose:** Track generated art-direction references without confusing them with approved runtime assets.

## Generated references

### T0 — Material direction

- Provider: OpenArt
- Model: Seedream 4.5
- History ID: `13TZ2987pSN75xNosAOc`
- Requested output: 2K, 4:3
- Preview: https://cdn.openart.ai/watermarked_images/flVfKEL5z3U8jdx9jpcD/thumbnail_f1490c86_1791524315152.webp
- Intended subjects: grass, dirt, sand, shallow coastal water, deep water, and example transitions.

### T1 — Transition study

- Provider: OpenArt
- Model: Seedream 4.5 (image-to-image, T0 used as style reference)
- History ID: `NmiQpE1Zbo53qbDhV1Zp`
- Requested output: 2K, 4:3
- Preview: https://cdn.openart.ai/watermarked_images/flVfKEL5z3U8jdx9jpcD/thumbnail_a7aeda2a_1791524499884.webp
- Intended subjects: grass–dirt, grass–sand, sand–shallow-water, and shallow-water–deep-water transition examples.

## Important limitations

- These are generated concept/reference sheets, **not approved runtime sprites**.
- The preview URLs are watermarked OpenArt CDN previews. Do not copy them into the runtime asset folders or treat them as final downloadable source files.
- Generated contact sheets can contain uneven cells, accidental seams, inconsistent boundaries, or details that do not tile seamlessly. A visually appealing sheet alone does not prove autotile compatibility.
- No runtime asset binding, license approval, metadata validation, checksum verification, or in-engine test is implied by this document.
- No production art file has been added by this step.

## Review gate before production

- [ ] Inspect both complete images at full resolution; confirm no unwanted artifacts or text.
- [ ] Confirm consistent top-down orthogonal presentation, upper-left lighting, palette, brushwork, and scale.
- [ ] Select one material pair for a small controlled prototype (recommended: grass–dirt first).
- [ ] Obtain an unwatermarked export/source image from the provider before attempting extraction.
- [ ] Extract each tile to the agreed master size; create a 32×32 runtime variant only after visual approval.
- [ ] Test edge/corner combinations against the existing 8-neighbor mask behavior; do not infer mask indices from a concept sheet.
- [ ] Validate PNG RGBA, metadata schema, source/provenance, license status, checksum, and renderer compatibility.
- [ ] Run a map-editor seam test before proposing any runtime binding.

## Next action

Perform visual QA of T0 and T1, then generate or manually refine one narrowly scoped grass–dirt transition prototype. Keep all concept outputs quarantined from production runtime assets until every review gate passes.
