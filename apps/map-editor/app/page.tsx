import { MapEditorAppV2 } from "../components/map-editor-app-v2";

export default function Page() {
  return (
    <>
      <style>{`
        .canvas-panel,
        .canvas-panel canvas {
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
      <MapEditorAppV2 />
    </>
  );
}
