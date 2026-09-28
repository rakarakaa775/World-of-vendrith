import { createMapEditorSupabaseClient } from "./supabase-client";

export type WorldAssetBrowserItem = {
  id: string;
  name: string;
  category: string | null;
  role: string | null;
  asset_path: string | null;
  preview_path: string | null;
  tile_width: number | null;
  tile_height: number | null;
  source_name: string | null;
  attribution_required: boolean;
  autotile_capable: boolean;
  collision_capable: boolean;
  interactable: boolean;
  asset_status: string | null;
  world_role: "base_terrain" | "polar_terrain" | "mountain" | "polar_mountain" | null;
  verification_status: string | null;
};

export const ASSET_LIBRARY_RAW = "https://media.githubusercontent.com/media/rakarakaa775/Asset-library-LPC/main";

export function assetPreviewUrl(item: WorldAssetBrowserItem): string | undefined {
  const source = item.preview_path || item.asset_path;
  if (!source) return undefined;
  if (/^https?:\/\//i.test(source)) return source;
  if (source.startsWith("ASSET_LIBRARY/")) return `${ASSET_LIBRARY_RAW}/${source}`;
  return undefined;
}

export async function loadWorldAssetBrowser(): Promise<WorldAssetBrowserItem[]> {
  const client = createMapEditorSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("world_asset_manifest_v1")
    .select("asset_id,name,category,world_role,asset_path,preview_path,source_id,selection_status,verification_status")
    .eq("selection_status", "enabled")
    .eq("verification_status", "verified")
    .order("world_role", { ascending: true })
    .order("name", { ascending: true })
    .limit(100);
  if (error || !data) return [];
  return (data as any[]).map(row => ({
    id: row.asset_id,
    name: row.name,
    category: row.category ?? null,
    role: row.world_role ?? null,
    asset_path: row.asset_path ?? null,
    preview_path: row.preview_path ?? null,
    tile_width: null,
    tile_height: null,
    source_name: null,
    attribution_required: false,
    autotile_capable: false,
    collision_capable: false,
    interactable: false,
    asset_status: "approved",
    world_role: row.world_role ?? null,
    verification_status: row.verification_status ?? null,
  })) as WorldAssetBrowserItem[];
}
