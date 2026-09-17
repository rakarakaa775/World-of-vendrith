# Map Editor Change Log Addendum — Hierarchy Persistence — 2026-09-17

- **Type:** Added / Decision
- **Reason:** Resolve the audited contract/schema mismatch before implementing Region, Playable, and Interior persistence.
- **Details:** Compared the canonical Map Editor hierarchy and identity requirements with the live `public.maps` schema. The editor requires semantic `world`, `region`, and `playable` types plus explicit parent relationships, while the existing database preserves legacy `world`, `exterior`, and `interior` semantics and has no parent-map relationship. Adopted **Option B: a separate Map Editor identity/hierarchy mapping layer**. This layer maps editor semantics to legacy `maps` rows without reinterpreting existing `map_type` values.
- **Affected:** `docs/map-editor/blueprint/MAP_EDITOR_HIERARCHY_PERSISTENCE_CONTRACT.md`, `docs/map-editor/blueprint/MAP_EDITOR_HIERARCHY_PERSISTENCE_DECISION_2026-09-17.md`, root `MAP_EDITOR_STATUS_LOG.md`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Contract and live schema audit completed. No Supabase schema, RPC, production map row, or asset binary changed.
- **Notes:** The contract intentionally freezes the semantic decision while deferring the physical table design, RLS, uniqueness/cycle rules, legacy mapping details, and RPC surface to the next migration-level audit. Existing authoritative World Map identity remains unchanged. The root detailed changelog is preserved as historical record; this addendum is the detailed record for the hierarchy decision.
