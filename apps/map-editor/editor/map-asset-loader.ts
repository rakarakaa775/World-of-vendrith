import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MAP_ASSET_CATALOG,
  type MapAssetDefinition,
  type MapAssetFamily,
} from "./map-tool-registry";
import { assetStorageUrl } from "./asset-resolver";

type RegistryRow = {
  id: string;
  name: string;
  category: string | null;
  role: string | null;
  asset_path: string | null;
  preview_path: string | null;
  status: string | null;
};

function semanticFamily(row: RegistryRow): { family: MapAssetFamily; levels: MapAssetDefinition["levels"] } | null {
  const category = (row.category ?? "").toLowerCase();
  const role = (row.role ?? "").toLowerCase();

  if (category === "terrain" || category === "exterior.terrain") {
    return { family: "macro-terrain", levels: ["world", "region"] };
  }

  if (category === "exterior.building") {
    return { family: "playable-building", levels: ["playable"] };
  }

  if (category === "exterior.decoration") {
    return {
      family: role.includes("tree") ? "playable-nature" : "playable-decoration",
      levels: ["playable"],
    };
  }

  if (category === "decoration") {
    return {
      family: role.includes("tree") ? "playable-nature" : "playable-decoration",
      levels: ["playable"],
    };
  }

  if (category === "dungeon.structure") {
    if (role.includes("floor")) return { family: "interior-floor", levels: ["interior"] };
    if (role.includes("door")) return { family: "interior-door", levels: ["interior"] };
    return { family: "interior-wall", levels: ["interior"] };
  }

  if (category === "structure" && role.includes("wall")) {
    return { family: "interior-wall", levels: ["interior"] };
  }

  return null;
}

export function registryRowToMapAsset(row: RegistryRow): MapAssetDefinition | null {
  if (!row.id || !row.name || row.status !== "approved") return null;
  const semantic = semanticFamily(row);
  if (!semantic) return null;

  return {
    id: `registry:${row.id}`,
    registryId: row.id,
    label: row.name,
    family: semantic.family,
    levels: semantic.levels,
    assetPath: row.asset_path ?? undefined,
    previewUrl: assetStorageUrl(row.preview_path || row.asset_path || "") ?? undefined,
  };
}

/**
 * Loads only registry-approved physical assets. The static catalog remains the
 * semantic fallback for tools that do not yet have a physical registry asset.
 */
export async function loadMapAssetCatalog(client: SupabaseClient): Promise<MapAssetDefinition[]> {
  const { data, error } = await client
    .from("asset_registry")
    .select("id,name,category,role,asset_path,preview_path,status")
    .eq("status", "approved")
    .order("category")
    .order("name");

  if (error) throw error;

  const runtime = (data ?? [])
    .map(row => registryRowToMapAsset(row as RegistryRow))
    .filter((asset): asset is MapAssetDefinition => Boolean(asset));

  const seen = new Set(runtime.map(asset => asset.registryId).filter(Boolean));
  return [
    ...MAP_ASSET_CATALOG,
    ...runtime.filter(asset => !seen.has(asset.registryId)),
  ];
}

export function mapAssetCatalogSummary(catalog: readonly MapAssetDefinition[]): {
  total: number;
  world: number;
  region: number;
  playable: number;
  interior: number;
  physical: number;
} {
  return {
    total: catalog.length,
    world: catalog.filter(asset => asset.levels.includes("world")).length,
    region: catalog.filter(asset => asset.levels.includes("region")).length,
    playable: catalog.filter(asset => asset.levels.includes("playable")).length,
    interior: catalog.filter(asset => asset.levels.includes("interior")).length,
    physical: catalog.filter(asset => Boolean(asset.registryId)).length,
  };
}
