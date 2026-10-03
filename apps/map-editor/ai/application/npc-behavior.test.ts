import { describe, expect, it } from "vitest";
import type { RuntimeAiRequest, RuntimeObservation } from "../domain/runtime";
import { createNpcBehaviorCandidates, decideNpcBehavior } from "./npc-behavior";

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

  it("falls back to idle when no player is visible", () => {
    const quiet = { ...observation, id: "obs-quiet", perception: { ...observation.perception!, nearbyEntities: [], detections: [] } };
    const decision = decideNpcBehavior({ ...request, observation: quiet }, quiet);
    expect(decision.actions[0].type).toBe("npc.idle");
  });
});
