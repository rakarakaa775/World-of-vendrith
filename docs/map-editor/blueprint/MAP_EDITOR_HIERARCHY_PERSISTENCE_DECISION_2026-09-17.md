# Hierarchy Persistence Decision Record — 2026-09-17

## Audit result

The current Supabase `public.maps` schema uses legacy semantic values `world`, `exterior`, and `interior`, with `interior` additionally constrained by `building_id`. The canonical Map Editor model uses `world`, `region`, and `playable`, with explicit parent relationships and a separate playable-interior relationship.

## Decision

Adopt the separate Map Editor identity/hierarchy mapping approach (Option B) before child-map persistence is implemented.

## Evidence used

- `MAP_EDITOR_DATABASE_CONTRACT.md`: `maps` is the stable map identity boundary and MapDocument remains canonical.
- `MAP_EDITOR_BIBLE.md`: World, Region, and Playable are three authoring scales sharing one persistence foundation; relationships are explicit.
- `MAP_EDITOR_TECHNICAL.md`: map scale is semantic and must not be inferred; all scales share identity/version/save-slot foundations.
- `MAP_EDITOR_GAME_DESIGN.md`: World → Region → Playable is an explicit hierarchy and the current relational schema documents legacy `maps` fields.
- `REQUIREMENTS.md`: MAP-002 requires three semantic map types; MAP-003 and MAP-004 require deterministic parent references.
- Live Supabase schema audit: `public.maps.map_type` is constrained to `world|exterior|interior`; there is no `parent_map_id` column or hierarchy foreign key.

## Why no migration was applied

Changing existing `maps.map_type` semantics or adding a parent relation directly to `maps` before defining legacy compatibility would create an architectural migration risk. The contract therefore freezes the semantic translation first.

## Next step

Perform the concrete migration/RLS/RPC design for the new hierarchy layer, including legacy `maps` mapping, uniqueness, same-world validation, cycle prevention, interior/building semantics, and rollback. Only after that design is reviewed should production schema changes be applied.
