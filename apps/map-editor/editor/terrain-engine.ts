import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';

export const TERRAIN_KEYS = ['grass', 'sand', 'dirt', 'pavement', 'water'] as const;
export type TerrainKey = (typeof TERRAIN_KEYS)[number];

export type TerrainNeighborhood = {
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
};

export type TerrainMask = number;

const DIRECTIONS: Array<[keyof TerrainNeighborhood, number, number]> = [
  ['n', 0, -1], ['e', 1, 0], ['s', 0, 1], ['w', -1, 0],
  ['ne', 1, -1], ['se', 1, 1], ['sw', -1, 1], ['nw', -1, -1],
];

export function terrainFromTileId(tileId: string | null): TerrainKey | null {
  if (!tileId) return null;
  if (tileId === 'starter-tile') return 'grass';
  if (tileId === 'stone-tile') return 'pavement';
  if (tileId === 'water-tile') return 'water';
  if ((TERRAIN_KEYS as readonly string[]).includes(tileId)) return tileId as TerrainKey;
  return null;
}

export function terrainAt(document: MapDocument, point: GridPoint, layerId: string): TerrainKey | null {
  if (point.x < 0 || point.y < 0 || point.x >= document.width || point.y >= document.height) return null;
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return null;
  const tileId = layer.cells[point.y * document.width + point.x]?.tileId ?? null;
  return terrainFromTileId(tileId);
}

export function neighborMask(document: MapDocument, layerId: string, point: GridPoint, terrain: TerrainKey): TerrainMask {
  let mask = 0;
  DIRECTIONS.forEach(([key, dx, dy], index) => {
    if (terrainAt(document, { x: point.x + dx, y: point.y + dy }, layerId) === terrain) mask |= 1 << index;
  });
  return mask;
}

export function terrainNeighborhood(document: MapDocument, layerId: string, point: GridPoint, terrain: TerrainKey): TerrainNeighborhood {
  return Object.fromEntries(DIRECTIONS.map(([key, dx, dy]) => [key, terrainAt(document, { x: point.x + dx, y: point.y + dy }, layerId) === terrain])) as TerrainNeighborhood;
}

export function affectedTerrainCells(document: MapDocument, points: GridPoint[]): GridPoint[] {
  const seen = new Set<string>();
  const result: GridPoint[] = [];
  for (const point of points) {
    for (const [_, dx, dy] of DIRECTIONS) {
      const candidate = { x: point.x + dx, y: point.y + dy };
      if (candidate.x < 0 || candidate.y < 0 || candidate.x >= document.width || candidate.y >= document.height) continue;
      const key = `${candidate.x}:${candidate.y}`;
      if (!seen.has(key)) { seen.add(key); result.push(candidate); }
    }
    const key = `${point.x}:${point.y}`;
    if (!seen.has(key)) { seen.add(key); result.push(point); }
  }
  return result;
}

export function terrainVariantKey(mask: TerrainMask): string {
  return `mask_${mask.toString(16).padStart(2, '0')}`;
}
