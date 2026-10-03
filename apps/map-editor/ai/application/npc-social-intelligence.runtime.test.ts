import { describe, expect, it } from "vitest";
import { createNpcRelationshipRuntimeStore } from "./npc-relationship-runtime-store";
import { createNpcRelationshipMemoryStore } from "./npc-social-interaction-schema";
import { createNpcReputationStore, createNpcSocialMemoryStore } from "./npc-social-intelligence";
import { runNpcRuntimeTick } from "./npc-runtime-loop";
import { createRuntimeObservationPort } from "./runtime-observation";
import { createRuntimeWorldActionPort, createRuntimeWorldObservationSource, createRuntimeWorldVerificationPort } from "./runtime-world-adapter";
import type { RuntimeEntity } from "../domain/runtime";
import type { NavigationGrid } from "../domain/runtime-navigation";
import type { RuntimeWorldStore } from "./runtime-world-adapter";

function socialStore(): RuntimeWorldStore {
  let snapshot = {
    state: { worldId: "social-world", clock: { tick: 1, day: 1, hour: 10, minute: 0, season: "spring" }, activeEventIds: [], stateVersion: "s1" },
    entities: [
      {
        id: "npc-1", kind: "npc" as const, mapId: "region-1", position: { x: 0, y: 0 },
        state: {
          npcNeeds: { hunger: 10, energy: 90, social: 90, safety: 90 },
          decisionProfile: {
            archetype: "civilian",
            capabilities: { goals: ["socialize"], behaviors: ["socialize"] },
            relationships: [{ targetNpcId: "npc-2", type: "friend" as const, affinity: 60, trust: 60 }],
          },
        },
      },
      { id: "npc-2", kind: "npc" as const, mapId: "region-1", position: { x: 0, y: 0 } },
    ],
  };
  const grid: NavigationGrid = { width: 2, height: 2, blocked: Array(4).fill(false) };
  return {
    snapshot: () => snapshot,
    grid: () => grid,
    updateEntity(entity: RuntimeEntity) {
      snapshot = { ...snapshot, entities: snapshot.entities.map(candidate => candidate.id === entity.id ? entity : candidate), state: { ...snapshot.state, stateVersion: "s2" } };
    },
  };
}

describe("NPC social intelligence runtime", () => {
  it("executes a social response and persists relationship, memory, and reputation", async () => {
    const store = socialStore();
    const relationshipStore = createNpcRelationshipRuntimeStore();
    const relationshipMemoryStore = createNpcRelationshipMemoryStore();
    const socialMemoryStore = createNpcSocialMemoryStore();
    const reputationStore = createNpcReputationStore();
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("specialized NPC loop should not use generic decision"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };

    const result = await runNpcRuntimeTick(
      { id: "social-runtime-1", surface: "game", intelligence: "npc", goal: "Socialize", observation: {} as never },
      ports,
      store,
      undefined,
      relationshipStore,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      relationshipMemoryStore,
      socialMemoryStore,
      reputationStore,
    );

    expect(result.behavior?.kind).toBe("socialize");
    expect(result.execution?.ok).toBe(true);
    expect(result.verification?.ok).toBe(true);
    expect(relationshipStore.get("npc-1")?.[0].affinity).toBeGreaterThan(60);
    expect(relationshipStore.get("npc-1")?.[0].trust).toBeGreaterThan(60);
    expect(socialMemoryStore.list("npc-1", "npc-2")).toHaveLength(1);
    expect(reputationStore.get("npc-1")?.positiveInteractions).toBe(1);
  });

  it("records a new social interaction when a later tick creates a new activity", async () => {
    const store = socialStore();
    const relationshipStore = createNpcRelationshipRuntimeStore();
    const relationshipMemoryStore = createNpcRelationshipMemoryStore();
    const socialMemoryStore = createNpcSocialMemoryStore();
    const reputationStore = createNpcReputationStore();
    const observation = createRuntimeObservationPort(createRuntimeWorldObservationSource(store));
    const ports = {
      observation,
      decision: { decide: async () => { throw new Error("specialized NPC loop should not use generic decision"); } },
      action: createRuntimeWorldActionPort(store),
      verification: createRuntimeWorldVerificationPort(store),
    };
    const args = [
      { id: "social-runtime-a", surface: "game" as const, intelligence: "npc" as const, goal: "Socialize", observation: {} as never },
      ports,
      store,
      undefined,
      relationshipStore,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      relationshipMemoryStore,
      socialMemoryStore,
      reputationStore,
    ] as const;

    await runNpcRuntimeTick(...args);
    await runNpcRuntimeTick({ ...args[0], id: "social-runtime-a" }, ...args.slice(1));

    expect(socialMemoryStore.list("npc-1", "npc-2")).toHaveLength(2);
    expect(reputationStore.get("npc-1")?.positiveInteractions).toBe(2);
  });
});
