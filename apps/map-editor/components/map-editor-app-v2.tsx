// @ts-nocheck
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorShell } from "./editor-shell";
import { MapBrowser } from "./map-browser";
import { SaveSlotsPanel, type SaveSlot } from "./save-slots-panel";
import { createMap, type MapDocument } from "../editor/map-document";
import { createMapEditorSupabaseClient } from "../editor/supabase-client";
import { loadMapDocumentSnapshot } from "../editor/map-persistence";
import { saveWithConflictDetection } from "../editor/map-conflict-save-controller";
import { createSupabaseMapMergePersistence, serializeResolvedMapSnapshot } from "../editor/map-merge-persistence-supabase";

const runtimeWorldId=process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim()||"3695d0b0-788e-42fa-9345-cc3197d0c94d";
const configuredMapId=process.env.NEXT_PUBLIC_VANDRITH_MAP_ID?.trim()||null;
const errorMessage=(e:any)=>e?.message||e?.error_description||e?.details||e?.hint||String(e||"unknown error");

export function MapEditorAppV2(){
  const initial=useMemo(()=>createMap("world"),[]);
  const [maps,setMaps]=useState<MapDocument[]>([initial]);
  const [activeMapId,setActiveMapId]=useState(initial.id);
  const [persistedMapId,setPersistedMapId]=useState<string|null>(configuredMapId);
  const [baseDocument,setBaseDocument]=useState<MapDocument|null>(null);
  const [version,setVersion]=useState(0);
  const [status,setStatus]=useState(configuredMapId?"Loading saved map…":"Preparing Supabase map…");
  const [busy,setBusy]=useState(false);
  const [slots,setSlots]=useState<SaveSlot[]>([]);
  const [showSlots,setShowSlots]=useState(false);
  const active=maps.find(m=>m.id===activeMapId)||maps[0];
  const update=useCallback((next:MapDocument)=>setMaps(prev=>prev.some(m=>m.id===next.id)?prev.map(m=>m.id===next.id?next:m):[...prev,next]),[]);
  const refreshSlots=useCallback(async(client:any,mapId:string)=>{const {data,error}=await client.from("map_editor_save_slots").select("slot_number,label,version_number,updated_at").eq("map_id",mapId).order("slot_number");if(error)throw error;setSlots((data||[]) as SaveSlot[])},[]);
  const loadAuthoritative=useCallback(async(client:any,mapId:string)=>{const r=await loadMapDocumentSnapshot(client,mapId);if(!r.document)throw new Error(r.result.code||"No saved map snapshot");setMaps([r.document]);setActiveMapId(r.document.id);setBaseDocument(r.document);setVersion(r.result.version_number||0);await refreshSlots(client,mapId);setStatus(`Saved map loaded at version ${r.result.version_number||0}`);return r.document},[refreshSlots]);

  useEffect(()=>{let cancelled=false;const run=async()=>{const client=createMapEditorSupabaseClient();if(!client)throw new Error("Supabase environment is not configured");const session=await client.auth.getSession();if(!session.data.session){const auth=await client.auth.signInAnonymously();if(auth.error)throw auth.error}if(cancelled)return;let mapId=persistedMapId;
    if(mapId){try{await loadAuthoritative(client,mapId)}catch(e){mapId=null;setPersistedMapId(null);setStatus(`Configured map unavailable: ${errorMessage(e)} · using this session's map`)}}
    if(!mapId){const {data,error}=await client.from("maps").select("id").eq("world_id",runtimeWorldId).order("created_at",{ascending:true}).limit(1);if(error)throw error;mapId=data?.[0]?.id||null}
    if(!mapId){const seed=createMap("world");const {data,error}=await client.from("maps").insert({world_id:runtimeWorldId,name:"World Map",map_type:"world",coordinate_mode:"square",width:seed.width,height:seed.height,tile_size:seed.tileSize,metadata:{editor_bootstrap:true}}).select("id").single();if(error)throw error;mapId=data?.id;if(!mapId)throw new Error("Supabase did not return a map id");const doc={...seed,id:mapId,name:"World Map"};const p=createSupabaseMapMergePersistence(client);const commit=await p.commitResolvedMerge(mapId,0,serializeResolvedMapSnapshot(doc),"initial-bootstrap");if(commit.status!=="committed")throw new Error(`Initial map bootstrap failed: ${commit.status}`)}
    if(cancelled)return;setPersistedMapId(mapId);await loadAuthoritative(client,mapId);
  };void run().catch(e=>{if(!cancelled)setStatus(`Initialization failed: ${errorMessage(e)}`)});return()=>{cancelled=true}},[loadAuthoritative,persistedMapId]);

  const save=useCallback(async()=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId||active.id!==persistedMapId){setStatus("Save unavailable: authoritative map is not ready");return null}if(!baseDocument||version<1){setStatus("Save unavailable: authoritative version has not loaded");return null}setBusy(true);setStatus("Saving to Supabase…");try{const r=await saveWithConflictDetection(client,active,baseDocument,version);if(r.status==='committed'){setVersion(r.version);setBaseDocument(r.document);update(r.document);setStatus(`Saved as version ${r.version}`);return r}if(r.status==='conflict'){setStatus(`Save conflict: remote version ${r.remoteVersion}. Use Load Latest, then save again.`);return null}setStatus(`Save failed: ${errorMessage(r.error)}`);return null}catch(e){setStatus(`Save failed: ${errorMessage(e)}`);return null}finally{setBusy(false)}},[active,baseDocument,persistedMapId,update,version]);
  const saveToSlot=useCallback(async(slot:number,requestedLabel:string)=>{const client=createMapEditorSupabaseClient();if(!persistedMapId){setStatus("Save Slot unavailable: map is not ready");return}const label=window.prompt(`Nama untuk Save Slot ${slot}`,requestedLabel||`Save Slot ${slot}`);if(label===null)return;const saved=await save();if(!saved)return;setBusy(true);try{const {data:ver,error:verError}=await client.from("map_versions").select("id").eq("map_id",persistedMapId).eq("version_number",saved.version).single();if(verError)throw verError;const {error}=await client.from("map_editor_save_slots").upsert({map_id:persistedMapId,slot_number:slot,label:label.trim()||`Save Slot ${slot}`,version_id:ver?.id||null,version_number:saved.version,snapshot:serializeResolvedMapSnapshot(saved.document)},{onConflict:"map_id,slot_number"});if(error)throw error;await refreshSlots(client,persistedMapId);setStatus(`Game saved to Slot ${slot}`)}catch(e){setStatus(`Save Slot ${slot} failed: ${errorMessage(e)}`)}finally{setBusy(false)}},[persistedMapId,refreshSlots,save]);
  const loadLatest=useCallback(async()=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId){setStatus("Load unavailable: map is not ready");return}setBusy(true);try{await loadAuthoritative(client,persistedMapId)}catch(e){setStatus(`Load failed: ${errorMessage(e)}`)}finally{setBusy(false)}},[loadAuthoritative,persistedMapId]);
  const loadSlot=useCallback(async(slot:number)=>{const client=createMapEditorSupabaseClient();if(!client||!persistedMapId){setStatus("Load Slot unavailable: map is not ready");return}setBusy(true);try{const {data,error}=await client.from("map_editor_save_slots").select("snapshot,version_number,label").eq("map_id",persistedMapId).eq("slot_number",slot).single();if(error)throw error;if(!data?.snapshot)throw new Error("Save slot is empty");const doc=data.snapshot as MapDocument;setMaps([doc]);setActiveMapId(doc.id);setBaseDocument(doc);setVersion(data.version_number||0);setStatus(`Loaded ${data.label||`Save Slot ${slot}`} · version ${data.version_number}`);setShowSlots(false)}catch(e){setStatus(`Load Slot ${slot} failed: ${errorMessage(e)}`)}finally{setBusy(false)}},[persistedMapId]);

  return <div style={{display:"grid",gridTemplateRows:"auto 1fr",height:"100vh"}}><MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId}/><div style={{position:"relative",minHeight:0}}><div style={{position:"absolute",top:8,right:8,zIndex:10,display:"flex",gap:6,alignItems:"center",padding:6,border:"1px solid #334155",borderRadius:6,background:"#0f172a"}}><button onClick={()=>setShowSlots(true)} disabled={busy}>Save / Load</button><button onClick={save} disabled={busy||!persistedMapId||active.id!==persistedMapId}>Quick Save</button><button onClick={loadLatest} disabled={busy||!persistedMapId}>Load Latest</button><span style={{fontSize:11,opacity:.8}}>v{version} · {status}</span></div><EditorShell key={active.id} initialDocument={active} onDocumentChange={update}/></div><SaveSlotsPanel open={showSlots} slots={slots} busy={busy} onClose={()=>setShowSlots(false)} onSave={saveToSlot} onLoad={loadSlot}/></div>;
}
