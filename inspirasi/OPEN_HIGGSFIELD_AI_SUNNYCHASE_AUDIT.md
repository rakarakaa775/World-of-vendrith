# Open Higgsfield AI (sunnychase) — Audit Vendrith

## Source

- Repository: https://github.com/sunnychase/open-higgsfield-ai
- Audited ref: `main`
- Audit date: 2026-10-02
- Repository status: public fork
- Upstream parent: `thecoldblooded/open-higgsfield-ai`
- Upstream source lineage: `Anil-matcha/Open-Generative-AI`
- Current fork head is from 2026-02-17; repository metadata was updated more recently, but the latest pushed code is not a continuously maintained current implementation.
- The fork's GitHub repository metadata reports no license object and no SECURITY.md. The parent/source project advertises MIT, but licensing should be verified from the actual files before copying code/assets.

## Executive summary

Open Higgsfield AI is primarily a **creative AI studio UI and provider/API integration reference**, not a map-editor architecture.

Its strongest ideas for Vendrith are:

1. schema-driven capability metadata for models/tools;
2. separating model metadata from the API client;
3. capability-aware controls that only expose options supported by the selected model;
4. a normalized asynchronous generation lifecycle;
5. reusable studio/control components;
6. generation/history concepts;
7. visual asset pickers with preview-oriented controls;
8. prompt/parameter composition as a separate concern.

Its weakest areas for Vendrith are:

- JavaScript instead of TypeScript;
- vanilla DOM state management;
- client-side API-key storage;
- direct client-to-provider API calls;
- polling without cancellation/backoff/strong lifecycle typing;
- no repository SECURITY.md;
- no visible automated test suite;
- Vite-specific architecture;
- provider-specific coupling;
- localStorage as durable application history;
- fork provenance/license ambiguity.

**Decision:** use this repository as inspiration for **capability-driven UI, asset/control presentation, and asynchronous job abstractions**, not as a dependency or architecture template.

---

## 1. Architecture

The repository uses Vite + Vanilla JavaScript + Tailwind CSS. The UI is split into functional components such as ImageStudio, VideoStudio, CinemaStudio, CameraControls, Header, AuthModal, and SettingsModal. The API client is separated into `src/lib/muapi.js`, while model metadata lives in `src/lib/models.js`.

This separation is useful even though the implementation style differs from Vendrith.

### ADOPT

- Separate domain metadata from transport/API code.
- Keep UI controls driven by explicit capabilities instead of hard-coded assumptions.
- Separate specialized editor/studio surfaces into focused components.
- Keep provider/API integration behind a client abstraction.

### ADAPT

Vendrith should use:

- TypeScript types/interfaces;
- Next.js App Router boundaries;
- PixiJS editor state;
- existing map-document/history architecture;
- Supabase persistence where appropriate;
- server-side/API-route protection for secrets;
- typed domain services instead of direct DOM manipulation.

### DEFER

- Reproducing the vanilla-JS component architecture.
- Replacing React/PixiJS with Vite + DOM code.

---

## 2. Capability-driven model/control metadata

One of the most useful patterns is `models.js`.

Each model contains an identifier, display name, endpoint, and an input schema describing supported parameters such as aspect ratio, resolution, dimensions, duration, and other constraints.

The UI reads those capabilities and changes controls accordingly. For example, resolution controls are shown only when the selected model explicitly exposes resolution/megapixel support.

This is directly relevant to Vendrith.

### Vendrith adaptation

The same concept can become:

```
Tool / Asset / Editor Capability
        |
        +-- supported map sizes
        +-- supported terrain types
        +-- allowed layer types
        +-- transform constraints
        +-- animation support
        +-- collision support
        +-- metadata requirements
        +-- license/provenance state
```

For the Asset Library, an asset record could expose capabilities such as:

- category;
- dimensions;
- tileability;
- animation frames;
- orientation;
- supported terrain/layer;
- collision metadata;
- source;
- license;
- credit requirement;
- provenance confidence.

