"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthUser } from "../../editor/auth";
import { createMapEditorSupabaseClient } from "../../editor/supabase-client";

type Asset = {
  id:string; name:string; slug:string|null; category:string|null; placement_category:string|null; role:string|null;
  asset_path:string|null; preview_path:string|null; grid_width:number|null; grid_height:number|null;
  tile_width:number|null; tile_height:number|null; perspective:string|null; palette_family:string|null;
  outline_style:string|null; lighting_direction:string|null; season_capable:boolean;
  autotile_capable:boolean; collision_capable:boolean; interactable:boolean; asset_status:string|null;
  asset_metadata:Record<string,unknown>|null; source_name:string|null; source_url:string|null;
  repository_url:string|null; source_version:string|null; licenses:string[]; attribution_required:boolean;
  attribution_text:string|null; commercial_use_allowed:boolean; modification_allowed:boolean;
  redistribution_allowed:boolean; license_verification_status:string|null; license_usage_status:string|null;
};


async function getPendingTerrainPaths(client:ReturnType<typeof createMapEditorSupabaseClient>){
  if(!client)return [];
  const {data,error}=await client
    .from("asset_files")
    .select("file_path,sha256")
    .eq("verification_status","verified")
    .not("sha256","is",null)
    .or("storage_bucket.is.null,storage_path.is.null")
    .order("created_at",{ascending:true})
    .limit(10);
  if(error)throw error;
  return Array.from(new Set((data??[]).map(row=>row.file_path).filter((path):path is string=>typeof path==="string"&&path.length>0)));
}

function readU16(view:DataView,offset:number){return view.getUint16(offset,true);}
function readU32(view:DataView,offset:number){return view.getUint32(offset,true);}

async function extractZipItems(file:File,wanted:string[]){
  const bytes=new Uint8Array(await file.arrayBuffer());
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let eocd=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-22-65535);i--){
    if(i>=0&&readU32(view,i)===0x06054b50){eocd=i;break;}
  }
  if(eocd<0)throw new Error("ZIP end-of-central-directory tidak ditemukan.");
  const count=readU16(view,eocd+10);
  const centralOffset=readU32(view,eocd+16);
  const wantedSet=new Set(wanted);
  const found=new Map<string,Uint8Array>();
  let p=centralOffset;
  for(let i=0;i<count;i++){
    if(readU32(view,p)!==0x02014b50)throw new Error("Central directory ZIP tidak valid.");
    const flags=readU16(view,p+8),method=readU16(view,p+10);
    const compressedSize=readU32(view,p+20);
    const nameLen=readU16(view,p+28),extraLen=readU16(view,p+30),commentLen=readU16(view,p+32);
    const localOffset=readU32(view,p+42);
    const name=new TextDecoder().decode(bytes.slice(p+46,p+46+nameLen));
    p+=46+nameLen+extraLen+commentLen;
    if(!wantedSet.has(name))continue;
    if(flags&0x08)throw new Error("ZIP data descriptor tidak didukung untuk "+name+".");
    if(method!==0&&method!==8)throw new Error("Metode kompresi ZIP tidak didukung untuk "+name+".");
    if(readU32(view,localOffset)!==0x04034b50)throw new Error("Local ZIP header tidak valid untuk "+name+".");
    const localNameLen=readU16(view,localOffset+26),localExtraLen=readU16(view,localOffset+28);
    const dataStart=localOffset+30+localNameLen+localExtraLen;
    const compressed=bytes.slice(dataStart,dataStart+compressedSize);
    let data:Uint8Array;
    if(method===0)data=compressed;
    else{
      const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      data=new Uint8Array(await new Response(stream).arrayBuffer());
    }
    found.set(name,data);
  }
  const items=wanted.filter(path=>found.has(path)).map(path=>({path,bytes:found.get(path)!}));
  const missing=wanted.filter(path=>!found.has(path));
  return {items,missing};
}

function bytesToBase64(bytes:Uint8Array){
  let binary="";
  for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(binary);
}

