import type { MapDocument } from './map-document';
import type { GridPoint } from './grid';
import { neighborMask, terrainAt, terrainFromTileId, terrainVariantKey, type TerrainKey, type TerrainMask } from './terrain-engine';
import { terrainRuleKey } from './terrain-rule-catalog';
import { terrainAssetIdForMask, type TerrainAssetBindingMap } from './terrain-asset-binding';

export type TerrainVariant = {
  terrain: TerrainKey;
  mask: TerrainMask;
  variantKey: string;
  ruleKey: string | null;
  assetId: string | null;
  tileId: string | null;
};

export type TerrainResolver = (terrain: TerrainKey, mask: TerrainMask) => string | null;

const FALLBACK_TILE: Record<TerrainKey, string> = {
  grass: 'starter-tile',
  sand: 'sand',
  dirt: 'dirt',
  pavement: 'stone-tile',
  water: 'water-tile',
};

export function resolveTerrainVariant(terrain: TerrainKey, mask: TerrainMask, resolver?: TerrainResolver): TerrainVariant {
  const assetId = resolver?.(terrain, mask) ?? null;
  return {
    terrain,
    mask,
    variantKey: terrainVariantKey(mask),
    ruleKey: terrainRuleKey(terrain),
    assetId,
    tileId: assetId ?? FALLBACK_TILE[terrain] ?? null,
  };
}

export function resolveTerrainCell(document: MapDocument, layerId: string, point: GridPoint, resolver?: TerrainResolver): TerrainVariant | null {
  const terrain = terrainAt(document, point, layerId);
  if (!terrain) return null;
  return resolveTerrainVariant(terrain, neighborMask(document, layerId, point, terrain), resolver);
}

export function resolveTerrainArea(document: MapDocument, layerId: string, points: GridPoint[], resolver?: TerrainResolver): TerrainVariant[] {
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

export function resolveTerrainCellWithAssets(document: MapDocument, layerId: string, point: GridPoint, bindings: TerrainAssetBindingMap): TerrainVariant | null {
  return resolveTerrainCell(document, layerId, point, createTerrainAssetResolver(bindings));
}

export function tileIdForTerrain(terrain: TerrainKey): string {
  return FALLBACK_TILE[terrain];
}

export function terrainFromResolvedTile(tileId: string | null): TerrainKey | null {
  return terrainFromTileId(tileId);
}
