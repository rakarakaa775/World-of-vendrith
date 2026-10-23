# Life Creator — Character Asset Audit (2026-10-22)

**Status: LOCAL CANDIDATES FOUND / PER-ASSET LICENSE AND COMPOSITING APPROVAL PENDING**

## Finding

The first repository-local inventory was too narrow: although `apps/map-editor/public` does not contain an audited portrait pack, the canonical staging library already includes thousands of assets, including character sprites under `assets/playable/playable/01_CHARACTERS/` and character-related assets under `assets/characters/`. This is a source candidate pool, not permission to make every file active. `assets/README.md` and `assets/_documentation/ASSET_LIBRARY_REGISTRY.md` explicitly state that storage is not usage and each asset requires reconciled source, license, attribution, binary and checksum evidence.

## Representative local candidates

Hashes and PNG header metadata below were read from the actual local files on 2026-10-22. All six files are 8-bit RGBA PNGs (PNG color type 6, so an alpha channel exists); that does not by itself prove visible transparency bounds, frame layout, or head anchors. This environment has no installed `sharp`, `pngjs`, `jimp`, ImageMagick `identify`/`magick`, `pngcheck`, or `exiftool`, so per-pixel alpha bounds and frame geometry remain unmeasured. `file` confirmed each PNG dimensions independently.

| Candidate | Dimensions | SHA-256 | Initial assessment |
|---|---|---|
| `assets/playable/playable/01_CHARACTERS/assets__hair0_f.png` | 1216×256 RGBA | `5189e47dffce0e3b673fafa5778c08531c3c56838b44c79ecfeeac254fc1864c` | Hair sprite-sheet candidate; source-specific license record still needs exact matching |
| `assets/playable/playable/01_CHARACTERS/Child_clothes__Child_hair_braid_gold.png` | 576×256 RGBA | `5507324bdc8a00d27016ffb300f075c67f78d9b9b6fa0f108e243a9bce1376a9` | Hair sprite-sheet candidate; pack-specific provenance/age design suitability review required |
| `assets/playable/playable/01_CHARACTERS/tilesets_edit__14_human_sprite_base.png` | 224×256 RGBA | `9449b2da86fc2522eaf216e88583a87e08b8bbc95ae79ca032f644c071dd7746` | Human sprite-base candidate; not yet established as a head-only portrait layer |
| `assets/playable/playable/01_CHARACTERS/Children__child_walk_orc.png` | 576×256 RGBA | `adaedfb7d1cbcd5dba0f4ea8cc164ef10588a0f5f2596f4b122ea31965412b71` | Orc character sprite candidate; animation sheet, not directly usable as portrait |
| `assets/playable/playable/01_CHARACTERS/Children__child_walk_darkelf2.png` | 576×256 RGBA | `34d899ede4607e9cb2926feab438ba63bf4cf737373bb8a125336aeab6f88e9a` | Dark-elf character sprite candidate; animation sheet, not directly usable as portrait |
| `assets/playable/playable/01_CHARACTERS/LPC_Dark_Elves__DA_male2.png` | 832×1344 RGBA | `8f63788e3e471f01c96ec9d22bdbb06eacbd0fb24b9583923a7a5cc4727bd28a` | Dark-elf sprite candidate; exact source/license mapping still required |

The existing `lpc_revised_-_elders_pack__Credits.txt` explicitly names its upstream repository, OGA-BY 3.0 license and contributor list for that elders pack only. That record must not be applied to unrelated filenames. `lpc_base_assets__CREDITS.TXT` names artists and lists some character-template filenames, but none of these six candidate filenames appears as an exact per-file credit entry in the inspected credit text. `lpc_male_clothes_variety__credits.txt` describes a separate male clothing pack and does not prove these candidates belong to it. Therefore **all six candidate licenses/provenance remain unresolved and pending**; no license has been inferred from filename similarity.

## Suitability for current Life Creator

Current Life Creator renders a stylized head portrait in procedural SVG and offers face shape, skin/hair/eye color, race, markings and hair silhouettes. The candidate files above are mostly full-body/animation sheets or hair sprite sheets, not ready-made portrait layers. They should not be linked to the UI until their frame geometry, transparent bounds, alignment/origin and compatible base layers have been measured. In particular, a full-body walk cycle must not be shown as if it were a face asset.

## Required next gate

