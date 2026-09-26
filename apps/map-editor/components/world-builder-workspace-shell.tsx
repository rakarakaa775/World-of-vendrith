"use client";

import { useRouter } from "next/navigation";

type Props = { activeWorkspace: string; children: React.ReactNode };

const groups = [
  {
    title: "World",
    items: [
      ["preview", "Preview"],
      ["world-map", "World Map"],
      ["library", "Library Asset"],
      ["settings", "World Settings"],
      ["validation", "Validation"],
    ],
  },
  {
    title: "Life",
    items: [
      ["generate", "Generate Life"],
      ["spawn", "Spawn Life"],
      ["organize", "Organize the World"],
    ],
  },
  {
    title: "Systems",
    items: [
      ["weather", "Weather"],
      ["time", "Time / Seasons"],
    ],
  },
  {
    title: "Building",
    items: [["building", "Building World"]],
  },
  {
    title: "Project",
    items: [
      ["versions", "Save / Load / Versions"],
      ["project", "Project / World Management"],
    ],
  },
] as const;

export function WorldBuilderWorkspaceShell({ activeWorkspace, children }: Props) {
  const router = useRouter();
  const navigate = (workspace: string) => router.push(`/world-builder?workspace=${workspace}${workspace === "world-map" ? "&load=1" : ""}`);

  return (
    <main className="world-builder-shell">
      <header className="world-builder-topbar">
        <div className="world-builder-brand">
          <span className="world-builder-mark">✦</span>
          <div>
            <strong>Vendrith World Builder</strong>
            <small>WORLD workspace</small>
          </div>
        </div>
        <div className="world-builder-project">
          <span>Project</span>
          <strong>World of Vendrith</strong>
          <button onClick={() => navigate("project")}>Manage</button>
        </div>
        <div className="world-builder-global-status">
          <span className="world-status-dot" />
          <span>Workspace active</span>
          <button onClick={() => navigate("versions")}>Save / Load</button>
        </div>
      </header>

      <div className="world-builder-layout">
        <aside className="world-builder-nav" aria-label="World Builder navigation">
          <div className="world-builder-nav-title">World Builder</div>
          {groups.map(group => (
            <section key={group.title}>
              <h2>{group.title}</h2>
              {group.items.map(([id, label]) => (
                <button key={id} className={activeWorkspace === id ? "active" : ""} onClick={() => navigate(id)} aria-current={activeWorkspace === id ? "page" : undefined}>
                  <span>{iconFor(id)}</span>
                  {label}
                </button>
              ))}
            </section>
          ))}
        </aside>

        <section className="world-builder-main">
          <div className="world-builder-breadcrumb">
            <button onClick={() => navigate("world-map")}>World of Vendrith</button>
            <span>›</span>
            <strong>{labelFor(activeWorkspace)}</strong>
          </div>
          <div className="world-builder-toolbar">
            <span className="world-toolbar-context">{labelFor(activeWorkspace)}</span>
            <div>
              <button onClick={() => navigate("validation")}>Validation</button>
              <button onClick={() => navigate("versions")}>Save / Load</button>
            </div>
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
  const icons: Record<string, string> = {
    preview: "◉",
    "world-map": "▦",
    library: "◇",
    settings: "⚙",
    validation: "✓",
    generate: "✦",
    spawn: "♙",
    organize: "☷",
    weather: "☁",
    time: "◷",
    building: "⌂",
    versions: "◈",
    project: "▣",
  };
  return icons[id] || "•";
}
