import { Assets, Texture } from 'pixi.js';
import type { TerrainTextureSource } from './terrain-texture-registry';

export type TerrainTextureCache = {
  get(assetId: string): Texture | null;
  load(source: TerrainTextureSource): Promise<Texture | null>;
  clear(): void;
};

/**
 * Client-side cache for verified terrain textures. The cache never turns an
 * asset ID into a guessed path; callers must provide an explicit source URL.
 */
export function createTerrainTextureCache(): TerrainTextureCache {
  const textures = new Map<string, Texture>();
  const pending = new Map<string, Promise<Texture | null>>();

  return {
    get(assetId) {
      return textures.get(assetId) ?? null;
    },
    async load(source) {
      const cached = textures.get(source.assetId);
      if (cached) return cached;
      const existing = pending.get(source.assetId);
      if (existing) return existing;

      const request = Assets.load<Texture>(source.url)
        .then(texture => {
          textures.set(source.assetId, texture);
          pending.delete(source.assetId);
          return texture;
        })
        .catch(() => {
          pending.delete(source.assetId);
          return null;
        });
      pending.set(source.assetId, request);
      return request;
    },
    clear() {
      textures.clear();
      pending.clear();
    },
  };
}
