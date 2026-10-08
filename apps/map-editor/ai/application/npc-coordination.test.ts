import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "../domain/runtime";
import { InMemoryNpcCoordinationStore, collectNpcCoordination, evaluateNpcCoordination, proposeNpcCoordination } from "./npc-coordination";

function observation(tick = 10): RuntimeObservation {
  return {
    id: "coordination-observation",
    surface: "game",
    intelligence: "npc",
    state: {
      worldId: "world-1",
      clock: { tick, day: 1, hour: 12, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "state-" + tick,
    },
    perception: {
      self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 0, y: 0 }, state: {} },
      nearbyEntities: [
        { id: "npc-2", kind: "npc", mapId: "region-1", position: { x: 1, y: 0 }, state: {} },
      ],
      detections: [],
      visibleMapIds: ["region-1"],
      environment: { activeRegionId: "region-1" },
    },
    facts: [],
  };
}

describe("NPC cross-agent coordination", () => {
  it("creates a bounded proposal without executing an action", () => {
    const request = proposeNpcCoordination(observation(), "npc-2", "assist", "respond-to-event", "Help with an active event.", 80);
    expect(request.requesterNpcId).toBe("npc-1");
    expect(request.targetNpcId).toBe("npc-2");
    expect(request.expiresAtTick).toBe(12);
  });

  it("accepts only proposals addressed to the observing NPC", () => {
    const store = new InMemoryNpcCoordinationStore();
    const request = proposeNpcCoordination(observation(), "npc-2", "guard", "respond-to-event", "Guard the area.", 90);
    const targetObservation = { ...observation(), perception: { ...observation().perception!, self: { ...observation().perception!.self!, id: "npc-2" } } };
    const result = evaluateNpcCoordination(targetObservation, request, store);
    expect(result.accepted).toBe(true);
    expect(store.list("npc-2")).toHaveLength(1);
  });

  it("rejects self-targeting and expired proposals", () => {
    const selfRequest = {
      requesterNpcId: "npc-1", targetNpcId: "npc-1", intent: "assist" as const,
      goal: "respond-to-event" as const, reason: "self", createdAtTick: 10, expiresAtTick: 20, priority: 1,
    };
    expect(evaluateNpcCoordination(observation(), selfRequest).accepted).toBe(false);

    const expired = {
      ...selfRequest, requesterNpcId: "npc-2", targetNpcId: "npc-1", expiresAtTick: 9,
    };
    expect(evaluateNpcCoordination(observation(), expired).accepted).toBe(false);
  });

  it("collects deterministic active proposals and removes expired ones", () => {
    const store = new InMemoryNpcCoordinationStore();
    store.add({ requesterNpcId: "npc-2", targetNpcId: "npc-1", intent: "assist", goal: "respond-to-event", reason: "help", createdAtTick: 8, expiresAtTick: 12, priority: 40 });
    store.add({ requesterNpcId: "npc-3", targetNpcId: "npc-1", intent: "guard", goal: "respond-to-event", reason: "guard", createdAtTick: 9, expiresAtTick: 9, priority: 80 });
    expect(collectNpcCoordination(observation(), store).map(request => request.requesterNpcId)).toEqual(["npc-2"]);
  });
});
