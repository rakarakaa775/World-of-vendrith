import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { terrainAt, neighborMask, terrainVariantKey, type TerrainKey } from './terrain-engine';
import { resolveTerrainJunction } from './terrain-junction-resolver';

export type TerrainBrushPreviewCell = {
  point: GridPoint;
  terrain: TerrainKey | null;
  mask: number | null;
  variantKey: string | null;
  junctionKind: 'none' | 'single' | 'dual' | 'triple' | 'quad';
  junctionMode: 'none' | 'edge' | 'dual-corner' | 'triple-corner' | 'quad-corner';
};

export type TerrainBrushPreview = {
  cells: TerrainBrushPreviewCell[];
  changedCells: GridPoint[];
  terrainCounts: Partial<Record<TerrainKey, number>>;
  junctionCounts: Record<'none' | 'single' | 'dual' | 'triple' | 'quad', number>;
};

export function analyzeTerrainBrushPreview(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  paintedTerrain: TerrainKey | null,
): TerrainBrushPreview {
  const unique = new Map<string, GridPoint>();
  for (const point of points) {
    if (point.x < 0 || point.y < 0 || point.x >= document.width || point.y >= document.height) continue;
    unique.set(`${point.x}:${point.y}`, point);
  }

  const changedCells = [...unique.values()];
  const cells: TerrainBrushPreviewCell[] = [];
  const terrainCounts: Partial<Record<TerrainKey, number>> = {};
  const junctionCounts: TerrainBrushPreview['junctionCounts'] = { none: 0, single: 0, dual: 0, triple: 0, quad: 0 };

  for (const point of changedCells) {
    const terrain = paintedTerrain ?? terrainAt(document, point, layerId);
    const mask = terrain ? neighborMask(document, layerId, point, terrain) : null;
    const junction = terrain ? resolveTerrainJunction(document, layerId, point) : null;
    const junctionKind = junction?.junction.kind ?? 'none';
    const junctionMode = junction?.mode ?? 'none';
    cells.push({
      point,
      terrain,
      mask,
      variantKey: mask === null ? null : terrainVariantKey(mask),
      junctionKind,
      junctionMode,
    });
    if (terrain) terrainCounts[terrain] = (terrainCounts[terrain] ?? 0) + 1;
    junctionCounts[junctionKind] += 1;
  }

  return { cells, changedCells, terrainCounts, junctionCounts };
}
