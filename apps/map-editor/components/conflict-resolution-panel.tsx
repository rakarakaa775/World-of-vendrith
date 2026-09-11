"use client";

import { useMemo, useState } from "react";
import type { ConflictChoice, ConflictResolutionSession } from "../editor/map-conflict-resolution-ui-model";
import { canApplyResolution, chooseConflict } from "../editor/map-conflict-resolution-ui-model";
import { createConflictResolutionView } from "../editor/map-conflict-resolution-view";

export type ConflictResolutionPanelProps = {
  session: ConflictResolutionSession;
  onApply: (session: ConflictResolutionSession) => void | Promise<void>;
  onCancel?: () => void;
};

const choices: ConflictChoice[] = ["local", "remote", "base"];

export function ConflictResolutionPanel({ session, onApply, onCancel }: ConflictResolutionPanelProps) {
  const [activeId, setActiveId] = useState(session.conflicts[session.selected]?.id ?? null);
  const activeIndex = Math.max(0, session.conflicts.findIndex(c => c.id === activeId));
  const selectedSession = { ...session, selected: activeIndex };
  const view = useMemo(() => createConflictResolutionView(selectedSession), [selectedSession]);
  const applyEnabled = canApplyResolution(selectedSession);

  return (
    <section role="dialog" aria-modal="true" aria-labelledby="conflict-resolution-title" style={{ position: "absolute", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(2,6,23,.72)" }}>
      <div style={{ width: "min(1100px, calc(100vw - 32px))", maxHeight: "calc(100vh - 32px)", overflow: "auto", border: "1px solid #475569", borderRadius: 8, background: "#0f172a", padding: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div><h2 id="conflict-resolution-title" style={{ margin: 0 }}>{view.title}</h2><p style={{ margin: "6px 0 0", fontSize: 12, opacity: .75 }}>{view.summary}</p></div>
          {onCancel && <button onClick={onCancel}>Cancel</button>}
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, marginTop: 16 }}>
          <nav aria-label="Conflicts" style={{ display: "grid", alignContent: "start", gap: 5 }}>
            {view.panels.map((panel, index) => <button key={panel.id} onClick={() => setActiveId(panel.id)} aria-pressed={index === view.selectedIndex} style={{ textAlign: "left", padding: 9 }}>
              {panel.title}<span style={{ display: "block", fontSize: 10, opacity: .7 }}>{panel.kind} · {panel.selected ?? "unresolved"}</span>
            </button>)}
          </nav>

          {view.panels[view.selectedIndex] && (() => {
            const panel = view.panels[view.selectedIndex];
            const current = selectedSession.conflicts[view.selectedIndex];
            return <article style={{ border: "1px solid #334155", borderRadius: 6, padding: 12 }}>
              <h3 style={{ margin: "0 0 8px" }}>{panel.title}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {(["base", "local", "remote"] as const).map(key => <div key={key} style={{ border: "1px solid #334155", borderRadius: 5, padding: 8 }}><strong>{key}</strong><pre style={{ maxHeight: 260, overflow: "auto", fontSize: 10, whiteSpace: "pre-wrap" }}>{panel[key]}</pre></div>)}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {choices.map(choice => <button key={choice} onClick={() => onApply({ ...chooseConflict(selectedSession, current.id, choice), selected: view.selectedIndex })}>{`Keep ${choice}`}</button>)}
              </div>
              <p style={{ fontSize: 11, opacity: .7 }}>Current: {current.choice ?? "unresolved"}</p>
            </article>;
          })()}
        </div>

        <footer style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          {onCancel && <button onClick={onCancel}>Cancel</button>}
          <button disabled={!applyEnabled} onClick={() => onApply(selectedSession)}>Apply Merge</button>
        </footer>
      </div>
    </section>
  );
}
