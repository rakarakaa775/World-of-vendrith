import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import { createNpcBehaviorCandidates, decideNpcBehavior } from "./npc-behavior";
import { createNpcGoalCandidates, decideNpcGoal } from "./npc-goals";
import { enforceNpcDecisionProfileBehaviors, enforceNpcDecisionProfileGoals } from "./npc-decision-enforcement";

const observation: RuntimeObservation = {
  id: "obs-enforcement", surface: "game", intelligence: "npc",
  state: { worldId: "world-1", clock: { tick: 1, day: 1, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "state-1" },
  perception: {
    self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 0, y: 0 }, state: {} },
    nearbyEntities: [{ id: "player-1", kind: "player", mapId: "region-1", position: { x: 1, y: 0 } }],
    detections: [{ entityId: "player-1", channels: ["visibility"], distance: 1 }],
    visibleMapIds: ["region-1"], environment: { activeRegionId: "region-1" },
  }, facts: [],
};

describe("NPC decision enforcement", () => {
  it("allows a behavior explicitly present in capabilities", () => {
    const o = { ...observation, perception: { ...observation.perception!, self: { ...observation.perception!.self!, state: { decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["follow-player"] } } } } } };
    expect(enforceNpcDecisionProfileBehaviors(o, createNpcBehaviorCandidates(o))).toHaveLength(1);
    expect(decideNpcBehavior({ id: "r", surface: "game", intelligence: "npc", observation: o, goal: "follow" }, o).actions[0].type).toBe("npc.follow");
  });

  it("blocks a behavior outside the explicit capability allow-list", () => {
    const o = { ...observation, perception: { ...observation.perception!, self: { ...observation.perception!.self!, state: { decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["idle"] } } } } } };
    expect(enforceNpcDecisionProfileBehaviors(o, createNpcBehaviorCandidates(o)).map(c => c.kind)).toEqual(["idle"]);
  });

  it("blocks goals outside the explicit capability allow-list", () => {
    const o = { ...observation, state: { ...observation.state, activeEventIds: [] }, perception: { ...observation.perception!, self: { ...observation.perception!.self!, state: { decisionProfile: { archetype: "civilian", capabilities: { goals: ["work"] } } } } } };
    const goals = createNpcGoalCandidates(o, { hunger: 100, energy: 100, social: 0, safety: 100 });
    expect(enforceNpcDecisionProfileGoals(o, goals).map(g => g.kind)).toEqual(["work"]);
  });

  it("preserves legacy behavior and goals when no profile exists", () => {
    const behavior = createNpcBehaviorCandidates(observation);
    const goals = createNpcGoalCandidates(observation, { hunger: 100, energy: 100, social: 0, safety: 100 });
    expect(enforceNpcDecisionProfileBehaviors(observation, behavior)).toEqual(behavior);
    expect(enforceNpcDecisionProfileGoals(observation, goals)).toEqual(goals);
  });

  it("fails closed when an explicit capability profile is malformed", () => {
    const o = { ...observation, perception: { ...observation.perception!, self: { ...observation.perception!.self!, state: { decisionProfile: { archetype: "civilian", capabilities: { behaviors: ["not-real"] } } } } } };
    expect(enforceNpcDecisionProfileBehaviors(o, createNpcBehaviorCandidates(o))).toEqual([]);
  });

  it("prevents personality policy from bypassing capabilities", () => {
    const o = { ...observation, perception: { ...observation.perception!, self: { ...observation.perception!.self!, state: { decisionProfile: { archetype: "military", capabilities: { behaviors: ["idle"] }, personality: { traits: ["disciplined"] }, personalityPolicy: { rules: [{ trait: "disciplined", behaviors: { idle: 100 } }] } } } } } };
    expect(enforceNpcDecisionProfileBehaviors(o, createNpcBehaviorCandidates(o)).map(c => c.kind)).toEqual(["idle"]);
  });
});
