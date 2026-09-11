"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorShell } from './editor-shell';
import { MapBrowser } from './map-browser';
import { EnvironmentRuntimeBadge } from './environment-runtime-badge';
import { ConflictResolutionEditorOverlay } from './conflict-resolution-editor-overlay';
import { createMap, type MapDocument } from '../editor/map-document';
import { createMapEditorSupabaseClient } from '../editor/supabase-client';
import { loadTerrainAssetBindingsFromSupabase, terrainAssetBindingSummary } from '../editor/supabase-terrain-asset-loader';
import { loadEnvironmentCatalogFromSupabase, environmentCatalogSummary, type EnvironmentCatalog, type EnvironmentReadiness } from '../editor/supabase-environment-loader';
import { loadEnvironmentRuntime } from '../editor/supabase-environment-runtime';
import { loadMapDocumentSnapshot, saveMapDocumentSnapshot } from '../editor/map-persistence';
import { emptyEnvironmentRuntime, type EnvironmentRuntimeState } from '../editor/environment-runtime';
import type { TerrainAssetBindingMap } from '../editor/terrain-asset-binding';
import type { MapMergeResult } from '../editor/map-entity-merge';
import { createConflictResolutionSession, applyResolution, type ConflictResolutionSession } from '../editor/map-conflict-resolution-ui-model';
import { createSupabaseMapMergePersistence, serializeResolvedMapSnapshot } from '../editor/map-merge-persistence-supabase';

const runtimeWorldId = process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim() || null;
const persistedMapId = process.env.NEXT_PUBLIC_VANDRITH_MAP_ID?.trim() || null;

