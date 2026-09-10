import type { SupabaseClient } from '@supabase/supabase-js';
import type { TerrainEnvironmentContext } from './terrain-environment';

type SeasonRow = { season_key: string | null };
type WeatherRow = { weather_key: string | null };

export type EnvironmentCatalog = {
  seasons: string[];
  weathers: string[];
};

export type EnvironmentReadiness = {
  seasonDefinitions: number | null;
  weatherDefinitions: number | null;
  seasonRules: number | null;
  seasonCycleRules: number | null;
  seasonWeatherRules: number | null;
  weatherTransitionPolicies: number | null;
  terrainSeasonalBindings: number | null;
  runtimeReady: boolean;
  source: 'engine' | 'unavailable';
};

export type EnvironmentLoadResult = {
  context: TerrainEnvironmentContext;
  catalog: EnvironmentCatalog;
  readiness: EnvironmentReadiness;
  source: 'supabase' | 'empty';
  ready: boolean;
  error: string | null;
};

const EMPTY_READINESS: EnvironmentReadiness = {
  seasonDefinitions: null,
  weatherDefinitions: null,
  seasonRules: null,
  seasonCycleRules: null,
  seasonWeatherRules: null,
  weatherTransitionPolicies: null,
  terrainSeasonalBindings: null,
  runtimeReady: false,
  source: 'unavailable',
};

const EMPTY: EnvironmentLoadResult = {
  context: { seasonKey: null, weatherKey: null },
  catalog: { seasons: [], weathers: [] },
  readiness: EMPTY_READINESS,
  source: 'empty',
  ready: false,
  error: null,
};

function keys(rows: unknown, field: 'season_key' | 'weather_key'): string[] {
  if (!Array.isArray(rows)) return [];
  return [...new Set(rows.flatMap(row => {
    if (!row || typeof row !== 'object') return [];
    const value = (row as Record<string, unknown>)[field];
    return typeof value === 'string' && value.trim() ? [value.trim()] : [];
  }))];
}

/**
 * Browser-safe catalog loader only. Simulation-owned tables are deliberately
 * not queried here: their security boundary marks them engine-read only.
 * Readiness for those tables must arrive through a trusted engine/server path.
 */
export async function loadEnvironmentCatalogFromSupabase(
  client: SupabaseClient,
): Promise<EnvironmentLoadResult> {
  try {
    const [seasonResponse, weatherResponse] = await Promise.all([
      client.from('season_definitions').select('season_key'),
      client.from('weather_definitions').select('weather_key'),
    ]);

    if (seasonResponse.error) return { ...EMPTY, error: seasonResponse.error.message };
    if (weatherResponse.error) return { ...EMPTY, error: weatherResponse.error.message };

    const seasons = keys(seasonResponse.data as SeasonRow[], 'season_key');
    const weathers = keys(weatherResponse.data as WeatherRow[], 'weather_key');
    return {
      context: { seasonKey: null, weatherKey: null },
      catalog: { seasons, weathers },
      readiness: {
        ...EMPTY_READINESS,
        seasonDefinitions: seasons.length,
        weatherDefinitions: weathers.length,
      },
      source: 'supabase',
      ready: seasons.length > 0 && weathers.length > 0,
      error: null,
    };
  } catch (error) {
    return {
      ...EMPTY,
      error: error instanceof Error ? error.message : 'Unknown environment load error',
    };
  }
}

export function environmentCatalogSummary(result: EnvironmentLoadResult): string {
  if (result.error) return 'Environment catalog unavailable · load failed closed';
  return `${result.catalog.seasons.length} seasons · ${result.catalog.weathers.length} weather definitions · active context not inferred`;
}

export function environmentReadinessSummary(readiness: EnvironmentReadiness): string {
  if (readiness.source === 'unavailable') return 'Runtime Environment BLOCKED · engine diagnostics unavailable to browser';
  if (readiness.runtimeReady) return 'Runtime Environment READY';
  return 'Runtime Environment BLOCKED · cycle/transition/seasonal bindings incomplete';
}