1. Resolve each candidate to its exact upstream pack and asset-level license/credit record; unresolved entries stay `pending`.
2. Inspect dimensions (now recorded), per-pixel alpha bounds, frame grid and body/head anchor with a deterministic image decoder; the latter three remain unmeasured because no suitable decoder is installed in this environment.
3. Confirm the desired age/style scope and race coverage. Do not map an elf/orc sprite to Human or Aqua based only on filename.
4. Add approved references to the canonical asset registry, retaining source URL, source path, license, attribution, SHA-256 and repository path. Do not create a parallel registry or duplicate binaries.
5. Build a deterministic layered portrait compositor only after head/body geometry is verified. Keep the existing SVG fallback until real composite previews pass review.

No production asset is promoted by this report. No binary is copied, no database is changed, and no external license is inferred from a filename.

## Upstream LPC library research (2026-10-22)

Public upstream references located during the follow-up audit:

- Universal LPC Spritesheet Character Generator: https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/ — interactive selection for body type, head, hair, face, clothing and equipment. It exposes per-selection credits and license details, and exports PNG plus credits TXT/CSV. This is the strongest candidate for constructing reproducible modular character layers because the selection and attribution are coupled. Each chosen layer still needs its own credit/licence record captured with the export.
- LPC Revised repository: https://github.com/ElizaWy/LPC — project README states assets are organized by category and that each asset is listed in a nearby `credit.txt`; the project describes CC-BY-3.0 or OGA-BY 3.0 licensing. This repository-level statement is not enough to attribute any local file until its actual upstream path and matching credit record are confirmed.
- LPC base assets on OpenGameArt: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles — base pack page identifies CC-BY-SA 3.0 and GPL 3.0, with certain named artists' works additionally available under OGA-BY 3.0. These are pack-level terms; the applicable license depends on the exact artwork and its creator.
- LPC character collection on OpenGameArt: https://opengameart.org/content/lpc-character-sprites — a curated collection spanning multiple independent packs. The collection page itself warns that its generated credits file may be inaccurate and that attribution must be checked manually.
- LPC style-guide asset directory: https://lpc.opengameart.org/static/LPC-Style-Guide/build/assets.html — useful for comparing original base character and hair templates.

### Decision from online research

The public library and generator are valid source-discovery routes, but web search did not find exact filename matches for the six local candidates. No mapping from those local filenames to an upstream file has been established. Therefore their approval state remains `pending`; no public repository's general license is applied to them. Do not copy a generated spritesheet into the project without retaining its exact selected-layer credits and license list.

### Next implementation gate

1. Open the Universal LPC generator and select a consistent base/body, head, face, hair, and (where applicable) race-specific layers for a small test set.
2. Export the PNG and TXT/CSV credits together; retain original selection metadata and source URLs. Check whether the exported character style is appropriate for Life Creator's portrait view, since the generator primarily produces game spritesheets rather than head-only portraits.
3. Only register layers whose per-layer credit/license records are complete. Keep each layer `pending` until the export, attribution, SHA-256, dimensions, transparency and alignment have been inspected.
4. Do not overwrite or replace any of the six local candidates based solely on similarity of filename or art style.

## Pixel-level alpha and frame-grid inspection (2026-10-22)

A temporary Node.js PNG decoder (built-in `zlib`, PNG filters 0–4) was run against all six candidate files. The script was kept outside the repository and no binaries were modified. These results are measured from per-pixel alpha, not inferred from filenames:

| Candidate | Nontransparent bounds (x, y, width, height) | Detected occupied row bands | Detected occupied column bands | Geometry finding |
|---|---:|---|---|---|
| `assets__hair0_f.png` (1216×256) | (21, 13, 1175, 243) | y=13–38, 77–101, 141–165, 205–255 | 19 separated bands, mostly about 22–24 px wide, with roughly 64 px spacing | At least four horizontal frame rows; many repeated columns. Sprite-sheet, not one isolated portrait layer. |
| `Child_hair_braid_gold.png` (576×256) | (22, 21, 531, 222) | y=21–41, 86–116, 150–180, 214–242 | 9 bands, each about 19 px wide, roughly 64 px apart | Repeated multi-frame sheet; likely needs exact cell layout and layer anchor before use. |
| `14_human_sprite_base.png` (224×256) | (5, 12, 216, 233) | y=12–53, 76–116, 139–180, 204–244 | 7 bands with irregular 9–32 px gaps | Multi-cell base sheet; the spacing is not a simple 64 px uniform grid. Needs visual inspection before any crop rules. |
| `child_walk_orc.png` (576×256) | (20, 22, 535, 232) | y=22–62, 87–125, 151–190, 215–253 | 9 bands about 22–23 px wide, roughly 64 px apart | Four row bands and nine columns; consistent with a directional walk sheet, not portrait art. |
| `child_walk_darkelf2.png` (576×256) | (20, 22, 535, 232) | y=22–62, 87–125, 151–190, 215–253 | 9 bands about 22–23 px wide, roughly 64 px apart | Same broad geometry as the Orc walk sheet; keep as full-body animation candidate only. |
| `LPC_Dark_Elves__DA_male2.png` (832×1344) | (16, 16, 803, 1327) | 21 bands across y=16–1342, generally about 46–48 px high | 13 bands across x=16–818, varying roughly 31–50 px wide | Large multi-row animation/pose sheet; not a head-only layer. Exact cell meanings need visual review. |

