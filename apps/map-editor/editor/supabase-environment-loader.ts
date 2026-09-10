import type { SupabaseClient } from '@supabase/supabase-js';
import type { TerrainEnvironmentContext } from './terrain-environment';

type SeasonRow = { season_key: string | null };
type WeatherRow = { weather_key: string | null };

type CountRow = { count: number | string };

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

function count(rows: unknown): number | null {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const value = (rows[0] as CountRow)?.count;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

async function tableCount(client: SupabaseClient, table: string): Promise<number | null> {
  const response = await client.from(table).select('*', { count: 'exact', head: true });
  if (response.error) throw new Error(`${table}: ${response.error.message}`);
  return typeof response.count === 'number' ? response.count : 0;
}

/**
 * Loads canonical definitions plus non-mutating readiness diagnostics.
 * It never derives the active season/weather and never enables runtime state.
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
    const [seasonRules, seasonCycleRules, seasonWeatherRules, weatherTransitionPolicies, terrainSeasonalBindings] =
      await Promise.all([
        tableCount(client, 'season_rules'),
        tableCount(client, 'season_cycle_rules'),
        tableCount(client, 'season_weather_rules'),
        tableCount(client, 'weather_transition_policies'),
        tableCount(client, 'terrain_seasonal_bindings'),
      ]);

    const readiness: EnvironmentReadiness = {
      seasonDefinitions: seasons.length,
      weatherDefinitions: weathers.length,
      seasonRules,
      seasonCycleRules,
      seasonWeatherRules,
      weatherTransitionPolicies,
      terrainSeasonalBindings,
      runtimeReady:
        seasons.length === 4 &&
        weathers.length === 7 &&
        seasonRules === 8 &&
        seasonCycleRules === 4 &&
        seasonWeatherRules === 28 &&
        weatherTransitionPolicies === 7 &&
        terrainSeasonalBindings !== null &&
        terrainSeasonalBindings > 0,
    };

    return {
      context: { seasonKey: null, weatherKey: null },
      catalog: { seasons, weathers },
      readiness,
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
  if (readiness.runtimeReady) return 'Runtime Environment READY';
  return 'Runtime Environment BLOCKED · cycle/transition/seasonal bindings incomplete';
}
