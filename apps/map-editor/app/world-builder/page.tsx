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
          <WorkspaceLanding workspace={workspace} onOpenWorld={() => router.push("/world-builder?workspace=world&load=1")} />
        )}
      </WorldBuilderWorkspaceShell>
    </WorldBuilderErrorBoundary>
  );
}

function WorkspaceLanding({ workspace, onOpenWorld }: { workspace: string; onOpenWorld: () => void }) {
  const meta: Record<string, { eyebrow: string; title: string; description: string; tools: string[] }> = {
    region: {
      eyebrow: "REGION WORKSPACE",
      title: "Region",
      description: "Definisikan region, batas wilayah, dan hubungan region tanpa mengubah engine World yang sudah ada.",
      tools: ["Region boundaries", "Region metadata", "World hierarchy"],
    },
    playable: {
      eyebrow: "PLAYABLE WORKSPACE",
      title: "Playable",
      description: "Siapkan area playable, spawn context, dan ruang gameplay yang akan memakai fondasi World.",
      tools: ["Playable zones", "Spawn context", "Gameplay bounds"],
    },
    interior: {
      eyebrow: "INTERIOR WORKSPACE",
      title: "Interior",
      description: "Kelola ruang interior dan koneksinya ke dunia luar secara terpisah dari sistem Building.",
      tools: ["Interior spaces", "Entry / exit links", "Interior context"],
    },
  };
  const current = meta[workspace] ?? {
    eyebrow: "WORLD BUILDER",
    title: workspaceLabel(workspace),
    description: "Workspace World Builder.",
    tools: [],
  };
  return (
    <section className="world-workspace-landing">
      <div className="world-workspace-hero">
        <span className="world-workspace-eyebrow">{current.eyebrow}</span>
        <h1>{current.title}</h1>
        <p>{current.description}</p>
        <div className="world-workspace-tools">
          {current.tools.map(tool => <span key={tool}>{tool}</span>)}
        </div>
        <div className="world-workspace-actions">
          <button type="button" onClick={onOpenWorld}>Open World Editor</button>
          <span>World engine foundation tetap menjadi sumber data utama.</span>
        </div>
      </div>
      <aside className="world-workspace-status">
        <span>WORKSPACE STATUS</span>
        <strong>READY FOR DESIGN</strong>
        <small>UI shell aktif · runtime integration berikutnya dilakukan secara additive.</small>
      </aside>
    </section>
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
