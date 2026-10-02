"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ConflictChoice, ConflictResolutionSession } from "../editor/map-conflict-resolution-ui-model";
import { canApplyResolution, chooseConflict, resolveAll } from "../editor/map-conflict-resolution-ui-model";
import { createConflictResolutionView } from "../editor/map-conflict-resolution-view";

export type ConflictResolutionPanelProps = {
  session: ConflictResolutionSession;
  onApply: (session: ConflictResolutionSession) => void | Promise<void>;
  onCancel?: () => void;
};

const choices: ConflictChoice[] = ["local", "remote", "base"];

export function ConflictResolutionPanel({ session, onApply, onCancel }: ConflictResolutionPanelProps) {
  const [workingSession, setWorkingSession] = useState(session);
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
      if (!cancelButtonRef.current) dialogRef.current?.querySelector<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]')?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCancel) {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    };
  }, [onCancel]);
  const activeId = workingSession.conflicts[workingSession.selected]?.id ?? null;
  const activeIndex = Math.max(0, workingSession.conflicts.findIndex(c => c.id === activeId));
  const selectedSession = { ...workingSession, selected: activeIndex };
  const view = useMemo(() => createConflictResolutionView(selectedSession), [selectedSession]);
  const applyEnabled = canApplyResolution(selectedSession);

  const choose = (choice: ConflictChoice) => {
    const current = selectedSession.conflicts[activeIndex];
    if (!current) return;
    setWorkingSession(chooseConflict(selectedSession, current.id, choice));
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <section ref={dialogRef} onKeyDown={handleDialogKeyDown} role="dialog" aria-modal="true" aria-labelledby="conflict-resolution-title" style={{ position: "absolute", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(2,6,23,.72)" }}>
      <div style={{ width: "min(1100px, calc(100vw - 32px))", maxHeight: "calc(100vh - 32px)", overflow: "auto", border: "1px solid #475569", borderRadius: 8, background: "#0f172a", padding: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div><h2 id="conflict-resolution-title" style={{ margin: 0 }}>{view.title}</h2><p style={{ margin: "6px 0 0", fontSize: 12, opacity: .75 }}>{view.summary}</p></div>
          {onCancel && <button ref={cancelButtonRef} type="button" onClick={onCancel}>Cancel</button>}
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, marginTop: 16 }}>
          <nav aria-label="Conflicts" style={{ display: "grid", alignContent: "start", gap: 5 }}>
            {view.panels.map((panel, index) => <button type="button" key={panel.id} onClick={() => setWorkingSession({ ...selectedSession, selected: index })} aria-pressed={index === view.selectedIndex} style={{ textAlign: "left", padding: 9 }}>
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
                {choices.map(choice => <button type="button" key={choice} onClick={() => choose(choice)}>{`Keep ${choice}`}</button>)}
                <button type="button" onClick={() => setWorkingSession(resolveAll(selectedSession, "local"))}>Resolve All Local</button>
              </div>
              <p style={{ fontSize: 11, opacity: .7 }}>Current: {current.choice ?? "unresolved"}</p>
            </article>;
          })()}
        </div>

        <footer style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
          <button type="button" disabled={!applyEnabled} onClick={() => onApply(selectedSession)}>Apply Merge</button>
        </footer>
      </div>
    </section>
  );
}
