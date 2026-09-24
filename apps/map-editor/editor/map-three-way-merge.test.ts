import { describe, expect, it } from 'vitest';
import { createStarterMap } from './map-document';
import { mergeMapDocuments } from './map-three-way-merge';
import { paintCell } from './map-state';

describe('three-way MapDocument merge', () => {
  it('merges independent cell edits', () => {
    const base=createStarterMap();
    const local=paintCell(base,'ground',{x:1,y:1},'tile-a');
    const remote=paintCell(base,'ground',{x:2,y:2},'tile-b');
    const result=mergeMapDocuments(base,local,remote);
    expect(result.conflicts).toEqual([]);
    expect(result.document?.layers[0].cells[129].tileId).toBe('tile-a');
    expect(result.document?.layers[0].cells[258].tileId).toBe('tile-b');
  });

  it('detects the same-cell conflict', () => {
    const base=createStarterMap();
    const local=paintCell(base,'ground',{x:1,y:1},'tile-a');
    const remote=paintCell(base,'ground',{x:1,y:1},'tile-b');
    const result=mergeMapDocuments(base,local,remote);
    expect(result.document).toBeNull();
    expect(result.conflicts.some(c=>c.scope==='layer' && c.id==='ground')).toBe(true);
  });

  it('keeps identical edits without conflict', () => {
    const base=createStarterMap();
    const local=paintCell(base,'ground',{x:1,y:1},'tile-a');
    const remote=paintCell(base,'ground',{x:1,y:1},'tile-a');
    const result=mergeMapDocuments(base,local,remote);
    expect(result.conflicts).toEqual([]);
  });

  it('detects divergent metadata edits', () => {
    const base=createStarterMap();
    const local={...base,name:'Local'};
    const remote={...base,name:'Remote'};
    const result=mergeMapDocuments(base,local,remote);
    expect(result.document).toBeNull();
    expect(result.conflicts).toEqual([{scope:'metadata',id:base.id,field:'name'}]);
  });
});
