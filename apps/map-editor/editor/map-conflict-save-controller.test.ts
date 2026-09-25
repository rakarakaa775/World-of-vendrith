import { describe, expect, it, vi } from 'vitest';
import { createMap } from './map-document';
import { serializeMapDocument } from './map-serialization';
import { saveWithConflictDetection } from './map-conflict-save-controller';

const map = (name: string) => {
  const document = createMap('world');
  document.id = 'm1';
  document.name = name;
  return document;
};

const client = (responses: unknown[]) => {
  const rpc = vi.fn();
  for (const response of responses) rpc.mockResolvedValueOnce({ data: response, error: null });
  return { rpc };
};

describe('saveWithConflictDetection', () => {
  it('rebases independent local and remote edits onto the newer authoritative version', async () => {
    const base = map('base');
    const local = structuredClone(base);
    const remote = structuredClone(base);
    local.layers[0].cells[0] = { tileId: 'grass' };
    remote.layers[0].cells[1] = { tileId: 'sand' };

    const rpc = client([
      { ok: true, found: true, version_number: 2, snapshot: serializeMapDocument(remote) },
      { status: 'committed', version_id: 'v3', version_number: 3, current_version: 3, projection_status: 'committed', projection_error: null },
    ]);

    const result = await saveWithConflictDetection(rpc as never, local, base, 1);
    expect(result.status).toBe('committed');
    if (result.status === 'committed') {
      expect(result.version).toBe(3);
      expect(result.document.layers[0].cells[0].tileId).toBe('grass');
      expect(result.document.layers[0].cells[1].tileId).toBe('sand');
    }
    expect(rpc.rpc).toHaveBeenNthCalledWith(2, 'map_editor_commit_merge_v1', expect.objectContaining({
      p_map_id: 'm1',
      p_expected_version: 2,
      p_label: 'map-editor-save',
    }));
  });

  it('opens a conflict when the authoritative version advanced with a competing edit', async () => {
    const remote = map('remote');
    const local = map('local');
    const base = map('base');
    const rpc = client([{ ok: true, found: true, version_number: 2, snapshot: serializeMapDocument(remote) }]);
    const result = await saveWithConflictDetection(rpc as never, local, base, 1);
    expect(result.status).toBe('conflict');
    if (result.status === 'conflict') expect(result.remoteVersion).toBe(2);
    expect(rpc.rpc).toHaveBeenCalledTimes(1);
  });
});
