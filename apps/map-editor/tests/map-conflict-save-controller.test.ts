import { describe, expect, it, vi } from 'vitest';
import { createMap } from '../editor/map-document';
import { saveWithConflictDetection } from '../editor/map-conflict-save-controller';
import { serializeMapDocument } from '../editor/map-serialization';

function clientForRemote(remote: ReturnType<typeof createMap>, remoteVersion: number) {
  return {
    rpc: vi.fn()
      .mockResolvedValueOnce({
        data: {
          ok: true,
          found: true,
          map_id: remote.id,
          version_number: remoteVersion,
          snapshot: JSON.parse(serializeMapDocument(remote)),
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{
          status: 'committed',
          version_id: 'version-next',
          version_number: remoteVersion + 1,
          current_version: remoteVersion + 1,
          projection_status: 'committed',
          projection_error: null,
        }],
        error: null,
      }),
  } as any;
}

describe('Map conflict save controller', () => {
  it('rebases a conflict-free Save Slot edit onto a newer authoritative version', async () => {
    const base = createMap('world');
    base.id = 'authoritative-world';
    const local = structuredClone(base);
    local.layers[0].cells[0].tileId = 'grass';
    const remote = structuredClone(base);
    remote.layers[0].cells[1].tileId = 'sand';

    const client = clientForRemote(remote, 4);
    const result = await saveWithConflictDetection(client, local, base, 3);

    expect(result.status).toBe('committed');
    if (result.status !== 'committed') return;
    expect(result.version).toBe(5);
    expect(result.document.layers[0].cells[0].tileId).toBe('grass');
    expect(result.document.layers[0].cells[1].tileId).toBe('sand');
    expect(client.rpc).toHaveBeenCalledTimes(2);
    expect(client.rpc.mock.calls[1][0]).toBe('map_editor_commit_merge_v1');
    expect(client.rpc.mock.calls[1][1].p_expected_version).toBe(4);
  });

  it('still returns a conflict when local and remote changed the same cell differently', async () => {
    const base = createMap('world');
    base.id = 'authoritative-world';
    const local = structuredClone(base);
    local.layers[0].cells[0].tileId = 'grass';
    const remote = structuredClone(base);
    remote.layers[0].cells[0].tileId = 'sand';

    const client = clientForRemote(remote, 4);
    const result = await saveWithConflictDetection(client, local, base, 3);

    expect(result.status).toBe('conflict');
    expect(client.rpc).toHaveBeenCalledTimes(1);
  });
});
