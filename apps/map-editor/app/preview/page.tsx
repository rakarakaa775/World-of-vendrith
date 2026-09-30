"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";
import { createMapEditorSupabaseClient } from "../../editor/supabase-client";
import { loadMapDocumentSnapshot } from "../../editor/map-persistence";
import { loadTerrainAssetBindings, type TerrainAssetBindingLoadResult } from "../../editor/terrain-asset-binding-loader";
import type { MapDocument } from "../../editor/map-document";
import type { TerrainAssetBindingMap } from "../../editor/terrain-asset-binding";
import { PixiMapCanvas } from "../../components/pixi-map-canvas";

const previewLayers = ["World Terrain", "Region Boundaries", "Playable", "Life", "Events"];
const AUTHORITATIVE_WORLD_MAP_ID = process.env.NEXT_PUBLIC_VANDRITH_WORLD_MAP_ID?.trim() || "87ba34eb-5a75-42fa-8919-63e44b700c02";
type PreviewViewportAction = { id: number; type: "zoom"; zoom: number } | { id: number; type: "fit" } | { id: number; type: "zoom-map" };

export default function PreviewPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [document, setDocument] = useState<MapDocument | null>(null);
  const [terrainBindings, setTerrainBindings] = useState<TerrainAssetBindingMap>({});
  const [loadStatus, setLoadStatus] = useState("Loading authoritative World Map…");
  const [zoom, setZoom] = useState(100);
  const [layers, setLayers] = useState([true, true, false, false, false]);
  const [playing, setPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [viewportAction, setViewportAction] = useState<PreviewViewportAction>({ id: 1, type: "fit" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  const loadAuthoritativeWorld = useCallback(async () => {
    const client = createMapEditorSupabaseClient();
    if (!client) {
      setLoadStatus("Supabase client unavailable");
      return;
    }
    setLoadStatus("Loading authoritative World Map…");
    try {
      const loaded = await loadMapDocumentSnapshot(client, AUTHORITATIVE_WORLD_MAP_ID);
      if (!loaded.document) {
        throw new Error(loaded.result.error || loaded.result.code || "Authoritative World Map snapshot unavailable");
      }
      const binding = await client
        .from("vandrith_asset_binding_workbench")
        .select("terrain_key,neighbor_mask,asset_id,candidate_status,asset_status,autotile_capable,license_registry_id,tile_region");
      if (binding.error) throw binding.error;
      const terrain: TerrainAssetBindingLoadResult = loadTerrainAssetBindings(binding.data || []);
      setDocument(loaded.document);
      setTerrainBindings(terrain.bindings);
      setLoadStatus(
        loaded.result.code === "durable-version-fallback"
          ? `Authoritative World · version ${loaded.result.version_number || "?"} · durable fallback`
          : `Authoritative World · version ${loaded.result.version_number || "?"}`,
      );
    } catch (error) {
      setLoadStatus(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    void loadAuthoritativeWorld();
  }, [loading, user, loadAuthoritativeWorld, refreshKey]);


  const previewDocument = useMemo(() => {
    if (!document) return null;
    return {
      ...document,
      layers: document.layers.map(layer =>
        layer.id === "ground" ? { ...layer, visible: layers[0] } : layer,
      ),
    };
  }, [document, layers]);

  const changeZoom = (next: number) => {
    const value = Math.max(50, Math.min(200, next));
    setZoom(value);
    setViewportAction(previous => ({ id: previous.id + 1, type: "zoom", zoom: value / 100 }));
  };

  if (loading || !user) {
    return <main className="vandrith-preview-loading">Memeriksa akun...</main>;
  }

  return (
    <main className="vandrith-preview">
      <header className="vandrith-preview-topbar">
        <button className="vandrith-preview-back" type="button" onClick={() => router.push("/")}>
          <span aria-hidden="true">‹</span> Control Center
        </button>
        <div className="vandrith-preview-title">
          <span>PREVIEW ENGINE</span>
          <strong>World of Vendrith</strong>
        </div>
        <div className="vandrith-preview-status">
          <i aria-hidden="true" />
          <span role="status" aria-live="polite">{loadStatus}</span>
        </div>
      </header>

      <div className="vandrith-preview-toolbar">
        <div className="vandrith-preview-toolbar-group">
          <button type="button" className="is-active" aria-current="page">World</button>
          <button type="button">Region</button>
          <button type="button">Playable</button>
          <button type="button">Interior</button>
        </div>
        <div className="vandrith-preview-toolbar-group">
          <button type="button" onClick={() => changeZoom(zoom - 10)} aria-label="Zoom out">−</button>
          <span>{zoom}%</span>
          <button type="button" onClick={() => changeZoom(zoom + 10)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => { setZoom(100); setViewportAction(previous => ({ id: previous.id + 1, type: "fit" })); }} aria-label="Fit world map">⌖</button>
          <button type="button" className={showGrid ? "is-active" : ""} onClick={() => setShowGrid(value => !value)} aria-pressed={showGrid}>Grid</button>
          <button type="button" className={showCoordinates ? "is-active" : ""} onClick={() => setShowCoordinates(value => !value)} aria-pressed={showCoordinates}>XY</button>
          <button type="button" onClick={() => setRefreshKey(value => value + 1)}>Refresh</button>
        </div>
      </div>

      <section className="vandrith-preview-stage" aria-label="Authoritative World Map preview">
        <div className="vandrith-preview-scene vandrith-preview-authoritative-scene">
          {document ? (
            <PixiMapCanvas
              document={previewDocument || document}
              activeTool="Preview"
              activeLayerId="ground"
              selectedTileId="grass"
              brushSize={1}
              selection={null}
              onPaint={() => undefined}
              onSelectionChange={() => undefined}
              onStamp={() => undefined}
              onObjectPlace={() => undefined}
              onObjectMove={() => undefined}
              selectedObjectIds={[]}
              onObjectSelectionChange={() => undefined}
              selectedObjectId={null}
              terrainBindings={terrainBindings}
              viewportAction={viewportAction}
              viewportResetKey={document.id}
              readonly
              showGrid={showGrid}
              previewMode
            />
          ) : (
            <div className="vandrith-preview-empty" role={loadStatus === "Loading authoritative World Map…" || loadStatus === "Supabase client unavailable" ? "status" : "alert"} aria-live="polite">
              <strong>World Map belum termuat</strong>
              <span>{loadStatus}</span>
            </div>
          )}
          {showCoordinates && document && (
            <div className="vandrith-preview-coordinates">
              {document.width}×{document.height} · {document.name} · AUTHORITATIVE WORLD
            </div>
          )}
        </div>

        <aside className="vandrith-preview-inspector">
          <div className="vandrith-preview-panel-heading">
            <span>PREVIEW CONTEXT</span>
            <small>LIVE</small>
          </div>
          <h1>World of Vendrith</h1>
          <p>Authoritative World Map</p>

          <dl>
            <div><dt>World</dt><dd>{document ? "Loaded" : "Loading"}</dd></div>
            <div><dt>Terrain</dt><dd>{Object.keys(terrainBindings).length ? "Runtime ready" : "Loading"}</dd></div>
            <div><dt>Life</dt><dd>Not generated</dd></div>
            <div><dt>Events</dt><dd>Standby</dd></div>
          </dl>

          <div className="vandrith-preview-panel-heading layer-heading">
            <span>LAYERS</span>
            <small>5</small>
          </div>
          <div className="vandrith-preview-layers">
            {previewLayers.map((layer, index) => (
              <button
                key={layer}
                type="button"
                className={layers[index] ? "is-on" : ""}
                onClick={() => setLayers(current => current.map((enabled, layerIndex) => layerIndex === index ? !enabled : enabled))}
                aria-pressed={layers[index]}
              >
                <i aria-hidden="true" />
                <span>{layer}</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <footer className="vandrith-preview-bottom">
        <div className="vandrith-preview-playback">
          <button type="button" aria-label="Play preview" aria-pressed={playing} onClick={() => setPlaying(true)}>▶</button>
          <button type="button" aria-label="Pause preview" aria-pressed={!playing} onClick={() => setPlaying(false)}>Ⅱ</button>
          <button type="button" aria-label="Reset preview" onClick={() => { setPlaying(false); setZoom(100); setViewportAction(previous => ({ id: previous.id + 1, type: "fit" })); }}>↺</button>
          <span>{playing ? "PLAYING" : "00:00:00"}</span>
        </div>
        <div className="vandrith-preview-mode">
          <span>AUTHORITATIVE MAP</span>
          <strong>EDITOR PREVIEW</strong>
        </div>
        <button type="button" className="vandrith-preview-exit" onClick={() => router.push("/world-builder?workspace=world&load=1")}>
          Open World Builder →
        </button>
      </footer>
    </main>
  );
}

