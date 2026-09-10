import type { TerrainKey } from './terrain-engine';
import { getTerrainAssetBinding, type TerrainAssetBindingMap } from './terrain-asset-binding';

export const TERRAIN_MASK_DIRECTIONS = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'] as const;
export type TerrainMaskDirection = (typeof TERRAIN_MASK_DIRECTIONS)[number];

export type TerrainMaskTopology = {
  mask: number;
  variantKey: string;
  terrain: TerrainKey;
  neighbors: Record<TerrainMaskDirection, boolean>;
  bound: boolean;
};

const BIT_BY_DIRECTION: Record<TerrainMaskDirection, number> = {
  n: 1,
  e: 2,
  s: 4,
  w: 8,
  ne: 16,
  se: 32,
  sw: 64,
  nw: 128,
};

export function terrainMaskHasDirection(mask: number, direction: TerrainMaskDirection): boolean {
  return (mask & BIT_BY_DIRECTION[direction]) !== 0;
}

export function terrainMaskTopology(
  terrain: TerrainKey,
  mask: number,
  bindings: TerrainAssetBindingMap = {},
): TerrainMaskTopology {
  const neighbors = Object.fromEntries(
    TERRAIN_MASK_DIRECTIONS.map(direction => [direction, terrainMaskHasDirection(mask, direction)]),
  ) as Record<TerrainMaskDirection, boolean>;
  return {
    mask,
    variantKey: `mask_${mask.toString(16).padStart(2, '0')}`,
    terrain,
    neighbors,
    bound: getTerrainAssetBinding(bindings, terrain, mask) !== null,
  };
}

export function terrainMaskTopologyCatalog(
  terrain: TerrainKey,
  bindings: TerrainAssetBindingMap = {},
): TerrainMaskTopology[] {
  return Array.from({ length: 256 }, (_, mask) => terrainMaskTopology(terrain, mask, bindings));
}
