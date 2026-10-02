export type MapType = 'world' | 'region' | 'playable';
export const WORLD_DEFAULT_WIDTH = 128;
export const WORLD_DEFAULT_HEIGHT = 128;
export const WORLD_DEFAULT_TILE_SIZE = 32;
export const WORLD_DEEP_WATER_TILE = 'deepwater';
export const MAP_SIZES = [32, 64, 128] as const;
export type MapLayerKind = 'ground' | 'objects' | 'collision';
export type PlayableSpaceType = 'exterior' | 'interior';
export type TileCell = { tileId: string | null };
export type BuildingFootprint = '1x1'|'2x2'|'2x3'|'3x3'|'3x4';
export type BuildingCategory = 'house'|'shop'|'workshop'|'farm'|'warehouse'|'tower'|'wall'|'gate';
export type MapObject = { id:string; kind:'building'|'decoration'|'poi'; category:string; x:number; y:number; width:number; height:number; assetId:string; rotation:number; zIndex:number; collision:boolean; assetUrl?:string; assetName?:string; playableMapId?:string|null; childMapId?:string|null; interiorMapId?:string|null };
export type MapLayerGroup = { id:string; name:string; visible:boolean; locked:boolean; expanded:boolean };
export type MapParentBounds = { x:number; y:number; width:number; height:number };
export type MapLayerTemplate = { id:string; name:string; kind:MapLayerKind; visible:boolean; locked:boolean; opacity:number; groupId?:string|null };
export type MapLayer = { id:string; name:string; kind:MapLayerKind; visible:boolean; locked:boolean; active:boolean; opacity:number; groupId?:string|null; cells:TileCell[]; objects:MapObject[] };

export type MapDocument = { version:1; id:string; name:string; mapType:MapType; parentMapId:string|null; parentBounds?:MapParentBounds|null; width:number; height:number; tileSize:number; layers:MapLayer[]; layerGroups:MapLayerGroup[]; layerTemplates:MapLayerTemplate[]; playableSpace?:PlayableSpaceType; parentPlayableMapId?:string|null };

export const createEmptyCells = (width:number, height:number):TileCell[] => {
  if (!Number.isInteger(width) || width <= 0) throw new Error('Map width must be a positive integer');
  if (!Number.isInteger(height) || height <= 0) throw new Error('Map height must be a positive integer');
  return Array.from({length:width * height},()=>({tileId:null}));
};

const layer=(id:string,name:string,kind:MapLayerKind,width:number,height:number,active=false):MapLayer=>({id,name,kind,visible:true,locked:false,active,opacity:1,cells:createEmptyCells(width,height),objects:[]});
export const MAP_CAPABILITIES={world:{buildings:false,collision:false,terrainDetail:false,regions:true},region:{buildings:true,collision:false,terrainDetail:true,regions:false},playable:{buildings:true,collision:true,terrainDetail:true,regions:false}} as const;
export const createMap=(mapType:MapType='playable',parentMapId:string|null=null,playableSpace:PlayableSpaceType='exterior',parentPlayableMapId:string|null=null,width:number=WORLD_DEFAULT_WIDTH,height:number=WORLD_DEFAULT_HEIGHT):MapDocument=>{
  const isWorld=mapType==='world';
  const ground=layer('ground','World Ocean','ground',width,height,true);
  if(isWorld) ground.cells=ground.cells.map(()=>({tileId:WORLD_DEEP_WATER_TILE}));
  return {version:1,id:`${mapType}-map-${Date.now()}`,name:isWorld?'World Map':`${mapType[0].toUpperCase()+mapType.slice(1)} Map`,mapType,parentMapId,width,height,tileSize:WORLD_DEFAULT_TILE_SIZE,layerGroups:[],layerTemplates:[],layers:isWorld?[ground,layer('objects','World Objects','objects',width,height)]:[ground,layer('objects','Objects','objects',width,height),layer('collision','Collision','collision',width,height)],...(mapType==='playable'?{playableSpace,parentPlayableMapId}: {})};
};
export const createStarterMap=()=>createMap('playable');

export function resizeMapDocument(document: MapDocument, width: number, height: number): MapDocument {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) throw new Error('Map dimensions must be positive integers');
  if (document.width === width && document.height === height) return document;
  return {
    ...document,
    width,
    height,
    layers: document.layers.map(layer => ({
      ...layer,
      cells: Array.from({ length: width * height }, (_, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        return x < document.width && y < document.height
          ? layer.cells[y * document.width + x] ?? { tileId: null }
          : { tileId: null };
      }),
    })),
  };
}