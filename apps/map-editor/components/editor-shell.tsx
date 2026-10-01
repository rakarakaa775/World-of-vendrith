"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PixiMapCanvas } from "./pixi-map-canvas";
import { createMap, type MapDocument } from "../editor/map-document";
import { loadTerrainTiles, STARTER_TILES, type TileOption } from "../editor/tile-palette";
import { applyTerrainPaint, eraseTerrainPaint } from "../editor/terrain-paint";
import { createHistory, commitHistory, undoHistory, redoHistory, type MapHistory } from "../editor/map-history";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import type { Selection } from "../editor/selection";
import type { GridPoint } from "../editor/grid";
import type { EnvironmentRuntimeValidation } from "../editor/environment-runtime-validation";

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

const TOOLS = ["Select", "Paint", "Erase", "Line", "Rectangle", "Flood"] as const;
const BRUSH_SIZES = [1, 2, 3, 5];

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
  const [paintDiagnostic, setPaintDiagnostic] = useState("Paint diagnostic: waiting for input");
  const [history, setHistory] = useState<MapHistory>(() => createHistory(initialDocument));
  const document = history.present;
  // Keep the latest editor-owned document available to toolbar handlers even while
  // the parent mirror is catching up. Save/Load must operate on EditorShell state.
  const documentRef = useRef<MapDocument>(document);
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadTerrainTiles().then(tiles => {
      if (cancelled) return;
      setTileOptions(tiles);
      const visibleTiles = tiles.filter(tile => tile.terrain !== "deepwater");
      setSelectedTile(current => visibleTiles.some(tile => tile.id === current) ? current : visibleTiles[0]?.id ?? current);
    });
    return () => { cancelled = true; };
  }, []);

  const commit = useCallback((next: MapDocument) => {
    if (next === document) return;
    // Update the save source synchronously with the edit. The effect below is
    // still kept for normal synchronization, but Save must never observe the
    // previous history.present during the tiny render/effect gap after Paint.
    documentRef.current = next;
    setHistory(current => commitHistory(current, next));
  }, [document]);

  const handlePaint = useCallback((points: GridPoint[], tileId: string | null) => {
    const result = tileId === null
      ? eraseTerrainPaint(document, terrainLayer, points, terrainBindings)
      : applyTerrainPaint(document, terrainLayer, points, tileId, terrainBindings);
    const changed = result.document !== document;
    const changedTile = result.document.layers.find(layer => layer.id === terrainLayer)?.cells[points[0] ? points[0].y * document.width + points[0].x : -1]?.tileId ?? null;
    setPaintDiagnostic(
      `apply: layer=${terrainLayer} requested=${points.length} affected=${result.affected.length} changed=${changed ? "YES" : "NO"} tile=${changedTile ?? "null"} validation=${result.validation.length}`,
    );
    commit(result.document);
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

  const selectTool = (tool: string) => setActiveTool(tool);

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
        <button type="button" onClick={() => void onSave?.(documentRef.current)} disabled={busy} aria-busy={busy} style={{ marginLeft: "auto", padding: "6px 10px" }}>Save</button>
        <button type="button" onClick={() => void onSaveLoad?.()} disabled={busy} aria-busy={busy} style={{ padding: "6px 10px" }}>Save / Load</button>
        <button type="button" onClick={() => void onLoadLatest?.()} disabled={busy} aria-busy={busy} style={{ padding: "6px 10px" }}>Load Latest</button>
      </header>

      <div className="map-editor-body" style={{ minHeight: 0, display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 0 }}>
        <aside className="map-editor-palette" style={{ overflow: "auto", borderRight: "1px solid var(--map-editor-line)", background: "var(--map-editor-panel)", padding: 10 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>PAINT / TERRAIN · {tileOptions.filter(tile => tile.terrain !== "deepwater").length} BASIC</div>
          <div role="status" aria-live="polite" style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>{terrainStatus}</div>
          <div role="status" aria-live="polite" style={{ fontSize: 11, lineHeight: 1.35, color: "#fbbf24", marginBottom: 10, overflowWrap: "anywhere" }}>{paintDiagnostic}</div>

          <div style={{ display: "grid", gap: 6 }}>
            {tileOptions.filter(tile => tile.terrain !== "deepwater").map(tile => (
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

          <div style={{ marginTop: 14, fontSize: 12, color: "#94a3b8" }}>Brush size</div>
          <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
            {BRUSH_SIZES.map(size => (
              <button key={size} type="button" onClick={() => setBrushSize(size)} aria-label={"Brush size " + size} aria-pressed={brushSize === size}
                style={{ flex: 1, padding: "6px 2px", borderRadius: 5, border: "1px solid var(--map-editor-border)", background: brushSize === size ? "var(--map-editor-selected)" : "var(--map-editor-button)", color: "#fff" }}>
                {size}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8" }}>
            Tools: Paint · Erase · Line · Rectangle · Flood<br />
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
            selection={null as Selection | null}
            onPaint={handlePaint}
            onSelectionChange={() => {}}
            onCellInspect={() => {}}
            onInputDiagnostic={setPaintDiagnostic}
            onStamp={() => {}}
            onObjectPlace={() => {}}
            onObjectMove={() => {}}
            selectedObjectId={null}
            selectedObjectIds={[]}
            onObjectSelectionChange={() => {}}
            terrainBindings={terrainBindings}
            environmentRuntime={null}
            viewportResetKey={initialDocumentRevision}
            showGrid
          />
        </section>
      </div>
    </main>
  );
}
