"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PixiMapCanvas } from "./pixi-map-canvas";
import { createMap, MAP_SIZES, resizeMapDocument, type MapDocument } from "../editor/map-document";
import { loadTerrainTiles, STARTER_TILES, isPaintableTerrainTile, type TileOption } from "../editor/tile-palette";
import { applyTerrainPaint, eraseTerrainPaint } from "../editor/terrain-paint";
import { commitMapEditorStateHistory, continueMapEditorStateGestureHistory, createMapEditorStateHistory, redoMapEditorStateHistory, resetMapEditorStateHistory, undoMapEditorStateHistory, type MapEditorStateHistory } from "../editor/map-editor-state-history-v2";
import { parseMapEditorState, replaceMapEditorDocument, type MapEditorState } from "../editor/map-editor-state-v2";
import { serializeMapDocument } from "../editor/map-serialization";
import { setActiveLayer, updateLayer, reorderLayer, duplicateLayer, mergeLayers, createLayerGroup, updateLayerGroup, assignLayerToGroup, deleteLayerGroup, createLayerTemplate, applyLayerTemplate, deleteLayerTemplate } from "../editor/layer-state";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import type { Selection } from "../editor/selection";
import { copySelection, pasteSelection, moveSelection, replaceSelection, type SelectionClipboard } from "../editor/selection-clipboard";
import type { GridPoint } from "../editor/grid";
import type { EnvironmentRuntimeValidation } from "../editor/environment-runtime-validation";
import { DEFAULT_DEBUG_VIEW_STATE, toggleDebugView } from "../editor/debug-views";
import { deleteObject, duplicateObjects, placePaletteAsset, scatterPaletteAssets, updateObjectTransform, updateObjectsTransform, type PaletteAssetPlacement } from "../editor/object-state";
import { getMapAssetsForLevel, MAP_ASSET_CATALOG, type MapAssetDefinition } from "../editor/map-tool-registry";

type Props = {
  initialDocument?: MapDocument;
  initialDocumentRevision?: number;
  /** Optional canonical combined state supplied by Save/Load; legacy callers remain supported. */
  initialEditorState?: MapEditorState;
  onEditorStateChange?: (state: MapEditorState) => void;
  onDocumentChange?: (document: MapDocument) => void;
  onSave?: (document: MapDocument) => void | Promise<void>;
  onSaveLoad?: () => void | Promise<void>;
  onQuickSave?: (document: MapDocument) => void | Promise<void>;
  onLoadLatest?: () => void | Promise<void>;
  busy?: boolean;
  terrainBindings?: TerrainAssetBindingMap;
  terrainStatus?: string;
  environmentValidation?: EnvironmentRuntimeValidation | null;
  /** Read-only, license-verified physical assets loaded from the approved registry. */
  assetCatalog?: MapAssetDefinition[];
};

const TOOLS = ["Select", "Paint", "Erase", "Line", "Rectangle", "Flood", "Eyedropper", "Building"] as const;
const OBJECT_PALETTE: PaletteAssetPlacement[] = [
  { id: "tree-oak", label: "Oak Tree", family: "playable-nature" },
  { id: "rock-small", label: "Small Rock", family: "playable-nature" },
  { id: "flower-wild", label: "Wild Flowers", family: "playable-nature" },
  { id: "house-small", label: "Small House", family: "region-building" },
  { id: "poi-marker", label: "Point of Interest", family: "region-poi" },
];
const BRUSH_PRESETS = [
  { name: "Fine", size: 1 },
  { name: "Medium", size: 3 },
  { name: "Large", size: 5 },
  { name: "XL", size: 7 },
] as const;

