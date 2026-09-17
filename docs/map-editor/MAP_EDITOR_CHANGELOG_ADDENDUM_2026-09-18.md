# Map Editor Change Log Addendum — 2026-09-18

## Persisted identity parser v3 correction

- **Type:** Fixed / Updated
- **Reason:** Browser verification reached the new `map-document-parser-v2` marker but still reported `missing=id,name,mapType` while the same diagnostic showed all three persisted values present. This established that the contradiction occurs at the runtime object-validation boundary, not in the audited Supabase payload itself.
- **Details:** Updated `apps/map-editor/editor/map-serialization.ts` to read persisted `id`, `name`, and `mapType` into local primitives, normalize the persisted document object before validation, and emit `map-document-parser-v3` with observed identity values on failure. Added an explicit regression test for the audited authoritative World Map through both the serialized-string path and the object-shaped path used by Supabase runtime snapshots.
- **Affected:** `apps/map-editor/editor/map-serialization.ts`, `apps/map-editor/editor/map-foundation.test.ts`.
- **Roadmap phase:** Phase 0 — Foundation Audit.
- **Verification:** Supabase live audit confirms runtime snapshot identity is present and JSON types are strings for `id`, `name`, and `mapType`. Vercel/browser verification of the new commits remains pending.
- **Commits:** `b2e89d5d2332c350795dc98808171660805f4b2c`, `ec40b5418537ff1306dc00f5143fe5861d6565ff`.
- **Notes:** No Supabase schema/data, RPC, or asset binary was changed. The existing root changelog remains the historical record; this addendum preserves the detailed entry for this diagnostic correction while the large historical changelog blob cannot be safely reconstructed through the current connector response budget.
