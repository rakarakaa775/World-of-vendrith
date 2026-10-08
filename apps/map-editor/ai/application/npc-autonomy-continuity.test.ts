import { describe, expect, it } from "vitest";
import type { RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import { createNpcNeedsStore } from "../domain/runtime-npc-needs";
import { createNpcActivityEffectStore } from "../domain/runtime-npc-activity-effects";
import { createRuntimeObservationPort } from "./runtime-observation";
import { runNpcRuntimeTick } from "./npc-runtime-loop";
import {
  createRuntimeWorldActionPort,
  createRuntimeWorldObservationSource,
  createRuntimeWorldVerificationPort,
  type RuntimeWorldStore,
} from "./runtime-world-adapter";

function makeContinuityStore(): RuntimeWorldStore {
  let snapshot = {
    state: {
      worldId: "world-1",
      clock: { tick: 1, day: 1, hour: 8, minute: 0, season: "spring" },
      activeEventIds: [],
      environmentConditions: {
        npc_activity_duration: { eat: 2 },
        npc_activity_effects: { eat: { hunger: -30 } },
      },
      stateVersion: "state-1",
    },
    entities: [
      {
        id: "npc-1",
        kind: "npc" as const,
        mapId: "region-1",
        position: { x: 0, y: 0 },
        state: {
          npcNeeds: { hunger: 95, energy: 20, social: 20, safety: 90 },
          decisionProfile: {
            archetype: "civilian",
            capabilities: { goals: ["eat", "work"], behaviors: ["eat", "work"] },
          },
        },
      },
    ],
  };
  const grid: NavigationGrid = { width: 4, height: 4, blocked: Array(16).fill(false) };

  return {
    snapshot: () => snapshot,
    grid: () => grid,
    updateEntity(entity: RuntimeEntity) {
      snapshot = {
        ...snapshot,
        entities: snapshot.entities.map(candidate => candidate.id === entity.id ? entity : candidate),
        state: {
          ...snapshot.state,
          stateVersion: "state-" + (snapshot.state.clock.tick + 1),
        },
      };
    },
  };
}

describe("npc autonomous continuity", () => {
  it("carries needs, activity memory, goal memory, and verified effects across ticks deterministically", async () => {
    const store = makeContinuityStore();
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("decision port should not be used by the specialized NPC loop"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };
    const needsStore = createNpcNeedsStore();
    const activityEffectStore = createNpcActivityEffectStore();
    const request = {
      surface: "game" as const,
      intelligence: "npc" as const,
      goal: "Autonomous NPC tick",
      observation: {} as RuntimeObservation,
    };

    const first = await runNpcRuntimeTick(
      { ...request, id: "npc-continuity-1" },
      ports,
      store,
      undefined,
      undefined,
      undefined,
      needsStore,
      activityEffectStore,
    );

    expect(first.observation.state.clock.tick).toBe(1);
    expect(first.autonomy).toMatchObject({ goal: "eat", actionBudget: { requested: 1, allowed: 1, blocked: 0 } });
    expect(first.behavior?.kind).toBe("eat");
    expect(first.execution?.ok).toBe(true);
    expect(first.verification?.ok).toBe(true);
    expect(first.activityEffect?.applied).toBe(false);
    expect(first.activityEffect?.reason).toBe("Activity is still running.");
    expect(needsStore.get("npc-1")?.needs).toEqual({ hunger: 95, energy: 20, social: 20, safety: 90 });
    expect(store.snapshot().entities[0].state?.npcActivity).toMatchObject({
      goal: "eat",
      status: "started",
      elapsedTicks: 1,
    });

    const snapshotBeforeTickTwo = store.snapshot.bind(store);
    store.snapshot = () => {
      const current = snapshotBeforeTickTwo();
      return {
        ...current,
        state: {
          ...current.state,
          clock: { ...current.state.clock, tick: 2 },
          stateVersion: "state-2",
        },
      };
    };

    const second = await runNpcRuntimeTick(
      { ...request, id: "npc-continuity-2" },
      ports,
      store,
      undefined,
      undefined,
      undefined,
      needsStore,
      activityEffectStore,
    );

    expect(second.observation.state.clock.tick).toBe(2);
    expect(second.autonomy?.goal).toBe("eat");
    expect(second.execution?.ok).toBe(true);
    expect(second.verification?.ok).toBe(true);
    expect(second.activityEffect).toMatchObject({ applied: true, goal: "eat" });
    expect(needsStore.get("npc-1")?.needs).toEqual({ hunger: 65, energy: 20, social: 20, safety: 90 });
    expect(store.snapshot().entities[0].state?.npcActivity).toMatchObject({
      goal: "eat",
      status: "completed",
      elapsedTicks: 2,
    });

    const snapshotBeforeTickThree = store.snapshot.bind(store);
    store.snapshot = () => {
      const current = snapshotBeforeTickThree();
      return {
        ...current,
        state: {
          ...current.state,
          clock: { ...current.state.clock, tick: 3 },
          stateVersion: "state-3",
        },
      };
    };

    const third = await runNpcRuntimeTick(
      { ...request, id: "npc-continuity-3" },
      ports,
      store,
      undefined,
      undefined,
      undefined,
      needsStore,
      activityEffectStore,
    );

    expect(third.observation.state.clock.tick).toBe(3);
    expect(third.autonomy?.goal).toBe("work");
    expect(third.behavior?.kind).toBe("work");
    expect(third.execution?.ok).toBe(true);
    expect(third.verification?.ok).toBe(true);
    expect(needsStore.get("npc-1")?.needs).toEqual({ hunger: 65, energy: 20, social: 20, safety: 90 });
  });
});
