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
 * Empty by design: verified terrain bindings are loaded from Supabase at runtime.
 * This registry never invents asset IDs.
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

/**
 * Resolve an exact autotile mask first. When a terrain has only its verified
 * base tile (mask 255), use that tile as the safe visual fallback for every
 * other mask until transition assets are approved and bound. This keeps the
 * renderer textured instead of falling back to flat debug colors at edges.
 */
export function getTerrainAssetBinding(
  bindings: TerrainAssetBindingMap,
  terrain: TerrainKey,
  mask: TerrainMask,
): TerrainAssetBinding | null {
  const terrainBindings = bindings[terrain];
  if (!terrainBindings) return null;
  return terrainBindings[mask] ?? terrainBindings[255] ?? null;
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
