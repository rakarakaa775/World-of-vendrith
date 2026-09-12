export type AssetRecord = {
  id?: string | null;
  asset_path?: string | null;
  status?: string | null;
  tile_width?: number | null;
  tile_height?: number | null;
};

const DEFAULT_ASSET_REPO = 'rakarakaa775/Asset-library-LPC';
const DEFAULT_ASSET_REF = 'main';
const assetCache = new Map<string, AssetRecord | null>();

export function normalizeAssetPath(path: string): string {
  return path.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
}

/**
 * Resolve an approved asset to a browser-loadable URL.
 *
 * The Asset-library-LPC repository stores image files with Git LFS. For LFS
 * content GitHub's media endpoint expects the `raw/` segment after the ref;
 * without it the request can resolve to an HTML/error response instead of the
 * actual image bytes, which Pixi cannot turn into a texture.
 */
export function assetRawUrl(assetPath: string, repo = DEFAULT_ASSET_REPO, ref = DEFAULT_ASSET_REF): string {
  const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '');
  return `https://media.githubusercontent.com/media/${cleanRepo}/${encodeURIComponent(ref)}/raw/${normalizeAssetPath(assetPath)}`;
}

export function resolveAssetUrl(asset: AssetRecord | null | undefined): string | null {
  if (!asset?.asset_path) return null;
  const status = String(asset.status ?? '').toLowerCase();
  if (status && !['approved', 'verified', 'active'].includes(status)) return null;
  return assetRawUrl(asset.asset_path);
}

export function cacheAssetRecord(asset: AssetRecord): AssetRecord | null {
  if (!asset.id) return null;
  assetCache.set(asset.id, asset);
  return asset;
}

export function getCachedAssetRecord(assetId: string): AssetRecord | null {
  return assetCache.get(assetId) ?? null;
}

export function clearAssetRecordCache(): void {
  assetCache.clear();
}

export async function resolveAssetRecord(client: any, assetId: string): Promise<AssetRecord | null> {
  if (assetCache.has(assetId)) return assetCache.get(assetId) ?? null;
  const { data, error } = await client.from('asset_registry').select('id,asset_path,status,tile_width,tile_height').eq('id', assetId).maybeSingle();
  if (error) throw error;
  if (!data) {
    assetCache.set(assetId, null);
    return null;
  }
  return cacheAssetRecord(data as AssetRecord);
}

export async function resolveAssetRecords(client: any, assetIds: string[]): Promise<Map<string, AssetRecord>> {
  const unique = [...new Set(assetIds.filter(Boolean))];
  const result = new Map<string, AssetRecord>();
  const missing = unique.filter(id => !assetCache.has(id));
  if (missing.length) {
    const { data, error } = await client.from('asset_registry').select('id,asset_path,status,tile_width,tile_height').in('id', missing);
    if (error) throw error;
    const found = new Set<string>();
    for (const row of data ?? []) {
      const asset = cacheAssetRecord(row as AssetRecord);
      if (asset?.id) found.add(asset.id);
    }
    for (const id of missing) if (!found.has(id)) assetCache.set(id, null);
  }
  for (const id of unique) {
    const asset = assetCache.get(id);
    if (asset) result.set(id, asset);
  }
  return result;
}

export async function resolveAssetUrlById(client: any, assetId: string): Promise<string | null> {
  return resolveAssetUrl(await resolveAssetRecord(client, assetId));
}

export type TextureLike = any;

export class PixiTextureCache {
  private readonly textures = new Map<string, TextureLike>();
  private readonly pending = new Map<string, Promise<TextureLike | null>>();

  async load(url: string, Assets: any): Promise<TextureLike | null> {
    const cached = this.textures.get(url);
    if (cached) return cached;
    const pending = this.pending.get(url);
    if (pending) return pending;
    const request = (async () => {
      try {
        const texture = await Assets.load(url);
        this.textures.set(url, texture);
        return texture;
      } catch (error) {
        console.warn('Map editor asset texture failed to load', url, error);
        return null;
      } finally {
        this.pending.delete(url);
      }
    })();
    this.pending.set(url, request);
    return request;
  }

  get(url: string): TextureLike | null {
    return this.textures.get(url) ?? null;
  }

  has(url: string): boolean {
    return this.textures.has(url);
  }

  clear(): void {
    this.textures.clear();
    this.pending.clear();
  }
}

export const mapEditorTextureCache = new PixiTextureCache();
