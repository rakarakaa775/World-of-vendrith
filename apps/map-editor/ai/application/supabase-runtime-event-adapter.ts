import type { SupabaseClient } from "@supabase/supabase-js";
import type { RuntimeEventCandidate, RuntimeEventDefinition } from "../domain/runtime-event";
import type { RuntimeEventExecutionStore } from "./runtime-event-executor";

interface TimeEventRow {
  id: string;
  world_id: string;
  event_type: string;
  scheduled_time: string;
  payload: Record<string, unknown> | null;
}

interface EventDefinitionRow {
  event_type: string;
  condition_type: "always" | "world_status";
  consequence_type: "world_status";
  condition_config: Record<string, unknown>;
  consequence_config: Record<string, unknown>;
  enabled: boolean;
}

interface ExecutionRow {
  id: string;
  time_event_id: string;
  status: "running" | "completed" | "failed";
}

export interface SupabaseRuntimeEventAdapter extends RuntimeEventExecutionStore {
  loadCandidates(worldId: string, currentDate: Date, currentTick: number, speed: number): Promise<RuntimeEventCandidate[] | undefined>;
  loadScheduledEvents(worldId: string): Promise<{ id: string; startTick: number; endTick: number }[] | undefined>;
  loadCandidateById(worldId: string, eventId: string, currentTick: number): Promise<RuntimeEventCandidate | undefined>;
  loadDefinition(eventType: string): Promise<RuntimeEventDefinition | undefined>;
  loadWorldStatus(worldId: string): Promise<string | undefined>;
  loadEnvironment(worldId: string): Promise<{ season: string; weather?: string; conditions?: Record<string, unknown> } | undefined>;
}

