import type { SupabaseClient } from "@supabase/supabase-js";
import type { Evidence } from "../domain/types";
import type { AssetRegistryPort } from "../ports/project-tools";

interface AssetInventoryRow {
  id: string; external_key?: string | null; name?: string | null; slug?: string | null;
  category?: string | null; placement_category?: string | null; role?: string | null;
  asset_path?: string | null; preview_path?: string | null; asset_status?: string | null;
  source_name?: string | null; source_url?: string | null; repository_url?: string | null;
  source_version?: string | null; licenses?: string[] | null; attribution_required?: boolean | null;
  attribution_text?: string | null; commercial_use_allowed?: boolean | null;
  modification_allowed?: boolean | null; redistribution_allowed?: boolean | null;
  license_verification_status?: string | null; license_usage_status?: string | null;
}

function safeLimit(limit = 8) { return Math.max(1, Math.min(limit, 50)); }

function escapeOrValue(value: string): string {
  return value
    .replace(/[\\(),]/g, " ")
    .replace(/[\r\n\t]/g, " ")
    .replaceAll("%", "\\\\%")
    .replaceAll("_", "\\\\_")
    .trim();
}

function toEvidence(row: AssetInventoryRow): Evidence {
  const identity = row.external_key || row.slug || row.id;
  return {
    id: `asset-${row.id}`, kind: "verified-fact", source: `asset_registry:${identity}`,
    fact: JSON.stringify({
      id: row.id, name: row.name, category: row.category, placementCategory: row.placement_category,
      role: row.role, assetPath: row.asset_path, previewPath: row.preview_path, status: row.asset_status,
      source: row.source_name, sourceUrl: row.source_url, repositoryUrl: row.repository_url,
      sourceVersion: row.source_version, licenses: row.licenses ?? [],
      attributionRequired: row.attribution_required ?? false, attributionText: row.attribution_text,
      commercialUseAllowed: row.commercial_use_allowed, modificationAllowed: row.modification_allowed,
      redistributionAllowed: row.redistribution_allowed,
      licenseVerificationStatus: row.license_verification_status, licenseUsageStatus: row.license_usage_status,
    }), confidence: "high",
  };
}

export function createSupabaseAssetRegistryAdapter(client: SupabaseClient, options: { view?: string; limit?: number } = {}): AssetRegistryPort {
  const view = options.view ?? "asset_library_inventory_v1";
  const limit = safeLimit(options.limit);
  return {
    async search(query: string) {
      const normalized = query.trim();
      let request = client.from(view).select(
        "id,external_key,name,slug,category,placement_category,role,asset_path,preview_path,asset_status,source_name,source_url,repository_url,source_version,licenses,attribution_required,attribution_text,commercial_use_allowed,modification_allowed,redistribution_allowed,license_verification_status,license_usage_status",
      );
      if (normalized) {
        const pattern = `%${escapeOrValue(normalized)}%`;
        request = request.or(`name.ilike.${pattern},slug.ilike.${pattern},category.ilike.${pattern},placement_category.ilike.${pattern},role.ilike.${pattern},asset_path.ilike.${pattern},source_name.ilike.${pattern}`);
      }
      const { data, error } = await request.limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => toEvidence(row as AssetInventoryRow));
    },
  };
}
