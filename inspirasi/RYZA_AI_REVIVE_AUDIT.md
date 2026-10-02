# Ryza AI Revive — Audit Vendrith

## Source

- Repository: https://github.com/zeroa234/ryza-ai-revive
- Owner: zeroa234
- Branch audited: `master`
- Audit date: 2026-10-02
- Repository license: MIT
- Vendrith target branch: `feat/vendrith-ecc-v1`
- Classification: architecture / engineering / asset-provenance reference; **not a dependency**

## 1. Executive summary

Ryza AI Revive is a local-first conversational client with a real-time 2D avatar. Its source tree deliberately separates a shared web client from thin Electron and Android hosts. The project uses plain HTML/JavaScript rather than a bundler, a proxy contract shared by the three hosts, provider registries, local state, regression scripts, generated asset indexes, and packaging/privacy gates.

The strongest ideas for Vendrith are not the avatar or game-specific features. They are:

1. declarative module boundaries enforced by a checker;
2. injected seams/ports instead of direct cross-layer calls;
3. registry-as-data for providers/assets/capabilities;
4. generated indexes/manifests from the asset tree;
5. one canonical version/config source;
6. deterministic regression tests around state transitions and transport failures;
7. packaging-time secret/privacy checks;
8. separating source-controlled structural metadata from large binary media.

These should be **adapted to Vendrith's Next.js + TypeScript + PixiJS + Supabase architecture**, not copied literally.

## 2. Architecture observed

The README describes these layers:

| Area | Ryza role | Vendrith relevance |
|---|---|---|
| `web/` | shared UI/avatar/local-state client | Shared editor UI/runtime concepts |
| `desktop/` | Electron host | Low relevance; Vendrith is web-first |
| `android/` | Android WebView host | Defer |
| `scripts/` | dev server, indexing, packaging, regression tests | High relevance as tooling/verification |
| `config/` | version/provider templates/layer rules | High relevance as declarative project metadata |
| `docs/` | module/architecture/setup documentation | High relevance |

The project explicitly uses a single web kernel across browser, Electron, and Android and a shared `/_proxy` contract. Its architecture notes also state that modules communicate through injected ports wired by `App._wirePorts()`, while `config/layers.json` declares permitted dependencies.

## 3. ADOPT

### A. Declarative architecture boundaries

**Adopt the concept, not the implementation.**

Ryza's `config/layers.json` records:
- layer names;
- allowed imports;
- module ownership;
- denied references;
- intentional cycles;
- declared exceptions;
- host/proxy contract assertions.

`scripts/layering_check.js --strict` then measures the actual source tree against those declarations.

Vendrith should use the same principle for boundaries such as:

```
domain / core
  -> map model, commands, history, asset metadata, validation

application
  -> use-cases, services, command orchestration

infrastructure
  -> Supabase, storage, external adapters

editor / rendering
  -> PixiJS and canvas-facing code

UI
  -> Next.js/React presentation
```

The exact folder names should follow Vendrith's existing architecture and instructions.

### B. Injected ports / seams

Ryza intentionally keeps modules testable by injecting ports instead of letting core logic directly reach rendering, networking, or host APIs.

For Vendrith this maps well to:
- asset repository interfaces;
- map persistence ports;
- export/import adapters;
- renderer adapters;
- Supabase adapters;
- optional AI/tool adapters;
- thumbnail/preview providers.

This is especially useful for editor logic that must run in headless tests without PixiJS.

### C. Registry-as-data

Ryza has provider metadata and generated asset indexes instead of hard-coding every option throughout UI code.

Vendrith should extend its existing Asset Registry direction so the same structured registry can drive:
- Asset Library;
- World Building;
- Region Building;
- search/filtering;
- preview cards;
- capability checks;
- provenance display;
- runtime manifests.

Suggested conceptual fields:

```ts
{
  id,
  category,
  layer,
  dimensions,
  preview,
  source,
  license,
  credit,
  provenance,
  capabilities
}
```

### D. Generated indexes/manifests

Ryza's `build_indexes.py` scans `web/assets` and writes JSON indexes consumed by the client.

Vendrith should use the same pattern where useful:

```
source assets
   -> audit/registry metadata
   -> generated manifest/index
   -> Asset Library + editor
```

This fits the current Vendrith Asset Library requirement particularly well. The generated representation should never become the authority for license truth; the authoritative provenance record remains the reviewed registry/source metadata.

### E. Regression tests for state invariants

Ryza has separate regression scripts for game logic, memory, motion, save slots, transport errors, proxy targets, voice, STT, etc.

Vendrith should similarly test invariants such as:
- command -> state transition;
- undo -> exact previous state;
- redo -> exact next state;
- optimistic version conflict;
- three-way merge;
- map-size constraints (32x32 / 64x64 / 128x128);
- asset placement validation;
- asset provenance restrictions;
- generated registry/index consistency;
- import/export round trips.

### F. Single source of truth

Ryza pins the packaged version in `config/version.json` and synchronizes host manifests from it.

Vendrith can apply this concept to:
- schema versions;
- map document version;
- asset registry schema version;
- generated manifest version;
- migration version.

Avoid duplicating authoritative version values across UI, database, and code.

### G. Privacy/secrets build gate

Ryza's `privacy_check.py` fails packaging when forbidden local paths, provider files, or secret-shaped tokens are detected.

Vendrith should adapt this into CI checks for:
- Supabase/service-role keys;
- API keys;
- local filesystem paths;
- generated private files;
- accidental binary dumps;
- credentials inside exported project artifacts.

