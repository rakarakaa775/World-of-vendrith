"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  text: string;
  evidence?: Array<{ source: string; fact: string; confidence: string }>;
  model?: string;
};

const suggestions = [
  "Bagaimana kondisi project Vendrith saat ini?",
  "Apa saja bagian AI yang sudah selesai?",
  "Bagaimana status Map Editor dan World Builder?",
  "Apa yang masih belum terhubung ke runtime?",
  "Jelaskan kondisi asset library dan lisensinya.",
];

const initialMessages: Message[] = [
  {
    role: "assistant",
    text: "Halo. Saya Vendrith AI. Sekarang jawaban tidak lagi berasal dari projectSnapshotResponse() hardcoded. Creator AI memakai model provider, agent orchestrator, project tools, dan evidence dari repository/asset registry. Mode ini tetap read/analyze; AI tidak mengubah project.",
  },
];

export default function VendrithAiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async (value = prompt) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setPrompt("");
    setError("");
    setMessages(current => [...current, { role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const response = await fetch("/api/vendrith-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, mode: "explain" }),
      });
      const result = await response.json() as {
        response?: string;
        model?: string;
        evidence?: Array<{ source: string; fact: string; confidence: string }>;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "AI request failed.");
      setMessages(current => [...current, {
        role: "assistant",
        text: result.response ?? "Model tidak mengembalikan jawaban.",
        evidence: result.evidence ?? [],
        model: result.model,
      }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Vendrith AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--map-editor-bg)", color: "var(--map-editor-text)", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--map-editor-line)", background: "var(--map-editor-panel)" }}>
        <button type="button" onClick={() => router.push("/")} style={{ padding: "7px 10px" }}>← Menu Utama</button>
        <div><strong style={{ fontSize: 18 }}>✦ Vendrith AI</strong><div style={{ fontSize: 11, color: "#94a3b8" }}>Creator AI · Model + Tools + Evidence</div></div>
        <span style={{ marginLeft: "auto", fontSize: 10, border: "1px solid #166534", color: "#86efac", borderRadius: 999, padding: "4px 8px" }}>{loading ? "AI THINKING…" : "AI CORE READY"}</span>
      </header>
      <section style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 18, display: "grid", gridTemplateRows: "1fr auto", gap: 14, minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 14, minHeight: 0 }}>
          <div style={{ border: "1px solid var(--map-editor-border)", borderRadius: 12, background: "var(--map-editor-panel)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--map-editor-line)", fontSize: 12, color: "#94a3b8" }}>CREATOR AI CONVERSATION</div>
            <div style={{ flex: 1, overflow: "auto", padding: 14, display: "grid", alignContent: "start", gap: 10 }}>
              {messages.map((message, index) => (
                <div key={index} style={{ maxWidth: "90%", justifySelf: message.role === "user" ? "end" : "start", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--map-editor-border)", background: message.role === "user" ? "var(--map-editor-selected)" : "var(--map-editor-button)", lineHeight: 1.5, fontSize: 13 }}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>
                  {message.model && <div style={{ marginTop: 8, fontSize: 10, color: "#86efac" }}>Model: {message.model}</div>}
                  {message.evidence && message.evidence.length > 0 && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ cursor: "pointer", fontSize: 10, color: "#94a3b8" }}>Evidence ({message.evidence.length})</summary>
                      <div style={{ marginTop: 7, display: "grid", gap: 5 }}>
                        {message.evidence.map((item, evidenceIndex) => (
                          <div key={evidenceIndex} style={{ fontSize: 10, padding: 7, border: "1px solid var(--map-editor-line)", borderRadius: 7 }}>
                            <strong>{item.source}</strong> · {item.confidence}<div>{item.fact}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
              {loading && <div style={{ fontSize: 12, color: "#94a3b8" }}>Creator AI sedang membaca project dan memilih tools yang diperlukan…</div>}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid var(--map-editor-line)", display: "flex", gap: 8 }}>
              <textarea value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Tanyakan kondisi project Vendrith..." rows={2} style={{ flex: 1, resize: "none", padding: 10, borderRadius: 8, border: "1px solid var(--map-editor-border)", background: "var(--map-editor-button)", color: "#fff" }} />
              <button type="button" onClick={() => void send()} disabled={!prompt.trim() || loading} style={{ alignSelf: "stretch", padding: "0 16px" }}>{loading ? "…" : "Kirim"}</button>
            </div>
            {error && <div style={{ margin: "0 12px 12px", padding: 9, borderRadius: 7, border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: 11 }}>{error}</div>}
          </div>
          <aside style={{ border: "1px solid var(--map-editor-border)", borderRadius: 12, background: "var(--map-editor-panel)", padding: 14, height: "fit-content" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>TANYAKAN TENTANG PROJECT</div>
            <div style={{ display: "grid", gap: 7 }}>{suggestions.map(item => <button key={item} type="button" onClick={() => void send(item)} disabled={loading} style={{ textAlign: "left", padding: 9, borderRadius: 8, border: "1px solid var(--map-editor-border)", background: "var(--map-editor-button)", color: "#fff", fontSize: 11 }}>{item}</button>)}</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--map-editor-line)", fontSize: 10, lineHeight: 1.5, color: "#64748b" }}>Guardrail: model hanya memberi jawaban berdasarkan prompt + evidence tools. Tool mutation tetap diblokir tanpa approval.</div>
          </aside>
        </div>
        <div style={{ padding: "10px 12px", border: "1px solid #166534", borderRadius: 8, background: "rgba(20,100,50,.10)", fontSize: 11, color: "#cbd5e1" }}><strong>Runtime status:</strong> Creator AI sekarang memakai ModelProvider → Agent Orchestrator → tools → evidence → response. API key model dibaca server-side dari <code>AI_GATEWAY_API_KEY</code>; tidak pernah dikirim ke browser.</div>
      </section>
    </main>
  );
}
