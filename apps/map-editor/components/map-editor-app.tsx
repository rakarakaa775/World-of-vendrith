"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorShell } from './editor-shell';
import { MapBrowser } from './map-browser';
import { EnvironmentRuntimeBadge } from './environment-runtime-badge';
import { createMap, type MapDocument } from '../editor/map-document';
import { createMapEditorSupabaseClient } from '../editor/supabase-client';
import { loadTerrainAssetBindingsFromSupabase, terrainAssetBindingSummary } from '../editor/supabase-terrain-asset-loader';
import { loadEnvironmentCatalogFromSupabase, environmentCatalogSummary, type EnvironmentCatalog, type EnvironmentReadiness } from '../editor/supabase-environment-loader';
import { loadEnvironmentRuntime } from '../editor/supabase-environment-runtime';
import { emptyEnvironmentRuntime, type EnvironmentRuntimeState } from '../editor/environment-runtime';
import type { TerrainAssetBindingMap } from '../editor/terrain-asset-binding';

const runtimeWorldId = process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim() || null;

export function MapEditorApp(){
  const initial=useMemo(()=>createMap('world'),[]);
  const[activeMapId,setActiveMapId]=useState(initial.id);
  const[maps,setMaps]=useState<MapDocument[]>([initial]);
  const[terrainBindings,setTerrainBindings]=useState<TerrainAssetBindingMap>({});
  const[terrainStatus,setTerrainStatus]=useState('Loading verified terrain assets…');
  const[environmentStatus,setEnvironmentStatus]=useState('Loading environment catalog…');
  const[environmentCatalog,setEnvironmentCatalog]=useState<EnvironmentCatalog|null>(null);
  const[environmentReadiness,setEnvironmentReadiness]=useState<EnvironmentReadiness|null>(null);
  const[environmentRuntime,setEnvironmentRuntime]=useState<EnvironmentRuntimeState|null>(null);
  const[environmentRuntimeError,setEnvironmentRuntimeError]=useState<string|null>(null);
  const active=maps.find(m=>m.id===activeMapId)??maps[0];
  const update=useCallback((next:MapDocument)=>setMaps(prev=>prev.some(m=>m.id===next.id)?prev.map(m=>m.id===next.id?next:m):[...prev,next]),[]);
  useEffect(()=>{
    let cancelled=false;
    const client=createMapEditorSupabaseClient();
    if(!client){setTerrainStatus('Supabase environment is not configured');setEnvironmentStatus('Supabase environment is not configured');setEnvironmentRuntime(emptyEnvironmentRuntime(runtimeWorldId??'unconfigured'));setEnvironmentRuntimeError('Supabase environment is not configured');return()=>{cancelled=true}};
    loadTerrainAssetBindingsFromSupabase(client).then(result=>{
      if(cancelled)return;
      setTerrainBindings(result.bindings);
      setTerrainStatus(terrainAssetBindingSummary(result));
    });
    loadEnvironmentCatalogFromSupabase(client).then(result=>{
      if(cancelled)return;
      setEnvironmentCatalog(result.source==='supabase'?result.catalog:null);
      setEnvironmentReadiness(result.source==='supabase'?result.readiness:null);
      setEnvironmentStatus(environmentCatalogSummary(result));
    });
    if(!runtimeWorldId){
      setEnvironmentRuntime(emptyEnvironmentRuntime('unconfigured'));
      setEnvironmentRuntimeError('No canonical world runtime ID configured');
    }else{
      loadEnvironmentRuntime(client,runtimeWorldId).then(result=>{
        if(cancelled)return;
        setEnvironmentRuntime(result.state);
        setEnvironmentRuntimeError(result.error);
      });
    }
    return()=>{cancelled=true};
  },[]);
  return <div style={{display:'grid',gridTemplateRows:'auto 1fr',height:'100vh'}}>
    <MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId}/>
    <EditorShell key={active.id} initialDocument={active} onDocumentChange={update} terrainBindings={terrainBindings} terrainStatus={`${terrainStatus} · ${environmentStatus}`} environmentCatalog={environmentCatalog} environmentReadiness={environmentReadiness}/>
    <EnvironmentRuntimeBadge worldId={runtimeWorldId} state={environmentRuntime} error={environmentRuntimeError}/>
  </div>
}
