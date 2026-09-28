import { createMapEditorSupabaseClient } from "./supabase-client";

export type TileOption = {
  id: string;
  label: string;
  terrain: "deepwater";
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

const DEEPWATER_NAME = "lpc_terrain__deepwater.png";
const DEEPWATER_PREVIEW = "/api/assets/ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__deepwater.png?repo=library";

function normalizeRegistryTile(row: RegistryTileRow): TileOption | null {
  if (row.name.toLowerCase() !== DEEPWATER_NAME || row.status !== "approved") return null;
  return {
    id: "deepwater",
    label: "Deepwater",
    terrain: "deepwater",
    assetName: row.name,
    assetPath: row.asset_path || undefined,
    previewPath: row.preview_path || undefined,
    previewUrl: DEEPWATER_PREVIEW,
  };
}

export const STARTER_TILES: TileOption[] = [
  { id: "deepwater", label: "Deepwater", terrain: "deepwater", assetName: DEEPWATER_NAME, previewUrl: DEEPWATER_PREVIEW },
];

export async function loadTerrainTiles(): Promise<TileOption[]> {
  const client = createMapEditorSupabaseClient();
  if (!client) return STARTER_TILES;

  const { data, error } = await client
    .from("asset_registry")
    .select("id,name,slug,asset_path,preview_path,tile_width,tile_height,status")
    .eq("status", "approved")
    .eq("name", DEEPWATER_NAME);

  if (error || !data) return STARTER_TILES;

  const deepwater = (data as RegistryTileRow[])
    .map(normalizeRegistryTile)
    .find((tile): tile is TileOption => Boolean(tile));

  return deepwater ? [deepwater] : STARTER_TILES;
}
