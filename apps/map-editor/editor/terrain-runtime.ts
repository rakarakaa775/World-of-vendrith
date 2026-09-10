import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import { createTerrainTextureRegistry, type TerrainTextureSource } from './terrain-texture-registry';

/**
 * Accepts only explicit absolute image URLs. Storage paths and asset IDs are
 * intentionally not guessed here; a future audited asset catalog can provide
 * the canonical URL resolver without changing the renderer contract.
 */
export function explicitTerrainTextureUrl(assetId: string): string | null {
  try {
    const url = new URL(assetId);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function createRuntimeTerrainTextureRegistry(bindings: TerrainAssetBindingMap) {
  return createTerrainTextureRegistry(bindings, explicitTerrainTextureUrl);
}

export function terrainTextureSources(bindings: TerrainAssetBindingMap): TerrainTextureSource[] {
  return [...createRuntimeTerrainTextureRegistry(bindings).values()];
}
