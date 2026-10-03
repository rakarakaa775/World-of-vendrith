import type { RuntimeEntity } from "../domain/runtime";
import type { RuntimeScheduledEvent } from "../domain/runtime-clock";
import { advanceGameClock } from "../domain/runtime-clock";
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
  advanceClock(minutes?: number, events?: RuntimeScheduledEvent[]): void;
}

type MutableRuntimeWorldStore = RuntimeWorldStore & { __replaceState(state: RuntimeWorldSnapshot["state"], entities: RuntimeEntity[]): void };

function createBridgeStore(initial: { snapshot: RuntimeWorldSnapshot; grid: NavigationGrid }, mapId: string): MutableRuntimeWorldStore {
  const engineStateVersion = initial.snapshot.state.stateVersion.replace(/:runtime:\d+$/, "");
  let snapshot: RuntimeWorldSnapshot = {
    state: { ...initial.snapshot.state, clock: { ...initial.snapshot.state.clock } },
    entities: initial.snapshot.entities.map(entity => ({ ...entity, position: { ...entity.position }, state: entity.state ? { ...entity.state } : undefined })),
  };
  const grids = new Map([[mapId, initial.grid]]);

  const replaceState = (state: RuntimeWorldSnapshot["state"], entities: RuntimeEntity[]) => { snapshot = { state, entities }; };
  return {
    snapshot: () => snapshot,
    grid: (mapId) => grids.get(mapId),
    __replaceState: replaceState,
    updateEntity(entity: RuntimeEntity) {
      const index = snapshot.entities.findIndex(candidate => candidate.id === entity.id);
      if (index < 0) return;
      const entities = [...snapshot.entities];
      entities[index] = { ...entity, position: { ...entity.position }, state: entity.state ? { ...entity.state } : undefined };
      const nextTick = snapshot.state.clock.tick;
      snapshot = {
        state: {
          ...snapshot.state,
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
    advanceClock(minutes = 1, events = []) {
      const advanced = advanceGameClock(store.snapshot().state, minutes, events);
      const current = store.snapshot();
      const nextState = { ...current.state, clock: advanced.clock, activeEventIds: advanced.activeEventIds, stateVersion: advanced.stateVersion };
      const entities = current.entities.map(entity => ({ ...entity, position: { ...entity.position }, state: entity.state ? { ...entity.state } : undefined }));
      (store as MutableRuntimeWorldStore).__replaceState(nextState, entities);
    },
  };
}
