import { describe, expect, it } from "vitest";
import { rankNpcRelationshipTargets, scoreNpcRelationshipTarget } from "./npc-relationship-intelligence";
import { createNpcRelationshipMemoryStore } from "./npc-social-interaction-schema";

describe("NPC relationship intelligence", () => {
  it("scores family above an otherwise similar neutral relationship", () => {
    const family = scoreNpcRelationshipTarget({ targetNpcId: "npc-family", type: "family", affinity: 20, trust: 20 }, "npc-family");
    const neutral = scoreNpcRelationshipTarget({ targetNpcId: "npc-neutral", type: "neutral", affinity: 20, trust: 20 }, "npc-neutral");
    expect(family.utility).toBeGreaterThan(neutral.utility);
  });

  it("uses repeated interaction memory as a bounded familiarity signal", () => {
    const store = createNpcRelationshipMemoryStore();
    for (let i = 0; i < 20; i += 1) {
      store.set({ sourceNpcId: "npc-1", targetNpcId: "npc-2", interactionCount: i + 1, affinityDeltaTotal: 0, trustDeltaTotal: 0 });
    }
    const scored = scoreNpcRelationshipTarget({ targetNpcId: "npc-2", type: "friend", affinity: 0, trust: 0 }, "npc-2", store, "npc-1");
    expect(scored.interactionCount).toBe(20);
    expect(scored.utility).toBe(35);
  });

  it("filters strongly negative relationships and keeps deterministic ID order for ties", () => {
    const ranked = rankNpcRelationshipTargets(
      [
        { targetNpcId: "npc-b", type: "neutral", affinity: 0, trust: 0 },
        { targetNpcId: "npc-a", type: "neutral", affinity: 0, trust: 0 },
        { targetNpcId: "npc-enemy", type: "enemy", affinity: 0, trust: 0 },
      ],
      ["npc-enemy", "npc-b", "npc-a"],
      "npc-1",
    );
    expect(ranked.map(candidate => candidate.targetNpcId)).toEqual(["npc-a", "npc-b"]);
  });

  it("allows an untracked target only when its neutral utility is acceptable", () => {
    const scored = scoreNpcRelationshipTarget(undefined, "npc-untracked");
    expect(scored).toMatchObject({ targetNpcId: "npc-untracked", relationshipType: "untracked", utility: 0 });
  });
});
