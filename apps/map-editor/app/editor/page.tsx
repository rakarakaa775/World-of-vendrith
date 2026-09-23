"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";
import { MapEditorAppV4 } from "../../../components/map-editor-app-v4";
import { MapEditorErrorBoundary } from "../../../components/map-editor-error-boundary";

export default function EditorPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) return <main className="vandrith-auth-loading">Memeriksa akun...</main>;

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
