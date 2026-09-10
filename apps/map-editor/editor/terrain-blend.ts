import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { neighborMask, terrainAt, terrainFromTileId, TERRAIN_MASK_BITS, type TerrainKey } from './terrain-engine';
import { terrainCornerContext } from './terrain-blend-context';

export type TerrainBlendDirection = 'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw';
export type TerrainBlend = {
  point: GridPoint;
  terrain: TerrainKey;
  direction: TerrainBlendDirection;
  neighborTerrain: TerrainKey;
  mask: number;
  key: string;
  kind: 'edge' | 'corner';
};

const DIRECTIONS: Array<[TerrainBlendDirection, number, number, number, 'edge' | 'corner']> = [
  ['n', 0, -1, TERRAIN_MASK_BITS.n, 'edge'], ['e', 1, 0, TERRAIN_MASK_BITS.e, 'edge'],
  ['s', 0, 1, TERRAIN_MASK_BITS.s, 'edge'], ['w', -1, 0, TERRAIN_MASK_BITS.w, 'edge'],
  ['ne', 1, -1, TERRAIN_MASK_BITS.ne, 'corner'], ['se', 1, 1, TERRAIN_MASK_BITS.se, 'corner'],
  ['sw', -1, 1, TERRAIN_MASK_BITS.sw, 'corner'], ['nw', -1, -1, TERRAIN_MASK_BITS.nw, 'corner'],
];

export function terrainBlendKey(from: TerrainKey, to: TerrainKey, direction: TerrainBlendDirection): string {
  return `${from}->${to}:${direction}`;
}

export function terrainBlendsAt(document: MapDocument, layerId: string, point: GridPoint): TerrainBlend[] {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return [];
  const mask = neighborMask(document, layerId, point, terrain);
  const result: TerrainBlend[] = [];
  for (const [direction, dx, dy, bit, kind] of DIRECTIONS) {
    const x = point.x + dx, y = point.y + dy;
    if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
    const neighbor = terrainAt(document, { x, y }, layerId);
    if (!neighbor || neighbor === terrain || (mask & bit) !== 0) continue;
    if (kind === 'corner') {
      const context = terrainCornerContext(document, layerId, point, direction as 'ne' | 'se' | 'sw' | 'nw');
      if (!context?.render) continue;
    }
    result.push({ point, terrain, direction, neighborTerrain: neighbor, mask, key: terrainBlendKey(terrain, neighbor, direction), kind });
  }
  return result;
}

export function terrainBlendsForMask(document: MapDocument, layerId: string, point: GridPoint): TerrainBlend[] {
  return terrainBlendsAt(document, layerId, point);
}

export function terrainBlendArea(document: MapDocument, layerId: string, points: GridPoint[]): TerrainBlend[] {
  const result: TerrainBlend[] = [];
  const seen = new Set<string>();
  for (const point of points) for (const blend of terrainBlendsAt(document, layerId, point)) {
    const key = `${blend.key}@${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key); result.push(blend);
  }
  return result;
}

export function terrainAtCellFromTile(document: MapDocument, layerId: string, point: GridPoint): TerrainKey | null {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return null;
  return terrainFromTileId(layer.cells[point.y * document.width + point.x]?.tileId ?? null);
}
