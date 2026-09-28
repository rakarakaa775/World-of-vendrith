"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../editor/auth";
import { VendrithWorldBuilderApp } from "../../components/vendrith-world-builder-app";
import { WorldBuilderErrorBoundary } from "../../components/world-builder-error-boundary";
import { WorldBuilderWorkspaceShell } from "../../components/world-builder-workspace-shell";

function WorldBuilderWorkspace() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const startMode = "create" as const;

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) {
    return <main className="vandrith-auth-loading">Memeriksa akun...</main>;
  }

  return (
    <WorldBuilderErrorBoundary>
      <WorldBuilderWorkspaceShell activeWorkspace="world">
        <VendrithWorldBuilderApp startMode={startMode} />
      </WorldBuilderWorkspaceShell>
    </WorldBuilderErrorBoundary>
  );
}

export default function WorldBuilderPage() {
  return <WorldBuilderWorkspace />;
}
