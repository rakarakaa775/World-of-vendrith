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
  it("selects follow-player when a player is visible", () => {
    const candidates = createNpcBehaviorCandidates(observation);
    expect(candidates.some(candidate => candidate.kind === "follow-player")).toBe(true);
    const decision = decideNpcBehavior(request, observation);
    expect(decision.actions[0].type).toBe("npc.follow");
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

  it("creates a deterministic wander target when no player is visible", () => {
    const quiet = { ...observation, id: "obs-quiet", perception: { ...observation.perception!, nearbyEntities: [], detections: [] } };
    const candidates = createNpcBehaviorCandidates(quiet);
    const wander = candidates.find(candidate => candidate.kind === "wander");
    expect(wander?.action.type).toBe("npc.wander");
    expect(wander?.action.payload.position).toEqual({ x: 2, y: 3 });
    expect(deterministicWanderTarget({ x: 2, y: 2 }, 14)).toEqual({ x: 2, y: 3 });
  });
});
