import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { paintCell } from './map-state';
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

function prospectiveDocument(document: MapDocument, layerId: string, points: GridPoint[], paintedTerrain: TerrainKey | null): MapDocument {
  if (paintedTerrain === null) return document;
  let next = document;
  for (const point of points) next = paintCell(next, layerId, point, paintedTerrain);
  return next;
}

function affectedPoints(document: MapDocument, points: GridPoint[]): GridPoint[] {
  const unique = new Map<string, GridPoint>();
  for (const point of points) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = point.x + dx, y = point.y + dy;
      if (x >= 0 && y >= 0 && x < document.width && y < document.height) unique.set(`${x}:${y}`, { x, y });
    }
  }
  return [...unique.values()];
}

export function analyzeTerrainBrushPreview(document: MapDocument, layerId: string, points: GridPoint[], paintedTerrain: TerrainKey | null): TerrainBrushPreview {
  const changed = [...new Map(points.filter(p => p.x >= 0 && p.y >= 0 && p.x < document.width && p.y < document.height).map(p => [`${p.x}:${p.y}`, p])).values()];
  const previewDocument = prospectiveDocument(document, layerId, changed, paintedTerrain);
  const cells: TerrainBrushPreviewCell[] = [];
  const terrainCounts: Partial<Record<TerrainKey, number>> = {};
  const junctionCounts: TerrainBrushPreview['junctionCounts'] = { none: 0, single: 0, dual: 0, triple: 0, quad: 0 };

  for (const point of affectedPoints(previewDocument, changed)) {
    const terrain = terrainAt(previewDocument, point, layerId);
    const mask = terrain ? neighborMask(previewDocument, layerId, point, terrain) : null;
    const junction = terrain ? resolveTerrainJunction(previewDocument, layerId, point) : null;
    const junctionKind = junction?.junction.kind ?? 'none';
    const junctionMode = junction?.mode ?? 'none';
    cells.push({ point, terrain, mask, variantKey: mask === null ? null : terrainVariantKey(mask), junctionKind, junctionMode });
    if (terrain) terrainCounts[terrain] = (terrainCounts[terrain] ?? 0) + 1;
    junctionCounts[junctionKind] += 1;
  }
  return { cells, changedCells: changed, terrainCounts, junctionCounts };
}
