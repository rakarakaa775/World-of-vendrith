import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { createNpcBehaviorCandidates, decideNpcBehavior, deterministicWanderTarget } from "./npc-behavior";

const observation: RuntimeObservation = {
  id: "obs-npc", surface: "game", intelligence: "npc",
  state: { worldId: "world-1", clock: { tick: 10, day: 1, hour: 8, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "state-10" },
  perception: {
    self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 2, y: 2 } },
    nearbyEntities: [{ id: "player-1", kind: "player", mapId: "region-1", position: { x: 4, y: 2 } }],
    detections: [{ entityId: "player-1", channels: ["visibility"], distance: 2 }],
    visibleMapIds: ["region-1"], environment: { activeRegionId: "region-1" },
  }, facts: [],
};
const request: RuntimeAiRequest = { id: "runtime-npc", surface: "game", intelligence: "npc", observation, goal: "Respond to nearby activity." };

describe("NPC behavior", () => {
  it("turns a social goal into a targeted socialize behavior", () => {
    const social = { ...observation, id: "obs-social-behavior", perception: { ...observation.perception!, nearbyEntities: [] } };
    const candidates = createNpcBehaviorCandidates(social, undefined, { kind: "socialize", priority: 90, reason: "Social need", targetNpcId: "npc-2" });
    const socialCandidate = candidates.find(candidate => candidate.kind === "socialize");
    expect(socialCandidate?.action).toMatchObject({ type: "npc.socialize", payload: { targetNpcId: "npc-2", targetEntityId: "npc-2" } });
  });

  it("carries the selected social interaction type into the behavior contract", () => {
    const social = { ...observation, id: "obs-social-selection", perception: { ...observation.perception!, nearbyEntities: [] } };
    const candidates = createNpcBehaviorCandidates(social, undefined, {
      kind: "socialize",
      priority: 90,
      reason: "Social need",
      targetNpcId: "npc-2",
      socialInteractionType: "conversation",
    });
    const socialCandidate = candidates.find(candidate => candidate.kind === "socialize");
    expect(socialCandidate?.action.payload.socialInteractionType).toBe("conversation");
  });

  it("selects follow-player when a player is visible", () => {
    const candidates = createNpcBehaviorCandidates(observation);
    expect(candidates.some(candidate => candidate.kind === "follow-player")).toBe(true);
    const decision = decideNpcBehavior(request, observation);
    expect(decision.actions[0].type).toBe("npc.follow");
    expect(decision.actions[0].payload).toMatchObject({ targetEntityId: "player-1", followDistance: 2 });
    expect(decision.stateVersion).toBe("state-10");
    expect(decision.expiresAtTick).toBe(11);
  });

  it("does not treat hearing or smell as visual follow targets", () => {
    const detectedBySound = {
      ...observation,
      id: "obs-sound",
      perception: {
        ...observation.perception!,
        detections: [{ entityId: "player-1", channels: ["hearing"], distance: 2 }],
      },
    };
    const candidates = createNpcBehaviorCandidates(detectedBySound);
    expect(candidates.some(candidate => candidate.kind === "follow-player")).toBe(false);
  });

  it("uses hearing evidence only when an explicit detection reaction rule exists", () => {
    const detectedBySound = {
      ...observation,
      id: "obs-hearing-rule",
      state: {
        ...observation.state,
        environmentConditions: {
          npc_detection_behavior: {
            hearing: { investigate: { priority_delta: 40, reason: "Investigate explicit sound evidence." } },
          },
        },
      },
      perception: {
        ...observation.perception!,
        detections: [{ entityId: "player-1", channels: ["hearing"], distance: 2 }],
      },
    };
    const decision = decideNpcBehavior({ ...request, observation: detectedBySound }, detectedBySound);
    expect(decision.actions[0].type).toBe("npc.investigate");
    expect(decision.actions[0].payload.targetEntityId).toBe("player-1");
  });




  it("creates an explicit eat behavior contract for an active eat goal", () => {
    const eating = createNpcBehaviorCandidates(observation, undefined, {
      kind: "eat",
      priority: 175,
      reason: "Hunger need is high.",
      targetLocation: { mapId: "town", x: 4, y: 8 },
    });
    const eat = eating.find(candidate => candidate.kind === "eat");
    expect(eat?.action.type).toBe("npc.eat");
    expect(eat?.action.payload).toMatchObject({
      goal: "eat",
      activityKind: "eat",
      targetLocation: { mapId: "town", x: 4, y: 8 },
    });
  });

  it("creates an explicit sleep behavior contract for an active sleep goal", () => {
    const sleeping = createNpcBehaviorCandidates(observation, undefined, {
      kind: "sleep",
      priority: 165,
      reason: "Energy need is low.",
      targetLocation: { mapId: "town", x: 2, y: 6 },
    });
    const sleep = sleeping.find(candidate => candidate.kind === "sleep");
    expect(sleep?.action.type).toBe("npc.sleep");
    expect(sleep?.action.payload).toMatchObject({
      goal: "sleep",
      activityKind: "sleep",
      targetLocation: { mapId: "town", x: 2, y: 6 },
    });
  });

  it("turns an arrived recreation schedule into a concrete daily-life behavior", () => {
    const recreation = createNpcBehaviorCandidates({
      ...observation,
      perception: { ...observation.perception!, self: { ...observation.perception!.self!, position: { x: 8, y: 4 } } },
    }, undefined, {
      kind: "go-to-location",
      priority: 45,
      reason: "Scheduled recreation is active at the current location.",
      targetLocation: { mapId: "region-1", x: 8, y: 4 },
      locationRole: "recreation",
      dailyLifeActivity: "recreation",
    });
    const activity = recreation.find(candidate => candidate.kind === "recreation");
    expect(activity?.action.type).toBe("npc.recreation");
    expect(activity?.action.payload).toMatchObject({
      goal: "go-to-location",
      dailyLifeActivity: "recreation",
      locationRole: "recreation",
      targetLocation: { mapId: "region-1", x: 8, y: 4 },
    });
  });

  it("keeps a scheduled daily-life activity as navigation until the NPC arrives", () => {
    const recreation = createNpcBehaviorCandidates(observation, undefined, {
      kind: "go-to-location",
      priority: 45,
      reason: "Travel to recreation.",
      targetLocation: { mapId: "region-1", x: 8, y: 4 },
      locationRole: "recreation",
      dailyLifeActivity: "recreation",
    });
    expect(recreation.find(candidate => candidate.kind === "go-to-location")?.action.type).toBe("npc.go-to-location");
    expect(recreation.some(candidate => candidate.kind === "recreation")).toBe(false);
  });

  it("creates an explicit go-to-location behavior contract for an active location goal", () => {
    const moving = createNpcBehaviorCandidates(observation, undefined, {
      kind: "go-to-location",
      priority: 50,
      reason: "Move to the scheduled location.",
      targetLocation: { mapId: "region-2", x: 7, y: 3 },
    });
    const move = moving.find(candidate => candidate.kind === "go-to-location");
    expect(move?.action.type).toBe("npc.go-to-location");
    expect(move?.action.payload).toMatchObject({ goal: "go-to-location", targetLocation: { mapId: "region-2", x: 7, y: 3 } });
  });

  it("creates an explicit respond-to-event behavior contract for an active event goal", () => {
    const responding = createNpcBehaviorCandidates(observation, undefined, {
      kind: "respond-to-event",
      priority: 120,
      reason: "A critical event requires attention.",
      targetEventId: "event-9",
    });
    const response = responding.find(candidate => candidate.kind === "respond-to-event");
    expect(response?.action.type).toBe("npc.respond-to-event");
    expect(response?.action.payload).toMatchObject({ goal: "respond-to-event", targetEventId: "event-9" });
  });

  it("creates an explicit work behavior contract for an active work goal", () => {
    const working = createNpcBehaviorCandidates(observation, undefined, {
      kind: "work",
      priority: 58,
      reason: "Scheduled work activity is active.",
      targetLocation: { mapId: "town", x: 10, y: 4 },
    });
    const work = working.find(candidate => candidate.kind === "work");
    expect(work?.action.type).toBe("npc.work");
    expect(work?.action.payload).toMatchObject({
      goal: "work",
      activityKind: "work",
      targetLocation: { mapId: "town", x: 10, y: 4 },
    });
  });

  it("creates a deterministic flee target for a visible enemy relationship", () => {
    const threatened = {
      ...observation,
      id: "obs-flee",
      perception: {
        ...observation.perception!,
        nearbyEntities: [
          { id: "enemy-1", kind: "npc" as const, mapId: "region-1", position: { x: 5, y: 2 } },
        ],
        detections: [{ entityId: "enemy-1", channels: ["visibility" as const], distance: 3 }],
        self: {
          ...observation.perception!.self!,
          state: { decisionProfile: { relationships: [{ targetNpcId: "enemy-1", type: "enemy" }] } },
        },
      },
    };
    const candidates = createNpcBehaviorCandidates(threatened);
    const flee = candidates.find(candidate => candidate.kind === "flee");
    expect(flee?.action.type).toBe("npc.flee");
    expect(flee?.action.payload).toMatchObject({ threatEntityId: "enemy-1", position: { x: -2, y: 2 }, fleeDistance: 4 });
  });

  it("does not flee from an enemy relationship that is not visible", () => {
    const hiddenThreat = {
      ...observation,
      id: "obs-hidden-flee",
      perception: {
        ...observation.perception!,
        nearbyEntities: [{ id: "enemy-1", kind: "npc" as const, mapId: "region-1", position: { x: 5, y: 2 } }],
        detections: [],
        self: {
          ...observation.perception!.self!,
          state: { decisionProfile: { relationships: [{ targetNpcId: "enemy-1", type: "enemy" }] } },
        },
      },
    };
    expect(createNpcBehaviorCandidates(hiddenThreat).some(candidate => candidate.kind === "flee")).toBe(false);
  });

  it("investigates a recent last-known target position", () => {
    const quiet = { ...observation, id: "obs-investigate", perception: { ...observation.perception!, nearbyEntities: [], detections: [] } };
    const memory = {
      npcId: "npc-1",
      stateVersion: "state-10",
      lastBehavior: "follow-player" as const,
      targetEntityId: "player-1",
      lastKnownTargetPosition: { x: 6, y: 2 },
      lastSeenTick: 8,
      updatedAtTick: 9,
    };
    const candidates = createNpcBehaviorCandidates(quiet, memory);
    const investigate = candidates.find(candidate => candidate.kind === "investigate");
    expect(investigate?.action.type).toBe("npc.investigate");
    expect(investigate?.action.payload).toMatchObject({ targetEntityId: "player-1", position: { x: 6, y: 2 }, memoryAgeTicks: 2, maxMemoryTicks: 20 });
  });

  it("stops investigating once last-known target memory expires", () => {
    const quiet = { ...observation, id: "obs-stale-investigate", perception: { ...observation.perception!, nearbyEntities: [], detections: [] } };
    const memory = {
      npcId: "npc-1",
      stateVersion: "state-10",
      lastBehavior: "follow-player" as const,
      targetEntityId: "player-1",
      lastKnownTargetPosition: { x: 6, y: 2 },
      lastSeenTick: -11,
      updatedAtTick: 9,
    };
    const candidates = createNpcBehaviorCandidates(quiet, memory);
    expect(candidates.some(candidate => candidate.kind === "investigate")).toBe(false);
    expect(candidates.find(candidate => candidate.kind === "wander")?.action.type).toBe("npc.wander");
  });

  it("creates a deterministic wander target when no player is visible", () => {
    const quiet = { ...observation, id: "obs-quiet", perception: { ...observation.perception!, nearbyEntities: [], detections: [] } };
    const candidates = createNpcBehaviorCandidates(quiet);
    const wander = candidates.find(candidate => candidate.kind === "wander");
    expect(wander?.action.type).toBe("npc.wander");
    expect(wander?.action.payload.position).toEqual({ x: 1, y: 2 });
    expect(deterministicWanderTarget({ x: 2, y: 2 }, 14, "npc-1")).toEqual({ x: 1, y: 2 });
    expect(deterministicWanderTarget({ x: 2, y: 2 }, 14, "npc-2")).not.toEqual(deterministicWanderTarget({ x: 2, y: 2 }, 14, "npc-1"));
    expect(deterministicWanderTarget({ x: 2, y: 2 }, 14, "npc-1")).toEqual(deterministicWanderTarget({ x: 2, y: 2 }, 14, "npc-1"));
  });
});
