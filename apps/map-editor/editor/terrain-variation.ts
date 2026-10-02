import type { TerrainKey } from './terrain-engine';

/**
 * Stable integer hash for renderer-only terrain variation.
 * It deliberately avoids Math.random so the same world/coordinate always
 * resolves to the same variant after save/load.
 */
export function terrainVariationHash(
  worldSeed: string,
  x: number,
  y: number,
  terrain: TerrainKey,
): number {
  let hash = 2166136261;

  const input = `${worldSeed}|${x}|${y}|${terrain}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;

  return hash >>> 0;
}

export function terrainVariationIndex(
  worldSeed: string,
  x: number,
  y: number,
  terrain: TerrainKey,
  variantCount: number,
): number {
  if (!Number.isInteger(variantCount) || variantCount <= 0) {
    throw new Error('variantCount must be a positive integer');
  }

  return terrainVariationHash(worldSeed, x, y, terrain) % variantCount;
}
