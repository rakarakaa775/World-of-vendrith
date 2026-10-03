import { describe, expect, it } from "vitest";
import type { RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import { createNpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import { createRuntimeObservationPort } from "./runtime-observation";
import { runNpcRuntimeTick } from "./npc-runtime-loop";
import {
  createRuntimeWorldActionPort,
  createRuntimeWorldObservationSource,
  createRuntimeWorldVerificationPort,
  type RuntimeWorldStore,
} from "./runtime-world-adapter";

function makeStore(): RuntimeWorldStore {
  let snapshot = {
    state: {
      worldId: "world-1",
      clock: { tick: 1, day: 1, hour: 8, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "state-1",
    },
    entities: [
      { id: "npc-1", kind: "npc" as const, mapId: "region-1", position: { x: 0, y: 0 } },
      { id: "player-1", kind: "player" as const, mapId: "region-1", position: { x: 2, y: 0 }, state: { blocksMovement: false } },
    ],
  };
  const grid: NavigationGrid = { width: 4, height: 4, blocked: Array(16).fill(false) };
  return {
    snapshot: () => snapshot,
    grid: () => grid,
    updateEntity(entity: RuntimeEntity) {
      snapshot = { ...snapshot, entities: snapshot.entities.map(candidate => candidate.id === entity.id ? entity : candidate), state: { ...snapshot.state, stateVersion: "state-2" } };
    },
  };
}
describe("npc runtime loop", () => {
  it("runs observe -> behavior -> navigation -> execute -> verify for one tick", async () => {
    const store = makeStore();
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };
    const request = {
      id: "npc-tick-1",
      surface: "game" as const,
      intelligence: "npc" as const,
      goal: "Follow the visible player",
      observation: {} as RuntimeObservation,
    };

    const result = await runNpcRuntimeTick(request, ports, store);

    expect(result.status).toBe("moved");
    expect(result.behavior?.kind).toBe("follow-player");
    expect(result.execution?.ok).toBe(true);
    expect(result.verification?.ok).toBe(true);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.position).toEqual({ x: 1, y: 0 });
  });

  it("navigates from explicit investigation memory after the detected target disappears", async () => {
    const store = makeStore();
    const snapshot = store.snapshot();
    const originalUpdate = store.updateEntity.bind(store);
    store.snapshot = () => ({
      ...snapshot,
      state: {
        ...snapshot.state,
        environmentConditions: {
          npc_sensing: { hearing_radius: 8 },
          npc_detection_behavior: {
            hearing: { investigate: { reason: "Investigate explicit sound evidence." } },
          },
        },
        stateVersion: "state-1",
      },
      entities: snapshot.entities.map(entity => entity.id === "player-1"
        ? { ...entity, state: { blocksMovement: false, sensory_stimuli: { visibility: false, hearing_radius: 8 } } }
        : entity),
    });
    store.updateEntity = (entity: RuntimeEntity) => {
      originalUpdate(entity);
      if (entity.id === "npc-1") {
        snapshot.entities = snapshot.entities
          .filter(candidate => candidate.id !== "player-1")
          .map(candidate => candidate.id === entity.id ? entity : candidate);
        snapshot.state = { ...snapshot.state, stateVersion: "state-2" };
      }
    };
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };
    const memory = createNpcBehaviorMemoryStore();
    const request = {
      id: "npc-investigate-1",
      surface: "game" as const,
      intelligence: "npc" as const,
      goal: "Investigate explicit sound evidence",
      observation: {} as RuntimeObservation,
    };

    const first = await runNpcRuntimeTick(request, ports, store, memory);
    expect(first.status).toBe("moved");
    expect(first.behavior?.kind).toBe("investigate");
    expect(memory.get("npc-1")?.targetEntityId).toBe("player-1");

    const second = await runNpcRuntimeTick({ ...request, id: "npc-investigate-2" }, ports, store, memory);
    expect(second.status).toBe("moved");
    expect(second.behavior?.kind).toBe("investigate");
    expect(second.execution?.ok).toBe(true);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.position).toEqual({ x: 2, y: 0 });
  });

  it("re-observes the new state version on the next tick", async () => {
    const store = makeStore();
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };
    const request = {
      id: "npc-tick-2",
      surface: "game" as const,
      intelligence: "npc" as const,
      goal: "Follow the visible player",
      observation: {} as RuntimeObservation,
    };

    const first = await runNpcRuntimeTick(request, ports, store);
    expect(first.observation.state.stateVersion).toBe("state-1");
    const second = await runNpcRuntimeTick({ ...request, id: "npc-tick-3" }, ports, store);

    expect(second.observation.state.stateVersion).toBe("state-2");
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.position).toEqual({ x: 2, y: 0 });
  });

  it("preserves investigation memory when navigation has no path", async () => {
    const store = makeStore();
    const snapshot = store.snapshot();
    store.snapshot = () => ({ ...snapshot, entities: snapshot.entities.filter(entity => entity.id === "npc-1") });
    store.grid = () => ({ width: 4, height: 4, blocked: Array(16).fill(true) });
    const memory = createNpcBehaviorMemoryStore();
    memory.set({
      npcId: "npc-1", stateVersion: "state-1", lastBehavior: "investigate",
      targetEntityId: "player-1", lastKnownTargetPosition: { x: 2, y: 0 }, updatedAtTick: 1,
    });
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };

    const result = await runNpcRuntimeTick({
      id: "npc-recovery-nav-failure", surface: "game", intelligence: "npc",
      goal: "Investigate the last known position", observation: {} as RuntimeObservation,
    }, ports, store, memory);

    expect(result.status).toBe("replan-required");
    expect(memory.get("npc-1")?.lastKnownTargetPosition).toEqual({ x: 2, y: 0 });
  });

  it("preserves investigation memory when action execution fails", async () => {
    const store = makeStore();
    const snapshot = store.snapshot();
    store.snapshot = () => ({ ...snapshot, entities: snapshot.entities.filter(entity => entity.id === "npc-1") });
    const memory = createNpcBehaviorMemoryStore();
    memory.set({
      npcId: "npc-1", stateVersion: "state-1", lastBehavior: "investigate",
      targetEntityId: "player-1", lastKnownTargetPosition: { x: 2, y: 0 }, updatedAtTick: 1,
    });
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: { execute: async action => ({ ok: false, actionId: action.id, stateVersion: "state-1", detail: "movement rejected" }) },
      verification: { verify: async () => ({ ok: false, checks: [] }) },
    };

    const result = await runNpcRuntimeTick({
      id: "npc-recovery-execution-failure", surface: "game", intelligence: "npc",
      goal: "Investigate the last known position", observation: {} as RuntimeObservation,
    }, ports, store, memory);

    expect(result.status).toBe("rejected");
    expect(result.execution?.ok).toBe(false);
    expect(memory.get("npc-1")?.lastKnownTargetPosition).toEqual({ x: 2, y: 0 });
  });

  it("preserves investigation memory when verification fails, then clears it after later successful arrival", async () => {
    const store = makeStore();
    const snapshot = store.snapshot();
    store.snapshot = () => ({ ...snapshot, entities: snapshot.entities.filter(entity => entity.id === "npc-1") });
    const memory = createNpcBehaviorMemoryStore();
    memory.set({
      npcId: "npc-1", stateVersion: "state-1", lastBehavior: "investigate",
      targetEntityId: "player-1", lastKnownTargetPosition: { x: 1, y: 0 }, updatedAtTick: 1,
    });
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const failingPorts = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(store),
      verification: { verify: async () => ({ ok: false, checks: [] }) },
    };

    const failed = await runNpcRuntimeTick({
      id: "npc-recovery-verification-failure", surface: "game", intelligence: "npc",
      goal: "Investigate the last known position", observation: {} as RuntimeObservation,
    }, failingPorts, store, memory);

    expect(failed.status).toBe("rejected");
    expect(failed.execution?.ok).toBe(true);
    expect(failed.verification?.ok).toBe(false);
    expect(memory.get("npc-1")?.lastKnownTargetPosition).toEqual({ x: 1, y: 0 });

    const successfulStore = makeStore();
    let successfulSnapshot = successfulStore.snapshot();
    successfulSnapshot = {
      ...successfulSnapshot,
      entities: successfulSnapshot.entities.filter(entity => entity.id === "npc-1"),
    };
    successfulStore.snapshot = () => successfulSnapshot;
    successfulStore.updateEntity = (entity: RuntimeEntity) => {
      successfulSnapshot = {
        ...successfulSnapshot,
        entities: successfulSnapshot.entities.map(candidate => candidate.id === entity.id ? entity : candidate),
        state: { ...successfulSnapshot.state, stateVersion: "state-2" },
      };
    };
    const successfulObservation = createRuntimeObservationPort(createRuntimeWorldObservationSource(successfulStore));
    const successfulPorts = {
      observation: successfulObservation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(successfulStore),
      verification: createRuntimeWorldVerificationPort(successfulStore),
    };

    const recovered = await runNpcRuntimeTick({
      id: "npc-recovery-success", surface: "game", intelligence: "npc",
      goal: "Investigate the last known position", observation: {} as RuntimeObservation,
    }, successfulPorts, successfulStore, memory);

    expect(recovered.status).toBe("moved");
    expect(recovered.verification?.ok).toBe(true);
    expect(memory.get("npc-1")).toBeUndefined();
  });
});
