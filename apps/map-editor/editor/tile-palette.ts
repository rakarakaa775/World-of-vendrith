import { createMapEditorSupabaseClient } from "./supabase-client";

export type TerrainPaletteKey = "grass" | "sand" | "dirt" | "pavement" | "water" | "deepwater";

export type TileOption = {
  id: string;
  label: string;
  terrain: TerrainPaletteKey;
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

const TERRAIN_ASSETS: ReadonlyArray<{ terrain: TerrainPaletteKey; name: string; label: string }> = [
  { terrain: "grass", name: "lpc_terrain__grass.png", label: "Grass" },
  { terrain: "sand", name: "lpc_terrain__sand.png", label: "Sand" },
  { terrain: "dirt", name: "lpc_terrain__dirt.png", label: "Dirt" },
  { terrain: "pavement", name: "tile_pavement.png", label: "Pavement" },
  { terrain: "water", name: "lpc_terrain__water.png", label: "Water" },
  { terrain: "deepwater", name: "lpc_terrain__deepwater.png", label: "Deepwater" },
];

export const STARTER_TILES: TileOption[] = TERRAIN_ASSETS.map(({ terrain, name, label }) => ({
  id: terrain,
  label,
  terrain,
  assetName: name,
}));

function normalizeRegistryTile(row: RegistryTileRow, definition: (typeof TERRAIN_ASSETS)[number]): TileOption {
  return {
    id: definition.terrain,
    label: definition.label,
    terrain: definition.terrain,
    assetName: row.name,
    assetPath: row.asset_path || undefined,
    previewPath: row.preview_path || undefined,
  };
}

export async function loadTerrainTiles(): Promise<TileOption[]> {
  const client = createMapEditorSupabaseClient();
  if (!client) return STARTER_TILES;

  const names = TERRAIN_ASSETS.map(item => item.name);
  const { data, error } = await client
    .from("asset_registry")
    .select("id,name,slug,asset_path,preview_path,tile_width,tile_height,status")
    .eq("status", "approved")
    .in("name", names);

  if (error || !data) return STARTER_TILES;

  const rows = data as RegistryTileRow[];
  const byName = new Map(rows.map(row => [row.name.toLowerCase(), row]));
  const loaded = TERRAIN_ASSETS
    .map(definition => {
      const row = byName.get(definition.name.toLowerCase());
      return row ? normalizeRegistryTile(row, definition) : null;
    })
    .filter((tile): tile is TileOption => Boolean(tile));

  return loaded.length ? loaded : STARTER_TILES;
}
