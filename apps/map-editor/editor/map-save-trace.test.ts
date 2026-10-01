import { describe, expect, it } from 'vitest';
import { assertTerrainPreserved, formatTerrainTrace, traceTerrain } from './map-save-trace';
import type { MapDocument } from './map-document';

const make = (): MapDocument => ({
  version: 1, id: 'map-1', name: 'Map', mapType: 'world', parentMapId: null,
  width: 2, height: 2, tileSize: 32,
  layers: [{
    id: 'ground', name: 'Ground', kind: 'ground', visible: true, locked: false, active: true,
    cells: [{ tileId: 'deepwater' }, { tileId: 'deepwater' }, { tileId: 'deepwater' }, { tileId: 'deepwater' }],
    objects: [],
  }],
});

describe('map save terrain trace', () => {
  it('counts the complete ground terrain payload', () => {
    const document = make();
    document.layers[0].cells[0] = { tileId: 'redsand' };
    document.layers[0].cells[1] = { tileId: 'grass' };
    const trace = traceTerrain(document, 'resolved-merge', 12);
    expect(trace.groundCells).toBe(4);
    expect(trace.tileCounts).toEqual({ redsand: 1, grass: 1, deepwater: 2 });
    expect(formatTerrainTrace(trace)).toContain('redsand:1');
  });

  it('fails when serialization payload loses a terrain tile', () => {
    const before = traceTerrain(make(), 'resolved-merge', 12);
    const afterDocument = make();
    afterDocument.layers[0].cells[0] = { tileId: 'redsand' };
    const after = traceTerrain(afterDocument, 'serialized-roundtrip', 12);
    expect(() => assertTerrainPreserved(before, after, 'resolved→serialized')).toThrow('SAVE_TERRAIN_PAYLOAD_MISMATCH');
  });
});
