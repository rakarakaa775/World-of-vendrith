import type { RuntimeAiRequest } from "../domain/runtime";
import type { RuntimeScheduledEvent } from "../domain/runtime-clock";
import { createNpcBehaviorMemoryStore, type NpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import { runNpcRuntimeTick, type NpcRuntimeTickResult } from "./npc-runtime-loop";
import { createSupabaseRuntimeWorldBridge, type SupabaseRuntimeWorldBridge } from "./supabase-runtime-world-bridge";
import type { SupabaseRuntimeWorldAdapter } from "./supabase-runtime-world-adapter";
import type { RuntimeEventExecutionResult } from "../domain/runtime-event";
import { executeRuntimeEvent } from "./runtime-event-executor";
import type { SupabaseRuntimeEventAdapter } from "./supabase-runtime-event-adapter";
import { createNpcRelationshipRuntimeStore, type NpcRelationshipRuntimeStore } from "./npc-relationship-runtime-store";
import type { NpcSocialInteraction } from "./npc-social-interaction-schema";

export interface SupabaseRuntimeEngine {
  readonly mapId: string;
  readonly bridge: SupabaseRuntimeWorldBridge;
  readonly memory: NpcBehaviorMemoryStore;
  readonly relationships: NpcRelationshipRuntimeStore;
  applySocialInteraction(interaction: NpcSocialInteraction): ReturnType<NpcRelationshipRuntimeStore["applyInteraction"]>;
  tick(events?: RuntimeScheduledEvent[], minutesPerTick?: number): Promise<SupabaseRuntimeEngineTickResult>;
}

export interface SupabaseRuntimeEngineTickResult {
  tick: number;
  stateVersion: string;
  results: NpcRuntimeTickResult[];
  eventResults: RuntimeEventExecutionResult[];
}

export async function createSupabaseRuntimeEngine(
  adapter: SupabaseRuntimeWorldAdapter,
  mapId: string,
  eventAdapter?: SupabaseRuntimeEventAdapter,
): Promise<SupabaseRuntimeEngine | undefined> {
  const loaded = await adapter.load(mapId);
  if (!loaded) return undefined;
  const bridge = await createSupabaseRuntimeWorldBridge(adapter, mapId, loaded);
  if (!bridge) return undefined;
  const memory = createNpcBehaviorMemoryStore();
  const relationships = createNpcRelationshipRuntimeStore();
  for (const entity of loaded.snapshot.entities) {
    if (entity.kind !== "npc") continue;
    const profile = entity.state?.decisionProfile;
    const seeded = profile && typeof profile === "object" && !Array.isArray(profile)
      ? (profile as Record<string, unknown>).relationships
      : undefined;
    if (Array.isArray(seeded)) relationships.set(entity.id, seeded as never);
  }
  return {
    mapId,
    bridge,
    memory,
    relationships,
    applySocialInteraction(interaction) {
      return relationships.applyInteraction(interaction);
    },
    async tick(events = [], minutesPerTick = 1) {
      const authoritativeEvents = eventAdapter
        ? await eventAdapter.loadScheduledEvents(loaded.snapshot.state.worldId)
        : undefined;
      const effectiveEvents = events.length > 0
        ? events
        : authoritativeEvents ?? loaded.scheduledEvents;
      bridge.advanceClock(minutesPerTick, effectiveEvents);
      const initial = bridge.snapshot();
      const eventResults: RuntimeEventExecutionResult[] = [];
      if (eventAdapter) {
        const worldStatus = await eventAdapter.loadWorldStatus(initial.state.worldId);
        if (worldStatus !== undefined) {
          for (const eventId of initial.state.activeEventIds) {
            const candidate = await eventAdapter.loadCandidateById(
              initial.state.worldId,
              eventId,
              initial.state.clock.tick,
            );
            if (!candidate) continue;
            const definition = await eventAdapter.loadDefinition(candidate.eventType);
            eventResults.push(await executeRuntimeEvent(
              candidate,
              definition,
              initial.state,
              worldStatus,
              eventAdapter,
            ));
          }
        }
        const environment = await eventAdapter.loadEnvironment(initial.state.worldId);
        if (environment) bridge.refreshEnvironment(environment);
      }
      const npcs = bridge.snapshot().entities.filter(entity => entity.kind === "npc" && entity.mapId === mapId);
      const results: NpcRuntimeTickResult[] = [];

      for (const npc of npcs) {
        const current = bridge.snapshot();
        const self = current.entities.find(entity => entity.id === npc.id);
        if (!self) continue;
        const request: RuntimeAiRequest = {
          id: `${mapId}:npc:${npc.id}:tick:${current.state.clock.tick + 1}`,
          surface: "game",
          intelligence: "npc",
          observation: {
            id: `${mapId}:npc:${npc.id}:seed:${current.state.stateVersion}`,
            surface: "game",
            intelligence: "npc",
            state: current.state,
            perception: {
              self,
              nearbyEntities: current.entities.filter(entity => entity.id !== self.id && entity.mapId === self.mapId),
              detections: [],
              visibleMapIds: [self.mapId],
              environment: {
                weather: current.state.weather,
                season: current.state.clock.season,
                activeRegionId: current.state.activeRegionId,
              },
            },
            facts: [],
          },
          goal: "Continue the NPC's runtime behavior according to its current world state.",
        };
        results.push(await runNpcRuntimeTick(request, bridge.ports, bridge.store, memory, relationships));
      }

      const after = bridge.snapshot();
      return { tick: after.state.clock.tick, stateVersion: after.state.stateVersion, results, eventResults };
    },
  };
}
