import type { MapDocument, MapLayer, MapObject, TileCell } from './map-document';

export type MergeConflict = { scope: 'metadata'|'layer'|'cell'|'object'; id: string; field?: string };
export type ThreeWayMergeResult = { document: MapDocument|null; conflicts: MergeConflict[] };
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

function pick<T>(base:T,local:T,remote:T,scope:MergeConflict['scope'],id:string,field:string|undefined,conflicts:MergeConflict[]):T|null{
  if(same(local,remote)) return local;
  if(same(local,base)) return remote;
  if(same(remote,base)) return local;
  conflicts.push({scope,id,field}); return null;
}

function mergeLayer(base:MapLayer|undefined,local:MapLayer|undefined,remote:MapLayer|undefined,conflicts:MergeConflict[]):MapLayer|null{
  if(!base) {
    if(local&&remote&&same(local,remote)) return local;
    if(local&&!remote) return local;
    if(!local&&remote) return remote;
    conflicts.push({scope:'layer',id:local?.id??remote?.id??'unknown'}); return null;
  }
  if(!local||!remote) return pick(base,local,remote,'layer',base.id,undefined,conflicts);
  const visible=pick(base.visible,local.visible,remote.visible,'layer',base.id,'visible',conflicts);
  const locked=pick(base.locked,local.locked,remote.locked,'layer',base.id,'locked',conflicts);
  const active=pick(base.active,local.active,remote.active,'layer',base.id,'active',conflicts);
  const cells:TileCell[]=[];
  for(let i=0;i<Math.max(base.cells.length,local.cells.length,remote.cells.length);i++){
    const cell=pick(base.cells[i],local.cells[i],remote.cells[i],'cell',`${base.id}:${i}`,undefined,conflicts);
    if(cell) cells.push(cell);
  }
  const ids=[...new Set([...base.objects.map(o=>o.id),...local.objects.map(o=>o.id),...remote.objects.map(o=>o.id)])];
  const objects:MapObject[]=[];
  for(const id of ids){
    const object=pick(base.objects.find(o=>o.id===id),local.objects.find(o=>o.id===id),remote.objects.find(o=>o.id===id),'object',id,undefined,conflicts);
    if(object) objects.push(object);
  }
  return conflicts.length ? null : {...base,visible:visible!,locked:locked!,active:active!,cells,objects};
}

export function mergeMapDocuments(base:MapDocument,local:MapDocument,remote:MapDocument):ThreeWayMergeResult{
  if(base.id!==local.id||base.id!==remote.id) throw new Error('Map IDs must match for three-way merge');
  const conflicts:MergeConflict[]=[];
  const name=pick(base.name,local.name,remote.name,'metadata',base.id,'name',conflicts);
  const width=pick(base.width,local.width,remote.width,'metadata',base.id,'width',conflicts);
  const height=pick(base.height,local.height,remote.height,'metadata',base.id,'height',conflicts);
  const tileSize=pick(base.tileSize,local.tileSize,remote.tileSize,'metadata',base.id,'tileSize',conflicts);
  const parentMapId=pick(base.parentMapId,local.parentMapId,remote.parentMapId,'metadata',base.id,'parentMapId',conflicts);
  const ids=[...new Set([...base.layers.map(l=>l.id),...local.layers.map(l=>l.id),...remote.layers.map(l=>l.id)])];
  const layers:MapLayer[]=[];
  for(const id of ids){
    const layer=mergeLayer(base.layers.find(x=>x.id===id),local.layers.find(x=>x.id===id),remote.layers.find(x=>x.id===id),conflicts);
    if(layer) layers.push(layer);
  }
  if(conflicts.length) return {document:null,conflicts};
  return {document:{...remote,name:name!,width:width!,height:height!,tileSize:tileSize!,parentMapId:parentMapId!,layers},conflicts:[]};
}