export function createSupabaseRuntimeEventAdapter(
  client: SupabaseClient,
): SupabaseRuntimeEventAdapter {
  return {
    async loadCandidates(worldId, currentDate, currentTick, speed) {
      if (!Number.isFinite(currentDate.getTime()) || !Number.isFinite(speed) || speed <= 0) return undefined;
      const result = await client
        .from("time_events")
        .select("id,world_id,event_type,scheduled_time,payload")
        .eq("world_id", worldId)
        .eq("status", "scheduled");
      if (result.error) return undefined;

      return ((result.data ?? []) as TimeEventRow[]).flatMap(event => {
        const scheduledAt = new Date(event.scheduled_time);
        if (!Number.isFinite(scheduledAt.getTime())) return [];
        const deltaMinutes = Math.max(0, Math.ceil((scheduledAt.getTime() - currentDate.getTime()) / 60000));
        const startTick = currentTick + Math.ceil(deltaMinutes / Math.max(0.000001, speed));
        return [{
          id: event.id,
          worldId: event.world_id,
          eventType: event.event_type,
          scheduledAt: event.scheduled_time,
          payload: event.payload ?? undefined,
          startTick,
          endTick: startTick + 1,
        }];
      });
    },

    async loadScheduledEvents(worldId) {
      const clockResult = await client
        .from("simulation_clock")
        .select("current_tick,current_date,speed")
        .eq("world_id", worldId)
        .maybeSingle();
      if (clockResult.error || !clockResult.data) return undefined;
      const currentDate = new Date(String(clockResult.data.current_date));
      const currentTick = Number(clockResult.data.current_tick);
      const speed = Number(clockResult.data.speed);
      if (!Number.isFinite(currentDate.getTime()) || !Number.isFinite(currentTick) || !Number.isFinite(speed) || speed <= 0) return undefined;

      const result = await client
        .from("time_events")
        .select("id,scheduled_time")
        .eq("world_id", worldId)
        .eq("status", "scheduled");
      if (result.error) return undefined;

      return (result.data ?? []).flatMap((row) => {
        const scheduledAt = new Date(String(row.scheduled_time));
        if (!Number.isFinite(scheduledAt.getTime())) return [];
        const deltaMinutes = Math.max(0, Math.ceil((scheduledAt.getTime() - currentDate.getTime()) / 60000));
        const startTick = currentTick + Math.ceil(deltaMinutes / speed);
        return [{ id: String(row.id), startTick, endTick: startTick + 1 }];
      });
    },

    async loadCandidateById(worldId, eventId, currentTick) {
      const result = await client
        .from("time_events")
        .select("id,world_id,event_type,scheduled_time,payload")
        .eq("world_id", worldId)
        .eq("id", eventId)
        .maybeSingle();
      if (result.error || !result.data) return undefined;
      const event = result.data as TimeEventRow;
      return {
        id: event.id,
        worldId: event.world_id,
        eventType: event.event_type,
        scheduledAt: event.scheduled_time,
        payload: event.payload ?? undefined,
        startTick: currentTick,
        endTick: currentTick + 1,
      };
    },

    async loadDefinition(eventType) {
      const result = await client
        .from("event_definitions")
        .select("event_type,condition_type,consequence_type,condition_config,consequence_config,enabled")
        .eq("event_type", eventType)
        .maybeSingle();
      if (result.error || !result.data) return undefined;
      const row = result.data as EventDefinitionRow;
      return {
        eventType: row.event_type,
        conditionType: row.condition_type,
        consequenceType: row.consequence_type,
        conditionConfig: row.condition_config ?? {},
        consequenceConfig: row.consequence_config ?? {},
        enabled: row.enabled,
      };
    },

    async loadWorldStatus(worldId) {
      const result = await client.from("worlds").select("status").eq("id", worldId).maybeSingle();
      if (result.error || !result.data || typeof result.data.status !== "string") return undefined;
      return result.data.status;
    },

    async loadEnvironment(worldId) {
      const stateResult = await client
        .from("world_environment_states")
        .select("season_id,weather_state_id,conditions")
        .eq("world_id", worldId)
        .maybeSingle();
      if (stateResult.error) return undefined;
      const clockResult = await client
        .from("world_environment_clocks")
        .select("current_season_id")
        .eq("world_id", worldId)
        .maybeSingle();
      if (clockResult.error) return undefined;
      const seasonId = stateResult.data?.season_id ?? clockResult.data?.current_season_id ?? null;
      let season = "unknown";
      if (seasonId) {
        const seasonResult = await client.from("season_definitions").select("season_key").eq("id", seasonId).maybeSingle();
        if (seasonResult.error) return undefined;
        if (seasonResult.data?.season_key) season = String(seasonResult.data.season_key);
      }
      let weather: string | undefined;
      if (stateResult.data?.weather_state_id) {
        const weatherStateResult = await client.from("world_weather_states").select("weather_id").eq("id", stateResult.data.weather_state_id).maybeSingle();
        if (weatherStateResult.error) return undefined;
        if (weatherStateResult.data?.weather_id) {
          const weatherResult = await client.from("weather_definitions").select("weather_key").eq("id", weatherStateResult.data.weather_id).maybeSingle();
          if (weatherResult.error) return undefined;
          weather = weatherResult.data?.weather_key ? String(weatherResult.data.weather_key) : undefined;
        }
      }
      const conditions = stateResult.data?.conditions && typeof stateResult.data.conditions === "object"
        ? stateResult.data.conditions as Record<string, unknown>
        : undefined;
      return weather ? { season, weather, ...(conditions ? { conditions } : {}) } : { season, ...(conditions ? { conditions } : {}) };
    },

    async findByTimeEventId(timeEventId) {
      const result = await client
        .from("event_executions")
        .select("id,time_event_id,status")
        .eq("time_event_id", timeEventId)
        .in("status", ["running", "completed"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (result.error || !result.data) return undefined;
      return result.data as ExecutionRow;
    },

    async claim(candidate) {
      const result = await client
        .from("event_executions")
        .insert({ time_event_id: candidate.id, status: "running", metadata: { eventType: candidate.eventType, startTick: candidate.startTick } })
        .select("id")
        .single();
      if (result.error || !result.data) return undefined;
      return { id: String(result.data.id) };
    },

    async applyWorldStatus(worldId, status) {
      const result = await client.from("worlds").update({ status }).eq("id", worldId);
      if (result.error) throw result.error;
    },

    async applyEnvironment(worldId, consequence) {
      const seasonKey = typeof consequence.season_key === "string" ? consequence.season_key : null;
      const weatherKey = typeof consequence.weather_key === "string" ? consequence.weather_key : null;
      const intensity = consequence.weather_intensity === undefined ? null : Number(consequence.weather_intensity);
      if (intensity !== null && (!Number.isInteger(intensity) || intensity < 0 || intensity > 5)) {
        throw new Error("Environment consequence weather_intensity must be an integer from 0 to 5.");
      }
      if (!seasonKey && !weatherKey && consequence.conditions === undefined) {
        throw new Error("Environment consequence must specify season_key, weather_key, or conditions.");
      }

      const rpc = await client.rpc("apply_runtime_environment_consequence_v1", {
        p_world_id: worldId,
        p_season_key: seasonKey,
        p_weather_key: weatherKey,
        p_weather_intensity: intensity,
        p_conditions: consequence.conditions && typeof consequence.conditions === "object"
          ? consequence.conditions as Record<string, unknown>
          : null,
      });
      if (rpc.error) throw rpc.error;
      const metadata = rpc.data && typeof rpc.data === "object" && !Array.isArray(rpc.data)
        ? rpc.data as Record<string, unknown>
        : {};
      return {
        seasonKey,
        weatherKey,
        weatherIntensity: intensity ?? undefined,
        conditions: metadata.conditions ?? (consequence.conditions ?? {}),
      };
    },

    async complete(executionId, metadata = {}) {
      const result = await client
        .from("event_executions")
        .update({ status: "completed", completed_at: new Date().toISOString(), metadata })
        .eq("id", executionId);
      if (result.error) throw result.error;
    },

    async fail(executionId, errorMessage) {
      await client
        .from("event_executions")
        .update({ status: "failed", completed_at: new Date().toISOString(), error_message: errorMessage })
        .eq("id", executionId);
    },
  };
}
