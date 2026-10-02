import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';

export const TERRAIN_KEYS = [
  'grass','grassalt','sand','redsand','dirt','dirt2','pavement',
  'water','deepwater','deepwater2','brackish','tallgrass',
  'hole','holek','holemid','lava','lavarock',
] as const;
export type TerrainKey = (typeof TERRAIN_KEYS)[number];

export type TerrainNeighborhood = { n:boolean;e:boolean;s:boolean;w:boolean;ne:boolean;se:boolean;sw:boolean;nw:boolean };
export type TerrainMask = number;
export const TERRAIN_MASK_BITS = { n:1, e:2, s:4, w:8, ne:16, se:32, sw:64, nw:128 } as const;
const DIRECTIONS:Array<[keyof TerrainNeighborhood,number,number]>=[['n',0,-1],['e',1,0],['s',0,1],['w',-1,0],['ne',1,-1],['se',1,1],['sw',-1,1],['nw',-1,-1]];

export function terrainFromTileId(tileId:string|null):TerrainKey|null{if(!tileId)return null;if(tileId==='starter-tile')return'grass';if(tileId==='stone-tile')return'pavement';if(tileId==='water-tile')return'water';if((TERRAIN_KEYS as readonly string[]).includes(tileId))return tileId as TerrainKey;return null;}
export function terrainAt(document:MapDocument,point:GridPoint,layerId:string):TerrainKey|null{if(point.x<0||point.y<0||point.x>=document.width||point.y>=document.height)return null;const layer=document.layers.find(item=>item.id===layerId);if(!layer)return null;return terrainFromTileId(layer.cells[point.y*document.width+point.x]?.tileId??null);}
export function neighborMask(document:MapDocument,layerId:string,point:GridPoint,terrain:TerrainKey):TerrainMask{let mask=0;DIRECTIONS.forEach(([key,dx,dy])=>{if(terrainAt(document,{x:point.x+dx,y:point.y+dy},layerId)===terrain)mask|=TERRAIN_MASK_BITS[key]});return mask;}
export function waterNeighborMask(document:MapDocument,layerId:string,point:GridPoint):TerrainMask{const water=new Set<TerrainKey>(['water','brackish','deepwater2','deepwater']);let mask=0;DIRECTIONS.forEach(([key,dx,dy])=>{const neighbor=terrainAt(document,{x:point.x+dx,y:point.y+dy},layerId);if(neighbor&&water.has(neighbor))mask|=TERRAIN_MASK_BITS[key]});return mask;}
export function terrainNeighborhood(document:MapDocument,layerId:string,point:GridPoint,terrain:TerrainKey):TerrainNeighborhood{return Object.fromEntries(DIRECTIONS.map(([key,dx,dy])=>[key,terrainAt(document,{x:point.x+dx,y:point.y+dy},layerId)===terrain])) as TerrainNeighborhood;}
export function affectedTerrainCells(document:MapDocument,points:GridPoint[]):GridPoint[]{const seen=new Set<string>(),result:GridPoint[]=[];for(const point of points){for(const[_,dx,dy]of DIRECTIONS){const candidate={x:point.x+dx,y:point.y+dy};if(candidate.x<0||candidate.y<0||candidate.x>=document.width||candidate.y>=document.height)continue;const key=`${candidate.x}:${candidate.y}`;if(!seen.has(key)){seen.add(key);result.push(candidate);}}const key=`${point.x}:${point.y}`;if(!seen.has(key)){seen.add(key);result.push(point);}}return result;}
export function terrainVariantKey(mask:TerrainMask):string{return`mask_${mask.toString(16).padStart(2,'0')}`;}


export const WATER_SHORE_DISTANCE = 1;
export const WATER_BRACKISH_DISTANCE = 2;
export const WATER_MID_DISTANCE = 4;

const WATER_GRADIENT_TERRAINS = new Set<TerrainKey>(['water', 'brackish', 'deepwater2', 'deepwater']);

export function applyWaterDepthGradient(
  document: MapDocument,
  layerId: string,
): MapDocument {
  const layer = document.layers.find(item => item.id === layerId);
  if (!layer || layer.kind !== 'ground') return document;

  // World water depth is derived from distance to the nearest non-water
  // terrain. Eight-way distance makes diagonal shoreline cells part of the
  // same coast band and keeps the transition visually continuous.
  const size = document.width * document.height;
  const distance = new Int32Array(size);
  distance.fill(-1);
  const queue: number[] = [];
  let head = 0;

  for (let index = 0; index < size; index += 1) {
    const terrain = terrainFromTileId(layer.cells[index]?.tileId ?? null);
    if (terrain !== null && !WATER_GRADIENT_TERRAINS.has(terrain)) {
      distance[index] = 0;
      queue.push(index);
    }
  }

  // A WORLD map has a permanent deep-water floor. When the last land cell
  // is erased, existing shoreline bands (water/brackish/deepwater2) must not
  // remain stranded in an all-ocean map. Collapse the derived bands to the
  // canonical deep-water floor; this is the water-engine invariant that keeps
  // "erase everything" deterministic.
  if (!queue.length) {
    if (document.mapType !== 'world') return document;
    let changed = false;
    const cells = layer.cells.map(cell => {
      const terrain = terrainFromTileId(cell.tileId);
      if (!terrain || !WATER_GRADIENT_TERRAINS.has(terrain) || cell.tileId === 'deepwater') return cell;
      changed = true;
      return { ...cell, tileId: 'deepwater' };
    });
    if (!changed) return document;
    return {
      ...document,
      layers: document.layers.map(item =>
        item.id === layerId ? { ...item, cells } : item,
      ),
    };
  }

  const width = document.width;
  const height = document.height;
  while (head < queue.length) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    for (const [, dx, dy] of DIRECTIONS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nextIndex = ny * width + nx;
      if (distance[nextIndex] !== -1) continue;
      distance[nextIndex] = distance[index] + 1;
      queue.push(nextIndex);
    }
  }

  let changed = false;
  const cells = layer.cells.map((cell, index) => {
    const terrain = terrainFromTileId(cell.tileId);
    if (!terrain || !WATER_GRADIENT_TERRAINS.has(terrain)) return cell;

    const d = distance[index];
    const nextTileId =
      d <= WATER_SHORE_DISTANCE ? 'water' :
      d <= WATER_BRACKISH_DISTANCE ? 'brackish' :
      d <= WATER_MID_DISTANCE ? 'deepwater2' :
      'deepwater';

    if (cell.tileId === nextTileId) return cell;
    changed = true;
    return { ...cell, tileId: nextTileId };
  });

  if (!changed) return document;
  return {
    ...document,
    layers: document.layers.map(item =>
      item.id === layerId ? { ...item, cells } : item,
    ),
  };
}
