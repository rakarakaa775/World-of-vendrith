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
  loadDefinition(eventType: string): Promise<RuntimeEventDefinition | undefined>;
  loadWorldStatus(worldId: string): Promise<string | undefined>;
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

      return ((result.data ?? []) as TimeEventRow[])
        .map(event => {
          const scheduledAt = new Date(event.scheduled_time);
          if (!Number.isFinite(scheduledAt.getTime())) return undefined;
          const deltaMinutes = Math.max(0, Math.ceil((scheduledAt.getTime() - currentDate.getTime()) / 60000));
          const startTick = currentTick + Math.ceil(deltaMinutes / Math.max(0.000001, speed));
          return {
            id: event.id,
            worldId: event.world_id,
            eventType: event.event_type,
            scheduledAt: event.scheduled_time,
            payload: event.payload ?? undefined,
            startTick,
            endTick: startTick + 1,
          };
        })
        .filter((event): event is RuntimeEventCandidate => Boolean(event));
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
