"use client";
import { createElement, useEffect, useRef } from "react";
import { Application, Assets, Container, Graphics, Rectangle, Sprite } from "pixi.js";
import type { MapDocument } from "../editor/map-document";
import type { GridPoint } from "../editor/grid";
import type { Selection } from "../editor/selection";
import { normalizeSelection } from "../editor/selection";
import { pointsInFloodFill, pointsInLine, pointsInRectangle, pointsInSquare } from "../editor/paint-tools";
import { neighborMask, terrainFromTileId } from "../editor/terrain-engine";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import { getTerrainAssetBinding } from "../editor/terrain-asset-binding";
import { resolveAssetRecords, resolveAssetUrl, mapEditorTextureCache } from "../editor/asset-resolver";
import { createMapEditorSupabaseClient } from "../editor/supabase-client";
import type { EnvironmentRuntimeState } from "../editor/environment-runtime";
import { DEFAULT_VIEWPORT, zoomAt, type Viewport } from "../editor/viewport";

type Props={document:MapDocument;activeTool:string;activeLayerId:string;selectedTileId:string|null;brushSize:number;selection:Selection|null;onPaint:(points:GridPoint[],tileId:string|null)=>void;onSelectionChange:(selection:Selection|null)=>void;onCellInspect?:(point:GridPoint)=>void;onStamp:(point:GridPoint)=>void;onObjectPlace:(point:GridPoint)=>void;onObjectMove:(objectId:string,point:GridPoint)=>void;selectedObjectId:string|null;terrainBindings?:TerrainAssetBindingMap;environmentRuntime?:EnvironmentRuntimeState|null};
const COLORS:Record<string,number>={grass:0x4f9d50,sand:0xe6c36a,dirt:0x98633e,pavement:0x8b949e,water:0x3b82c4};
const colorForTile=(id:string|null)=>id?(COLORS[terrainFromTileId(id)??""]??0x94a3b8):0xffffff;
const pointKey=(p:GridPoint)=>`${p.x}:${p.y}`;
const expandBrush=(points:GridPoint[],size:number)=>{if(size<=1)return points;const unique=new Map<string,GridPoint>();for(const point of points)for(const expanded of pointsInSquare(point,size))unique.set(pointKey(expanded),expanded);return [...unique.values()];};

