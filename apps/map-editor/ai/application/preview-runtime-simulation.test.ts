import { describe, expect, it } from "vitest";
import { createMap } from "../../editor/map-document";
import { PreviewRuntimeSimulation } from "./preview-runtime-simulation";
import { buildNpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";

describe("PreviewRuntimeSimulation", () => {
  it("moves the preview NPC toward the nearby player without mutating the map document", async () => {
    const document = createMap("world", null, "exterior", null, 32, 32);
    const originalCells = document.layers[0].cells;
    const simulation = new PreviewRuntimeSimulation(document, [{
      seedKey: "seed-001",
      name: "Test NPC",
      race: "human",
      occupationName: "farmer",
      settlementName: "Crescent Moon Village",
      locationName: "Crescent Moon Village",
    }]);
    const before = simulation.snapshot();
    const npcBefore = before.entities.find(entity => entity.id === "npc:seed-001");
    const player = before.entities.find(entity => entity.id === "preview-player");
    expect(npcBefore?.position).toEqual({ x: 13, y: 16 });
    expect(npcBefore?.state).toMatchObject({
      name: "Test NPC",
      settlementName: "Crescent Moon Village",
      locationName: "Crescent Moon Village",
    });
    expect(player?.position).toEqual({ x: 19, y: 16 });

    const anchoredSimulation = new PreviewRuntimeSimulation(document, [{
      seedKey: "seed-anchored",
      name: "Anchored NPC",
      locationId: "location-001",
      spawnAnchor: { locationId: "location-001", mapId: document.id, position: { x: 4, y: 5 } },
    }]);
    expect(anchoredSimulation.snapshot().entities.find(entity => entity.id === "npc:seed-anchored")?.position)
      .toEqual({ x: 4, y: 5 });

    const result = await simulation.tick();
    const after = simulation.snapshot();
    const npcAfter = after.entities.find(entity => entity.id === "npc:seed-001");

    expect(result.status).toBe("moved");
    expect(npcAfter?.position).toEqual({ x: 14, y: 16 });
    expect(after.state.clock.tick).toBe(1);
    expect(after.state.stateVersion).not.toBe(before.state.stateVersion);
    expect(document.layers[0].cells).toBe(originalCells);
  });

  it("ignores a spawn anchor from another map", () => {
    const document = createMap("world", null, "exterior", null, 8, 8);
    const simulation = new PreviewRuntimeSimulation(document, [{
      seedKey: "seed-cross-map",
      name: "Cross Map NPC",
      locationId: "location-001",
      spawnAnchor: { locationId: "location-001", mapId: "other-map", position: { x: 1, y: 1 } },
    }]);
    expect(simulation.snapshot().entities.find(entity => entity.id === "npc:seed-cross-map")?.position)
      .toEqual({ x: 1, y: 4 });
  });

  it("propagates a validated runtime spawn contract into preview diagnostics", async () => {
    const document = createMap("world", null, "exterior", null, 16, 16);
    const contract = buildNpcRuntimeSpawnContract(
      { archetype: "civilian", capabilities: { behaviors: ["idle", "follow-player"] } },
      { npc_sensing: { hearing_radius: 3, smell_radius: 2, detection_modifier: 1.5 }, npc_movement: { cost_multiplier: 2.5 } },
    );
    const simulation = new PreviewRuntimeSimulation(document, [{
      seedKey: "contract-npc", name: "Contract NPC", runtimeContract: contract,
    }]);
    const before = simulation.diagnostics("npc:contract-npc");
    expect(before?.validation.ok).toBe(true);
    expect(before?.decisionProfile?.archetype).toBe("civilian");
    expect(before?.environmentPolicy?.npc_movement).toEqual({ cost_multiplier: 2.5 });

    const result = await simulation.tick();
    const after = simulation.diagnostics("npc:contract-npc");
    expect(result.status).toBe("moved");
    expect(after?.sensing).toEqual({ hearingRadius: 3, smellRadius: 2, detectionModifier: 1.5 });
    expect(after?.effectiveEnvironmentConditions.npc_movement).toEqual({ cost_multiplier: 2.5 });
    expect(after?.movementCost).toBe(15);
    expect(after?.selectedBehavior).toBe("follow-player");
  });

  it("does not activate an invalid runtime contract", () => {
    const document = createMap("world", null, "exterior", null, 16, 16);
    const simulation = new PreviewRuntimeSimulation(document, [{
      seedKey: "invalid-contract", name: "Invalid NPC",
      runtimeContract: { version: 99, environmentPolicy: { npc_sensing: { hearing_radius: 64 } } } as never,
    }]);
    const npc = simulation.snapshot().entities.find(entity => entity.id === "npc:invalid-contract");
    expect(npc?.state.decisionProfile).toBeUndefined();
    expect(npc?.state.environmentPolicy).toBeUndefined();
    expect(simulation.diagnostics("npc:invalid-contract")?.validation.ok).toBe(false);
  });

  it("routes around a collision cell", async () => {
    const document = createMap("playable", null, "exterior", null, 8, 8);
    const collision = document.layers.find(layer => layer.kind === "collision");
    if (!collision) throw new Error("Collision layer missing");
    collision.cells[4 * document.width + 3] = { tileId: "blocked" };

    const simulation = new PreviewRuntimeSimulation(document);
    const result = await simulation.tick();
    expect(result.status).toBe("moved");
  });
});
