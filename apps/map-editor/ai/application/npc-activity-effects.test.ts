import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import { createNpcNeedsStore } from "../domain/runtime-npc-needs";
import { createNpcActivityEffectStore } from "../domain/runtime-npc-activity-effects";
import { applyVerifiedNpcActivityEffect } from "./npc-activity-effects";

function observation(): RuntimeObservation {
  return {
    id: "obs-1",
    surface: "game",
    intelligence: "npc",
    state: {
      worldId: "world-1",
      clock: { tick: 5, day: 1, hour: 12, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "state-5",
      environmentConditions: {
        npc_activity_effects: {
          eat: { hunger: -30, energy: 2 },
          work: { hunger: 5, energy: -10 },
        },
      },
    },
    perception: {
      self: {
        id: "npc-1",
        kind: "npc",
        mapId: "region-1",
        position: { x: 1, y: 1 },
      },
      nearbyEntities: [],
      detections: [],
      visibleMapIds: ["region-1"],
      environment: {},
    },
    facts: [],
  };
}

function needsStore() {
  const store = createNpcNeedsStore();
  store.set({
    npcId: "npc-1",
    needs: { hunger: 80, energy: 50, social: 40, safety: 90 },
    updatedAtTick: 4,
    stateVersion: "state-4",
  });
  return store;
}

describe("npc activity effects", () => {
  it("applies only an explicit effect after successful execution and verification", () => {
    const store = needsStore();
    const result = applyVerifiedNpcActivityEffect(
      { id: "action-eat-1", intelligence: "npc", type: "npc.activity", payload: { goal: "eat" }, risk: "game-rule", reason: "Eat." },
      observation(), true, true, store, createNpcActivityEffectStore(),
    );
    expect(result.applied).toBe(true);
    expect(result.needs).toEqual({ hunger: 50, energy: 52, social: 40, safety: 90 });
    expect(store.get("npc-1")?.needs).toEqual(result.needs);
  });

  it("does not mutate needs after failed execution or verification", () => {
    for (const [executionOk, verificationOk] of [[false, true], [true, false]]) {
      const store = needsStore();
      const result = applyVerifiedNpcActivityEffect(
        { id: "action-failed-" + executionOk + verificationOk, intelligence: "npc", type: "npc.activity", payload: { goal: "eat" }, risk: "game-rule", reason: "Eat." },
        observation(), executionOk, verificationOk, store, createNpcActivityEffectStore(),
      );
      expect(result.applied).toBe(false);
      expect(store.get("npc-1")?.needs).toEqual({ hunger: 80, energy: 50, social: 40, safety: 90 });
    }
  });

  it("applies the same action effect at most once", () => {
    const store = needsStore();
    const effects = createNpcActivityEffectStore();
    const action = { id: "action-eat-once", intelligence: "npc" as const, type: "npc.activity", payload: { goal: "eat" }, risk: "game-rule" as const, reason: "Eat." };
    const first = applyVerifiedNpcActivityEffect(action, observation(), true, true, store, effects);
    const second = applyVerifiedNpcActivityEffect(action, observation(), true, true, store, effects);
    expect(first.applied).toBe(true);
    expect(second.applied).toBe(false);
    expect(second.reason).toContain("already");
    expect(store.get("npc-1")?.needs.hunger).toBe(50);
  });

  it("does not invent effects for unsupported or unconfigured activities", () => {
    const store = needsStore();
    const effects = createNpcActivityEffectStore();
    const unsupported = applyVerifiedNpcActivityEffect(
      { id: "action-unsupported", intelligence: "npc", type: "npc.activity", payload: { goal: "wander" }, risk: "safe", reason: "Wander." },
      observation(), true, true, store, effects,
    );
    expect(unsupported.applied).toBe(false);
    const noConfig = applyVerifiedNpcActivityEffect(
      { id: "action-sleep", intelligence: "npc", type: "npc.activity", payload: { goal: "sleep" }, risk: "game-rule", reason: "Sleep." },
      observation(), true, true, store, effects,
    );
    expect(noConfig.applied).toBe(false);
    expect(store.get("npc-1")?.needs.hunger).toBe(80);
  });
});
