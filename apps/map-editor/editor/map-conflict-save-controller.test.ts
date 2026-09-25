import { describe, expect, it, vi } from 'vitest';
import { createMap } from './map-document';
import { saveWithConflictDetection } from './map-conflict-save-controller';

const map = (name: string) => {
  const document = createMap('world');
  document.id = 'm1';
  document.name = name;
  return document;
};

describe('saveWithConflictDetection', () => {
  it('rebases an independent local change onto a newer authoritative version', async () => {
    const remote = { ...map('base'), width: 2, height: 1, layers: map('base').layers.map(layer => ({ ...layer, cells: layer.cells.slice(0, 2) })) };
    const local = { ...map('base'), width: 1, height: 2, layers: map('base').layers.map(layer => ({ ...layer, cells: layer.cells.slice(0, 2) })) };
    const base = map('base');
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: { ok: true, found: true, version_number: 2, snapshot: remote }, error: null })
      .mockResolvedValueOnce({ data: { status: 'committed', version_id: 'v3', version_number: 3, current_version: 3, projection_status: 'committed', projection_error: null }, error: null });
    const result = await saveWithConflictDetection({ rpc } as never, local, base, 1);
    expect(result.status).toBe('committed');
    if (result.status === 'committed') {
      expect(result.version).toBe(3);
      expect(result.document.width).toBe(2);
      expect(result.document.height).toBe(2);
    }
    expect(rpc).toHaveBeenNthCalledWith(2, 'map_editor_commit_merge_v1', expect.objectContaining({
      p_map_id: 'm1',
      p_expected_version: 2,
      p_label: 'map-editor-save',
    }));
  });

  it('opens a conflict when the authoritative version advanced', async () => {
    const remote = map('remote');
    const local = map('local');
    const base = map('base');
    const rpc = vi.fn().mockResolvedValueOnce({ data: { ok: true, found: true, version_number: 2, snapshot: remote }, error: null });
    const result = await saveWithConflictDetection({ rpc } as never, local, base, 1);
    expect(result.status).toBe('conflict');
    if (result.status === 'conflict') expect(result.remoteVersion).toBe(2);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
