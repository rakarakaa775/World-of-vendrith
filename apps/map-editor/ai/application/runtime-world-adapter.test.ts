import { describe, expect, it } from "vitest";
import type { RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import { createRuntimeObservationPort } from "./runtime-observation";
import { createRuntimeOrchestrator } from "./runtime-orchestrator";
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
      { id: "player-1", kind: "player" as const, mapId: "region-1", position: { x: 2, y: 0 } },
    ],
  };
  const grid: NavigationGrid = { width: 4, height: 4, blocked: Array(16).fill(false) };

  return {
    snapshot: () => snapshot,
    grid: () => grid,
    updateEntity(entity: RuntimeEntity) {      snapshot = {
        ...snapshot,
        entities: snapshot.entities.map(candidate => candidate.id === entity.id ? entity : candidate),
        state: { ...snapshot.state, stateVersion: "state-2" },
      };
    },
  };
}

describe("runtime world adapter", () => {
  it("uses environment visibility_radius for nearby perception", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({ ...base.snapshot(), state: { ...base.snapshot().state, environmentConditions: { visibility_radius: 1 } } }),
    };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-visibility", surface: "game", intelligence: "npc", goal: "Observe", observation: {} as RuntimeObservation });
    expect(observation.perception?.nearbyEntities).toHaveLength(0);
  });

  it("turns the authoritative world store into a perception snapshot", async () => {
    const store = makeStore();
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const request = {
      id: "runtime-1",
      surface: "game" as const,
      intelligence: "npc" as const,
      goal: "Move",
      observation: {} as RuntimeObservation,
    };

    const observation = await port.observe(request);
    expect(observation.state.stateVersion).toBe("state-1");
    expect(observation.perception?.self?.id).toBe("npc-1");
    expect(observation.perception?.nearbyEntities[0].id).toBe("player-1");
  });

  it("executes npc movement through the runtime action boundary and verifies it", async () => {
    const store = makeStore();
    const observation = await createRuntimeObservationPort(
      createRuntimeWorldObservationSource(store),
    ).observe({      id: "runtime-2",
      surface: "game",
      intelligence: "npc",
      goal: "Move toward player",
      observation: {} as RuntimeObservation,
    });

    const action = {
      id: "move-1",
      intelligence: "npc" as const,
      type: "npc.navigate",
      payload: {
        entityId: "npc-1",
        path: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
      },
      risk: "safe" as const,
      reason: "Follow the player.",
    };

    const decision = {
      id: "decision-1",
      observationId: observation.id,
      stateVersion: observation.state.stateVersion,
      actions: [action],
      evidence: [],
    };

    const result = await createRuntimeOrchestrator({
      observation: { observe: async () => observation },
      decision: { decide: async () => decision },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    }).run({      id: "runtime-2",
      surface: "game",
      intelligence: "npc",
      goal: "Move toward player",
      observation,
    });

    expect(result.executions[0]).toMatchObject({
      actionId: "move-1",
      executed: true,
      ok: true,
    });
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.position)
      .toEqual({ x: 1, y: 0 });
    expect(store.snapshot().state.stateVersion).toBe("state-2");
  });
});
