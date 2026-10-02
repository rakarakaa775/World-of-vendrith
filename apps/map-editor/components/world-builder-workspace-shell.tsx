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
  const [surface, setSurface] = useState<"overview" | "hierarchy" | "settings" | "assets" | null>(null);
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
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 8px 8px" }}>
              {([["overview", "Overview"], ["hierarchy", "Hierarchy"], ["settings", "Settings"], ["assets", "Assets"]] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setSurface(id)} aria-label={label} title={label}
                  style={{ flex: "1 1 42%", padding: "5px 6px", borderRadius: 5, border: "1px solid var(--map-editor-border)", background: "var(--map-editor-button)", color: "inherit", cursor: "pointer", fontSize: 11 }}>
                  {label}
                </button>
              ))}
            </div>
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
                <button type="button" key={id} className={activeWorkspace === id ? "active" : ""} onClick={() => navigate(id)} aria-current={activeWorkspace === id ? "page" : undefined}>
                  <span>{iconFor(id)}</span>
                  <span className="world-builder-nav-label">{label}</span>
                </button>
              ))}
            </section>
          ))}
        </aside>

        <section className="world-builder-main">
          <div className="world-builder-breadcrumb">
            <button type="button" onClick={() => navigate("world")}>World of Vendrith</button>
            <span>›</span>
            <strong>{labelFor(activeWorkspace)}</strong>
          </div>
          <div className="world-builder-toolbar">
            <span className="world-toolbar-context">{labelFor(activeWorkspace)}</span>
          </div>
          <div className="world-builder-content">{children}</div>
        </section>
      </div>
      {surface && (
        <div role="dialog" aria-modal="true" aria-label={surfaceLabel(surface)}
          onClick={() => setSurface(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 24, background: "rgba(0,0,0,.55)" }}>
          <section onClick={event => event.stopPropagation()}
            style={{ width: "min(720px, 100%)", maxHeight: "80vh", overflow: "auto", border: "1px solid var(--map-editor-border)", borderRadius: 10, background: "var(--map-editor-panel)", color: "var(--map-editor-text)", padding: 18, boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div><strong>{surfaceLabel(surface)}</strong><div style={{ fontSize: 12, opacity: .7, marginTop: 3 }}>World Builder shell entry surface</div></div>
              <button type="button" onClick={() => setSurface(null)} aria-label="Tutup">✕</button>
            </div>
            {surface === "overview" && <SurfaceCard title="World Overview" items={["World of Vendrith", "Authoritative World Map", "World scope: WORLD", "Primary authoring surface: World Map Studio"]} />}
            {surface === "hierarchy" && <SurfaceCard title="World Hierarchy" items={["World", "↳ Region", "↳ Playable", "↳ Interior", "Hierarchy is a navigation shell only; it does not alter the existing map/building foundation."]} />}
            {surface === "settings" && <SurfaceCard title="World Settings" items={["World-level settings entry surface is available.", "Future settings modules remain additive.", "No simulation, building, or persistence foundation is changed here."]} />}
            {surface === "assets" && <SurfaceCard title="Asset / Library Access" items={["Approved asset inventory remains managed by the Asset Library.", "Use the Asset Library workspace for discovery and provenance.", "World Map asset placement remains additive to the current editor foundation."]} />}
          </section>
        </div>
      )}
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

function surfaceLabel(surface: "overview" | "hierarchy" | "settings" | "assets") {
  return ({ overview: "World Overview", hierarchy: "World Hierarchy", settings: "World Settings", assets: "Asset / Library Access" })[surface];
}

function SurfaceCard({ title, items }: { title: string; items: string[] }) {
  return <div><h2 style={{ margin: "0 0 12px", fontSize: 16 }}>{title}</h2><div style={{ display: "grid", gap: 8 }}>{items.map(item => <div key={item} style={{ padding: 10, border: "1px solid var(--map-editor-border)", borderRadius: 7, fontSize: 13 }}>{item}</div>)}</div></div>;
}
