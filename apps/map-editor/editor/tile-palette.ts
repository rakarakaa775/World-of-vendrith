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

const ASSET_LIBRARY_RAW = 'https://media.githubusercontent.com/media/rakarakaa775/Asset-library-LPC/main';
const VERIFIED_PREVIEWS = { grass: 'data:image/png;base64,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', dirt: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4gUFECki5WYSFAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAH1SURBVEjHjVY5csQwDEM0WwW9/5av5BV5p+sgbVJIpEDJ9sSzu/Kh5QUQ9NvX58cvAEDIgxAE4j+HgL6T00aYOiB84x0Nip1C2JX/ww8uq5/q4h6JN/zg1S8EiDcWc39xIj1nSMQeovUo2B1lSJqGx6pxWwJ0Ls5xdT2jaPkgHREcOzUsa4Qd0ZeslsRnhjQnHJCYI8HRrBZ5AKcqyLwA3f20TC5ookQ/I+bBrEOUSlvtK+M8rZfdsbAMXAI6ZRaXUz3SZZarf8eJlnDC6ME07Ex24HVD89bpsgO6siay4cIgXfQHlzZr1oFJ06izUzhoHKvua1SeCZrAlwppYrIalUlP/JYabt3P6qRHXrkoVV6gZFEFiOWJ8qrtedpWPkuXQIxPd25AEpMo7VZ3LuipRXlJAz6gveijttuaLHKKZY+yKuZBi0o7pTOTrYFoDAiGjVMm+1Qz5n1TNmCRJ9cJLmQxTm/bdDVrOkuaAzejZ5YgZT02jVXsRjiYNBus5kOiDy1Jox+mECZVb4ek9whnhYmCqU6N8TvoSFb68IbKReItIOVkq0VpTgktPBV2pjg+McxYdKgSRxraFclyGb9h4FhFM/E5TIZYInHhbCRNACbVAnsCOE8TTfi8H1hCj28U7e4Ny0USvJYVoo9i0uYQVZQbAP4AZG4Oyp/3oR4AAAAASUVORK5CYII=', pavement: 'data:image/png;base64,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' } as const;

function previewUrlFor(row: RegistryTileRow): string | undefined {
  const source = row.preview_path || row.asset_path;
  if (!source) return undefined;
  if (/^https?:\/\//i.test(source)) return source;
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
    previewUrl: (VERIFIED_PREVIEWS as Partial<Record<TileOption['terrain'], string>>)[terrain] || previewUrlFor(row),
  };
}

export const STARTER_TILES: TileOption[] = [
  { id: 'starter-tile', label: 'Grass', terrain: 'grass', assetName: 'tile_grass.png', previewUrl: VERIFIED_PREVIEWS.grass },
  { id: 'sand', label: 'Sand', terrain: 'sand', assetName: 'tile_sand.png' },
  { id: 'dirt', label: 'Dirt', terrain: 'dirt', assetName: 'tile_dirt.png', previewUrl: VERIFIED_PREVIEWS.dirt },
  { id: 'stone-tile', label: 'Pavement', terrain: 'pavement', assetName: 'tile_pavement.png', previewUrl: VERIFIED_PREVIEWS.pavement },
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