export function EditorShell({
  initialDocument = createMap("world"),
  initialDocumentRevision = 0,
  initialEditorState,
  onEditorStateChange,
  onDocumentChange,
  onSave,
  onSaveLoad,
  onQuickSave,
  onLoadLatest,
  busy = false,
  terrainBindings = {},
  terrainStatus = "Terrain runtime unavailable",
  assetCatalog = [],
}: Props) {
  const [activeTool, setActiveTool] = useState<string>("Select");
  const [tileOptions, setTileOptions] = useState<TileOption[]>(STARTER_TILES);
  const [selectedTile, setSelectedTile] = useState<string>(STARTER_TILES.find(tile => tile.terrain !== "deepwater")?.id ?? STARTER_TILES[0].id);
  const [selectedObjectAssetId, setSelectedObjectAssetId] = useState(OBJECT_PALETTE[0].id);
  const [scatterCount, setScatterCount] = useState(20);
  const [scatterSeed, setScatterSeed] = useState("vendrith-forest-01");
  const [scatterDistance, setScatterDistance] = useState(2);
  const [brushSize, setBrushSize] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [selectionClipboard, setSelectionClipboard] = useState<SelectionClipboard | null>(null);
  const [brushPreset, setBrushPreset] = useState("Fine");
  const [debugViews, setDebugViews] = useState(DEFAULT_DEBUG_VIEW_STATE);
  const [isolatedLayerId, setIsolatedLayerId] = useState<string | null>(null);
  const [paintDiagnostic, setPaintDiagnostic] = useState("Paint diagnostic: waiting for input");
  const [history, setHistory] = useState<MapEditorStateHistory>(() => createMapEditorStateHistory(initialEditorState ?? parseMapEditorState(serializeMapDocument(initialDocument))));
  const document = history.present.document;
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
  const objectPalette = useMemo<PaletteAssetPlacement[]>(() => {
    const catalog = assetCatalog.length ? assetCatalog : MAP_ASSET_CATALOG;
    return getMapAssetsForLevel(document, catalog)
      .filter(asset => asset.family !== "macro-terrain")
      .map(asset => ({ id: asset.id, label: asset.label, family: asset.family, registryId: asset.registryId, previewUrl: asset.previewUrl }));
  }, [assetCatalog, document.mapType, document.playableSpace]);
  const isWorldMap = document.mapType === "world";
  const isRegionMap = document.mapType === "region";
  const availableTools = isWorldMap
    ? TOOLS.filter(tool => tool !== "Building")
    : isRegionMap
      ? (["Select", "Building"] as const)
      : TOOLS;
  useEffect(() => {
    if (!availableTools.includes(activeTool as never)) setActiveTool(availableTools[0]);
  }, [activeTool, availableTools]);

  useEffect(() => {
    if (objectPalette.length && !objectPalette.some(asset => asset.id === selectedObjectAssetId)) {
      setSelectedObjectAssetId(objectPalette[0].id);
    }
  }, [objectPalette, selectedObjectAssetId]);

  useEffect(() => {
    setHistory(resetMapEditorStateHistory(initialEditorState ?? parseMapEditorState(serializeMapDocument(initialDocument))));
  }, [initialDocument.id, initialDocumentRevision]);

  useEffect(() => {
    onDocumentChange?.(document);
    onEditorStateChange?.(history.present);
  }, [document, history.present, onDocumentChange, onEditorStateChange]);

  const commit = useCallback((next: MapDocument) => {
    if (next === document) return;
    // Update the save source synchronously with the edit. The effect below is
    // still kept for normal synchronization, but Save must never observe the
    // previous history.present during the tiny render/effect gap after Paint.
    documentRef.current = next;
    setHistory(current => commitMapEditorStateHistory(current, replaceMapEditorDocument(current.present, next)));
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
        setHistory(current => event.shiftKey ? redoMapEditorStateHistory(current) : undoMapEditorStateHistory(current));
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        setHistory(current => redoMapEditorStateHistory(current));
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
      const visibleTiles = tiles.filter(isPaintableTerrainTile);
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
      setHistory(current => current.present.document === result.document
        ? current
        : continueMapEditorStateGestureHistory(current, replaceMapEditorDocument(current.present, result.document)));
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
      const next = undoMapEditorStateHistory(current);
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
      const next = redoMapEditorStateHistory(current);
      setPaintDiagnostic(`history: REDO applied · past=${next.past.length} future=${next.future.length}`);
      return next;
    });
  }, []);

  const chooseTerrain = (tile: TileOption) => {
    setSelectedTile(tile.id);
    setActiveTool("Paint");
  };

  const activeObjectLayer = document.layers.find(layer => layer.id === activeLayer && layer.kind === "objects")
    ?? document.layers.find(layer => layer.kind === "objects");
  const selectedObjectAsset = objectPalette.find(asset => asset.id === selectedObjectAssetId) ?? objectPalette[0] ?? OBJECT_PALETTE[0];
  const handleObjectPlace = useCallback((point: GridPoint) => {
    const current = documentRef.current;
    const target = current.layers.find(layer => layer.id === activeLayer && layer.kind === "objects")
      ?? current.layers.find(layer => layer.kind === "objects");
    if (!target) {
      setPaintDiagnostic("object placement: no object layer exists");
      return;
    }
    const next = placePaletteAsset(current, target.id, point, selectedObjectAsset);
    if (next === current) {
      setPaintDiagnostic(`object placement blocked: layer=${target.id} cell=${point.x}:${point.y} (occupied, hidden, locked, or out of bounds)`);
      return;
    }
    commit(next);
    setSelectedObjectIds([next.layers.find(layer => layer.id === target.id)!.objects.at(-1)!.id]);
    setPaintDiagnostic(`object placed: ${selectedObjectAsset.label} @ ${point.x}:${point.y}`);
  }, [activeLayer, selectedObjectAsset, commit]);

  const handleAssetDrop = useCallback((point: GridPoint, assetId: string) => {
    const asset = objectPalette.find(candidate => candidate.id === assetId);
    if (!asset) {
      setPaintDiagnostic(`asset drop rejected: unknown asset id=${assetId}`);
      return;
    }
    const current = documentRef.current;
    const target = current.layers.find(layer => layer.id === activeLayer && layer.kind === "objects")
      ?? current.layers.find(layer => layer.kind === "objects");
    if (!target) {
      setPaintDiagnostic("asset drop blocked: no object layer exists");
      return;
    }
    const next = placePaletteAsset(current, target.id, point, asset);
    if (next === current) {
      setPaintDiagnostic(`asset drop blocked: ${asset.label} @ ${point.x}:${point.y} (occupied, hidden, locked, or out of bounds)`);
      return;
    }
    commit(next);
    setSelectedObjectAssetId(asset.id);
    setSelectedObjectIds([next.layers.find(layer => layer.id === target.id)!.objects.at(-1)!.id]);
    setPaintDiagnostic(`asset dropped: ${asset.label} @ ${point.x}:${point.y}`);
  }, [activeLayer, commit, objectPalette]);

  const handleScatterObjects = () => {
    const current = documentRef.current;
    const target = current.layers.find(layer => layer.id === activeLayer && layer.kind === "objects")
      ?? current.layers.find(layer => layer.kind === "objects");
    if (!target) {
      setPaintDiagnostic("scatter blocked: no object layer exists");
      return;
    }
    const before = target.objects.length;
    const next = scatterPaletteAssets(current, target.id, selectedObjectAsset, {
      count: scatterCount,
      seed: scatterSeed,
      minDistance: scatterDistance,
    });
    const placed = (next.layers.find(layer => layer.id === target.id)?.objects.length ?? before) - before;
    if (next === current) {
      setPaintDiagnostic("scatter blocked: check count, seed, map dimensions, and layer visibility/lock");
      return;
    }
    commit(next);
    setPaintDiagnostic(`scatter: ${placed}/${scatterCount} ${selectedObjectAsset.label} placed · seed=${scatterSeed}`);
  };
  const selectedObjectLayer = document.layers.find(layer => layer.kind === "objects" && layer.id === (activeObjectLayer?.id ?? "objects"));
  const selectedObject = selectedObjectLayer?.objects.find(object => selectedObjectIds.includes(object.id)) ?? null;
  const handleSelectedObjectTransform = (changes: { x?: number; y?: number; width?: number; height?: number; rotation?: number }) => {
    if (!selectedObjectLayer || !selectedObject) return;
    const current = documentRef.current;
    const next = selectedObjectIds.length > 1
      ? updateObjectsTransform(current, selectedObjectLayer.id, selectedObjectIds, selectedObject.id, changes)
      : updateObjectTransform(current, selectedObjectLayer.id, selectedObject.id, changes);
    if (next === current) {
      setPaintDiagnostic("object transform rejected: selection would overlap, exceed map bounds, or resize multiple objects");
      return;
    }
    commit(next);
    setPaintDiagnostic(`object transform: ${selectedObjectIds.length > 1 ? selectedObjectIds.length + " objects" : selectedObject.id} updated`);
  };
  const handleDeleteSelectedObjects = () => {
    if (!selectedObjectLayer || !selectedObjectIds.length) return;
    const next = selectedObjectIds.reduce((current, id) => deleteObject(current, selectedObjectLayer.id, id), documentRef.current);
    commit(next);
    setSelectedObjectIds([]);
    setPaintDiagnostic(`objects deleted: ${selectedObjectIds.length}`);
  };

  const handleDuplicateSelectedObjects = () => {
    if (!selectedObjectLayer || !selectedObjectIds.length) return;
    const current = documentRef.current;
    const next = duplicateObjects(current, selectedObjectLayer.id, selectedObjectIds);
    if (next === current) {
      setPaintDiagnostic("duplicate rejected: no safe space to the right of the selected objects");
      return;
    }
    const currentIds = new Set(selectedObjectLayer.objects.map(object => object.id));
    const copies = next.layers.find(layer => layer.id === selectedObjectLayer.id)?.objects
      .filter(object => !currentIds.has(object.id)).map(object => object.id) ?? [];
    commit(next);
    setSelectedObjectIds(copies);
    setPaintDiagnostic(`objects duplicated: ${copies.length}`);
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
  const handleCreateGroup = () => commit(createLayerGroup(documentRef.current));
  const handleToggleGroup = (groupId: string) => {
    const group = documentRef.current.layerGroups.find(item => item.id === groupId);
    if (group) commit(updateLayerGroup(documentRef.current, groupId, { expanded: !group.expanded }));
  };
  const handleToggleGroupVisibility = (groupId: string) => {
    const group = documentRef.current.layerGroups.find(item => item.id === groupId);
    if (group) commit(updateLayerGroup(documentRef.current, groupId, { visible: !group.visible }));
  };
  const handleToggleGroupLock = (groupId: string) => {
    const group = documentRef.current.layerGroups.find(item => item.id === groupId);
    if (group) commit(updateLayerGroup(documentRef.current, groupId, { locked: !group.locked }));
  };
  const handleDeleteGroup = (groupId: string) => commit(deleteLayerGroup(documentRef.current, groupId));
  const handleAssignGroup = (layerId: string, groupId: string | null) => commit(assignLayerToGroup(documentRef.current, layerId, groupId));
  const handleCreateTemplate = (layerId: string) => commit(createLayerTemplate(documentRef.current, layerId));
  const handleApplyTemplate = (templateId: string) => commit(applyLayerTemplate(documentRef.current, templateId));
  const handleDeleteTemplate = (templateId: string) => commit(deleteLayerTemplate(documentRef.current, templateId));
  const handleMergeLayer = (sourceLayerId: string) => {
    const target = documentRef.current.layers.find(layer => layer.id !== sourceLayerId && layer.kind === documentRef.current.layers.find(candidate => candidate.id === sourceLayerId)?.kind);
    if (target) commit(mergeLayers(documentRef.current, target.id, sourceLayerId));
  };

  const selectTool = (tool: string) => setActiveTool(tool);
  const handleCanvasSizeChange = (value: string) => {
    const size = Number(value);
    if (!(MAP_SIZES as readonly number[]).includes(size)) return;
    const current = documentRef.current;
    if (current.width === size && current.height === size) return;
    const shrinking = size < current.width || size < current.height;
    const hasContentOutside = shrinking && current.layers.some(layer => {
      for (let y = 0; y < current.height; y += 1) {
        for (let x = 0; x < current.width; x += 1) {
          if (x < size && y < size) continue;
          const cell = layer.cells[y * current.width + x];
          if (cell?.tileId && !(current.mapType === "world" && cell.tileId === "deepwater")) return true;
        }
      }
      return layer.objects.some(object => object.x + object.width > size || object.y + object.height > size);
    });
    if (hasContentOutside && typeof window !== "undefined" &&
        !window.confirm(`Changing to ${size} × ${size} will remove content outside the new canvas. Continue?`)) return;
    const next = resizeMapDocument(current, size, size);
    commit(next);
    setSelection(null);
    setSelectedObjectIds([]);
    setPaintDiagnostic(`canvas resized: ${size} × ${size}`);
  };
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
        <strong style={{ marginRight: 8 }}>{document.name || "Map"}</strong>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          Canvas
          <select
            aria-label="Canvas size"
            value={MAP_SIZES.includes(document.width as typeof MAP_SIZES[number]) && document.width === document.height ? String(document.width) : "custom"}
            onChange={event => handleCanvasSizeChange(event.target.value)}
            disabled={busy}
            style={{ padding: "5px 7px", borderRadius: 6, border: "1px solid var(--map-editor-border)", background: "var(--map-editor-button)", color: "inherit" }}
          >
            {!MAP_SIZES.includes(document.width as typeof MAP_SIZES[number]) || document.width !== document.height
              ? <option value="custom">{document.width} × {document.height} (custom)</option>
              : null}
            {MAP_SIZES.map(size => <option key={size} value={String(size)}>{size} × {size}</option>)}
          </select>
        </label>
        {availableTools.map(tool => (
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
          {!isRegionMap && <>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{isWorldMap ? "WORLD TERRAIN PAINT" : "PLAYABLE TERRAIN / GROUND"} · {tileOptions.filter(isPaintableTerrainTile).length} BASIC</div>
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

          </>}
          {isRegionMap && <div role="note" style={{ padding: 8, marginBottom: 12, border: "1px solid var(--map-editor-border)", borderRadius: 6, fontSize: 11, color: "#cbd5e1" }}>REGION MODE · place region symbols and landmarks. Terrain painting belongs to World; detailed construction belongs to Playable.</div>}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>LAYERS</div>
            <div role="tree" aria-label="Map layers" style={{ display: "grid", gap: 5 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                <button type="button" onClick={handleCreateGroup} title="Create layer group">+ Group</button>
              </div>
              {document.layerGroups.map(group => (
                <div key={group.id} role="treeitem" aria-expanded={group.expanded} style={{ border: "1px solid var(--map-editor-border)", borderRadius: 6, padding: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button type="button" onClick={() => handleToggleGroup(group.id)} aria-label={(group.expanded ? "Collapse " : "Expand ") + group.name}>{group.expanded ? "▾" : "▸"}</button>
                    <strong style={{ flex: 1 }}>{group.name}</strong>
                    <button type="button" onClick={() => handleToggleGroupVisibility(group.id)} aria-label={(group.visible ? "Hide " : "Show ") + group.name}>{group.visible ? "◉" : "○"}</button>
                    <button type="button" onClick={() => handleToggleGroupLock(group.id)} aria-label={(group.locked ? "Unlock " : "Lock ") + group.name}>{group.locked ? "🔒" : "🔓"}</button>
                    <button type="button" onClick={() => handleDeleteGroup(group.id)} aria-label={"Delete " + group.name}>×</button>
                  </div>
                  {group.expanded && document.layers.filter(layer => layer.groupId === group.id).map(layer => (
                    <button type="button" onClick={() => chooseLayer(layer.id)} style={{ marginLeft: 16, fontSize: 12, paddingTop: 3, border: 0, background: "transparent", color: "#fff", cursor: "pointer" }}>↳ {layer.name}</button>
                  ))}
                </div>
              ))}

              {document.layers.filter(layer => !layer.groupId).map((layer, index) => (
                <div key={layer.id} role="treeitem" aria-selected={layer.active}
                  style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px auto auto auto auto", alignItems: "center", gap: 4, padding: 5, borderRadius: 6, border: "1px solid var(--map-editor-border)", background: layer.active ? "var(--map-editor-selected)" : "var(--map-editor-button)" }}>
                  <button type="button" onClick={() => chooseLayer(layer.id)} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: 0, background: "transparent", color: "#fff", textAlign: "left", cursor: "pointer" }} title={layer.name}>
                    {layer.name}
                  </button>
                  <button type="button" onClick={() => toggleLayerVisibility(layer.id)} aria-label={(layer.visible ? "Hide " : "Show ") + layer.name} title={layer.visible ? "Hide layer" : "Show layer"} style={{ padding: "2px 5px" }}>{layer.visible ? "◉" : "○"}</button>
                  <button type="button" onClick={() => toggleLayerLock(layer.id)} aria-label={(layer.locked ? "Unlock " : "Lock ") + layer.name} title={layer.locked ? "Unlock layer" : "Lock layer"} style={{ padding: "2px 5px" }}>{layer.locked ? "🔒" : "🔓"}</button>
                  <input type="range" min="0" max="1" step="0.05" value={layer.opacity} onChange={event => setLayerOpacity(layer.id, Number(event.target.value))} aria-label={"Opacity " + layer.name} title={"Opacity " + Math.round(layer.opacity * 100) + "%"} style={{ width: 76 }} />
                  <button type="button" onClick={() => handleDuplicateLayer(layer.id)} aria-label={"Duplicate " + layer.name} title="Duplicate layer" style={{ padding: "2px 5px" }}>⧉</button>
                  <button type="button" onClick={() => handleCreateTemplate(layer.id)} aria-label={"Create template from " + layer.name} title="Create layer template" style={{ padding: "2px 5px" }}>☆</button>
                  <button type="button" onClick={() => handleMergeLayer(layer.id)} disabled={!document.layers.some(other => other.id !== layer.id && other.kind === layer.kind)} aria-label={"Merge " + layer.name} title="Merge into adjacent same-kind layer" style={{ padding: "2px 5px" }}>⊕</button>
                  <select value={layer.groupId ?? ""} onChange={event => handleAssignGroup(layer.id, event.target.value || null)} aria-label={"Group " + layer.name} title="Assign layer group" style={{ width: 70 }}><option value="">—</option>{document.layerGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
                  <button type="button" onClick={() => moveLayer(layer.id, "up")} disabled={index === 0} aria-label={"Move " + layer.name + " up"} title="Move up" style={{ padding: "2px 5px" }}>↑</button>
                  <button type="button" onClick={() => moveLayer(layer.id, "down")} disabled={index === document.layers.length - 1} aria-label={"Move " + layer.name + " down"} title="Move down" style={{ padding: "2px 5px" }}>↓</button>
                </div>
              ))}
            </div>
          </div>

          {!isWorldMap && <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--map-editor-line)" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{isRegionMap ? "REGION SYMBOLS / LANDMARKS" : "PLAYABLE OBJECT / ASSET PLACEMENT"}</div>
            <label style={{ display: "grid", gap: 4, fontSize: 11, marginBottom: 6 }}>
              Asset
              <select value={selectedObjectAssetId} onChange={event => setSelectedObjectAssetId(event.target.value)} aria-label="Object asset">
                {objectPalette.map(asset => <option key={asset.id} value={asset.id}>{asset.label}</option>)}
              </select>
            </label>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6 }}>Target: {activeObjectLayer?.name ?? "No object layer"}</div>
            <div aria-label="Draggable asset palette" style={{ display: "grid", gap: 4, marginBottom: 8 }}>
              {objectPalette.map(asset => (
                <button key={asset.id} type="button" draggable={!busy && !!activeObjectLayer && !activeObjectLayer.locked && activeObjectLayer.visible}
                  onDragStart={event => {
                    if (!activeObjectLayer || activeObjectLayer.locked || !activeObjectLayer.visible || busy) { event.preventDefault(); return; }
                    event.dataTransfer.setData("application/x-vendrith-asset", asset.id);
                    event.dataTransfer.setData("text/plain", asset.label);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => setSelectedObjectAssetId(asset.id)} aria-pressed={selectedObjectAssetId === asset.id}
                  style={{ textAlign: "left", padding: "5px 7px", border: "1px solid var(--map-editor-border)", borderRadius: 5, background: selectedObjectAssetId === asset.id ? "var(--map-editor-selected)" : "var(--map-editor-button)", color: "#fff", cursor: "grab" }}>
                  {asset.previewUrl ? <img src={asset.previewUrl} alt="" aria-hidden="true" loading="lazy" style={{ width: 28, height: 28, objectFit: "contain", verticalAlign: "middle", marginRight: 7, imageRendering: "pixelated" }} /> : null}
                  ↗ {asset.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setActiveTool("Building")} aria-pressed={activeTool === "Building"} disabled={!activeObjectLayer || activeObjectLayer.locked || !activeObjectLayer.visible} style={{ width: "100%", marginBottom: 8 }}>
              {activeTool === "Building" ? "Click map to place ✓" : "Place selected asset"}
            </button>
            <label style={{ display: "grid", gap: 3, fontSize: 11, marginBottom: 5 }}>
              Scatter count
              <input type="number" min={1} max={500} step={1} value={scatterCount} onChange={event => setScatterCount(Math.max(1, Math.min(500, Number(event.target.value) || 1)))} />
            </label>
            <label style={{ display: "grid", gap: 3, fontSize: 11, marginBottom: 5 }}>
              Seed (repeatable)
              <input value={scatterSeed} maxLength={80} onChange={event => setScatterSeed(event.target.value)} />
            </label>
            <label style={{ display: "grid", gap: 3, fontSize: 11, marginBottom: 7 }}>
              Minimum distance
              <input type="number" min={1} max={20} step={1} value={scatterDistance} onChange={event => setScatterDistance(Math.max(1, Math.min(20, Number(event.target.value) || 1)))} />
            </label>
            <button type="button" onClick={handleScatterObjects} disabled={!activeObjectLayer || activeObjectLayer.locked || !activeObjectLayer.visible} style={{ width: "100%" }}>
              Scatter selected asset
            </button>
          </div>}

          {!isWorldMap && <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--map-editor-line)" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>OBJECT INSPECTOR</div>
            {!selectedObject ? <div style={{ fontSize: 11, color: "#64748b" }}>Select an object on the map to edit its transform.</div> : <>
              <div style={{ fontSize: 11, overflowWrap: "anywhere", marginBottom: 6 }}>{selectedObject.assetName ?? selectedObject.category} · {selectedObject.id}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                <label style={{ fontSize: 10 }}>X<input aria-label="Object X" type="number" min={0} max={document.width - selectedObject.width} value={selectedObject.x} onChange={event => handleSelectedObjectTransform({ x: Number(event.target.value) })} style={{ width: "100%" }} /></label>
                <label style={{ fontSize: 10 }}>Y<input aria-label="Object Y" type="number" min={0} max={document.height - selectedObject.height} value={selectedObject.y} onChange={event => handleSelectedObjectTransform({ y: Number(event.target.value) })} style={{ width: "100%" }} /></label>
                <label style={{ fontSize: 10 }}>Width<input aria-label="Object width" type="number" min={1} max={document.width} disabled={selectedObjectIds.length > 1} value={selectedObject.width} onChange={event => handleSelectedObjectTransform({ width: Number(event.target.value) })} style={{ width: "100%" }} /></label>
                <label style={{ fontSize: 10 }}>Height<input aria-label="Object height" type="number" min={1} max={document.height} disabled={selectedObjectIds.length > 1} value={selectedObject.height} onChange={event => handleSelectedObjectTransform({ height: Number(event.target.value) })} style={{ width: "100%" }} /></label>
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                <button type="button" onClick={() => handleSelectedObjectTransform({ rotation: selectedObject.rotation - 90 })} aria-label="Rotate object counterclockwise">↶ 90°</button>
                <button type="button" onClick={() => handleSelectedObjectTransform({ rotation: selectedObject.rotation + 90 })} aria-label="Rotate object clockwise">↷ 90°</button>
                <button type="button" onClick={handleDuplicateSelectedObjects} aria-label="Duplicate selected objects">Duplicate</button>
                <button type="button" onClick={handleDeleteSelectedObjects}>Delete selected</button>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>Rotation: {selectedObject.rotation}° · Collision: {selectedObject.collision ? "on" : "off"}</div>
            </>}
          </div>}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>LAYER TEMPLATES</div>
            {document.layerTemplates.length === 0 ? <div style={{ fontSize: 11, color: "#64748b" }}>Create a template from any layer using ☆.</div> : (
              <div style={{ display: "grid", gap: 4 }}>
                {document.layerTemplates.map(template => (
                  <div key={template.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 4, alignItems: "center" }}>
                    <span title={template.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>{template.name}</span>
                    <button type="button" onClick={() => handleApplyTemplate(template.id)} aria-label={"Apply " + template.name} title="Create layer from template">+</button>
                    <button type="button" onClick={() => handleDeleteTemplate(template.id)} aria-label={"Delete " + template.name} title="Delete template">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {tileOptions.filter(isPaintableTerrainTile).map(tile => (
              <button key={tile.id} type="button" onClick={() => chooseTerrain(tile)} aria-pressed={selectedTile === tile.id}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, textAlign: "left", borderRadius: 7, border: "1px solid var(--map-editor-border)", background: selectedTile === tile.id ? "var(--map-editor-terrain-selected)" : "var(--map-editor-button)", color: "#fff" }}>
                {tile.previewUrl ? (
                  <img src={tile.previewUrl} alt={`${tile.label} terrain sheet`} loading="lazy"
                    style={{ width: 34, height: 34, borderRadius: 4, border: "1px solid rgba(255,255,255,.16)", background: "#111827", objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} />
                ) : (
                  <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0, background: ({
                    grass: "#4f9d50", grassalt: "#6fae58",
                    sand: "#e6c36a", redsand: "#c9784f",
                    dirt: "#98633e", dirt2: "#7f5135",
                    pavement: "#8b949e", water: "#3b82c4",
                    deepwater: "#24527a", deepwater2: "#1d4162",
                    brackish: "#397b78", tallgrass: "#3f873f",
                    hole: "#3f3028", holek: "#4a372e", holemid: "#554238",
                    lava: "#c4472d", lavarock: "#5b4542",
                  } as Record<string, string>)[tile.terrain] ?? "#8b949e" }} />
                )}
                <span>{tile.label}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--map-editor-line)" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>WATER · GENERATED SURFACES</div>
            <div style={{ fontSize: 10, lineHeight: 1.4, color: "#94a3b8", marginBottom: 7 }}>
              Water depth is derived by the terrain system. These bundled sheets are previews; select land terrain and the water system derives shoreline and depth.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 5 }}>
              {tileOptions.filter(tile => ["water", "brackish", "deepwater2", "deepwater"].includes(tile.terrain)).map(tile => (
                <div key={`water-preview-${tile.id}`} title={`${tile.label} preview — generated by water system`}
                  style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 5, padding: 5, border: "1px solid var(--map-editor-border)", borderRadius: 5, opacity: 0.82 }}>
                  {tile.previewUrl ? <img src={tile.previewUrl} alt={`${tile.label} terrain sheet`} loading="lazy"
                    style={{ width: 28, height: 28, borderRadius: 3, background: "#111827", objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} /> : null}
                  <span style={{ fontSize: 10, overflowWrap: "anywhere" }}>{tile.label}</span>
                </div>
              ))}
            </div>
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
              if (!picked || !isPaintableTerrainTile(picked)) {
                setPaintDiagnostic(`eyedropper: ${picked?.terrain ?? tileId} tidak dapat dipilih (water adalah derived)`);
                return;
              }
              setSelectedTile(picked.id);
              setActiveTool("Paint");
              setPaintDiagnostic(`eyedropper: picked=${picked.terrain} tile=${picked.id}`);
            }}
            onInputDiagnostic={setPaintDiagnostic}
            onStamp={() => {}}
            onObjectPlace={handleObjectPlace}
            onAssetDrop={handleAssetDrop}
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






