"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";
import { VendrithWorldBuilderApp } from "../../components/vendrith-world-builder-app";
import { WorldBuilderErrorBoundary } from "../../components/world-builder-error-boundary";
import { WorldBuilderWorkspaceShell } from "../../components/world-builder-workspace-shell";

function WorldBuilderWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthUser();
  const startMode = searchParams.get("load") === "1" ? "load" : "create";
  const workspace = searchParams.get("workspace") || "world";

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) return <main className="vandrith-auth-loading">Memeriksa akun...</main>;

  return (
    <WorldBuilderErrorBoundary>
      <WorldBuilderWorkspaceShell activeWorkspace={workspace}>
        {workspace === "world" ? (
          <VendrithWorldBuilderApp startMode={startMode} />
        ) : (
          <section className="world-workspace-placeholder">
            <div>
              <span className="world-workspace-eyebrow">WORLD BUILDER</span>
              <h1>{workspaceLabel(workspace)}</h1>
              <p>Workspace ini disiapkan untuk kategori {workspaceLabel(workspace)}. Mesin editor World yang sudah terverifikasi tetap tidak disentuh.</p>
              <button onClick={() => router.push("/world-builder?workspace=world&load=1")}>Open World</button>
            </div>
          </section>
        )}
      </WorldBuilderWorkspaceShell>
    </WorldBuilderErrorBoundary>
  );
}

function workspaceLabel(value: string) {
  const labels: Record<string, string> = { world: "World", region: "Region", playable: "Playable", interior: "Interior" };
  return labels[value] || "World Workspace";
}

export default function WorldBuilderPage() {
  return (
    <Suspense fallback={<main className="vandrith-auth-loading">Memuat Vendrith World Builder...</main>}>
      <WorldBuilderWorkspace />
    </Suspense>
  );
}
