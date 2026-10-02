"use client";

import { createElement, useEffect, useRef, useState } from "react";
import { Application, Assets, Container, Graphics, Rectangle, Sprite, Text, Texture, TilingSprite } from "pixi.js";
import type { RendererPreference } from "pixi.js";
import type { MapDocument } from "../editor/map-document";
import type { GridPoint } from "../editor/grid";
import type { Selection } from "../editor/selection";
import { normalizeSelection } from "../editor/selection";
import { pointsInFloodFill, pointsInLine, pointsInRectangle, tileIdAtPoint } from "../editor/paint-tools";
import { terrainFromTileId, waterDepthBand } from "../editor/terrain-engine";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import { getTerrainAssetBinding } from "../editor/terrain-asset-binding";
import { resolveTerrainRenderCell } from "../editor/terrain-resolver";
import { terrainVariationIndex } from "../editor/terrain-variation";
import { resolveAssetRecords, resolveAssetUrl, mapEditorTextureCache } from "../editor/asset-resolver";
import { createMapEditorSupabaseClient } from "../editor/supabase-client";
import type { EnvironmentRuntimeState } from "../editor/environment-runtime";
import { boxSelectObjectIds } from "../editor/object-state";
import { DEFAULT_VIEWPORT, nextZoomLevel, panBy, snapToCell, zoomAt, type Viewport } from "../editor/viewport";
import type { DebugViewState } from "../editor/debug-views";
import type { RuntimeEntity } from "../ai/domain/runtime";

type Props = {
  document: MapDocument;
  activeTool: string;
  activeLayerId: string;
  selectedTileId: string | null;
  brushSize: number;
  selection: Selection | null;
  onPaint: (points: GridPoint[], tileId: string | null, gestureId?: number) => void;
  onSelectionChange: (selection: Selection | null) => void;
  onCellInspect?: (point: GridPoint) => void;
  onTerrainPick?: (tileId: string) => void;
  onInputDiagnostic?: (message: string) => void;
  onStamp: (point: GridPoint) => void;
  onObjectPlace: (point: GridPoint) => void;
  onObjectMove: (objectId: string, point: GridPoint) => void;
  selectedObjectIds: string[];
  onObjectSelectionChange: (objectIds: string[]) => void;
  selectedObjectId: string | null;
  terrainBindings?: TerrainAssetBindingMap;
  runtimeEntities?: RuntimeEntity[];
  environmentRuntime?: EnvironmentRuntimeState | null;
  viewportAction?: { id: number; type: "pan"; dx: number; dy: number } | { id: number; type: "zoom"; zoom: number } | { id: number; type: "fit" } | { id: number; type: "zoom-map" } | { id: number; type: "zoom-selection" };
  onViewportChange?: (viewport: Viewport) => void;
  viewportResetKey?: string | number;
  readonly?: boolean;
  showGrid?: boolean;
  debugViews?: Partial<DebugViewState>;
  layerIsolationId?: string | null;
  previewMode?: boolean;
};

const DEEP_WATER_ASSET_ID = "5587526c-093a-4e3a-8813-aeaa348060eb";

const COLORS: Record<string, number> = {
  grass: 0x4f9d50,
  grassalt: 0x6fae58,
  sand: 0xe6c36a,
  redsand: 0xc9784f,
  dirt: 0x98633e,
  dirt2: 0x7f5135,
  pavement: 0x8b949e,
  water: 0x3b82c4,
  deepwater: 0x24527a,
  deepwater2: 0x1d4162,
  brackish: 0x397b78,
  tallgrass: 0x3f873f,
  hole: 0x3f3028,
  holek: 0x4a372e,
  holemid: 0x554238,
  lava: 0xc4472d,
  lavarock: 0x5b4542,
};
const colorForTile = (id: string | null, worldSeed = "", x = 0, y = 0) => {
  const terrain = terrainFromTileId(id);
  const base = terrain ? (COLORS[terrain] ?? 0x94a3b8) : 0xffffff;
  if (!terrain || !worldSeed) return base;
  const variation = terrainVariationIndex(worldSeed, x, y, terrain, 3);
  const delta = [-10, 0, 10][variation] ?? 0;
  const r = Math.max(0, Math.min(255, ((base >> 16) & 0xff) + delta));
  const g = Math.max(0, Math.min(255, ((base >> 8) & 0xff) + delta));
  const b = Math.max(0, Math.min(255, (base & 0xff) + delta));
  return (r << 16) | (g << 8) | b;
};
const pointKey = (p: GridPoint) => `${p.x}:${p.y}`;
const terrainRegionTextureCache = new Map<string, Texture>();
const textureForTerrainBinding = (texture: Texture, assetId: string, region: NonNullable<ReturnType<typeof getTerrainAssetBinding>>["region"]) => {
  if (!region) return texture;
  const key = `${assetId}:${region.x}:${region.y}:${region.width}:${region.height}`;
  const cached = terrainRegionTextureCache.get(key);
  if (cached) return cached;
  const cropped = new Texture({
    source: texture.source,
    frame: new Rectangle(region.x, region.y, region.width, region.height),
  });
  terrainRegionTextureCache.set(key, cropped);
  return cropped;
};
const expandBrush = (points: GridPoint[], size: number) => {
  if (size <= 1) return points;
  const unique = new Map<string, GridPoint>();
  // Round terrain brushes use the brush diameter in cells. Use the radius
  // between the outer cell centers so odd sizes produce a genuinely circular
  // discrete footprint instead of turning the 3-cell brush into a full 3x3
  // square. The map remains grid-based; only the affected-cell footprint is round.
  const radius = Math.max(0, (size - 1) / 2);
  const minOffset = -Math.floor(radius);
  const maxOffset = Math.floor(radius);
  for (const point of points) {
    for (let dy = minOffset; dy <= maxOffset; dy++) {
      for (let dx = minOffset; dx <= maxOffset; dx++) {
        if (Math.hypot(dx, dy) <= radius) {
          const expanded = { x: point.x + dx, y: point.y + dy };
          unique.set(pointKey(expanded), expanded);
        }
      }
    }
  }
  return [...unique.values()];
};

