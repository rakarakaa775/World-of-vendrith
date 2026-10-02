import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { createRuntimeDecision } from "./runtime-decision";

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

const request: RuntimeAiRequest = {
  id: "runtime-1",
  surface: "game",
  intelligence: "npc",
  observation,
  goal: "Move toward the player.",
};

describe("runtime decision", () => {
  it("binds decisions to the exact observation version", () => {
    const decision = createRuntimeDecision(request, observation, {
      actions: [{
        id: "move-1",
        intelligence: "npc",
        type: "npc.move",
        payload: { x: 3, y: 4 },
        risk: "safe",
        reason: "The player is nearby.",
      }],
      expiresAtTick: 25,
    });

    expect(decision.id).toBe("runtime-1:decision:state-20");
    expect(decision.observationId).toBe("obs-1");
    expect(decision.stateVersion).toBe("state-20");
    expect(decision.expiresAtTick).toBe(25);
    expect(decision.evidence[0].confidence).toBe("high");
  });
});
