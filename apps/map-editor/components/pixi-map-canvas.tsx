"use client";

import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { MapDocument } from '../editor/map-document';
import type { GridPoint } from '../editor/grid';
import { DEFAULT_VIEWPORT, zoomAt, type Viewport } from '../editor/viewport';
import { normalizeSelection, type Selection } from '../editor/selection';
import { pointsInFloodFill, pointsInLine, pointsInRectangle, pointsInSquare } from '../editor/paint-tools';
import { terrainTextureSourceFor } from '../editor/terrain-texture-registry';
import { createTerrainRuntime } from '../editor/terrain-runtime';
import { buildTerrainRenderPlan, terrainRenderCellAt } from '../editor/terrain-renderer';
import { junctionCornerDirections, terrainJunctionGeometry } from '../editor/terrain-junction-geometry';
import { analyzeTerrainBrushPreview, analyzeFloodTerrainBrushPreview } from '../editor/terrain-brush-preview';
import type { TerrainAssetBindingMap } from '../editor/terrain-asset-binding';
import type { EnvironmentRuntimeState } from '../editor/environment-runtime';

type Props = {
  document: MapDocument;
  activeTool: string;
  activeLayerId: string;
  selectedTileId: string | null;
  brushSize: number;
  selection: Selection | null;
  onPaint: (points: GridPoint[], tileId: string | null) => void;
  onSelectionChange: (selection: Selection | null) => void;
  onCellInspect?: (point: GridPoint) => void;
  onStamp: (point: GridPoint) => void;
  onObjectPlace: (point: GridPoint) => void;
  onObjectMove: (objectId: string, point: GridPoint) => void;
  selectedObjectId: string | null;
  terrainBindings?: TerrainAssetBindingMap;
  environmentRuntime?: EnvironmentRuntimeState | null;
};

const tileColor = (id: string, kind: string) => kind === 'collision' ? 0xef4444 : id === 'water-tile' ? 0x234b63 : id === 'sand' ? 0xc9a66b : id === 'dirt' ? 0x76513a : id === 'stone-tile' ? 0x59616b : 0x4d7c4a;
const edgeColor = (terrain: string) => terrain === 'water' ? 0x7dd3fc : terrain === 'sand' ? 0xf4d58d : terrain === 'dirt' ? 0xb8794a : terrain === 'pavement' ? 0xb9c0c8 : 0xa7d46f;

function drawJunctionCorner(g: Graphics, direction: 'ne' | 'se' | 'sw' | 'nw', x: number, y: number, t: number, color: number, alpha: number, mode: string) {
  const inset = 2, inner = 0.42, outer = 0.58;
  if (direction === 'ne') { g.poly(mode === 'quad-corner' ? [x*t+inset,y*t+inset,x*t+t-inset,y*t+inset,x*t+t-inset,y*t+t-inset] : mode === 'triple-corner' ? [x*t+inner*t,y*t+inset,x*t+t-inset,y*t+inset,x*t+t-inset,y*t+inner*t] : [x*t+outer*t,y*t+inset,x*t+t-inset,y*t+inset,x*t+t-inset,y*t+outer*t]).fill({color,alpha}); return; }
  if (direction === 'se') { g.poly(mode === 'quad-corner' ? [x*t+t-inset,y*t+inset,x*t+t-inset,y*t+t-inset,x*t+inset,y*t+t-inset] : mode === 'triple-corner' ? [x*t+t-inset,y*t+inner*t,x*t+t-inset,y*t+t-inset,x*t+inner*t,y*t+t-inset] : [x*t+t-inset,y*t+outer*t,x*t+t-inset,y*t+t-inset,x*t+outer*t,y*t+t-inset]).fill({color,alpha}); return; }
  if (direction === 'sw') { g.poly(mode === 'quad-corner' ? [x*t+t-inset,y*t+t-inset,x*t+inset,y*t+t-inset,x*t+inset,y*t+inset] : mode === 'triple-corner' ? [x*t+outer*t,y*t+t-inset,x*t+inset,y*t+t-inset,x*t+inset,y*t+inner*t] : [x*t+outer*t,y*t+t-inset,x*t+inset,y*t+t-inset,x*t+inset,y*t+outer*t]).fill({color,alpha}); return; }
  g.poly(mode === 'quad-corner' ? [x*t+inset,y*t+t-inset,x*t+inset,y*t+inset,x*t+t-inset,y*t+inset] : mode === 'triple-corner' ? [x*t+inset,y*t+inner*t,x*t+inset,y*t+t-inset,x*t+inner*t,y*t+inset] : [x*t+inset,y*t+outer*t,x*t+inset,y*t+t-inset,x*t+outer*t,y*t+inset]).fill({color,alpha});
}

