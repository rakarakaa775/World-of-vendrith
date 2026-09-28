export type AssetRecord = {
  id?: string | null;
  asset_path?: string | null;
  name?: string | null;
  status?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  tile_width?: number | null;
  tile_height?: number | null;
};

const DEFAULT_STORAGE_BUCKET = 'vandrith-assets';

const WORLD_SOURCES = new Set(['[LPC] Terrains', '[LPC] Overworld', 'LPC Revised 4-Seasons Exterior Tilesets']);

function normalizeAssetPath(assetPath: string): string {
  return assetPath
    .split('/')
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

function canonicalRepositoryAssetUrl(asset: AssetRecord): string | null {
  if (!asset.asset_path || !asset.source_name || !WORLD_SOURCES.has(asset.source_name)) return null;
  const repo = asset.source_name === '[LPC] Overworld' ? 'world' : 'library';
  const encodedPath = asset.asset_path
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `/api/assets/${encodedPath}?repo=${repo}`;
}
const assetCache = new Map<string, AssetRecord | null>();
const WORLD_ASSET_MANIFEST_IDS = new Set<string>();

/** Canonical asset storage URL. Runtime never falls back to bundled legacy terrain PNGs. */
export function assetStorageUrl(assetPath: string, bucket = DEFAULT_STORAGE_BUCKET): string | null {
  if (!assetPath) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${normalizeAssetPath(assetPath)}`;
}

export function assetRawUrl(assetPath: string): string | null { return assetStorageUrl(assetPath); }

export function resolveAssetUrl(asset: AssetRecord | null | undefined): string | null {
  if (!asset?.asset_path) return null;
  const status = String(asset.status ?? '').toLowerCase();
  if (status && !['approved', 'verified', 'active'].includes(status)) return null;
  return canonicalRepositoryAssetUrl(asset) ?? assetStorageUrl(asset.asset_path);
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
  const { data, error } = await client.from('world_asset_manifest_v1').select('asset_id,name,asset_path,source_id,selection_status,verification_status').eq('asset_id', assetId).eq('selection_status','enabled').eq('verification_status','verified').maybeSingle();
  if (!error && data) {
    let sourceName: string | null = null;
    if (data.source_id) {
      const { data: source } = await client.from('asset_sources').select('name').eq('id', data.source_id).maybeSingle();
      sourceName = source?.name ?? null;
    }
    return cacheAssetRecord({ id: data.asset_id, name: data.name, asset_path: data.asset_path, source_id: data.source_id, source_name: sourceName, status: 'approved' });
  }
  const registry = await client.from('asset_registry').select('id,name,asset_path,status,source_id,tile_width,tile_height').eq('id', assetId).maybeSingle();
  if (registry.error) throw registry.error;
  const registryData = registry.data;

  if (!registryData) { assetCache.set(assetId, null); return null; }
  const sourceId = (registryData as any).source_id;
  if (sourceId) {
    const { data: source } = await client.from('asset_sources').select('name').eq('id', sourceId).maybeSingle();
    if (source?.name) (registryData as any).source_name = source.name;
  }
  return cacheAssetRecord(registryData as AssetRecord);
}

export async function resolveAssetRecords(client: any, assetIds: string[]): Promise<Map<string, AssetRecord>> {
  const unique = [...new Set(assetIds.filter(Boolean))];
  const missing = unique.filter(id => !assetCache.has(id));
  if (missing.length) {
    const { data, error } = await client.from('world_asset_manifest_v1').select('asset_id,name,asset_path,source_id,selection_status,verification_status').in('asset_id', missing).eq('selection_status','enabled').eq('verification_status','verified');
    if (!error) {
      const sourceIds = [...new Set((data ?? []).map((row: any) => row.source_id).filter(Boolean))];
      const sourceNames = new Map<string, string>();
      if (sourceIds.length) {
        const { data: sources } = await client.from('asset_sources').select('id,name').in('id', sourceIds);
        for (const source of sources ?? []) sourceNames.set(source.id, source.name);
      }
      const found = new Set<string>();
      for (const row of data ?? []) {
        cacheAssetRecord({
          id: row.asset_id,
          name: row.name,
          asset_path: row.asset_path,
          source_id: row.source_id,
          source_name: row.source_id ? sourceNames.get(row.source_id) ?? null : null,
          status: 'approved'
        });
        found.add(row.asset_id);
      }

      // The manifest is the preferred World source, but it is not allowed to
      // hide an approved registry asset. If a verified manifest row is absent,
      // resolve the same asset ID from asset_registry before declaring it
      // unavailable. This is important for newly promoted terrain assets such
      // as deepwater while the manifest projection catches up.
      const unresolved = missing.filter(id => !found.has(id));
      if (unresolved.length) {
        const registry = await client
          .from('asset_registry')
          .select('id,name,asset_path,status,source_id,tile_width,tile_height')
          .in('id', unresolved);
        if (registry.error) throw registry.error;
        const registryRows = registry.data ?? [];
        const registrySourceIds = [...new Set(registryRows.map((row: any) => row.source_id).filter(Boolean))];
        const registrySources = new Map<string, string>();
        if (registrySourceIds.length) {
          const { data: sources } = await client
            .from('asset_sources')
            .select('id,name')
            .in('id', registrySourceIds);
          for (const source of sources ?? []) registrySources.set(source.id, source.name);
        }
        for (const row of registryRows) {
          if (row.source_id && registrySources.has(row.source_id)) {
            row.source_name = registrySources.get(row.source_id);
          }
          const asset = cacheAssetRecord(row as AssetRecord);
          if (asset?.id) found.add(asset.id);
        }
      }

      for (const id of missing) if (!found.has(id)) assetCache.set(id, null);
      return new Map(unique.flatMap(id => {
        const asset = assetCache.get(id);
        return asset ? [[id, asset] as const] : [];
      }));
    }
    const registry = await client.from('asset_registry').select('id,name,asset_path,status,source_id,tile_width,tile_height').in('id', missing);
    if (registry.error) throw registry.error;
    const registryData = registry.data;
    const sourceIds = [...new Set((registryData ?? []).map((row: any) => row.source_id).filter(Boolean))];
    const sourceNames = new Map<string, string>();
    if (sourceIds.length) {
      const { data: sources } = await client.from('asset_sources').select('id,name').in('id', sourceIds);
      for (const source of sources ?? []) sourceNames.set(source.id, source.name);
    }
    const found = new Set<string>();
    for (const row of registryData ?? []) {
      if (row.source_id && sourceNames.has(row.source_id)) row.source_name = sourceNames.get(row.source_id);
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

export type WorldAssetRole = 'base_terrain' | 'polar_terrain' | 'mountain' | 'polar_mountain';

export type WorldAssetRecord = AssetRecord & {
  name?: string | null;
  world_role?: WorldAssetRole | null;
  selection_status?: string | null;
  verification_status?: string | null;
};

/**
 * Canonical World PNG source. Do not derive World selection from placement_category.
 * Seasonal Four Seasons assets are intentionally outside this manifest.
 */
export async function resolveWorldAssetRecords(client: any, role?: WorldAssetRole): Promise<WorldAssetRecord[]> {
  let query = client
    .from('world_asset_manifest_v1')
    .select('asset_id,name,asset_path,world_role,selection_status,verification_status')
    .eq('selection_status', 'enabled')
    .eq('verification_status', 'verified')
    .order('world_role')
    .order('name');

  if (role) query = query.eq('world_role', role);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.asset_id,
    name: row.name,
    asset_path: row.asset_path,
    status: 'approved',
    world_role: row.world_role,
    selection_status: row.selection_status,
    verification_status: row.verification_status,
  })) as WorldAssetRecord[];
}

export async function resolveWorldAssetUrls(client: any, role?: WorldAssetRole): Promise<Array<{ asset: WorldAssetRecord; url: string }>> {
  const assets = await resolveWorldAssetRecords(client, role);
  return assets
    .map(asset => ({ asset, url: resolveAssetUrl(asset) }))
    .filter((item): item is { asset: WorldAssetRecord; url: string } => Boolean(item.url));
}
