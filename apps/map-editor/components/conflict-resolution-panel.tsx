"use client";

import { useMemo, useState } from "react";
import type { MapDocument } from "../editor/map-document";
import { createConflictResolutionView, type ConflictResolutionView } from "../editor/map-conflict-resolution-view";
import type { ConflictResolutionSession, ConflictResolutionChoice } from "../editor/map-conflict-resolution";

export type ConflictResolutionPanelProps = {
  session: ConflictResolutionSession;
  onApply: (document: MapDocument) => void | Promise<void>;
  onCancel?: () => void;
};

const choices: ConflictResolutionChoice[] = ["local", "remote", "base"];

export function ConflictResolutionPanel({ session, onApply, onCancel }: ConflictResolutionPanelProps) {
  const [choice, setChoice] = useState<ConflictResolutionChoice>("local");
  const view: ConflictResolutionView = useMemo(() => createConflictResolutionView(session, choice), [session, choice]);

  return (
    <section role="dialog" aria-modal="true" aria-labelledby="conflict-resolution-title" style={{ position: "absolute", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(2,6,23,.72)" }}>
      <div style={{ width: "min(980px, calc(100vw - 32px))", maxHeight: "calc(100vh - 32px)", overflow: "auto", border: "1px solid #475569", borderRadius: 8, background: "#0f172a", padding: 18, boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <h2 id="conflict-resolution-title" style={{ margin: 0 }}>Resolve Map Conflict</h2>
            <p style={{ margin: "6px 0 0", fontSize: 12, opacity: .75 }}>{view.status}</p>
          </div>
          {onCancel && <button onClick={onCancel}>Cancel</button>}
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
          {choices.map(option => {
            const active = choice === option;
            return <button key={option} onClick={() => setChoice(option)} aria-pressed={active} style={{ textAlign: "left", padding: 12, border: "1px solid #475569", borderRadius: 6, background: active ? "#1e293b" : "#111827" }}>
              <strong>{option === "local" ? "Local" : option === "remote" ? "Remote" : "Base"}</strong>
              <div style={{ fontSize: 11, opacity: .7, marginTop: 4 }}>{option === "local" ? "Keep this editor's resolved changes." : option === "remote" ? "Use the latest authoritative map." : "Return to the common base."}</div>
            </button>;
          })}
        </div>

        <div style={{ marginTop: 14, padding: 12, border: "1px solid #334155", borderRadius: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Resolved snapshot</div>
          <pre style={{ margin: "8px 0 0", maxHeight: 260, overflow: "auto", fontSize: 10, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(view.preview, null, 2)}</pre>
        </div>

        <footer style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          {onCancel && <button onClick={onCancel}>Cancel</button>}
          <button disabled={!view.canApply} onClick={() => onApply(view.resolvedDocument)}>Apply Merge</button>
        </footer>
      </div>
    </section>
  );
}