function drawBrushPreview(preview: Graphics, document: MapDocument, layerId: string, points: GridPoint[], selectedTileId: string | null, t: number, activeTool: string, terrainBindings: TerrainAssetBindingMap) {
  preview.clear(); if (!points.length) return;
  const analysis = activeTool === 'Flood' ? analyzeFloodTerrainBrushPreview(document, layerId, points[0], selectedTileId, terrainBindings) : analyzeTerrainBrushPreview(document, layerId, points, selectedTileId, terrainBindings);
  for (const cell of analysis.cells) {
    const {x,y}=cell.point; if (!cell.terrain) continue; const color=edgeColor(cell.terrain); const alpha=cell.junctionKind==='quad'?0.30:cell.junctionKind==='triple'?0.26:cell.junctionKind==='dual'?0.22:0.16;
    preview.rect(x*t+2,y*t+2,t-4,t-4).fill({color,alpha}).stroke({width:1,color:0xe2e8f0,alpha:0.65});
    if(cell.mask!==null){const band=Math.max(2,Math.round(t*0.08));if((cell.mask&1)===0)preview.rect(x*t+3,y*t+3,t-6,band).fill({color,alpha:0.7});if((cell.mask&2)===0)preview.rect((x+1)*t-band-3,y*t+3,band,t-6).fill({color,alpha:0.7});if((cell.mask&4)===0)preview.rect(x*t+3,(y+1)*t-band-3,t-6,band).fill({color,alpha:0.7});if((cell.mask&8)===0)preview.rect(x*t+3,y*t+3,band,t-6).fill({color,alpha:0.7});}
    if(cell.junctionMode!=='none'){const dirs=cell.junctionMode==='edge'?[]:['ne','se','sw','nw'];for(const direction of dirs)drawJunctionCorner(preview,direction as 'ne'|'se'|'sw'|'nw',x,y,t,color,0.12,cell.junctionMode);}
  }
}

