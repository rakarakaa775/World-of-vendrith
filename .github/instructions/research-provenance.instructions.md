---
applyTo: "assets/**/*,**/*.{ts,tsx,json,md,tsx},database/**/*,supabase/**/*"
---

# Vendrith research-first and external provenance instructions

Before integrating an unfamiliar or version-sensitive API, library, SDK, asset format, tileset, external asset, or third-party service:

1. Inspect existing Vendrith code and contracts.
2. Identify the exact dependency, format, or source version.
3. Consult authoritative documentation or the original source.
4. Compare the proposed integration with existing repository patterns.
5. Identify compatibility, licensing, provenance, security, and performance constraints.
6. Record durable discoveries when they affect future implementation.
7. Plan the smallest compatible change before implementation.

## Source priority
Prefer, in order:
- official project documentation;
- official repository/source files;
- authoritative standards/specifications;
- primary asset creator/license information;
- reputable secondary documentation only when primary sources are unavailable.

Do not treat search snippets, copied code, screenshots, or unattributed reposts as authoritative evidence.

## External APIs and libraries
- Verify the exact installed version before relying on an API.
- Check breaking changes and compatibility with the current Next.js, React, TypeScript, PixiJS, Supabase, and Node/runtime versions.
- Do not add a dependency when an existing project capability or smaller implementation satisfies the requirement.
- Preserve existing architecture and contracts rather than adapting the codebase around an unfamiliar library prematurely.
- Record important version-specific discoveries in .ai/memory/discoveries/.

## External game assets
Follow:
SOURCE -> IDENTIFY -> LICENSE -> METADATA -> VALIDATE -> IMPORT -> NORMALIZE -> INDEX -> USE.

For every external asset intended for Vendrith:
- identify the creator/source;
- identify the exact license and version when available;
- determine attribution requirements;
- preserve source URL and provenance metadata;
- verify the source format and tile/terrain conventions;
- record transformations when they materially affect the asset;
- keep unresolved or conflicting provenance out of approved use.

Never infer authorship, license, attribution requirements, or permission from visual similarity alone.

## Terrain and tilesets
- Verify tile dimensions, atlas layout, tile IDs, terrain/corner ordering, coordinate conventions, and source metadata before binding an external tileset.
- Preserve the repository's single terrain-mask convention.
- Do not silently remap source terrain semantics to fit an existing renderer.
- Add focused contract fixtures for externally sourced terrain mappings.
- Keep attribution/license metadata attached to imported or normalized bindings.

## Research records
When research produces a durable architectural or asset decision, record:
- source;
- date/version checked;
- relevant evidence;
- decision;
- compatibility/limitations;
- affected Vendrith contracts.

## Verification
Before claiming an external integration is correct, verify the relevant source, focused tests, and final diff. If authoritative evidence is unavailable or contradictory, fail closed and surface the uncertainty instead of guessing.
