import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { neighborMask, terrainAt, terrainNeighborhood, terrainVariantKey, type TerrainKey } from './terrain-engine';
import { terrainRuleKey } from './terrain-rule-catalog';
import { getTerrainAssetBinding, type TerrainAssetBindingMap } from './terrain-asset-binding';
import { resolveTerrainJunction } from './terrain-junction-resolver';
import { terrainJunctionGeometry, junctionCornerDirections, type TerrainJunctionGeometry } from './terrain-junction-geometry';

export type TerrainInspectorResult = {
  point: GridPoint;
  terrain: TerrainKey | null;
  mask: number | null;
  variantKey: string | null;
  ruleKey: string | null;
  assetId: string | null;
  bindingStatus: 'bound' | 'unbound' | 'not-terrain';
  neighbors: Record<'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw', boolean> | null;
  junction: {
    kind: 'none' | 'single' | 'dual' | 'triple' | 'quad';
    mode: 'none' | 'edge' | 'dual-corner' | 'triple-corner' | 'quad-corner';
    strength: number;
    secondaryTerrains: TerrainKey[];
    directions: Array<'n' | 'e' | 's' | 'w' | 'ne' | 'se' | 'sw' | 'nw'>;
    corners: Array<'ne' | 'se' | 'sw' | 'nw'>;
  } | null;
};

export function inspectTerrainCell(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  bindings: TerrainAssetBindingMap = {},
): TerrainInspectorResult {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) {
    return { point, terrain: null, mask: null, variantKey: null, ruleKey: null, assetId: null, bindingStatus: 'not-terrain', neighbors: null, junction: null };
  }
  const mask = neighborMask(document, layerId, point, terrain);
  const binding = getTerrainAssetBinding(bindings, terrain, mask);
  const resolution = resolveTerrainJunction(document, layerId, point);
  let junction: TerrainInspectorResult['junction'] = null;
  if (resolution) {
    const geometry: TerrainJunctionGeometry = terrainJunctionGeometry(resolution, point);
    junction = {
      kind: resolution.junction.kind,
      mode: geometry.mode,
      strength: geometry.strength,
      secondaryTerrains: geometry.secondaryTerrains,
      directions: geometry.directions,
      corners: junctionCornerDirections(geometry),
    };
  }
  return {
    point,
    terrain,
    mask,
    variantKey: terrainVariantKey(mask),
    ruleKey: terrainRuleKey(terrain),
    assetId: binding?.assetId ?? null,
    bindingStatus: binding ? 'bound' : 'unbound',
    neighbors: terrainNeighborhood(document, layerId, point, terrain),
    junction,
  };
}
