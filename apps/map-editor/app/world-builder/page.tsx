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
  const workspace = searchParams.get("workspace") || "world-map";

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) return <main className="vandrith-auth-loading">Memeriksa akun...</main>;

  return (
    <WorldBuilderErrorBoundary>
      <WorldBuilderWorkspaceShell activeWorkspace={workspace}>
        {workspace === "world-map" ? (
          <VendrithWorldBuilderApp startMode={startMode} />
        ) : (
          <section className="world-workspace-placeholder">
            <div>
              <span className="world-workspace-eyebrow">WORLD BUILDER</span>
              <h1>{workspaceLabel(workspace)}</h1>
              <p>Workspace shell siap. Mesin editor yang sudah terverifikasi tetap berada di World Map sampai workspace ini diimplementasikan.</p>
              <button onClick={() => router.push("/world-builder?workspace=world-map&load=1")}>Open World Map</button>
            </div>
          </section>
        )}
      </WorldBuilderWorkspaceShell>
    </WorldBuilderErrorBoundary>
  );
}

function workspaceLabel(value: string) {
  const labels: Record<string, string> = {
    preview: "Preview",
    building: "Building World",
    generate: "Generate Life",
    spawn: "Spawn Life",
    organize: "Organize the World",
    library: "Library Asset",
    settings: "World Settings",
    weather: "Weather",
    time: "Time / Seasons",
    validation: "Validation",
    versions: "Save / Load / Versions",
    project: "Project / World Management",
    "world-map": "World Map",
  };
  return labels[value] || "World Workspace";
}

export default function WorldBuilderPage() {
  return (
    <Suspense fallback={<main className="vandrith-auth-loading">Memuat Vendrith World Builder...</main>}>
      <WorldBuilderWorkspace />
    </Suspense>
  );
}
