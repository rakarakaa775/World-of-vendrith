import { describe, expect, it } from 'vitest';
import { diffMapDocuments } from './map-conflict-diff';
import type { MapDocument } from './map-document';

const base = (name: string): MapDocument => ({
  version: 1, id: 'map-1', name, mapType: 'playable', parentMapId: null,
  width: 2, height: 2, tileSize: 32,
  layers: [{ id: 'ground', name: 'Ground', kind: 'ground', visible: true, locked: false, active: true,
    cells: [{ tileId: null }, { tileId: 'grass' }, { tileId: null }, { tileId: null }], objects: [] }],
});

describe('diffMapDocuments', () => {
  it('returns metadata changes', () => {
    expect(diffMapDocuments(base('Local'), base('Remote'))[0]).toMatchObject({ area: 'metadata', id: 'name', kind: 'changed' });
  });

  it('returns terrain cell changes', () => {
    const local = base('Map');
    const remote = base('Map');
    remote.layers[0].cells[1] = { tileId: 'water' };
    expect(diffMapDocuments(local, remote).some((entry) => entry.area === 'terrain')).toBe(true);
  });

  it('returns added and removed objects', () => {
    const local = base('Map');
    const remote = base('Map');
    local.layers[0].objects.push({ id: 'a', kind: 'building', category: 'house', x: 1, y: 1, width: 1, height: 1, assetId: 'house', rotation: 0, zIndex: 1, collision: true });
    remote.layers[0].objects.push({ id: 'b', kind: 'building', category: 'tower', x: 2, y: 2, width: 1, height: 1, assetId: 'tower', rotation: 0, zIndex: 1, collision: true });
    const diff = diffMapDocuments(local, remote);
    expect(diff.some((entry) => entry.kind === 'removed' && entry.area === 'object')).toBe(true);
    expect(diff.some((entry) => entry.kind === 'added' && entry.area === 'object')).toBe(true);
  });
});
