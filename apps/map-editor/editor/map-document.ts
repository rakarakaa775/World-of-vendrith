export type MapLayerKind = 'ground' | 'objects' | 'collision';
export type TileCell = { tileId: string | null };
export type BuildingFootprint = '1x1'|'2x2'|'2x3'|'3x3'|'3x4';
export type BuildingCategory = 'house'|'shop'|'workshop'|'farm'|'warehouse'|'tower'|'wall'|'gate';
export type MapObject = { id:string; kind:'building'|'decoration'; category:string; x:number; y:number; width:number; height:number; assetId:string; rotation:number; zIndex:number; collision:boolean };
export type MapLayer = { id:string; name:string; kind:MapLayerKind; visible:boolean; locked:boolean; active:boolean; cells:TileCell[]; objects:MapObject[] };
export type MapDocument = { version:1; id:string; name:string; width:number; height:number; tileSize:number; layers:MapLayer[] };
const layer=(id:string,name:string,kind:MapLayerKind,active=false):MapLayer=>({id,name,kind,visible:true,locked:false,active,cells:[],objects:[]});
export const createStarterMap=():MapDocument=>({version:1,id:'starter-map',name:'Starter Map',width:20,height:12,tileSize:32,layers:[layer('ground','Ground','ground',true),layer('objects','Objects','objects'),layer('collision','Collision','collision')]});
