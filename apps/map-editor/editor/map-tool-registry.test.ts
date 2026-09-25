import { describe, expect, it } from "vitest";
import { createMap } from "./map-document";
import { getMapEditorPalette, isMapEditorToolAllowed, mapEditorLevelKey } from "./map-tool-registry";

describe("map editor tool registry", () => {
  it("keeps World focused on macro terrain tools", () => {
    const world = createMap("World", "world", 64, 64);
    expect(mapEditorLevelKey(world)).toBe("world");
    expect(isMapEditorToolAllowed(world, "terrain")).toBe(true);
    expect(isMapEditorToolAllowed(world, "building")).toBe(false);
    expect(isMapEditorToolAllowed(world, "settlement")).toBe(false);
    expect(isMapEditorToolAllowed(world, "collision")).toBe(false);
  });

  it("gives Region settlement, infrastructure, and nature landmark tools", () => {
    const region = createMap("Region", "region", 32, 32);
    expect(mapEditorLevelKey(region)).toBe("region");
    expect(isMapEditorToolAllowed(region, "terrain")).toBe(true);
    expect(isMapEditorToolAllowed(region, "settlement")).toBe(true);
    expect(isMapEditorToolAllowed(region, "infrastructure")).toBe(true);
    expect(isMapEditorToolAllowed(region, "nature")).toBe(true);
    expect(isMapEditorToolAllowed(region, "building")).toBe(false);
    expect(isMapEditorToolAllowed(region, "collision")).toBe(false);
  });

  it("keeps individual trees and buildings in Playable exterior", () => {
    const playable = createMap("Village", "playable", 24, 24);
    expect(mapEditorLevelKey(playable)).toBe("playable");
    expect(isMapEditorToolAllowed(playable, "building")).toBe(true);
    expect(isMapEditorToolAllowed(playable, "nature")).toBe(true);
    expect(isMapEditorToolAllowed(playable, "collision")).toBe(true);
    expect(isMapEditorToolAllowed(playable, "settlement")).toBe(false);
  });

  it("separates Interior tools from exterior tools", () => {
    const interior = createMap("House Interior", "playable", 16, 16, 32, "interior");
    expect(mapEditorLevelKey(interior)).toBe("interior");
    expect(isMapEditorToolAllowed(interior, "floor")).toBe(true);
    expect(isMapEditorToolAllowed(interior, "wall")).toBe(true);
    expect(isMapEditorToolAllowed(interior, "door")).toBe(true);
    expect(isMapEditorToolAllowed(interior, "furniture")).toBe(true);
    expect(isMapEditorToolAllowed(interior, "building")).toBe(false);
    expect(isMapEditorToolAllowed(interior, "nature")).toBe(false);
    expect(isMapEditorToolAllowed(interior, "collision")).toBe(true);
  });

  it("returns human-readable level sections", () => {
    const region = createMap("Region", "region", 16, 16);
    expect(getMapEditorPalette(region).map(section => section.label)).toEqual([
      "Navigation",
      "Region Terrain",
      "Settlements & Infrastructure",
      "Nature Landmarks",
    ]);
  });
});
