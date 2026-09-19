import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapDocument } from './map-document';
import { parseMapDocument } from './map-serialization';
import { mergeMapDocumentsThreeWay } from './map-entity-merge';
import { serializeResolvedMapSnapshot } from './map-merge-persistence-supabase';

export type IdentityLoad = { ok:boolean; code:string; editor_map_id:string; version_id:string|null; version_number:number; snapshot:unknown };
export type IdentitySave = { status:'committed'|'conflict'; version_id:string|null; version_number:number|null; current_version:number; projection_status:'not_run'|'committed'|'failed'; projection_error:string|null };

const row=(data:any)=>Array.isArray(data)?data[0]:data;

export async function loadIdentityMapDocument(client:SupabaseClient,id:string):Promise<{document:MapDocument|null;version:number;result:IdentityLoad}>{
 const rpc=await client.rpc('map_editor_load_identity_snapshot_v1',{p_editor_map_id:id});
 if(rpc.error)throw rpc.error;
 const r=row(rpc.data) as IdentityLoad;
 if(!r)throw new Error('IDENTITY_LOAD_EMPTY');
 if(!r.snapshot)return {document:null,version:Number(r.version_number)||0,result:r};
 const payload=typeof r.snapshot==='string'?r.snapshot:JSON.stringify(r.snapshot);
 return {document:parseMapDocument(payload,id),version:Number(r.version_number)||0,result:r};
}

export async function saveIdentityMapDocument(client:SupabaseClient,document:MapDocument,expectedVersion:number,label='map-editor-save'){
 const rpc=await client.rpc('map_editor_commit_identity_v1',{p_editor_map_id:document.id,p_expected_version:expectedVersion,p_snapshot:serializeResolvedMapSnapshot(document),p_label:label});
 if(rpc.error)throw rpc.error;
 return row(rpc.data) as IdentitySave;
}

export async function saveIdentityWithConflictDetection(client:SupabaseClient,local:MapDocument,base:MapDocument,expectedVersion:number){
 try{
  // A new identity has no remote version yet. Commit directly at version 0 so
  // first-save does not depend on a preceding Load RPC or stale schema state.
  if(expectedVersion===0){
   const commit=await saveIdentityMapDocument(client,local,0,'map-editor-save');
   if(commit.status==='conflict')return {status:'conflict' as const,merge:null,expectedVersion:0,remoteVersion:commit.current_version,remoteDocument:null};
   return {status:'committed' as const,document:local,version:Number(commit.version_number)||1,projectionStatus:commit.projection_status,projectionError:commit.projection_error};
  }
  const remote=await loadIdentityMapDocument(client,local.id);
  if(!remote.document){
   const commit=await saveIdentityMapDocument(client,local,0,'map-editor-save');
   if(commit.status==='conflict')return {status:'conflict' as const,merge:null,expectedVersion:0,remoteVersion:commit.current_version,remoteDocument:null};
   return {status:'committed' as const,document:local,version:Number(commit.version_number)||1,projectionStatus:commit.projection_status,projectionError:commit.projection_error};
  }
  const merge=mergeMapDocumentsThreeWay(base,local,remote.document);
  if(merge.conflicts.length)return {status:'conflict' as const,merge,expectedVersion,remoteVersion:remote.version,remoteDocument:remote.document};
  const commit=await saveIdentityMapDocument(client,merge.document,remote.version,'map-editor-save');
  if(commit.status==='conflict'){
   const refreshed=await loadIdentityMapDocument(client,local.id);
   if(!refreshed.document)return {status:'error' as const,error:new Error('Remote identity disappeared during save')};
   return {status:'conflict' as const,merge:mergeMapDocumentsThreeWay(base,local,refreshed.document),expectedVersion:remote.version,remoteVersion:refreshed.version,remoteDocument:refreshed.document};
  }
  return {status:'committed' as const,document:merge.document,version:Number(commit.version_number)||1,projectionStatus:commit.projection_status,projectionError:commit.projection_error};
 }catch(error){return {status:'error' as const,error};}
}