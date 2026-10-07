import { describe, expect, it } from "vitest";
import {
  adaptIntelligenceToDecision,
  buildFactionIntelligence,
  buildNpcIntelligenceAwareness,
  createIntelligenceClaim,
  decayIntelligenceClaim,
  intelligenceClaimsToEvidence,
  propagateIntelligenceClaim,
  resolveBeliefs,
} from "./intelligence-runtime";
import type { RuntimeObservation } from "../domain/runtime";

function claim(id: string, value: boolean | string = true, confidence = 1) {
  return createIntelligenceClaim({
    id,
    subjectId: "npc-2",
    predicate: "enemy",
    value,
    source: "direct-observation",
    confidence,
    observedTick: 0,
    lastConfirmedTick: 0,
  });
}

describe("Phase 15 intelligence runtime", () => {
  it("creates explicit confidence and uncertainty", () => {
    const result = claim("a", true, 0.8);
    expect(result.confidence).toBe(0.8);
    expect(result.uncertainty).toBe(0.2);
  });

  it("propagates information with bounded transmission loss", () => {
    const result = propagateIntelligenceClaim(
      claim("a", true, 1),
      { sourceReliability: 0.9, transmissionLoss: 0.1, maxHops: 3 },
      1,
    );
    expect(result.confidence).toBeCloseTo(0.81);
    expect(result.source).toBe("trusted-agent");
    expect(result.supportingClaimIds).toContain("a");
  });

  it("rejects propagation beyond policy limits", () => {
    expect(() => propagateIntelligenceClaim(claim("a"), { maxHops: 1 }, 2)).toThrow("maxHops");
  });

  it("decays confidence as information becomes old", () => {
    const result = decayIntelligenceClaim(
      { ...claim("a"), lastConfirmedTick: 0 },
      100,
      100,
    );
    expect(result.confidence).toBeCloseTo(0.5);
    expect(result.uncertainty).toBeCloseTo(0.5);
  });

  it("resolves conflicting beliefs deterministically", () => {
    const strong = claim("strong", true, 0.9);
    const weak = claim("weak", false, 0.4);
    const beliefs = resolveBeliefs([weak, strong], 0);
    expect(beliefs).toHaveLength(1);
    expect(beliefs[0].id).toBe("strong");
  });

  it("marks low-confidence beliefs stale", () => {
    const beliefs = resolveBeliefs([claim("old", true, 0.2)], 0);
    expect(beliefs[0].stale).toBe(true);
  });

  it("builds faction intelligence without mutating the source claims", () => {
    const source = claim("report-1", true, 1);
    const faction = buildFactionIntelligence({
      factionId: "faction-a",
      memberNpcIds: ["npc-2", "npc-1", "npc-1"],
      knownClaims: [source],
    });
    expect(faction.memberNpcIds).toEqual(["npc-1", "npc-2"]);
    expect(faction.claims[0].source).toBe("faction-report");
    expect(source.source).toBe("direct-observation");
  });

  it("creates world awareness from the existing runtime observation", () => {
    const observation: RuntimeObservation = {
      id: "obs-1",
      surface: "game",
      intelligence: "world",
      state: {
        worldId: "world-1",
        clock: { tick: 10, day: 1, hour: 21, minute: 0, season: "winter" },
        activeEventIds: ["storm-1"],
        stateVersion: "v1",
        environmentConditions: { hazards: ["storm"] },
      },
      perception: {
        self: {
          id: "npc-1",
          kind: "npc",
          mapId: "map-1",
          position: { x: 1, y: 1 },
        },
        nearbyEntities: [],
        detections: [],
        visibleMapIds: ["map-1"],
        environment: {
          weather: "storm",
          season: "winter",
          conditions: { hazards: ["storm"] },
        },
      },
      facts: [],
    };
    const awareness = buildNpcIntelligenceAwareness(observation, [claim("danger", true, 0.4)]);
    expect(awareness.npcId).toBe("npc-1");
    expect(awareness.world.hazards).toContain("storm");
    expect(awareness.highestPriorityUnknowns.length).toBeGreaterThan(0);
  });

  it("adapts action choice to information quality and risk tolerance", () => {
    expect(adaptIntelligenceToDecision({ claims: [claim("a", true, 0.9)], goal: "enemy", riskTolerance: 0.5 }).recommendedAction).toBe("act");
    expect(adaptIntelligenceToDecision({ claims: [claim("a", true, 0.2)], goal: "enemy", riskTolerance: 0.1 }).recommendedAction).toBe("avoid");
    expect(adaptIntelligenceToDecision({ claims: [], goal: "enemy", riskTolerance: 0.1 }).recommendedAction).toBe("seek-confirmation");
  });

  it("exposes intelligence as evidence without granting authority", () => {
    const evidence = intelligenceClaimsToEvidence([claim("a", true, 0.8)]);
    expect(evidence[0].kind).toBe("inference");
    expect(evidence[0].confidence).toBe("high");
  });

  it("never produces confidence outside the valid range", () => {
    const result = claim("a", true, 100);
    expect(result.confidence).toBe(1);
    expect(result.uncertainty).toBe(0);
  });
});
