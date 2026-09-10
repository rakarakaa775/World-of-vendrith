import type { TerrainKey, TerrainMask } from './terrain-engine';
import { bindingKey, type TerrainBindingMap } from './terrain-autotile';

export type TerrainAssetBinding = {
  terrain: TerrainKey;
  mask: TerrainMask;
  assetId: string;
  sourceRuleKey: string | null;
};

export type TerrainAssetBindingMap = Partial<Record<TerrainKey, Partial<Record<number, TerrainAssetBinding>>>>;

/**
 * Empty by design: Supabase currently reports zero bound assets for the
 * verified terrain-rule catalog. Bindings must come from verified assets;
 * this registry never invents asset IDs.
 */
export const VERIFIED_TERRAIN_ASSET_BINDINGS: TerrainAssetBindingMap = {};

export function createTerrainAssetBindingMap(bindings: TerrainAssetBinding[]): TerrainAssetBindingMap {
  const map: TerrainAssetBindingMap = {};
  for (const binding of bindings) {
    map[binding.terrain] ??= {};
    map[binding.terrain]![binding.mask] = binding;
  }
  return map;
}

export function getTerrainAssetBinding(
  bindings: TerrainAssetBindingMap,
  terrain: TerrainKey,
  mask: TerrainMask,
): TerrainAssetBinding | null {
  return bindings[terrain]?.[mask] ?? null;
}

export function terrainAssetIdForMask(
  bindings: TerrainAssetBindingMap,
  terrain: TerrainKey,
  mask: TerrainMask,
): string | null {
  return getTerrainAssetBinding(bindings, terrain, mask)?.assetId ?? null;
}

export function countTerrainAssetBindings(bindings: TerrainAssetBindingMap): number {
  return Object.values(bindings).reduce((total, terrainBindings) => total + Object.keys(terrainBindings ?? {}).length, 0);
}

export function bindingDiagnostics(bindings: TerrainAssetBindingMap) {
  const bound = countTerrainAssetBindings(bindings);
  return {
    bound,
    expected: 256,
    unbound: Math.max(0, 256 - bound),
    complete: bound === 256,
  };
}

export function terrainBindingLookupKey(terrain: TerrainKey, mask: TerrainMask): string {
  return bindingKey(terrain, mask);
}

export function fromLegacyBindingMap(bindings: TerrainBindingMap, sourceRuleKey: string | null = null): TerrainAssetBindingMap {
  const result: TerrainAssetBindingMap = {};
  for (const terrain of Object.keys(bindings) as TerrainKey[]) {
    const terrainBindings = bindings[terrain];
    if (!terrainBindings) continue;
    result[terrain] = {};
    for (const [maskText, assetId] of Object.entries(terrainBindings)) {
      const mask = Number(maskText);
      if (!Number.isInteger(mask) || !assetId) continue;
      result[terrain]![mask] = { terrain, mask, assetId, sourceRuleKey };
    }
  }
  return result;
}
