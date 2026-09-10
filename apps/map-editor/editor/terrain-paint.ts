import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { paintCell } from './map-state';
import { affectedTerrainCells, terrainFromTileId, terrainVariantKey, neighborMask } from './terrain-engine';
import { applyTerrainAutotile, type TerrainCellVariant } from './terrain-autotile-apply';
import type { TerrainAssetBindingMap } from './terrain-asset-binding';

export type TerrainPaintResult = {
  document: MapDocument;
  affected: GridPoint[];
  variants: TerrainCellVariant[];
};

/**
 * Paints logical terrain first, then re-evaluates the changed perimeter.
 * The logical tile remains canonical when no verified render binding exists.
 */
export function applyTerrainPaint(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  tileId: string | null,
  bindings: TerrainAssetBindingMap = {},
): TerrainPaintResult {
  let next = document;
  for (const point of points) next = paintCell(next, layerId, point, tileId);

  const affected = affectedTerrainCells(next, points);
  const result = applyTerrainAutotile(next, layerId, affected, bindings);
  return {
    document: result.document,
    affected,
    variants: result.variants,
  };
}

export function terrainVariantsForPoints(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
): Array<{ point: GridPoint; terrain: string; mask: number; variantKey: string }> {
  return points.flatMap(point => {
    const terrain = terrainFromTileId(document.layers.find(l => l.id === layerId)?.cells[point.y * document.width + point.x]?.tileId ?? null);
    if (!terrain) return [];
    const mask = neighborMask(document, layerId, point, terrain);
    return [{ point, terrain, mask, variantKey: terrainVariantKey(mask) }];
  });
}
