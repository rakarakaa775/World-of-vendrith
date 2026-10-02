import { describe, expect, it } from "vitest";
import type { RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import { validateRuntimeDecision } from "../policies/runtime-policy";

const observation: RuntimeObservation = {
  id: "obs-1",
  surface: "game",
  intelligence: "npc",
  state: {
    worldId: "world-1",
    clock: { tick: 20, day: 1, hour: 9, minute: 0, season: "spring" },
    activeEventIds: [],
    stateVersion: "state-20",
  },
  facts: [],
};

function decision(action: RuntimeDecision["actions"][number]): RuntimeDecision {
  return {
    id: "decision-1",
    observationId: observation.id,
    stateVersion: observation.state.stateVersion,
    actions: [action],
    evidence: [],
  };
}

describe("runtime decision policy", () => {
  it("rejects expired decisions", () => {
    const result = validateRuntimeDecision(
      { ...decision({
        id: "move-1",
        intelligence: "npc",
        type: "npc.move",
        payload: {},
        risk: "safe",
        reason: "Move toward a visible target.",
      }), expiresAtTick: 19 },
      observation,
    );

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Decision has already expired for the current simulation tick.");
  });

  it("rejects actions targeting a different intelligence", () => {
    const result = validateRuntimeDecision(
      decision({
        id: "world-1",
        intelligence: "world",
        type: "world.update",
        payload: {},
        risk: "game-rule",
        reason: "Update world state.",
      }),
      observation,
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("targets intelligence world");
  });

  it("accepts a current, correctly targeted decision", () => {
    const result = validateRuntimeDecision(
      { ...decision({
        id: "move-1",
        intelligence: "npc",
        type: "npc.move",
        payload: { x: 2, y: 3 },
        risk: "safe",
        reason: "Move toward the visible player.",
      }), expiresAtTick: 25 },
      observation,
    );

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
