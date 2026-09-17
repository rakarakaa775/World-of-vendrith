import { describe, expect, it, vi } from "vitest";
import { createMap } from "../editor/map-document";
import { createMapDocumentAutosaver } from "../editor/map-persistence";

describe("Map persistence autosave boundary", () => {
  it("keeps the latest scheduled document when multiple edits arrive before flush", async () => {
    const calls: unknown[] = [];
    const client = {
      rpc: vi.fn().mockImplementation(async (_name: string, args: any) => {
        calls.push(args.p_snapshot);
        return { data: { ok: true, found: true }, error: null };
      }),
    } as any;

    const journal = {
      write: vi.fn(),
      read: vi.fn().mockReturnValue(null),
      has: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
    } as any;

    const autosaver = createMapDocumentAutosaver(client, 60_000, journal);
    const first = createMap("world");
    const second = { ...first, name: "Latest edit" };

    autosaver.schedule(first, "version-1");
    autosaver.schedule(second, "version-1");
    await autosaver.flush();

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ document: expect.objectContaining({ name: "Latest edit" }) });
  });

  it("does not start another write when there is nothing pending after flush", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
    } as any;
    const journal = {
      write: vi.fn(),
      read: vi.fn().mockReturnValue(null),
      has: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
    } as any;

    const autosaver = createMapDocumentAutosaver(client, 60_000, journal);
    await autosaver.flush();

    expect(client.rpc).not.toHaveBeenCalled();
  });
});