export function PixiMapCanvas({document,activeTool,activeLayerId,selectedTileId,brushSize,selection,onPaint,onSelectionChange,onCellInspect,onStamp,onObjectPlace,onObjectMove,selectedObjectId,terrainBindings={},environmentRuntime}:Props){
 const hostRef=useRef<HTMLDivElement>(null);const viewportRef=useRef<Viewport>(DEFAULT_VIEWPORT);
 useEffect(()=>{let disposed=false;const host=hostRef.current;if(!host)return;const app=new Application();
  void app.init({resizeTo:host,background:"#ffffff",antialias:true,autoDensity:true,resolution:Math.min(window.devicePixelRatio||1,2)}).then(async()=>{if(disposed){app.destroy(true);return;}host.replaceChildren(app.canvas);const world=new Container();const grid=new Graphics();const overlay=new Graphics();const width=document.width*document.tileSize,height=document.height*document.tileSize;
   grid.rect(0,0,width,height).fill({color:0xffffff});grid.rect(0,0,width,height).stroke({width:2,color:0x64748b});for(let x=1;x<document.width;x++){grid.moveTo(x*document.tileSize,0).lineTo(x*document.tileSize,height);}for(let y=1;y<document.height;y++){grid.moveTo(0,y*document.tileSize).lineTo(width,y*document.tileSize);}grid.stroke({width:1,color:0xcbd5e1});world.addChild(grid);
   const ground=document.layers.find(layer=>layer.id===activeLayerId);
   const textureRequests=new Set<string>();
   for(const terrain of ["grass","sand","dirt","pavement","water"] as const){const binding=getTerrainAssetBinding(terrainBindings,terrain,255);if(binding)textureRequests.add(binding.assetId);}
   if(ground&&ground.kind!=="objects")for(let i=0;i<document.width*document.height;i++){const id=ground.cells[i]?.tileId;const terrain=terrainFromTileId(id??null);if(!terrain)continue;const binding=getTerrainAssetBinding(terrainBindings,terrain,neighborMask(document,activeLayerId,{x:i%document.width,y:Math.floor(i/document.width)},terrain));if(binding)textureRequests.add(binding.assetId);}
   let assetRecords=new Map<string,any>();
   const client=createMapEditorSupabaseClient();
   if(client&&textureRequests.size)try{assetRecords=await resolveAssetRecords(client,[...textureRequests]);}catch(error){console.warn("Map editor asset metadata lookup failed",error);}
   const loadedTextures=new Map<string,any>();
   for(const assetId of textureRequests){const asset=assetRecords.get(assetId);const url=asset?resolveAssetUrl(asset):null;if(!url)continue;const texture=await mapEditorTextureCache.load(url,Assets);if(texture)loadedTextures.set(assetId,texture);}
   if(disposed){app.destroy(true);return;}
   for(const layer of document.layers){if(!layer.visible)continue;if(layer.kind!=="objects"){for(let i=0;i<document.width*document.height;i++){const id=layer.cells[i]?.tileId;if(!id)continue;const x=i%document.width,y=Math.floor(i/document.width),terrain=terrainFromTileId(id);let renderedTexture=false;if(layer.id===activeLayerId&&terrain){const mask=neighborMask(document,layer.id,{x,y},terrain);const binding=getTerrainAssetBinding(terrainBindings,terrain,mask);const asset=binding?assetRecords.get(binding.assetId):null;const url=asset?resolveAssetUrl(asset):null;let texture=binding?loadedTextures.get(binding.assetId):null;if(!texture&&url)texture=await mapEditorTextureCache.load(url,Assets);if(texture){const sprite=new Sprite(texture);sprite.x=x*document.tileSize;sprite.y=y*document.tileSize;sprite.width=document.tileSize;sprite.height=document.tileSize;sprite.alpha=layer.kind==='collision'?.35:1;world.addChild(sprite);renderedTexture=true;}}if(!renderedTexture){const g=new Graphics();g.rect(x*document.tileSize+2,y*document.tileSize+2,document.tileSize-4,document.tileSize-4).fill({color:colorForTile(id),alpha:layer.kind==='collision'?.35:1});world.addChild(g);}}}else for(const o of layer.objects){const g=new Graphics();const c=o.category==='tree'?0x3f8f4b:o.category==='house'?0xb86b45:0x64748b;g.roundRect(o.x*document.tileSize+2,o.y*document.tileSize+2,o.width*document.tileSize-4,o.height*document.tileSize-4,4).fill({color:c,alpha:.9}).stroke({width:2,color:selectedObjectId===o.id?0x0ea5e9:0x334155});world.addChild(g);}}
   world.addChild(overlay);app.stage.addChild(world);world.eventMode="static";world.hitArea=new Rectangle(0,0,width,height);app.stage.eventMode="static";app.stage.hitArea=app.screen;
   const apply=()=>{const v=viewportRef.current;world.position.set(v.x,v.y);world.scale.set(v.zoom);};if(!viewportRef.current.x&&!viewportRef.current.y)viewportRef.current={x:Math.max((host.clientWidth-width)/2,8),y:Math.max((host.clientHeight-height)/2,8),zoom:1};apply();
   let start:GridPoint|null=null;let selecting=false;let movingId:string|null=null;let panning=false;let lastX=0,lastY=0;
   const pointAt=(e:any)=>{const p=e.getLocalPosition(world);return{x:Math.floor(p.x/document.tileSize),y:Math.floor(p.y/document.tileSize)}};const valid=(p:GridPoint)=>p.x>=0&&p.y>=0&&p.x<document.width&&p.y<document.height;const hit=(p:GridPoint)=>{const l=document.layers.find(x=>x.id==='objects');if(!l)return null;for(let i=l.objects.length-1;i>=0;i--){const o=l.objects[i];if(p.x>=o.x&&p.y>=o.y&&p.x<o.x+o.width&&p.y<o.y+o.height)return o;}return null;};const paint=(pts:GridPoint[])=>{const validPts=expandBrush(pts.filter(valid),brushSize).filter(valid);if(validPts.length)onPaint(validPts,activeTool==='Erase'?null:selectedTileId);};
   const down=(e:any)=>{const p=pointAt(e);if(activeTool==='Paint'||activeTool==='Erase'){if(valid(p)){onCellInspect?.(p);paint(pointsInSquare(p,brushSize));}start=p;return;}if(activeTool==='Flood'){if(valid(p)){onCellInspect?.(p);paint(pointsInFloodFill(document,activeLayerId,p));}return;}if(activeTool==='Line'||activeTool==='Rectangle'){if(valid(p)){onCellInspect?.(p);start=p;}return;}if(activeTool==='Select'){const o=hit(p);if(o){movingId=o.id;}else if(valid(p)){selecting=true;start=p;onSelectionChange(normalizeSelection(p,p));}return;}if(activeTool==='Stamp'){if(valid(p))onStamp(p);return;}if(activeTool==='Building'){if(valid(p))onObjectPlace(p);return;}panning=true;lastX=e.global.x;lastY=e.global.y;};
   const move=(e:any)=>{const p=pointAt(e);if((activeTool==='Paint'||activeTool==='Erase')&&start&&valid(p)){paint(pointsInSquare(p,brushSize));return;}if(selecting&&start&&valid(p)){onSelectionChange(normalizeSelection(start,p));return;}if(movingId&&valid(p)){onObjectMove(movingId,p);return;}if(!panning)return;viewportRef.current={...viewportRef.current,x:viewportRef.current.x+e.global.x-lastX,y:viewportRef.current.y+e.global.y-lastY};lastX=e.global.x;lastY=e.global.y;apply();};
   const up=(e:any)=>{const p=pointAt(e);if(start&&(activeTool==='Line'||activeTool==='Rectangle')&&valid(p)){paint(activeTool==='Line'?pointsInLine(start,p):pointsInRectangle(start,p));}start=null;selecting=false;movingId=null;panning=false;};
   const wheel=(e:WheelEvent)=>{const r=host.getBoundingClientRect();viewportRef.current=zoomAt(viewportRef.current,e.deltaY<0?1.1:.9,e.clientX-r.left,e.clientY-r.top);apply();};
   world.on("pointerdown",down).on("pointermove",move).on("pointerup",up).on("pointerupoutside",up);host.addEventListener("wheel",wheel,{passive:true});
   return()=>{host.removeEventListener("wheel",wheel);app.destroy(true);};
  }).catch(error=>console.error("Pixi map canvas initialization failed",error));
  return()=>{disposed=true;host.replaceChildren();};
 },[document,activeTool,activeLayerId,selectedTileId,brushSize,selection,onPaint,onSelectionChange,onCellInspect,onStamp,onObjectPlace,onObjectMove,selectedObjectId,terrainBindings,environmentRuntime]);
 return createElement("div",{ref:hostRef,style:{width:"100%",height:"100%",minHeight:360,background:"#fff",touchAction:"none"}});
}
