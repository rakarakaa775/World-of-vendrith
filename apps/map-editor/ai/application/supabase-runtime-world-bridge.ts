import type { RuntimeEntity } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeAiPorts } from "../ports/runtime";
import { createRuntimeObservationPort } from "./runtime-observation";
import { createRuntimeWorldActionPort, createRuntimeWorldObservationSource, createRuntimeWorldVerificationPort, type RuntimeWorldSnapshot, type RuntimeWorldStore } from "./runtime-world-adapter";
import type { SupabaseRuntimeWorldAdapter } from "./supabase-runtime-world-adapter";

export interface SupabaseRuntimeWorldBridge {
  store: RuntimeWorldStore;
  ports: RuntimeAiPorts;
  snapshot(): RuntimeWorldSnapshot;
  grid(mapId: string): NavigationGrid | undefined;
}

function createBridgeStore(initial: { snapshot: RuntimeWorldSnapshot; grid: NavigationGrid }, mapId: string): RuntimeWorldStore {
  const engineStateVersion = initial.snapshot.state.stateVersion.replace(/:runtime:\d+$/, "");
  let snapshot: RuntimeWorldSnapshot = {
    state: { ...initial.snapshot.state, clock: { ...initial.snapshot.state.clock } },
    entities: initial.snapshot.entities.map(entity => ({ ...entity, position: { ...entity.position }, state: entity.state ? { ...entity.state } : undefined })),
  };
  const grids = new Map([[mapId, initial.grid]]);

  return {
    snapshot: () => snapshot,
    grid: (mapId) => grids.get(mapId),
    updateEntity(entity: RuntimeEntity) {
      const index = snapshot.entities.findIndex(candidate => candidate.id === entity.id);
      if (index < 0) return;
      const entities = [...snapshot.entities];
      entities[index] = { ...entity, position: { ...entity.position }, state: entity.state ? { ...entity.state } : undefined };
      const nextTick = snapshot.state.clock.tick + 1;
      snapshot = {
        state: {
          ...snapshot.state,
          clock: { ...snapshot.state.clock, tick: nextTick },
          stateVersion: `${engineStateVersion}:runtime:${nextTick}`,
        },
        entities,
      };
    },
  };
}

export async function createSupabaseRuntimeWorldBridge(
  adapter: SupabaseRuntimeWorldAdapter,
  mapId: string,
): Promise<SupabaseRuntimeWorldBridge | undefined> {
  const loaded = await adapter.load(mapId);
  if (!loaded) return undefined;

  const store = createBridgeStore(loaded, mapId);
  const observationSource = createRuntimeWorldObservationSource(store);
  const action = createRuntimeWorldActionPort(store);
  const verification = createRuntimeWorldVerificationPort(store);

  return {
    store,
    ports: {
      observation: createRuntimeObservationPort(observationSource),
      decision: { async decide() { throw new Error("Runtime bridge delegates NPC decisions to the runtime behavior/navigation loop."); } },
      action,
      verification,
    },
    snapshot: () => store.snapshot(),
    grid: (id) => store.grid(id),
  };
}
