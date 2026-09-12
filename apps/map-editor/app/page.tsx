import { MapEditorAppV3 } from "../components/map-editor-app-v3";

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
      <MapEditorAppV3 />
    </>
  );
}
