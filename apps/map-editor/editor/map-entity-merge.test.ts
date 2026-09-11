import { describe, expect, it } from 'vitest';
import { mergeMapDocumentsThreeWay } from './map-entity-merge';
import type { MapDocument } from './map-document';

const make = (): MapDocument => ({
  version: 1, id: 'map-1', name: 'Map', mapType: 'playable', parentMapId: null,
  width: 2, height: 2, tileSize: 32,
  layers: [{ id: 'ground', name: 'Ground', kind: 'ground', visible: true, locked: false, active: true,
    cells: [{ tileId: null }, { tileId: 'grass' }, { tileId: null }, { tileId: null }], objects: [] }],
});

describe('mergeMapDocumentsThreeWay', () => {
  it('merges independent terrain edits', () => {
    const base = make(); const local = make(); const remote = make();
    local.layers[0].cells[0] = { tileId: 'stone' };
    remote.layers[0].cells[3] = { tileId: 'water' };
    const result = mergeMapDocumentsThreeWay(base, local, remote);
    expect(result.conflicts).toHaveLength(0);
    expect(result.document.layers[0].cells[0].tileId).toBe('stone');
    expect(result.document.layers[0].cells[3].tileId).toBe('water');
  });

  it('flags the same terrain cell edited differently', () => {
    const base = make(); const local = make(); const remote = make();
    local.layers[0].cells[1] = { tileId: 'stone' };
    remote.layers[0].cells[1] = { tileId: 'water' };
    const result = mergeMapDocumentsThreeWay(base, local, remote);
    expect(result.conflicts.some(c => c.kind === 'terrain-cell' && c.id === 'ground:cell:1')).toBe(true);
  });

  it('merges independent object additions', () => {
    const base = make(); const local = make(); const remote = make();
    local.layers[0].objects.push({ id:'a',kind:'building',category:'house',x:1,y:1,width:1,height:1,assetId:'house',rotation:0,zIndex:1,collision:true });
    remote.layers[0].objects.push({ id:'b',kind:'building',category:'tower',x:2,y:2,width:1,height:1,assetId:'tower',rotation:0,zIndex:1,collision:true });
    const result = mergeMapDocumentsThreeWay(base, local, remote);
    expect(result.conflicts).toHaveLength(0);
    expect(result.document.layers[0].objects.map(o => o.id).sort()).toEqual(['a','b']);
  });

  it('flags the same object edited differently', () => {
    const base = make(); const local = make(); const remote = make();
    const object = { id:'a',kind:'building' as const,category:'house',x:1,y:1,width:1,height:1,assetId:'house',rotation:0,zIndex:1,collision:true };
    base.layers[0].objects.push(object); local.layers[0].objects.push({ ...object, x:2 }); remote.layers[0].objects.push({ ...object, x:3 });
    const result = mergeMapDocumentsThreeWay(base, local, remote);
    expect(result.conflicts.some(c => c.kind === 'object' && c.id === 'ground:object:a')).toBe(true);
  });
});
