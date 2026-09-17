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
import { normalizeMergeCommitResponse } from "../editor/map-merge-persistence";
import { parseMapDocument } from "../editor/map-serialization";
import { loadTerrainAssetBindings, type TerrainAssetBindingLoadResult } from "../editor/terrain-asset-binding-loader";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import { resolveSaveDocument, type SaveConnection } from "../editor/map-save-state";

const WORLD_ID = process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim() || "3695d0b0-788e-42fa-9345-cc3197d0c94d";
const BUILD_MARKER = "save-load-v4";
const msg = (e: any) => e?.message || e?.error_description || e?.details || e?.hint || String(e || "unknown error");

function fromRow(row: any): MapDocument {
  const seed = createMap("world");
  return { ...seed, id: row.id, name: row.name || "World Map", width: Number(row.width) || seed.width, height: Number(row.height) || seed.height, tileSize: Number(row.tile_size) || seed.tileSize };
}

export function MapEditorAppV4() {
  const seed = useMemo(() => createMap("world"), []);
  const [maps, setMaps] = useState<MapDocument[]>([seed]);
  const [activeMapId, setActiveMapId] = useState(seed.id);
  const [connectedMapId, setConnectedMapId] = useState<string | null>(null);
  const [baseDocument, setBaseDocument] = useState<MapDocument | null>(null);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState("Connecting to Supabase…");
  const [busy, setBusy] = useState(true);
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [showSlots, setShowSlots] = useState(false);
  const [terrainBindings, setTerrainBindings] = useState<TerrainAssetBindingMap>({});
  const [terrainStatus, setTerrainStatus] = useState(`Loading terrain bindings… · ${BUILD_MARKER}`);
  const active = maps.find(m => m.id === activeMapId) || maps[0];

  const update = useCallback((next: MapDocument) => {
    setMaps(cur => cur.some(m => m.id === next.id) ? cur.map(m => m.id === next.id ? next : m) : [...cur, next]);
  }, []);

  const refreshSlots = useCallback(async (client: any, mapId: string) => {
    const { data, error } = await client.from("map_editor_save_slots").select("slot_number,label,version_number,updated_at").eq("map_id", mapId).order("slot_number");
    if (error) throw error;
    setSlots((data || []) as SaveSlot[]);
  }, []);

  const bootstrap = useCallback(async (client: any, doc: MapDocument, mapId: string) => {
    const p = createSupabaseMapMergePersistence(client);
    const raw = await p.commitResolvedMerge(mapId, 0, serializeResolvedMapSnapshot(doc), "map-editor-bootstrap-v4");
    const result = normalizeMergeCommitResponse(raw);
    if (result.status !== "committed") throw new Error(`bootstrap: ${result.status}`);
    return Number(result.versionNumber) || 1;
  }, []);

  const adopt = useCallback(async (client: any, mapId: string) => {
    const loaded = await loadMapDocumentSnapshot(client, mapId);
    if (!loaded.document) return false;
    setMaps([loaded.document]);
    setActiveMapId(loaded.document.id);
    setConnectedMapId(mapId);
    setBaseDocument(loaded.document);
    setVersion(Number(loaded.result.version_number) || 0);
    await refreshSlots(client, mapId);
    setStatus(`Connected · version ${Number(loaded.result.version_number) || 0}`);
    return true;
  }, [refreshSlots]);

  const ensureConnection = useCallback(async (client: any): Promise<SaveConnection> => {
    if (connectedMapId && active?.mapType === "world" && active.id === connectedMapId && baseDocument) {
      return { mapId: connectedMapId, document: baseDocument, version };
    }
    if (active?.mapType !== "world") throw new Error("Only the persisted World Map can be saved in this phase");

    const byId = active?.id && active.id !== seed.id
      ? await client.from("maps").select("id,name,width,height,tile_size").eq("id", active.id).maybeSingle()
      : { data: null, error: null };
    if (byId.error) throw byId.error;
    if (byId.data?.id) {
      const id = byId.data.id as string;
      const loaded = await loadMapDocumentSnapshot(client, id);
      if (loaded.document) {
        const connection = { mapId: id, document: loaded.document, version: Number(loaded.result.version_number) || 0 };
        setConnectedMapId(id); setBaseDocument(loaded.document); setVersion(connection.version);
        await refreshSlots(client, id);
        setStatus(`Connected · version ${connection.version}`);
        return connection;
      }
      const doc = fromRow(byId.data);
      const v = await bootstrap(client, doc, id);
      const connection = { mapId: id, document: doc, version: v };
      setMaps(cur => cur.some(m => m.id === doc.id) ? cur : [...cur, doc]);
      setConnectedMapId(id); setBaseDocument(doc); setVersion(v); await refreshSlots(client, id); setStatus(`Connected · version ${v}`);
      return connection;
    }

    const latest = await client.from("maps").select("id,name,width,height,tile_size").eq("world_id", WORLD_ID).eq("map_type", "world").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latest.error) throw latest.error;
    if (latest.data?.id) {
      const id = latest.data.id as string;
      const loaded = await loadMapDocumentSnapshot(client, id);
      if (loaded.document) {
        const connection = { mapId: id, document: loaded.document, version: Number(loaded.result.version_number) || 0 };
        setConnectedMapId(id); setBaseDocument(loaded.document); setVersion(connection.version);
        await refreshSlots(client, id); setStatus(`Connected · version ${connection.version}`);
        return connection;
      }
      const doc = fromRow(latest.data);
      const v = await bootstrap(client, doc, id);
      const connection = { mapId: id, document: doc, version: v };
      setMaps([doc]); setActiveMapId(id); setConnectedMapId(id); setBaseDocument(doc); setVersion(v); await refreshSlots(client, id); setStatus(`Connected · version ${v}`);
      return connection;
    }

    const doc = createMap("world");
    const created = await client.from("maps").insert({ world_id: WORLD_ID, name: "World Map", map_type: "world", coordinate_mode: "square", width: doc.width, height: doc.height, tile_size: doc.tileSize, metadata: { editor_bootstrap: true } }).select("id,name,width,height,tile_size").single();
    if (created.error) throw created.error;
    const persisted = fromRow(created.data);
    const v = await bootstrap(client, persisted, persisted.id);
    const connection = { mapId: persisted.id, document: persisted, version: v };
    setMaps([persisted]); setActiveMapId(persisted.id); setConnectedMapId(persisted.id); setBaseDocument(persisted); setVersion(v); await refreshSlots(client, persisted.id); setStatus(`Connected · new map version ${v}`);
    return connection;
  }, [active, baseDocument, bootstrap, connectedMapId, refreshSlots, seed.id, version]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const client = createMapEditorSupabaseClient();
      if (!client) throw new Error("Supabase client unavailable");
      const session = await client.auth.getSession();
      if (!session.data.session) {
        const auth = await client.auth.signInAnonymously();
        if (auth.error) throw auth.error;
      }
      if (cancelled) return;
      try {
        const binding = await client.from("vandrith_asset_binding_workbench").select("terrain_key,neighbor_mask,asset_id,candidate_status,asset_status,autotile_capable,license_registry_id");
        const assets = await client.from("asset_registry").select("id,name,status,license_registry_id").in("name", ["tile_grass.png","tile_sand.png","tile_dirt.png","tile_pavement.png","tile_water.png"]);
        if (!binding.error && !assets.error) {
          const transition: TerrainAssetBindingLoadResult = loadTerrainAssetBindings(binding.data || []);
          const base = loadTerrainAssetBindings((assets.data || []).flatMap((a: any) => {
            const terrain = a.name === "tile_grass.png" ? "grass" : a.name === "tile_sand.png" ? "sand" : a.name === "tile_dirt.png" ? "dirt" : a.name === "tile_pavement.png" ? "pavement" : a.name === "tile_water.png" ? "water" : null;
            return terrain && a.status === "approved" && a.license_registry_id ? [{ terrain_key: terrain, neighbor_mask: 255, asset_id: a.id, candidate_status: "approved", asset_status: a.status, autotile_capable: false, license_registry_id: a.license_registry_id }] : [];
          }));
          const all = [...transition.accepted, ...base.accepted]; const out: TerrainAssetBindingMap = {};
          for (const b of all) { out[b.terrain] ??= {}; out[b.terrain]![b.mask] = b; }
          setTerrainBindings(out); setTerrainStatus(`Terrain runtime · ${all.length}/256 · ${BUILD_MARKER}`);
        }
        await ensureConnection(client);
      } catch (e) { if (!cancelled) setStatus(`Connection failed: ${msg(e)}`); }
      finally { if (!cancelled) setBusy(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async () => {
    const client = createMapEditorSupabaseClient();
    if (!client) { setStatus("Save failed: Supabase client unavailable"); return null; }
    const localCurrent = maps.find(m => m.id === activeMapId) || active;
    setBusy(true); setStatus("Saving to Supabase…");
    try {
      const connection = await ensureConnection(client);
      const current = resolveSaveDocument(localCurrent, connection);
      let result: any;
      if (connection.version < 1) {
        const v = await bootstrap(client, current, connection.mapId);
        result = { status: "committed", version: v, document: current };
      } else {
        result = await saveWithConflictDetection(client, current, connection.document, connection.version);
      }
      if (result.status !== "committed") { setStatus(`Save ${result.status}`); return result; }
      setConnectedMapId(connection.mapId); setVersion(Number(result.version) || 1); setBaseDocument(result.document); update(result.document); await refreshSlots(client, connection.mapId); setStatus(`Saved · version ${Number(result.version) || 1}`); return result;
    } catch (e) { setStatus(`Save failed: ${msg(e)}`); return null; }
    finally { setBusy(false); }
  }, [active, activeMapId, bootstrap, ensureConnection, maps, refreshSlots, update]);

  const saveToSlot = useCallback(async (slot: number, requestedLabel: string) => {
    const client = createMapEditorSupabaseClient(); if (!client) { setStatus("Save Slot failed: Supabase unavailable"); return; }
    const label = window.prompt(`Nama untuk Save Slot ${slot}`, requestedLabel || `Save Slot ${slot}`); if (label === null) return;
    const saved = await save(); if (!saved || saved.status !== "committed") return;
    setBusy(true);
    try {
      const mapId = connectedMapId!;
      const vr = await client.from("map_versions").select("id").eq("map_id", mapId).eq("version_number", saved.version).single();
      if (vr.error) throw vr.error;
      const rpc = await client.rpc("map_editor_save_slot_v1", { p_map_id: mapId, p_slot_number: slot, p_label: label.trim() || `Save Slot ${slot}`, p_version_id: vr.data?.id || null, p_version_number: Number(saved.version), p_snapshot: serializeResolvedMapSnapshot(saved.document) });
      if (rpc.error) throw rpc.error;
      const result = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      if (!result?.ok) throw new Error(result?.code || "SAVE_SLOT_FAILED");
      await refreshSlots(client, mapId); setStatus(`Game saved to Slot ${slot}`);
    } catch (e) { setStatus(`Save Slot ${slot} failed: ${msg(e)}`); }
    finally { setBusy(false); }
  }, [connectedMapId, refreshSlots, save]);

  const loadLatest = useCallback(async () => {
    const client = createMapEditorSupabaseClient(); if (!client) { setStatus("Load failed: Supabase unavailable"); return; }
    setBusy(true);
    try { const connection = await ensureConnection(client); if (!(await adopt(client, connection.mapId))) throw new Error("No authoritative snapshot"); }
    catch (e) { setStatus(`Load failed: ${msg(e)}`); }
    finally { setBusy(false); }
  }, [adopt, ensureConnection]);

  const loadSlot = useCallback(async (slot: number) => {
    const client = createMapEditorSupabaseClient(); if (!client) { setStatus("Load Slot failed: Supabase unavailable"); return; }
    setBusy(true);
    try {
      const connection = await ensureConnection(client);
      const id = connection.mapId;
      const rpc = await client.rpc("map_editor_load_save_slot_v1", { p_map_id: id, p_slot_number: slot });
      if (rpc.error) throw rpc.error;
      const result = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      if (!result?.ok || !result.snapshot) throw new Error(result?.code || "SLOT_EMPTY");
      const doc = parseMapDocument(typeof result.snapshot === "string" ? result.snapshot : JSON.stringify(result.snapshot), id);
      setMaps([doc]); setActiveMapId(doc.id); setConnectedMapId(id); setBaseDocument(doc); setVersion(Number(result.version_number) || 1); await refreshSlots(client, id); setShowSlots(false); setStatus(`Loaded ${result.label || `Save Slot ${slot}`} · version ${result.version_number}`);
    } catch (e) { setStatus(`Load Slot ${slot} failed: ${msg(e)}`); }
    finally { setBusy(false); }
  }, [ensureConnection, refreshSlots]);

  return <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh" }}>
    <MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId} />
    <div style={{ position: "relative", minHeight: 0 }}>
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", gap: 6, alignItems: "center", padding: 6, border: "1px solid #334155", borderRadius: 6, background: "#0f172a" }}>
        <button onClick={() => setShowSlots(true)} disabled={busy}>Save / Load</button>
        <button onClick={save} disabled={busy}>Quick Save</button>
        <button onClick={loadLatest} disabled={busy}>Load Latest</button>
        <span style={{ fontSize: 11, opacity: .8 }}>v{version} · {status}</span>
      </div>
      <EditorShell initialDocument={active} terrainBindings={terrainBindings} terrainStatus={terrainStatus} onDocumentChange={update} onSave={async () => { await save(); }} />
    </div>
    <SaveSlotsPanel open={showSlots} slots={slots} busy={busy} onClose={() => setShowSlots(false)} onSave={saveToSlot} onLoad={loadSlot} />
  </div>;
}
