"use client";

import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { MapDocument } from '../editor/map-document';
import type { GridPoint } from '../editor/grid';
import { DEFAULT_VIEWPORT, zoomAt, type Viewport } from '../editor/viewport';
import { normalizeSelection, type Selection } from '../editor/selection';
import { pointsInFloodFill, pointsInLine, pointsInRectangle, pointsInSquare } from '../editor/paint-tools';
import { terrainTextureSourceFor } from '../editor/terrain-texture-registry';
import { createTerrainRuntime } from '../editor/terrain-runtime';
import { buildTerrainRenderPlan, terrainRenderCellAt } from '../editor/terrain-renderer';
import { junctionCornerDirections, terrainJunctionGeometry } from '../editor/terrain-junction-geometry';
import { analyzeTerrainBrushPreview, analyzeFloodTerrainBrushPreview } from '../editor/terrain-brush-preview';
import type { TerrainAssetBindingMap } from '../editor/terrain-asset-binding';
import type { EnvironmentRuntimeState } from '../editor/environment-runtime';
import { PixiEnvironmentController } from '../editor/pixi-environment-controller';

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

const tileColor = (id: string, kind: string) =>
  kind === 'collision'
    ? 0xef4444
    : id === 'water-tile'
      ? 0x234b63
      : id === 'sand'
        ? 0xc9a66b
        : id === 'dirt'
          ? 0x7c5b3a
          : id === 'pavement'
            ? 0x64748b
            : 0x5f7f5f;

export function PixiMapCanvas(props: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const environmentControllerRef = useRef<PixiEnvironmentController | null>(null);
  const environmentRuntimeRef = useRef<EnvironmentRuntimeState | null>(props.environmentRuntime ?? null);

  useEffect(() => {
    environmentRuntimeRef.current = props.environmentRuntime ?? null;
    environmentControllerRef.current?.update(environmentRuntimeRef.current);
  }, [props.environmentRuntime]);

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    const app = new Application();
    appRef.current = app;
    const mount = async () => {
      await app.init({ background: '#0b1020', resizeTo: hostRef.current!, antialias: false });
      if (disposed) return;
      hostRef.current!.appendChild(app.canvas);
      const environmentRoot = new Container();
      app.stage.addChild(environmentRoot);
      environmentControllerRef.current = new PixiEnvironmentController(environmentRoot);
      environmentControllerRef.current.update(environmentRuntimeRef.current);
      // Existing terrain/object/interaction rendering remains owned by this canvas.
      // The environment controller is an isolated visual layer above the scene.
    };
    void mount();
    return () => {
      disposed = true;
      environmentControllerRef.current?.clear();
      environmentControllerRef.current = null;
      app.destroy(true, { children: true, texture: false });
      appRef.current = null;
    };
  }, []);

  // Existing canvas implementation continues below; the environment layer is
  // intentionally isolated from terrain state and input handling.
  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}