export function PixiMapCanvas({document,activeTool,activeLayerId,selectedTileId,brushSize,selection,onPaint,onSelectionChange,onCellInspect,onStamp,onObjectPlace,onObjectMove,selectedObjectId,terrainBindings={},environmentRuntime=null}:Props){
  const hostRef=useRef<HTMLDivElement>(null); const viewportRef=useRef<Viewport>(DEFAULT_VIEWPORT);
  useEffect(()=>{let disposed=false;const host=hostRef.current;if(!host)return;const runtime=createTerrainRuntime(terrainBindings);const app=new Application();
    void app.init({resizeTo:host,background:'#0f1318',antialias:true}).then(()=>{if(disposed){app.destroy(true,{children:true});runtime.dispose();return;}host.replaceChildren(app.canvas);const world=new Container();const grid=new Graphics();const overlay=new Graphics();const preview=new Graphics();const width=document.width*document.tileSize;const height=document.height*document.tileSize;const terrainPlans=new Map<string,ReturnType<typeof buildTerrainRenderPlan>>();
      grid.rect(0,0,width,height).stroke({width:1,color:0x3a424d});for(let x=1;x<document.width;x++)grid.moveTo(x*document.tileSize,0).lineTo(x*document.tileSize,height);for(let y=1;y<document.height;y++)grid.moveTo(0,y*document.tileSize).lineTo(width,y*document.tileSize);grid.stroke({width:1,color:0x242b33});world.addChild(grid);
      for(const layer of document.layers)if(layer.visible&&layer.kind==='ground')terrainPlans.set(layer.id,buildTerrainRenderPlan(document,layer.id,terrainBindings));
      const textureJobs:Array<Promise<void>>=[];
      for(const layer of document.layers){if(!layer.visible)continue;const terrainPlan=layer.kind==='ground'?terrainPlans.get(layer.id):null;for(let i=0;i<layer.cells.length;i++){const id=layer.cells[i]?.tileId;if(!id)continue;const x=i%document.width,y=Math.floor(i/document.width),t=document.tileSize,tile=new Graphics();tile.rect(x*t+2,y*t+2,t-4,t-4).fill({color:tileColor(id,layer.kind),alpha:layer.kind==='collision'?0.32:1});
          if(layer.kind==='ground'){const renderCell=terrainPlan?terrainRenderCellAt(terrainPlan,{x,y}):null;const variant=renderCell?.variant??null;const source=variant?terrainTextureSourceFor(runtime.registry,variant.assetId):null;world.addChild(tile);if(source&&renderCell?.variant.assetId){const sprite=new Sprite(Texture.WHITE);sprite.position.set(x*t+2,y*t+2);sprite.width=t-4;sprite.height=t-4;sprite.alpha=0;world.addChild(sprite);textureJobs.push(runtime.cache.load(source).then(texture=>{if(disposed||!texture)return;sprite.texture=texture;sprite.alpha=1;}));}if(renderCell){const c=edgeColor(renderCell.variant.terrain),west=(renderCell.variant.mask&8)!==0,east=(renderCell.variant.mask&2)!==0,north=(renderCell.variant.mask&1)!==0,south=(renderCell.variant.mask&4)!==0;if(!west)tile.moveTo(2,2).lineTo(2,t-2);if(!east)tile.moveTo(t-2,2).lineTo(t-2,t-2);if(!north)tile.moveTo(2,2).lineTo(t-2,2);if(!south)tile.moveTo(2,t-2).lineTo(t-2,t-2);tile.stroke({width:2,color:c,alpha:0.75});const geometry=renderCell.junction?terrainJunctionGeometry(renderCell.junction,{x,y}):null;for(const blend of renderCell.blend){const neighborColor=edgeColor(blend.neighborTerrain),g=new Graphics(),strength=geometry?.strength??0.24;if(blend.kind==='corner'&&geometry){const allowed=junctionCornerDirections(geometry);if(!allowed.includes(blend.direction as 'ne'|'se'|'sw'|'nw'))continue;drawJunctionCorner(g,blend.direction as 'ne'|'se'|'sw'|'nw',x,y,t,neighborColor,strength*0.9,geometry.mode);world.addChild(g);continue;}const band=Math.max(3,Math.round(t*0.12));if(blend.direction==='n')g.rect(x*t+2,y*t+2,t-4,band).fill({color:neighborColor,alpha:strength});if(blend.direction==='s')g.rect(x*t+2,(y+1)*t-band-2,t-4,band).fill({color:neighborColor,alpha:strength});if(blend.direction==='w')g.rect(x*t+2,y*t+2,band,t-4).fill({color:neighborColor,alpha:strength});if(blend.direction==='e')g.rect((x+1)*t-band-2,y*t+2,band,t-4).fill({color:neighborColor,alpha:strength});world.addChild(g);}}}else world.addChild(tile);}
        if(layer.kind==='objects')for(const o of layer.objects){const g=new Graphics();g.rect(o.x*document.tileSize+3,o.y*document.tileSize+3,o.width*document.tileSize-6,o.height*document.tileSize-6).fill({color:o.kind==='house'?0x8b5e3c:o.kind==='tree'?0x3f7d45:0x777777,alpha:0.9}).stroke({width:2,color:selectedObjectId===o.id?0xf8fafc:0x111827});world.addChild(g);const label=new Text({text:o.kind[0].toUpperCase(),style:{fontSize:14,fill:0xffffff}});label.position.set(o.x*document.tileSize+10,o.y*document.tileSize+8);world.addChild(label);}
      }
      world.addChild(overlay);world.addChild(preview);app.stage.addChild(world);const apply=()=>{const v=viewportRef.current;world.position.set(v.x+12,v.y+12);world.scale.set(v.zoom);};if(!viewportRef.current.x&&!viewportRef.current.y)viewportRef.current={x:Math.max((host.clientWidth-width)/2,12),y:Math.max((host.clientHeight-height)/2,12),zoom:1};apply();overlay.clear();if(selection)overlay.rect(selection.x*document.tileSize,selection.y*document.tileSize,selection.width*document.tileSize,selection.height*document.tileSize).fill({color:0x7dd3fc,alpha:0.12}).stroke({width:2,color:0x7dd3fc});
      let selecting=false,panning=false,moving=false,lastX=0,lastY=0,start:GridPoint|null=null,moveId:string|null=null;const pointAt=(e:any)=>{const p=e.getLocalPosition(world);return{x:Math.floor(p.x/document.tileSize),y:Math.floor(p.y/document.tileSize)}};const valid=(p:GridPoint)=>p.x>=0&&p.y>=0&&p.x<document.width&&p.y<document.height;const hitObject=(p:GridPoint)=>{const layer=document.layers.find(l=>l.id==='objects');if(!layer)return null;for(let i=layer.objects.length-1;i>=0;i--){const o=layer.objects[i];if(p.x>=o.x&&p.y>=o.y&&p.x<o.x+o.width&&p.y<o.y+o.height)return o;}return null;};const paint=(points:GridPoint[])=>onPaint(points.filter(valid),activeTool==='Erase'?null:selectedTileId);const previewPoints=(s:GridPoint,e:GridPoint)=>activeTool==='Paint'||activeTool==='Erase'?pointsInSquare(e,brushSize):activeTool==='Line'?pointsInLine(s,e):activeTool==='Rectangle'?pointsInRectangle(s,e):activeTool==='Flood'&&valid(e)?[e]:[];const hover=(points:GridPoint[])=>{if(activeLayerId!=='ground'||activeTool==='Erase'){preview.clear();return;}drawBrushPreview(preview,document,activeLayerId,points,selectedTileId,document.tileSize,activeTool,terrainBindings);};
      const down=(e:any)=>{const p=pointAt(e);if(activeTool==='Paint'||activeTool==='Erase'){if(valid(p))onCellInspect?.(p);start=p;hover(previewPoints(p,p));return;}if(activeTool==='Flood'){if(valid(p)){onCellInspect?.(p);start=p;hover([p]);}return;}if(activeTool==='Line'||activeTool==='Rectangle'){if(valid(p))onCellInspect?.(p);start=p;hover([p]);return;}if(activeTool==='Select'){const hit=hitObject(p);if(hit){moveId=hit.id;moving=true;onSelectionChange(null);}else if(valid(p)){onCellInspect?.(p);selecting=true;start=p;onSelectionChange(normalizeSelection(p,p));}return;}if(activeTool==='Stamp'){if(valid(p))onStamp(p);return;}if(activeTool==='Building'){if(valid(p))onObjectPlace(p);return;}panning=true;lastX=e.global.x;lastY=e.global.y;};
      const move=(e:any)=>{const p=pointAt(e);if(moving&&moveId){if(valid(p))onObjectMove(moveId,p);return;}if(selecting&&start){if(valid(p))onSelectionChange(normalizeSelection(start,p));return;}if(activeTool==='Flood'){if(valid(p))hover([p]);return;}if(start&&(activeTool==='Paint'||activeTool==='Erase'||activeTool==='Line'||activeTool==='Rectangle')){hover(previewPoints(start,p));return;}if(!panning)return;viewportRef.current={...viewportRef.current,x:viewportRef.current.x+e.global.x-lastX,y:viewportRef.current.y+e.global.y-lastY};lastX=e.global.x;lastY=e.global.y;apply();};
      const up=(e:any)=>{if(activeTool==='Flood'){const end=pointAt(e);if(valid(end))paint(pointsInFloodFill(document,activeLayerId,end));start=null;preview.clear();return;}if(start&&(activeTool==='Line'||activeTool==='Rectangle'||activeTool==='Paint'||activeTool==='Erase')){const end=pointAt(e);if(valid(end))paint(previewPoints(start,end));}start=null;preview.clear();selecting=false;moving=false;moveId=null;panning=false;};
      const wheel=(e:WheelEvent)=>{const r=host.getBoundingClientRect();viewportRef.current=zoomAt(viewportRef.current,e.deltaY<0?1.1:0.9,e.clientX-r.left,e.clientY-r.top);apply();};
      app.stage.eventMode='static';app.stage.hitArea=app.screen;app.stage.on('pointerdown',down).on('pointermove',move).on('pointerup',up).on('pointerupoutside',up);host.addEventListener('wheel',wheel,{passive:true});void Promise.all(textureJobs);return()=>host.removeEventListener('wheel',wheel);
    });return()=>{disposed=true;runtime.dispose();app.destroy(true,{children:true});};
  },[document,activeTool,activeLayerId,selectedTileId,brushSize,selection,onPaint,onSelectionChange,onCellInspect,onStamp,onObjectPlace,onObjectMove,selectedObjectId,terrainBindings,environmentRuntime]);
  return <div ref={hostRef} style={{width:'100%',height:'100%',minHeight:320,overflow:'hidden'}}/>;
}
