"use client";

import { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import type { MapDocument } from '../editor/map-document';
import type { GridPoint } from '../editor/grid';
import { clampZoom, DEFAULT_VIEWPORT, zoomAt, type Viewport } from '../editor/viewport';

export type MapEdit = { point: GridPoint; tileId: string | null };

type Props = { document: MapDocument; activeTool: string; selectedTileId: string | null; brushSize: number; onEdit: (edit: MapEdit) => void };

export function PixiMapCanvas({ document, activeTool, selectedTileId, brushSize, onEdit }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<Viewport>(DEFAULT_VIEWPORT);
  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;
    const app = new Application();
    void app.init({ resizeTo: host, background: '#0f1318', antialias: true }).then(() => {
      if (disposed) { app.destroy(true, { children: true }); return; }
      host.replaceChildren(app.canvas);
      const world = new Container();
      const grid = new Graphics();
      const width = document.width * document.tileSize, height = document.height * document.tileSize;
      grid.rect(0, 0, width, height).stroke({ width: 1, color: 0x3a424d });
      for (let x = 1; x < document.width; x++) grid.moveTo(x * document.tileSize, 0).lineTo(x * document.tileSize, height);
      for (let y = 1; y < document.height; y++) grid.moveTo(0, y * document.tileSize).lineTo(width, y * document.tileSize);
      grid.stroke({ width: 1, color: 0x242b33 });
      world.addChild(grid);
      const ground = document.layers.find(layer => layer.kind === 'ground');
      if (ground) for (let index = 0; index < ground.cells.length; index++) {
        if (!ground.cells[index]?.tileId) continue;
        const x = index % document.width, y = Math.floor(index / document.width);
        const tile = new Graphics();
        tile.rect(x * document.tileSize + 2, y * document.tileSize + 2, document.tileSize - 4, document.tileSize - 4).fill({ color: ground.cells[index].tileId === 'water-tile' ? 0x234b63 : ground.cells[index].tileId === 'stone-tile' ? 0x59616b : 0x334455 });
        world.addChild(tile);
      }
      app.stage.addChild(world);
      const applyViewport=()=>{const v=viewportRef.current;world.position.set(v.x+12,v.y+12);world.scale.set(v.zoom);};
      if(viewportRef.current.x===0&&viewportRef.current.y===0) viewportRef.current={x:Math.max((host.clientWidth-width)/2,12),y:Math.max((host.clientHeight-height)/2,12),zoom:1};
      applyViewport();
      let panning=false,lastX=0,lastY=0;
      const editAt=(event:any)=>{const local=event.getLocalPosition(world);const baseX=Math.floor(local.x/document.tileSize),baseY=Math.floor(local.y/document.tileSize);const radius=Math.floor((brushSize-1)/2);for(let dy=0;dy<brushSize;dy++)for(let dx=0;dx<brushSize;dx++){const point={x:baseX+dx-radius,y:baseY+dy-radius};if(point.x>=0&&point.y>=0&&point.x<document.width&&point.y<document.height)onEdit({point,tileId:activeTool==='Erase'?null:selectedTileId});}};
      const down=(event:any)=>{if(activeTool==='Paint'||activeTool==='Erase'){editAt(event);return;}panning=true;lastX=event.global.x;lastY=event.global.y;};
      const move=(event:any)=>{if(!panning)return;viewportRef.current={...viewportRef.current,x:viewportRef.current.x+event.global.x-lastX,y:viewportRef.current.y+event.global.y-lastY};lastX=event.global.x;lastY=event.global.y;applyViewport();};
      const up=()=>{panning=false};
      const wheel=(event:WheelEvent)=>{const rect=host.getBoundingClientRect();viewportRef.current=zoomAt(viewportRef.current,event.deltaY<0?1.1:0.9,event.clientX-rect.left,event.clientY-rect.top);viewportRef.current.zoom=clampZoom(viewportRef.current.zoom);applyViewport();};
      app.stage.eventMode='static';app.stage.hitArea=app.screen;app.stage.on('pointerdown',down).on('pointermove',move).on('pointerup',up).on('pointerupoutside',up);host.addEventListener('wheel',wheel,{passive:true});
      return()=>host.removeEventListener('wheel',wheel);
    });
    return()=>{disposed=true;app.destroy(true,{children:true});};
  },[document,activeTool,selectedTileId,brushSize,onEdit]);
  return <div ref={hostRef} style={{width:'100%',height:'100%',minHeight:320,overflow:'hidden'}}/>;
}
