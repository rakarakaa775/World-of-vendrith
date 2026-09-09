import type { MapDocument, MapObject } from './map-document';
import type { GridPoint } from './grid';

export type RoadType='dirt'|'stone'|'major';
export type RoadNode={id:string;x:number;y:number;poiId:string|null};
export type RoadSegment={id:string;from:string;to:string;type:RoadType};
export type RoadNetwork={nodes:RoadNode[];segments:RoadSegment[]};

export function createRoadNetwork():RoadNetwork{return{nodes:[],segments:[]}}
export function addRoadNode(network:RoadNetwork,point:GridPoint,poiId:string|null=null):RoadNetwork{if(network.nodes.some(n=>n.x===point.x&&n.y===point.y))return network;return{...network,nodes:[...network.nodes,{id:`road-node-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,x:point.x,y:point.y,poiId}]}}
export function connectRoadNodes(network:RoadNetwork,from:string,to:string,type:RoadType='dirt'):RoadNetwork{if(from===to||!network.nodes.some(n=>n.id===from)||!network.nodes.some(n=>n.id===to)||network.segments.some(s=>(s.from===from&&s.to===to)||(s.from===to&&s.to===from)))return network;return{...network,segments:[...network.segments,{id:`road-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,from,to,type}]}}
export function attachRoadToPOI(network:RoadNetwork,poi:MapObject):RoadNetwork{return addRoadNode(network,{x:poi.x,y:poi.y},poi.id)}
export function roadNetworkToObjects(network:RoadNetwork):MapObject[]{return network.segments.flatMap(segment=>{const a=network.nodes.find(n=>n.id===segment.from),b=network.nodes.find(n=>n.id===segment.to);if(!a||!b)return[];return[{id:segment.id,kind:'decoration' as const,category:`road:${segment.type}`,x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.max(1,Math.abs(b.x-a.x)+1),height:Math.max(1,Math.abs(b.y-a.y)+1),assetId:`road-${segment.type}-placeholder`,rotation:0,zIndex:2,collision:false}]})}
export function setRoadNetwork(document:MapDocument,network:RoadNetwork):MapDocument{return document.mapType!=='region'?document:{...document,layers:document.layers.map(l=>l.id==='objects'?{...l,objects:[...l.objects.filter(o=>!o.category.startsWith('road:')),...roadNetworkToObjects(network)]}:l)}}
