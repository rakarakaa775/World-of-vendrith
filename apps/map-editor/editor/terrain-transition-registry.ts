import type { TerrainKey } from './terrain-engine';

export type TerrainTransitionDefinition = {
  key: string;
  from: TerrainKey;
  to: TerrainKey;
  enabled: boolean;
  source: 'supabase-verified';
};

/**
 * Semantic transition pairs currently verified in the authoritative terrain
 * catalog. This registry does not invent asset bindings; it only describes
 * which semantic pair has a transition rule available.
 *
 * Supabase currently exposes:
 * - grass -> water
 * - grass -> dirt
 *
 * Other mixed-terrain pairs remain unregistered until their transition rule
 * and approved runtime asset binding exist.
 */
export const VERIFIED_TERRAIN_TRANSITIONS: readonly TerrainTransitionDefinition[] = [
  {
    key: 'grass_to_water',
    from: 'grass',
    to: 'water',
    enabled: true,
    source: 'supabase-verified',
  },
  {
    key: 'grass_to_dirt',
    from: 'grass',
    to: 'dirt',
    enabled: true,
    source: 'supabase-verified',
  },
] as const;

const TRANSITION_BY_PAIR = new Map(
  VERIFIED_TERRAIN_TRANSITIONS.map(transition => [
    `${transition.from}->${transition.to}`,
    transition,
  ]),
);

export function terrainTransitionKey(from: TerrainKey, to: TerrainKey): string {
  return `${from}->${to}`;
}

export function getTerrainTransition(
  from: TerrainKey,
  to: TerrainKey,
): TerrainTransitionDefinition | null {
  return TRANSITION_BY_PAIR.get(terrainTransitionKey(from, to)) ?? null;
}

export function isTerrainTransitionRegistered(
  from: TerrainKey,
  to: TerrainKey,
): boolean {
  return getTerrainTransition(from, to)?.enabled === true;
}

export type TerrainTransitionStatus =
  | 'same-terrain'
  | 'registered'
  | 'unregistered';

export function classifyTerrainTransition(
  from: TerrainKey,
  to: TerrainKey,
): TerrainTransitionStatus {
  if (from === to) return 'same-terrain';
  return isTerrainTransitionRegistered(from, to)
    ? 'registered'
    : 'unregistered';
}
