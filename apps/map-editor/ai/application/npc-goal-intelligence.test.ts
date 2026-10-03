import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import type { NpcGoalMemory, RuntimeGoal } from "../domain/runtime-goal";
import { arbitrateNpcGoal } from "./npc-goal-intelligence";

const observation: RuntimeObservation = {
  id: "goal-intelligence-observation",
  surface: "game",
  intelligence: "npc",
  state: {
    worldId: "world-1",
    clock: { tick: 20, day: 1, hour: 12, minute: 0, season: "spring" },
    activeEventIds: [],
    stateVersion: "state-20",
  },
  perception: {
    self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 0, y: 0 }, state: {} },
    nearbyEntities: [],
    visibleMapIds: ["region-1"],
    environment: { activeRegionId: "region-1" },
  },
  facts: [],
};

function goal(kind: RuntimeGoal["kind"], priority: number, expiresAtTick?: number): RuntimeGoal {
  return { kind, priority, reason: kind, ...(expiresAtTick === undefined ? {} : { expiresAtTick }) };
}

const memory: NpcGoalMemory = {
  npcId: "npc-1",
  stateVersion: "state-19",
  lastGoal: "work",
  lastGoalPriority: 50,
  updatedAtTick: 19,
};

describe("NPC goal intelligence", () => {
  it("keeps the remembered goal when a challenger is inside the switch margin", () => {
    const result = arbitrateNpcGoal(observation, [goal("work", 50), goal("eat", 58)], memory);
    expect(result.selected?.kind).toBe("work");
    expect(result.switched).toBe(false);
  });

  it("switches when a challenger exceeds the switch margin", () => {
    const result = arbitrateNpcGoal(observation, [goal("work", 50), goal("eat", 70)], memory);
    expect(result.selected?.kind).toBe("eat");
    expect(result.switched).toBe(true);
  });

  it("filters expired goals before arbitration", () => {
    const result = arbitrateNpcGoal(observation, [goal("work", 100, 19), goal("eat", 50, 20)], memory);
    expect(result.candidates.map(candidate => candidate.kind)).toEqual(["eat"]);
    expect(result.selected?.kind).toBe("eat");
  });

  it("uses a deterministic tie-break order", () => {
    const result = arbitrateNpcGoal(observation, [goal("work", 50), goal("eat", 50), goal("respond-to-event", 50)]);
    expect(result.selected?.kind).toBe("respond-to-event");
  });

  it("gives the remembered goal a small continuity bonus", () => {
    const result = arbitrateNpcGoal(observation, [goal("work", 50), goal("eat", 54)], memory);
    expect(result.selected?.kind).toBe("work");
    expect(result.scores.work).toBe(55);
    expect(result.scores.eat).toBe(54);
  });
});
