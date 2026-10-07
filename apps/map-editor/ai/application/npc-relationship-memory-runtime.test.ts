import { describe, expect, it } from "vitest";
import {
  applyNpcSocialInteractionAndRelationshipMemory,
  applyNpcSocialInteractionToRelationships,
} from "./npc-relationship-memory-runtime";
import { createNpcRelationshipMemoryStore } from "./npc-social-interaction-schema";
import type { VerificationResult } from "../domain/types";

const verified: VerificationResult = { ok: true } as VerificationResult;
const rejected: VerificationResult = { ok: false } as VerificationResult;

const relationships = [
  { targetNpcId: "npc-2", type: "friend" as const, affinity: 90, trust: 95 },
  { targetNpcId: "npc-3", type: "rival" as const, affinity: -90, trust: 5 },
];

const interaction = {
  interactionId: "i-1",
  sourceNpcId: "npc-1",
  targetNpcId: "npc-2",
  type: "conversation" as const,
  affinityDelta: 20,
  trustDelta: 10,
  tick: 3,
};

describe("NPC relationship memory runtime", () => {
  it("applies explicit deltas to the directional relationship", () => {
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      interaction,
      verified,
    );
    expect(result.changed).toBe(true);
    expect(result.relationship).toMatchObject({ targetNpcId: "npc-2", affinity: 100, trust: 100 });
    expect(result.memory).toMatchObject({ interactionCount: 1, affinityDeltaTotal: 20, trustDeltaTotal: 10 });
  });
  it("clamps negative deltas without changing relationship type", () => {
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      { ...interaction, interactionId: "i-2", targetNpcId: "npc-3", affinityDelta: -30, trustDelta: -20 },
      verified,
    );
    expect(result.relationship).toMatchObject({ targetNpcId: "npc-3", type: "rival", affinity: -100, trust: 0 });
  });

  it("leaves relationships unchanged when the target has no explicit relationship", () => {
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      { ...interaction, targetNpcId: "npc-9" },
      verified,
    );
    expect(result.changed).toBe(false);
    expect(result.relationships).toEqual(relationships);
    expect(result.memory).toBeDefined();
  });

  it("does not create a reciprocal relationship", () => {
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      interaction,
      verified,
    );
    expect(result.relationships.some(item => item.targetNpcId === "npc-1")).toBe(false);
  });
  it("respects source-to-target direction", () => {
    const result = applyNpcSocialInteractionToRelationships(
      relationships,
      { ...interaction, sourceNpcId: "npc-2", targetNpcId: "npc-1" },
    );
    expect(result).toEqual(relationships);
  });

  it("records an interaction without changing relationships when no deltas are explicit", () => {
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      { ...interaction, interactionId: "i-no-delta", affinityDelta: undefined, trustDelta: undefined },
      verified,
    );
    expect(result.changed).toBe(false);
    expect(result.relationships).toEqual(relationships);
    expect(result.memory).toMatchObject({ interactionCount: 1, affinityDeltaTotal: 0, trustDeltaTotal: 0 });
  });

  it("ignores invalid interactions", () => {
    const store = createNpcRelationshipMemoryStore();
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      { ...interaction, type: "attack" } as never,
      verified,
      store,
    );
    expect(result.changed).toBe(false);
    expect(result.relationships).toEqual(relationships);
    expect(store.get("npc-1", "npc-2")).toBeUndefined();
  });

  it("does not persist relationship memory when verification is rejected", () => {
    const store = createNpcRelationshipMemoryStore();
    const result = applyNpcSocialInteractionAndRelationshipMemory(
      relationships,
      interaction,
      rejected,
      store,
    );
    expect(result.changed).toBe(false);
    expect(result.relationships).toEqual(relationships);
    expect(result.memory).toBeUndefined();
    expect(store.get("npc-1", "npc-2")).toBeUndefined();
  });

  it("accumulates repeated interaction deltas", () => {
    const store = createNpcRelationshipMemoryStore();
    const first = applyNpcSocialInteractionAndRelationshipMemory(relationships, interaction, verified, store);
    const second = applyNpcSocialInteractionAndRelationshipMemory(
      first.relationships,
      { ...interaction, interactionId: "i-2", tick: 4, affinityDelta: -5, trustDelta: -2 },
      verified,
      store,
    );
    expect(second.relationship).toMatchObject({ affinity: 95, trust: 98 });
    expect(second.memory).toMatchObject({ interactionCount: 2, affinityDeltaTotal: 15, trustDeltaTotal: 8 });
  });
});
