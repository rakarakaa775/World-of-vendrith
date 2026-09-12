"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class MapEditorErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Vandrith Map Editor] client render error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main style={{ minHeight: "100vh", padding: 24, background: "#020617", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <section style={{ maxWidth: 760, margin: "48px auto", padding: 24, border: "1px solid #7f1d1d", borderRadius: 14, background: "#111827" }}>
          <h1 style={{ marginTop: 0 }}>Vandrith Map Editor mengalami error</h1>
          <p style={{ color: "#cbd5e1" }}>
            Editor sengaja dihentikan supaya error tidak membuat seluruh halaman blank. Detail di bawah bisa dipakai untuk memperbaiki deployment berikutnya.
          </p>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 14, borderRadius: 10, background: "#020617", color: "#fecaca" }}>
            {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "9px 14px", borderRadius: 8, border: "1px solid #475569", background: "#1e293b", color: "#fff", fontWeight: 700 }}>
            Muat ulang editor
          </button>
        </section>
      </main>
    );
  }
}
