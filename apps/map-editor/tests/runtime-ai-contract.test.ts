import { describe, expect, it } from "vitest";
import {
  canExecuteRuntimeAction,
  validateRuntimeDecision,
} from "../ai/policies/runtime-policy";
import type {
  RuntimeAction,
  RuntimeDecision,
  RuntimeObservation,
} from "../ai/domain/runtime";

const observation: RuntimeObservation = {
  id: "obs-1",
  surface: "game",
  intelligence: "world",
  state: {
    worldId: "world-1",
    clock: {
      tick: 100,
      day: 4,
      hour: 12,
      minute: 30,
      season: "summer",
    },
    activeEventIds: [],
    stateVersion: "state-7",
  },
  facts: [],
};

const action: RuntimeAction = {
  id: "action-1",
  intelligence: "world",
  type: "world.schedule_event",
  payload: { eventId: "rain-start" },
  risk: "game-rule",
  reason: "The weather system allows this event in the current state.",
};

describe("Vendrith AI runtime contract", () => {
  it("accepts a decision tied to the current observation and state version", () => {
    const decision: RuntimeDecision = {
      id: "decision-1",
      observationId: observation.id,
      stateVersion: observation.state.stateVersion,
      actions: [action],
      evidence: [],
    };

    expect(validateRuntimeDecision(decision, observation)).toEqual({
      ok: true,
      errors: [],
    });
  });

  it("rejects stale runtime decisions", () => {
    const decision: RuntimeDecision = {
      id: "decision-stale",
      observationId: observation.id,
      stateVersion: "state-6",
      actions: [action],
      evidence: [],
    };

    const result = validateRuntimeDecision(decision, observation);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      "Decision was produced from a stale state version.",
    );
  });

  it("does not allow non-safe runtime actions without approval", () => {
    expect(canExecuteRuntimeAction(action, false)).toBe(false);
    expect(canExecuteRuntimeAction(action, true)).toBe(true);
  });

  it("allows safe runtime actions without approval", () => {
    expect(
      canExecuteRuntimeAction(
        { ...action, id: "safe-1", risk: "safe" },
        false,
      ),
    ).toBe(true);
  });
});
