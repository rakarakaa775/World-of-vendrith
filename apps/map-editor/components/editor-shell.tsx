"use client";
import { useCallback, useState } from "react";
import { PixiMapCanvas } from "./pixi-map-canvas";
import { createStarterMap, type MapDocument } from "../editor/map-document";
import { paintCell } from "../editor/map-state";
import { STARTER_TILES } from "../editor/tile-palette";

const tools = ["Select", "Paint", "Erase", "Stamp", "Collision"];
const brushSizes = [1, 2, 3, 5];

export function EditorShell(){
 const [activeTool,setActiveTool]=useState("Select");
 const [selectedTile,setSelectedTile]=useState(STARTER_TILES[0].id);
 const [brushSize,setBrushSize]=useState(1);
 const [document,setDocument]=useState<MapDocument>(createStarterMap);
 const handleEdit=useCallback(({point,tileId}:{point:{x:number;y:number};tileId:string|null})=>{
   setDocument(current=>paintCell(current,'ground',point,tileId));
 },[]);
 const effectiveTile=activeTool==='Erase'?null:selectedTile;
 return <main className="editor"><header className="toolbar"><div className="brand">Vandrith Map Editor</div>{tools.map(tool=><button key={tool} onClick={()=>setActiveTool(tool)} aria-pressed={activeTool===tool}>{tool}</button>)}<div className="spacer"/><button>Undo</button><button>Redo</button><button>Save</button><button>Preview</button></header><section className="workspace"><aside className="sidebar"><div className="section-title">Project</div><p>{document.name}</p><div className="section-title">Layers</div>{document.layers.map(layer=><p key={layer.id}>{layer.name}</p>)}<div className="section-title">Tiles</div>{STARTER_TILES.map(tile=><button key={tile.id} onClick={()=>{setSelectedTile(tile.id);setActiveTool('Paint')}} aria-pressed={selectedTile===tile.id}>{tile.label}</button>)}<div className="section-title">Brush Size</div><div>{brushSizes.map(size=><button key={size} onClick={()=>setBrushSize(size)} aria-pressed={brushSize===size}>{size}×</button>)}</div></aside><section className="canvas" aria-label="Map canvas"><PixiMapCanvas document={document} activeTool={activeTool} selectedTileId={effectiveTile} brushSize={brushSize} onEdit={handleEdit}/></section><aside className="inspector"><div className="section-title">Inspector</div><p>Tool: {activeTool}</p><p>Tile: {selectedTile}</p><p>Brush: {brushSize} × {brushSize}</p><p>Selection: none</p><div className="section-title">Map</div><p>Size: {document.width} × {document.height}</p><p>Tile: {document.tileSize} × {document.tileSize}</p><p>Mode: Edit</p></aside></section><footer className="status">PixiJS editor · Unsaved local changes: {document.layers.some(layer=>layer.cells.some(cell=>cell.tileId)) ? 'yes' : 'no'}</footer></main>;
}