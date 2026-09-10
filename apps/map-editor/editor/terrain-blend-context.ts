import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { neighborMask, terrainAt, TERRAIN_MASK_BITS, type TerrainKey } from './terrain-engine';
import type { TerrainBlend, TerrainBlendDirection } from './terrain-blend';

export type TerrainCornerContext = {
  direction: Extract<TerrainBlendDirection, 'ne' | 'se' | 'sw' | 'nw'>;
  terrain: TerrainKey;
  neighborTerrain: TerrainKey;
  mask: number;
  adjacentCardinals: { first: boolean; second: boolean };
  diagonalSame: boolean;
  render: boolean;
  geometry: 'triangle' | 'quad';
  strength: number;
};

const CORNERS = [
  ['ne', 'n', 'e', 'ne', 1, -1],
  ['se', 's', 'e', 'se', 1, 1],
  ['sw', 's', 'w', 'sw', -1, 1],
  ['nw', 'n', 'w', 'nw', -1, -1],
] as const;

const BIT: Record<string, number> = TERRAIN_MASK_BITS;

export function terrainCornerContext(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  direction: Extract<TerrainBlendDirection, 'ne' | 'se' | 'sw' | 'nw'>,
): TerrainCornerContext | null {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return null;
  const mask = neighborMask(document, layerId, point, terrain);
  const entry = CORNERS.find(item => item[0] === direction);
  if (!entry) return null;
  const [, firstDir, secondDir, diagonalDir, dx, dy] = entry;
  const first = (mask & BIT[firstDir]) !== 0;
  const second = (mask & BIT[secondDir]) !== 0;
  const diagonalSame = (mask & BIT[diagonalDir]) !== 0;
  const neighbor = terrainAt(document, { x: point.x + dx, y: point.y + dy }, layerId);
  if (!neighbor || neighbor === terrain) return null;

  // If both cardinal neighbors are already the same terrain, the corner is
  // internally covered by those edge transitions and should not be painted.
  const render = !(first && second) && (!diagonalSame || first !== second);
  const geometry = first || second ? 'triangle' : diagonalSame ? 'quad' : 'triangle';
  const strength = first && !second || second && !first ? 0.16 : diagonalSame ? 0.22 : 0.28;
  return {
    direction,
    terrain,
    neighborTerrain: neighbor,
    mask,
    adjacentCardinals: { first, second },
    diagonalSame,
    render,
    geometry,
    strength,
  };
}

export function contextAwareCornerBlends(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
): TerrainBlend[] {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return [];
  const mask = neighborMask(document, layerId, point, terrain);
  const result: TerrainBlend[] = [];
  for (const [direction] of CORNERS) {
    const context = terrainCornerContext(document, layerId, point, direction);
    if (!context?.render) continue;
    result.push({
      point,
      terrain,
      direction,
      neighborTerrain: context.neighborTerrain,
      mask,
      key: `${terrain}->${context.neighborTerrain}:${direction}`,
      kind: 'corner',
    });
  }
  return result;
}

export function cornerBlendStrength(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  direction: Extract<TerrainBlendDirection, 'ne' | 'se' | 'sw' | 'nw'>,
): number {
  return terrainCornerContext(document, layerId, point, direction)?.strength ?? 0;
}
