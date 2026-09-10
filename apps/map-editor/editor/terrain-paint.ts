import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { paintCell } from './map-state';
import { affectedTerrainCells, terrainFromTileId, terrainVariantKey, neighborMask } from './terrain-engine';
import { applyTerrainAutotile, type TerrainCellVariant } from './terrain-autotile-apply';
import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import {
  validateTerrainCell,
  validateTerrainPaint,
  type TerrainValidationResult,
} from './terrain-validation';

export type TerrainPaintResult = {
  document: MapDocument;
  affected: GridPoint[];
  variants: TerrainCellVariant[];
  validation: TerrainValidationResult[];
};

/**
 * Validates the requested terrain edit before mutation, then paints logical
 * terrain and re-evaluates the changed perimeter. Missing render bindings are
 * valid fallback states; they never make logical terrain invalid.
 */
export function applyTerrainPaint(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  tileId: string | null,
  bindings: TerrainAssetBindingMap = {},
): TerrainPaintResult {
  const requestValidation = validateTerrainPaint(document, layerId, points, tileId, bindings);
  if (!requestValidation.valid) {
    return {
      document,
      affected: [],
      variants: [],
      validation: requestValidation.points.map(point =>
        validateTerrainCell(document, layerId, point, bindings),
      ),
    };
  }

  let next = document;
  for (const point of requestValidation.points) next = paintCell(next, layerId, point, tileId);

  const affected = affectedTerrainCells(next, requestValidation.points);
  const result = applyTerrainAutotile(next, layerId, affected, bindings);
  const validation = affected.map(point => validateTerrainCell(result.document, layerId, point, bindings));
  return {
    document: result.document,
    affected,
    variants: result.variants,
    validation,
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