This should complement, not replace, GitHub/Vercel/Supabase secret management.

## 4. ADAPT

### A. Plain JavaScript -> TypeScript

Ryza is deliberately a static HTML/JavaScript client. Vendrith already has a stronger typed architecture.

Do not reproduce its global-IIFE module style.

Instead translate its ideas into:
- typed interfaces;
- explicit module exports;
- dependency injection;
- schema validation;
- discriminated command/event unions.

### B. `App` wiring -> application composition root

Ryza's `App._wirePorts()` is a useful pattern but its global-module environment is specific to that project.

Vendrith should have a clear composition boundary where:
- domain stays framework-independent;
- services receive repositories/adapters;
- UI receives application commands/state;
- PixiJS remains a rendering adapter.

### C. `/_proxy` -> secure server-side adapter boundary

Ryza needs a custom proxy because the same client runs in browser/Electron/Android.

Vendrith does not need to copy that exact proxy.

For Vendrith, external provider/API calls should normally go through:
- Next.js server-side routes/server actions where appropriate;
- Vercel/server environment;
- Supabase Edge Functions where that is the better boundary.

Never expose privileged keys to the browser.

### D. LocalStorage RPG state -> project document + persistence model

Ryza's local RPG state is appropriate for an offline companion but not sufficient for Vendrith's collaborative/persistent map model.

Adapt the principle of a single reducer/write path:
- map commands produce state transitions;
- history records transitions;
- persistence synchronizes validated documents;
- conflicts are resolved at the application/domain boundary.

### E. Asset index generation -> Vendrith Asset Registry pipeline

Ryza's generated indexes are filesystem-derived. Vendrith has a stronger requirement: provenance and license status.

Therefore:

```
raw asset
 -> source/license audit
 -> approved registry entry
 -> generated searchable manifest
 -> Asset Library
```

Do not allow a filesystem scan alone to mark an asset as approved.

## 5. DEFER

Do not add these merely because Ryza has them:

- Electron desktop host;
- Android WebView host;
- Spine 4.2 runtime;
- TTS/STT system;
- microphone/voice activity detection;
- conversational NPC system;
- RPG stamina/quests/daily rewards;
- local character/costume system;
- NSFW/undress system;
- custom native alarm bridge;
- custom Python static server.

They solve Ryza-specific product requirements, not Vendrith's map-editor requirements.

## 6. Asset and licensing audit — IMPORTANT

The repository's `LICENSE` is MIT, but that should be interpreted as the license of the repository's own software unless another asset has an explicit compatible license.

The project README states that large raster/audio/skeleton binaries are excluded from Git and restored from release packages. `scripts/restore_media.py` explicitly describes these as original-game media. The privacy checker also contains markers for original publisher identifiers.

Therefore:

**Do not import Ryza character art, Spine skeletons, textures, audio, or extracted game media into Vendrith based only on the repository's MIT LICENSE.**

For Vendrith's registry:
- source code pattern: potentially reusable after independent review;
- documentation wording: do not copy wholesale;
- Ryza game assets/media: **not approved** by this audit;
- third-party dependencies: audit separately;
- any replacement asset: verify its own source/license/credit independently.

This reinforces Vendrith's existing rule that repository license and bundled-asset license are separate provenance subjects.

## 7. Vendrith implementation backlog

### P0 — useful soon

1. Define a lightweight declarative boundary map for Vendrith.
2. Add a boundary/layer verification script to CI once the current architecture is stable.
3. Formalize application/domain ports for persistence, assets, renderer, and import/export.
4. Make Asset Registry metadata the source for Asset Library filtering/preview/provenance.
5. Add generated asset-manifest verification.
6. Add secret/private-file packaging checks.

### P1

1. Expand regression coverage around map commands/history/conflicts.
2. Add schema-version validation and migration tests.
3. Add registry consistency checks: every approved asset must have provenance/license/credit metadata.
4. Add import/export round-trip tests.

### P2

1. More advanced dependency graph/architecture visualization.
2. Automated impact analysis.
3. Runtime telemetry only if later justified.

## 8. Final decision

**Decision: ADOPT + ADAPT as an engineering reference.**

Strongest transferable ideas:
- declarative boundaries;
- injected seams/ports;
- registry-as-data;
- generated manifests;
- regression/invariant testing;
- single-source configuration/versioning;
- privacy/secret build gates.

**Do not adopt Ryza's game assets or treat its MIT repository license as permission for those assets.**

The repository remains an inspiration/reference only; it is not a Vendrith dependency.

## Primary sources

- Repository: https://github.com/zeroa234/ryza-ai-revive
- Architecture notes: https://github.com/zeroa234/ryza-ai-revive/blob/master/docs/PROJECT.md
- Setup/resource notes: https://github.com/zeroa234/ryza-ai-revive/blob/master/docs/SETUP.md
- License: https://github.com/zeroa234/ryza-ai-revive/blob/master/LICENSE
- Layer declarations: https://github.com/zeroa234/ryza-ai-revive/blob/master/config/layers.json
- Index generator: https://github.com/zeroa234/ryza-ai-revive/blob/master/scripts/build_indexes.py
- Media restoration script: https://github.com/zeroa234/ryza-ai-revive/blob/master/scripts/restore_media.py
- Privacy gate: https://github.com/zeroa234/ryza-ai-revive/blob/master/scripts/privacy_check.py
