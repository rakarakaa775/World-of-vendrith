"use client";

import { useMemo, useState } from "react";
import type { ConflictChoice, ConflictResolutionSession } from "../editor/map-conflict-resolution-ui-model";
import { canApplyResolution, chooseConflict } from "../editor/map-conflict-resolution-ui-model";
import { createConflictResolutionView } from "../editor/map-conflict-resolution-view";

export type ConflictResolutionPanelProps = {
  session: ConflictResolutionSession;
  onChange?: (session: ConflictResolutionSession) => void;
  onApply: (session: ConflictResolutionSession) => void | Promise<void>;
  onCancel?: () => void;
};

const choices: ConflictChoice[] = ["local", "remote", "base"];

export function ConflictResolutionPanel({ session, onChange, onApply, onCancel }: ConflictResolutionPanelProps) {
  const [selected, setSelected] = useState(session.selected);
  const current = useMemo(() => ({ ...session, selected }), [session, selected]);
  const view = useMemo(() => createConflictResolutionView(current), [current]);
  const choose = (choice: ConflictChoice) => {
    const next = chooseConflict(current, current.conflicts[selected]?.id ?? "", choice);
    onChange?.(next);
  };

  return <section role="dialog" aria-modal="true" aria-labelledby="conflict-resolution-title" style={{ position: "absolute", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(2,6,23,.72)" }}>
    <div style={{ width: "min(980px, calc(100vw - 32px))", maxHeight: "calc(100vh - 32px)", overflow: "auto", border: "1px solid #475569", borderRadius: 8, background: "#0f172a", padding: 18 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><div><h2 id="conflict-resolution-title" style={{ margin: 0 }}>{view.title}</h2><p style={{ margin: "6px 0 0", fontSize: 12, opacity: .75 }}>{view.summary}</p></div>{onCancel && <button onClick={onCancel}>Cancel</button>}</header>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, marginTop: 16 }}>
        <nav aria-label="Conflicts" style={{ display: "grid", alignContent: "start", gap: 5 }}>{view.panels.map((panel, index) => <button key={panel.id} onClick={() => setSelected(index)} aria-pressed={selected === index} style={{ textAlign: "left", padding: 8 }}>{panel.title} · {panel.kind}</button>)}</nav>
        {view.panels[selected] && <article style={{ border: "1px solid #334155", borderRadius: 6, padding: 12 }}><h3 style={{ margin: 0 }}>{view.panels[selected].title}</h3><div style={{ display: "flex", gap: 8, marginTop: 10 }}>{choices.map(choice => <button key={choice} onClick={() => choose(choice)} aria-pressed={view.panels[selected].selected === choice}>{choice}</button>)}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>{[['Base', view.panels[selected].base], ['Local', view.panels[selected].local], ['Remote', view.panels[selected].remote]].map(([label, value]) => <div key={label as string}><strong>{label}</strong><pre style={{ maxHeight: 240, overflow: "auto", fontSize: 10, whiteSpace: "pre-wrap" }}>{value}</pre></div>)}</div></article>}
      </div>
      <footer style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>{onCancel && <button onClick={onCancel}>Cancel</button>}<button disabled={!canApplyResolution(current)} onClick={() => onApply(current)}>Apply Merge</button></footer>
    </div>
  </section>;
}
