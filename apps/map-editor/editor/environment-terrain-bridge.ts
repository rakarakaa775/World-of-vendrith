import type { TerrainKey } from './terrain-engine';
import type { TerrainAssetBindingMap } from './terrain-asset-binding';
import { terrainAssetIdForMask } from './terrain-asset-binding';
import type { EnvironmentRuntimeState } from './environment-runtime';
import {
  effectiveTerrainAssetId,
  resolveTerrainEnvironmentVariant,
  type TerrainEnvironmentVariant,
} from './terrain-environment';

/**
 * Read-only bridge from authoritative environment runtime to terrain assets.
 *
 * This layer deliberately does not query Supabase and does not invent seasonal
 * bindings. A seasonal asset is selected only when the caller supplies an
 * explicit verified resolver.
 */
export type TerrainSeasonalBindingResolver = (
  terrain: TerrainKey,
  seasonKey: string,
  baseAssetId: string | null,
) => string | null;

export type EnvironmentTerrainAsset = {
  terrain: TerrainKey;
  assetId: string | null;
  baseAssetId: string | null;
  seasonalAssetId: string | null;
  seasonKey: string | null;
  weatherKey: string | null;
  mode: 'base' | 'seasonal';
};

function baseAssetIdForTerrain(
  bindings: TerrainAssetBindingMap,
  terrain: TerrainKey,
): string | null {
  // The verified base terrain bindings use the canonical full-neighborhood
  // mask 255. Do not ask for mask 0 here: mask 0 is a valid transition state,
  // not the base tile in the current registry.
  return terrainAssetIdForMask(bindings, terrain, 255) ?? null;
}

export function resolveEnvironmentTerrainAsset(
  terrain: TerrainKey,
  bindings: TerrainAssetBindingMap,
  runtime: EnvironmentRuntimeState,
  resolveSeasonalAsset?: TerrainSeasonalBindingResolver,
): EnvironmentTerrainAsset {
  const baseAssetId = baseAssetIdForTerrain(bindings, terrain);
  const variant: TerrainEnvironmentVariant = resolveTerrainEnvironmentVariant(
    terrain,
    baseAssetId,
    runtime.context,
    resolveSeasonalAsset,
  );

  return {
    terrain,
    assetId: effectiveTerrainAssetId(variant),
    baseAssetId: variant.baseAssetId,
    seasonalAssetId: variant.seasonalAssetId,
    seasonKey: variant.seasonKey,
    weatherKey: variant.weatherKey,
    mode: variant.mode,
  };
}

export function environmentTerrainContextReady(
  runtime: EnvironmentRuntimeState | null,
): boolean {
  return runtime?.source === 'engine' && runtime.context.seasonKey !== null;
}
