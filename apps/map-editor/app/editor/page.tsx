import { MapEditorAppV4 } from "../../components/map-editor-app-v4";
import { MapEditorErrorBoundary } from "../../components/map-editor-error-boundary";

export default function EditorPage() {
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
      <MapEditorAppV4 />
    </MapEditorErrorBoundary>
  );
}
