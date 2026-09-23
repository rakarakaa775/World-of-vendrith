import { createMapEditorSupabaseClient } from "./supabase-client";

export type TileOption = {
  id: string;
  label: string;
  terrain: 'grass' | 'sand' | 'dirt' | 'pavement' | 'water';
  assetName: string;
  assetPath?: string;
  previewPath?: string;
  previewUrl?: string;
};

type RegistryTileRow = {
  id: string;
  name: string;
  slug: string | null;
  asset_path: string | null;
  preview_path: string | null;
  tile_width: number | null;
  tile_height: number | null;
  status: string;
};

const TERRAIN_BY_ASSET: Record<string, TileOption['terrain']> = {
  'tile_grass.png': 'grass',
  'tile_sand.png': 'sand',
  'tile_dirt.png': 'dirt',
  'tile_pavement.png': 'pavement',
  'tile_water.png': 'water',
};

const LABEL_BY_TERRAIN: Record<TileOption['terrain'], string> = {
  grass: 'Grass',
  sand: 'Sand',
  dirt: 'Dirt',
  pavement: 'Pavement',
  water: 'Water',
};

const ASSET_LIBRARY_RAW = 'https://raw.githubusercontent.com/rakarakaa775/Asset-library-LPC/main';

function previewUrlFor(row: RegistryTileRow): string | undefined {
  const source = row.preview_path || row.asset_path;
  if (!source) return undefined;
  if (/^https?:\\/\\//i.test(source)) return source;
  if (source.startsWith('ASSET_LIBRARY/')) {
    return `${ASSET_LIBRARY_RAW}/${source}`;
  }
  return undefined;
}

function normalizeRegistryTile(row: RegistryTileRow): TileOption | null {
  const terrain = TERRAIN_BY_ASSET[row.name.toLowerCase()];
  if (!terrain || row.status !== 'approved') return null;
  return {
    id: row.id,
    label: LABEL_BY_TERRAIN[terrain],
    terrain,
    assetName: row.name,
    assetPath: row.asset_path || undefined,
    previewPath: row.preview_path || undefined,
    previewUrl: previewUrlFor(row),
  };
}

export const STARTER_TILES: TileOption[] = [
  { id: 'starter-tile', label: 'Grass', terrain: 'grass', assetName: 'tile_grass.png', previewUrl: `${ASSET_LIBRARY_RAW}/ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup/tile_grass.png` },
  { id: 'sand', label: 'Sand', terrain: 'sand', assetName: 'tile_sand.png' },
  { id: 'dirt', label: 'Dirt', terrain: 'dirt', assetName: 'tile_dirt.png', previewUrl: `${ASSET_LIBRARY_RAW}/ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup/tile_dirt.png` },
  { id: 'stone-tile', label: 'Pavement', terrain: 'pavement', assetName: 'tile_pavement.png', previewUrl: `${ASSET_LIBRARY_RAW}/ASSET_LIBRARY/02_TILES_AND_TERRAIN/TopDown_RPG_Mockup/tile_pavement.png` },
  { id: 'water-tile', label: 'Water', terrain: 'water', assetName: 'tile_water.png' },
];

export async function loadTerrainTiles(): Promise<TileOption[]> {
  const client = createMapEditorSupabaseClient();
  if (!client) return STARTER_TILES;

  const { data, error } = await client
    .from('asset_registry')
    .select('id,name,slug,asset_path,preview_path,tile_width,tile_height,status')
    .eq('category', 'terrain')
    .eq('status', 'approved')
    .in('name', Object.keys(TERRAIN_BY_ASSET));

  if (error || !data) return STARTER_TILES;

  const loaded = (data as RegistryTileRow[])
    .map(normalizeRegistryTile)
    .filter((tile): tile is TileOption => Boolean(tile));

  if (!loaded.length) return STARTER_TILES;

  const byTerrain = new Map(loaded.map(tile => [tile.terrain, tile]));
  return STARTER_TILES.map(fallback => byTerrain.get(fallback.terrain) || fallback);
}
