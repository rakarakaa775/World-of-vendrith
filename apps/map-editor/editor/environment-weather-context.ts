import type { EnvironmentRuntimeState } from './environment-runtime';
import type { TerrainKey } from './terrain-engine';

/**
 * Weather is deliberately descriptive rather than prescriptive.
 * The engine supplies conditions/intensity; renderers decide how to visualize it.
 */
export type TerrainWeatherVisualContext = {
  weatherKey: string | null;
  intensity: number | null;
  conditions: Record<string, unknown>;
  wetness: number | null;
  snowCoverage: number | null;
  frost: number | null;
  mud: number | null;
};

function numericCondition(conditions: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = conditions[key];
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.min(1, value));
  }
  return null;
}

export function terrainWeatherVisualContext(
  runtime: EnvironmentRuntimeState | null,
): TerrainWeatherVisualContext {
  if (!runtime || runtime.source !== 'engine') {
    return { weatherKey: null, intensity: null, conditions: {}, wetness: null, snowCoverage: null, frost: null, mud: null };
  }
  const conditions = runtime.conditions ?? {};
  const intensity = runtime.weather?.intensity ?? null;
  return {
    weatherKey: runtime.context.weatherKey,
    intensity,
    conditions,
    wetness: numericCondition(conditions, ['wetness', 'rain_wetness']),
    snowCoverage: numericCondition(conditions, ['snow_coverage', 'snowCoverage']),
    frost: numericCondition(conditions, ['frost', 'frost_level']),
    mud: numericCondition(conditions, ['mud', 'mud_level']),
  };
}

/**
 * Terrain identity remains independent from weather. This helper exposes the
 * context for a renderer without selecting or inventing a terrain asset.
 */
export function terrainWeatherAppliesTo(_terrain: TerrainKey, context: TerrainWeatherVisualContext): boolean {
  return context.weatherKey !== null || context.wetness !== null || context.snowCoverage !== null || context.frost !== null || context.mud !== null;
}
