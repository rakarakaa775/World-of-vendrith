"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";
import { MapEditorAppV4 } from "../../components/map-editor-app-v4";
import { MapEditorErrorBoundary } from "../../components/map-editor-error-boundary";

function EditorWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthUser();
  const startMode = searchParams.get("load") === "1" ? "load" : "create";

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
      <MapEditorAppV4 startMode={startMode} />
    </MapEditorErrorBoundary>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<main className="vandrith-auth-loading">Memuat Vendrith World Builder...</main>}>
      <EditorWorkspace />
    </Suspense>
  );
}
