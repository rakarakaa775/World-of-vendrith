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

const WORLD_ID = process.env.NEXT_PUBLIC_VANDRITH_WORLD_ID?.trim() || "3695d0b0-788e-42fa-9345-cc3197d0c94d";
const CONFIGURED_MAP_ID = process.env.NEXT_PUBLIC_VANDRITH_MAP_ID?.trim() || null;
const messageOf = (e: any) => e?.message || e?.error_description || e?.details || e?.hint || String(e || "unknown error");

function mapFromRow(row: any): MapDocument {
  const seed = createMap("world");
  return {
    ...seed,
    id: row.id,
    name: row.name || "World Map",
    width: Number(row.width) || seed.width,
    height: Number(row.height) || seed.height,
    tileSize: Number(row.tile_size) || seed.tileSize,
  };
}

export function MapEditorAppV3() {
  const seed = useMemo(() => createMap("world"), []);
  const [maps, setMaps] = useState<MapDocument[]>([seed]);
  const [activeMapId, setActiveMapId] = useState(seed.id);
  const [persistedMapId, setPersistedMapId] = useState<string | null>(CONFIGURED_MAP_ID);
  const [baseDocument, setBaseDocument] = useState<MapDocument | null>(null);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState("Connecting to Supabase…");
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [showSlots, setShowSlots] = useState(false);

  const active = maps.find(map => map.id === activeMapId) || maps[0];

  const update = useCallback((next: MapDocument) => {
    setMaps(current => current.some(map => map.id === next.id)
      ? current.map(map => map.id === next.id ? next : map)
      : [...current, next]);
  }, []);

  const refreshSlots = useCallback(async (client: any, mapId: string) => {
    const { data, error } = await client
      .from("map_editor_save_slots")
      .select("slot_number,label,version_number,updated_at")
      .eq("map_id", mapId)
      .order("slot_number");
    if (error) throw error;
    setSlots((data || []) as SaveSlot[]);
  }, []);

  const adoptAuthoritative = useCallback(async (client: any, mapId: string) => {
    const loaded = await loadMapDocumentSnapshot(client, mapId);
    if (!loaded.document) return false;
    setMaps([loaded.document]);
    setActiveMapId(loaded.document.id);
    setBaseDocument(loaded.document);
    setVersion(Number(loaded.result.version_number) || 0);
    await refreshSlots(client, mapId);
    setStatus(`Ready · version ${Number(loaded.result.version_number) || 0}`);
    return true;
  }, [refreshSlots]);

  const bootstrapVersion = useCallback(async (client: any, document: MapDocument, mapId: string) => {
    const persistence = createSupabaseMapMergePersistence(client);
    const rawResult = await persistence.commitResolvedMerge(
      mapId,
      0,
      serializeResolvedMapSnapshot(document),
      "map-editor-bootstrap",
    );
    const result = normalizeMergeCommitResponse(rawResult);
    if (result.status !== "committed") throw new Error(`Bootstrap failed: ${result.status}`);
    return Number(result.versionNumber) || 1;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const client = createMapEditorSupabaseClient();
      if (!client) throw new Error("Supabase environment is not configured");

      const currentSession = await client.auth.getSession();
      if (!currentSession.data.session) {
        const auth = await client.auth.signInAnonymously();
        if (auth.error) throw auth.error;
      }
      if (cancelled) return;

      let mapId = "";

      if (CONFIGURED_MAP_ID) {
        try {
          const { data, error } = await client.from("maps").select("id,name,width,height,tile_size").eq("id", CONFIGURED_MAP_ID).maybeSingle();
          if (!error && data?.id) {
            mapId = data.id;
            const loaded = await adoptAuthoritative(client, mapId);
            if (!loaded) {
              const document = mapFromRow(data);
              const newVersion = await bootstrapVersion(client, document, mapId);
              setMaps([document]);
              setActiveMapId(mapId);
              setBaseDocument(document);
              setVersion(newVersion);
              await refreshSlots(client, mapId);
              setStatus(`Ready · version ${newVersion}`);
            }
          }
        } catch (error) {
          setStatus(`Configured map unavailable · creating session map (${messageOf(error)})`);
        }
      }

      if (!mapId) {
        const document = createMap("world");
        const { data, error } = await client.from("maps").insert({
          world_id: WORLD_ID,
          name: "World Map",
          map_type: "world",
          coordinate_mode: "square",
          width: document.width,
          height: document.height,
          tile_size: document.tileSize,
          metadata: { editor_bootstrap: true },
        }).select("id,name,width,height,tile_size").single();
        if (error) throw error;
        mapId = data.id;
        const persistedDocument = { ...document, id: mapId, name: data.name || document.name };
        const newVersion = await bootstrapVersion(client, persistedDocument, mapId);
        if (cancelled) return;
        setPersistedMapId(mapId);
        setMaps([persistedDocument]);
        setActiveMapId(mapId);
        setBaseDocument(persistedDocument);
        setVersion(newVersion);
        await refreshSlots(client, mapId);
        setStatus(`Ready · new map version ${newVersion}`);
      } else {
        setPersistedMapId(mapId);
      }
    };

    void initialize().catch(error => {
      if (!cancelled) setStatus(`Initialization failed: ${messageOf(error)}`);
    });
    return () => { cancelled = true; };
  }, [adoptAuthoritative, bootstrapVersion, refreshSlots]);

  const save = useCallback(async () => {
    const client = createMapEditorSupabaseClient();
    if (!client || !persistedMapId || active.id !== persistedMapId) {
      setStatus("Save unavailable: map is not connected to Supabase");
      return null;
    }

    setBusy(true);
    setStatus("Saving to Supabase…");
    try {
      let result: any;
      if (!baseDocument || version < 1) {
        const newVersion = await bootstrapVersion(client, active, persistedMapId);
        result = { status: "committed", version: newVersion, document: active };
      } else {
        result = await saveWithConflictDetection(client, active, baseDocument, version);
      }

      if (result.status === "committed") {
        setVersion(Number(result.version) || 1);
        setBaseDocument(result.document);
        update(result.document);
        await refreshSlots(client, persistedMapId);
        setStatus(`Saved · version ${Number(result.version) || 1}`);
        return result;
      }
      if (result.status === "conflict") {
        setStatus(`Save conflict at remote version ${result.remoteVersion}. Load Latest first.`);
        return null;
      }
      setStatus(`Save failed: ${messageOf(result.error)}`);
      return null;
    } catch (error) {
      setStatus(`Save failed: ${messageOf(error)}`);
      return null;
    } finally {
      setBusy(false);
    }
  }, [active, baseDocument, bootstrapVersion, persistedMapId, refreshSlots, update, version]);

  const saveToSlot = useCallback(async (slot: number, requestedLabel: string) => {
    const client = createMapEditorSupabaseClient();
    if (!client || !persistedMapId) {
      setStatus("Save Slot unavailable: map is not connected");
      return;
    }
    const label = window.prompt(`Nama untuk Save Slot ${slot}`, requestedLabel || `Save Slot ${slot}`);
    if (label === null) return;
    const saved = await save();
    if (!saved) return;

    setBusy(true);
    try {
      const { data: versionRow, error: versionError } = await client
        .from("map_versions")
        .select("id")
        .eq("map_id", persistedMapId)
        .eq("version_number", saved.version)
        .single();
      if (versionError) throw versionError;

      const { error } = await client.from("map_editor_save_slots").upsert({
        map_id: persistedMapId,
        slot_number: slot,
        label: label.trim() || `Save Slot ${slot}`,
        version_id: versionRow?.id || null,
        version_number: Number(saved.version),
        snapshot: serializeResolvedMapSnapshot(saved.document),
      }, { onConflict: "map_id,slot_number" });
      if (error) throw error;
      await refreshSlots(client, persistedMapId);
      setStatus(`Game saved to Slot ${slot}`);
    } catch (error) {
      setStatus(`Save Slot ${slot} failed: ${messageOf(error)}`);
    } finally {
      setBusy(false);
    }
  }, [persistedMapId, refreshSlots, save]);

  const loadLatest = useCallback(async () => {
    const client = createMapEditorSupabaseClient();
    if (!client || !persistedMapId) return setStatus("Load unavailable: map is not connected");
    setBusy(true);
    try {
      if (!(await adoptAuthoritative(client, persistedMapId))) throw new Error("No authoritative snapshot exists");
    } catch (error) {
      setStatus(`Load failed: ${messageOf(error)}`);
    } finally {
      setBusy(false);
    }
  }, [adoptAuthoritative, persistedMapId]);

  const loadSlot = useCallback(async (slot: number) => {
    const client = createMapEditorSupabaseClient();
    if (!client || !persistedMapId) return setStatus("Load Slot unavailable: map is not connected");
    setBusy(true);
    try {
      const { data, error } = await client.from("map_editor_save_slots")
        .select("snapshot,version_number,label")
        .eq("map_id", persistedMapId)
        .eq("slot_number", slot)
        .maybeSingle();
      if (error) throw error;
      if (!data?.snapshot) throw new Error("Save slot is empty");
      const document = data.snapshot as MapDocument;
      setMaps([document]);
      setActiveMapId(document.id);
      setBaseDocument(document);
      setVersion(Number(data.version_number) || 1);
      setShowSlots(false);
      setStatus(`Loaded ${data.label || `Save Slot ${slot}`} · version ${data.version_number}`);
    } catch (error) {
      setStatus(`Load Slot ${slot} failed: ${messageOf(error)}`);
    } finally {
      setBusy(false);
    }
  }, [persistedMapId]);

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100vh" }}>
      <MapBrowser maps={maps} activeMapId={active.id} onMapsChange={setMaps} onOpen={setActiveMapId} />
      <div style={{ position: "relative", minHeight: 0 }}>
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", gap: 6, alignItems: "center", padding: 6, border: "1px solid #334155", borderRadius: 6, background: "#0f172a" }}>
          <button onClick={() => setShowSlots(true)} disabled={busy}>Save / Load</button>
          <button onClick={save} disabled={busy || !persistedMapId}>Quick Save</button>
          <button onClick={loadLatest} disabled={busy || !persistedMapId}>Load Latest</button>
          <span style={{ fontSize: 11, opacity: .8 }}>v{version} · {status}</span>
        </div>
        <EditorShell key={`${active.id}:${version}`} initialDocument={active} onDocumentChange={update} />
      </div>
      <SaveSlotsPanel open={showSlots} slots={slots} busy={busy} onClose={() => setShowSlots(false)} onSave={saveToSlot} onLoad={loadSlot} />
    </div>
  );
}
