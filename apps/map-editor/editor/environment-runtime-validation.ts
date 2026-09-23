import type { SupabaseClient } from '@supabase/supabase-js';

export type EnvironmentRuntimeValidation = {
  status: 'READY' | 'BLOCKED' | 'UNAVAILABLE';
  blockingCount: number | null;
  reason: string | null;
  seasonMappingReady: boolean;
  weatherTransitionsReady: boolean;
};

const EMPTY: EnvironmentRuntimeValidation = {
  status: 'UNAVAILABLE',
  blockingCount: null,
  reason: 'Engine diagnostics unavailable',
  seasonMappingReady: false,
  weatherTransitionsReady: false,
};

export async function loadEnvironmentRuntimeValidation(
  client: SupabaseClient,
): Promise<EnvironmentRuntimeValidation> {
  try {
    const { data, error } = await client.rpc('environment_runtime_readiness_gate_v3');
    if (error) return { ...EMPTY, reason: error.message };

    const gate = data && typeof data === 'object' ? data as Record<string, any> : null;
    if (!gate) return EMPTY;

    const seasonBridge = gate.season_bridge && typeof gate.season_bridge === 'object'
      ? gate.season_bridge as Record<string, any>
      : null;
    const configurationGuard = gate.configuration_guard && typeof gate.configuration_guard === 'object'
      ? gate.configuration_guard as Record<string, any>
      : null;

    return {
      status: gate.ready === true ? 'READY' : 'BLOCKED',
      blockingCount: typeof gate.blocking_count === 'number' ? gate.blocking_count : null,
      reason: typeof gate.status === 'string' ? gate.status : null,
      seasonMappingReady: seasonBridge?.ready === true,
      weatherTransitionsReady: configurationGuard?.ready === true,
    };
  } catch (error) {
    return { ...EMPTY, reason: error instanceof Error ? error.message : 'Unknown engine diagnostics error' };
  }
}
