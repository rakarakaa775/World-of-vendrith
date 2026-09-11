import { describe, expect, it } from 'vitest';
import { applyConflictResolution } from './map-conflict-resolution-apply';
import { createConflictResolutionSession, chooseConflict } from './map-conflict-resolution-ui-model';
import type { MapDocument } from './map-document';
import type { MergeConflict } from './map-entity-merge';

const doc = (): MapDocument => ({version:1,id:'m',name:'Map',mapType:'playable',parentMapId:null,width:1,height:1,tileSize:32,layers:[{id:'g',name:'Ground',kind:'ground',visible:true,locked:false,active:true,cells:[{tileId:'grass'}],objects:[]}]});

describe('applyConflictResolution', () => {
  it('applies a local terrain choice', () => {
    const conflicts: MergeConflict[] = [{kind:'terrain-cell',id:'g:cell:0',base:{tileId:'grass'},local:{tileId:'stone'},remote:{tileId:'water'}}];
    const session = chooseConflict(createConflictResolutionSession({document:doc(),conflicts}), 'g:cell:0', 'local');
    const result = applyConflictResolution(doc(), session, conflicts);
    expect(result.document.layers[0].cells[0].tileId).toBe('stone');
    expect(result.resolutions[0].choice).toBe('local');
  });

  it('requires every conflict to be resolved', () => {
    const conflicts: MergeConflict[] = [{kind:'terrain-cell',id:'g:cell:0',base:{tileId:'grass'},local:{tileId:'stone'},remote:{tileId:'water'}}];
    expect(() => applyConflictResolution(doc(), createConflictResolutionSession({document:doc(),conflicts}), conflicts)).toThrow('All conflicts must be resolved');
  });
});
