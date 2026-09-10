import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { neighborMask, terrainAt, terrainNeighborhood, terrainVariantKey, type TerrainKey } from './terrain-engine';
import { terrainRuleKey } from './terrain-rule-catalog';
import { getTerrainAssetBinding, type TerrainAssetBindingMap } from './terrain-asset-binding';

export type TerrainInspectorResult = {
  point: GridPoint;
  terrain: TerrainKey | null;
  mask: number | null;
  variantKey: string | null;
  ruleKey: string | null;
  assetId: string | null;
  bindingStatus: 'bound' | 'unbound' | 'not-terrain';
  neighbors: Record<'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw', boolean> | null;
};

export function inspectTerrainCell(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  bindings: TerrainAssetBindingMap = {},
): TerrainInspectorResult {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) {
    return { point, terrain: null, mask: null, variantKey: null, ruleKey: null, assetId: null, bindingStatus: 'not-terrain', neighbors: null };
  }
  const mask = neighborMask(document, layerId, point, terrain);
  const binding = getTerrainAssetBinding(bindings, terrain, mask);
  return {
    point,
    terrain,
    mask,
    variantKey: terrainVariantKey(mask),
    ruleKey: terrainRuleKey(terrain),
    assetId: binding?.assetId ?? null,
    bindingStatus: binding ? 'bound' : 'unbound',
    neighbors: terrainNeighborhood(document, layerId, point, terrain),
  };
}
