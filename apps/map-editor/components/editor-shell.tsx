"use client";

import { createMap, type MapDocument } from "../editor/map-document";
import { PixiMapCanvas } from "./pixi-map-canvas";

type Props = {
  initialDocument?: MapDocument;
  initialDocumentRevision?: number;
  [key: string]: unknown;
};

/**
 * World canvas UI — foundation step.
 *
 * This component intentionally contains only the canvas surface.
 * Toolbar, sidebar, inspector, terrain palette, asset picker, rulers,
 * minimap, transforms, and other editor chrome will be added back
 * incrementally in later steps.
 */
export function EditorShell({
  initialDocument = createMap("world"),
  initialDocumentRevision = 0,
}: Props) {
  const activeLayerId =
    initialDocument.layers.find((layer) => layer.active)?.id ??
    initialDocument.layers[0]?.id ??
    "ground";

  return (
    <main
      aria-label="World canvas"
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        background: "#0b1220",
      }}
    >
      <section
        aria-label="World map canvas surface"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <PixiMapCanvas
          document={initialDocument}
          activeTool="Select"
          activeLayerId={activeLayerId}
          selectedTileId={null}
          brushSize={1}
          selection={null}
          onPaint={() => {}}
          onSelectionChange={() => {}}
          onStamp={() => {}}
          onObjectPlace={() => {}}
          onObjectMove={() => {}}
          selectedObjectId={null}
          selectedObjectIds={[]}
          onObjectSelectionChange={() => {}}
          readonly
          showGrid={false}
          viewportResetKey={initialDocumentRevision}
        />
      </section>
    </main>
  );
}
