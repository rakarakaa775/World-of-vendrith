import type { TerrainKey } from './terrain-engine';

/**
 * Renderer-neutral environment context.
 *
 * Season/weather IDs are deliberately opaque. The editor must only use values
 * supplied by a verified environment source; this module does not invent a
 * calendar mapping, weather transition, or seasonal asset binding.
 */
export type TerrainEnvironmentContext = {
  seasonKey: string | null;
  weatherKey: string | null;
};

export type TerrainEnvironmentVariant = {
  terrain: TerrainKey;
  baseAssetId: string | null;
  seasonalAssetId: string | null;
  seasonKey: string | null;
  weatherKey: string | null;
  mode: 'base' | 'seasonal';
};

export type TerrainSeasonalAssetResolver = (
  terrain: TerrainKey,
  seasonKey: string,
  baseAssetId: string | null,
) => string | null;

export function createTerrainEnvironmentContext(
  seasonKey: string | null = null,
  weatherKey: string | null = null,
): TerrainEnvironmentContext {
  return { seasonKey, weatherKey };
}

/**
 * Resolves a seasonal terrain asset only when an explicit season and verified
 * resolver are supplied. Weather is context-only here; visual weather effects
 * belong to the environment renderer, not terrain asset selection.
 */
export function resolveTerrainEnvironmentVariant(
  terrain: TerrainKey,
  baseAssetId: string | null,
  context: TerrainEnvironmentContext,
  resolveSeasonalAsset?: TerrainSeasonalAssetResolver,
): TerrainEnvironmentVariant {
  if (!context.seasonKey || !resolveSeasonalAsset) {
    return {
      terrain,
      baseAssetId,
      seasonalAssetId: null,
      seasonKey: context.seasonKey,
      weatherKey: context.weatherKey,
      mode: 'base',
    };
  }

  const seasonalAssetId = resolveSeasonalAsset(terrain, context.seasonKey, baseAssetId);
  return {
    terrain,
    baseAssetId,
    seasonalAssetId,
    seasonKey: context.seasonKey,
    weatherKey: context.weatherKey,
    mode: seasonalAssetId ? 'seasonal' : 'base',
  };
}

export function effectiveTerrainAssetId(
  variant: TerrainEnvironmentVariant,
): string | null {
  return variant.seasonalAssetId ?? variant.baseAssetId;
}
