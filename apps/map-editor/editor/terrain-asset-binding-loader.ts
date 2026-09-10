import type { TerrainKey, TerrainMask } from './terrain-engine';
import {
  createTerrainAssetBindingMap,
  type TerrainAssetBinding,
  type TerrainAssetBindingMap,
} from './terrain-asset-binding';

const TERRAIN_KEYS: readonly TerrainKey[] = ['grass', 'sand', 'dirt', 'pavement', 'water'];

export type TerrainAssetBindingRow = {
  terrain_key: string | null;
  neighbor_mask: number | null;
  asset_id: string | null;
  candidate_status: string | null;
  asset_status: string | null;
  autotile_capable: boolean | null;
  license_registry_id: string | null;
};

export type TerrainAssetBindingLoadResult = {
  bindings: TerrainAssetBindingMap;
  accepted: TerrainAssetBinding[];
  rejected: number;
  diagnostics: {
    rows: number;
    accepted: number;
    rejected: number;
    complete: boolean;
  };
};

function isTerrainKey(value: unknown): value is TerrainKey {
  return typeof value === 'string' && TERRAIN_KEYS.includes(value as TerrainKey);
}

function isValidMask(value: unknown): value is TerrainMask {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 255;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Converts rows from public.vandrith_asset_binding_workbench into the editor
 * binding registry. Only fully verified runtime-safe rows are accepted:
 * terrain + mask must be present, the candidate must be approved, the asset
 * must be active, the asset must support autotiling, and a license registry
 * record must exist.
 *
 * Unknown/malformed rows are rejected rather than guessed. This is deliberate:
 * the editor must never manufacture an asset binding from incomplete audit data.
 */
export function loadTerrainAssetBindings(rows: unknown): TerrainAssetBindingLoadResult {
  if (!Array.isArray(rows)) {
    return {
      bindings: {},
      accepted: [],
      rejected: 0,
      diagnostics: { rows: 0, accepted: 0, rejected: 0, complete: false },
    };
  }

  const accepted: TerrainAssetBinding[] = [];
  let rejected = 0;

  for (const value of rows) {
    if (!value || typeof value !== 'object') {
      rejected += 1;
      continue;
    }

    const row = value as Partial<TerrainAssetBindingRow>;
    if (
      !isTerrainKey(row.terrain_key) ||
      !isValidMask(row.neighbor_mask) ||
      !isNonEmptyString(row.asset_id) ||
      row.candidate_status !== 'approved' ||
      row.asset_status !== 'active' ||
      row.autotile_capable !== true ||
      !isNonEmptyString(row.license_registry_id)
    ) {
      rejected += 1;
      continue;
    }

    accepted.push({
      terrain: row.terrain_key,
      mask: row.neighbor_mask,
      assetId: row.asset_id.trim(),
      sourceRuleKey: null,
    });
  }

  const bindings = createTerrainAssetBindingMap(accepted);
  const uniqueAccepted = Object.values(bindings).reduce(
    (total, terrainBindings) => total + Object.keys(terrainBindings ?? {}).length,
    0,
  );

  return {
    bindings,
    accepted,
    rejected,
    diagnostics: {
      rows: rows.length,
      accepted: uniqueAccepted,
      rejected,
      complete: uniqueAccepted === 256,
    },
  };
}

export function emptyTerrainAssetBindingLoadResult(): TerrainAssetBindingLoadResult {
  return {
    bindings: {},
    accepted: [],
    rejected: 0,
    diagnostics: { rows: 0, accepted: 0, rejected: 0, complete: false },
  };
}
