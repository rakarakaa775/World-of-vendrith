import { describe, expect, it } from "vitest";
import type { RuntimeAiPorts } from "../ports/runtime";
import type {
  RuntimeAction,
  RuntimeAiRequest,
  RuntimeDecision,
  RuntimeObservation,
} from "../domain/runtime";
import type { VerificationResult } from "../domain/types";
import { createRuntimeOrchestrator } from "./runtime-orchestrator";

const observation: RuntimeObservation = {
  id: "obs-1",
  surface: "game",
  intelligence: "world",
  state: {
    worldId: "world-1",
    clock: {
      tick: 10,
      day: 1,
      hour: 8,
      minute: 0,
      season: "spring",
    },
    activeEventIds: [],
    stateVersion: "state-1",
  },
  facts: [],
};

const request: RuntimeAiRequest = {
  id: "runtime-1",
  surface: "game",
  intelligence: "world",
  observation,
  goal: "Schedule a weather event.",
};

function createPorts(action: RuntimeAction): RuntimeAiPorts {
  const decision: RuntimeDecision = {
    id: "decision-1",
    observationId: observation.id,
    stateVersion: observation.state.stateVersion,
    actions: [action],
    evidence: [],
  };

  const verification: VerificationResult = {
    ok: true,
    checks: [{ name: "state-transition", ok: true }],
  };

  return {
    observation: {
      observe: async () => observation,
    },
    decision: {
      decide: async () => decision,
    },
    action: {
      execute: async () => ({
        ok: true,
        actionId: action.id,
        stateVersion: "state-2",
      }),
    },
    verification: {
      verify: async () => verification,
    },
  };
}

describe("Vendrith runtime orchestrator", () => {
  it("executes a game-rule action on the game surface and verifies it", async () => {
    const action: RuntimeAction = {
      id: "action-1",
      intelligence: "world",
      type: "world.schedule_event",
      payload: { eventId: "rain-start" },
      risk: "game-rule",
      reason: "Weather rules allow the event.",
    };

    const result = await createRuntimeOrchestrator(createPorts(action)).run(request);

    expect(result.executions).toEqual([
      expect.objectContaining({
        actionId: "action-1",
        ok: true,
        executed: true,
      }),
    ]);
  });

  it("blocks a high-risk game action without creator approval", async () => {
    const action: RuntimeAction = {
      id: "action-high-risk",
      intelligence: "world",
      type: "world.override_rule",
      payload: { rule: "winter" },
      risk: "high-risk",
      reason: "Override a world rule.",
    };

    const result = await createRuntimeOrchestrator(createPorts(action)).run(request);

    expect(result.executions[0]).toMatchObject({
      actionId: "action-high-risk",
      ok: false,
      executed: false,
    });
  });
});
