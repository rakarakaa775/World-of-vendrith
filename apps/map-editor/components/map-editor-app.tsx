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
import { loadMapDocumentSnapshot } from '../editor/map-persistence';
import { emptyEnvironmentRuntime, type EnvironmentRuntimeState } from '../editor/environment-runtime';
import type { TerrainAssetBindingMap } from '../editor/terrain-asset-binding';
import type { MapMergeResult } from '../editor/map-entity-merge';
import { createConflictResolutionSession, type ConflictResolutionSession } from '../editor/map-conflict-resolution-ui-model';
import { saveWithConflictDetection } from '../editor/map-conflict-save-controller';
import { createSupabaseMapMergePersistence, serializeResolvedMapSnapshot } from '../editor/map-merge-persistence-supabase';
import { mergeMapDocumentsThreeWay } from '../editor/map-entity-merge';

const runtimeWorldId = process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim() || '3695d0b0-788e-42fa-9345-cc3197d0c94d';
const configuredPersistedMapId = process.env.NEXT_PUBLIC_VANDRITH_MAP_ID?.trim() || null;

export function MapEditorApp(){
  const initial=useMemo(()=>createMap('world'),[]);
  const[activeMapId,setActiveMapId]=useState(initial.id); const[maps,setMaps]=useState<MapDocument[]>([initial]);
  const[persistedMapId,setPersistedMapId]=useState(configuredPersistedMapId);
  const[terrainBindings,setTerrainBindings]=useState<TerrainAssetBindingMap>({}); const[terrainStatus,setTerrainStatus]=useState('Loading verified terrain assets…');
  const[environmentStatus,setEnvironmentStatus]=useState('Loading environment catalog…'); const[environmentCatalog,setEnvironmentCatalog]=useState<EnvironmentCatalog|null>(null); const[environmentReadiness,setEnvironmentReadiness]=useState<EnvironmentReadiness|null>(null); const[environmentRuntime,setEnvironmentRuntime]=useState<EnvironmentRuntimeState|null>(null); const[environmentRuntimeError,setEnvironmentRuntimeError]=useState<string|null>(null);
  const[persistenceStatus,setPersistenceStatus]=useState(configuredPersistedMapId?'Loading saved map…':'Preparing authoritative map…'); const[busy,setBusy]=useState(false);
  const[conflictResult,setConflictResult]=useState<MapMergeResult|null>(null); const[conflictSession,setConflictSession]=useState<ConflictResolutionSession|null>(null); const[authoritativeVersion,setAuthoritativeVersion]=useState(0); const[baseDocument,setBaseDocument]=useState<MapDocument|null>(null); const[conflictRemoteDocument,setConflictRemoteDocument]=useState<MapDocument|null>(null);
  const active=maps.find(m=>m.id===activeMapId)??maps[0];
  const update=useCallback((next:MapDocument)=>setMaps(prev=>prev.some(m=>m.id===next.id)?prev.map(m=>m.id===next.id?next:m):[...prev,next]),[]);
  const openConflictResolution=useCallback((result:MapMergeResult,remoteDocument?:MapDocument)=>{setConflictResult(result);setConflictSession(createConflictResolutionSession(result));if(remoteDocument)setConflictRemoteDocument(remoteDocument)},[]);
  const closeConflictResolution=useCallback(()=>{setConflictResult(null);setConflictSession(null);setConflictRemoteDocument(null)},[]);
  const persistResolved=useCallback(async(resolved:MapDocument,expectedVersion:number)=>{
    const client=createMapEditorSupabaseClient(); if(!client) throw new Error('Supabase persistence is not configured');
    const persistence=createSupabaseMapMergePersistence(client);
    const response=await persistence.commitResolvedMerge(resolved.id,expectedVersion,serializeResolvedMapSnapshot(resolved),'conflict-resolution');
    if(response.status==='conflict'){
      const refreshed=await loadMapDocumentSnapshot(client,resolved.id); if(!refreshed.document) throw new Error('Remote map disappeared during conflict retry');
      const retryBase=conflictRemoteDocument??baseDocument??refreshed.document;
      const retryMerge=mergeMapDocumentsThreeWay(retryBase,resolved,refreshed.document);
      setAuthoritativeVersion(refreshed.result.version_number??response.current_version); setBaseDocument(refreshed.document); openConflictResolution(retryMerge,refreshed.document); setPersistenceStatus(`Remote advanced to version ${refreshed.result.version_number??response.current_version}; review the refreshed conflict`); return false;
    }
    const savedVersion=response.version_number??expectedVersion;
    setAuthoritativeVersion(savedVersion); setBaseDocument(resolved); update(resolved); setPersistenceStatus(`Saved as version ${savedVersion}`); return true;
  },[baseDocument,conflictRemoteDocument,openConflictResolution,update]);
  const applyConflictResolution=useCallback(async(resolved:MapDocument)=>{if(!conflictResult)return;setBusy(true);try{if(await persistResolved(resolved,authoritativeVersion))closeConflictResolution();}catch(error){setPersistenceStatus(`Conflict commit failed: ${error instanceof Error?error.message:'unknown error'}`)}finally{setBusy(false)}},[conflictResult,persistResolved,closeConflictResolution,authoritativeVersion]);
  useEffect(()=>{let cancelled=false;const client=createMapEditorSupabaseClient();if(!client){setTerrainStatus('Supabase environment is not configured');setEnvironmentStatus('Supabase environment is not configured');setEnvironmentRuntime(emptyEnvironmentRuntime(runtimeWorldId));setEnvironmentRuntimeError('Supabase environment is not configured');setPersistenceStatus('Supabase environment is not configured');return()=>{cancelled=true}};
    const initialize=async()=>{
      const {data:sessionData}=await client.auth.getSession();
      if(!sessionData.session){const {error}=await client.auth.signInAnonymously();if(error){if(!cancelled){setTerrainStatus('Supabase connected · authentication required');setEnvironmentStatus('Supabase connected · anonymous sign-in unavailable');setEnvironmentRuntime(emptyEnvironmentRuntime(runtimeWorldId));setEnvironmentRuntimeError(`Authentication required: ${error.message}`);setPersistenceStatus('Supabase connected · sign-in is required for protected data');}return;}}
      if(cancelled)return;
      let effectiveMapId=configuredPersistedMapId;
      if(!effectiveMapId){
        const {data:existingRows,error:existingError}=await client.from('maps').select('id,name,map_type,width,height').eq('world_id',runtimeWorldId).order('created_at',{ascending:true}).limit(1);
        if(existingError) throw existingError;
        const existing=existingRows?.[0] as {id:string}|undefined;
        if(existing?.id){
          effectiveMapId=existing.id;
          setPersistenceStatus('Found existing authoritative map…');
        }else{
          const bootstrap=createMap('world');
          const {data:created,error:createError}=await client.from('maps').insert({world_id:runtimeWorldId,name:'World Map',map_type:'world',coordinate_mode:'square',width:bootstrap.width,height:bootstrap.height,tile_size:bootstrap.tileSize,metadata:{editor_bootstrap:true}}).select('id').single();
          if(createError) throw createError;
          const createdId=(created as {id?:string}|null)?.id;
          if(!createdId) throw new Error('Supabase did not return the bootstrap map id');
          const document={...bootstrap,id:createdId,name:'World Map'};
          const persistence=createSupabaseMapMergePersistence(client);
          const commit=await persistence.commitResolvedMerge(document,0,serializeResolvedMapSnapshot(document),'initial-bootstrap');
          if(commit.status!=='committed') throw new Error(`Initial map bootstrap did not commit: ${commit.status}`);
          effectiveMapId=createdId;
          setPersistenceStatus(`Authoritative map created at version ${commit.version}`);
        }
        setPersistedMapId(effectiveMapId);
      }
      if(cancelled)return;
      if(effectiveMapId){loadMapDocumentSnapshot(client,effectiveMapId).then(({result,document})=>{if(cancelled)return;if(document){setMaps([document]);setActiveMapId(document.id);setAuthoritativeVersion(result.version_number??0);setBaseDocument(document);setPersistenceStatus(`Saved map loaded at version ${result.version_number??0}`)}else setPersistenceStatus(result.code==='MAP_ACCESS_DENIED'?'Map access denied':'No saved snapshot found')}).catch(error=>{if(!cancelled)setPersistenceStatus(`Load failed: ${error instanceof Error?error.message:'unknown error'}`)})}
      loadTerrainAssetBindingsFromSupabase(client).then(result=>{if(cancelled)return;setTerrainBindings(result.bindings);setTerrainStatus(terrainAssetBindingSummary(result))});
      loadEnvironmentCatalogFromSupabase(client).then(result=>{if(cancelled)return;setEnvironmentCatalog(result.source==='supabase'?result.catalog:null);setEnvironmentReadiness(result.source==='supabase'?result.readiness:null);setEnvironmentStatus(environmentCatalogSummary(result))});
      loadEnvironmentRuntime(client,runtimeWorldId).then(result=>{if(cancelled)return;setEnvironmentRuntime(result.state);setEnvironmentRuntimeError(result.error)});
    }; void initialize().catch(error=>{if(!cancelled)setPersistenceStatus(`Initialization failed: ${error instanceof Error?error.message:'unknown error'}`)}); return()=>{cancelled=true};
  },[]);
  const save=useCallback(async()=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId||active.id!==persistedMapId){setPersistenceStatus('Save unavailable: authoritative map is not ready');return;}if(!baseDocument||!authoritativeVersion){setPersistenceStatus('Save unavailable: authoritative base/version has not loaded');return;}setBusy(true);setPersistenceStatus('Checking authoritative version…');try{const result=await saveWithConflictDetection(client,active,baseDocument,authoritativeVersion);if(result.status==='conflict'){setAuthoritativeVersion(result.remoteVersion);openConflictResolution(result.merge,result.remoteDocument);setPersistenceStatus(`Conflict detected: base ${result.expectedVersion}, remote ${result.remoteVersion}`)}else if(result.status==='committed'){setAuthoritativeVersion(result.version);setBaseDocument(result.document);update(result.document);setPersistenceStatus(`Saved as version ${result.version}`)}else setPersistenceStatus(`Save failed: ${result.error instanceof Error?result.error.message:'unknown error'}`)}finally{setBusy(false)}},[active,baseDocument,authoritativeVersion,openConflictResolution,update,persistedMapId]);
  const load=useCallback(async()=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId){setPersistenceStatus('Load unavailable: authoritative map is not ready');return;}setBusy(true);setPersistenceStatus('Loading…');try{const {result,document}=await loadMapDocumentSnapshot(client,persistedMapId);if(document){setMaps([document]);setActiveMapId(document.id);setAuthoritativeVersion(result.version_number??0);setBaseDocument(document);setPersistenceStatus(`Loaded from Supabase at version ${result.version_number??0}`)}else setPersistenceStatus(result.code==='MAP_ACCESS_DENIED'?'Map access denied':'No saved snapshot found')}catch(error){setPersistenceStatus(`Load failed: ${error instanceof Error?error.message:'unknown error'}`)}finally{setBusy(false)}},[persistedMapId]);
  return <div style={{display:'grid',gridTemplateRows:'auto 1fr',height:'100vh'}}><MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId}/><div style={{position:'relative',minHeight:0}}><div style={{position:'absolute',top:8,right:8,zIndex:10,display:'flex',gap:6,alignItems:'center',padding:6,border:'1px solid #334155',borderRadius:4,background:'#0f172a'}}><button onClick={save} disabled={busy||!persistedMapId||active.id!==persistedMapId}>Save Map</button><button onClick={load} disabled={busy||!persistedMapId}>Load Map</button><span style={{fontSize:11,opacity:.8}}>v{authoritativeVersion} · {persistenceStatus}</span></div><EditorShell key={active.id} initialDocument={active} onDocumentChange={update} terrainBindings={terrainBindings} terrainStatus={`${terrainStatus} · ${environmentStatus}`} environmentCatalog={environmentCatalog} environmentReadiness={environmentReadiness} environmentRuntime={environmentRuntime}/>{conflictResult&&conflictSession&&<ConflictResolutionEditorOverlay result={conflictResult} session={conflictSession} onCancel={closeConflictResolution} onResolved={applyConflictResolution}/>}</div><EnvironmentRuntimeBadge worldId={runtimeWorldId} state={environmentRuntime} error={environmentRuntimeError}/></div>;
}
