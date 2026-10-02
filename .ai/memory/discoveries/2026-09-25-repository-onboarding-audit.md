# Vendrith ECC Onboarding Audit — 2026-09-25

## Scope

Repository: `rakarakaa775/World-of-vendrith`
Baseline inspected: `main`
ECC integration branch: `feat/vendrith-ecc-v1`

This is a repository audit, not a claim that every historical/handoff artifact is current implementation.

## 1. Stack

The active Map Editor package declares:

- Next.js 15.5.x
- React 19.1.x
- TypeScript 5.9.x
- PixiJS 8.19.x
- Supabase JS 2.57.x
- Supabase SSR 0.7.x
- Vitest 3.2.x

The Map Editor README identifies Next.js App Router, TypeScript, PixiJS, local map-document state/history, Supabase persistence/runtime reads, and Vercel deployment.

## 2. Repository Shape

The repository contains an active Map Editor under `apps/map-editor/`, Supabase migrations/functions, tests, source/archive material, and preserved handoff documentation.

Important distinction:

- active implementation: `apps/map-editor/`, `supabase/`, `tests/`
- historical/context material: `handoff/`, `SOURCE_ARCHIVE/`, `archive/` where applicable

Historical handoff files must not be treated as current implementation without verification.

## 3. Map Editor Findings

The current editor already has substantial architecture:

- editor shell/workspace
- Pixi map canvas
- MapDocument model
- layer selection/visibility/locking/reordering
- tile painting/erase
- brush sizes
- rectangular selection/stamp workflow
- building placement/selection/movement/deletion
- undo/redo history
- authoritative map bootstrap/load/save
- optimistic concurrency
- three-way conflict resolution
- runtime snapshot persistence/crash recovery
- terrain/environment read adapters
- save slots
- production deployment boundary

The code also contains an explicit authoritative map resolver and persistence boundaries.

## 4. Important Architecture Already Present

The existing implementation already aligns with several Vendrith ECC principles:

### Domain vs Rendering

`MapDocument` is a domain model and PixiJS is used through a map canvas component.

### Persistence

Map persistence is separated into dedicated editor modules and Supabase RPC/data access.

### Concurrency

The editor already handles optimistic versions and three-way conflict resolution.

### History

Undo/redo exists in the editor architecture.

### Runtime Boundaries

The editor explicitly refuses to invent unverified Season/Weather mappings and treats those as authoritative backend concerns.

## 5. Current Gaps / Risks to Verify

### A. Phaser

The active Map Editor package does not declare Phaser. The Map Editor README lists Phaser Play/Preview as a later implementation slice.

Decision: do not introduce Phaser merely because it was part of the original target architecture. Add it when the Play/Preview requirement is planned.

### B. Map Type Contract

`resolveAuthoritativeMap` documents a mismatch between editor map types and database map_type values for non-world maps.

Decision: preserve the fail-closed behavior until an authoritative mapping contract is established.

### C. Asset Library

Terrain asset bindings already exist, but the next stated implementation slice is an asset-library read model and verified asset selection.

Decision: asset provenance/licensing remains a first-class system.

### D. Production Verification

The project README explicitly lists production/browser verification as a next slice.

Decision: do not treat successful static code review as sufficient for editor completion.

### E. Supabase Security

The repository contains many Map Editor migrations, including access, identity, RPC, save-slot and SECURITY DEFINER related changes.

Decision: any future database change must go through the Supabase specialist/security review and current Supabase documentation.

## 6. Recommended Next Architecture Work

Do not rebuild the Map Editor from scratch.

Next sequence:

1. establish a reproducible local/CI verification baseline
2. verify current production persistence lifecycle
3. map the MapDocument schema and command/history boundaries
4. audit the asset-library/terrain binding contract
5. formalize non-world map identity/type mapping
6. verify Supabase RLS/RPC/storage security
7. add browser verification for the deployed editor
8. only then implement the next Map Editor feature slice

## 7. Working Rule

Existing working architecture is presumed valuable.

Refactor only when there is evidence of:
- incorrect behavior
- duplicated ownership
- unsafe boundary
- untestable design
- measurable performance issue
- incompatible future requirement

Avoid replacing functioning systems solely to make the code resemble a theoretical architecture.

## 8. Audit Status

Status: ONBOARDED

Architecture status: SUBSTANTIAL EXISTING IMPLEMENTATION

Map Editor status: ACTIVE / FEATURE-RICH FOUNDATION

Next phase: VERIFICATION + CONTRACT AUDIT, not greenfield rebuild
