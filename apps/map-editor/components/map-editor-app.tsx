"use client";
import { useCallback, useMemo, useState } from 'react';
import { EditorShell } from './editor-shell';
import { MapBrowser } from './map-browser';
import { createMap, type MapDocument } from '../editor/map-document';

export function MapEditorApp(){const initial=useMemo(()=>createMap('world'),[]);const[activeMapId,setActiveMapId]=useState(initial.id);const[maps,setMaps]=useState<MapDocument[]>([initial]);const active=maps.find(m=>m.id===activeMapId)??maps[0];const update=useCallback((next:MapDocument)=>setMaps(prev=>prev.some(m=>m.id===next.id)?prev.map(m=>m.id===next.id?next:m):[...prev,next]),[]);return <div style={{display:'grid',gridTemplateRows:'auto 1fr',height:'100vh'}}><MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId}/><EditorShell key={active.id} initialDocument={active} onDocumentChange={update}/></div>}
