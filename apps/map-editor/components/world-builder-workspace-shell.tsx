"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type Props = { activeWorkspace: string; children: ReactNode };

const groups = [
  { title: "World", items: [["world", "World"]] },
  { title: "Region", items: [["region", "Region"]] },
  { title: "Playable", items: [["playable", "Playable"]] },
  { title: "Interior", items: [["interior", "Interior"]] },
] as const;

export function WorldBuilderWorkspaceShell({ activeWorkspace, children }: Props) {
  const router = useRouter();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const navigate = (workspace: string) =>
    router.push(workspace === "world"
      ? "/world-builder?workspace=world&load=1"
      : `/world-builder?workspace=${workspace}`);

  return (
    <main className="world-builder-shell">
      <header className="world-builder-topbar">
        <div className="world-builder-brand">
          <button type="button" className="world-builder-home-button" onClick={() => router.push("/")} aria-label="Kembali ke Control Center" title="Kembali ke Control Center">‹</button>
          <span className="world-builder-mark">✦</span>
          <div>
            <strong>Vendrith World Builder</strong>
            <small>WORLD workspace</small>
          </div>
        </div>
        <div className="world-builder-project">
          <span>Project</span>
          <strong>World of Vendrith</strong>
        </div>
        <div className="world-builder-global-status">
          <span className="world-status-dot" />
          <span>Workspace active</span>
        </div>
      </header>

      <div className={`world-builder-layout${navCollapsed ? " nav-collapsed" : ""}`}>
        <aside className="world-builder-nav" aria-label="World Builder navigation">
          <div className="world-builder-nav-title">
            <span>World Builder</span>
            <button
              type="button"
              className="world-builder-nav-toggle"
              onClick={() => setNavCollapsed(value => !value)}
              aria-label={navCollapsed ? "Tampilkan menu" : "Sembunyikan menu"}
              title={navCollapsed ? "Tampilkan menu" : "Sembunyikan menu"}
            >
              {navCollapsed ? "›" : "‹"}
            </button>
          </div>
          {groups.map(group => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              {group.items.map(([id, label]) => (
                <button key={id} className={activeWorkspace === id ? "active" : ""} onClick={() => navigate(id)} aria-current={activeWorkspace === id ? "page" : undefined}>
                  <span>{iconFor(id)}</span>
                  <span className="world-builder-nav-label">{label}</span>
                </button>
              ))}
            </section>
          ))}
        </aside>

        <section className="world-builder-main">
          <div className="world-builder-breadcrumb">
            <button onClick={() => navigate("world")}>World of Vendrith</button>
            <span>›</span>
            <strong>{labelFor(activeWorkspace)}</strong>
          </div>
          <div className="world-builder-toolbar">
            <span className="world-toolbar-context">{labelFor(activeWorkspace)}</span>
          </div>
          <div className="world-builder-content">{children}</div>
        </section>
      </div>
    </main>
  );
}

function labelFor(id: string) {
  for (const group of groups) {
    const match = group.items.find(item => item[0] === id);
    if (match) return match[1];
  }
  return "World Workspace";
}

function iconFor(id: string) {
  const icons: Record<string, string> = { world: "▦", region: "◇", playable: "♙", interior: "⌂" };
  return icons[id] || "•";
}
