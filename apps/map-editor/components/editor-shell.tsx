"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PixiMapCanvas } from "./pixi-map-canvas";
import { createMap, type MapDocument } from "../editor/map-document";
import { loadTerrainTiles, STARTER_TILES, type TileOption } from "../editor/tile-palette";
import { applyTerrainPaint, eraseTerrainPaint } from "../editor/terrain-paint";
import { createHistory, commitHistory, undoHistory, redoHistory, type MapHistory } from "../editor/map-history";
import { setActiveLayer, updateLayer, reorderLayer, duplicateLayer, mergeLayers } from "../editor/layer-state";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import type { Selection } from "../editor/selection";
import { copySelection, pasteSelection, moveSelection, replaceSelection, type SelectionClipboard } from "../editor/selection-clipboard";
import type { GridPoint } from "../editor/grid";
import type { EnvironmentRuntimeValidation } from "../editor/environment-runtime-validation";
import { DEFAULT_DEBUG_VIEW_STATE, toggleDebugView } from "../editor/debug-views";

type Props = {
  initialDocument?: MapDocument;
  initialDocumentRevision?: number;
  onDocumentChange?: (document: MapDocument) => void;
  onSave?: (document: MapDocument) => void | Promise<void>;
  onSaveLoad?: () => void | Promise<void>;
  onQuickSave?: (document: MapDocument) => void | Promise<void>;
  onLoadLatest?: () => void | Promise<void>;
  busy?: boolean;
  terrainBindings?: TerrainAssetBindingMap;
  terrainStatus?: string;
  environmentValidation?: EnvironmentRuntimeValidation | null;
};

const TOOLS = ["Select", "Paint", "Erase", "Line", "Rectangle", "Flood", "Eyedropper"] as const;
const BRUSH_PRESETS = [
  { name: "Fine", size: 1 },
  { name: "Medium", size: 3 },
  { name: "Large", size: 5 },
  { name: "XL", size: 7 },
] as const;

