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
    .from("world_asset_browser_inventory_v1")
    .select("id,name,category,role,asset_path,preview_path,tile_width,tile_height,source_name,attribution_required,autotile_capable,collision_capable,interactable,asset_status")
    .eq("asset_status", "approved")
    .order("category", { ascending: true })
    .order("name", { ascending: true })
    .limit(200);
  if (error || !data) return [];
  return data as WorldAssetBrowserItem[];
}
