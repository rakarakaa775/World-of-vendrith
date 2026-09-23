import type { MapDocument, MapObject, BuildingCategory, BuildingFootprint } from './map-document';
import type { GridPoint } from './grid';
import { MAP_CAPABILITIES } from './map-document';
export type BuildingDefinition={id:string;label:string;category:BuildingCategory;footprint:BuildingFootprint;assetId:string;width:number;height:number;collision:boolean};
export const BUILDINGS:BuildingDefinition[]=[{id:'cottage',label:'Cottage',category:'house',footprint:'2x2',assetId:'building-cottage-placeholder',width:2,height:2,collision:true},{id:'shop',label:'Shop',category:'shop',footprint:'2x2',assetId:'building-shop-placeholder',width:2,height:2,collision:true},{id:'workshop',label:'Workshop',category:'workshop',footprint:'3x3',assetId:'building-workshop-placeholder',width:3,height:3,collision:true},{id:'farm',label:'Farm',category:'farm',footprint:'3x4',assetId:'building-farm-placeholder',width:3,height:4,collision:true},{id:'warehouse',label:'Warehouse',category:'warehouse',footprint:'3x3',assetId:'building-warehouse-placeholder',width:3,height:3,collision:true},{id:'tower',label:'Tower',category:'tower',footprint:'2x3',assetId:'building-tower-placeholder',width:2,height:3,collision:true},{id:'wall',label:'Wall',category:'wall',footprint:'1x1',assetId:'building-wall-placeholder',width:1,height:1,collision:true},{id:'gate',label:'Gate',category:'gate',footprint:'1x1',assetId:'building-gate-placeholder',width:1,height:1,collision:true}];
export function canPlaceBuilding(document:MapDocument,layerId:string,point:GridPoint,width:number,height:number):boolean{if(!MAP_CAPABILITIES[document.mapType].buildings)return false;if(point.x<0||point.y<0||point.x+width>document.width||point.y+height>document.height)return false;const layer=document.layers.find(l=>l.id===layerId);if(!layer||layer.kind!=='objects'||layer.locked||!layer.visible)return false;return !layer.objects.some(o=>point.x<o.x+o.width&&point.x+width>o.x&&point.y<o.y+o.height&&point.y+height>o.y);}
export function placeBuilding(document:MapDocument,layerId:string,point:GridPoint,b:BuildingDefinition):MapDocument{if(!canPlaceBuilding(document,layerId,point,b.width,b.height))return document;const placed:MapObject={id:`building-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,kind:'building',category:b.category,x:point.x,y:point.y,width:b.width,height:b.height,assetId:b.assetId,rotation:0,zIndex:0,collision:b.collision};return{...document,layers:document.layers.map(l=>l.id===layerId?{...l,objects:[...l.objects,placed]}:l)}}
export function objectAt(document:MapDocument,layerId:string,point:GridPoint):MapObject|null{const layer=document.layers.find(l=>l.id===layerId);if(!layer||!layer.visible)return null;for(let i=layer.objects.length-1;i>=0;i--){const o=layer.objects[i];if(point.x>=o.x&&point.y>=o.y&&point.x<o.x+o.width&&point.y<o.y+o.height)return o;}return null;}
export function moveObject(document:MapDocument,layerId:string,objectId:string,point:GridPoint):MapDocument{const layer=document.layers.find(l=>l.id===layerId);const o=layer?.objects.find(x=>x.id===objectId);if(!o||!layer||layer.locked)return document;if(point.x<0||point.y<0||point.x+o.width>document.width||point.y+o.height>document.height)return document;const overlaps=layer.objects.some(other=>other.id!==objectId&&point.x<other.x+other.width&&point.x+o.width>other.x&&point.y<other.y+other.height&&point.y+o.height>other.y);if(overlaps)return document;return{...document,layers:document.layers.map(l=>l.id===layerId?{...l,objects:l.objects.map(x=>x.id===objectId?{...x,x:point.x,y:point.y}:x)}:l)}}
export function deleteObject(document:MapDocument,layerId:string,objectId:string):MapDocument{return{...document,layers:document.layers.map(l=>l.id===layerId&&!l.locked?{...l,objects:l.objects.filter(o=>o.id!==objectId)}:l)}}


export type TransformOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
};

export function updateObjectTransform(document: MapDocument, layerId: string, objectId: string, changes: TransformOptions): MapDocument {
  const layer = document.layers.find(l => l.id === layerId);
  if (!layer || layer.locked) return document;
  const object = layer.objects.find(o => o.id === objectId);
  if (!object) return document;
  const next = {
    ...object,
    x: changes.x ?? object.x,
    y: changes.y ?? object.y,
    width: Math.max(1, Math.round(changes.width ?? object.width)),
    height: Math.max(1, Math.round(changes.height ?? object.height)),
    rotation: ((changes.rotation ?? object.rotation) % 360 + 360) % 360,
  };
  if (next.x < 0 || next.y < 0 || next.x + next.width > document.width || next.y + next.height > document.height) return document;
  const overlaps = layer.objects.some(o => o.id !== objectId && next.x < o.x + o.width && next.x + next.width > o.x && next.y < o.y + o.height && next.y + next.height > o.y);
  if (overlaps) return document;
  return { ...document, layers: document.layers.map(l => l.id === layerId ? { ...l, objects: l.objects.map(o => o.id === objectId ? next : o) } : l) };
}

export function duplicateObjects(document: MapDocument, layerId: string, objectIds: string[]): MapDocument {
  const layer = document.layers.find(l => l.id === layerId);
  if (!layer || layer.locked) return document;
  const selected = layer.objects.filter(o => objectIds.includes(o.id));
  if (!selected.length) return document;
  const copies = selected.map((o, index) => ({ ...o, id: `building-copy-${Date.now()}-${index}-${Math.random().toString(36).slice(2,7)}`, x: o.x + 1, y: o.y + 1 }));
  if (copies.some(o => o.x + o.width > document.width || o.y + o.height > document.height)) return document;
  return { ...document, layers: document.layers.map(l => l.id === layerId ? { ...l, objects: [...l.objects, ...copies] } : l) };
}

export function selectAllObjectIds(document: MapDocument, layerId: string): string[] {
  return document.layers.find(l => l.id === layerId)?.objects.map(o => o.id) ?? [];
}

export function toggleObjectSelection(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
}

export function boxSelectObjectIds(document: MapDocument, layerId: string, box: SelectionBox, additive = false, existing: string[] = []): string[] {
  const layer = document.layers.find(l => l.id === layerId);
  if (!layer) return existing;
  const selected = layer.objects.filter(o => o.x < box.x + box.width && o.x + o.width > box.x && o.y < box.y + box.height && o.y + o.height > box.y).map(o => o.id);
  if (!additive) return selected;
  return [...new Set([...existing, ...selected])];
}

export type SelectionBox = { x: number; y: number; width: number; height: number };

export function alignObjects(document: MapDocument, layerId: string, objectIds: string[], mode: 'left'|'center-x'|'right'|'top'|'center-y'|'bottom'): MapDocument {
  const layer = document.layers.find(l => l.id === layerId);
  if (!layer || layer.locked) return document;
  const selected = layer.objects.filter(o => objectIds.includes(o.id));
  if (selected.length < 2) return document;
  const minX = Math.min(...selected.map(o => o.x)), maxRight = Math.max(...selected.map(o => o.x + o.width));
  const minY = Math.min(...selected.map(o => o.y)), maxBottom = Math.max(...selected.map(o => o.y + o.height));
  const centerX = (minX + maxRight) / 2, centerY = (minY + maxBottom) / 2;
  const next = selected.map(o => {
    const x = mode === 'left' ? minX : mode === 'center-x' ? Math.round(centerX - o.width / 2) : mode === 'right' ? maxRight - o.width : o.x;
    const y = mode === 'top' ? minY : mode === 'center-y' ? Math.round(centerY - o.height / 2) : mode === 'bottom' ? maxBottom - o.height : o.y;
    return { ...o, x, y };
  });
  const occupied = next.some(a => next.some(b => a.id !== b.id && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y));
  if (occupied) return document;
  return { ...document, layers: document.layers.map(l => l.id === layerId ? { ...l, objects: l.objects.map(o => next.find(n => n.id === o.id) ?? o) } : l) };
}

export function mirrorObjects(document: MapDocument, layerId: string, objectIds: string[], axis: 'horizontal'|'vertical'): MapDocument {
  const layer = document.layers.find(l => l.id === layerId);
  if (!layer || layer.locked) return document;
  const selected = layer.objects.filter(o => objectIds.includes(o.id));
  if (!selected.length) return document;
  const minX = Math.min(...selected.map(o => o.x)), maxRight = Math.max(...selected.map(o => o.x + o.width));
  const minY = Math.min(...selected.map(o => o.y)), maxBottom = Math.max(...selected.map(o => o.y + o.height));
  const next = selected.map(o => axis === 'horizontal'
    ? { ...o, x: minX + (maxRight - (o.x + o.width)) }
    : { ...o, y: minY + (maxBottom - (o.y + o.height)), rotation: (360 - o.rotation) % 360 });
  return { ...document, layers: document.layers.map(l => l.id === layerId ? { ...l, objects: l.objects.map(o => next.find(n => n.id === o.id) ?? o) } : l) };
}

export function distributeObjects(document: MapDocument, layerId: string, objectIds: string[], axis: 'horizontal'|'vertical'): MapDocument {
  const layer = document.layers.find(l => l.id === layerId);
  if (!layer || layer.locked) return document;
  const selected = layer.objects.filter(o => objectIds.includes(o.id)).sort((a,b) => axis === 'horizontal' ? a.x - b.x : a.y - b.y);
  if (selected.length < 3) return document;
  const first = selected[0], last = selected[selected.length - 1];
  const start = axis === 'horizontal' ? first.x : first.y;
  const end = axis === 'horizontal' ? last.x : last.y;
  const span = end - start;
  const step = span / (selected.length - 1);
  const next = selected.map((o, i) => axis === 'horizontal' ? { ...o, x: Math.round(start + step * i) } : { ...o, y: Math.round(start + step * i) });
  return { ...document, layers: document.layers.map(l => l.id === layerId ? { ...l, objects: l.objects.map(o => next.find(n => n.id === o.id) ?? o) } : l) };
}
