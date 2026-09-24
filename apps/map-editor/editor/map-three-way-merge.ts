import type { MapDocument } from './map-document';

export type MergeConflict = {
  scope: 'metadata' | 'layer' | 'cell' | 'object';
  id: string;
  field?: string;
};

export type ThreeWayMergeResult = {
  document: MapDocument | null;
  conflicts: MergeConflict[];
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function mergeMapDocuments(base: MapDocument, local: MapDocument, remote: MapDocument): ThreeWayMergeResult {
  if (base.id !== local.id || base.id !== remote.id) throw new Error('Map IDs must match for three-way merge');

  const conflicts: MergeConflict[] = [];
  const pick = <T>(baseValue: T, localValue: T, remoteValue: T, scope: MergeConflict['scope'], id: string, field?: string): T | null => {
    if (same(localValue, remoteValue)) return localValue;
    if (same(localValue, baseValue)) return remoteValue;
    if (same(remoteValue, baseValue)) return localValue;
    conflicts.push({scope,id,field});
    return null;
  };

  const merged = {...remote};
  const name = pick(base.name, local.name, remote.name, 'metadata', base.id, 'name');
  const width = pick(base.width, local.width, remote.width, 'metadata', base.id, 'width');
  const height = pick(base.height, local.height, remote.height, 'metadata', base.id, 'height');
  const tileSize = pick(base.tileSize, local.tileSize, remote.tileSize, 'metadata', base.id, 'tileSize');

  if (conflicts.length) return {document:null,conflicts};

  const layerIds=[...new Set([...base.layers.map(l=>l.id),...local.layers.map(l=>l.id),...remote.layers.map(l=>l.id)])];
  const byId=(layers: MapDocument['layers'], id:string)=>layers.find(l=>l.id===id);
  const layers: MapDocument['layers'] = [];

  for(const id of layerIds){
    const b=byId(base.layers,id), l=byId(local.layers,id), r=byId(remote.layers,id);
    const chosen=pick(b,l,r,'layer',id);
    if(chosen){layers.push(chosen);continue;}
    if(!b && l && r && same(l,r)){layers.push(l);continue;}
    if(!b && l && !r){layers.push(l);continue;}
    if(!b && !l && r){layers.push(r);continue;}
    conflicts.push({scope:'layer',id});
  }

  if(conflicts.length) return {document:null,conflicts};

  return {
    document:{
      ...merged,
      name:name!,
      width:width!,
      height:height!,
      tileSize:tileSize!,
      layers,
    },
    conflicts:[],
  };
}
