import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { paintCell } from './map-state';
import { deriveWaterProjection } from './water-projection';
import { pointsInFloodFill } from './paint-tools';
import { affectedTerrainCells, terrainFromTileId, type TerrainKey } from './terrain-engine';
import { resolveTerrainJunction } from './terrain-junction-resolver';
import { createTerrainAssetResolver, resolveTerrainCell, tileIdForTerrain } from './terrain-resolver';
import type { TerrainAssetBindingMap } from './terrain-asset-binding';

export type TerrainBrushPreviewCell = {
  point: GridPoint;
  terrain: TerrainKey | null;
  mask: number | null;
  variantKey: string | null;
  junctionKind: 'none' | 'single' | 'dual' | 'triple' | 'quad';
  junctionMode: 'none' | 'edge' | 'dual-corner' | 'triple-corner' | 'quad-corner';
  assetId: string | null;
  tileId: string | null;
  bound: boolean;
};

export type TerrainBrushPreview = {
  cells: TerrainBrushPreviewCell[];
  changedCells: GridPoint[];
  terrainCounts: Partial<Record<TerrainKey, number>>;
  junctionCounts: Record<'none' | 'single' | 'dual' | 'triple' | 'quad', number>;
};

const TERRAIN_INPUTS: Partial<Record<TerrainKey, string>> = Object.fromEntries(
  ([
    'grass','grassalt','sand','redsand','dirt','dirt2','pavement',
    'water','deepwater','deepwater2','brackish','tallgrass',
    'hole','holek','holemid','lava','lavarock',
  ] as TerrainKey[]).map(terrain => [terrain, tileIdForTerrain(terrain)]),
) as Partial<Record<TerrainKey, string>>;

function normalizePaintedTileId(value: string | null): string | null {
  if (!value) return null;
  if (value in TERRAIN_INPUTS) return TERRAIN_INPUTS[value as TerrainKey] ?? null;
  const terrain = terrainFromTileId(value);
  return terrain ? tileIdForTerrain(terrain) : value;
}

function prospectiveDocument(document: MapDocument, layerId: string, points: GridPoint[], paintedTileId: string | null): MapDocument {
  if (points.length === 0) return document;
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return document;
  let next = document;
  const normalizedTileId = normalizePaintedTileId(paintedTileId);
  for (const point of points) next = paintCell(next, layerId, point, normalizedTileId);
  return next;
}

/** Apply derived water bands to a temporary preview document only. */
function withWaterProjection(document: MapDocument, layerId: string): MapDocument {
  const projection = deriveWaterProjection(document, layerId);
  if (!projection) return document;
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer || layer.kind !== 'ground') return document;
  let changed = false;
  const cells = layer.cells.map((cell, index) => {
    const band = projection.bands[index];
    if (!band || cell.tileId === band) return cell;
    changed = true;
    return { ...cell, tileId: band };
  });
  if (!changed) return document;
  return {
    ...document,
    layers: document.layers.map(item => item.id === layerId ? { ...item, cells } : item),
  };
}

function previewCells(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  bindings: TerrainAssetBindingMap,
): TerrainBrushPreviewCell[] {
  const result: TerrainBrushPreviewCell[] = [];
  const seen = new Set<string>();
  const resolver = createTerrainAssetResolver(bindings);
  for (const point of points) {
    if (point.x < 0 || point.y < 0 || point.x >= document.width || point.y >= document.height) continue;
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const resolved = resolveTerrainCell(document, layerId, point, resolver);
    if (!resolved) {
      result.push({ point, terrain: null, mask: null, variantKey: null, junctionKind: 'none', junctionMode: 'none', assetId: null, tileId: null, bound: false });
      continue;
    }
    const junction = resolveTerrainJunction(document, layerId, point);
    result.push({
      point,
      terrain: resolved.terrain,
      mask: resolved.mask,
      variantKey: resolved.variantKey,
      junctionKind: junction?.junction.kind ?? 'none',
      junctionMode: junction?.mode ?? 'none',
      assetId: resolved.assetId,
      tileId: resolved.tileId,
      bound: resolved.assetId !== null,
    });
  }
  return result;
}

export function analyzeTerrainBrushPreview(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  paintedTileId: string | null,
  bindings: TerrainAssetBindingMap = {},
): TerrainBrushPreview {
  const unique = new Map<string, GridPoint>();
  for (const point of points) {
    if (point.x < 0 || point.y < 0 || point.x >= document.width || point.y >= document.height) continue;
    unique.set(`${point.x}:${point.y}`, point);
  }
  const changedCells = [...unique.values()];
  const prospective = prospectiveDocument(document, layerId, changedCells, paintedTileId);
  // Match the Pixi canvas: preview derived water depth without writing it into
  // the authored document used by painting, history, or persistence.
  const renderPreview = withWaterProjection(prospective, layerId);
  const affected = affectedTerrainCells(renderPreview, changedCells);
  const cells = previewCells(renderPreview, layerId, affected, bindings);
  const terrainCounts: Partial<Record<TerrainKey, number>> = {};
  const junctionCounts: TerrainBrushPreview['junctionCounts'] = { none: 0, single: 0, dual: 0, triple: 0, quad: 0 };
  for (const cell of cells) {
    if (cell.terrain) terrainCounts[cell.terrain] = (terrainCounts[cell.terrain] ?? 0) + 1;
    junctionCounts[cell.junctionKind] += 1;
  }
  return { cells, changedCells, terrainCounts, junctionCounts };
}

export function analyzeFloodTerrainBrushPreview(
  document: MapDocument,
  layerId: string,
  start: GridPoint,
  paintedTileId: string | null,
  bindings: TerrainAssetBindingMap = {},
): TerrainBrushPreview {
  const points = pointsInFloodFill(document, layerId, start);
  return analyzeTerrainBrushPreview(document, layerId, points, paintedTileId, bindings);
}