**Important interpretation limit:** occupied row/column runs describe where alpha is nonzero; they are not proof of animation direction, cell origin, head anchor, or semantic layer ordering. In particular, the uneven occupied bounds can reflect sprite silhouettes inside transparent cells. The two child walk sheets' repeated ~64 px columns strongly suggest repeated frames, but a cropper must use source-defined cell origins and visual validation rather than these alpha bounds alone.

## Generator source confirmation

The official Universal LPC generator source README explains that each sprite can carry different license terms, including CC0, CC-BY-SA, CC-BY, OGA-BY and GPL; its credits TXT/CSV records selected images' licenses, original URLs and authors. The most restrictive included license can govern a composite. Consequently, a generated character cannot be treated as one generic “LPC license” asset; its exported credit manifest is part of the asset intake record.

Public source references:
- https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator
- https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/
- https://github.com/ElizaWy/LPC/blob/main/Characters/Credits.txt

The user's private `Asset-library-LPC_Finalized_Review.zip` and `ASSET_GAME_MASTER_2026-08-25_CLEANED.zip` are mentioned in the canonical registry but were not found as actual archive files in the connected `/workspaces` tree. They remain a potentially better provenance source; their existence in the registry is not proof that the current runtime workspace can read them.

## Six-workstream continuation checkpoint (2026-10-22)

The resumed audit was split into six focused workstreams: (1) repository/dirty-state safety, (2) catalog-to-UI usage, (3) exact credit-file matching, (4) character sprite inventory and frame suitability, (5) Life Creator UI scope, and (6) focused automated tests.

Verified on the connected workspace:

- Branch remains `feat/vendrith-ecc-v1`; HEAD remains `9057ef363a7b8f655d4661f3eb637671661f43ac` at the time of inspection. No branch switch, commit, push, deployment, or database write was performed.
- The worktree already contained 50 modified/untracked paths. All pre-existing changes were preserved; `git diff --check` passed.
- `assets/playable/playable/01_CHARACTERS/` contains 5,993 PNG files, so the local library is large enough to require indexed, provenance-aware selection rather than broad imports.
- Rechecked the six representative filenames against the local character credit/README text. None had an exact filename match in those inspected records. This does not prove that no source evidence exists anywhere; it means these candidates remain unverified and cannot be promoted on the evidence checked so far.
- The current Life Creator screen still renders procedural SVG portraits. The typed asset catalog is not yet wired into the UI, and the draft explicitly excludes equipment. This is a known implementation gap, not a completed sprite compositor.
- Focused tests: `editor/life-asset-catalog.test.ts` and `editor/life-creator-draft.test.ts` passed (2 files, 7 tests).
- `npm run typecheck` passed in `apps/map-editor`.

### Next safe implementation gate

Before integrating real sprites, produce an explicit manifest for each selected layer containing the exact source pack/path, original source URL, asset-specific license, attribution, SHA-256, dimensions, frame-grid/origin metadata, and intended z-order. Only after those checks should an approved modular character preview be connected to the UI. Do not treat the general LPC family or a similarly named pack's credits as proof for an individual file.

## Follow-up source-credit sweep (six workstreams, continued 2026-10-22)

A second pass searched the character folder for embedded source records and confirmed that it contains several pack-level credit files, including `lpc_base_assets__CREDITS.TXT`, `lpc_male_clothes_variety__credits.txt`, and `lpc_revised_-_elders_pack__Credits.txt`. This refines the earlier finding: relevant pack-level credit documents do exist, but the inspected records do not explicitly map all six selected renamed PNGs to their original filenames and licenses.

