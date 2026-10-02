import type { MapDocument } from './map-document';
import type { GridPoint } from './grid';
import {
  neighborMask,
  terrainAt,
  waterNeighborMask,
  terrainFromTileId,
  terrainVariantKey,
  type TerrainKey,
  type TerrainMask,
} from './terrain-engine';
import { terrainRuleKey } from './terrain-rule-catalog';
import {
  getTerrainAssetBinding,
  terrainAssetIdForMask,
  type TerrainAssetBindingMap,
} from './terrain-asset-binding';

export type TerrainVariant = {
  terrain: TerrainKey;
  mask: TerrainMask;
  variantKey: string;
  ruleKey: string | null;
  assetId: string | null;
  tileId: string | null;
  shorelineMask: TerrainMask | null;
};

export type TerrainResolver = (terrain: TerrainKey, mask: TerrainMask) => string | null;

const FALLBACK_TILE: Record<TerrainKey, string> = {
  grass: 'starter-tile',
  grassalt: 'grassalt',
  sand: 'sand',
  redsand: 'redsand',
  dirt: 'dirt',
  dirt2: 'dirt2',
  pavement: 'stone-tile',
  water: 'water-tile',
  deepwater: 'deepwater',
  deepwater2: 'deepwater2',
  brackish: 'brackish',
  tallgrass: 'tallgrass',
  hole: 'hole',
  holek: 'holek',
  holemid: 'holemid',
  lava: 'lava',
  lavarock: 'lavarock',
};

const WATER_TERRAINS = new Set<TerrainKey>(['water', 'brackish', 'deepwater2', 'deepwater']);

function hasWaterNeighbor(document: MapDocument, layerId: string, point: GridPoint): boolean {
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const x = point.x + dx;
      const y = point.y + dy;
      if (x < 0 || y < 0 || x >= document.width || y >= document.height) continue;
      if (WATER_TERRAINS.has(terrainAt(document, { x, y }, layerId) as TerrainKey)) return true;
    }
  }
  return false;
}

export function resolveTerrainVariant(
  terrain: TerrainKey,
  mask: TerrainMask,
  resolver?: TerrainResolver,
): TerrainVariant {
  const assetId = resolver?.(terrain, mask) ?? null;
  return {
    terrain,
    mask,
    variantKey: terrainVariantKey(mask),
    ruleKey: terrainRuleKey(terrain),
    assetId,
    tileId: assetId ?? FALLBACK_TILE[terrain] ?? null,
    shorelineMask: null,
  };
}

export function resolveTerrainCell(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  resolver?: TerrainResolver,
): TerrainVariant | null {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return null;
  return resolveTerrainVariant(terrain, neighborMask(document, layerId, point, terrain), resolver);
}

/**
 * Render-time terrain resolution. The MapDocument remains semantic/source data;
 * this helper derives the visual mask and approved asset binding without
 * persisting a render variant. Land directly touching any derived water depth
 * intentionally uses its verified base mask (255), avoiding an invented cliff
 * transition until an approved shoreline mask exists.
 */
export function resolveTerrainRenderCell(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  bindings: TerrainAssetBindingMap,
): TerrainVariant | null {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return null;

  const semanticMask = neighborMask(document, layerId, point, terrain);
  const shorelineMask = WATER_TERRAINS.has(terrain) ? null : waterNeighborMask(document, layerId, point);
  const renderMask = terrain === 'deepwater'
    ? 255
    : (shorelineMask ? 255 : semanticMask);
  const binding = getTerrainAssetBinding(bindings, terrain, renderMask);

  return {
    terrain,
    mask: renderMask,
    variantKey: terrainVariantKey(renderMask),
    ruleKey: terrainRuleKey(terrain),
    assetId: binding?.assetId ?? null,
    tileId: binding?.assetId ?? FALLBACK_TILE[terrain] ?? null,
    shorelineMask,
  };
}

export function resolveTerrainArea(
  document: MapDocument,
  layerId: string,
  points: GridPoint[],
  resolver?: TerrainResolver,
): TerrainVariant[] {
  const seen = new Set<string>();
  const result: TerrainVariant[] = [];
  for (const point of points) {
    const key = `${point.x}:${point.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const variant = resolveTerrainCell(document, layerId, point, resolver);
    if (variant) result.push(variant);
  }
  return result;
}

export function createTerrainAssetResolver(bindings: TerrainAssetBindingMap): TerrainResolver {
  return (terrain, mask) => terrainAssetIdForMask(bindings, terrain, mask);
}

export function resolveTerrainCellWithAssets(
  document: MapDocument,
  layerId: string,
  point: GridPoint,
  bindings: TerrainAssetBindingMap,
): TerrainVariant | null {
  return resolveTerrainCell(document, layerId, point, createTerrainAssetResolver(bindings));
}

export function tileIdForTerrain(terrain: TerrainKey): string {
  return FALLBACK_TILE[terrain];
}

export function terrainFromResolvedTile(tileId: string | null): TerrainKey | null {
  return terrainFromTileId(tileId);
}
