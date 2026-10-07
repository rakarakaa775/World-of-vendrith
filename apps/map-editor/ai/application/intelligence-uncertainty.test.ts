import { describe, expect, it } from "vitest";
import {
  buildIntelligenceUncertainty,
  isSufficientlyCertain,
  rankClaimsByCertainty,
} from "./intelligence-uncertainty";

describe("Phase 15.3 intelligence uncertainty", () => {
  it("turns raw confidence into an explicit confidence/uncertainty envelope", () => {
    const result = buildIntelligenceUncertainty(
      {
        confidence: 0.8,
        sourceReliability: 0.9,
        supportingObservationCount: 4,
      },
      "direct_observation",
    );

    expect(result.confidence).toBe(0.72);
    expect(result.uncertainty).toBe(0.28);
    expect(result.source).toBe("direct_observation");
  });

  it("reduces confidence deterministically when observations conflict", () => {
    const result = buildIntelligenceUncertainty({
      confidence: 1,
      sourceReliability: 1,
      supportingObservationCount: 3,
      contradictionCount: 1,
    });

    expect(result.confidence).toBe(0.75);
    expect(result.uncertainty).toBe(0.25);
    expect(result.contradictionCount).toBe(1);
  });

  it("never treats an uncertain claim as an absolute fact", () => {
    const result = buildIntelligenceUncertainty({
      confidence: 0.6,
    });

    expect(result.uncertainty).toBe(0.4);
    expect(isSufficientlyCertain(result)).toBe(false);
    expect(isSufficientlyCertain(result, 0.6)).toBe(true);
  });

  it("ranks claims deterministically by confidence and then claim id", () => {
    const a = buildIntelligenceUncertainty({ confidence: 0.9 });
    const b = buildIntelligenceUncertainty({ confidence: 0.9 });
    const c = buildIntelligenceUncertainty({ confidence: 0.4 });

    const ranked = rankClaimsByCertainty([
      { claimId: "claim-c", subjectId: "npc-1", predicate: "enemy", uncertainty: c },
      { claimId: "claim-b", subjectId: "npc-2", predicate: "enemy", uncertainty: b },
      { claimId: "claim-a", subjectId: "npc-3", predicate: "enemy", uncertainty: a },
    ]);

    expect(ranked.map((claim) => claim.claimId)).toEqual([
      "claim-a",
      "claim-b",
      "claim-c",
    ]);
  });

  it("rejects invalid numeric evidence instead of creating ambiguous state", () => {
    expect(() =>
      buildIntelligenceUncertainty({
        confidence: Number.NaN,
      }),
    ).toThrow("value must be finite");

    expect(() =>
      buildIntelligenceUncertainty({
        confidence: 0.5,
        contradictionCount: -1,
      }),
    ).toThrow("contradictionCount must be a non-negative integer");
  });
});