- The base-assets credits list character templates by Stephen Challener (Redshrike), and separately list `hairfemale.png` / `hairmale.png` by Manuel Riecke (MrBeast). This is evidence for those named source assets, not enough by itself to assert that `assets__hair0_f.png` is byte-for-byte or semantically the same source layer.
- The elders-pack credits identify Eliza Wyatt as the original artist, state that hair/clothing are based on Stephen Challener's LPC character base, and list OGA-BY 3.0 for that pack. This does not establish that `LPC_Dark_Elves__DA_male2.png` belongs to that pack; no filename-level link was found in the inspected credits.
- No specific credit mapping was found for `Child_clothes__Child_hair_braid_gold.png`, `tilesets_edit__14_human_sprite_base.png`, `Children__child_walk_orc.png`, or `Children__child_walk_darkelf2.png` in the inspected pack credit files.
- Recomputed SHA-256 and PNG IHDR dimensions for all six files match the previously recorded hashes/dimensions. These integrity hashes confirm the local candidates have not changed during this pass; they do not prove authorship or license.
- `life-asset-catalog.ts` currently has no production/UI caller; it is used only by its unit tests. Thus the catalog safety gate exists, but Life Creator does not yet consume it.
- The workspace has no accessible archive matching the registered `Asset-library-LPC_Finalized_Review.zip` or `ASSET_GAME_MASTER_2026-08-25_CLEANED.zip` names under the searched workspace tree. Do not assume either package is available locally.

### Decision

Keep all six candidates pending. The safest next source-selection route is to extract a small character set from the official Universal LPC generator while retaining its generated per-selection `CREDITS.csv` / text credits and layer metadata. Its official README explicitly says that the credits list each included image's author, license(s), and original URL; licenses vary per image, so a generic LPC-family label is insufficient. See https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/blob/master/README.md.

No source binaries were edited or copied, no asset was marked approved, and no runtime/UI behavior was changed in this pass.

## Continuation checkpoint (2026-10-22, next pass)

The official Universal LPC generator documentation confirms that the selected layer credits CSV records authors, per-image licenses, and original URLs; it also warns that individual licenses may impose different obligations. The export must retain that file as a discoverable game/app credit artifact. See https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/blob/master/README.md.

Focused revalidation after the previous checkpoint: Life Creator draft and asset-catalog tests passed (2 files, 7 tests); TypeScript passed. The existing typed catalog still has no production UI caller. A proposed sprite-grid geometry helper was not written because the workspace write command was blocked; no code was changed in this pass. Next implementation should start with a separately tested geometry contract (image size, frame size, grid origin, anchor and z-order), then integrate only a provenance-approved layer.


## Six-workstream implementation pass — sprite geometry contract (2026-10-22)

Added `apps/map-editor/editor/life-sprite-sheet.ts` and focused tests in `apps/map-editor/editor/life-sprite-sheet.test.ts`. This is a metadata-validation contract only, not a cropper or renderer. It validates positive image/frame/grid dimensions, non-negative grid origin and frame anchor, integer z-order, that the declared grid fits within the image, and exact frame-size compatibility. It intentionally does not infer frame dimensions from alpha bounds.

Validation on the connected workspace:
- Focused Life Creator tests: 3 files passed, 11 tests passed.
- `npm run typecheck`: passed (exit code 0).
- `git diff --check`: passed.
- Branch remains `feat/vendrith-ecc-v1`; HEAD remains `9057ef363a7b8f655d4661f3eb637671661f43ac`.
- Worktree status count is now 52 paths (the prior 50 plus the two newly added geometry contract/test files). Existing worktree changes were not reset or reverted.

The contract deliberately does not assign geometry to the six pending PNG candidates: source-defined cell sizes, anchors and layer order have not yet been confirmed. The Life Creator UI is still on procedural SVG and the catalog is still not integrated. No asset was approved, no binaries were copied/changed, no commit/push/deploy was made, and no database was touched.

### Next gate
Resolve exact source metadata and frame definitions for a small, consistent set of layers; add catalog entries only when license, attribution, hash and repository path are verified; then implement and test a deterministic compositor with the SVG fallback retained.


## Six-workstream implementation pass — deterministic layer planning (2026-10-22)

Added `apps/map-editor/editor/life-sprite-layer-plan.ts` with tests. This creates a metadata-only plan from the existing provenance-gated asset catalog and the source-verified geometry contract. Only approved, license-verified assets enter the plan; missing geometry and duplicate IDs fail closed; z-order is deterministic (z-index, then asset ID). It intentionally does not crop or render image binaries, infer sprite cells, or approve candidate assets.

The current Life Creator UI remains on its existing SVG preview. Connecting the planner to a real sprite renderer is still gated on verified per-file source attribution and sheet-definition geometry. The repository's general LPC credit files identify artists and packs but do not, by themselves, map every candidate filename to a precise source record.
