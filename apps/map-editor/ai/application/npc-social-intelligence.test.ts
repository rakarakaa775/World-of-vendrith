import { describe, expect, it } from "vitest";
import {
  applyNpcReputationInteraction,
  chooseNpcGroupBehavior,
  chooseNpcSocialResponse,
  createNpcReputationStore,
  createNpcSocialMemoryStore,
  evaluateNpcFriendship,
  evaluateNpcRivalry,
  recordNpcSocialMemory,
  updateNpcRelationshipFromResponse,
} from "./npc-social-intelligence";

describe("NPC social intelligence", () => {
  it("67 chooses a deterministic response for each interaction", () => {
    const response = chooseNpcSocialResponse("conversation", {
      targetNpcId: "npc-2", type: "friend", affinity: 60, trust: 50,
    });
    expect(response).toMatchObject({ interactionType: "conversation", disposition: "warm" });
    expect(response.affinityDelta).toBeGreaterThan(0);
  });

  it("67b feeds stored reputation back into social disposition", () => {
    const response = chooseNpcSocialResponse(
      "conversation",
      { targetNpcId: "npc-2", type: "neutral", affinity: 20, trust: 20 },
      -70,
    );
    expect(response.disposition).toBe("hostile");
  });

  it("68 recognizes friendship from affinity and trust", () => {
    expect(evaluateNpcFriendship({ targetNpcId: "npc-2", type: "neutral", affinity: 50, trust: 40 })).toBe(true);
    expect(evaluateNpcFriendship({ targetNpcId: "npc-2", type: "neutral", affinity: 44, trust: 40 })).toBe(false);
  });

  it("69 recognizes rivalry without inventing an enemy state", () => {
    expect(evaluateNpcRivalry({ targetNpcId: "npc-2", type: "rival", affinity: 10, trust: 20 })).toBe(true);
    expect(evaluateNpcRivalry({ targetNpcId: "npc-2", type: "neutral", affinity: 10, trust: 20 })).toBe(false);
  });

  it("70 applies bounded trust through explicit social response", () => {
    const updated = updateNpcRelationshipFromResponse(
      { targetNpcId: "npc-2", type: "friend", affinity: 90, trust: 98 },
      chooseNpcSocialResponse("help", { targetNpcId: "npc-2", type: "friend", affinity: 90, trust: 98 }),
    );
    expect(updated.trust).toBe(100);
  });

  it("71 updates reputation deterministically", () => {
    const response = chooseNpcSocialResponse("help", { targetNpcId: "npc-2", type: "friend", affinity: 50, trust: 60 });
    const reputation = applyNpcReputationInteraction(undefined, "npc-1", response, 10, { ok: true, checks: [{ name: "execution", ok: true }] });
    expect(reputation.score).toBeGreaterThan(0);
    expect(reputation.positiveInteractions).toBe(1);
  });

  it("72 chooses cooperation for a cohesive group", () => {
    const group = chooseNpcGroupBehavior({
      npcId: "npc-1",
      memberNpcIds: ["npc-1", "npc-2", "npc-3"],
      relationships: [
        { targetNpcId: "npc-2", type: "friend", affinity: 80, trust: 80 },
        { targetNpcId: "npc-3", type: "ally", affinity: 70, trust: 70 },
      ],
    });
    expect(group.action).toBe("cooperate");
  });

  it("72 chooses avoidance for strongly negative group cohesion", () => {
    const group = chooseNpcGroupBehavior({
      npcId: "npc-1",
      memberNpcIds: ["npc-1", "npc-2"],
      relationships: [{ targetNpcId: "npc-2", type: "enemy", affinity: -90, trust: 0 }],
    });
    expect(group.action).toBe("avoid");
  });

  it("73 records durable social memories and can list them", () => {
    const store = createNpcSocialMemoryStore();
    const interaction = {
      interactionId: "i-1",
      sourceNpcId: "npc-1",
      targetNpcId: "npc-2",
      type: "conversation" as const,
      affinityDelta: 2,
      trustDelta: 2,
      tick: 10,
    };
    const response = chooseNpcSocialResponse("conversation", {
      targetNpcId: "npc-2", type: "friend", affinity: 50, trust: 50,
    });
    recordNpcSocialMemory(store, interaction, response, { ok: true, checks: [{ name: "execution", ok: true }] });
    expect(store.list("npc-1", "npc-2")).toHaveLength(1);
    expect(store.list("npc-1", "npc-2")[0].interactionId).toBe("i-1");
  });

  it("73 keeps social memories isolated by source and target", () => {
    const store = createNpcSocialMemoryStore();
    const response = chooseNpcSocialResponse("conversation");
    recordNpcSocialMemory(store, {
      interactionId: "i-1", sourceNpcId: "a", targetNpcId: "b", type: "conversation", tick: 1,
    }, response);
    recordNpcSocialMemory(store, {
      interactionId: "i-2", sourceNpcId: "a", targetNpcId: "c", type: "conversation", tick: 2,
    }, response);
    expect(store.list("a", "b")).toHaveLength(1);
    expect(store.list("a", "c")).toHaveLength(1);
  });


  it("does not remember an unverified social interaction or duplicate a verified one", () => {
    const store = createNpcSocialMemoryStore();
    const interaction = { interactionId: "i-verified", sourceNpcId: "a", targetNpcId: "b", type: "conversation" as const, tick: 3 };
    const response = chooseNpcSocialResponse("conversation");
    expect(recordNpcSocialMemory(store, interaction, response, { ok: false, checks: [{ name: "execution", ok: false }] })).toBeUndefined();
    expect(store.list("a", "b")).toHaveLength(0);
    recordNpcSocialMemory(store, interaction, response, { ok: true, checks: [{ name: "execution", ok: true }] });
    recordNpcSocialMemory(store, interaction, response, { ok: true, checks: [{ name: "execution", ok: true }] });
    expect(store.list("a", "b")).toHaveLength(1);
  });

  it("does not update reputation when verification fails", () => {
    const response = chooseNpcSocialResponse("help");
    expect(applyNpcReputationInteraction(undefined, "npc-1", response, 10, { ok: false, checks: [{ name: "execution", ok: false }] })).toBeUndefined();
  });

  it("keeps the reputation store persistent per NPC", () => {
    const store = createNpcReputationStore();
    const response = chooseNpcSocialResponse("help", { targetNpcId: "b", type: "friend", affinity: 60, trust: 70 });
    store.set(applyNpcReputationInteraction(undefined, "a", response, 1));
    expect(store.get("a")?.positiveInteractions).toBe(1);
    expect(store.get("b")).toBeUndefined();
  });
});
