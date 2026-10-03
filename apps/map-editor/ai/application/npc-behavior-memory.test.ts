import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { createNpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import { decideNpcBehavior } from "./npc-behavior";

const base: RuntimeObservation = {
  id: "obs-1", surface: "game", intelligence: "npc",
  state: { worldId: "w", clock: { tick: 10, day: 1, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "v10" },
  perception: { self: { id: "npc-1", kind: "npc", mapId: "r", position: { x: 2, y: 2 } }, nearbyEntities: [{ id: "player-1", kind: "player", mapId: "r", position: { x: 4, y: 2 } }], detections: [{ entityId: "player-1", channels: ["visibility"], distance: 2 }], visibleMapIds: ["r"], environment: {} }, facts: [],
};
const request = (observation: RuntimeObservation): RuntimeAiRequest => ({ id: "req-1", surface: "game", intelligence: "npc", observation, goal: "Respond to nearby activity." });

describe("NPC behavior memory", () => {
  it("remembers a visible target across ticks", () => {
    const store = createNpcBehaviorMemoryStore();
    const first = decideNpcBehavior(request(base), base, undefined, store);
    expect(first.actions[0].type).toBe("npc.follow");
    expect(store.get("npc-1")?.targetEntityId).toBe("player-1");
    expect(store.get("npc-1")?.lastSeenTick).toBe(10);
  });

  it("persists an explicit hearing investigation across ticks", () => {
    const store = createNpcBehaviorMemoryStore();
    const hearingObservation: RuntimeObservation = {
      ...base,
      id: "obs-hearing-1",
      perception: {
        ...base.perception!,
        nearbyEntities: [{ id: "player-1", kind: "player", mapId: "r", position: { x: 7, y: 2 } }],
        detections: [{ entityId: "player-1", channels: ["hearing"], distance: 5 }],
      },
      state: {
        ...base.state,
        environmentConditions: {
          npc_detection_behavior: {
            hearing: { investigate: { priority_delta: 40, reason: "Investigate explicit sound evidence." } },
          },
        },
      },
    };
    const first = decideNpcBehavior(request(hearingObservation), hearingObservation, undefined, store);
    expect(first.actions[0].type).toBe("npc.investigate");
    expect(first.actions[0].payload.targetEntityId).toBe("player-1");
    expect(store.get("npc-1")?.targetEntityId).toBe("player-1");
    expect(store.get("npc-1")?.lastKnownTargetPosition).toEqual({ x: 7, y: 2 });

    const next: RuntimeObservation = {
      ...hearingObservation,
      id: "obs-hearing-2",
      state: { ...hearingObservation.state, clock: { ...hearingObservation.state.clock, tick: 11 }, stateVersion: "v11" },
      perception: { ...hearingObservation.perception!, nearbyEntities: [], detections: [] },
    };
    const decision = decideNpcBehavior(request(next), next, undefined, store);
    expect(decision.actions[0].type).toBe("npc.investigate");
    expect(decision.actions[0].payload.targetEntityId).toBe("player-1");
    expect(decision.actions[0].payload.position).toEqual({ x: 7, y: 2 });
  });

  it("creates a fresh investigation after resolved memory is cleared and the target is detected again", () => {
    const store = createNpcBehaviorMemoryStore();
    const hearingObservation: RuntimeObservation = {
      ...base,
      id: "obs-reobserve-1",
      perception: {
        ...base.perception!,
        nearbyEntities: [{ id: "player-1", kind: "player", mapId: "r", position: { x: 7, y: 2 } }],
        detections: [{ entityId: "player-1", channels: ["hearing"], distance: 5 }],
      },
      state: {
        ...base.state,
        environmentConditions: {
          npc_detection_behavior: {
            hearing: { investigate: { priority_delta: 40, reason: "Investigate explicit sound evidence." } },
          },
        },
      },
    };
    const first = decideNpcBehavior(request(hearingObservation), hearingObservation, undefined, store);
    expect(first.actions[0].type).toBe("npc.investigate");
    expect(store.get("npc-1")?.lastKnownTargetPosition).toEqual({ x: 7, y: 2 });

    store.set({
      ...store.get("npc-1")!,
      lastFailure: "navigation",
      failureCount: 3,
    });
    const redetected: RuntimeObservation = {
      ...hearingObservation,
      id: "obs-reobserve-2",
      state: { ...hearingObservation.state, clock: { ...hearingObservation.state.clock, tick: 12 }, stateVersion: "v12" },
      perception: {
        ...hearingObservation.perception!,
        nearbyEntities: [{ id: "player-1", kind: "player", mapId: "r", position: { x: 5, y: 2 } }],
        detections: [{ entityId: "player-1", channels: ["hearing"], distance: 3 }],
      },
    };
    const second = decideNpcBehavior(request(redetected), redetected, undefined, store);
    expect(second.actions[0].type).toBe("npc.investigate");
    expect(second.actions[0].payload.targetEntityId).toBe("player-1");
    expect(store.get("npc-1")?.lastKnownTargetPosition).toEqual({ x: 5, y: 2 });
    expect(store.get("npc-1")?.updatedAtTick).toBe(12);
    expect(store.get("npc-1")?.lastFailure).toBeUndefined();
    expect(store.get("npc-1")?.failureCount).toBeUndefined();
  });

  it("does not create investigation memory from hearing without an explicit reaction rule", () => {
    const store = createNpcBehaviorMemoryStore();
    const hearingObservation: RuntimeObservation = {
      ...base,
      id: "obs-hearing-no-policy",
      perception: {
        ...base.perception!,
        nearbyEntities: [{ id: "player-1", kind: "player", mapId: "r", position: { x: 7, y: 2 } }],
        detections: [{ entityId: "player-1", channels: ["hearing"], distance: 5 }],
      },
    };
    const decision = decideNpcBehavior(request(hearingObservation), hearingObservation, undefined, store);
    expect(decision.actions[0].type).toBe("npc.wander");
    expect(store.get("npc-1")?.targetEntityId).toBeUndefined();
  });

  it("uses last known position when the target disappears", () => {
    const store = createNpcBehaviorMemoryStore();
    decideNpcBehavior(request(base), base, undefined, store);
    const next: RuntimeObservation = { ...base, id: "obs-2", state: { ...base.state, clock: { ...base.state.clock, tick: 11 }, stateVersion: "v11" }, perception: { ...base.perception!, nearbyEntities: [], detections: [] } };
    const decision = decideNpcBehavior(request(next), next, undefined, store);
    expect(decision.actions[0].type).toBe("npc.investigate");
    expect(decision.actions[0].payload.targetEntityId).toBe("player-1");
    expect(decision.actions[0].payload.position).toEqual({ x: 4, y: 2 });
  });
});
