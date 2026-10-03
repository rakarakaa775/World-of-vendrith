import { describe, expect, it } from "vitest";
import { applyNpcRelationshipBehavior, applyNpcRelationshipGoalPriority } from "./environment-npc-effects";
import { validateNpcRelationshipPolicy } from "./npc-relationship-policy-schema";

const action = { id: "a", intelligence: "npc" as const, type: "npc.follow", payload: { targetEntityId: "npc-2" }, risk: "safe" as const, reason: "follow" };

function observation() {
  return {
    id: "o", state: { stateVersion: "1", clock: { tick: 1 }, activeEventIds: [] },
    perception: {
      self: { id: "npc-1", kind: "npc" as const, position: { x: 0, y: 0 }, state: {
        decisionProfile: {
          archetype: "civilian" as const,
          relationships: [{ targetNpcId: "npc-2", type: "friend" as const, affinity: 80, trust: 70 }],
          relationshipPolicy: { rules: [{ type: "friend" as const, minAffinity: 50, behaviors: { "follow-player": 20 }, goals: { "respond-to-event": 15 } }] },
        },
      },
      },
      nearbyEntities: [],
      detections: [],
    },
    facts: [],
  } as any;
}

describe("NPC relationship policy", () => {
  it("accepts valid ranges and rejects unsupported runtime kinds", () => {
    expect(validateNpcRelationshipPolicy({ rules: [{ type: "friend", minAffinity: 50, maxTrust: 90, behaviors: { "follow-player": 10 } }] }).ok).toBe(true);
    expect(validateNpcRelationshipPolicy({ rules: [{ type: "friend", behaviors: { attack: 10 } as any }] }).ok).toBe(false);
  });
  it("does nothing without an explicit policy", () => {
    const o = observation(); o.perception.self.state.decisionProfile.relationshipPolicy = undefined;
    expect(applyNpcRelationshipBehavior(o, [{ kind: "follow-player", priority: 5, reason: "x", action }])[0].priority).toBe(5);
  });
  it("applies behavior priority only to a matching relationship", () => {
    const result = applyNpcRelationshipBehavior(observation(), [{ kind: "follow-player", priority: 5, reason: "x", action }]);
    expect(result[0].priority).toBe(25);
  });
  it("applies goal priority to an explicitly targeted relationship", () => {
    const result = applyNpcRelationshipGoalPriority(observation(), [{ kind: "respond-to-event", priority: 10, reason: "x", targetNpcId: "npc-2" }]);
    expect(result[0].priority).toBe(25);
  });
});
