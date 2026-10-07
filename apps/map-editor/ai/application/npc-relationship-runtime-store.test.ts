import { describe, expect, it } from "vitest";
import { createNpcRelationshipRuntimeStore, withNpcRuntimeRelationships } from "./npc-relationship-runtime-store";

const verified = { ok: true, checks: [{ name: "execution", ok: true }] };
const rejected = { ok: false, checks: [{ name: "execution", ok: false }] };

const baseObservation = {
  id: "o",
  state: { stateVersion: "1", clock: { tick: 1 }, activeEventIds: [] },
  perception: {
    self: {
      id: "npc-1",
      kind: "npc" as const,
      position: { x: 0, y: 0 },
      state: {
        decisionProfile: {
          relationships: [{ targetNpcId: "npc-2", type: "friend" as const, affinity: 20, trust: 30 }],
        },
      },
    },
    nearbyEntities: [],
    detections: [],
  },
  facts: [],
} as any;

describe("NPC relationship runtime store", () => {
  it("seeds and overlays runtime relationships without mutating the observation", () => {
    const store = createNpcRelationshipRuntimeStore();
    store.set("npc-1", [{ targetNpcId: "npc-2", type: "friend", affinity: 20, trust: 30 }]);
    const observed = withNpcRuntimeRelationships(baseObservation, store);

    expect(observed.perception.self.state.decisionProfile.relationships[0].affinity).toBe(20);
    expect(baseObservation.perception.self.state.decisionProfile.relationships[0].affinity).toBe(20);
  });

  it("applies an interaction only to the source NPC relationship state", () => {
    const store = createNpcRelationshipRuntimeStore();
    store.set("npc-1", [{ targetNpcId: "npc-2", type: "friend", affinity: 20, trust: 30 }]);

    const result = store.applyInteraction({
      interactionId: "i-1",
      sourceNpcId: "npc-1",
      targetNpcId: "npc-2",
      type: "help",
      affinityDelta: 15,
      trustDelta: 10,
      tick: 2,
    }, verified);

    expect(result?.relationships[0]).toMatchObject({ targetNpcId: "npc-2", affinity: 35, trust: 40 });
    expect(store.get("npc-2")).toBeUndefined();
  });

  it("does not apply an interaction when verification fails", () => {
    const store = createNpcRelationshipRuntimeStore();
    store.set("npc-1", [{ targetNpcId: "npc-2", type: "friend", affinity: 20, trust: 30 }]);

    expect(store.applyInteraction({
      interactionId: "i-rejected",
      sourceNpcId: "npc-1",
      targetNpcId: "npc-2",
      type: "help",
      affinityDelta: 15,
      trustDelta: 10,
      tick: 2,
    }, rejected)).toBeUndefined();

    expect(store.get("npc-1")?.[0]).toMatchObject({ affinity: 20, trust: 30 });
  });

  it("does not apply an interaction when source state is not initialized", () => {
    const store = createNpcRelationshipRuntimeStore();
    expect(store.applyInteraction({
      interactionId: "i-1",
      sourceNpcId: "npc-1",
      targetNpcId: "npc-2",
      type: "conversation",
      affinityDelta: 10,
      tick: 2,
    }, verified)).toBeUndefined();
  });
});
