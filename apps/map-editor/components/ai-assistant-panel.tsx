"use client";

import { useState } from "react";

type AiMode = "read" | "plan" | "execute";

const MODE_COPY: Record<AiMode, { label: string; description: string }> = {
  read: { label: "Read", description: "Baca repository dan bukti project tanpa mengubah apa pun." },
  plan: { label: "Plan", description: "Susun rencana perubahan; belum mengeksekusi mutasi." },
  execute: { label: "Execute", description: "Perubahan memerlukan approval eksplisit sebelum tool mutasi berjalan." },
};

export function AiAssistantPanel() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AiMode>("plan");
  const [prompt, setPrompt] = useState("");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Vendrith AI"
        aria-expanded={open}
        style={{
          padding: "6px 11px",
          borderRadius: 6,
          border: "1px solid var(--map-editor-border)",
          background: open ? "var(--map-editor-selected)" : "var(--map-editor-button)",
          color: "#fff",
          fontWeight: 700,
        }}
      >
        ✦ AI
      </button>

      {open && (
        <aside
          aria-label="Vendrith AI Assistant"
          style={{
            position: "fixed",
            zIndex: 1000,
            top: 12,
            right: 12,
            width: "min(380px, calc(100vw - 24px))",
            maxHeight: "calc(100vh - 24px)",
            overflow: "auto",
            padding: 14,
            border: "1px solid var(--map-editor-border)",
            borderRadius: 12,
            background: "var(--map-editor-panel)",
            color: "var(--map-editor-text)",
            boxShadow: "0 18px 50px rgba(0,0,0,.45)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <strong style={{ fontSize: 16 }}>✦ Vendrith AI</strong>
            <span style={{ marginLeft: "auto", fontSize: 10, padding: "3px 7px", borderRadius: 999, border: "1px solid #166534", color: "#86efac" }}>
              CORE READY
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Vendrith AI" style={{ padding: "3px 7px" }}>×</button>
          </div>

          <div style={{ padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #854d0e", background: "rgba(120,80,10,.12)", fontSize: 11, lineHeight: 1.45 }}>
            <strong>Runtime provider belum terhubung.</strong>
            <div style={{ marginTop: 3, color: "#cbd5e1" }}>
              AI policy, tools, approval, evidence, dan improvement engine sudah ada di core. UI ini menjadi pintu masuknya; koneksi model provider/API adalah langkah runtime berikutnya.
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>MODE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
            {(Object.keys(MODE_COPY) as AiMode[]).map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                aria-pressed={mode === item}
                style={{
                  padding: "7px 4px",
                  borderRadius: 7,
                  border: "1px solid var(--map-editor-border)",
                  background: mode === item ? "var(--map-editor-selected)" : "var(--map-editor-button)",
                  color: "#fff",
                }}
              >
                {MODE_COPY[item].label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>{MODE_COPY[mode].description}</div>
          <textarea
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            placeholder="Contoh: Analisis terrain world dan jelaskan perubahan yang aman."
            rows={5}
            aria-label="AI prompt"
            style={{
              width: "100%",
              resize: "vertical",
              boxSizing: "border-box",
              padding: 9,
              borderRadius: 8,
              border: "1px solid var(--map-editor-border)",
              background: "var(--map-editor-button)",
              color: "#fff",
              marginBottom: 8,
            }}
          />
          <button
            type="button"
            disabled
            title="Hubungkan model provider/API untuk mengaktifkan AI runtime"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid var(--map-editor-border)", opacity: .55 }}
          >
            Run AI — provider belum terhubung
          </button>

          <div style={{ marginTop: 12, fontSize: 10, lineHeight: 1.5, color: "#64748b" }}>
            Guardrail: model mengusulkan · policy Vendrith memutuskan · tools mengeksekusi · verification membuktikan hasil.
          </div>
        </aside>
      )}
    </>
  );
}
