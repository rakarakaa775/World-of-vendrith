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

export default function AssetLibraryPage(){
  const router=useRouter();
  const {user,loading}=useAuthUser();
  const [assets,setAssets]=useState<Asset[]>([]);
  const [selected,setSelected]=useState<Asset|null>(null);
  const [search,setSearch]=useState("");
  const [placementCategory,setPlacementCategory]=useState("all");
  const [source,setSource]=useState("all");
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState("");
  const [syncing,setSyncing]=useState(false);
  const [syncResult,setSyncResult]=useState("");

  useEffect(()=>{
    if(loading||!user)return;
    let active=true;
    void (async()=>{
      const client=createMapEditorSupabaseClient();
      if(!client){setError("Supabase client belum tersedia.");setBusy(false);return;}
      const {data,error}=await client.from("world_asset_browser_inventory_v1").select("*").eq("asset_status","approved").order("category").order("name").limit(500);
      if(!active)return;
      if(error){setError(error.message);setBusy(false);return;}
      const rows=(data??[]) as Asset[];
      setAssets(rows);
      setSelected(rows[0]??null);
      setBusy(false);
    })();
    return()=>{active=false};
  },[loading,user]);

  const placementCategories=useMemo(()=>["all","world","region","playable","interior"].filter(v=>v==="all"||assets.some(a=>a.placement_category===v)),[assets]);
  const sources=useMemo(()=>["all",...Array.from(new Set(assets.map(a=>a.source_name).filter(Boolean) as string[]))],[assets]);

  const syncPendingTerrainBatch=async()=>{
    if(syncing)return;
    const client=createMapEditorSupabaseClient();
    if(!client){setSyncResult("Supabase client belum tersedia.");return;}
    setSyncing(true);
    setSyncResult("Menjalankan verifikasi + canonical binding batch terrain…");
    const paths=[
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icesnowgrass.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icesnowother.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__icegrassaltother.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__sandredsandwater.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__watersandother.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/AppleTree_allSeasons.png__AppleTree_allSeasons.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__redsandwater.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__holelikegrassaltotheroverlay.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__lavagrassaltother.png",
      "ASSET_LIBRARY/02_TILES_AND_TERRAIN/lpc_terrain__water.png",
    ];
    try{
      const {data,error}=await client.functions.invoke("sync-terrain-assets",{body:{paths}});
      if(error)throw error;
      const results=Array.isArray(data?.results)?data.results:[];
      const failed=results.filter((row:{status?:string})=>row.status==="failed");
      const verified=results.length-failed.length;
      setSyncResult("Batch selesai: "+verified+"/"+results.length+" verified"+(failed.length?"; "+failed.length+" gagal":""));
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
      (!q||[a.name,a.role,a.category,a.source_name,a.slug].filter(Boolean).some(v=>String(v).toLowerCase().includes(q)))
    );
  },[assets,search,placementCategory,source]);

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
          return <Link key={asset.id} className={active?"asset-card active":"asset-card"} href={`/asset-library/${asset.id}`}>
            <span className="asset-card-image"><AssetPreview asset={asset}/></span>
            <strong>{asset.name}</strong>
            <small>{asset.role||asset.category||"Asset"}</small>
            <em>{(asset.placement_category||"unassigned").toUpperCase()} · {asset.source_name||"Unknown source"}</em>
          </Link>;
        })}
      </div>

      <aside className="asset-library-detail">
        {selected?<><div className="asset-detail-image"><AssetPreview key={selected.id} asset={selected}/></div>
          <p className="asset-detail-kicker">ASSET DETAIL · {selected.asset_status}</p>
          <h2>{selected.name}</h2>
          <p className="asset-detail-role">{selected.role||selected.category||"Uncategorized"} · <strong>{(selected.placement_category||"unassigned").toUpperCase()}</strong></p>
          <section><h3>WHAT IS THIS ASSET?</h3><dl><div><dt>Type</dt><dd>{selected.role||"—"}</dd></div><div><dt>Category</dt><dd>{selected.category||"—"}</dd></div><div><dt>Perspective</dt><dd>{selected.perspective||"—"}</dd></div><div><dt>Palette</dt><dd>{selected.palette_family||"—"}</dd></div></dl><p>{metadataNote(selected)}</p></section>
          <section><h3>SOURCE</h3><dl><div><dt>Name</dt><dd>{selected.source_name||"—"}</dd></div><div><dt>Version</dt><dd>{selected.source_version||"—"}</dd></div><div><dt>Path</dt><dd>{selected.asset_path||"—"}</dd></div></dl><div className="asset-detail-links">{selected.source_url?<a href={selected.source_url} target="_blank" rel="noreferrer">Open source</a>:null}{selected.repository_url?<a href={selected.repository_url} target="_blank" rel="noreferrer">Open repository</a>:null}</div></section>
          <section><h3>LICENSE</h3><p>{selected.licenses?.length?selected.licenses.join(" · "):"Not recorded"}</p><dl><div><dt>Attribution</dt><dd>{selected.attribution_required?"Required":"Not required"}</dd></div><div><dt>Commercial use</dt><dd>{selected.commercial_use_allowed?"Allowed":"Not recorded / restricted"}</dd></div><div><dt>Modification</dt><dd>{selected.modification_allowed?"Allowed":"Not recorded / restricted"}</dd></div><div><dt>Redistribution</dt><dd>{selected.redistribution_allowed?"Allowed":"Not recorded / restricted"}</dd></div></dl>{selected.attribution_text?<blockquote>{selected.attribution_text}</blockquote>:null}</section>
          <section><h3>TECHNICAL</h3><dl><div><dt>Grid</dt><dd>{selected.grid_width??"—"} × {selected.grid_height??"—"}</dd></div><div><dt>Tile</dt><dd>{selected.tile_width??"—"} × {selected.tile_height??"—"}</dd></div><div><dt>Autotile</dt><dd>{selected.autotile_capable?"Yes":"No"}</dd></div><div><dt>Collision</dt><dd>{selected.collision_capable?"Yes":"No"}</dd></div><div><dt>Interactable</dt><dd>{selected.interactable?"Yes":"No"}</dd></div></dl></section>
        </>:<div className="asset-library-empty">Select an asset.</div>}
      </aside>
    </section>
  </main>;
}
