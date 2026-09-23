"use client";

import { createElement, useEffect, useRef, useState } from "react";
import { Application, Assets, Container, Graphics, Rectangle, Sprite } from "pixi.js";
import type { MapDocument } from "../editor/map-document";
import type { GridPoint } from "../editor/grid";
import type { Selection } from "../editor/selection";
import { normalizeSelection } from "../editor/selection";
import { pointsInFloodFill, pointsInLine, pointsInRectangle, pointsInSquare } from "../editor/paint-tools";
import { neighborMask, terrainFromTileId } from "../editor/terrain-engine";
import type { TerrainAssetBindingMap } from "../editor/terrain-asset-binding";
import { getTerrainAssetBinding } from "../editor/terrain-asset-binding";
import { resolveAssetRecords, resolveAssetUrl, mapEditorTextureCache } from "../editor/asset-resolver";
import { createMapEditorSupabaseClient } from "../editor/supabase-client";
import type { EnvironmentRuntimeState } from "../editor/environment-runtime";
import { DEFAULT_VIEWPORT, panBy, zoomAt, type Viewport } from "../editor/viewport";

type Props = {
  document: MapDocument;
  activeTool: string;
  activeLayerId: string;
  selectedTileId: string | null;
  brushSize: number;
  selection: Selection | null;
  onPaint: (points: GridPoint[], tileId: string | null) => void;
  onSelectionChange: (selection: Selection | null) => void;
  onCellInspect?: (point: GridPoint) => void;
  onStamp: (point: GridPoint) => void;
  onObjectPlace: (point: GridPoint) => void;
  onObjectMove: (objectId: string, point: GridPoint) => void;
  selectedObjectId: string | null;
  terrainBindings?: TerrainAssetBindingMap;
  environmentRuntime?: EnvironmentRuntimeState | null;
};

