import { describe, expect, it, vi } from "vitest";
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
    clock: { tick: 10, day: 1, hour: 8, minute: 0, season: "spring" },
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
    observation: { observe: async () => observation },
    decision: { decide: async () => decision },
    action: {
      execute: async () => ({
        ok: true,
        actionId: action.id,
        stateVersion: "state-2",
      }),
    },
    verification: { verify: async () => verification },
  };
}

function gameRuleAction(): RuntimeAction {
  return {
    id: "action-1",
    intelligence: "world",
    type: "world.schedule_event",
    payload: { eventId: "rain-start" },
    risk: "game-rule",
    reason: "Weather rules allow the event.",
  };
}

describe("Vendrith runtime orchestrator", () => {
  it("executes a game-rule action on the game surface and verifies it", async () => {
    const result = await createRuntimeOrchestrator(createPorts(gameRuleAction())).run(request);
    expect(result.executions).toEqual([
      expect.objectContaining({ actionId: "action-1", ok: true, executed: true }),
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
      actionId: "action-high-risk", ok: false, executed: false,
    });
  });

  it("rejects an observation from a different runtime surface", async () => {
    const ports = createPorts(gameRuleAction());
    ports.observation.observe = async () => ({ ...observation, surface: "engine" });
    await expect(createRuntimeOrchestrator(ports).run(request)).rejects.toThrow(
      "Runtime observation does not match the requested surface and intelligence.",
    );
  });

  it("rejects an observation for a different intelligence", async () => {
    const ports = createPorts(gameRuleAction());
    ports.observation.observe = async () => ({ ...observation, intelligence: "npc" });
    await expect(createRuntimeOrchestrator(ports).run(request)).rejects.toThrow(
      "Runtime observation does not match the requested surface and intelligence.",
    );
  });

  it("does not verify a successful result without a resulting state version", async () => {
    const ports = createPorts(gameRuleAction());
    ports.action.execute = async () => ({
      ok: true,
      actionId: "action-1",
    });
    const verify = vi.spyOn(ports.verification, "verify");
    const result = await createRuntimeOrchestrator(ports).run(request);
    expect(result.executions[0]).toMatchObject({
      actionId: "action-1",
      ok: false,
      executed: true,
      detail: "Successful runtime action result is missing its resulting state version.",
    });
    expect(verify).not.toHaveBeenCalled();
  });

  it("does not verify a result reported for a different action ID", async () => {
    const ports = createPorts(gameRuleAction());
    ports.action.execute = async () => ({ ok: true, actionId: "other-action" });
    const verify = vi.spyOn(ports.verification, "verify");
    const result = await createRuntimeOrchestrator(ports).run(request);
    expect(result.executions[0]).toMatchObject({
      actionId: "action-1",
      ok: false,
      executed: true,
      detail: "Runtime action result ID did not match the requested action.",
    });
    expect(verify).not.toHaveBeenCalled();
  });
});
