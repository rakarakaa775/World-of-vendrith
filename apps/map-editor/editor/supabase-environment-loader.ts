import type { SupabaseClient } from '@supabase/supabase-js';
import type { TerrainEnvironmentContext } from './terrain-environment';

type SeasonRow = {
  season_key: string | null;
};

type WeatherRow = {
  weather_key: string | null;
};

type SeasonRuleRow = {
  season_key?: string | null;
  rule_key: string | null;
  rule_value: unknown;
};

type WeatherRuleRow = {
  season_id: string | null;
  weather_id: string | null;
};

export type EnvironmentCatalog = {
  seasons: string[];
  weathers: string[];
};

export type EnvironmentLoadResult = {
  context: TerrainEnvironmentContext;
  catalog: EnvironmentCatalog;
  source: 'supabase' | 'empty';
  ready: boolean;
  error: string | null;
};

const EMPTY: EnvironmentLoadResult = {
  context: { seasonKey: null, weatherKey: null },
  catalog: { seasons: [], weathers: [] },
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
 * Loads only canonical environment definitions. It intentionally does not
 * derive the current season from the calendar or choose weather: those
 * require cycle/transition policy data that may be absent.
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

    const seasons = keys(seasonResponse.data, 'season_key');
    const weathers = keys(weatherResponse.data, 'weather_key');
    return {
      context: { seasonKey: null, weatherKey: null },
      catalog: { seasons, weathers },
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
