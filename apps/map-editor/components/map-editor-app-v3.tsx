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
      try {
        const client = createMapEditorSupabaseClient();
        if (!client) throw new Error("Supabase environment is not configured");

        const currentSession = await client.auth.getSession();
        if (!currentSession.data.session) {
          const auth = await client.auth.signInAnonymously();
          if (auth.error) throw auth.error;
        }
        if (cancelled) return;

        let mapId: string | null = null;

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
          const { data, error } = await client.from("maps").select("id,name,width,height,tile_size").eq("world_id", WORLD_ID).order("created_at", { ascending: true }).limit(1).maybeSingle();
          if (error) throw error;
          if (data?.id) {
            mapId = data.id;
            setPersistedMapId(mapId);
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
          } else {
            const { data: created, error: createError } = await client.from("maps").insert({ world_id: WORLD_ID, name: "World Map", map_type: "world", width: seed.width, height: seed.height, tile_size: seed.tileSize }).select("id,name,width,height,tile_size").single();
            if (createError) throw createError;
            mapId = created.id;
            const document = mapFromRow(created);
            const newVersion = await bootstrapVersion(client, document, mapId);
            setPersistedMapId(mapId);
            setMaps([document]);
            setActiveMapId(mapId);
            setBaseDocument(document);
            setVersion(newVersion);
            await refreshSlots(client, mapId);
            setStatus(`Ready · version ${newVersion}`);
          }
        }
      } catch (error) {
        if (!cancelled) setStatus(`Initialization failed: ${messageOf(error)}`);
      }
    };
    initialize();
    return () => { cancelled = true; };
  }, [adoptAuthoritative, bootstrapVersion, refreshSlots, seed]);

  const saveCurrent = useCallback(async () => {
    if (!active) return;
    setBusy(true);
    try {
      const client = createMapEditorSupabaseClient();
      if (!client) throw new Error("Supabase environment is not configured");
      const mapId = persistedMapId || active.id;
      if (!baseDocument || version <= 0) {
        const newVersion = await bootstrapVersion(client, active, mapId);
        setBaseDocument(active);
        setVersion(newVersion);
        await refreshSlots(client, mapId);
        setStatus(`Saved · version ${newVersion}`);
        return;
      }
      const result = await saveWithConflictDetection(client, active, baseDocument, version);
      if (result.status === "committed") {
        setBaseDocument(result.document);
        setVersion(result.version);
        setStatus(`Saved · version ${result.version}`);
        await refreshSlots(client, mapId);
      } else if (result.status === "conflict") {
        setStatus(`Save conflict · remote version ${result.remoteVersion}`);
      } else {
        throw result.error;
      }
    } catch (error) {
      setStatus(`Save failed: ${messageOf(error)}`);
    } finally {
      setBusy(false);
    }
  }, [active, baseDocument, bootstrapVersion, persistedMapId, refreshSlots, version]);

  const saveSlot = useCallback(async (slotNumber: number, label: string) => {
    if (!active) return;
    setBusy(true);
    try {
      await saveCurrent();
      const client = createMapEditorSupabaseClient();
      if (!client) throw new Error("Supabase environment is not configured");
      const mapId = persistedMapId || active.id;
      const { error } = await client.from("map_editor_save_slots").upsert({ map_id: mapId, slot_number: slotNumber, label, version_number: version }, { onConflict: "map_id,slot_number" });
      if (error) throw error;
      await refreshSlots(client, mapId);
      setStatus(`Slot ${slotNumber} saved · version ${version}`);
    } catch (error) {
      setStatus(`Slot save failed: ${messageOf(error)}`);
    } finally {
      setBusy(false);
    }
  }, [active, persistedMapId, refreshSlots, saveCurrent, version]);

  return (
    <main>
      <div className="editor-save-bar">
        <button onClick={() => setShowSlots(true)} disabled={busy}>Save / Load</button>
        <button onClick={saveCurrent} disabled={busy || !active}>Quick Save</button>
        <button onClick={async () => {
          const client = createMapEditorSupabaseClient();
          if (!client || !persistedMapId) return;
          setBusy(true);
          try { await adoptAuthoritative(client, persistedMapId); } catch (error) { setStatus(`Load failed: ${messageOf(error)}`); } finally { setBusy(false); }
        }} disabled={busy || !persistedMapId}>Load Latest</button>
        <span>{status}</span>
      </div>
      <MapBrowser maps={maps} activeMapId={activeMapId} onSelect={setActiveMapId} onCreate={() => { const next = createMap("region"); setMaps(current => [...current, next]); setActiveMapId(next.id); }} />
      {active && <EditorShell initialDocument={active} onDocumentChange={update} />}
      {showSlots && <SaveSlotsPanel slots={slots} busy={busy} onClose={() => setShowSlots(false)} onSave={saveSlot} />}
    </main>
  );
}
