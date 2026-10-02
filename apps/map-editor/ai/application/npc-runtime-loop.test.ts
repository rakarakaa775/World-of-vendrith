import { describe, expect, it } from "vitest";
import type { RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
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
});
