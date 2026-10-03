import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { createNpcGoalCandidates, decideNpcGoal } from "./npc-goals";
import { createNpcGoalMemoryStore } from "../domain/runtime-goal";
import { createNpcRelationshipMemoryStore } from "./npc-social-interaction-schema";

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

  it("creates a deterministic social goal for an elevated social need", () => {
    const socialObservation = {
      ...observation,
      id: "obs-social-goal",
      perception: {
        ...observation.perception!,
        nearbyEntities: [
          { id: "npc-friend", kind: "npc" as const, mapId: "region-1", position: { x: 3, y: 2 } },
          { id: "npc-neutral", kind: "npc" as const, mapId: "region-1", position: { x: 4, y: 2 } },
        ],
        self: {
          ...observation.perception!.self,
          state: {
            decisionProfile: {
              relationships: [
                { targetNpcId: "npc-neutral", type: "neutral" as const, affinity: 10, trust: 10 },
                { targetNpcId: "npc-friend", type: "friend" as const, affinity: 80, trust: 70 },
              ],
            },
          },
        },
      },
    };
    const goals = createNpcGoalCandidates(socialObservation, { hunger: 10, energy: 10, social: 90, safety: 90 });
    expect(goals.find(goal => goal.kind === "socialize")).toMatchObject({ targetNpcId: "npc-friend", socialInteractionType: "help" });
  });

  it("uses persistent relationship memory when selecting a social target", () => {
    const socialObservation = {
      ...observation,
      state: { ...observation.state, activeEventIds: [] },
      perception: {
        ...observation.perception!,
        nearbyEntities: [
          { id: "npc-a", kind: "npc" as const, mapId: "region-1", position: { x: 3, y: 2 } },
          { id: "npc-b", kind: "npc" as const, mapId: "region-1", position: { x: 4, y: 2 } },
        ],
        self: {
          ...observation.perception!.self,
          state: {
            decisionProfile: {
              relationships: [
                { targetNpcId: "npc-a", type: "friend" as const, affinity: 40, trust: 40 },
                { targetNpcId: "npc-b", type: "friend" as const, affinity: 40, trust: 40 },
              ],
            },
          },
        },
      },
    };
    const memory = createNpcRelationshipMemoryStore();
    memory.set({ sourceNpcId: "npc-1", targetNpcId: "npc-a", interactionCount: 20, affinityDeltaTotal: 0, trustDeltaTotal: 0 });
    const goals = createNpcGoalCandidates(socialObservation, { hunger: 10, energy: 10, social: 90, safety: 90 }, memory);
    expect(goals.find(goal => goal.kind === "socialize")?.targetNpcId).toBe("npc-a");
  });

  it("creates an evacuation goal for an explicitly tagged nearby shelter", () => {
    const hazardous = {
      ...observation,
      state: {
        ...observation.state,
        activeEventIds: [],
        weather: "storm",
        environmentConditions: {
          hazards: ["storm"],
          available_resources: ["shelter"],
        },
      },
      perception: {
        ...observation.perception!,
        nearbyEntities: [
          {
            id: "shelter-1",
            kind: "object" as const,
            mapId: "region-1",
            position: { x: 4, y: 2 },
            state: { worldResource: "shelter", regionId: "region-1" },
          },
        ],
        environment: {
          ...observation.perception!.environment!,
          weather: "storm",
          activeRegionId: "region-1",
          conditions: { hazards: ["storm"], available_resources: ["shelter"] },
        },
      },
    };
    const goals = createNpcGoalCandidates(hazardous, { hunger: 10, energy: 10, social: 10, safety: 90 });
    expect(goals.find(goal => goal.kind === "go-to-location")).toMatchObject({
      targetLocation: { mapId: "region-1", x: 4, y: 2 },
    });
  });

  it("creates a resource navigation goal for a required water location", () => {
    const resourceObservation = {
      ...observation,
      state: {
        ...observation.state,
        activeEventIds: [],
        environmentConditions: {
          available_resources: ["water"],
          required_resources: ["water"],
        },
      },
      perception: {
        ...observation.perception!,
        nearbyEntities: [
          {
            id: "well-1",
            kind: "object" as const,
            mapId: "region-1",
            position: { x: 4, y: 2 },
            state: { worldResource: "water", regionId: "region-1" },
          },
        ],
        environment: {
          ...observation.perception!.environment!,
          activeRegionId: "region-1",
          conditions: { available_resources: ["water"], required_resources: ["water"] },
        },
      },
    };
    const goals = createNpcGoalCandidates(resourceObservation, { hunger: 10, energy: 10, social: 10, safety: 90 });
    expect(goals.find(goal => goal.kind === "go-to-location")).toMatchObject({
      targetLocation: { mapId: "region-1", x: 4, y: 2 },
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
