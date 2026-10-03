import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { createNpcGoalCandidates, decideNpcGoal } from "./npc-goals";
import { createNpcGoalMemoryStore } from "../domain/runtime-goal";

const observation: RuntimeObservation = {
  id: "obs-goal",
  surface: "game",
  intelligence: "npc",
  state: {
    worldId: "world-1",
    clock: { tick: 20, day: 1, hour: 12, minute: 0, season: "spring" },
    activeEventIds: ["event-1"],
    stateVersion: "state-20",
  },
  perception: {
    self: {
      id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 2, y: 2 },
      state: {
        decisionProfile: {
          archetype: "civilian",
          schedule: {
            npcId: "npc-1",
            entries: [{ goal: "work", startHour: 8, endHour: 12, priority: 40, location: { mapId: "town", x: 10, y: 4 } }],
          },
        },
      },
    },
    nearbyEntities: [],
    visibleMapIds: ["region-1"],
    environment: { activeRegionId: "region-1" },
  },
  facts: [],
};
const request: RuntimeAiRequest = {
  id: "runtime-goal",
  surface: "game",
  intelligence: "npc",
  observation,
  goal: "Choose the next NPC goal.",
};

describe("NPC goals", () => {
  it("prioritizes a critical safety need", () => {
    const goals = createNpcGoalCandidates(observation, { hunger: 20, energy: 20, social: 20, safety: 5 });
    expect(goals[0].kind).toBe("respond-to-event");
    expect(goals[0].priority).toBeGreaterThan(100);
  });

  it("adds the active scheduled goal with its explicit location and priority", () => {
    const scheduled = {
      ...observation,
      state: { ...observation.state, activeEventIds: [], clock: { ...observation.state.clock, hour: 9 } },
    };
    const goals = createNpcGoalCandidates(scheduled, { hunger: 10, energy: 10, social: 20, safety: 90 });
    expect(goals[0]).toMatchObject({
      kind: "work",
      priority: 58,
      targetLocation: { mapId: "town", x: 10, y: 4 },
    });
  });

  it("selects eating when hunger is highest", () => {
    const quiet = {
      ...observation,
      state: { ...observation.state, activeEventIds: [] },
    };
    const decision = decideNpcGoal(
      { ...request, observation: quiet },
      quiet,
      { hunger: 95, energy: 10, social: 20, safety: 80 },
    );
    expect(decision.actions[0].type).toBe("npc.eat");
    expect(decision.expiresAtTick).toBe(25);
  });

  it("remembers the selected goal across ticks", () => {
    const store = createNpcGoalMemoryStore();
    decideNpcGoal(request, observation, { hunger: 10, energy: 10, social: 10, safety: 90 }, undefined, store);
    expect(store.get("npc-1")?.lastGoal).toBe("respond-to-event");
    expect(store.get("npc-1")?.stateVersion).toBe("state-20");
  });

  it("binds the goal decision to the authoritative state version", () => {
    const decision = decideNpcGoal(request, observation, { hunger: 80, energy: 20, social: 20, safety: 90 });
    expect(decision.stateVersion).toBe("state-20");
    expect(decision.observationId).toBe("obs-goal");
  });
});
