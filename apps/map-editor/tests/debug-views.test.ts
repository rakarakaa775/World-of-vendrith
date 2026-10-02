import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { DEFAULT_DEBUG_VIEW_STATE, setDebugViewEnabled, toggleDebugView } from "../editor/debug-views";

describe("debug view state", () => {
  it("toggles the grid projection without mutating the source document", () => {
    const document = createMap("world");
    const before = JSON.stringify(document);
    const state = toggleDebugView(DEFAULT_DEBUG_VIEW_STATE, "grid");

    expect(state.grid).toBe(true);
    expect(DEFAULT_DEBUG_VIEW_STATE.grid).toBe(false);

    const terrainIds = toggleDebugView(state, "terrainId");
    expect(terrainIds.terrainId).toBe(true);
    expect(state.terrainId).toBe(false);

    const collision = toggleDebugView(terrainIds, "collision");
    expect(collision.collision).toBe(true);
    expect(terrainIds.collision).toBe(false);
    expect(JSON.stringify(document)).toBe(before);
  });

  it("returns the same state when the requested value is already active", () => {
    const enabled = toggleDebugView(DEFAULT_DEBUG_VIEW_STATE, "grid");
    const unchanged = setDebugViewEnabled(enabled, "grid", true);

    expect(unchanged).toBe(enabled);
    expect(unchanged.grid).toBe(true);
  });
});



