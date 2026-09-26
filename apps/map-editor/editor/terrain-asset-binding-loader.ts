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
  tile_region?: unknown;
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

function isApprovedAssetStatus(value: unknown): value is 'approved' {
  return value === 'approved';
}

function parseTerrainAssetRegion(value: unknown): TerrainAssetBinding['region'] {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const x = row.x;
  const y = row.y;
  const width = row.width;
  const height = row.height;
  if (
    ![x, y, width, height].every(
      item => typeof item === 'number' && Number.isInteger(item) && item >= 0,
    ) ||
    width === 0 ||
    height === 0
  ) {
    return null;
  }
  return { x: x as number, y: y as number, width: width as number, height: height as number };
}


/**
 * Converts rows from public.vandrith_asset_binding_workbench into the editor
 * binding registry without inventing asset IDs.
 *
 * Every runtime binding must satisfy the documented two-source approval
 * boundary: the asset itself is approved and the binding candidate is
 * approved. Full autotile rows additionally require an autotile-capable asset.
 * A base terrain is represented by mask 255 and may be non-autotile-capable.
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
    const approvedCandidate = row.candidate_status === 'approved';
    const approvedAsset = isApprovedAssetStatus(row.asset_status);
    const common =
      isTerrainKey(row.terrain_key) &&
      isValidMask(row.neighbor_mask) &&
      isNonEmptyString(row.asset_id) &&
      approvedCandidate &&
      approvedAsset &&
      isNonEmptyString(row.license_registry_id);
    const baseTerrain = common && row.neighbor_mask === 255;
    const fullAutotile = common && row.autotile_capable === true;

    if (!baseTerrain && !fullAutotile) {
      rejected += 1;
      continue;
    }

    accepted.push({
      terrain: row.terrain_key as TerrainKey,
      mask: row.neighbor_mask as TerrainMask,
      assetId: row.asset_id!.trim(),
      sourceRuleKey: null,
      region: parseTerrainAssetRegion(row.tile_region),
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