/** One Pixi application per component lifetime; React state changes only update its scene. */
export function PixiMapCanvas(props: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const viewportRef = useRef<Viewport>(DEFAULT_VIEWPORT);
  const viewportInitializedRef = useRef(false);
  const propsRef = useRef(props);
  const assetRecordsRef = useRef<Map<string, any> | null>(null);
  const brushPreviewRef = useRef<Graphics | null>(null);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  propsRef.current = props;

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;
    const app = new Application();
    appRef.current = app;
    let initialized = false;
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    const initOptions = {
      resizeTo: host,
      background: "#ffffff",
      preference: ["webgl", "canvas"] as RendererPreference[],
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    };
    const initPromise = app.init(initOptions);
    const timeoutPromise = new Promise<never>((_, reject) => {
      initTimer = setTimeout(() => reject(new Error("Renderer initialization timed out after 30 seconds")), 30000);
    });
    void Promise.race([initPromise, timeoutPromise]).then(() => {
      if (initTimer) { clearTimeout(initTimer); initTimer = null; }
      initialized = true;
      if (disposed) { app.destroy(true); return; }
      const workspace = new Graphics();
      workspace.eventMode = "none";
      const drawWorkspace = () => {
        workspace.clear();
        const width = Math.max(host.clientWidth, 2000);
        const height = Math.max(host.clientHeight, 1400);
        workspace.rect(0, 0, width, height).fill({ color: 0xf5f7fa });
        const spacing = 32;
        for (let x = 0; x <= width; x += spacing) workspace.moveTo(x, 0).lineTo(x, height);
        for (let y = 0; y <= height; y += spacing) workspace.moveTo(0, y).lineTo(width, y);
        workspace.stroke({ width: 1, color: 0xe2e8f0 });
      };
      drawWorkspace();
      app.stage.addChild(workspace);

      const world = new Container();
      world.eventMode = "static";
      worldRef.current = world;
      host.replaceChildren(app.canvas);
      app.stage.eventMode = "static";
      app.stage.addChild(world);
      setReady(true);
      setInitError(null);
    }).catch(error => {
      if (initTimer) { clearTimeout(initTimer); initTimer = null; }
      const message = error instanceof Error ? error.message : String(error);
      console.error("Pixi map canvas initialization failed", error);
      setInitError(message || "Renderer initialization failed");
    });

    return () => {
      disposed = true;
      setReady(false);
      worldRef.current = null;
      appRef.current = null;
      host.replaceChildren();
      if (initTimer) { clearTimeout(initTimer); initTimer = null; }
      if (initialized) app.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const render = async () => {
      const world = worldRef.current;
      const app = appRef.current;
      const host = hostRef.current;
      if (!world || !app || !host) return;
      const { document, activeLayerId, terrainBindings = {}, selectedObjectId, selectedObjectIds, layerIsolationId = null } = propsRef.current;
      const layerVisible = (layerId: string) => layerIsolationId === null || layerIsolationId === layerId;
      const groupVisible = (layer: { groupId?: string | null }) => !layer.groupId || (document.layerGroups.find(group => group.id === layer.groupId)?.visible ?? true);
      const scene = new Container();
      const overlay = new Graphics();
      const width = document.width * document.tileSize;
      const height = document.height * document.tileSize;

      // Keep the logical terrain and the editor grid in the SAME Graphics object.
      // The grid is already proven to render on mobile; drawing terrain into this
      // exact render object removes the scene/child ordering as a possible failure
      // point. Remote textures remain optional enhancements below.
      const grid = new Graphics();
      grid.rect(0, 0, width, height).fill({ color: 0xffffff });
      for (const layer of document.layers) {
        if (!layer.visible || !groupVisible(layer) || !layerVisible(layer.id) || layer.kind === "objects") continue;
        for (let i = 0; i < document.width * document.height; i++) {
          const id = layer.cells[i]?.tileId;
          if (!id) continue;
          const x = i % document.width;
          const y = Math.floor(i / document.width);
          grid.rect(
            x * document.tileSize + 1,
            y * document.tileSize + 1,
            Math.max(1, document.tileSize - 2),
            Math.max(1, document.tileSize - 2),
          ).fill({
            color: colorForTile(id, document.id, x, y),
            alpha: layer.kind === "collision" ? 0.35 * layer.opacity : layer.opacity,
          });
        }
      }
      if (propsRef.current.showGrid !== false) {
        grid.rect(0, 0, width, height).stroke({ width: 2, color: 0x64748b });
        for (let x = 1; x < document.width; x++) grid.moveTo(x * document.tileSize, 0).lineTo(x * document.tileSize, height);
        for (let y = 1; y < document.height; y++) grid.moveTo(0, y * document.tileSize).lineTo(width, y);
        grid.stroke({ width: 1, color: 0xcbd5e1 });
      }
      scene.addChild(grid);

      if (propsRef.current.debugViews?.collision) {
        const collisionLayer = document.layers.find(layer => layer.kind === "collision");
        if (collisionLayer && layerVisible(collisionLayer.id)) {
          const collisionOverlay = new Graphics();
          for (let i = 0; i < document.width * document.height; i++) {
            const blocked = Boolean(collisionLayer.cells[i]?.tileId);
            const x = i % document.width;
            const y = Math.floor(i / document.width);
            collisionOverlay.rect(
              x * document.tileSize + 2,
              y * document.tileSize + 2,
              Math.max(1, document.tileSize - 4),
              Math.max(1, document.tileSize - 4),
            ).fill({ color: blocked ? 0xdc2626 : 0x16a34a, alpha: blocked ? 0.28 : 0.08 });
          }
          scene.addChild(collisionOverlay);
        }
      }

      if (propsRef.current.debugViews?.objectBounds) {
        const objectBounds = new Graphics();
        for (const layer of document.layers) {
          if (!layer.visible || !groupVisible(layer) || !layerVisible(layer.id) || layer.kind !== "objects") continue;
          for (const object of layer.objects) {
            objectBounds.rect(
              object.x * document.tileSize + 1,
              object.y * document.tileSize + 1,
              Math.max(2, object.width * document.tileSize - 2),
              Math.max(2, object.height * document.tileSize - 2),
            ).stroke({ width: 2, color: 0xf59e0b });
          }
        }
        scene.addChild(objectBounds);
      }

      if (propsRef.current.debugViews?.invalidCells) {
        const invalidCells = new Graphics();
        for (const layer of document.layers) {
          if (!layer.visible || !groupVisible(layer) || !layerVisible(layer.id) || layer.kind !== "ground") continue;
          for (let i = 0; i < document.width * document.height; i++) {
            const tileId = layer.cells[i]?.tileId;
            if (!tileId || terrainFromTileId(tileId)) continue;
            const x = i % document.width;
            const y = Math.floor(i / document.width);
            invalidCells.rect(
              x * document.tileSize + 3,
              y * document.tileSize + 3,
              Math.max(1, document.tileSize - 6),
              Math.max(1, document.tileSize - 6),
            ).fill({ color: 0xef4444, alpha: 0.45 }).stroke({ width: 1, color: 0x991b1b });
          }
        }
        scene.addChild(invalidCells);
      }

      if (propsRef.current.debugViews?.terrainId || propsRef.current.debugViews?.waterDepth) {
        const debugLayer = document.layers.find(layer => layer.id === (layerIsolationId ?? activeLayerId));
        if (debugLayer && debugLayer.kind !== "objects") {
          for (let i = 0; i < document.width * document.height; i++) {
            const tileId = debugLayer.cells[i]?.tileId;
            if (!tileId) continue;
            const terrain = terrainFromTileId(tileId);
            const depth = waterDepthBand(terrain);
            const label = propsRef.current.debugViews?.waterDepth
              ? (depth ? "D" + depth : "")
              : (terrain ?? tileId);
            if (!label) continue;
            const x = i % document.width;
            const y = Math.floor(i / document.width);
            const text = new Text({
              text: label,
              style: {
                fontFamily: "monospace",
                fontSize: Math.max(8, Math.min(14, document.tileSize * 0.28)),
                fill: propsRef.current.debugViews?.waterDepth ? 0x0f3b66 : 0x0f172a,
                align: "center",
                stroke: { color: 0xffffff, width: 2 },
              },
            });
            text.anchor.set(0.5);
            text.x = (x + 0.5) * document.tileSize;
            text.y = (y + 0.5) * document.tileSize;
            text.eventMode = "none";
            scene.addChild(text);
          }
        }
      }

      const textureRequests = new Set<string>();
      textureRequests.add(DEEP_WATER_ASSET_ID);
      for (const terrain of ["grass", "sand", "dirt", "pavement", "water"] as const) {
        const binding = getTerrainAssetBinding(terrainBindings, terrain, 255);
        if (binding) textureRequests.add(binding.assetId);
      }
      const activeLayer = document.layers.find(layer => layer.id === activeLayerId);
      if (activeLayer && activeLayer.kind !== "objects") {
        for (let i = 0; i < document.width * document.height; i++) {
          const id = activeLayer.cells[i]?.tileId;
          const terrain = terrainFromTileId(id ?? null);
          if (!terrain) continue;
          const resolved = resolveTerrainRenderCell(document, activeLayerId, { x: i % document.width, y: Math.floor(i / document.width) }, terrainBindings);
          const binding = resolved?.assetId ? getTerrainAssetBinding(terrainBindings, terrain, resolved.mask) : null;
          if (binding) textureRequests.add(binding.assetId);
        }
      }

      // Asset metadata is intentionally outside the paint/render critical path.
      // A paint edit must reach the Pixi scene even when Supabase asset lookup is
      // slow or unavailable. The first scene therefore renders from deterministic
      // terrain-color fallbacks; metadata/textures are hydrated in the background.
      let assetRecords = new Map<string, any>();
      const client = createMapEditorSupabaseClient();
      if (client && textureRequests.size) {
        void resolveAssetRecords(client, [...textureRequests])
          .then(records => {
            if (!cancelled && worldRef.current === world) {
              // Cache the records on the component instance for the next render.
              assetRecordsRef.current = records;
            }
          })
          .catch(error => console.warn("Map editor asset metadata lookup failed", error));
      }

      const loadedTextures = new Map<string, any>();
      const cachedRecords = assetRecordsRef.current;
      if (cachedRecords) assetRecords = cachedRecords;
      // Render the logical map immediately. Remote asset I/O must never sit on
      // the critical path of a paint edit.
      void Promise.allSettled([...textureRequests].map(async assetId => {
        const asset = assetRecords.get(assetId);
        const url = asset ? resolveAssetUrl(asset) : null;
        if (!url) return;
        try {
          const texture = await mapEditorTextureCache.load(url, Assets);
          if (texture) loadedTextures.set(assetId, texture);
        } catch {
          // Missing/slow texture is a valid fallback state for the editor.
        }
      }));
      
      // Remote textures are an enhancement only. They never determine whether
      // the painted cell is rendered.
      for (const layer of document.layers) {
        if (!layer.visible || !groupVisible(layer) || !layerVisible(layer.id)) continue;
        if (layer.kind !== "objects") {
          if (layer.kind === "ground") {
            const isSolidDeepwaterWorld =
              document.mapType === "world" &&
              layer.cells.length === document.width * document.height &&
              layer.cells.every(cell => cell.tileId === "deepwater");
            if (isSolidDeepwaterWorld) {
              const texture = loadedTextures.get(DEEP_WATER_ASSET_ID);
              if (texture) {
                const tileTexture = textureForTerrainBinding(texture, DEEP_WATER_ASSET_ID, {
                  x: 0,
                  y: 0,
                  width: 16,
                  height: 16,
                });
                const tiled = new TilingSprite({ texture: tileTexture, width, height });
                scene.addChild(tiled);
              }
            } else {
              for (let i = 0; i < document.width * document.height; i++) {
                const id = layer.cells[i]?.tileId;
                if (!id) continue;
                const terrain = terrainFromTileId(id);
                if (!terrain) continue;
                const x = i % document.width;
                const y = Math.floor(i / document.width);
                const point = { x, y };
                const resolved = resolveTerrainRenderCell(document, layer.id, point, terrainBindings);
                const binding = terrain === "deepwater"
                  ? { assetId: DEEP_WATER_ASSET_ID, region: { x: 0, y: 0, width: 16, height: 16 } }
                  : resolved?.assetId
                    ? getTerrainAssetBinding(terrainBindings, terrain, resolved.mask)
                    : null;
                const texture = binding ? loadedTextures.get(binding.assetId) : null;
                if (!texture || !binding) continue;
                const renderTexture = textureForTerrainBinding(
                  texture,
                  binding.assetId,
                  binding.region,
                );
                const sprite = new Sprite(renderTexture);
                sprite.x = x * document.tileSize;
                sprite.y = y * document.tileSize;
                sprite.width = document.tileSize;
                sprite.height = document.tileSize;
                sprite.alpha = layer.opacity;
                scene.addChild(sprite);
              }
            }
          }
        } else {
          for (const o of layer.objects) {
            let objectTexture: any = null;
            if (o.assetUrl) {
              objectTexture = mapEditorTextureCache.get(o.assetUrl);
              if (!objectTexture) {
                void mapEditorTextureCache.load(o.assetUrl, Assets);
              }
            }
            if (objectTexture) {
              const sprite = new Sprite(objectTexture);
              sprite.x = o.x * document.tileSize + 2;
              sprite.y = o.y * document.tileSize + 2;
              sprite.width = Math.max(4, o.width * document.tileSize - 4);
              sprite.height = Math.max(4, o.height * document.tileSize - 4);
              sprite.alpha = 0.95 * layer.opacity;
              scene.addChild(sprite);
              if (selectedObjectIds.includes(o.id)) {
                const outline = new Graphics();
                outline.rect(
                  o.x * document.tileSize + 1,
                  o.y * document.tileSize + 1,
                  Math.max(6, o.width * document.tileSize - 2),
                  Math.max(6, o.height * document.tileSize - 2),
                ).stroke({ width: 2, color: 0x0ea5e9 });
                scene.addChild(outline);
              }
              continue;
            }
            const g = new Graphics();
            const c = o.category === "tree" ? 0x3f8f4b : o.category === "house" ? 0xb86b45 : 0x64748b;
            g.roundRect(
              o.x * document.tileSize + 2,
              o.y * document.tileSize + 2,
              o.width * document.tileSize - 4,
              o.height * document.tileSize - 4,
              4,
            ).fill({ color: c, alpha: 0.9 }).stroke({
              width: 2,
              color: selectedObjectIds.includes(o.id) ? 0x0ea5e9 : 0x334155,
            });
            scene.addChild(g);
          }
        }
      }

      for (const entity of propsRef.current.runtimeEntities ?? []) {
        const marker = new Graphics();
        const isNpc = entity.kind === "npc";
        const size = Math.max(7, document.tileSize * 0.28);
        const centerX = (entity.position.x + 0.5) * document.tileSize;
        const centerY = (entity.position.y + 0.5) * document.tileSize;
        marker.circle(centerX, centerY, size).fill({ color: isNpc ? 0xef4444 : 0x2563eb, alpha: 0.95 });
        marker.circle(centerX, centerY, size + 3).stroke({ width: 2, color: 0xffffff, alpha: 0.9 });
        marker.eventMode = "none";
        scene.addChild(marker);
        const label = new Text({ text: isNpc ? "NPC" : "PLAYER", style: { fontSize: 10, fill: 0xffffff, fontWeight: "700" } });
        label.x = centerX - label.width / 2;
        label.y = centerY - size - label.height - 3;
        label.eventMode = "none";
        scene.addChild(label);
      }

      scene.addChild(overlay);
      const preview = new Graphics();
      preview.eventMode = "none";
      preview.zIndex = 999;
      brushPreviewRef.current = preview;
      scene.addChild(preview);
      world.removeChildren();
      for (const child of scene.removeChildren()) world.addChild(child);
      app.stage.hitArea = app.screen;
      if (!viewportInitializedRef.current) {
        viewportRef.current = {
          x: Math.max((host.clientWidth - width) / 2, 8),
          y: Math.max((host.clientHeight - height) / 2, 8),
          zoom: 1,
        };
        viewportInitializedRef.current = true;
      }
      world.position.set(viewportRef.current.x, viewportRef.current.y);
      world.scale.set(viewportRef.current.zoom);
      propsRef.current.onViewportChange?.(viewportRef.current);
    };
    void render().catch(error => {
      if (cancelled) return;
      const message = error instanceof Error ? error.message : String(error);
      console.error("Pixi map canvas scene render failed", error);
      setInitError(message || "Canvas scene render failed");
    });
    return () => { cancelled = true; };
  }, [ready, props.document, props.activeLayerId, props.selectedObjectId, props.selectedObjectIds, props.selection, props.terrainBindings, props.runtimeEntities, props.environmentRuntime, props.showGrid, props.debugViews, props.layerIsolationId]);

  useEffect(() => {
    if (!ready) return;
    viewportInitializedRef.current = false;
  }, [ready, props.viewportResetKey, props.document.id]);

  useEffect(() => {
    if (!ready || !props.viewportAction) return;
    const host = hostRef.current;
    const world = worldRef.current;
    if (!host || !world) return;
    const action = props.viewportAction;
    if (action.type === "pan") {
      viewportRef.current = panBy(viewportRef.current, action.dx, action.dy);
    } else {
      const rect = host.getBoundingClientRect();
      const document = propsRef.current.document;
      const mapWidth = document.width * document.tileSize;
      const mapHeight = document.height * document.tileSize;
      let targetZoom = 1;
      let focusWidth = mapWidth;
      let focusHeight = mapHeight;
      let focusX = mapWidth / 2;
      let focusY = mapHeight / 2;
      if (action.type === "fit") {
        targetZoom = Math.min(4, Math.max(0.25, Math.min((rect.width - 48) / mapWidth, (rect.height - 48) / mapHeight)));
      } else if (action.type === "zoom-selection" && propsRef.current.selection) {
        const selection = propsRef.current.selection;
        focusWidth = Math.max(document.tileSize, selection.width * document.tileSize);
        focusHeight = Math.max(document.tileSize, selection.height * document.tileSize);
        focusX = selection.x * document.tileSize + focusWidth / 2;
        focusY = selection.y * document.tileSize + focusHeight / 2;
        targetZoom = Math.min(4, Math.max(0.25, Math.min((rect.width - 96) / focusWidth, (rect.height - 96) / focusHeight)));
      } else if (action.type === "zoom-map") {
        targetZoom = 1;
      } else if (action.type === "zoom") {
        targetZoom = Math.min(4, Math.max(0.25, action.zoom));
        const currentZoom = viewportRef.current.zoom || 1;
        viewportRef.current = zoomAt(viewportRef.current, targetZoom / currentZoom, rect.width / 2, rect.height / 2);
        world.position.set(viewportRef.current.x, viewportRef.current.y);
        world.scale.set(viewportRef.current.zoom);
        props.onViewportChange?.(viewportRef.current);
        return;
      } else {
        return;
      }
      viewportRef.current = { x: rect.width / 2 - focusX * targetZoom, y: rect.height / 2 - focusY * targetZoom, zoom: targetZoom };
    }
    world.position.set(viewportRef.current.x, viewportRef.current.y);
    world.scale.set(viewportRef.current.zoom);
    props.onViewportChange?.(viewportRef.current);
  }, [ready, props.viewportAction, props.onViewportChange]);

  useEffect(() => {
    if (!ready) return;
    const host = hostRef.current;
    const world = worldRef.current;
    if (!host || !world) return;
    let startPoint: GridPoint | null = null;
    let lastPaintPoint: GridPoint | null = null;
    let paintGestureId = 0;
    let activePaintGestureId: number | null = null;
    let selecting = false;
    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let gestureStartX = 0;
    let gestureStartY = 0;
    let selectDragged = false;
    let activePointerId: number | null = null;
    let spaceHeld = false;
    let movingObjectId: string | null = null;
    const syncBrushPreview = (p: GridPoint | null) => {
      const brushPreview = brushPreviewRef.current;
      if (!brushPreview) return;
      brushPreview.clear();
      const current = propsRef.current;
      if (!p || (current.activeTool !== "Paint" && current.activeTool !== "Erase")) {
        brushPreview.visible = false;
        return;
      }
      const size = Math.max(1, current.brushSize);
      const radius = (size - 1) / 2;
      const centerX = (p.x + 0.5) * current.document.tileSize;
      const centerY = (p.y + 0.5) * current.document.tileSize;
      brushPreview.visible = true;
      brushPreview.circle(centerX, centerY, Math.max(current.document.tileSize * 0.5, (radius + 0.5) * current.document.tileSize));
      brushPreview.fill({ color: current.activeTool === "Erase" ? 0xef4444 : colorForTile(current.selectedTileId), alpha: 0.16 });
      brushPreview.stroke({ width: 2, color: current.activeTool === "Erase" ? 0xef4444 : 0x0f172a, alpha: 0.8 });
    };
    const leaveBrushPreview = () => syncBrushPreview(null);


    // Use native pointer events at the host boundary for editing input. This
    // keeps touch input deterministic on mobile browsers while preserving the
    // existing Pixi scene/rendering and persistence foundation.
    const pointAt = (e: PointerEvent): GridPoint => {
      const { document } = propsRef.current;
      const rect = host.getBoundingClientRect();
      const zoom = viewportRef.current.zoom || 1;
      const localX = (e.clientX - rect.left - viewportRef.current.x) / zoom;
      const localY = (e.clientY - rect.top - viewportRef.current.y) / zoom;
      return { x: snapToCell(localX, document.tileSize), y: snapToCell(localY, document.tileSize) };
    };
    const valid = (p: GridPoint) => {
      const { document } = propsRef.current;
      return p.x >= 0 && p.y >= 0 && p.x < document.width && p.y < document.height;
    };
    const hit = (p: GridPoint) => {
      const { document } = propsRef.current;
      const layer = document.layers.find(x => x.id === "objects");
      if (!layer) return null;
      for (let i = layer.objects.length - 1; i >= 0; i--) {
        const o = layer.objects[i];
        if (p.x >= o.x && p.y >= o.y && p.x < o.x + o.width && p.y < o.y + o.height) return o;
      }
      return null;
    };
    const paint = (pts: GridPoint[]) => {
      const { brushSize, activeTool, selectedTileId, onPaint, onInputDiagnostic } = propsRef.current;
      const filtered = pts.filter(valid);
      const validPts = expandBrush(filtered, brushSize).filter(valid);
      onInputDiagnostic?.(
        validPts.length
          ? `paint-path: valid=${validPts.length} tool=${activeTool} tile=${selectedTileId ?? "null"}`
          : `paint-path: BLOCKED valid=0 tool=${activeTool} tile=${selectedTileId ?? "null"} raw=${pts.length}`,
      );
      if (validPts.length) onPaint(validPts, activeTool === "Erase" ? null : selectedTileId, activePaintGestureId ?? undefined);
    };
    const down = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      e.preventDefault();
      activePointerId = e.pointerId;
      try { host.setPointerCapture(e.pointerId); } catch {}
      const panGesture = e.button === 1 || spaceHeld;
      if (panGesture) {
        panning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const p = pointAt(e);
      const current = propsRef.current;
      current.onInputDiagnostic?.(`pointerdown: x=${e.clientX} y=${e.clientY} cell=${p.x}:${p.y} tool=${current.activeTool} tile=${current.selectedTileId ?? "null"} layer=${current.activeLayerId}`);
      if (current.readonly) {
        panning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      gestureStartX = e.clientX;
      gestureStartY = e.clientY;
      selectDragged = false;
      if (current.activeTool === "Select") {
        const object = hit(p);
        if (e.altKey && object) {
          movingObjectId = object.id;
          return;
        }
        selecting = true;
        startPoint = p;
        current.onSelectionChange(normalizeSelection(p, p));
        return;
      }
      if (current.activeTool === "Eyedropper") {
        if (valid(p)) {
          const tileId = tileIdAtPoint(current.document, current.activeLayerId, p);
          if (tileId) current.onTerrainPick?.(tileId);
          current.onCellInspect?.(p);
        }
        startPoint = null;
        return;
      }
      if (current.activeTool === "Paint" || current.activeTool === "Erase") {
        if (valid(p)) {
          current.onCellInspect?.(p);
          paintGestureId += 1;
          activePaintGestureId = paintGestureId;
          paint([p]);
          lastPaintPoint = p;
        }
        startPoint = p;
        return;
      }
      if (current.activeTool === "Flood") {
        if (valid(p)) { current.onCellInspect?.(p); paint(pointsInFloodFill(current.document, current.activeLayerId, p)); }
        return;
      }
      if (current.activeTool === "Line" || current.activeTool === "Rectangle") {
        if (valid(p)) { current.onCellInspect?.(p); startPoint = p; }
        return;
      }
      if (current.activeTool === "Stamp") { if (valid(p)) current.onStamp(p); return; }
      if (current.activeTool === "Building") { if (valid(p)) current.onObjectPlace(p); return; }
      panning = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      if (e.pointerType === "touch" || e.buttons !== 0) e.preventDefault();
      if (panning) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (propsRef.current.activeTool === "Select" && (Math.abs(e.clientX - gestureStartX) > 4 || Math.abs(e.clientY - gestureStartY) > 4)) selectDragged = true;
        viewportRef.current = panBy(viewportRef.current, dx, dy);
        lastX = e.clientX;
        lastY = e.clientY;
        world.position.set(viewportRef.current.x, viewportRef.current.y);
        return;
      }
      const p = pointAt(e);
      const current = propsRef.current;
      syncBrushPreview(p);
      if (movingObjectId && valid(p)) {
        current.onObjectMove(movingObjectId, p);
        return;
      }
      if ((current.activeTool === "Paint" || current.activeTool === "Erase") && startPoint && valid(p)) {
        // Pointer events can jump across several cells on a fast mouse/touch
        // movement. Paint every cell along the segment so the brush stroke has
        // no gaps. The brush footprint is still expanded at each sampled cell.
        const from = lastPaintPoint ?? startPoint;
        paint(pointsInLine(from, p));
        lastPaintPoint = p;
        return;
      }
      if (selecting && startPoint && valid(p)) { current.onSelectionChange(normalizeSelection(startPoint, p)); return; }
      if (!panning) return;
      viewportRef.current = { ...viewportRef.current, x: viewportRef.current.x + e.clientX - lastX, y: viewportRef.current.y + e.clientY - lastY };
      lastX = e.clientX;
      lastY = e.clientY;
      world.position.set(viewportRef.current.x, viewportRef.current.y);
    };
    const up = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      e.preventDefault();
      const p = pointAt(e);
      const current = propsRef.current;
      if (current.activeTool === "Select" && selecting && startPoint) {
        const box = normalizeSelection(startPoint, p);
        const dragged = Math.abs(e.clientX - gestureStartX) > 4 || Math.abs(e.clientY - gestureStartY) > 4;
        if (dragged) {
          const ids = boxSelectObjectIds(current.document, "objects", box, e.shiftKey, current.selectedObjectIds);
          current.onObjectSelectionChange(ids);
        } else {
          const object = hit(p);
          if (object) current.onObjectSelectionChange(e.shiftKey ? (current.selectedObjectIds.includes(object.id) ? current.selectedObjectIds.filter(id => id !== object.id) : [...current.selectedObjectIds, object.id]) : [object.id]);
          else if (!e.shiftKey) current.onObjectSelectionChange([]);
        }
      } else if (current.activeTool === "Select" && !selectDragged && !movingObjectId) {
        const object = hit(p);
        current.onSelectionChange(object ? normalizeSelection({x: object.x, y: object.y}, {x: object.x + object.width - 1, y: object.y + object.height - 1}) : null);
        if (object) {
          const ids = current.selectedObjectIds.includes(object.id)
            ? (e.shiftKey ? current.selectedObjectIds.filter(id => id !== object.id) : current.selectedObjectIds)
            : (e.shiftKey ? [...current.selectedObjectIds, object.id] : [object.id]);
          current.onObjectSelectionChange(ids);
        } else if (!e.shiftKey) {
          current.onObjectSelectionChange([]);
        }
      }
      if (startPoint && (current.activeTool === "Line" || current.activeTool === "Rectangle") && valid(p)) {
        paint(current.activeTool === "Line" ? pointsInLine(startPoint, p) : pointsInRectangle(startPoint, p));
      }
      startPoint = null;
      lastPaintPoint = null;
      activePaintGestureId = null;
      selecting = false;
      movingObjectId = null;
      panning = false;
      selectDragged = false;
      syncBrushPreview(null);
      if (activePointerId === e.pointerId) {
        try { host.releasePointerCapture(e.pointerId); } catch {}
        activePointerId = null;
      }
    };
    const wheel = (e: WheelEvent) => {
      const r = host.getBoundingClientRect();
      viewportRef.current = zoomAt(viewportRef.current, e.deltaY < 0 ? 1.1 : 0.9, e.clientX - r.left, e.clientY - r.top);
      world.position.set(viewportRef.current.x, viewportRef.current.y);
      world.scale.set(viewportRef.current.zoom);
      propsRef.current.onViewportChange?.(viewportRef.current);
    };

    const keydown = (e: KeyboardEvent) => { if (e.code === "Space") { spaceHeld = true; e.preventDefault(); } };
    const keyup = (e: KeyboardEvent) => { if (e.code === "Space") spaceHeld = false; };

    host.addEventListener("pointerleave", leaveBrushPreview);
    const pointerOptions: AddEventListenerOptions = { capture: true, passive: false };
    host.addEventListener("pointerdown", down, pointerOptions);
    host.addEventListener("pointermove", move, pointerOptions);
    host.addEventListener("pointerup", up, pointerOptions);
    host.addEventListener("pointercancel", up, pointerOptions);
    host.addEventListener("lostpointercapture", up, pointerOptions);
    host.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      host.removeEventListener("pointerleave", leaveBrushPreview);
      host.removeEventListener("pointerdown", down, pointerOptions);
      host.removeEventListener("pointermove", move, pointerOptions);
      host.removeEventListener("pointerup", up, pointerOptions);
      host.removeEventListener("pointercancel", up, pointerOptions);
      host.removeEventListener("lostpointercapture", up, pointerOptions);
      host.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [ready]);

  return createElement("div", { ref: hostRef, className: props.previewMode ? "pixi-map-canvas-host pixi-map-canvas-preview" : "pixi-map-canvas-host", style: { position: "absolute", left: props.previewMode ? 0 : 40, top: props.previewMode ? 0 : 28, right: 0, bottom: 0, minWidth: 0, minHeight: 0, background: "#f5f7fa", touchAction: "none", overflow: "hidden" } }, initError ? createElement("div", { role: "alert", style: { position: "absolute", inset: 12, zIndex: 20, display: "grid", placeItems: "center", padding: 16, textAlign: "center", border: "1px solid #7f1d1d", borderRadius: 10, background: "rgba(2,6,23,.94)", color: "#fecaca", fontFamily: "system-ui, sans-serif" } }, createElement("div", null, createElement("strong", null, "Canvas renderer gagal dimulai"), createElement("p", { style: { margin: "8px 0 0", fontSize: 12, color: "#cbd5e1" } }, initError))) : null);
}





