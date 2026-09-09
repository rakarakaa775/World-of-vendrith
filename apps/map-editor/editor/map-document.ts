export type MapLayerKind = 'ground' | 'objects' | 'collision';
export type TileCell = { tileId: string | null };
export type MapLayer = { id: string; name: string; kind: MapLayerKind; visible: boolean; locked: boolean; active: boolean; cells: TileCell[] };
export type MapDocument = { version: 1; id: string; name: string; width: number; height: number; tileSize: number; layers: MapLayer[] };
const layer=(id:string,name:string,kind:MapLayerKind,active=false):MapLayer=>({id,name,kind,visible:true,locked:false,active,cells:[]});
export const createStarterMap=():MapDocument=>({version:1,id:'starter-map',name:'Starter Map',width:20,height:12,tileSize:32,layers:[layer('ground','Ground','ground',true),layer('objects','Objects','objects'),layer('collision','Collision','collision')]});
