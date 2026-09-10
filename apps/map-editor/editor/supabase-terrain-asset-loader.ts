import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import {
  emptyTerrainAssetBindingLoadResult,
  loadTerrainAssetBindings,
  type TerrainAssetBindingLoadResult,
  type TerrainAssetBindingRow,
} from './terrain-asset-binding-loader';

export type TerrainAssetBindingClient = {
  from(table: string): {
    select(columns: string): PromiseLike<{
      data: unknown;
      error: { message: string } | null;
    }>;
  };
};

export type SupabaseTerrainAssetLoadResult = TerrainAssetBindingLoadResult & {
  source: 'supabase' | 'empty';
  error: string | null;
};

const WORKBENCH_COLUMNS =
  'terrain_key,neighbor_mask,asset_id,candidate_status,asset_status,autotile_capable,license_registry_id';

/**
 * Reads the audited terrain asset workbench without granting the editor any
 * authority to invent bindings. A query error, malformed response, or empty
 * result fails closed to an empty binding registry.
 */
export async function loadTerrainAssetBindingsFromSupabase(
  client: TerrainAssetBindingClient,
): Promise<SupabaseTerrainAssetLoadResult> {
  try {
    const response = await client
      .from('vandrith_asset_binding_workbench')
      .select(WORKBENCH_COLUMNS);

    if (response.error) {
      const empty = emptyTerrainAssetBindingLoadResult();
      return { ...empty, source: 'empty', error: response.error.message };
    }

    const result = loadTerrainAssetBindings(response.data as TerrainAssetBindingRow[]);
    return { ...result, source: 'supabase', error: null };
  } catch (error) {
    const empty = emptyTerrainAssetBindingLoadResult();
    return {
      ...empty,
      source: 'empty',
      error: error instanceof Error ? error.message : 'Unknown Supabase terrain binding error',
    };
  }
}

export function terrainAssetBindingSummary(result: SupabaseTerrainAssetLoadResult): string {
  return `${result.diagnostics.accepted}/256 bindings · ${result.diagnostics.rejected} rejected${result.error ? ' · load failed closed' : ''}`;
}

export type { TerrainAssetBindingMap };
