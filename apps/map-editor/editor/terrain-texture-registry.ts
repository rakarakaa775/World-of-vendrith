import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import type { TerrainKey, TerrainMask } from './terrain-engine';

export type TerrainTextureSource = {
  assetId: string;
  url: string;
  terrain: TerrainKey;
  mask: TerrainMask;
};

/**
 * Runtime texture registry. Asset IDs are treated as opaque identifiers; the
 * registry only creates a URL when an explicit public asset URL is supplied.
 * No URL is inferred from an unverified asset ID.
 */
export type TerrainTextureUrlResolver = (assetId: string) => string | null;

export function createTerrainTextureRegistry(
  bindings: TerrainAssetBindingMap,
  resolveUrl: TerrainTextureUrlResolver,
): Map<string, TerrainTextureSource> {
  const registry = new Map<string, TerrainTextureSource>();
  for (const [terrainText, terrainBindings] of Object.entries(bindings)) {
    if (!terrainBindings) continue;
    for (const [maskText, binding] of Object.entries(terrainBindings)) {
      if (!binding) continue;
      const url = resolveUrl(binding.assetId);
      if (!url) continue;
      registry.set(binding.assetId, {
        assetId: binding.assetId,
        url,
        terrain: terrainText as TerrainKey,
        mask: Number(maskText),
      });
    }
  }
  return registry;
}

export function terrainTextureSourceFor(
  registry: Map<string, TerrainTextureSource>,
  assetId: string | null,
): TerrainTextureSource | null {
  if (!assetId) return null;
  return registry.get(assetId) ?? null;
}
