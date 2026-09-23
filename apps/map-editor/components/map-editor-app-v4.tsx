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
import { resolveMapNavigationPersistence, resolveSaveDocument, type SaveConnection } from "../editor/map-save-state";
import { resolveAuthoritativeMap } from "../editor/map-authoritative-resolver";
import { loadIdentityMapDocument, saveIdentityMapDocument, saveIdentityWithConflictDetection } from "../editor/map-identity-persistence";
import { serializeGameSaveSnapshot } from "../editor/game-save";

const WORLD_ID = process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim() || "3695d0b0-788e-42fa-9345-cc3197d0c94d";
const AUTHORITATIVE_WORLD_MAP_ID = process.env.NEXT_PUBLIC_VANDRITH_WORLD_MAP_ID?.trim() || "87ba34eb-5a75-42fa-8919-63e44b700c02";
const BUILD_MARKER = "save-load-v4-authoritative-world";
const msg = (e: any) => e?.message || e?.error_description || e?.details || e?.hint || String(e || "unknown error");

function fromRow(row: any): MapDocument {
  const seed = createMap("world");
  return { ...seed, id: row.id, name: row.name || "World Map", width: Number(row.width) || seed.width, height: Number(row.height) || seed.height, tileSize: Number(row.tile_size) || seed.tileSize };
}

export type MapEditorStartMode = "load" | "create";