export function EditorShell({
  initialDocument = createMap("world"),
  initialDocumentRevision = 0,
  onDocumentChange,
  onSave,
  onSaveLoad,
  onQuickSave,
  onLoadLatest,
  busy = false,
  terrainBindings = {},
  terrainStatus = "Terrain runtime unavailable",
}: Props) {
  const [activeTool, setActiveTool] = useState<string>("Select");
  const [tileOptions, setTileOptions] = useState<TileOption[]>(STARTER_TILES);
  const [selectedTile, setSelectedTile] = useState<string>(STARTER_TILES.find(tile => tile.terrain !== "deepwater")?.id ?? STARTER_TILES[0].id);
  const [brushSize, setBrushSize] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [selectionClipboard, setSelectionClipboard] = useState<SelectionClipboard | null>(null);
  const [brushPreset, setBrushPreset] = useState("Fine");
  const [debugViews, setDebugViews] = useState(DEFAULT_DEBUG_VIEW_STATE);
  const [isolatedLayerId, setIsolatedLayerId] = useState<string | null>(null);
  const [paintDiagnostic, setPaintDiagnostic] = useState("Paint diagnostic: waiting for input");
  const [history, setHistory] = useState<MapHistory>(() => createHistory(initialDocument));
  const document = history.present;
  // Keep the latest editor-owned document available to toolbar handlers even while
  // the parent mirror is catching up. Save/Load must operate on EditorShell state.
  const documentRef = useRef<MapDocument>(document);
  const paintGestureRef = useRef<number | null>(null);
  useEffect(() => {
    documentRef.current = document;
  }, [document]);
  const activeLayer = document.layers.find(layer => layer.active)?.id ?? document.layers[0]?.id ?? "ground";
  // Terrain painting is always a ground-layer operation. The persisted map can
  // contain a different active layer (for example objects), but the current
  // World Map UI has no terrain-layer picker and must never silently discard a
  // Paint/Erase request because of that persisted active flag.
  const terrainLayer = document.layers.find(layer => layer.kind === "ground")?.id ?? "ground";

  useEffect(() => {
    setHistory(createHistory(initialDocument));
  }, [initialDocument.id, initialDocumentRevision]);

  useEffect(() => {
    onDocumentChange?.(document);
  }, [document, onDocumentChange]);

  const commit = useCallback((next: MapDocument) => {
    if (next === document) return;
    // Update the save source synchronously with the edit. The effect below is
    // still kept for normal synchronization, but Save must never observe the
    // previous history.present during the tiny render/effect gap after Paint.
    documentRef.current = next;
    setHistory(current => commitHistory(current, next));
  }, [document]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === "c" && selection) {
        event.preventDefault();
        setSelectionClipboard(copySelection(documentRef.current, terrainLayer, selection));
        setPaintDiagnostic("selection: copied");
        return;
      }
      if (modifier && event.key.toLowerCase() === "v" && selectionClipboard && selection) {
        event.preventDefault();
        const next = pasteSelection(documentRef.current, terrainLayer, selectionClipboard, { x: selection.x, y: selection.y });
        commit(next);
        setPaintDiagnostic("selection: pasted");
        return;
      }
      if (modifier && event.shiftKey && event.key.toLowerCase() === "r" && selection) {
        event.preventDefault();
        const next = replaceSelection(documentRef.current, terrainLayer, selection, selectedTile);
        commit(next);
        setPaintDiagnostic("selection: replaced");
        return;
      }
      if (event.key === "Escape" && selection) {
        event.preventDefault();
        setSelection(null);
        setPaintDiagnostic("selection: cleared");
        return;
      }
      if (event.altKey && selection && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) {
        event.preventDefault();
        const delta = event.key === "ArrowLeft" ? { x: -1, y: 0 } : event.key === "ArrowRight" ? { x: 1, y: 0 } : event.key === "ArrowUp" ? { x: 0, y: -1 } : { x: 0, y: 1 };
        const moved = moveSelection(documentRef.current, terrainLayer, selection, delta);
        commit(moved.document);
        setSelection(moved.selection);
        setPaintDiagnostic("selection: moved");
        return;
      }
      if (!modifier) return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        setHistory(current => event.shiftKey ? redoHistory(current) : undoHistory(current));
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        setHistory(current => redoHistory(current));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commit, selection, selectionClipboard, selectedTile, terrainLayer]);

  useEffect(() => {
    let cancelled = false;
    void loadTerrainTiles().then(tiles => {
      if (cancelled) return;
      setTileOptions(tiles);
      const visibleTiles = tiles.filter(tile => !["water", "brackish", "deepwater2", "deepwater"].includes(tile.terrain));
      setSelectedTile(current => visibleTiles.some(tile => tile.id === current) ? current : visibleTiles[0]?.id ?? current);
    });
    return () => { cancelled = true; };
  }, []);

  const handlePaint = useCallback((points: GridPoint[], tileId: string | null, gestureId?: number) => {
    const result = tileId === null
      ? eraseTerrainPaint(document, terrainLayer, points, terrainBindings)
      : applyTerrainPaint(document, terrainLayer, points, tileId, terrainBindings);
    const changed = result.document !== document;
    const changedTile = result.document.layers.find(layer => layer.id === terrainLayer)?.cells[points[0] ? points[0].y * document.width + points[0].x : -1]?.tileId ?? null;
    setPaintDiagnostic(
      `apply: layer=${terrainLayer} requested=${points.length} affected=${result.affected.length} changed=${changed ? "YES" : "NO"} tile=${changedTile ?? "null"} validation=${result.validation.length}`,
    );
    if (gestureId !== undefined && paintGestureRef.current === gestureId) {
      documentRef.current = result.document;
      setHistory(current => current.present === result.document
        ? current
        : { ...current, present: result.document, future: [] });
    } else {
      if (gestureId !== undefined) paintGestureRef.current = gestureId;
      commit(result.document);
    }
  }, [document, terrainLayer, terrainBindings, commit]);

  const handleUndo = useCallback(() => {
    setHistory(current => {
      if (!current.past.length) {
        setPaintDiagnostic("history: UNDO unavailable (no previous state)");
        return current;
      }
      const next = undoHistory(current);
      setPaintDiagnostic(`history: UNDO applied · past=${next.past.length} future=${next.future.length}`);
      return next;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(current => {
      if (!current.future.length) {
        setPaintDiagnostic("history: REDO unavailable (no future state)");
        return current;
      }
      const next = redoHistory(current);
      setPaintDiagnostic(`history: REDO applied · past=${next.past.length} future=${next.future.length}`);
      return next;
    });
  }, []);

  const chooseTerrain = (tile: TileOption) => {
    setSelectedTile(tile.id);
    setActiveTool("Paint");
  };

  const chooseLayer = (layerId: string) => commit(setActiveLayer(documentRef.current, layerId));
  const toggleLayerVisibility = (layerId: string) => commit(updateLayer(documentRef.current, layerId, {
    visible: !documentRef.current.layers.find(layer => layer.id === layerId)?.visible,
  }));
  const toggleLayerLock = (layerId: string) => commit(updateLayer(documentRef.current, layerId, {
    locked: !documentRef.current.layers.find(layer => layer.id === layerId)?.locked,
  }));
  const setLayerOpacity = (layerId: string, opacity: number) => commit(updateLayer(documentRef.current, layerId, {
    opacity: Math.max(0, Math.min(1, opacity)),
  }));
  const moveLayer = (layerId: string, direction: "up" | "down") => commit(reorderLayer(documentRef.current, layerId, direction));
  const handleDuplicateLayer = (layerId: string) => commit(duplicateLayer(documentRef.current, layerId));
  const handleMergeLayer = (sourceLayerId: string) => {
    const target = documentRef.current.layers.find(layer => layer.id !== sourceLayerId && layer.kind === documentRef.current.layers.find(candidate => candidate.id === sourceLayerId)?.kind);
    if (target) commit(mergeLayers(documentRef.current, target.id, sourceLayerId));
  };

  const selectTool = (tool: string) => setActiveTool(tool);
  const cycleLayerIsolation = () => {
    const layers = document.layers;
    if (!layers.length) return;
    if (!isolatedLayerId) {
      setIsolatedLayerId(layers[0].id);
      return;
    }
    const currentIndex = layers.findIndex(layer => layer.id === isolatedLayerId);
    setIsolatedLayerId(currentIndex < 0 || currentIndex === layers.length - 1 ? null : layers[currentIndex + 1].id);
  };
  const isolatedLayerLabel = isolatedLayerId ? (document.layers.find(layer => layer.id === isolatedLayerId)?.name ?? isolatedLayerId) : "All layers";
  const hasDebugOverlay = debugViews.grid || debugViews.terrainId || debugViews.waterDepth || debugViews.collision || debugViews.objectBounds || debugViews.invalidCells;

  return (
    <main className="map-editor-shell" style={{ width: "100%", height: "100%", display: "grid", gridTemplateRows: "auto 1fr", background: "var(--map-editor-bg)", color: "var(--map-editor-text)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, borderBottom: "1px solid var(--map-editor-line)", background: "var(--map-editor-panel)", flexWrap: "wrap" }}>
        <strong style={{ marginRight: 8 }}>World Map</strong>
        {TOOLS.map(tool => (
          <button key={tool} type="button" onClick={() => selectTool(tool)} aria-pressed={activeTool === tool}
            style={{ padding: "6px 9px", borderRadius: 6, border: "1px solid var(--map-editor-border)", background: activeTool === tool ? "var(--map-editor-selected)" : "var(--map-editor-button)", color: "#fff" }}>
            {tool}
          </button>
        ))}
        <span aria-hidden="true" style={{ width: 1, height: 22, background: "var(--map-editor-line)", margin: "0 2px" }} />
        <button type="button" onClick={handleUndo} disabled={!history.past.length || busy}
          aria-label="Undo" title="Undo (Ctrl/Cmd+Z)" style={{ padding: "6px 9px" }}>↶ Undo</button>
        <button type="button" onClick={handleRedo} disabled={!history.future.length || busy}
          aria-label="Redo" title="Redo (Ctrl/Cmd+Y)" style={{ padding: "6px 9px" }}>↷ Redo</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "grid"))} aria-pressed={debugViews.grid}
          aria-label="Grid overlay" title="Toggle grid overlay" style={{ padding: "6px 9px" }}>{debugViews.grid ? "Grid ✓" : "Grid"}</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "terrainId"))} aria-pressed={debugViews.terrainId}
          aria-label="Terrain ID view" title="Toggle terrain ID view" style={{ padding: "6px 9px" }}>{debugViews.terrainId ? "Terrain ID ✓" : "Terrain ID"}</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "waterDepth"))} aria-pressed={debugViews.waterDepth}
          aria-label="Water depth view" title="Toggle water depth view" style={{ padding: "6px 9px" }}>{debugViews.waterDepth ? "Depth ✓" : "Depth"}</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "collision"))} aria-pressed={debugViews.collision}
          aria-label="Collision passability view" title="Toggle collision/passability view" style={{ padding: "6px 9px" }}>{debugViews.collision ? "Collision ✓" : "Collision"}</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "objectBounds"))} aria-pressed={debugViews.objectBounds}
          aria-label="Object bounds view" title="Toggle object bounds view" style={{ padding: "6px 9px" }}>{debugViews.objectBounds ? "Bounds ✓" : "Bounds"}</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "invalidCells"))} aria-pressed={debugViews.invalidCells}
          aria-label="Invalid cell highlight" title="Toggle invalid-cell highlight" style={{ padding: "6px 9px" }}>{debugViews.invalidCells ? "Invalid ✓" : "Invalid"}</button>
        <button type="button" onClick={() => setDebugViews(current => toggleDebugView(current, "readOnly"))} aria-pressed={debugViews.readOnly}
          aria-label="Read-only debug mode" title="Disable map editing input" style={{ padding: "6px 9px" }}>{debugViews.readOnly ? "Read-only ✓" : "Read-only"}</button>
        <button type="button" onClick={cycleLayerIsolation} aria-pressed={isolatedLayerId !== null}
          aria-label="Layer isolation" title="Cycle layer isolation" style={{ padding: "6px 9px" }}>{isolatedLayerId ? "Layer: " + isolatedLayerLabel : "Layer Iso"}</button>
        <button type="button" onClick={() => void onSave?.(documentRef.current)} disabled={busy} aria-busy={busy} style={{ marginLeft: "auto", padding: "6px 10px" }}>Save</button>
        <button type="button" onClick={() => void onSaveLoad?.()} disabled={busy} aria-busy={busy} style={{ padding: "6px 10px" }}>Save / Load</button>
        <button type="button" onClick={() => void onLoadLatest?.()} disabled={busy} aria-busy={busy} style={{ padding: "6px 10px" }}>Load Latest</button>
      </header>

      <div className="map-editor-body" style={{ minHeight: 0, display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 0 }}>
        <aside className="map-editor-palette" style={{ overflow: "auto", borderRight: "1px solid var(--map-editor-line)", background: "var(--map-editor-panel)", padding: 10 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>PAINT / TERRAIN · {tileOptions.filter(tile => !["water", "brackish", "deepwater2", "deepwater"].includes(tile.terrain)).length} BASIC</div>
          <div role="status" aria-live="polite" style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{terrainStatus}</div>
          <div role="status" aria-live="polite" style={{ fontSize: 11, lineHeight: 1.35, color: "#fbbf24", marginBottom: 10, overflowWrap: "anywhere" }}>{paintDiagnostic}</div>
          {hasDebugOverlay && <div role="note" aria-label="Diagnostic legend" style={{ marginBottom: 10, padding: 8, border: "1px solid var(--map-editor-border)", borderRadius: 7, fontSize: 10, lineHeight: 1.45, color: "#cbd5e1" }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Diagnostic Legend</strong>
            {debugViews.grid && <div>Grid · cell boundaries</div>}
            {debugViews.terrainId && <div>Terrain ID · semantic tile key</div>}
            {debugViews.waterDepth && <div>Depth · D1 water → D4 deepwater</div>}
            {debugViews.collision && <div>Collision · red blocked / green open</div>}
            {debugViews.objectBounds && <div>Bounds · orange object footprint</div>}
            {debugViews.invalidCells && <div>Invalid · red unknown ground tile</div>}
            {debugViews.readOnly && <div>Read-only · map input disabled</div>}
          </div>}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>LAYERS</div>
            <div role="tree" aria-label="Map layers" style={{ display: "grid", gap: 5 }}>
              {document.layers.map((layer, index) => (
                <div key={layer.id} role="treeitem" aria-selected={layer.active}
                  style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px auto auto auto auto", alignItems: "center", gap: 4, padding: 5, borderRadius: 6, border: "1px solid var(--map-editor-border)", background: layer.active ? "var(--map-editor-selected)" : "var(--map-editor-button)" }}>
                  <button type="button" onClick={() => chooseLayer(layer.id)} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: 0, background: "transparent", color: "#fff", textAlign: "left", cursor: "pointer" }} title={layer.name}>
                    {layer.name}
                  </button>
                  <button type="button" onClick={() => toggleLayerVisibility(layer.id)} aria-label={(layer.visible ? "Hide " : "Show ") + layer.name} title={layer.visible ? "Hide layer" : "Show layer"} style={{ padding: "2px 5px" }}>{layer.visible ? "◉" : "○"}</button>
                  <button type="button" onClick={() => toggleLayerLock(layer.id)} aria-label={(layer.locked ? "Unlock " : "Lock ") + layer.name} title={layer.locked ? "Unlock layer" : "Lock layer"} style={{ padding: "2px 5px" }}>{layer.locked ? "🔒" : "🔓"}</button>
                  <input type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={event => setLayerOpacity(layer.id, Number(event.target.value))} aria-label={"Opacity " + layer.name} title={"Opacity " + Math.round(layer.opacity * 100) + "%"} style={{ width: 76 }} />
                  <button type="button" onClick={() => handleDuplicateLayer(layer.id)} aria-label={"Duplicate " + layer.name} title="Duplicate layer" style={{ padding: "2px 5px" }}>⧉</button>
                  <button type="button" onClick={() => handleMergeLayer(layer.id)} disabled={!document.layers.some(other => other.id !== layer.id && other.kind === layer.kind)} aria-label={"Merge " + layer.name} title="Merge into adjacent same-kind layer" style={{ padding: "2px 5px" }}>⊕</button>
                  <button type="button" onClick={() => moveLayer(layer.id, "up")} disabled={index === 0} aria-label={"Move " + layer.name + " up"} title="Move up" style={{ padding: "2px 5px" }}>↑</button>
                  <button type="button" onClick={() => moveLayer(layer.id, "down")} disabled={index === document.layers.length - 1} aria-label={"Move " + layer.name + " down"} title="Move down" style={{ padding: "2px 5px" }}>↓</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {tileOptions.filter(tile => !["water", "brackish", "deepwater2", "deepwater"].includes(tile.terrain)).map(tile => (
              <button key={tile.id} type="button" onClick={() => chooseTerrain(tile)} aria-pressed={selectedTile === tile.id}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, textAlign: "left", borderRadius: 7, border: "1px solid var(--map-editor-border)", background: selectedTile === tile.id ? "var(--map-editor-terrain-selected)" : "var(--map-editor-button)", color: "#fff" }}>
                <span style={{ width: 28, height: 28, borderRadius: 4, background: ({
                  grass: "#4f9d50", grassalt: "#6fae58",
                  sand: "#e6c36a", redsand: "#c9784f",
                  dirt: "#98633e", dirt2: "#7f5135",
                  pavement: "#8b949e", water: "#3b82c4",
                  deepwater: "#24527a", deepwater2: "#1d4162",
                  brackish: "#397b78", tallgrass: "#3f873f",
                  hole: "#3f3028", holek: "#4a372e", holemid: "#554238",
                  lava: "#c4472d", lavarock: "#5b4542",
                } as Record<string, string>)[tile.terrain] ?? "#8b949e" }} />
                <span>{tile.label}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: "#94a3b8" }}>Brush presets</div>
          <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
            {BRUSH_PRESETS.map(preset => (
              <button key={preset.name} type="button" onClick={() => { setBrushPreset(preset.name); setBrushSize(preset.size); }} aria-label={"Brush preset " + preset.name} aria-pressed={brushPreset === preset.name}
                style={{ flex: 1, padding: "6px 2px", borderRadius: 5, border: "1px solid var(--map-editor-border)", background: brushPreset === preset.name ? "var(--map-editor-selected)" : "var(--map-editor-button)", color: "#fff" }}>
                {preset.name}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8" }}>
            Tools: Paint · Erase · Line · Rectangle · Flood · Eyedropper<br />            Selection: Ctrl/Cmd+C · Ctrl/Cmd+V · Shift+Ctrl/Cmd+R · Alt+Arrow · Esc<br />
            Undo/Redo: Ctrl/Cmd+Z · Ctrl/Cmd+Y<br />
            World: {document.width}×{document.height}<br />
            Active layer: {activeLayer}<br />
            Selected: {tileOptions.find(tile => tile.id === selectedTile)?.label ?? "—"}
          </div>
        </aside>

        <section className="map-editor-canvas" style={{ minWidth: 0, minHeight: 0, position: "relative" }}>
          <PixiMapCanvas
            document={document}
            activeTool={activeTool}
            activeLayerId={terrainLayer}
            selectedTileId={activeTool === "Erase" ? null : selectedTile}
            brushSize={brushSize}
            selection={selection}
            onPaint={handlePaint}
            onSelectionChange={setSelection}
            onCellInspect={() => {}}
            onTerrainPick={(tileId) => {
              const picked = tileOptions.find(tile => tile.id === tileId);
              if (!picked || ["water", "brackish", "deepwater2", "deepwater"].includes(picked.terrain)) {
                setPaintDiagnostic(`eyedropper: ${picked?.terrain ?? tileId} tidak dapat dipilih (water adalah derived)`);
                return;
              }
              setSelectedTile(picked.id);
              setActiveTool("Paint");
              setPaintDiagnostic(`eyedropper: picked=${picked.terrain} tile=${picked.id}`);
            }}
            onInputDiagnostic={setPaintDiagnostic}
            onStamp={() => {}}
            onObjectPlace={() => {}}
            onObjectMove={() => {}}
            selectedObjectId={null}
            selectedObjectIds={selectedObjectIds}
            onObjectSelectionChange={setSelectedObjectIds}
            terrainBindings={terrainBindings}
            environmentRuntime={null}
            viewportResetKey={initialDocumentRevision}
            showGrid={debugViews.grid}
            debugViews={debugViews}
            layerIsolationId={isolatedLayerId}
            readonly={debugViews.readOnly}
          />
        </section>
      </div>
    </main>
  );
}







