import { describe, expect, it } from "vitest";
import { validateNpcPersonalityPolicy } from "./npc-personality-policy-schema";
import { applyNpcPersonalityBehavior, applyNpcPersonalityGoalPriority } from "./environment-npc-effects";
import type { RuntimeObservation } from "../domain/runtime";

const observation = (state: Record<string, unknown>): RuntimeObservation => ({
  id: "test", surface: "game", intelligence: "npc",
  state: { worldId: "w", clock: { tick: 1, day: 1, hour: 1, minute: 1, season: "spring" }, activeEventIds: [], stateVersion: "1", ...state } as RuntimeObservation["state"],
  perception: { self: { id: "n1", kind: "npc", mapId: "m", position: { x: 0, y: 0 }, state: {} }, nearbyEntities: [], detections: [], visibleMapIds: [], environment: {} },
  facts: [],
});

describe("npc personality policy", () => {
  it("keeps traits alone descriptive", () => {
    const o = observation({});
    o.perception!.self!.state = { personality: { traits: ["brave"] } };
    const result = applyNpcPersonalityBehavior(o, [{ kind: "idle", priority: 0, reason: "idle", action: { id: "a", intelligence: "npc", type: "npc.idle", payload: {}, risk: "safe", reason: "idle" } }]);
    expect(result[0].priority).toBe(0);
  });
  it("applies only an explicit trait policy", () => {
    const o = observation({});
    o.perception!.self!.state = { personality: { traits: ["brave"] }, personalityPolicy: { rules: [{ trait: "brave", behaviors: { flee: -20, investigate: 10 } }] } };
    const result = applyNpcPersonalityBehavior(o, [{ kind: "investigate", priority: 10, reason: "investigate", action: { id: "a", intelligence: "npc", type: "npc.investigate", payload: {}, risk: "safe", reason: "investigate" } }]);
    expect(result[0].priority).toBe(20);
  });
  it("applies explicit goal policy", () => {
    const o = observation({});
    o.perception!.self!.state = { personality: { traits: ["generous"] }, personalityPolicy: { rules: [{ trait: "generous", goals: { "respond-to-event": 15 } }] } };
    const result = applyNpcPersonalityGoalPriority(o, [{ kind: "respond-to-event", priority: 60, reason: "event" }]);
    expect(result[0].priority).toBe(75);
  });
  it("rejects unsupported policy kinds and deltas", () => {
    expect(validateNpcPersonalityPolicy({ rules: [{ trait: "brave", behaviors: { attack: 10, flee: 101 } }] }).ok).toBe(false);
  });
});
