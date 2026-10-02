import { describe, expect, it } from "vitest";
import { createMap } from "../../editor/map-document";
import { PreviewRuntimeSimulation } from "./preview-runtime-simulation";

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

    const result = await simulation.tick();
    const after = simulation.snapshot();
    const npcAfter = after.entities.find(entity => entity.id === "npc:seed-001");

    expect(result.status).toBe("moved");
    expect(npcAfter?.position).toEqual({ x: 14, y: 16 });
    expect(after.state.clock.tick).toBe(1);
    expect(after.state.stateVersion).not.toBe(before.state.stateVersion);
    expect(document.layers[0].cells).toBe(originalCells);
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
