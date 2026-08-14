# 05 — Asset Rules

> The Vendrith World — permanent standards for every asset used in the project.
>
> An "asset" is any art, audio, data, or generated content that ships with the game.
> These rules apply to every asset, present and future, regardless of source or format.

---

## 1. Asset Philosophy

Assets are long-lived project resources. They are managed with the same rigor as code.

- **Organized.** Every asset has a defined home folder. No asset floats loose in the repository.
- **Traceable.** Every asset's origin, license, and history are recorded. The project can always answer: where did this come from, and may we use it?
- **Reusable.** Assets are structured so any system can reference them, not just the one they were made for.
- **Replaceable.** An asset can be swapped for another without breaking the systems that reference it, because systems reference registry entries, not raw files.
- **Legally documented.** No asset enters the project without a recorded, compatible license. Unknown provenance is disqualifying.

---

## 2. Asset Pipeline

Every asset follows this pipeline. No asset may skip the review process.

```
Inbox
   ↓
Review
   ↓
Registry
   ↓
Core or Expansion
   ↓
Game Ready
   ↓
Archive (if deprecated)
```

- **Inbox.** New assets land in `src/assets/inbox/`. They are unsorted and not yet referenced by any system.
- **Review.** An asset is inspected for quality, format, style consistency, and legal compatibility. Assets that fail review are rejected or returned to the sender.
- **Registry.** A reviewed asset is registered with full metadata in `src/assets/registry/`. An asset is not part of the project until it is registered.
- **Core or Expansion.** The registered asset is promoted to `src/assets/core/` (base game) or `src/assets/expansions/` (scoped content), depending on its destination.
- **Game Ready.** The asset is formatted, named, and referenced through its registry entry. It is now usable by systems.
- **Archive.** A deprecated asset moves to `src/assets/archive/`. Deprecated assets are never deleted outright — they are retained for reference and traceability.

---

## 3. Asset Registry

Every asset must have a registry entry with the following metadata:

- **Asset Name** — the canonical, unique identifier for the asset.
- **Asset Type** — category (e.g. texture, audio, model, data, generated image).
- **Source** — where the asset was obtained or produced.
- **Creator** — the original author or generator.
- **License** — the specific license under which the asset is used.
- **Version** — the asset's version, incremented when the file is replaced.
- **Folder** — the asset's home folder (core, expansions, generated, archive).
- **Tags** — searchable descriptors for discovery and reuse.
- **Status** — current lifecycle state (inbox, reviewed, active, deprecated, archived).
- **Date Added** — when the asset entered the registry.

The registry is the single source of truth. If an asset is not in the registry, it does not exist as far as the project is concerned. Systems reference registry entries, never raw file paths.

---

## 4. Folder Rules

The asset folder structure is fixed. No random folders.

- **`src/assets/inbox/`** — raw, unsorted incoming assets awaiting review. Nothing here is referenced by the game.
- **`src/assets/registry/`** — the manifest and metadata for all assets. The single source of truth.
- **`src/assets/core/`** — approved assets used by the base game.
- **`src/assets/expansions/`** — assets scoped to expansions or DLC, kept separate from core.
- **`src/assets/generated/`** — AI-generated or procedurally produced assets, tracked separately from hand-made assets.
- **`src/assets/archive/`** — deprecated assets retained for reference. Never deleted outright.

No new asset folders are created without Lead Architect approval and documentation.

---

## 5. Licensing Policy

Every asset must record its license and any attribution requirements. An asset with an unknown or incompatible license must not enter the project.

Acceptable license categories:

- **CC0 / Public Domain** — no attribution required, safe for any use.
- **Commissioned Work** — produced for the project under a written agreement granting the necessary rights.
- **Self-Created** — produced by the project team, owned by the project.
- **AI-Generated** — produced by an AI tool, where the output is legally usable for the project's purpose. The tool, prompt, and date are recorded.

Unacceptable:

- Assets with unknown provenance.
- Assets under licenses that prohibit commercial use, modification, or redistribution required by the project.
- Assets whose attribution requirements the project cannot satisfy.

The license is recorded in the registry entry at review time, before the asset is promoted.

---

## 6. Naming Standards

- All asset filenames use `snake_case`.
- Names describe content, not author or date (`stone_wall_texture`, not `john_2024_01.png`).
- No spaces, no special characters, no version numbers in filenames. Versioning is tracked in the registry, not the filename.
- File extensions are lowercase and standard for the asset type.
- The registry entry name and the filename are consistent and traceable to each other.
- No duplicate filenames across the project. If two assets would share a name, one is renamed before registration.

---

## 7. Quality Standards

Minimum quality expectations for every asset that reaches Game Ready status:

- **Correct resolution.** The asset meets the resolution required for its use case. No upscaled placeholders pretending to be final.
- **Correct format.** The asset uses the format defined for its type. No legacy or editor-only formats in shipped content.
- **Consistent style.** The asset matches the visual and audio direction defined in `docs/assets/Asset_Style_Guide.md`.
- **No duplicates.** No two registered assets serve the same purpose at the same quality level. Duplicates are consolidated before promotion.
- **Production-ready.** The asset is final, not a draft. Work-in-progress assets stay in `inbox/` until they are finished.

---

## 8. AI Generated Assets

AI-generated assets are a distinct category and are tracked separately.

- AI assets live in `src/assets/generated/`, not in `core/` or `expansions/`.
- The registry entry for an AI asset records the tool, the prompt or parameters, and the generation date.
- AI assets go through the same review process as any other asset. They are not exempt from quality or style checks.
- The legal usability of the AI output is confirmed before the asset is registered. If the tool's terms do not permit the project's use, the asset is rejected.
- AI assets are versioned. Regenerating an asset with a new prompt or tool increments the version in the registry.
- AI assets are never mixed into `core/` or `expansions/` without being re-categorized through an approved decision.

---

## 9. Future Expansion

- Future asset packs integrate through the registry, not by dumping files into folders. A new pack is registered entry by entry.
- New packs do not break existing assets. Registry names are unique; a new pack cannot overwrite an existing entry.
- Expansion packs live in `src/assets/expansions/` and are scoped to their expansion. They do not leak into core references.
- When an expansion is deprecated, its assets move to `archive/` with their registry entries preserved.
- The asset system is additive. New sources, formats, and categories extend the registry; they do not redefine it.