The UI should then expose only controls that the asset actually supports.

**Decision: ADOPT concept, ADAPT implementation.**

---

## 3. API client and provider abstraction

`muapi.js` centralizes provider communication and resolves a model's endpoint from model metadata.

The repository uses a submit -> request ID -> poll -> normalize result flow.

This is a useful abstraction for any long-running operation.

### Vendrith adaptation

If Vendrith later adds AI-assisted map generation, asset generation, procedural processing, or background jobs:

```
UI
 |
 v
Typed Job Service
 |
 +-- provider adapter
 +-- job submission
 +-- job status
 +-- cancellation
 +-- retry/backoff
 +-- result normalization
 +-- persistence
```

Do not let PixiJS components call provider APIs directly.

**Decision: ADOPT the job abstraction; ADAPT heavily for typed/server-side execution.**

---

## 4. Asynchronous polling

The repository polls every 2 seconds for up to about 2 minutes.

Useful idea:

- asynchronous jobs are represented separately from their final result;
- the client normalizes multiple provider response shapes;
- transient server errors can be retried.

But Vendrith should improve this substantially.

### Required improvements for Vendrith

- typed job states;
- AbortController/cancellation;
- exponential backoff with jitter;
- maximum elapsed time;
- idempotency keys;
- retry classification;
- server-side secret handling;
- persistent job state where required;
- explicit terminal states;
- observability/request IDs;
- no secret values in logs.

**Decision: ADAPT, not copy.**

---

## 5. Security findings

### API key in localStorage

The repository stores the Muapi key in browser `localStorage`.

That is convenient for a self-hosted personal tool, but it increases exposure if an XSS vulnerability exists. Vendrith should not adopt this pattern for privileged project credentials.

Use server-side environment secrets or a protected server-side integration whenever possible.

### Logging

The client logs request URLs, payloads, responses, request IDs and generated URLs. The payload itself may be safe in many cases, but this logging pattern should not be copied into production without explicit redaction rules.

### Vite proxy

The development proxy uses:

```
secure: false
```

That is a development configuration choice and should not be treated as a production security pattern.

### Repository security posture

The fork currently has no detected SECURITY.md and GitHub reports no published security policy/advisories.

**Decision: N/A as a security reference. Use Vendrith's stronger existing security rules instead.**

---

## 6. History and persistence

The project keeps generation history in browser storage.

Useful concept:

- every generation can become a reusable artifact;
- thumbnails provide quick visual navigation;
- generated outputs can be revisited/downloaded.

### Vendrith adaptation

This maps well to the planned Asset Library / World Building workflow:

```
Asset Library
  |
  +-- thumbnail
  +-- metadata
  +-- source
  +-- license
  +-- category
  +-- tags
  +-- preview
  +-- usage references
  +-- provenance
```

For Vendrith, persistent asset/project state should live in the existing project persistence architecture rather than relying only on localStorage.

**Decision: ADOPT concept, ADAPT storage.**

---

## 7. Cinema Studio / CameraControls

The Cinema Studio has a useful UI pattern: complex parameters are grouped into focused selectors and presented visually.

CameraControls uses preview images for camera/lens/aperture choices and provides scrollable selectors.

This is highly relevant to Vendrith's future Asset Library.

### Vendrith adaptation

The Asset Library can use the same high-level UX principle:

- visual thumbnail;
- category;
- quick metadata;
- selected state;
- contextual controls;
- preview;
- search/filter;
- provenance/license indicator.

For example:

```
[thumbnail]
Forest Grass
WORLD / Vegetation
CC-BY
Credit required
[Preview] [Use] [Details]
```

This complements the user's existing requirement to see the actual images of assets before using them.

**Decision: ADOPT strongly as a UX pattern.**

---

## 8. Prompt composition

The Cinema Studio separates camera settings from the textual prompt and eventually translates selected camera settings into prompt modifiers.

The important idea is not the cinematic prompt itself; it is **structured controls -> deterministic parameter composition**.

