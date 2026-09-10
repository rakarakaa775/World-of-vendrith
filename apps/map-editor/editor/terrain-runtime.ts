import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import { createTerrainTextureRegistry, type TerrainTextureSource } from './terrain-texture-registry';
import { createTerrainTextureCache, type TerrainTextureCache } from './terrain-texture-cache';

/** Accept only canonical absolute HTTP(S) texture URLs. */
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

export type TerrainRuntime = {
  registry: Map<string, TerrainTextureSource>;
  cache: TerrainTextureCache;
  loadAll(): Promise<void>;
  dispose(): void;
};

export function createTerrainRuntime(bindings: TerrainAssetBindingMap): TerrainRuntime {
  const registry = createRuntimeTerrainTextureRegistry(bindings);
  const cache = createTerrainTextureCache();
  return {
    registry,
    cache,
    async loadAll() {
      await Promise.all(Array.from(registry.values()).map(source => cache.load(source).then(() => undefined)));
    },
    dispose() {
      cache.clear();
    },
  };
}
