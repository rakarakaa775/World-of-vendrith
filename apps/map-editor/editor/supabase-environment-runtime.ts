import type { EnvironmentRuntimeRow, EnvironmentRuntimeState } from './environment-runtime';
import { emptyEnvironmentRuntime, environmentRuntimeFromRow } from './environment-runtime';

export type EnvironmentRuntimeClient = {
  functions: {
    invoke(
      functionName: string,
      options?: { body?: unknown; headers?: Record<string, string> },
    ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  };
};

export type EnvironmentRuntimeLoadResult = {
  state: EnvironmentRuntimeState;
  source: 'edge-function' | 'empty';
  error: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function joinedRow(value: unknown): EnvironmentRuntimeRow | null {
  if (!isRecord(value)) return null;
  const row = value as Partial<EnvironmentRuntimeRow>;
  if (typeof row.world_id !== 'string' || typeof row.simulation_at !== 'string') return null;
  if (typeof row.speed_multiplier !== 'number') return null;
  return row as EnvironmentRuntimeRow;
}

/**
 * Loads authoritative runtime state through the protected Edge Function.
 * The browser never queries simulation-owned tables directly.
 */
export async function loadEnvironmentRuntime(
  client: EnvironmentRuntimeClient,
  worldId: string,
): Promise<EnvironmentRuntimeLoadResult> {
  try {
    const result = await client.functions.invoke('environment-runtime-state', {
      body: { world_id: worldId },
    });
    if (result.error) {
      return { state: emptyEnvironmentRuntime(worldId), source: 'empty', error: result.error.message };
    }
    if (!isRecord(result.data) || result.data.runtimeReady !== true) {
      return {
        state: emptyEnvironmentRuntime(worldId),
        source: 'empty',
        error: 'Environment runtime state is not ready',
      };
    }
    const row = joinedRow(result.data.row);
    if (!row) {
      return {
        state: emptyEnvironmentRuntime(worldId),
        source: 'empty',
        error: 'Environment runtime payload is invalid',
      };
    }
    return { state: environmentRuntimeFromRow(row), source: 'edge-function', error: null };
  } catch (error) {
    return {
      state: emptyEnvironmentRuntime(worldId),
      source: 'empty',
      error: error instanceof Error ? error.message : 'Unknown environment runtime error',
    };
  }
}
