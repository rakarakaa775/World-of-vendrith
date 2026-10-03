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
  it("detects an explicitly visible entity within visibility radius", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        entities: base.snapshot().entities.map(entity =>
          entity.id === "player-1" ? { ...entity, state: { sensory_stimuli: { visibility: true } } } : entity,
        ),
      }),
    };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-visible-detection", surface: "game", intelligence: "npc", goal: "Observe", observation: {} as RuntimeObservation });
    expect(observation.perception?.nearbyEntities.map(entity => entity.id)).toEqual(["player-1"]);
  });

  it("detects explicit hearing and smell stimuli using environment sensing", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        state: { ...base.snapshot().state, environmentConditions: { npc_sensing: { hearing_radius: 4, smell_radius: 3, detection_modifier: 2 } } },
        entities: base.snapshot().entities.map(entity =>
          entity.id === "player-1" ? { ...entity, position: { x: 7, y: 0 }, state: { sensory_stimuli: { hearing_radius: 1, smell_radius: 1 } } } : entity,
        ),
      }),
    };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-sound-detection", surface: "game", intelligence: "npc", goal: "Sense", observation: {} as RuntimeObservation });
    expect(observation.perception?.nearbyEntities.map(entity => entity.id)).toEqual(["player-1"]);
  });

  it("does not detect entities without explicit stimuli outside visibility", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        entities: base.snapshot().entities.map(entity =>
          entity.id === "player-1" ? { ...entity, position: { x: 9, y: 0 } } : entity,
        ),
      }),
    };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-undetected", surface: "game", intelligence: "npc", goal: "Sense", observation: {} as RuntimeObservation });
    expect(observation.perception?.nearbyEntities).toHaveLength(0);
  });

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

  it("applies explicit npc sensing environment rules", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        state: { ...base.snapshot().state, environmentConditions: { npc_sensing: { hearing_radius: 20, smell_radius: 12, detection_modifier: 1.5 } } },
      }),
    };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-sensing", surface: "game", intelligence: "npc", goal: "Sense", observation: {} as RuntimeObservation });
    expect(observation.perception?.sensing).toEqual({ hearingRadius: 20, smellRadius: 12, detectionModifier: 1.5 });
  });

  it("ignores weather alone when no sensing rule is configured", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = { ...base, snapshot: () => ({ ...base.snapshot(), state: { ...base.snapshot().state, weather: "rain" } }) };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-weather-sensing", surface: "game", intelligence: "npc", goal: "Sense", observation: {} as RuntimeObservation });
    expect(observation.perception?.sensing).toEqual({ hearingRadius: 8, smellRadius: 8, detectionModifier: 1 });
  });

  it("clamps malformed or extreme sensing values", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({ ...base.snapshot(), state: { ...base.snapshot().state, environmentConditions: { npc_sensing: { hearing_radius: -4, smell_radius: 100, detection_modifier: 9 } } } }),
    };
    const port = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const observation = await port.observe({ id: "runtime-sensing-clamp", surface: "game", intelligence: "npc", goal: "Sense", observation: {} as RuntimeObservation });
    expect(observation.perception?.sensing).toEqual({ hearingRadius: 0, smellRadius: 64, detectionModifier: 4 });
  });

  it("turns the authoritative world store into a perception snapshot", async () => {
    const base = makeStore();
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        entities: base.snapshot().entities.map(entity =>
          entity.id === "player-1" ? { ...entity, state: { sensory_stimuli: { visibility: true } } } : entity,
        ),
      }),
    };
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

  it("executes and verifies a supported NPC activity", async () => {
    const store = makeStore();
    const action = {
      id: "activity-eat-1",
      intelligence: "npc" as const,
      type: "npc.activity",
      payload: { entityId: "npc-1", goal: "eat" },
      risk: "game-rule" as const,
      reason: "Eat.",
    };

    const result = await createRuntimeWorldActionPort(store).execute(action, {} as RuntimeObservation);
    const verification = await createRuntimeWorldVerificationPort(store).verify(action, result);

    expect(result.ok).toBe(true);
    expect(verification.ok).toBe(true);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ actionId: "activity-eat-1", goal: "eat", completedAtTick: 1 });
  });

  it("keeps a multi-tick NPC activity stable until its configured duration completes", async () => {
    const base = makeStore();
    let tick = 1;
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        state: {
          ...base.snapshot().state,
          clock: { ...base.snapshot().state.clock, tick },
          environmentConditions: { npc_activity_duration: { eat: 3 } },
        },
      }),
    };
    const port = createRuntimeWorldActionPort(store);
    const verificationPort = createRuntimeWorldVerificationPort(store);
    const action = {
      id: "activity-eat-duration",
      intelligence: "npc" as const,
      type: "npc.activity",
      payload: { entityId: "npc-1", goal: "eat" },
      risk: "game-rule" as const,
      reason: "Eat.",
    };

    const first = await port.execute(action, {} as RuntimeObservation);
    const firstVerification = await verificationPort.verify(action, first);
    expect(first.ok).toBe(true);
    expect(first.detail).toContain("running");
    expect(firstVerification.ok).toBe(true);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ actionId: action.id, goal: "eat", status: "started", startedAtTick: 1, updatedAtTick: 1 });

    tick = 2;
    const second = await port.execute(action, {} as RuntimeObservation);
    const secondVerification = await verificationPort.verify(action, second);
    expect(second.ok).toBe(true);
    expect(second.detail).toContain("running");
    expect(secondVerification.ok).toBe(true);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ actionId: action.id, goal: "eat", status: "running", startedAtTick: 1, updatedAtTick: 2 });

    tick = 3;
    const third = await port.execute(action, {} as RuntimeObservation);
    const thirdVerification = await verificationPort.verify(action, third);
    expect(third.ok).toBe(true);
    expect(third.detail).toContain("completed");
    expect(thirdVerification.ok).toBe(true);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ actionId: action.id, goal: "eat", status: "completed", startedAtTick: 1, updatedAtTick: 3, completedAtTick: 3 });
  });

  it("pauses an interrupted activity and resumes its remaining duration", async () => {
    const base = makeStore();
    let tick = 1;
    let interrupted = false;
    const store: RuntimeWorldStore = {
      ...base,
      snapshot: () => ({
        ...base.snapshot(),
        state: {
          ...base.snapshot().state,
          clock: { ...base.snapshot().state.clock, tick },
          environmentConditions: { npc_activity_duration: { work: 3 } },
        },
      }),
    };
    const port = createRuntimeWorldActionPort(store);
    const action = {
      id: "activity-work-resume",
      intelligence: "npc" as const,
      type: "npc.activity",
      payload: { entityId: "npc-1", goal: "work" },
      risk: "game-rule" as const,
      reason: "Work.",
    };

    await port.execute(action, {} as RuntimeObservation);
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ status: "started", elapsedTicks: 1 });

    tick = 2;
    const entity = store.snapshot().entities.find(candidate => candidate.id === "npc-1")!;
    store.updateEntity({
      ...entity,
      state: {
        ...(entity.state ?? {}),
        npcActivity: { ...(entity.state?.npcActivity as Record<string, unknown>), status: "interrupted", updatedAtTick: 2 },
      },
    });
    interrupted = true;
    expect(interrupted).toBe(true);

    tick = 3;
    const resumed = await port.execute(action, {} as RuntimeObservation);
    expect(resumed.ok).toBe(true);
    expect(resumed.detail).toContain("running");
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ status: "running", elapsedTicks: 2, startedAtTick: 1 });

    tick = 4;
    const completed = await port.execute(action, {} as RuntimeObservation);
    expect(completed.ok).toBe(true);
    expect(completed.detail).toContain("completed");
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity)
      .toMatchObject({ status: "completed", elapsedTicks: 3, completedAtTick: 4 });
  });

  it("rejects an activity when its configured target has not been reached", async () => {
    const store = makeStore();
    const action = {
      id: "activity-work-1",
      intelligence: "npc" as const,
      type: "npc.activity",
      payload: { entityId: "npc-1", goal: "work", targetLocation: { mapId: "region-1", x: 3, y: 0 } },
      risk: "game-rule" as const,
      reason: "Work.",
    };

    const result = await createRuntimeWorldActionPort(store).execute(action, {} as RuntimeObservation);

    expect(result.ok).toBe(false);
    expect(result.detail).toContain("not arrived");
    expect(store.snapshot().entities.find(entity => entity.id === "npc-1")?.state?.npcActivity).toBeUndefined();
  });
});
