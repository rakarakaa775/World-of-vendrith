import type { GridPoint } from './grid';
import type { MapDocument } from './map-document';
import { indexFor } from './grid';
import { neighborMask, terrainAt, terrainFromTileId, type TerrainKey } from './terrain-engine';
import { terrainAssetIdForMask, type TerrainAssetBindingMap } from './terrain-asset-binding';
import { tileIdForTerrain } from './terrain-resolver';

export type TerrainCellVariant={point:GridPoint;terrain:TerrainKey;mask:number;assetId:string|null;tileId:string};
export type TerrainAutotileResult={document:MapDocument;variants:TerrainCellVariant[]};

/** Re-evaluates the edited cells plus their complete 8-neighbor perimeter. */
export function applyTerrainAutotile(document:MapDocument,layerId:string,changedPoints:GridPoint[],bindings:TerrainAssetBindingMap={}):TerrainAutotileResult{
  if(!document.layers.some(item=>item.id===layerId))return{document,variants:[]};
  const candidates=new Map<string,GridPoint>();
  for(const point of changedPoints)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=point.x+dx,y=point.y+dy;if(x>=0&&y>=0&&x<document.width&&y<document.height)candidates.set(`${x}:${y}`,{x,y});}
  const variants:TerrainCellVariant[]=[];
  for(const point of candidates.values()){const terrain=terrainAt(document,point,layerId);if(!terrain)continue;const mask=neighborMask(document,layerId,point,terrain);const assetId=terrainAssetIdForMask(bindings,terrain,mask);variants.push({point,terrain,mask,assetId,tileId:assetId??tileIdForTerrain(terrain)});}
  return{document,variants};
}

export function logicalTerrainAt(document:MapDocument,layerId:string,point:GridPoint):TerrainKey|null{return terrainFromTileId(document.layers.find(layer=>layer.id===layerId)?.cells[indexFor(point,document.width)]?.tileId??null);}
