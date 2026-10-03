import type { RuntimeAiRequest } from "../domain/runtime";
import type { RuntimeScheduledEvent } from "../domain/runtime-clock";
import { createNpcBehaviorMemoryStore, type NpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import { runNpcRuntimeTick, type NpcRuntimeTickResult } from "./npc-runtime-loop";
import { createSupabaseRuntimeWorldBridge, type SupabaseRuntimeWorldBridge } from "./supabase-runtime-world-bridge";
import type { SupabaseRuntimeWorldAdapter } from "./supabase-runtime-world-adapter";

export interface SupabaseRuntimeEngine {
  readonly mapId: string;
  readonly bridge: SupabaseRuntimeWorldBridge;
  readonly memory: NpcBehaviorMemoryStore;
  tick(events?: RuntimeScheduledEvent[], minutesPerTick?: number): Promise<SupabaseRuntimeEngineTickResult>;
}

export interface SupabaseRuntimeEngineTickResult {
  tick: number;
  stateVersion: string;
  results: NpcRuntimeTickResult[];
}

export async function createSupabaseRuntimeEngine(
  adapter: SupabaseRuntimeWorldAdapter,
  mapId: string,
): Promise<SupabaseRuntimeEngine | undefined> {
  const loaded = await adapter.load(mapId);
  if (!loaded) return undefined;
  const bridge = await createSupabaseRuntimeWorldBridge({ async load() { return loaded; } }, mapId);
  if (!bridge) return undefined;
  const memory = createNpcBehaviorMemoryStore();

  return {
    mapId,
    bridge,
    memory,
    async tick(events = [], minutesPerTick = 1) {
      const effectiveEvents = events.length > 0 ? events : loaded.scheduledEvents;
      bridge.advanceClock(minutesPerTick, effectiveEvents);
      const initial = bridge.snapshot();
      const npcs = initial.entities.filter(entity => entity.kind === "npc" && entity.mapId === mapId);
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
        results.push(await runNpcRuntimeTick(request, bridge.ports, bridge.store, memory));
      }

      const after = bridge.snapshot();
      return { tick: after.state.clock.tick, stateVersion: after.state.stateVersion, results };
    },
  };
}
