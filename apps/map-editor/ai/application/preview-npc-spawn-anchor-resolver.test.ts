import { describe, expect, it } from "vitest";
import type { PreviewNpcSeed } from "./preview-runtime-simulation";
import { resolvePreviewNpcSpawnAnchors } from "./preview-npc-spawn-anchor-resolver";

const seed: PreviewNpcSeed = {
  seedKey: "CRESCENT-001",
  name: "Aldren Vale",
  locationId: "location-village",
};

describe("resolvePreviewNpcSpawnAnchors", () => {
  it("resolves an explicit NPC placement for the seed location", () => {
    const result = resolvePreviewNpcSpawnAnchors(
      [seed],
      [{ id: "map-village", location_id: "location-village" }],
      [{
        map_id: "map-village",
        entity_type: "npc",
        entity_id: null,
        x: 7,
        y: 4,
        properties: { seed_key: "CRESCENT-001" },
      }],
    );

    expect(result.get(seed.seedKey)).toEqual({
      locationId: "location-village",
      mapId: "map-village",
      position: { x: 7, y: 4 },
    });
  });

  it("fails closed when there is no authoritative NPC placement", () => {
    const result = resolvePreviewNpcSpawnAnchors(
      [seed],
      [{ id: "map-village", location_id: "location-village" }],
      [],
    );

    expect(result.has(seed.seedKey)).toBe(false);
  });

  it("ignores placements from another location or entity type", () => {
    const result = resolvePreviewNpcSpawnAnchors(
      [seed],
      [{ id: "map-village", location_id: "location-village" }],
      [{
        map_id: "map-village",
        entity_type: "building",
        entity_id: null,
        x: 7,
        y: 4,
        properties: { seed_key: "CRESCENT-001" },
      }],
    );

    expect(result.has(seed.seedKey)).toBe(false);
  });
});
