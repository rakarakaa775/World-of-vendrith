import type { MapDocument, MapObject } from './map-document';
import type { GridPoint } from './grid';

export function placeObject(document: MapDocument, layerId: string, point: GridPoint, object: Omit<MapObject,'id'|'x'|'y'>): MapDocument {
  const layer=document.layers.find(l=>l.id===layerId);
  if(!layer||layer.kind!=='objects'||layer.locked||!layer.visible)return document;
  const placed:MapObject={...object,id:`object-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,x:point.x,y:point.y};
  return {...document,layers:document.layers.map(l=>l.id===layerId?{...l,objects:[...l.objects,placed]}:l)};
}

export function objectAt(document:MapDocument,layerId:string,point:GridPoint):MapObject|null{const layer=document.layers.find(l=>l.id===layerId);if(!layer||!layer.visible)return null;for(let i=layer.objects.length-1;i>=0;i--){const o=layer.objects[i];if(point.x>=o.x&&point.y>=o.y&&point.x<o.x+o.width&&point.y<o.y+o.height)return o;}return null;}
export function moveObject(document:MapDocument,layerId:string,objectId:string,point:GridPoint):MapDocument{return {...document,layers:document.layers.map(l=>l.id===layerId&&!l.locked?{...l,objects:l.objects.map(o=>o.id===objectId?{...o,x:point.x,y:point.y}:o)}:l)}}
export function deleteObject(document:MapDocument,layerId:string,objectId:string):MapDocument{return {...document,layers:document.layers.map(l=>l.id===layerId&&!l.locked?{...l,objects:l.objects.filter(o=>o.id!==objectId)}:l)}}