export function MapEditorAppV4({ startMode = "load" }: { startMode?: MapEditorStartMode }) {
  const seed = useMemo(() => createMap("world"), []);
  const [maps, setMaps] = useState<MapDocument[]>([seed]);
  const [activeMapId, setActiveMapId] = useState(seed.id);
  const [connectedMapId, setConnectedMapId] = useState<string | null>(null);
  const [baseDocument, setBaseDocument] = useState<MapDocument | null>(null);
  const [version, setVersion] = useState(0);
  const [loadRevision, setLoadRevision] = useState(0);
  const [status, setStatus] = useState("Connecting to Supabase…");
  const [busy, setBusy] = useState(true);
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [showSlots, setShowSlots] = useState(false);
  const [terrainBindings, setTerrainBindings] = useState<TerrainAssetBindingMap>({});
  const [terrainStatus, setTerrainStatus] = useState(`Loading terrain bindings… · ${BUILD_MARKER}`);
  const [isNewMap, setIsNewMap] = useState(startMode === "create");
  const active = maps.find(m => m.id === activeMapId) || maps[0];

  const update = useCallback((next: MapDocument) => {
    setMaps(cur => cur.some(m => m.id === next.id) ? cur.map(m => m.id === next.id ? next : m) : [...cur, next]);
  }, [ensureConnection, seed, startMode]);

  const openMap = useCallback(async (nextMapId: string, providedDocument?: MapDocument) => {
    const nextDocument = providedDocument ?? maps.find(m => m.id === nextMapId);
    if (!nextDocument) return;
    if (nextDocument.mapType !== "world") {
      const client = createMapEditorSupabaseClient();
      if (!client) { setStatus("Open failed: Supabase unavailable"); return; }
      setActiveMapId(nextMapId);
      try {
        const loaded = await loadIdentityMapDocument(client, nextMapId);
        const document = providedDocument || loaded.document || nextDocument;
        setMaps(cur => cur.some(m => m.id === document.id) ? cur.map(m => m.id === document.id ? document : m) : [...cur, document]);
        setConnectedMapId(nextMapId);
        setBaseDocument(loaded.document || document);
        setVersion(loaded.version);
        setLoadRevision(v => v + 1);
        setStatus(loaded.document ? `Loaded identity · version ${loaded.version}` : "Opened new identity · unsaved document");
      } catch (e) {
        setConnectedMapId(nextMapId);
        setBaseDocument(nextDocument);
        setVersion(0);
        setStatus(`Open identity failed: ${msg(e)}`);
      }
      return;
    }
    const next = resolveMapNavigationPersistence(nextMapId, { connectedMapId, baseDocument, version });
    setActiveMapId(nextMapId);
    setConnectedMapId(next.connectedMapId);
    setBaseDocument(next.baseDocument);
    setVersion(next.version);
  }, [baseDocument, connectedMapId, maps, version]);

  const refreshSlots = useCallback(async (client: any, mapId: string) => {
    const { data, error } = await client.from("map_editor_save_slots").select("slot_number,label,version_number,updated_at,snapshot").eq("map_id", mapId).order("slot_number");
    if (error) throw error;
    setSlots((data || []) as SaveSlot[]);
  }, []);

  const bootstrap = useCallback(async (client: any, doc: MapDocument, mapId: string) => {
    const p = createSupabaseMapMergePersistence(client);
    const raw = await p.commitResolvedMerge(mapId, 0, serializeResolvedMapSnapshot(doc), "map-editor-bootstrap-v4");
    const result = normalizeMergeCommitResponse(raw);
    if (result.status !== "committed") throw new Error(`bootstrap: ${result.status}`);
    return { version: Number(result.versionNumber) || 1, projectionStatus: result.projectionStatus, projectionError: result.projectionError };
  }, []);

  const adopt = useCallback(async (client: any, mapId: string) => {
    const loaded = await loadMapDocumentSnapshot(client, mapId);
    if (!loaded.document) return false;
    setMaps([loaded.document]);
    setActiveMapId(loaded.document.id);
    setConnectedMapId(mapId);
    setBaseDocument(loaded.document);
    setVersion(Number(loaded.result.version_number) || 0);
    setLoadRevision(v => v + 1);
    await refreshSlots(client, mapId);
    setStatus(`Connected · version ${Number(loaded.result.version_number) || 0}`);
    return true;
  }, [active, refreshSlots]);

  const ensureConnection = useCallback(async (client: any, forceReload = false): Promise<SaveConnection> => {
    if (!forceReload && connectedMapId && active?.mapType === "world" && active.id === connectedMapId && baseDocument) {
      return { mapId: connectedMapId, document: baseDocument, version };
    }
    if (active?.mapType !== "world") throw new Error("Only the persisted World Map can be saved in this phase");

    let authoritativeRow: any = null;
    let id = AUTHORITATIVE_WORLD_MAP_ID;
    try {
      const resolved = await resolveAuthoritativeMap(client, AUTHORITATIVE_WORLD_MAP_ID, "world");
      if (resolved.row.world_id !== WORLD_ID) throw new Error("MAP_RESOLUTION_ERROR: authoritative World Map belongs to a different world");
      authoritativeRow = resolved.row;
      id = resolved.row.id;
      const connection = { mapId: id, document: resolved.document, version: resolved.version };
      setMaps([resolved.document]); setActiveMapId(id); setConnectedMapId(id); setBaseDocument(resolved.document); setVersion(connection.version);
      await refreshSlots(client, id); setStatus(`Connected · authoritative World Map · version ${connection.version}`);
      return connection;
    } catch (resolutionError) {
      const rowResult = await client.from("maps").select("id,name,width,height,tile_size,map_type,world_id").eq("id", AUTHORITATIVE_WORLD_MAP_ID).eq("world_id", WORLD_ID).eq("map_type", "world").maybeSingle();
      if (rowResult.error) throw rowResult.error;
      if (!rowResult.data?.id) throw resolutionError;
      authoritativeRow = rowResult.data;
      id = rowResult.data.id as string;
    }

    const loaded = await loadMapDocumentSnapshot(client, id);
    if (loaded.document) {
      const connection = { mapId: id, document: loaded.document, version: Number(loaded.result.version_number) || 0 };
      setMaps([loaded.document]); setActiveMapId(id); setConnectedMapId(id); setBaseDocument(loaded.document); setVersion(connection.version);
      await refreshSlots(client, id); setStatus(`Connected · authoritative World Map · version ${connection.version}`);
      return connection;
    }

    const discoveredVersion = Number(loaded.result.version_number) || 0;
    if (discoveredVersion > 0) {
      const detail = loaded.result.error ? ` · ${loaded.result.error}` : "";
      throw new Error(`Authoritative snapshot is not loadable · version ${discoveredVersion} · ${loaded.result.code || "snapshot-parse-or-read-failure"}${detail}`);
    }

    const doc = fromRow(authoritativeRow);
    const boot = await bootstrap(client, doc, id);
    const connection = { mapId: id, document: doc, version: boot.version };
    setMaps([doc]); setActiveMapId(id); setConnectedMapId(id); setBaseDocument(doc); setVersion(boot.version);
    await refreshSlots(client, id); setStatus(`Connected · authoritative World Map · version ${boot.version}`);
    return connection;
  }, [active, baseDocument, bootstrap, connectedMapId, refreshSlots, version]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const client = createMapEditorSupabaseClient();
      if (!client) throw new Error("Supabase client unavailable");
      const session = await client.auth.getSession();
      if (!session.data.session) {
        throw new Error("AUTH_REQUIRED: Please sign in before opening the Map Editor.");
      }
      if (cancelled) return;
      try {
        const binding = await client.from("vandrith_asset_binding_workbench").select("terrain_key,neighbor_mask,asset_id,candidate_status,asset_status,autotile_capable,license_registry_id");
        if (binding.error) {
          setTerrainStatus(`Terrain runtime unavailable · ${msg(binding.error)} · ${BUILD_MARKER}`);
        } else {
          const result: TerrainAssetBindingLoadResult = loadTerrainAssetBindings(binding.data || []);
          setTerrainBindings(result.bindings);
          setTerrainStatus(`Terrain runtime · ${result.diagnostics.accepted}/256 · ${result.rejected} rejected · ${BUILD_MARKER}`);
        }
        if (startMode === "create") {
          setMaps([seed]);
          setActiveMapId(seed.id);
          setConnectedMapId(null);
          setBaseDocument(null);
          setVersion(0);
          setStatus("New blank map · not saved yet");
        } else {
          await ensureConnection(client);
          setShowSlots(true);
        }
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
      let result: any;
      if (localCurrent.mapType !== "world") {
        const base = baseDocument?.id === localCurrent.id ? baseDocument : localCurrent;
        result = await saveIdentityWithConflictDetection(client, localCurrent, base, version);
      } else {
        const connection = await ensureConnection(client);
        const current = localCurrent.id === connection.mapId
          ? resolveSaveDocument(localCurrent, connection)
          : connection.document;
        if (connection.version < 1) {
          const boot = await bootstrap(client, current, connection.mapId);
          result = { status: "committed", version: boot.version, document: current, projectionStatus: boot.projectionStatus, projectionError: boot.projectionError };
        } else {
          result = await saveWithConflictDetection(client, current, connection.document, connection.version);
        }
      }
      if (result.status !== "committed") { setStatus(`Save ${result.status}`); return result; }
      const savedMapId = localCurrent.mapType === "world" ? connectedMapId : localCurrent.id;
      setIsNewMap(false);
      setConnectedMapId(savedMapId); setVersion(Number(result.version) || 1); setBaseDocument(result.document); update(result.document);
      if (localCurrent.mapType === "world" && savedMapId) await refreshSlots(client, savedMapId);
      const savedVersion = Number(result.version) || 1;
      if (result.projectionStatus === "failed") setStatus(`Saved · version ${savedVersion} · projection failed: ${result.projectionError || "downstream projection failed"}`);
      else if (result.projectionStatus === "not_run") setStatus(`Saved · version ${savedVersion} · projection not run`);
      else setStatus(`Saved · version ${savedVersion} · projection committed`);
      return result;
    } catch (e) { setStatus(`Save failed: ${msg(e)}`); return null; }
    finally { setBusy(false); }
  }, [active, activeMapId, baseDocument, bootstrap, ensureConnection, isNewMap, maps, refreshSlots, update, version]);

  const saveToSlot = useCallback(async (slot: number, requestedLabel: string) => {
    const client = createMapEditorSupabaseClient(); if (!client) { setStatus("Save Slot failed: Supabase unavailable"); return; }
    const label = window.prompt(`Nama untuk Save Slot ${slot}`, requestedLabel || `Save Slot ${slot}`); if (label === null) return;
    setBusy(true); setStatus(`Saving World + Exterior to Slot ${slot}…`);
    try {
      const worldRemote = await loadMapDocumentSnapshot(client, AUTHORITATIVE_WORLD_MAP_ID);
      if (!worldRemote.document || worldRemote.result.error) throw new Error(worldRemote.result.error || worldRemote.result.code || "WORLD_SNAPSHOT_UNAVAILABLE");
      let worldDocument = worldRemote.document;
      let worldVersion = Number(worldRemote.result.version_number) || 0;

      const localWorld = maps.find(m => m.mapType === "world" && m.id === AUTHORITATIVE_WORLD_MAP_ID) || (active.mapType === "world" ? active : null);
      if (localWorld && JSON.stringify(serializeResolvedMapSnapshot(localWorld)) !== JSON.stringify(serializeResolvedMapSnapshot(worldDocument))) {
        const worldSaved = await saveWithConflictDetection(client, localWorld, worldDocument, worldVersion);
        if (worldSaved.status !== "committed") throw new Error(`World save ${worldSaved.status}`);
        worldDocument = worldSaved.document;
        worldVersion = Number(worldSaved.version) || worldVersion;
        setMaps(cur => cur.some(m => m.id === worldDocument.id) ? cur.map(m => m.id === worldDocument.id ? worldDocument : m) : [...cur, worldDocument]);
      }

      const localExterior = active.mapType === "playable" && active.playableSpace !== "interior"
        ? active
        : maps.find(m => m.mapType === "playable" && m.playableSpace !== "interior") || null;

      let exteriorDocument: MapDocument | null = null;
      if (localExterior) {
        const remoteExterior = await loadIdentityMapDocument(client, localExterior.id);
        if (remoteExterior.document) {
          const exteriorSaved = await saveIdentityWithConflictDetection(client, localExterior, remoteExterior.document, remoteExterior.version);
          if (exteriorSaved.status === "error") throw exteriorSaved.error;
          if (exteriorSaved.status !== "committed") throw new Error(`Exterior save ${exteriorSaved.status}`);
          exteriorDocument = exteriorSaved.document;
          setMaps(cur => cur.some(m => m.id === exteriorDocument!.id) ? cur.map(m => m.id === exteriorDocument!.id ? exteriorDocument! : m) : [...cur, exteriorDocument!]);
        } else {
          const firstSave = await saveIdentityMapDocument(client, localExterior, 0, "map-editor-save");
          if (firstSave.status !== "committed") throw new Error(`Exterior save ${firstSave.status}`);
          exteriorDocument = localExterior;
        }
      }

      if (worldVersion < 1) throw new Error("WORLD_VERSION_UNAVAILABLE");
      const vr = await client.from("map_versions").select("id").eq("map_id", AUTHORITATIVE_WORLD_MAP_ID).eq("version_number", worldVersion).single();
      if (vr.error) throw vr.error;
      const snapshot = serializeGameSaveSnapshot(worldDocument, exteriorDocument);
      const rpc = await client.rpc("map_editor_save_slot_v1", {
        p_map_id: AUTHORITATIVE_WORLD_MAP_ID,
        p_slot_number: slot,
        p_label: label.trim() || `Save Slot ${slot}`,
        p_version_id: vr.data?.id || null,
        p_version_number: worldVersion,
        p_snapshot: snapshot,
      });
      if (rpc.error) throw rpc.error;
      const result = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      if (!result?.ok) throw new Error(result?.code || "SAVE_SLOT_FAILED");
      await refreshSlots(client, AUTHORITATIVE_WORLD_MAP_ID);
      setStatus(`Game saved to Slot ${slot} · World + Exterior`);
    } catch (e) { setStatus(`Save Slot ${slot} failed: ${msg(e)}`); }
    finally { setBusy(false); }
  }, [active, maps, refreshSlots]);

  const loadLatest = useCallback(async () => {
    const client = createMapEditorSupabaseClient(); if (!client) { setStatus("Load failed: Supabase unavailable"); return; }
    setBusy(true);
    try {
      if (active.mapType !== "world") {
        const loaded = await loadIdentityMapDocument(client, active.id);
        if (!loaded.document) {
          setVersion(0);
          setConnectedMapId(active.id);
          setBaseDocument(active);
          setStatus("Load Latest · no authoritative identity version yet");
          return;
        }
        setMaps(cur => cur.map(m => m.id === loaded.document!.id ? loaded.document! : m));
        setActiveMapId(loaded.document.id);
        setConnectedMapId(active.id);
        setBaseDocument(loaded.document);
        setVersion(loaded.version);
        setLoadRevision(v => v + 1);
        setStatus(`Loaded Latest · identity · version ${loaded.version}`);
        return;
      }

      // Prefer the durable authoritative World row. If the browser session cannot
      // read map_versions directly, fall back to the existing runtime/durable
      // loader without changing the World persistence foundation.
      let document: MapDocument | null = null;
      let loadedVersion = 0;
      let directReadError: unknown = null;

      try {
        const latest = await client
          .from("map_versions")
          .select("version_number,snapshot")
          .eq("map_id", AUTHORITATIVE_WORLD_MAP_ID)
          .order("version_number", { ascending: false })
          .limit(1);
        if (latest.error) throw latest.error;
        const row = latest.data?.[0];
        if (!row?.snapshot) throw new Error("Authoritative durable snapshot is unavailable");
        document = parseMapDocument(
          typeof row.snapshot === "string" ? row.snapshot : JSON.stringify(row.snapshot),
          AUTHORITATIVE_WORLD_MAP_ID,
        );
        loadedVersion = Number(row.version_number) || 0;
      } catch (error) {
        directReadError = error;
        const fallback = await loadMapDocumentSnapshot(client, AUTHORITATIVE_WORLD_MAP_ID);
        if (!fallback.document) {
          throw new Error(`Authoritative Load Latest failed: ${msg(error)}; fallback: ${fallback.result.error || fallback.result.code || "no snapshot"}`);
        }
        document = fallback.document;
        loadedVersion = Number(fallback.result.version_number) || 0;
      }

      if (!document || loadedVersion < 1) {
        throw new Error("Authoritative durable version is invalid");
      }

      setMaps([document]);
      setActiveMapId(document.id);
      setConnectedMapId(AUTHORITATIVE_WORLD_MAP_ID);
      setBaseDocument(document);
      setVersion(loadedVersion);
      setLoadRevision(v => v + 1);
      await refreshSlots(client, AUTHORITATIVE_WORLD_MAP_ID);
      setStatus(
        directReadError
          ? `Loaded Latest · authoritative fallback · version ${loadedVersion}`
          : "Loaded Latest · authoritative durable version " + loadedVersion,
      );
    } catch (e) { setStatus("Load failed: " + msg(e)); }
    finally { setBusy(false); }
  }, [refreshSlots]);

  const loadSlot = useCallback(async (slot: number) => {
    const client = createMapEditorSupabaseClient(); if (!client) { setStatus("Load Slot failed: Supabase unavailable"); return; }
    setBusy(true);
    try {
      const rpc = await client.rpc("map_editor_load_save_slot_v1", { p_map_id: AUTHORITATIVE_WORLD_MAP_ID, p_slot_number: slot });
      if (rpc.error) throw rpc.error;
      const result = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      if (!result?.ok || !result.snapshot) throw new Error(result?.code || "SLOT_EMPTY");

      const parsed = typeof result.snapshot === "string" ? JSON.parse(result.snapshot) : result.snapshot;
      const gameSave = parsed?.schema === "vandrith.game-save" ? parsed : null;
      const worldDocument = gameSave?.world
        ? parseMapDocument({ schema: "vandrith.map-document", version: 1, document: gameSave.world }, AUTHORITATIVE_WORLD_MAP_ID)
        : parseMapDocument(JSON.stringify(parsed), AUTHORITATIVE_WORLD_MAP_ID);
      const exteriorDocument = gameSave?.exterior
        ? parseMapDocument({ schema: "vandrith.map-document", version: 1, document: gameSave.exterior }, gameSave.exterior.id)
        : null;
      const restored = exteriorDocument ? [worldDocument, exteriorDocument] : [worldDocument];

      setMaps(cur => {
        const byId = new Map(cur.map(document => [document.id, document]));
        for (const document of restored) byId.set(document.id, document);
        return Array.from(byId.values());
      });
      setActiveMapId(worldDocument.id);
      setConnectedMapId(AUTHORITATIVE_WORLD_MAP_ID);
      setBaseDocument(worldDocument);
      setVersion(Number(result.version_number) || 1);
      setLoadRevision(v => v + 1);
      await refreshSlots(client, AUTHORITATIVE_WORLD_MAP_ID);
      setShowSlots(false);
      setStatus(`Loaded ${result.label || `Save Slot ${slot}`} · World + Exterior`);
    } catch (e) { setStatus(`Load Slot ${slot} failed: ${msg(e)}`); }
    finally { setBusy(false); }
  }, [refreshSlots]);

  const browserClient = useMemo(() => createMapEditorSupabaseClient(), []);

  return <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh" }}>
    <MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={openMap} client={browserClient as any} onStatus={setStatus} />
    <div style={{ position: "relative", minHeight: 0 }}>
      <EditorShell initialDocument={active} initialDocumentRevision={loadRevision} terrainBindings={terrainBindings} terrainStatus={terrainStatus} onDocumentChange={update} onSave={async () => { await save(); }} onSaveLoad={() => setShowSlots(true)} onQuickSave={async () => { await save(); }} onLoadLatest={async () => { await loadLatest(); }} /><div style={{position:"absolute",bottom:8,right:8,zIndex:10,padding:"5px 8px",border:"1px solid #334155",borderRadius:6,background:"#0f172a",fontSize:11,opacity:.9}}>v{version} · {status}</div>
    </div>
    {showSlots && <SaveSlotsPanel open={showSlots} slots={slots} onSave={saveToSlot} onLoad={loadSlot} onClose={() => setShowSlots(false)} />}
  </div>;
}
