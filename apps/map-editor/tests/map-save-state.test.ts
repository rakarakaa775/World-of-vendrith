import { describe, expect, it } from "vitest";
import { createMap } from "../editor/map-document";
import { resolveSaveDocument, type SaveConnection } from "../editor/map-save-state";

describe("Map save state boundary", () => {
  it("uses the local document while taking baseline and version from the resolved connection", () => {
    const local = createMap("world");
    local.name = "Local edit";
    const baseline = createMap("world");
    baseline.id = local.id;
    baseline.name = "Remote baseline";
    const connection: SaveConnection = { mapId: local.id, document: baseline, version: 7 };

    expect(resolveSaveDocument(local, connection)).toBe(local);
    expect(connection.document.name).toBe("Remote baseline");
    expect(connection.version).toBe(7);
  });

  it("rejects a local document that is not the connected World Map", () => {
    const local = createMap("region");
    const connection: SaveConnection = { mapId: local.id, document: createMap("world"), version: 1 };
    connection.document.id = local.id;

    expect(() => resolveSaveDocument(local, connection)).toThrow("Active map is not the connected World Map");
  });
});
