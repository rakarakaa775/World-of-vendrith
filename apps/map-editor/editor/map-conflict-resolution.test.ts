import { describe, expect, it } from 'vitest';
import { resolveMapConflict, mergeMapDocumentsById } from './map-conflict-resolution';
import type { MapConflict } from './map-conflict-detection';
import type { MapDocument } from './map-document';

const doc = (id: string, name: string): MapDocument => ({
  version: 1, id, name, mapType: 'playable', width: 2, height: 2, tileSize: 32,
  layers: [],
});

const conflict: MapConflict = {
  kind: 'diverged',
  local: { mapId: 'map-1', revision: '2', serialized: 'local' },
  remote: { mapId: 'map-1', revision: '3', serialized: 'remote' },
};

describe('map conflict resolution', () => {
  it('keeps the local snapshot', () => {
    expect(resolveMapConflict(conflict, 'keep-local', () => doc('map-1', 'local')).document?.name).toBe('local');
  });

  it('keeps the remote snapshot', () => {
    expect(resolveMapConflict(conflict, 'keep-remote', () => doc('map-1', 'remote')).document?.name).toBe('remote');
  });

  it('marks manual resolution as required', () => {
    const result = resolveMapConflict(conflict, 'manual', () => doc('map-1', 'manual'));
    expect(result.requiresManualMerge).toBe(true);
    expect(result.document).toBeNull();
  });

  it('merges layers by stable layer id', () => {
    const local = { ...doc('map-1', 'local'), layers: [{ id: 'local', name: 'L', kind: 'ground', active: true, visible: true, locked: false, cells: [], objects: [] }] };
    const remote = { ...doc('map-1', 'remote'), layers: [{ id: 'remote', name: 'R', kind: 'ground', active: true, visible: true, locked: false, cells: [], objects: [] }] };
    const merged = mergeMapDocumentsById(local, remote);
    expect(merged?.layers.map((layer) => layer.id)).toEqual(['remote', 'local']);
    expect(merged?.name).toBe('local');
  });
});
