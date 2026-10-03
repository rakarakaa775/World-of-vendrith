import { describe, expect, it } from "vitest";
import { selectNpcSocialInteraction } from "./npc-social-interaction-selection";

describe("NPC social interaction selection", () => {
  it("selects conflict for an enemy relationship", () => {
    const selected = selectNpcSocialInteraction({
      relationship: { targetNpcId: "npc-2", type: "enemy", affinity: -80, trust: 0 },
      socialNeed: 80,
    });
    expect(selected.type).toBe("conflict");
  });

  it("selects help for a trusted positive relationship", () => {
    const selected = selectNpcSocialInteraction({
      relationship: { targetNpcId: "npc-2", type: "friend", affinity: 70, trust: 90 },
      socialNeed: 60,
    });
    expect(selected.type).toBe("help");
  });

  it("uses interaction history without allowing it to override hostility", () => {
    const selected = selectNpcSocialInteraction({
      relationship: { targetNpcId: "npc-2", type: "enemy", affinity: -80, trust: 0 },
      interactionCount: 100,
      socialNeed: 100,
    });
    expect(selected.type).toBe("conflict");
  });

  it("is deterministic for equal candidates", () => {
    const first = selectNpcSocialInteraction({
      relationship: { targetNpcId: "npc-2", type: "neutral", affinity: 0, trust: 0 },
      socialNeed: 60,
    });
    const second = selectNpcSocialInteraction({
      relationship: { targetNpcId: "npc-2", type: "neutral", affinity: 0, trust: 0 },
      socialNeed: 60,
    });
    expect(second).toEqual(first);
    expect(first.type).toBe("conversation");
  });

  it("respects an explicit available interaction set", () => {
    const selected = selectNpcSocialInteraction({
      relationship: { targetNpcId: "npc-2", type: "friend", affinity: 80, trust: 90 },
      socialNeed: 90,
      availableTypes: ["conversation", "trade"],
    });
    expect(selected.type).toBe("conversation");
  });
});