const COLORS: Record<string, number> = {
  grass: 0x4f9d50,
  sand: 0xe6c36a,
  dirt: 0x98633e,
  pavement: 0x8b949e,
  water: 0x3b82c4,
};
const colorForTile = (id: string | null) => id ? (COLORS[terrainFromTileId(id) ?? ""] ?? 0x94a3b8) : 0xffffff;
const pointKey = (p: GridPoint) => `${p.x}:${p.y}`;
const expandBrush = (points: GridPoint[], size: number) => {
  if (size <= 1) return points;
  const unique = new Map<string, GridPoint>();
  for (const point of points) for (const expanded of pointsInSquare(point, size)) unique.set(pointKey(expanded), expanded);
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
  const [ready, setReady] = useState(false);
  propsRef.current = props;

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;
    const app = new Application();
    appRef.current = app;

    void app.init({
      resizeTo: host,
      background: "#ffffff",
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    }).then(() => {
      if (disposed) { app.destroy(true); return; }
      const world = new Container();
      world.eventMode = "static";
      worldRef.current = world;
      host.replaceChildren(app.canvas);
      app.stage.eventMode = "static";
      app.stage.addChild(world);
      setReady(true);
    }).catch(error => console.error("Pixi map canvas initialization failed", error));

    return () => {
      disposed = true;
      setReady(false);
      worldRef.current = null;
      appRef.current = null;
      host.replaceChildren();
      app.destroy(true);
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
      const { document, activeLayerId, terrainBindings = {}, selectedObjectId } = propsRef.current;
      world.removeChildren();
      const overlay = new Graphics();
      const width = document.width * document.tileSize;
      const height = document.height * document.tileSize;
      const grid = new Graphics();
      grid.rect(0, 0, width, height).fill({ color: 0xffffff });
      grid.rect(0, 0, width, height).stroke({ width: 2, color: 0x64748b });
      for (let x = 1; x < document.width; x++) grid.moveTo(x * document.tileSize, 0).lineTo(x * document.tileSize, height);
      for (let y = 1; y < document.height; y++) grid.moveTo(0, y * document.tileSize).lineTo(width, y * document.tileSize);
      grid.stroke({ width: 1, color: 0xcbd5e1 });
      world.addChild(grid);

      const textureRequests = new Set<string>();
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
          const binding = getTerrainAssetBinding(terrainBindings, terrain, neighborMask(document, activeLayerId, { x: i % document.width, y: Math.floor(i / document.width) }, terrain));
          if (binding) textureRequests.add(binding.assetId);
        }
      }

      let assetRecords = new Map<string, any>();
      const client = createMapEditorSupabaseClient();
      if (client && textureRequests.size) {
        try { assetRecords = await resolveAssetRecords(client, [...textureRequests]); }
        catch (error) { console.warn("Map editor asset metadata lookup failed", error); }
      }
      if (cancelled || worldRef.current !== world) return;

      const loadedTextures = new Map<string, any>();
      for (const assetId of textureRequests) {
        const asset = assetRecords.get(assetId);
        const url = asset ? resolveAssetUrl(asset) : null;
        if (!url) continue;
        const texture = await mapEditorTextureCache.load(url, Assets);
        if (texture) loadedTextures.set(assetId, texture);
        if (cancelled || worldRef.current !== world) return;
      }

      for (const layer of document.layers) {
        if (!layer.visible) continue;
        if (layer.kind !== "objects") {
          for (let i = 0; i < document.width * document.height; i++) {
            const id = layer.cells[i]?.tileId;
            if (!id) continue;
            const x = i % document.width;
            const y = Math.floor(i / document.width);
            const terrain = terrainFromTileId(id);
            let renderedTexture = false;
            if (layer.id === activeLayerId && terrain) {
              const mask = neighborMask(document, layer.id, { x, y }, terrain);
              const binding = getTerrainAssetBinding(terrainBindings, terrain, mask);
              const asset = binding ? assetRecords.get(binding.assetId) : null;
              const url = asset ? resolveAssetUrl(asset) : null;
              let texture = binding ? loadedTextures.get(binding.assetId) : null;
              if (!texture && url) texture = await mapEditorTextureCache.load(url, Assets);
              if (cancelled || worldRef.current !== world) return;
              if (texture) {
                const sprite = new Sprite(texture);
                sprite.x = x * document.tileSize;
                sprite.y = y * document.tileSize;
                sprite.width = document.tileSize;
                sprite.height = document.tileSize;
                sprite.alpha = layer.kind === "collision" ? 0.35 : 1;
                world.addChild(sprite);
                renderedTexture = true;
              }
            }
            if (!renderedTexture) {
              const g = new Graphics();
              g.rect(x * document.tileSize + 2, y * document.tileSize + 2, document.tileSize - 4, document.tileSize - 4)
                .fill({ color: colorForTile(id), alpha: layer.kind === "collision" ? 0.35 : 1 });
              world.addChild(g);
            }
          }
        } else {
          for (const o of layer.objects) {
            const g = new Graphics();
            const c = o.category === "tree" ? 0x3f8f4b : o.category === "house" ? 0xb86b45 : 0x64748b;
            g.roundRect(o.x * document.tileSize + 2, o.y * document.tileSize + 2, o.width * document.tileSize - 4, o.height * document.tileSize - 4, 4)
              .fill({ color: c, alpha: 0.9 })
              .stroke({ width: 2, color: selectedObjectId === o.id ? 0x0ea5e9 : 0x334155 });
            world.addChild(g);
          }
        }
      }

      world.addChild(overlay);
      world.hitArea = new Rectangle(0, 0, width, height);
      app.stage.hitArea = app.screen;
      if (!viewportInitializedRef.current) {
        viewportRef.current = { x: Math.max((host.clientWidth - width) / 2, 8), y: Math.max((host.clientHeight - height) / 2, 8), zoom: 1 };
        viewportInitializedRef.current = true;
      }
      world.position.set(viewportRef.current.x, viewportRef.current.y);
      world.scale.set(viewportRef.current.zoom);
    };
    void render();
    return () => { cancelled = true; };
  }, [ready, props.document, props.activeLayerId, props.selectedObjectId, props.terrainBindings, props.environmentRuntime]);

  useEffect(() => {
    if (!ready) return;
    const host = hostRef.current;
    const world = worldRef.current;
    if (!host || !world) return;
    let startPoint: GridPoint | null = null;
    let selecting = false;
    let movingId: string | null = null;
    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let activePointerId: number | null = null;
    let spaceHeld = false;

    // Use native pointer events at the host boundary for editing input. This
    // keeps touch input deterministic on mobile browsers while preserving the
    // existing Pixi scene/rendering and persistence foundation.
    const pointAt = (e: PointerEvent): GridPoint => {
      const { document } = propsRef.current;
      const rect = host.getBoundingClientRect();
      const zoom = viewportRef.current.zoom || 1;
      const localX = (e.clientX - rect.left - viewportRef.current.x) / zoom;
      const localY = (e.clientY - rect.top - viewportRef.current.y) / zoom;
      return { x: Math.floor(localX / document.tileSize), y: Math.floor(localY / document.tileSize) };
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
      const { brushSize, activeTool, selectedTileId, onPaint } = propsRef.current;
      const validPts = expandBrush(pts.filter(valid), brushSize).filter(valid);
      if (validPts.length) onPaint(validPts, activeTool === "Erase" ? null : selectedTileId);
    };
    const down = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
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
      if (current.activeTool === "Paint" || current.activeTool === "Erase") {
        if (valid(p)) { current.onCellInspect?.(p); paint([p]); }
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
      if (current.activeTool === "Select") {
        const o = hit(p);
        if (o) movingId = o.id;
        else if (valid(p)) { selecting = true; startPoint = p; current.onSelectionChange(normalizeSelection(p, p)); }
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
      if (panning) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        viewportRef.current = panBy(viewportRef.current, dx, dy);
        lastX = e.clientX;
        lastY = e.clientY;
        world.position.set(viewportRef.current.x, viewportRef.current.y);
        return;
      }
      const p = pointAt(e);
      const current = propsRef.current;
      if ((current.activeTool === "Paint" || current.activeTool === "Erase") && startPoint && valid(p)) {
        paint([p]);
        return;
      }
      if (selecting && startPoint && valid(p)) { current.onSelectionChange(normalizeSelection(startPoint, p)); return; }
      if (movingId && valid(p)) { current.onObjectMove(movingId, p); return; }
      if (!panning) return;
      viewportRef.current = { ...viewportRef.current, x: viewportRef.current.x + e.clientX - lastX, y: viewportRef.current.y + e.clientY - lastY };
      lastX = e.clientX;
      lastY = e.clientY;
      world.position.set(viewportRef.current.x, viewportRef.current.y);
    };
    const up = (e: PointerEvent) => {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      const p = pointAt(e);
      const current = propsRef.current;
      if (startPoint && (current.activeTool === "Line" || current.activeTool === "Rectangle") && valid(p)) {
        paint(current.activeTool === "Line" ? pointsInLine(startPoint, p) : pointsInRectangle(startPoint, p));
      }
      startPoint = null;
      selecting = false;
      movingId = null;
      panning = false;
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
    };

    const keydown = (e: KeyboardEvent) => { if (e.code === "Space") { spaceHeld = true; e.preventDefault(); } };
    const keyup = (e: KeyboardEvent) => { if (e.code === "Space") spaceHeld = false; };

    const keydown = (e: KeyboardEvent) => { if (e.code === "Space") { spaceHeld = true; e.preventDefault(); } };
    const keyup = (e: KeyboardEvent) => { if (e.code === "Space") spaceHeld = false; };

    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerup", up);
    host.addEventListener("pointercancel", up);
    host.addEventListener("lostpointercapture", up);
    host.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("lostpointercapture", up);
      host.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [ready]);

  return createElement("div", { ref: hostRef, style: { width: "100%", height: "100%", minHeight: 360, background: "#fff", touchAction: "none" } });
}
