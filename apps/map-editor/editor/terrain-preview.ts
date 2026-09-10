import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { neighborMask, terrainFromTileId, terrainVariantKey, type TerrainKey } from './terrain-engine';
import { pointsInLine, pointsInRectangle, pointsInSquare, type PaintShape } from './paint-tools';
import { terrainJunctionAt } from './terrain-junction';

export type TerrainPreviewCell = {
  point: GridPoint;
  terrain: TerrainKey | null;
  mask: number | null;
  variantKey: string | null;
  junctionKind: 'none' | 'single' | 'dual' | 'triple' | 'quad';
};

export function terrainPreviewPoints(
  shape: PaintShape,
  start: GridPoint,
  end: GridPoint = start,
  size = 1,
): GridPoint[] {
  if (shape === 'square') return pointsInSquare(end, size);
  if (shape === 'line') return pointsInLine(start, end);
  if (shape === 'rectangle') return pointsInRectangle(start, end);
  return [];
}

export function inspectTerrainPreview(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
): TerrainPreviewCell[] {
  const result: TerrainPreviewCell[] = [];
  const seen = new Set<string>();
  for (const point of points) {
    if (point.x < 0 || point.y < 0 || point.x >= document.width || point.y >= document.height) continue;
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const layer = document.layers.find(item => item.id === layerId);
    const tileId = layer?.cells[point.y * document.width + point.x]?.tileId ?? null;
    const terrain = terrainFromTileId(tileId);
    if (!terrain) {
      result.push({ point, terrain: null, mask: null, variantKey: null, junctionKind: 'none' });
      continue;
    }
    const mask = neighborMask(document, layerId, point, terrain);
    const junction = terrainJunctionAt(document, layerId, point);
    result.push({
      point,
      terrain,
      mask,
      variantKey: terrainVariantKey(mask),
      junctionKind: junction?.kind ?? 'none',
    });
  }
  return result;
}

export function terrainPreviewSummary(cells: TerrainPreviewCell[]) {
  const terrainCounts: Partial<Record<TerrainKey, number>> = {};
  const junctionCounts: Record<TerrainPreviewCell['junctionKind'], number> = {
    none: 0,
    single: 0,
    dual: 0,
    triple: 0,
    quad: 0,
  };
  for (const cell of cells) {
    if (cell.terrain) terrainCounts[cell.terrain] = (terrainCounts[cell.terrain] ?? 0) + 1;
    junctionCounts[cell.junctionKind] += 1;
  }
  return { cells: cells.length, terrainCounts, junctionCounts };
}
