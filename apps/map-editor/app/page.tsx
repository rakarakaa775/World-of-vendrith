import { MapEditorAppV3 } from "../components/map-editor-app-v3";
import { MapEditorErrorBoundary } from "../components/map-editor-error-boundary";

export default function Page() {
  return (
    <MapEditorErrorBoundary>
      <style>{`
        .canvas-panel,
        .canvas-panel canvas {
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
      <MapEditorAppV3 />
    </MapEditorErrorBoundary>
  );
}
