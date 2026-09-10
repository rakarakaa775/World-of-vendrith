import type { TerrainEnvironmentContext } from './terrain-environment';

export type EnvironmentRuntimeClock = {
  worldId: string;
  simulationAt: string;
  speedMultiplier: number;
  currentSeasonKey: string | null;
  seasonStartedAt: string | null;
  seasonEndsAt: string | null;
};

export type EnvironmentRuntimeWeather = {
  weatherKey: string;
  seasonKey: string | null;
  startedAt: string;
  endsAt: string | null;
  intensity: number;
  seed: number | null;
  conditions: Record<string, unknown>;
};

export type EnvironmentRuntimeState = {
  worldId: string;
  context: TerrainEnvironmentContext;
  clock: EnvironmentRuntimeClock | null;
  weather: EnvironmentRuntimeWeather | null;
  stateStartedAt: string | null;
  stateEndsAt: string | null;
  conditions: Record<string, unknown>;
  source: 'engine' | 'empty';
};

export type EnvironmentRuntimeRow = {
  world_id: string;
  simulation_at: string;
  speed_multiplier: number;
  current_season_key: string | null;
  season_started_at: string | null;
  season_ends_at: string | null;
  weather_key: string | null;
  weather_season_key: string | null;
  weather_started_at: string | null;
  weather_ends_at: string | null;
  weather_intensity: number | null;
  weather_seed: number | null;
  weather_conditions: Record<string, unknown> | null;
  state_started_at: string | null;
  state_ends_at: string | null;
  state_conditions: Record<string, unknown> | null;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

/**
 * Converts an engine-owned joined runtime row into renderer-neutral state.
 * The editor never derives season/weather from the wall clock; it consumes
 * only authoritative engine state supplied through a trusted server path.
 */
export function environmentRuntimeFromRow(row: EnvironmentRuntimeRow): EnvironmentRuntimeState {
  const weather = row.weather_key
    ? {
        weatherKey: row.weather_key,
        seasonKey: row.weather_season_key,
        startedAt: row.weather_started_at ?? row.simulation_at,
        endsAt: row.weather_ends_at,
        intensity: Math.max(0, Math.min(5, row.weather_intensity ?? 0)),
        seed: row.weather_seed,
        conditions: record(row.weather_conditions),
      }
    : null;

  return {
    worldId: row.world_id,
    context: {
      seasonKey: row.current_season_key,
      weatherKey: row.weather_key,
    },
    clock: {
      worldId: row.world_id,
      simulationAt: row.simulation_at,
      speedMultiplier: Math.max(0, row.speed_multiplier),
      currentSeasonKey: row.current_season_key,
      seasonStartedAt: row.season_started_at,
      seasonEndsAt: row.season_ends_at,
    },
    weather,
    stateStartedAt: row.state_started_at,
    stateEndsAt: row.state_ends_at,
    conditions: record(row.state_conditions),
    source: 'engine',
  };
}

export function emptyEnvironmentRuntime(worldId: string): EnvironmentRuntimeState {
  return {
    worldId,
    context: { seasonKey: null, weatherKey: null },
    clock: null,
    weather: null,
    stateStartedAt: null,
    stateEndsAt: null,
    conditions: {},
    source: 'empty',
  };
}

/** Runtime rendering may consume this context, but it must not mutate it. */
export function terrainEnvironmentContextFromRuntime(
  state: EnvironmentRuntimeState,
): TerrainEnvironmentContext {
  return state.context;
}