const WORLD_SOURCES=new Set([
  "[LPC] Terrains",
  "[LPC] Overworld",
  "LPC Revised 4-Seasons Exterior Tilesets",
]);

function assetUrl(path:string|null,source:string|null){
  if(!path)return null;
  if(/^data:image\//i.test(path))return path;
  const repo=source && WORLD_SOURCES.has(source) ? "world" : "library";
  if(/^https?:\/\/media\.githubusercontent\.com\/media\//i.test(path)){
    const marker="/raw/";
    const markerIndex=path.indexOf(marker);
    const rawPath=markerIndex>=0 ? path.slice(markerIndex+marker.length) : path.split("/main/")[1] || "";
    return rawPath ? `/api/assets/${rawPath.split("/").map(encodeURIComponent).join("/")}?repo=library` : null;
  }
  if(/^https?:\/\//i.test(path))return path;
  return `/api/assets/${path.split("/").map(encodeURIComponent).join("/")}?repo=${repo}`;
}

function AssetPreview({asset,className=""}:{asset:Asset;className?:string}){
  const embeddedPreview=/^data:image\//i.test(asset.preview_path||"") ? asset.preview_path : null;
  const primary=embeddedPreview || assetUrl(asset.asset_path,asset.source_name);
  const fallback=assetUrl(asset.preview_path,asset.source_name);
  const [src,setSrc]=useState(primary);
  const [failed,setFailed]=useState(!primary);

  useEffect(()=>{
    setSrc(primary);
    setFailed(!primary);
  },[primary]);

  if(!src||failed)return <span className={className}>NO PREVIEW</span>;
  return <img
    className={className}
    src={src}
    alt={asset.name}
    loading="lazy"
    onError={()=>{
      if(fallback&&src!==fallback){setSrc(fallback);return;}
      setFailed(true);
    }}
  />;
}

function metadataNote(asset:Asset){
  const value=asset.asset_metadata?.description ?? asset.asset_metadata?.evidence_text ?? asset.asset_metadata?.provenance_status;
  return typeof value==="string" ? value : "Tidak ada keterangan tambahan pada registry.";
}

type AssetIntelligence={usageDomain:"world"|"region"|"review";licenseState:"clear"|"restricted"|"unknown";reason:string;environment:string|null};
function assetIntelligence(asset:Asset):AssetIntelligence{
  const meta=asset.asset_metadata??{};
  const text=[asset.name,asset.slug,asset.category,asset.placement_category,asset.role,asset.asset_path,asset.source_name,meta.environment,meta.biome,meta.water_depth,meta.waterDepth,meta.environment_type,meta.environmentType].filter(Boolean).join(" ").toLowerCase();
  const region=/bridge|dock|ship|town|village|building|structure|road|street|port|landmark/.test(text);
  const world=/terrain|grass|dirt|sand|stone|mud|beach|water|river|lake|sea|ocean|mountain|hill|cliff|rock|forest|jungle|desert|swamp|snow|vegetation|tree|plant|ice|lava|bog/.test(text);
  let usageDomain:"world"|"region"|"review"= "review";
  if(region&&!world)usageDomain="region"; else if(world&&!region)usageDomain="world";
  const verification=String(asset.license_verification_status??"").toLowerCase();
  const usage=String(asset.license_usage_status??"").toLowerCase();
  let licenseState:"clear"|"restricted"|"unknown"="unknown";
  if(verification==="verified"&&(usage==="allowed"||usage==="permitted")&&asset.commercial_use_allowed!==false)licenseState="clear";
  else if(verification==="verified"&&(usage==="restricted"||usage==="prohibited"||usage==="denied")||asset.commercial_use_allowed===false)licenseState="restricted";
  const environment= /deep\s*(water|sea)|deepwater|ocean\s*deep/.test(text)?"deep water":/coastal|near[- ]shore|shallow|shore|brackish/.test(text)?"coastal / near-shore":null;
  const reason=usageDomain==="world"?"Natural-environment asset; eligible for WORLD classification when registry approval is satisfied.":usageDomain==="region"?"Structural/man-made asset; keep it in REGION rather than WORLD.":"Role is ambiguous or mixes WORLD and structural signals; requires review.";
  return {usageDomain,licenseState,reason,environment};
}

function IntelligenceBadges({info}:{info:AssetIntelligence}){
  return <span className="asset-intelligence-badges"><b className={`asset-domain asset-domain-${info.usageDomain}`}>{info.usageDomain.toUpperCase()}</b><b className={`asset-license asset-license-${info.licenseState}`}>{info.licenseState.toUpperCase()}</b>{info.environment?<b className="asset-environment">{info.environment.toUpperCase()}</b>:null}</span>;
}

export default function AssetLibraryPage(){
  const router=useRouter();
  const {user,loading}=useAuthUser();
  const [assets,setAssets]=useState<Asset[]>([]);
  const [selected,setSelected]=useState<Asset|null>(null);
  const [search,setSearch]=useState("");
  const [placementCategory,setPlacementCategory]=useState("all");
  const [source,setSource]=useState("all");
  const [intelligenceFilter,setIntelligenceFilter]=useState("all");
  const [licenseFilter,setLicenseFilter]=useState("all");
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState("");
  const [syncing,setSyncing]=useState(false);
  const [syncResult,setSyncResult]=useState("");

  useEffect(()=>{
    if(loading||!user)return;
    let active=true;
    let interval:ReturnType<typeof setInterval>|null=null;
    const refresh=async()=>{
      const client=createMapEditorSupabaseClient();
      if(!client){if(active){setError("Supabase client belum tersedia.");setBusy(false);}return;}
      const {data,error}=await client.from("asset_library_inventory_v1").select("*").eq("asset_status","approved").order("category").order("name").limit(500);
      if(!active)return;
      if(error){setError(error.message);setBusy(false);return;}
      const rows=(data??[]) as Asset[];
      setAssets(rows);
      setSelected(prev=>rows.find(row=>row.id===prev?.id)||rows[0]||null);
      setBusy(false);
    };
    void refresh();
    interval=setInterval(()=>void refresh(),5000);
    const onVisible=()=>{if(document.visibilityState==="visible")void refresh()};
    document.addEventListener("visibilitychange",onVisible);
    window.addEventListener("focus",onVisible);
    return()=>{
      active=false;
      if(interval)clearInterval(interval);
      document.removeEventListener("visibilitychange",onVisible);
      window.removeEventListener("focus",onVisible);
    };
  },[loading,user]);

  const placementCategories=useMemo(()=>["all","world","region","playable","interior"].filter(v=>v==="all"||assets.some(a=>a.placement_category===v)),[assets]);
  const sources=useMemo(()=>["all",...Array.from(new Set(assets.map(a=>a.source_name).filter(Boolean) as string[]))],[assets]);
  const intelligenceOptions=["all","world","region","review"];
  const licenseOptions=["all","clear","restricted","unknown"];

  const syncPendingTerrainBatch=async(file:File|null)=>{
    if(syncing)return;
    if(!file){setSyncResult("Pilih archive ZIP terlebih dahulu.");return;}
    if(!file.name.toLowerCase().endsWith(".zip")){setSyncResult("File harus berupa ZIP.");return;}
    const client=createMapEditorSupabaseClient();
    if(!client){setSyncResult("Supabase client belum tersedia.");return;}
    setSyncing(true);
    setSyncResult("Membaca 10 pending terrain terbaru dari database…");
    try{
      const pendingTerrainPaths=await getPendingTerrainPaths(client);
      if(pendingTerrainPaths.length===0){
        setSyncResult("Tidak ada pending terrain yang tersisa.");
        return;
      }
      setSyncResult("Mengekstrak "+pendingTerrainPaths.length+" file terrain dari archive…");
      const extracted=await extractZipItems(file,pendingTerrainPaths);
      if(extracted.missing.length)console.warn("Archive missing current pending paths",extracted.missing);
      if(extracted.items.length===0){
        setSyncResult("Archive tidak memuat satupun dari "+pendingTerrainPaths.length+" pending terrain terbaru.");
        return;
      }
      const available=extracted.items.length;
      setSyncResult("Archive memuat "+available+"/"+pendingTerrainPaths.length+" pending; menjalankan verifikasi + canonical binding…");
      const {data,error}=await client.functions.invoke("sync-terrain-assets",{body:{items:extracted.items.map(item=>({path:item.path,base64:bytesToBase64(item.bytes)}))}});
      if(error)throw error;
      const results=Array.isArray(data?.results)?data.results:[];
      const failed=results.filter((row:{status?:string})=>row.status==="failed");
      const verified=results.length-failed.length;
      const missingNote=extracted.missing.length?"; "+extracted.missing.length+" pending tidak ada di archive, akan masuk batch berikutnya":"";
      setSyncResult("Batch selesai: "+verified+"/"+results.length+" verified"+(failed.length?"; "+failed.length+" gagal":"")+missingNote);
      if(failed.length)console.warn("sync-terrain-assets failures",failed);
    }catch(err){
      setSyncResult(err instanceof Error?err.message:String(err));
    }finally{
      setSyncing(false);
    }
  };

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return assets.filter(a=>
      (placementCategory==="all"||a.placement_category===placementCategory)&&
      (source==="all"||a.source_name===source)&&
      (intelligenceFilter==="all"||assetIntelligence(a).usageDomain===intelligenceFilter)&&
      (licenseFilter==="all"||assetIntelligence(a).licenseState===licenseFilter)&&
      (!q||[a.name,a.role,a.category,a.source_name,a.slug].filter(Boolean).some(v=>String(v).toLowerCase().includes(q)))
    );
  },[assets,search,placementCategory,source,intelligenceFilter,licenseFilter]);

  if(loading)return <main className="asset-library-loading">Checking account…</main>;
  if(!user)return <main className="asset-library-loading"><button type="button" onClick={()=>router.push("/")}>Back to Control Center</button></main>;

  return <main className="asset-library-page">
    <header className="asset-library-header">
      <div>
        <button type="button" className="asset-library-back" onClick={()=>router.push("/")}>‹ Control Center</button>
        <p>VENDRITH ASSET SYSTEM</p>
        <h1>Asset Library</h1>
        <span>Approved assets · visual catalog · source of truth for engine workspaces</span>
      </div>
      <div className="asset-library-stat"><strong>{assets.length}</strong><small>APPROVED ASSETS</small></div>
    </header>

    <section className="asset-library-toolbar">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search asset, role, category, source…" aria-label="Search assets"/>
      <select value={placementCategory} onChange={e=>setPlacementCategory(e.target.value)} aria-label="Filter placement category">{placementCategories.map(v=><option key={v} value={v}>{v==="all"?"All placement categories":v.toUpperCase()}</option>)}</select>
      <select value={source} onChange={e=>setSource(e.target.value)} aria-label="Filter source">{sources.map(v=><option key={v} value={v}>{v==="all"?"All sources":v}</option>)}</select>
      <select value={intelligenceFilter} onChange={e=>setIntelligenceFilter(e.target.value)} aria-label="Filter usage domain">{intelligenceOptions.map(v=><option key={v} value={v}>{v==="all"?"All domains":v.toUpperCase()}</option>)}</select>
      <select value={licenseFilter} onChange={e=>setLicenseFilter(e.target.value)} aria-label="Filter license state">{licenseOptions.map(v=><option key={v} value={v}>{v==="all"?"All license states":v.toUpperCase()}</option>)}</select>
      <span>{filtered.length} shown</span>
      <label>
        <span className="sr-only">Pilih archive terrain pending</span>
        <input type="file" accept=".zip,application/zip" disabled={syncing} onChange={e=>void syncPendingTerrainBatch(e.target.files?.[0]??null)} />
      </label>
    </section>
    {syncResult?<p role="status" aria-live="polite">{syncResult}</p>:null}

    <section className="asset-library-layout">
      <div className="asset-library-grid">
        {busy?<div className="asset-library-empty" role="status" aria-live="polite">Loading approved assets…</div>:error?<div className="asset-library-empty" role="alert" aria-live="polite">{error}</div>:filtered.length===0?<div className="asset-library-empty" role="status" aria-live="polite">No approved asset matches.</div>:filtered.map(asset=>{
          const active=selected?.id===asset.id;
          const info=assetIntelligence(asset);
          return <Link key={asset.id} className={active?"asset-card active":"asset-card"} href={`/asset-library/${asset.id}`}>
            <span className="asset-card-image"><AssetPreview asset={asset}/></span>
            <strong>{asset.name}</strong>
            <small>{asset.role||asset.category||"Asset"}</small>
            <IntelligenceBadges info={info}/>
            <em>{asset.source_name||"Unknown source"}</em>
          </Link>;
        })}
      </div>

      <aside className="asset-library-detail">
        {selected?<><div className="asset-detail-image"><AssetPreview key={selected.id} asset={selected}/></div>
          <p className="asset-detail-kicker">ASSET DETAIL · {selected.asset_status}</p>
          <h2>{selected.name}</h2>
          <p className="asset-detail-role">{selected.role||selected.category||"Uncategorized"} · <strong>{(selected.placement_category||"unassigned").toUpperCase()}</strong></p>
          <IntelligenceBadges info={assetIntelligence(selected)}/>
          <p className="asset-intelligence-reason">{assetIntelligence(selected).reason}</p>
          <section><h3>WHAT IS THIS ASSET?</h3><dl><div><dt>Type</dt><dd>{selected.role||"—"}</dd></div><div><dt>Category</dt><dd>{selected.category||"—"}</dd></div><div><dt>Perspective</dt><dd>{selected.perspective||"—"}</dd></div><div><dt>Palette</dt><dd>{selected.palette_family||"—"}</dd></div></dl><p>{metadataNote(selected)}</p></section>
          <section><h3>SOURCE</h3><dl><div><dt>Name</dt><dd>{selected.source_name||"—"}</dd></div><div><dt>Version</dt><dd>{selected.source_version||"—"}</dd></div><div><dt>Path</dt><dd>{selected.asset_path||"—"}</dd></div></dl><div className="asset-detail-links">{selected.source_url?<a href={selected.source_url} target="_blank" rel="noreferrer">Open source</a>:null}{selected.repository_url?<a href={selected.repository_url} target="_blank" rel="noreferrer">Open repository</a>:null}</div></section>
          <section><h3>LICENSE / PROVENANCE</h3><p>Registry state: <strong>{assetIntelligence(selected).licenseState.toUpperCase()}</strong></p><p>Verification: {selected.license_verification_status||"Unknown"} · Usage: {selected.license_usage_status||"Unknown"}</p><p>{selected.licenses?.length?selected.licenses.join(" · "):"Not recorded"}</p><dl><div><dt>Attribution</dt><dd>{selected.attribution_required?"Required":"Not required"}</dd></div><div><dt>Commercial use</dt><dd>{selected.commercial_use_allowed?"Allowed":"Not recorded / restricted"}</dd></div><div><dt>Modification</dt><dd>{selected.modification_allowed?"Allowed":"Not recorded / restricted"}</dd></div><div><dt>Redistribution</dt><dd>{selected.redistribution_allowed?"Allowed":"Not recorded / restricted"}</dd></div></dl>{selected.attribution_text?<blockquote>{selected.attribution_text}</blockquote>:null}</section>
          <section><h3>TECHNICAL</h3><dl><div><dt>Grid</dt><dd>{selected.grid_width??"—"} × {selected.grid_height??"—"}</dd></div><div><dt>Tile</dt><dd>{selected.tile_width??"—"} × {selected.tile_height??"—"}</dd></div><div><dt>Autotile</dt><dd>{selected.autotile_capable?"Yes":"No"}</dd></div><div><dt>Collision</dt><dd>{selected.collision_capable?"Yes":"No"}</dd></div><div><dt>Interactable</dt><dd>{selected.interactable?"Yes":"No"}</dd></div></dl></section>
        </>:<div className="asset-library-empty">Select an asset.</div>}
      </aside>
    </section>
  </main>;
}