import { isLifeAssetRuntimeEligible, type LifeAssetReference } from "./life-asset-catalog";
import { parseLifeSpriteSheetGeometry, type LifeSpriteSheetGeometry } from "./life-sprite-sheet";

export type LifeSpriteLayerPlanEntry = {
  asset: LifeAssetReference;
  geometry: LifeSpriteSheetGeometry;
};

/**
 * Builds a deterministic, metadata-only layer plan. It deliberately does not
 * crop or render images: that requires source-verified frame geometry first.
 * Unapproved assets are excluded; approved assets without geometry fail closed.
 */
export function buildLifeSpriteLayerPlan(
  assets: LifeAssetReference[],
  geometryValues: unknown[],
): LifeSpriteLayerPlanEntry[] {
  const assetIds = new Set<string>();
  for (const asset of assets) {
    if (assetIds.has(asset.assetId)) throw new Error(`ID aset Life duplikat: ${asset.assetId}`);
    assetIds.add(asset.assetId);
  }

  const geometryById = new Map<string, LifeSpriteSheetGeometry>();
  for (const value of geometryValues) {
    const geometry = parseLifeSpriteSheetGeometry(value);
    if (geometryById.has(geometry.assetId)) throw new Error(`Geometri sprite duplikat: ${geometry.assetId}`);
    geometryById.set(geometry.assetId, geometry);
  }

  return assets
    .filter(isLifeAssetRuntimeEligible)
    .map((asset) => {
      const geometry = geometryById.get(asset.assetId);
      if (!geometry) throw new Error(`Geometri sprite belum tersedia: ${asset.assetId}`);
      return { asset, geometry };
    })
    .sort((a, b) => a.geometry.zIndex - b.geometry.zIndex ||
      a.asset.assetId.localeCompare(b.asset.assetId));
}