Vendrith can use the same approach:

```
Map operation
  + selected tool
  + selected asset
  + terrain/layer
  + transform
  + constraints
  -> typed operation
```

This is preferable to encoding editor state as arbitrary text.

**Decision: ADOPT concept.**

---

## 9. Model catalog as data

The repository contains a large generated model catalog in `models_dump.json` and exports a JavaScript representation.

This demonstrates the value of treating external capability information as data instead of scattering it across UI code.

For Vendrith, the same principle applies to:

- asset registry;
- asset categories;
- map-size capabilities;
- layer capabilities;
- editor tools;
- import/export formats;
- provenance/license metadata.

**Decision: ADOPT.**

---

## 10. What Vendrith should NOT copy

Do not copy:

- client-side API key storage;
- direct provider access from UI components;
- JavaScript instead of TypeScript;
- localStorage as the primary source of persistent project state;
- raw provider payloads as domain models;
- fixed polling without cancellation/backoff;
- provider-specific logic scattered across UI;
- Vite-specific architecture;
- lack of explicit security policy;
- unverified fork licensing assumptions.

---

## 11. Vendrith-specific architecture inspired by this reference

The useful abstraction is:

```
Capability Registry
       |
       +------------------+
       |                  |
       v                  v
Asset Registry       Tool Registry
       |                  |
       +--------+---------+
                |
                v
        Typed Editor Operations
                |
                v
         Map Document / History
                |
                +--> PixiJS Renderer
                |
                +--> Supabase Persistence
                |
                +--> Asset Provenance
```

For future AI functionality:

```
Editor / AI UI
      |
      v
Typed Job Service
      |
      +--> provider adapters
      +--> status/cancel/retry
      +--> result normalization
      +--> artifact persistence
      +--> audit/logging
```

---

## 12. ADOPT / ADAPT / DEFER / N/A

### ADOPT

- Capability-driven UI controls.
- Model/tool metadata separated from transport.
- Provider-independent conceptual job lifecycle.
- Structured parameter composition.
- Visual selector / asset preview UX.
- Generation/artifact history concept.
- Registry-as-data pattern.
- Normalization of external API responses.
- Focused components for complex control groups.

### ADAPT

- AI job lifecycle -> typed Vendrith service.
- Model schemas -> asset/tool capability schemas.
- Generation history -> persistent Asset Library/project artifacts.
- Camera selector -> visual asset picker.
- Provider abstraction -> AI/provider adapters.
- Prompt composition -> typed map/editor operations.
- Vanilla JS components -> React/TypeScript/PixiJS.

### DEFER

- Full AI image/video generation.
- Multi-provider AI gateway.
- Cinema Studio.
- Video generation pipeline.
- AI model catalog.
- AI-generated assets.
- Desktop packaging/Electron.

### N/A

- Replacing Vendrith's Next.js architecture.
- Replacing PixiJS with DOM rendering.
- Using localStorage as the source of truth.
- Installing this repository as a production dependency.
- Treating its fork license state as proof that every included asset/code component is safe to reuse.

---

## 13. Final assessment for Vendrith

This reference is valuable mainly for **UX and capability modeling**, not for the underlying technology stack.

The strongest transferable idea is:

**Do not build controls first and decide capabilities later. Define capabilities as data, then let the UI derive the available controls from those capabilities.**

For Vendrith this should eventually unify:

- Asset Library;
- World Building;
- Region Building;
- map tools;
- terrain tools;
- object/entity tools;
- import/export;
- provenance/license information;
- future AI-assisted generation.

The repository should remain an inspiration/reference only.

## Provenance note

The audited repository is a fork. The fork metadata did not expose a license object, while its upstream lineage advertises MIT. Therefore, before copying any code or assets from this fork, verify the exact upstream file provenance and applicable license for that material.

## Sources

- https://github.com/sunnychase/open-higgsfield-ai
- https://github.com/thecoldblooded/open-higgsfield-ai
- https://github.com/Anil-matcha/Open-Generative-AI