export function MapEditorApp(){
  const initial=useMemo(()=>createMap('world'),[]);
  const[activeMapId,setActiveMapId]=useState(initial.id); const[maps,setMaps]=useState<MapDocument[]>([initial]);
  const[terrainBindings,setTerrainBindings]=useState<TerrainAssetBindingMap>({}); const[terrainStatus,setTerrainStatus]=useState('Loading verified terrain assets…');
  const[environmentStatus,setEnvironmentStatus]=useState('Loading environment catalog…'); const[environmentCatalog,setEnvironmentCatalog]=useState<EnvironmentCatalog|null>(null); const[environmentReadiness,setEnvironmentReadiness]=useState<EnvironmentReadiness|null>(null); const[environmentRuntime,setEnvironmentRuntime]=useState<EnvironmentRuntimeState|null>(null); const[environmentRuntimeError,setEnvironmentRuntimeError]=useState<string|null>(null);
  const[persistenceStatus,setPersistenceStatus]=useState(persistedMapId?'Loading saved map…':'No persisted map configured'); const[busy,setBusy]=useState(false);
  const[conflictResult,setConflictResult]=useState<MapMergeResult|null>(null); const[conflictSession,setConflictSession]=useState<ConflictResolutionSession|null>(null); const[authoritativeVersion,setAuthoritativeVersion]=useState(0);
  const active=maps.find(m=>m.id===activeMapId)??maps[0];
  const update=useCallback((next:MapDocument)=>setMaps(prev=>prev.some(m=>m.id===next.id)?prev.map(m=>m.id===next.id?next:m):[...prev,next]),[]);
  const openConflictResolution=useCallback((result:MapMergeResult)=>{setConflictResult(result);setConflictSession(createConflictResolutionSession(result));},[]);
  const closeConflictResolution=useCallback(()=>{setConflictResult(null);setConflictSession(null)},[]);
  const persistResolved=useCallback(async(resolved:MapDocument)=>{
    const client=createMapEditorSupabaseClient(); if(!client||!persistedMapId) throw new Error('Supabase persistence is not configured');
    if(!authoritativeVersion) throw new Error('No authoritative map version is available for merge commit');
    const persistence=createSupabaseMapMergePersistence(client);
    const response=await persistence.commitResolvedMerge(resolved.id,authoritativeVersion,serializeResolvedMapSnapshot(resolved),'conflict-resolution');
    if(response.status==='conflict'){setPersistenceStatus(`Conflict is stale: remote version is ${response.current_version}; reload before retrying`);return false;}
    setAuthoritativeVersion(response.version_number); update(resolved); setPersistenceStatus(`Conflict resolved and committed as version ${response.version_number}`); return true;
  },[authoritativeVersion,update]);
  const applyConflictResolution=useCallback(async(resolved:MapDocument)=>{setBusy(true);try{if(await persistResolved(resolved)) closeConflictResolution();}catch(error){setPersistenceStatus(`Conflict commit failed: ${error instanceof Error?error.message:'unknown error'}`)}finally{setBusy(false)}},[persistResolved,closeConflictResolution]);
  useEffect(()=>{let cancelled=false;const client=createMapEditorSupabaseClient();if(!client){setTerrainStatus('Supabase environment is not configured');setEnvironmentStatus('Supabase environment is not configured');setEnvironmentRuntime(emptyEnvironmentRuntime(runtimeWorldId??'unconfigured'));setEnvironmentRuntimeError('Supabase environment is not configured');setPersistenceStatus('Supabase environment is not configured');return()=>{cancelled=true}};
    if(persistedMapId){loadMapDocumentSnapshot(client,persistedMapId).then(({result,document})=>{if(cancelled)return;if(document){setMaps([document]);setActiveMapId(document.id);setAuthoritativeVersion(result.version_number??0);setPersistenceStatus(`Saved map loaded at version ${result.version_number??0}`)}else setPersistenceStatus(result.code==='MAP_ACCESS_DENIED'?'Map access denied':'No saved snapshot found')}).catch(error=>{if(!cancelled)setPersistenceStatus(`Load failed: ${error instanceof Error?error.message:'unknown error'}`)})}
    loadTerrainAssetBindingsFromSupabase(client).then(result=>{if(cancelled)return;setTerrainBindings(result.bindings);setTerrainStatus(terrainAssetBindingSummary(result))});loadEnvironmentCatalogFromSupabase(client).then(result=>{if(cancelled)return;setEnvironmentCatalog(result.source==='supabase'?result.catalog:null);setEnvironmentReadiness(result.source==='supabase'?result.readiness:null);setEnvironmentStatus(environmentCatalogSummary(result))});if(!runtimeWorldId){setEnvironmentRuntime(emptyEnvironmentRuntime('unconfigured'));setEnvironmentRuntimeError('No canonical world runtime ID configured')}else loadEnvironmentRuntime(client,runtimeWorldId).then(result=>{if(cancelled)return;setEnvironmentRuntime(result.state);setEnvironmentRuntimeError(result.error)});return()=>{cancelled=true}},[]);
  const save=useCallback(async()=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId||active.id!==persistedMapId){setPersistenceStatus('Save unavailable: configure NEXT_PUBLIC_VANDRITH_MAP_ID for the active persisted map');return;}setBusy(true);setPersistenceStatus('Saving…');try{const result=await saveMapDocumentSnapshot(client,active);setPersistenceStatus(result.ok?'Saved to Supabase':'Save failed: '+(result.code??'unknown error'))}catch(error){setPersistenceStatus(`Save failed: ${error instanceof Error?error.message:'unknown error'}`)}finally{setBusy(false)}},[active]);
  const load=useCallback(async()=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId){setPersistenceStatus('Load unavailable: configure NEXT_PUBLIC_VANDRITH_MAP_ID');return;}setBusy(true);setPersistenceStatus('Loading…');try{const {result,document}=await loadMapDocumentSnapshot(client,persistedMapId);if(document){setMaps([document]);setActiveMapId(document.id);setAuthoritativeVersion(result.version_number??0);setPersistenceStatus(`Loaded from Supabase at version ${result.version_number??0}`)}else setPersistenceStatus(result.code==='MAP_ACCESS_DENIED'?'Map access denied':'No saved snapshot found')}catch(error){setPersistenceStatus(`Load failed: ${error instanceof Error?error.message:'unknown error'}`)}finally{setBusy(false)}},[]);
  return <div style={{display:'grid',gridTemplateRows:'auto 1fr',height:'100vh'}}><MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId}/><div style={{position:'relative',minHeight:0}}><div style={{position:'absolute',top:8,right:8,zIndex:10,display:'flex',gap:6,alignItems:'center',padding:6,border:'1px solid #334155',borderRadius:4,background:'#0f172a'}}><button onClick={save} disabled={busy||!persistedMapId||active.id!==persistedMapId}>Save Map</button><button onClick={load} disabled={busy||!persistedMapId}>Load Map</button><span style={{fontSize:11,opacity:.8}}>{persistenceStatus}</span></div><EditorShell key={active.id} initialDocument={active} onDocumentChange={update} terrainBindings={terrainBindings} terrainStatus={`${terrainStatus} · ${environmentStatus}`} environmentCatalog={environmentCatalog} environmentReadiness={environmentReadiness} environmentRuntime={environmentRuntime}/>{conflictResult&&conflictSession&&<ConflictResolutionEditorOverlay result={conflictResult} session={conflictSession} onCancel={closeConflictResolution} onResolved={applyConflictResolution}/>}</div><EnvironmentRuntimeBadge worldId={runtimeWorldId} state={environmentRuntime} error={environmentRuntimeError}/></div>;
}
