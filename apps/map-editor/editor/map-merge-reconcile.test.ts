import { describe, expect, it } from 'vitest';
import { mergeMapDocumentsThreeWay } from './map-entity-merge';
import { reconcileMapMerge } from './map-merge-reconcile';
import type { MapDocument } from './map-document';

const make = (): MapDocument => ({ version:1,id:'map-1',name:'Map',mapType:'playable',parentMapId:null,width:2,height:2,tileSize:32,layers:[{id:'ground',name:'Ground',kind:'ground',visible:true,locked:false,active:true,cells:[{tileId:null},{tileId:'grass'},{tileId:null},{tileId:null}],objects:[]}] });

describe('reconcileMapMerge', () => {
  it('keeps an edited remote object when local did not change it', () => {
    const base=make(), local=make(), remote=make();
    const o={id:'a',kind:'building' as const,category:'house',x:1,y:1,width:1,height:1,assetId:'house',rotation:0,zIndex:1,collision:true};
    base.layers[0].objects.push(o); remote.layers[0].objects.push({...o,x:4});
    const result=reconcileMapMerge(base,local,remote,mergeMapDocumentsThreeWay(base,local,remote));
    expect(result.conflicts).toHaveLength(0);
    expect(result.document.layers[0].objects[0].x).toBe(4);
  });

  it('marks delete-vs-edit as a conflict', () => {
    const base=make(), local=make(), remote=make();
    const o={id:'a',kind:'building' as const,category:'house',x:1,y:1,width:1,height:1,assetId:'house',rotation:0,zIndex:1,collision:true};
    base.layers[0].objects.push(o); remote.layers[0].objects.push({...o,x:4});
    local.layers[0].objects=[];
    const result=reconcileMapMerge(base,local,remote,mergeMapDocumentsThreeWay(base,local,remote));
    expect(result.conflicts.some(c=>c.kind==='object' && c.id==='ground:object:a')).toBe(true);
  });

  it('marks derived state for rebuild after a successful state change', () => {
    const base=make(), local=make(), remote=make();
    local.layers[0].cells[0]={tileId:'stone'};
    const result=reconcileMapMerge(base,local,remote,mergeMapDocumentsThreeWay(base,local,remote));
    expect(result.derived).toEqual({navigationRequired:true,geometryRequired:true,occupancyRequired:true});
  });
});
