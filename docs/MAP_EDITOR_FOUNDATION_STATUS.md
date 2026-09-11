# Map Editor Foundation — Progress Log

Last reviewed: 2026-09-11

This file supplements `docs/MAP_EDITOR_ROADMAP.md` and records verified foundation progress without overwriting the master roadmap when its current blob cannot be safely patched from the connector.

## Security hardening

- [x] Restricted Map Editor document snapshot save RPC from `anon`.
- [x] Granted document snapshot save RPC to `authenticated`.
- [x] Pinned the snapshot save function `search_path` to `public, pg_temp`.
- [x] Restricted Map Editor runtime/load/terrain/navigation/clipboard RPC execution to authenticated users where those RPC signatures were verified.
- [~] Full RLS policy audit remains required across every Map Editor table before Foundation can be marked production-complete.
- [~] Remaining function-level privilege/search_path audit remains required for any Map Editor RPC not yet covered by the hardening pass.

## Foundation completion gate

The Foundation phase is **not yet complete**. The remaining gates are:

1. Validation/readiness gate implemented and integrated with `MapDocument`.
2. Save/Load UI connected to the canonical persistence bridge.
3. Autosave integrated with persistence.
4. Crash/recovery flow implemented.
5. Dirty/save status exposed in the editor UI.
6. Full RLS and RPC security audit passes.
7. End-to-end foundation test proves create → edit → save → reload → validate with state preserved.

## Storage contract

- GitHub: Map Editor engine, UI, serializers, validation, interaction logic.
- Supabase: authoritative world/editor state, persistence, commands, navigation, geometry, environment, permissions.
- Asset Library / Storage: binary assets, metadata and manifests.
- Vercel: deferred until browser/runtime verification is useful.

## Rule

Every completed foundation item must also be reflected in `docs/MAP_EDITOR_ROADMAP.md` by changing `[ ]`/`[~]` to the verified status and recording its storage location.