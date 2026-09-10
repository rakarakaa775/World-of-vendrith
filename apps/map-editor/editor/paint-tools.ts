import type { MapDocument } from './map-document';
import type { GridPoint } from './grid';
import { paintCell } from './map-state';

export type PaintShape='square'|'line'|'rectangle'|'flood';
const pointKey=(p:GridPoint)=>`${p.x}:${p.y}`;

export function pointsInSquare(center:GridPoint,size:number):GridPoint[]{const extent=Math.max(1,Math.floor(size)),before=Math.floor((extent-1)/2),after=extent-before-1,points:GridPoint[]=[];for(let y=center.y-before;y<=center.y+after;y++)for(let x=center.x-before;x<=center.x+after;x++)points.push({x,y});return points;}
export function pointsInLine(start:GridPoint,end:GridPoint):GridPoint[]{let x0=start.x,y0=start.y;const x1=end.x,y1=end.y,dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let error=dx+dy;const points:GridPoint[]=[];while(true){points.push({x:x0,y:y0});if(x0===x1&&y0===y1)break;const twice=2*error;if(twice>=dy){error+=dy;x0+=sx;}if(twice<=dx){error+=dx;y0+=sy;}}return points;}
export function pointsInRectangle(start:GridPoint,end:GridPoint):GridPoint[]{const minX=Math.min(start.x,end.x),maxX=Math.max(start.x,end.x),minY=Math.min(start.y,end.y),maxY=Math.max(start.y,end.y),points:GridPoint[]=[];for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)points.push({x,y});return points;}

/** Returns the 4-connected region containing start whose cells share the start tile. */
export function pointsInFloodFill(document:MapDocument,layerId:string,start:GridPoint):GridPoint[]{
  if(start.x<0||start.y<0||start.x>=document.width||start.y>=document.height)return[];
  const layer=document.layers.find(item=>item.id===layerId);if(!layer)return[];
  const target=layer.cells[start.y*document.width+start.x]?.tileId??null;
  const queue=[start],seen=new Set<string>([pointKey(start)]),result:GridPoint[]=[];
  while(queue.length){const point=queue.shift()!;result.push(point);for(const next of [{x:point.x+1,y:point.y},{x:point.x-1,y:point.y},{x:point.x,y:point.y+1},{x:point.x,y:point.y-1}]){if(next.x<0||next.y<0||next.x>=document.width||next.y>=document.height)continue;const key=pointKey(next);if(seen.has(key))continue;if((layer.cells[next.y*document.width+next.x]?.tileId??null)!==target)continue;seen.add(key);queue.push(next);}}
  return result;
}

export function pointsForPaintShape(document:MapDocument,shape:PaintShape,start:GridPoint,end=start,size=1):GridPoint[]{switch(shape){case'square':return pointsInSquare(end,size);case'line':return pointsInLine(start,end);case'rectangle':return pointsInRectangle(start,end);case'flood':return pointsInFloodFill(document,'ground',start);}}
export function applyPaint(document:MapDocument,layerId:string,points:GridPoint[],tileId:string|null):MapDocument{const unique=new Map<string,GridPoint>();for(const point of points)unique.set(pointKey(point),point);let next=document;for(const point of unique.values())next=paintCell(next,layerId,point,tileId);return next;}
