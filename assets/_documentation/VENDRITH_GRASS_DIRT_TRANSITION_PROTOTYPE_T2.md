# Vendrith Grass–Dirt Transition Prototype T2

**Status:** Generation submitted; visual QA and extraction pending.  
**Branch:** `feat/vendrith-ecc-v1`

## Generation record

- Provider: OpenArt
- Model: Kling 3 Omni (image generation)
- History ID: `bGfxQrjvxaoprdHarYSp`
- Target: 1:1, 1K
- Scope: one focused grass-to-dirt transition concept, not a complete tileset.

## Intent

This focused concept narrows the first production experiment to one material pair. The target visual language is original hand-painted 2.5D fantasy ground, orthogonal top-down readability, upper-left lighting, muted sage/emerald grass, warm umber/ochre earth, controlled painterly texture, and a natural but legible boundary.

## Acceptance checks

- [ ] Generation completes and source output is available without a preview watermark.
- [ ] Boundary remains readable at small scale and does not become a muddy blend.
- [ ] Brushwork, lighting, and palette align with the Vendrith visual consistency standard.
- [ ] Source is suitable for manual cleanup; no text, symbols, props, or unrelated elements.
- [ ] Produce actual square master/runtime tiles only through deliberate extraction or repainting, not by blindly cropping an AI concept.
- [ ] Validate seamless edges and required eight-neighbor masks in the renderer.
- [ ] Add provenance, license status, dimensions, alpha mode, checksum, and schema validation before review for runtime binding.

## Current restriction

The output is a concept reference. Do not place it in runtime asset directories, create an approved binding, or mark it production-ready until the checks above are completed. The generated image does not itself prove seamlessness or renderer compatibility.
