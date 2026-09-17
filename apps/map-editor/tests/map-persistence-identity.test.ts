import { describe, expect, it, vi } from "vitest";
import { createMap } from "../editor/map-document";
import { serializeMapDocument } from "../editor/map-serialization";
import { loadMapDocumentSnapshot } from "../editor/map-persistence";

function runtimeClient(snapshot: unknown) {
  return {
    rpc: vi.fn().mockResolvedValue({
      data: {
        ok: true,
        found: true,
        snapshot,
        map_id: "requested-world",
      },
      error: null,
    }),
    from: vi.fn(),
  } as any;
}

describe("Map persistence identity boundary", () => {
  it("rejects a runtime snapshot whose document id differs from the requested map", async () => {
    const loaded = createMap("world");
    loaded.id = "different-world";

    const client = runtimeClient(serializeMapDocument(loaded));
    const result = await loadMapDocumentSnapshot(client, "requested-world");

    expect(result.document).toBeNull();
  });

  it("rejects a durable fallback whose document id differs from the requested map", async () => {
    const loaded = createMap("world");
    loaded.id = "different-world";

    const client = {
      rpc: vi.fn().mockResolvedValue({
        data: { ok: true, found: false },
        error: null,
      }),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{
            id: "version-1",
            map_id: "requested-world",
            version_number: 1,
            snapshot: serializeMapDocument(loaded),
            created_at: "2026-09-17T00:00:00.000Z",
          }],
          error: null,
        }),
      }),
    } as any;

    const result = await loadMapDocumentSnapshot(client, "requested-world");

    expect(result.document).toBeNull();
  });
});
