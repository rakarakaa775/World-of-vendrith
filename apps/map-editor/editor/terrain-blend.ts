import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { neighborMask, terrainAt, terrainFromTileId, TERRAIN_MASK_BITS, type TerrainKey } from './terrain-engine';

export type TerrainBlendDirection = 'n' | 'e' | 's' | 'w';
export type TerrainBlend = {
  point: GridPoint;
  terrain: TerrainKey;
  direction: TerrainBlendDirection;
  neighborTerrain: TerrainKey;
  mask: number;
  key: string;
};

const DIRECTIONS: Array<[TerrainBlendDirection, number, number, number]> = [
  ['n', 0, -1, TERRAIN_MASK_BITS.n],
  ['e', 1, 0, TERRAIN_MASK_BITS.e],
  ['s', 0, 1, TERRAIN_MASK_BITS.s],
  ['w', -1, 0, TERRAIN_MASK_BITS.w],
];

export function terrainBlendKey(from: TerrainKey, to: TerrainKey, direction: TerrainBlendDirection): string {
  return `${from}->${to}:${direction}`;
}

export function terrainBlendsAt(document: MapDocument, layerId: string, point: GridPoint): TerrainBlend[] {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return [];
  const mask = neighborMask(document, layerId, point, terrain);
  const result: TerrainBlend[] = [];
  for (const [direction, dx, dy, bit] of DIRECTIONS) {
    const x = point.x + dx;
    const y = point.y + dy;
    if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
    const neighbor = terrainAt(document, { x, y }, layerId);
    if (!neighbor || neighbor === terrain) continue;
    result.push({ point, terrain, direction, neighborTerrain: neighbor, mask, key: terrainBlendKey(terrain, neighbor, direction) });
  }
  return result;
}

export function terrainBlendArea(document: MapDocument, layerId: string, points: GridPoint[]): TerrainBlend[] {
  const result: TerrainBlend[] = [];
  const seen = new Set<string>();
  for (const point of points) {
    for (const blend of terrainBlendsAt(document, layerId, point)) {
      if (seen.has(blend.key + `@${point.x}:${point.y}`)) continue;
      seen.add(blend.key + `@${point.x}:${point.y}`);
      result.push(blend);
    }
  }
  return result;
}

export function terrainAtCellFromTile(document: MapDocument, layerId: string, point: GridPoint): TerrainKey | null {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return null;
  const cell = layer.cells[point.y * document.width + point.x];
  return terrainFromTileId(cell?.tileId ?? null);
}
