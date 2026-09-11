import type { ConflictResolutionSession, ConflictChoice } from './map-conflict-resolution-ui-model';

export type ConflictPanel = { id:string; title:string; kind:string; base:string; local:string; remote:string; selected:ConflictChoice|null };
export type ConflictResolutionView = { title:string; summary:string; panels:ConflictPanel[]; selectedIndex:number; canApply:boolean; actions:{id:'keep-local'|'keep-remote'|'keep-base'|'apply';label:string}[] };

const format=(value:unknown)=>JSON.stringify(value,null,2);
export function createConflictResolutionView(session:ConflictResolutionSession):ConflictResolutionView {
  return { title:'Resolve Map Conflicts', summary:`${session.conflicts.length} conflict${session.conflicts.length===1?'':'s'} require resolution.`, panels:session.conflicts.map(c=>({id:c.id,title:c.id,kind:c.kind,base:format(c.base),local:format(c.local),remote:format(c.remote),selected:c.choice})), selectedIndex:session.selected, canApply:session.conflicts.every(c=>c.choice!==null), actions:[{id:'keep-local',label:'Keep Local'},{id:'keep-remote',label:'Keep Remote'},{id:'keep-base',label:'Keep Base'},{id:'apply',label:'Apply Merge'}] };
}

export function selectConflict(session:ConflictResolutionSession,index:number):ConflictResolutionSession { return {...session,selected:Math.max(0,Math.min(index,Math.max(0,session.conflicts.length-1)))}; }
export function chooseSelected(session:ConflictResolutionSession,choice:ConflictChoice):ConflictResolutionSession { const c=session.conflicts[session.selected]; return c?{...session,conflicts:session.conflicts.map((x,i)=>i===session.selected?{...x,choice}:x)}:session; }
