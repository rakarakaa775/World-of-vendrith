import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { indexFor } from './grid';
import { neighborMask, terrainAt, terrainFromTileId, type TerrainKey } from './terrain-engine';
import { terrainAssetIdForMask, type TerrainAssetBindingMap } from './terrain-asset-binding';
import { tileIdForTerrain } from './terrain-resolver';

export type TerrainCellVariant = {
  point: GridPoint;
  terrain: TerrainKey;
  mask: number;
  assetId: string | null;
  tileId: string;
};

export type TerrainAutotileResult = {
  document: MapDocument;
  variants: TerrainCellVariant[];
};

function cellTerrain(document: MapDocument, layerId: string, point: GridPoint): TerrainKey | null {
  return terrainAt(document, point, layerId);
}

/**
 * Re-evaluates a changed area using the canonical 8-neighbor mask. The
 * document stores the logical terrain identity, while an audited asset
 * binding may provide a render asset for the resulting mask. Until such a
 * binding exists, the logical fallback tile remains unchanged.
 */
export function applyTerrainAutotile(
  document: MapDocument,
  layerId: string,
  changedPoints: GridPoint[],
  bindings: TerrainAssetBindingMap = {},
): TerrainAutotileResult {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer) return { document, variants: [] };

  const candidates = new Map<string, GridPoint>();
  for (const point of changedPoints) {
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const x = point.x + dx;
        const y = point.y + dy;
        if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
        candidates.set(`${x}:${y}`, { x, y });
      }
    }
  }

  let next = document;
  const variants: TerrainCellVariant[] = [];

  for (const point of candidates.values()) {
    const terrain = cellTerrain(next, layerId, point);
    if (!terrain) continue;
    const mask = neighborMask(next, layerId, point, terrain);
    const assetId = terrainAssetIdForMask(bindings, terrain, mask);
    const tileId = assetId ?? tileIdForTerrain(terrain);
    variants.push({ point, terrain, mask, assetId, tileId });

    // Only persist a render asset when the binding is explicitly verified.
    // Otherwise retain the logical terrain tile ID so future bindings can be
    // applied without losing the terrain identity.
    if (assetId) {
      const index = indexFor(point, next.width);
      const current = next.layers.find(item => item.id === layerId)?.cells[index]?.tileId ?? null;
      if (current !== assetId) {
        next = {
          ...next,
          layers: next.layers.map(item => item.id !== layerId ? item : {
            ...item,
            cells: item.cells.map((cell, cellIndex) => cellIndex === index ? { ...cell, tileId: assetId } : cell),
          }),
        };
      }
    }
  }

  return { document: next, variants };
}

export function logicalTerrainAt(document: MapDocument, layerId: string, point: GridPoint): TerrainKey | null {
  return terrainFromTileId(document.layers.find(layer => layer.id === layerId)?.cells[indexFor(point, document.width)]?.tileId ?? null);
}
