import type { TerrainKey } from './terrain-engine';

/**
 * Rules verified against the current Supabase map_terrain_rules catalog.
 * This catalog intentionally contains rule keys only; it does not invent
 * texture/asset bindings for masks that are not bound in Supabase.
 */
export const VERIFIED_TERRAIN_RULES: Partial<Record<TerrainKey, string>> = {
  grass: 'world_grass',
  dirt: 'road_dirt',
  water: 'world_water',
};

export function terrainRuleKey(terrain: TerrainKey): string | null {
  return VERIFIED_TERRAIN_RULES[terrain] ?? null;
}

export function hasVerifiedTerrainRule(terrain: TerrainKey): boolean {
  return terrainRuleKey(terrain) !== null;
}
