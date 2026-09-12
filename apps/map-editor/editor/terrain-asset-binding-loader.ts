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

function isApprovedAssetStatus(value: unknown): boolean {
  return value === 'approved' || value === 'verified' || value === 'active';
}

/**
 * Converts rows from public.vandrith_asset_binding_workbench into the editor
 * binding registry without inventing asset IDs.
 *
 * Two audited cases are accepted:
 * 1. Full autotile bindings: approved candidate + active/verified asset +
 *    autotile-capable + license registry.
 * 2. Verified base terrain: mask 255 + approved/verified/active asset + a
 *    license registry. These are intentionally allowed even when the asset is
 *    not autotile-capable so the editor can render its real base texture while
 *    transition masks remain unbound and safely fall back to the base color.
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
    const baseTerrain =
      isTerrainKey(row.terrain_key) &&
      row.neighbor_mask === 255 &&
      isNonEmptyString(row.asset_id) &&
      isApprovedAssetStatus(row.asset_status) &&
      isNonEmptyString(row.license_registry_id);
    const fullAutotile =
      isTerrainKey(row.terrain_key) &&
      isValidMask(row.neighbor_mask) &&
      isNonEmptyString(row.asset_id) &&
      row.candidate_status === 'approved' &&
      isApprovedAssetStatus(row.asset_status) &&
      row.autotile_capable === true &&
      isNonEmptyString(row.license_registry_id);

    if (!baseTerrain && !fullAutotile) {
      rejected += 1;
      continue;
    }

    accepted.push({
      terrain: row.terrain_key as TerrainKey,
      mask: row.neighbor_mask as TerrainMask,
      assetId: row.asset_id!.trim(),
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
