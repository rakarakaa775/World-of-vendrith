"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";
import { VendrithWorldBuilderApp } from "../../components/vendrith-world-builder-app";
import { WorldBuilderErrorBoundary } from "../../components/world-builder-error-boundary";

function WorldBuilderWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthUser();
  const startMode = searchParams.get("load") === "1" ? "load" : "create";

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) return <main className="vandrith-auth-loading">Memeriksa akun...</main>;

  return (
    <WorldBuilderErrorBoundary>
      <style>{`
        .canvas-panel,
        .canvas-panel canvas {
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
      <VendrithWorldBuilderApp startMode={startMode} />
    </WorldBuilderErrorBoundary>
  );
}

export default function WorldBuilderPage() {
  return (
    <Suspense fallback={<main className="vandrith-auth-loading">Memuat Vendrith World Builder...</main>}>
      <WorldBuilderWorkspace />
    </Suspense>
  );
}
