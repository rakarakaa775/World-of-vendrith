import { describe, expect, it } from "vitest";
import { applyNpcSocialInteraction, createNpcRelationshipMemoryStore, validateNpcSocialInteraction } from "./npc-social-interaction-schema";
import type { VerificationResult } from "../domain/types";

const verified: VerificationResult = { ok: true } as VerificationResult;
const rejected: VerificationResult = { ok: false } as VerificationResult;

const interaction = {
  interactionId: "i-1",
  sourceNpcId: "npc-1",
  targetNpcId: "npc-2",
  type: "conversation" as const,
  affinityDelta: 10,
  trustDelta: 5,
  tick: 3,
};

describe("NPC social interaction", () => {
  it("accepts an explicit interaction", () => {
    expect(validateNpcSocialInteraction(interaction).ok).toBe(true);
  });
  it("rejects self-interactions and malformed deltas", () => {
    expect(validateNpcSocialInteraction({ ...interaction, targetNpcId: "npc-1" }).ok).toBe(false);
    expect(validateNpcSocialInteraction({ ...interaction, affinityDelta: 101 }).ok).toBe(false);
  });
  it("keeps interaction history without creating runtime effects by itself", () => {
    const store = createNpcRelationshipMemoryStore();
    expect(applyNpcSocialInteraction(interaction, store, verified)).toMatchObject({ interactionCount: 1, affinityDeltaTotal: 10, trustDeltaTotal: 5 });
    expect(applyNpcSocialInteraction({ ...interaction, interactionId: "i-2", tick: 4, affinityDelta: -2 }, store, verified)).toMatchObject({ interactionCount: 2, affinityDeltaTotal: 8, trustDeltaTotal: 10 });
  });
  it("does not double-apply a retried interaction", () => {
    const store = createNpcRelationshipMemoryStore();
    const first = applyNpcSocialInteraction(interaction, store, verified);
    const retry = applyNpcSocialInteraction(interaction, store, verified);

    expect(retry).toEqual(first);
    expect(store.get("npc-1", "npc-2")).toMatchObject({
      interactionCount: 1,
      affinityDeltaTotal: 10,
      trustDeltaTotal: 5,
      lastInteractionId: "i-1",
    });
  });

  it("does not persist when verification is rejected", () => {
    const store = createNpcRelationshipMemoryStore();
    expect(applyNpcSocialInteraction(interaction, store, rejected)).toBeUndefined();
    expect(store.get("npc-1", "npc-2")).toBeUndefined();
  });

  it("ignores invalid interactions", () => {
    const store = createNpcRelationshipMemoryStore();
    expect(applyNpcSocialInteraction({ ...interaction, type: "attack" } as never, store, verified)).toBeUndefined();
    expect(store.get("npc-1", "npc-2")).toBeUndefined();
  });
});
