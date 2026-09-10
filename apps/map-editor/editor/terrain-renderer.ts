import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import { resolveTerrainCellWithAssets, type TerrainVariant } from './terrain-resolver';
import { terrainBlendsAt, type TerrainBlend } from './terrain-blend';
import { resolveTerrainJunction, type TerrainJunctionResolution } from './terrain-junction-resolver';

export type TerrainRenderCell = {
  point: GridPoint;
  variant: TerrainVariant;
  renderMode: 'fallback' | 'asset';
  blend: TerrainBlend[];
  junction: TerrainJunctionResolution | null;
};

export type TerrainRenderPlan = {
  layerId: string;
  cells: TerrainRenderCell[];
};

/**
 * Builds the renderer-neutral terrain plan used by Pixi (and later Phaser).
 * Asset selection remains strictly binding-driven; an unbound terrain cell
 * stays renderable through the canonical logical tile fallback.
 */
export function buildTerrainRenderPlan(
  document: MapDocument,
  layerId: string,
  bindings: TerrainAssetBindingMap = {},
  points?: GridPoint[],
): TerrainRenderPlan {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer || layer.kind !== 'ground' || !layer.visible) return { layerId, cells: [] };

  const candidates = points?.length
    ? points
    : Array.from({ length: document.width * document.height }, (_, index) => ({
        x: index % document.width,
        y: Math.floor(index / document.width),
      }));

  const cells: TerrainRenderCell[] = [];
  const seen = new Set<string>();
  for (const point of candidates) {
    if (point.x < 0 || point.y < 0 || point.x >= document.width || point.y >= document.height) continue;
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const variant = resolveTerrainCellWithAssets(document, layerId, point, bindings);
    if (!variant) continue;
    cells.push({
      point,
      variant,
      renderMode: variant.assetId ? 'asset' : 'fallback',
      blend: terrainBlendsAt(document, layerId, point),
      junction: resolveTerrainJunction(document, layerId, point),
    });
  }
  return { layerId, cells };
}

export function terrainRenderCellAt(
  plan: TerrainRenderPlan,
  point: GridPoint,
): TerrainRenderCell | null {
  return plan.cells.find(cell => cell.point.x === point.x && cell.point.y === point.y) ?? null;
}
