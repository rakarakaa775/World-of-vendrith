"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorShell } from './editor-shell';
import { MapBrowser } from './map-browser';
import { createMap, type MapDocument } from '../editor/map-document';
import { createMapEditorSupabaseClient } from '../editor/supabase-client';
import { loadTerrainAssetBindingsFromSupabase, terrainAssetBindingSummary } from '../editor/supabase-terrain-asset-loader';
import type { TerrainAssetBindingMap } from '../editor/terrain-asset-binding';

export function MapEditorApp(){
  const initial=useMemo(()=>createMap('world'),[]);
  const[activeMapId,setActiveMapId]=useState(initial.id);
  const[maps,setMaps]=useState<MapDocument[]>([initial]);
  const[terrainBindings,setTerrainBindings]=useState<TerrainAssetBindingMap>({});
  const[terrainStatus,setTerrainStatus]=useState('Loading verified terrain assets…');
  const active=maps.find(m=>m.id===activeMapId)??maps[0];
  const update=useCallback((next:MapDocument)=>setMaps(prev=>prev.some(m=>m.id===next.id)?prev.map(m=>m.id===next.id?next:m):[...prev,next]),[]);
  useEffect(()=>{
    let cancelled=false;
    const client=createMapEditorSupabaseClient();
    if(!client){setTerrainStatus('Supabase environment is not configured');return()=>{cancelled=true}};
    loadTerrainAssetBindingsFromSupabase(client).then(result=>{
      if(cancelled)return;
      setTerrainBindings(result.bindings);
      setTerrainStatus(terrainAssetBindingSummary(result));
    });
    return()=>{cancelled=true};
  },[]);
  return <div style={{display:'grid',gridTemplateRows:'auto 1fr',height:'100vh'}}>
    <MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId}/>
    <EditorShell key={active.id} initialDocument={active} onDocumentChange={update} terrainBindings={terrainBindings} terrainStatus={terrainStatus}/>
  </div>
}
