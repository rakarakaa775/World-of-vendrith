import { describe,expect,it } from 'vitest';
import { createConflictResolutionView,selectConflict,chooseSelected } from './map-conflict-resolution-view';
import type { ConflictResolutionSession } from './map-conflict-resolution-ui-model';
const session=(choices:[any])=>({selected:0,conflicts:choices.map((choice,i)=>({id:`c${i}`,kind:'terrain-cell',base:{tileId:'grass'},local:{tileId:'stone'},remote:{tileId:'water'},choice}))}) as ConflictResolutionSession;
describe('conflict resolution view',()=>{
 it('renders panels and blocks apply while unresolved',()=>{const v=createConflictResolutionView(session([null,null] as any));expect(v.panels).toHaveLength(2);expect(v.canApply).toBe(false);});
 it('supports selecting a panel and choosing a resolution',()=>{let s=session([null,null] as any);s=selectConflict(s,1);s=chooseSelected(s,'remote');expect(s.selected).toBe(1);expect(s.conflicts[1].choice).toBe('remote');});
 it('enables apply once every conflict has a choice',()=>{const v=createConflictResolutionView(session(['local','remote'] as any));expect(v.canApply).toBe(true);});
});
