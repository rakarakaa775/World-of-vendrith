"use client";
import { useState } from "react";
import { PixiMapCanvas } from "./pixi-map-canvas";
import { createStarterMap } from "../editor/map-document";

const tools = ["Select", "Paint", "Erase", "Stamp", "Collision"];

export function EditorShell(){
 const [activeTool,setActiveTool]=useState("Select");
 const [document]=useState(createStarterMap);
 return <main className="editor"><header className="toolbar"><div className="brand">Vandrith Map Editor</div>{tools.map(tool=><button key={tool} onClick={()=>setActiveTool(tool)} aria-pressed={activeTool===tool}>{tool}</button>)}<div className="spacer"/><button>Save</button><button>Preview</button></header><section className="workspace"><aside className="sidebar"><div className="section-title">Project</div><p>{document.name}</p><div className="section-title">Layers</div>{document.layers.map(layer=><p key={layer.id}>{layer.name}</p>)}<div className="section-title">Assets</div><p>Tilesets</p><p>Objects</p></aside><section className="canvas" aria-label="Map canvas"><PixiMapCanvas document={document}/></section><aside className="inspector"><div className="section-title">Inspector</div><p>Tool: {activeTool}</p><p>Selection: none</p><div className="section-title">Map</div><p>Size: {document.width} × {document.height}</p><p>Tile: {document.tileSize} × {document.tileSize}</p><p>Mode: Edit</p></aside></section><footer className="status">PixiJS grid renderer · Database integration intentionally not enabled yet</footer></main>;
}