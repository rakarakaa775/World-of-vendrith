import type { MapDocument, MapObject } from './map-document';
import { MAP_CAPABILITIES } from './map-document';
import type { GridPoint } from './grid';

export type POIDefinition={id:string;label:string;category:'settlement'|'ruin'|'landmark'|'dungeon';assetId:string};
export const POIS:POIDefinition[]=[
 {id:'village',label:'Village',category:'settlement',assetId:'poi-village-placeholder'},
 {id:'town',label:'Town',category:'settlement',assetId:'poi-town-placeholder'},
 {id:'city',label:'City',category:'settlement',assetId:'poi-city-placeholder'},
 {id:'ruins',label:'Ruins',category:'ruin',assetId:'poi-ruins-placeholder'},
 {id:'landmark',label:'Landmark',category:'landmark',assetId:'poi-landmark-placeholder'},
 {id:'dungeon',label:'Dungeon',category:'dungeon',assetId:'poi-dungeon-placeholder'}
];
export type POIInstance=MapObject&{kind:'poi';playableMapId:string|null};
export function canPlacePOI(document:MapDocument,point:GridPoint){return document.mapType==='region'&&point.x>=0&&point.y>=0&&point.x<document.width&&point.y<document.height&&MAP_CAPABILITIES.region.terrainDetail;}
export function placePOI(document:MapDocument,point:GridPoint,definition:POIDefinition,playableMapId:string|null=null):MapDocument{if(!canPlacePOI(document,point))return document;const layer=document.layers.find(l=>l.id==='objects');if(!layer||layer.locked)return document;const poi:POIInstance={id:`poi-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,kind:'poi',category:definition.category,x:point.x,y:point.y,width:1,height:1,assetId:definition.assetId,rotation:0,zIndex:10,collision:false,playableMapId};return{...document,layers:document.layers.map(l=>l.id==='objects'?{...l,objects:[...l.objects,poi]}:l)}}
export function linkPOIToPlayable(document:MapDocument,poiId:string,playableMapId:string):MapDocument{return{...document,layers:document.layers.map(l=>l.id==='objects'?{...l,objects:l.objects.map(o=>o.id===poiId?{...o,kind:'poi',playableMapId} as POIInstance:o)}:l)}}
