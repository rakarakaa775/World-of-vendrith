export type AssetRecord = {
  id?: string | null;
  asset_path?: string | null;
  status?: string | null;
  tile_width?: number | null;
  tile_height?: number | null;
  license?: {
    verification_status?: string | null;
    usage_status?: string | null;
    commercial_use_allowed?: boolean | null;
    modification_allowed?: boolean | null;
    redistribution_allowed?: boolean | null;
  } | null;
};

export function isRuntimeAssetUsable(asset: AssetRecord | null | undefined): boolean {
  if (!asset?.asset_path) return false;
  const status = String(asset.status ?? '').toLowerCase();
  if (status && !['approved', 'verified', 'active'].includes(status)) return false;
  const license = asset.license;
  if (!license) return false;
  return license.verification_status === 'verified'
    && (license.usage_status === 'allowed' || license.usage_status === 'credit_required')
    && license.commercial_use_allowed === true
    && license.modification_allowed === true
    && license.redistribution_allowed === true;
}

const DEFAULT_STORAGE_BUCKET = 'vandrith-assets';
const ASSET_LIBRARY_RAW = 'https://media.githubusercontent.com/media/rakarakaa775/Asset-library-LPC/main';
const assetCache = new Map<string, AssetRecord | null>();

/** Canonical bundled terrain textures. Supabase remains the registry/provenance source. */
const LOCAL_TERRAIN_ASSETS: Record<string, string> = {
  'tile_grass.png': '/assets/terrain/tile_grass.png',
  'tile_sand.png': '/assets/terrain/tile_sand.png',
  'tile_dirt.png': '/assets/terrain/tile_dirt.png',
  'tile_pavement.png': '/assets/terrain/tile_pavement.png',
  'tile_water.png': '/assets/terrain/tile_water.png',
};

export function normalizeAssetPath(path: string): string {
  return path.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
}

function localTerrainUrl(assetPath: string): string | null {
  const normalized = assetPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const fileName = normalized.split('/').pop() || '';
  return LOCAL_TERRAIN_ASSETS[fileName] || null;
}

export function assetStorageUrl(assetPath: string, bucket = DEFAULT_STORAGE_BUCKET): string | null {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const localUrl = localTerrainUrl(assetPath);
  if (localUrl) return localUrl;
  const normalized = assetPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (normalized.startsWith('ASSET_LIBRARY/')) {
    return `${ASSET_LIBRARY_RAW}/${normalized.split('/').map(encodeURIComponent).join('/')}`;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${normalizeAssetPath(assetPath)}`;
}

export function assetRawUrl(assetPath: string): string | null { return assetStorageUrl(assetPath); }

export function resolveAssetUrl(asset: AssetRecord | null | undefined): string | null {
  if (!asset?.asset_path) return null;
  if (!isRuntimeAssetUsable(asset)) return null;
  return assetStorageUrl(asset.asset_path);
}

export function cacheAssetRecord(asset: AssetRecord): AssetRecord | null {
  if (!asset.id) return null;
  assetCache.set(asset.id, asset);
  return asset;
}

export function getCachedAssetRecord(assetId: string): AssetRecord | null { return assetCache.get(assetId) ?? null; }
export function clearAssetRecordCache(): void { assetCache.clear(); }

export async function resolveAssetRecord(client: any, assetId: string): Promise<AssetRecord | null> {
  if (assetCache.has(assetId)) return assetCache.get(assetId) ?? null;
  const { data, error } = await client.from('asset_registry').select('id,asset_path,status,tile_width,tile_height,license:license_registry_id(verification_status,usage_status,commercial_use_allowed,modification_allowed,redistribution_allowed)').eq('id', assetId).maybeSingle();
  if (error) throw error;
  if (!data) { assetCache.set(assetId, null); return null; }
  return cacheAssetRecord(data as AssetRecord);
}

export async function resolveAssetRecords(client: any, assetIds: string[]): Promise<Map<string, AssetRecord>> {
  const unique = [...new Set(assetIds.filter(Boolean))];
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
  const result = new Map<string, AssetRecord>();
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
    const cached = this.textures.get(url); if (cached) return cached;
    const pending = this.pending.get(url); if (pending) return pending;
    const request = (async () => {
      try {
        const texture = await Assets.load(url);
        this.textures.set(url, texture);
        return texture;
      } catch (error) {
        console.warn('Map editor asset texture failed to load', url, error);
        return null;
      } finally { this.pending.delete(url); }
    })();
    this.pending.set(url, request);
    return request;
  }
  get(url: string): TextureLike | null { return this.textures.get(url) ?? null; }
  has(url: string): boolean { return this.textures.has(url); }
  clear(): void { this.textures.clear(); this.pending.clear(); }
}

export const mapEditorTextureCache = new PixiTextureCache();
