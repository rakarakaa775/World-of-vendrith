import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { paintCell } from './map-state';
import { affectedTerrainCells, terrainFromTileId, terrainVariantKey, neighborMask } from './terrain-engine';

export type TerrainPaintResult = {
  document: MapDocument;
  affected: GridPoint[];
  variants: Array<{ point: GridPoint; terrain: string; mask: number; variantKey: string }>;
};

export function applyTerrainPaint(document: MapDocument, layerId: string, points: GridPoint[], tileId: string | null): TerrainPaintResult {
  let next = document;
  for (const point of points) next = paintCell(next, layerId, point, tileId);
  const affected = affectedTerrainCells(document, points);
  const variants = affected.flatMap(point => {
    const terrain = terrainFromTileId(next.layers.find(l => l.id === layerId)?.cells[point.y * next.width + point.x]?.tileId ?? null);
    if (!terrain) return [];
    const mask = neighborMask(next, layerId, point, terrain);
    return [{ point, terrain, mask, variantKey: terrainVariantKey(mask) }];
  });
  return { document: next, affected, variants };
}
