import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';

export const TERRAIN_KEYS = ['grass', 'sand', 'dirt', 'pavement', 'water'] as const;
export type TerrainKey = (typeof TERRAIN_KEYS)[number];

export type TerrainNeighborhood = { n:boolean;e:boolean;s:boolean;w:boolean;ne:boolean;se:boolean;sw:boolean;nw:boolean };
export type TerrainMask = number;
export const TERRAIN_MASK_BITS = { n:1, e:2, s:4, w:8, ne:16, se:32, sw:64, nw:128 } as const;
const DIRECTIONS:Array<[keyof TerrainNeighborhood,number,number]>=[['n',0,-1],['e',1,0],['s',0,1],['w',-1,0],['ne',1,-1],['se',1,1],['sw',-1,1],['nw',-1,-1]];

export function terrainFromTileId(tileId:string|null):TerrainKey|null{if(!tileId)return null;if(tileId==='starter-tile')return'grass';if(tileId==='stone-tile')return'pavement';if(tileId==='water-tile')return'water';if((TERRAIN_KEYS as readonly string[]).includes(tileId))return tileId as TerrainKey;return null;}
export function terrainAt(document:MapDocument,point:GridPoint,layerId:string):TerrainKey|null{if(point.x<0||point.y<0||point.x>=document.width||point.y>=document.height)return null;const layer=document.layers.find(item=>item.id===layerId);if(!layer)return null;return terrainFromTileId(layer.cells[point.y*document.width+point.x]?.tileId??null);}
export function neighborMask(document:MapDocument,layerId:string,point:GridPoint,terrain:TerrainKey):TerrainMask{let mask=0;DIRECTIONS.forEach(([key,dx,dy])=>{if(terrainAt(document,{x:point.x+dx,y:point.y+dy},layerId)===terrain)mask|=TERRAIN_MASK_BITS[key]});return mask;}
export function terrainNeighborhood(document:MapDocument,layerId:string,point:GridPoint,terrain:TerrainKey):TerrainNeighborhood{return Object.fromEntries(DIRECTIONS.map(([key,dx,dy])=>[key,terrainAt(document,{x:point.x+dx,y:point.y+dy},layerId)===terrain])) as TerrainNeighborhood;}
export function affectedTerrainCells(document:MapDocument,points:GridPoint[]):GridPoint[]{const seen=new Set<string>(),result:GridPoint[]=[];for(const point of points){for(const[_,dx,dy]of DIRECTIONS){const candidate={x:point.x+dx,y:point.y+dy};if(candidate.x<0||candidate.y<0||candidate.x>=document.width||candidate.y>=document.height)continue;const key=String(candidate.x)+':'+String(candidate.y);if(!seen.has(key)){seen.add(key);result.push(candidate);}}const key=String(point.x)+':'+String(point.y);if(!seen.has(key)){seen.add(key);result.push(point);}}return result;}
export function terrainVariantKey(mask:TerrainMask):string{return'mask_'+mask.toString(16).padStart(2,'0');}

export type SourceOfTalesCornerPattern = [number,number,number,number];

/**
 * Explicit adapter from Vendrith's 8-neighbor mask to Source of Tales'
 * four-corner terrain representation. Each corner votes from the center,
 * its two cardinal neighbors and its diagonal neighbor. At least two of
 * these four positions matching the center terrain selects the center
 * terrain for that corner; otherwise the opposite terrain is selected.
 */
export function sourceOfTalesCornerPattern(mask:TerrainMask,centerTerrain:'water'|'sand'):SourceOfTalesCornerPattern{
  const same=(bit:number)=>((mask & bit)!==0 ? 1 : 0);
  const n=same(TERRAIN_MASK_BITS.n),e=same(TERRAIN_MASK_BITS.e),s=same(TERRAIN_MASK_BITS.s),w=same(TERRAIN_MASK_BITS.w);
  const ne=same(TERRAIN_MASK_BITS.ne),se=same(TERRAIN_MASK_BITS.se),sw=same(TERRAIN_MASK_BITS.sw),nw=same(TERRAIN_MASK_BITS.nw);
  const center=centerTerrain==='sand'?1:0;
  const opposite=center===1?0:1;
  const corner=(a:number,b:number,c:number)=>{
    const votes=1+a+b+c;
    return votes>=2?center:opposite;
  };
  return [corner(n,w,nw),corner(n,e,ne),corner(s,w,sw),corner(s,e,se)];
}

const SOURCE_OF_TALES_SANDWATER_TILE_BY_PATTERN:Readonly<Record<string,number>>={
  '1,0,0,1':0,'0,0,0,1':1,'0,0,1,0':2,'0,1,1,0':3,'0,1,0,0':4,
  '1,0,0,0':5,'1,1,1,0':6,'1,1,0,0':7,'1,1,0,1':8,'1,0,1,0':9,
  '0,0,0,0':10,'0,1,0,1':11,'1,0,1,1':12,'0,0,1,1':13,'0,1,1,1':14
};

export type SourceOfTalesTerrainTileRef =
  | { kind:'sandwater'; tileId:number; pattern:SourceOfTalesCornerPattern }
  | { kind:'base'; terrain:'sand'|'water'; tileId:10; pattern:SourceOfTalesCornerPattern };

export function sourceOfTalesSandWaterTile(mask:TerrainMask,centerTerrain:'water'|'sand'):SourceOfTalesTerrainTileRef{
  const pattern=sourceOfTalesCornerPattern(mask,centerTerrain);
  const key=pattern.join(',');
  if(centerTerrain==='water' && key==='0,0,0,0')return{kind:'base',terrain:'water',tileId:10,pattern};
  if(centerTerrain==='sand' && key==='1,1,1,1')return{kind:'base',terrain:'sand',tileId:10,pattern};
  if((centerTerrain==='water' && key==='1,1,1,1') || (centerTerrain==='sand' && key==='0,0,0,0')) throw new Error('Unsupported Source of Tales sand/water corner pattern: '+key);
  const tileId=SOURCE_OF_TALES_SANDWATER_TILE_BY_PATTERN[key];
  if(tileId!==undefined)return{kind:'sandwater',tileId,pattern};
  throw new Error('Unsupported Source of Tales sand/water corner pattern: '+key);
}
