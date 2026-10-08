import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import { resolveNpcSpecialization, validateNpcSpecialization } from "./npc-specialized-agent";

function observation(decisionProfile?: Record<string, unknown>): RuntimeObservation {
  return {
    id: "specialization-observation",
    surface: "game",
    intelligence: "npc",
    state: {
      worldId: "world-1",
      clock: { tick: 1, day: 1, hour: 12, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "state-1",
    },
    perception: {
      self: {
        id: "npc-1",
        kind: "npc",
        mapId: "region-1",
        position: { x: 0, y: 0 },
        state: decisionProfile ? { decisionProfile } : {},
      },
      nearbyEntities: [],
      detections: [],
      visibleMapIds: ["region-1"],
      environment: { activeRegionId: "region-1" },
    },
    facts: [],
  };
}

describe("NPC specialized agents", () => {
  it("maps a guard to the security specialization without replacing runtime arbitration", () => {
    const agent = resolveNpcSpecialization(observation({ archetype: "military", role: "guard" }));
    expect(agent.specialization.id).toBe("security");
    expect(agent.specialization.role).toBe("guard");
    expect(agent.specialization.preferredGoals).toContain("respond-to-event");
    expect(agent.specialization.preferredBehaviors).toContain("investigate");
    expect(agent.canUseGoal("respond-to-event")).toBe(true);
    expect(agent.canUseGoal("eat")).toBe(false);
  });

  it("maps a farmer to production preferences while respecting archetype capabilities", () => {
    const agent = resolveNpcSpecialization(observation({ archetype: "production", role: "farmer" }));
    expect(agent.specialization.id).toBe("production");
    expect(agent.specialization.preferredGoals).toEqual(["work", "eat", "sleep"]);
    expect(agent.specialization.coordinationTags).toEqual(["production", "food"]);
    expect(agent.canUseBehavior("work")).toBe(true);
  });

  it("does not invent permissions for an unsupported custom profile", () => {
    const agent = resolveNpcSpecialization(observation({ archetype: "custom", role: "custom" }));
    expect(agent.specialization.id).toBe("custom");
    expect(agent.specialization.allowedGoals).toEqual([]);
    expect(agent.specialization.allowedBehaviors).toEqual([]);
    expect(agent.canUseGoal("work")).toBe(false);
  });

  it("rejects a profile whose role is incompatible with its archetype", () => {
    const result = validateNpcSpecialization(observation({ archetype: "merchant", role: "guard" }));
    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.includes("not compatible"))).toBe(true);
  });

  it("adds continuity weight without selecting the goal", () => {
    const agent = resolveNpcSpecialization(observation({ archetype: "military", role: "scout" }));
    expect(agent.continuityWeight("respond-to-event")).toBe(2);
    expect(agent.continuityWeight("work")).toBe(0);
    expect(agent.continuityWeight("respond-to-event", {
      npcId: "npc-1",
      stateVersion: "state-0",
      lastGoal: "respond-to-event",
      updatedAtTick: 0,
    })).toBe(7);
  });
});
