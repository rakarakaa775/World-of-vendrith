"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; text: string };

const suggestions = [
  "Bagaimana kondisi project Vendrith saat ini?",
  "Apa saja bagian AI yang sudah selesai?",
  "Bagaimana status Map Editor dan World Builder?",
  "Apa yang masih belum terhubung ke runtime?",
  "Jelaskan kondisi asset library dan lisensinya.",
];

const initialMessages: Message[] = [
  { role: "assistant", text: "Halo. Saya Vendrith AI. Di sini kita akan menggunakan AI untuk membaca kondisi project, menjelaskan apa yang sudah selesai, apa yang masih tertunda, dan bukti teknis yang tersedia. Mode percakapan ini difokuskan pada analisis project terlebih dahulu; AI tidak mengubah project tanpa persetujuan." },
];

function projectSnapshotResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("ai")) return "AI core Vendrith sudah memiliki domain, policy approval, repository/codegraph/documentation/asset evidence, tool routing, verification, tool loop, orchestrator, dan improvement engine beserta test suite. Yang masih perlu diselesaikan adalah koneksi model provider/runtime sehingga percakapan AI dapat menghasilkan jawaban model secara langsung.";
  if (p.includes("asset") || p.includes("lisensi")) return "Asset Library sudah memiliki schema/inventory, registry adapter, dan policy penggunaan. World dibatasi untuk aset alam; struktur seperti bridge, dock, ship, town, village, road, dan building diarahkan ke Region. Aset yang lisensinya belum terbukti tidak boleh masuk registry sebagai aset yang jelas diizinkan.";
  if (p.includes("map editor") || p.includes("world builder")) return "Foundation Map Editor/World Builder sudah melewati type-check, build, dan test suite terakhir. Ukuran map yang didukung adalah 32×32, 64×64, dan 128×128. Terrain, layer, selection, save/load, diagnostics, dan terrain autotile foundation sudah tersedia.";
  if (p.includes("runtime") || p.includes("terhubung")) return "Bagian yang masih menjadi tahap runtime adalah model provider/API AI. Core AI sengaja dipisahkan dari Next.js dan bergantung pada ports/adapters, sehingga provider dapat dipasang tanpa mengubah policy dan domain.";
  return "Berdasarkan kondisi project yang sudah diverifikasi, foundation Vendrith sudah berjalan dan AI core sudah dibangun serta diuji. Untuk jawaban lebih spesifik, tanyakan status AI, Map Editor, World Builder, Asset Library, deployment, atau bagian yang masih belum terhubung.";
}

export default function VendrithAiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState("");
  const send = (value = prompt) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMessages(current => [...current, { role: "user", text: trimmed }, { role: "assistant", text: projectSnapshotResponse(trimmed) }]);
    setPrompt("");
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--map-editor-bg)", color: "var(--map-editor-text)", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--map-editor-line)", background: "var(--map-editor-panel)" }}>
        <button type="button" onClick={() => router.push("/")} style={{ padding: "7px 10px" }}>← Menu Utama</button>
        <div><strong style={{ fontSize: 18 }}>✦ Vendrith AI</strong><div style={{ fontSize: 11, color: "#94a3b8" }}>Project Intelligence · Read / Analyze</div></div>
        <span style={{ marginLeft: "auto", fontSize: 10, border: "1px solid #166534", color: "#86efac", borderRadius: 999, padding: "4px 8px" }}>AI CORE READY</span>
      </header>
      <section style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: 18, display: "grid", gridTemplateRows: "1fr auto", gap: 14, minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 260px", gap: 14, minHeight: 0 }}>
          <div style={{ border: "1px solid var(--map-editor-border)", borderRadius: 12, background: "var(--map-editor-panel)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--map-editor-line)", fontSize: 12, color: "#94a3b8" }}>PROJECT CONVERSATION</div>
            <div style={{ flex: 1, overflow: "auto", padding: 14, display: "grid", alignContent: "start", gap: 10 }}>
              {messages.map((message, index) => <div key={index} style={{ maxWidth: "85%", justifySelf: message.role === "user" ? "end" : "start", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--map-editor-border)", background: message.role === "user" ? "var(--map-editor-selected)" : "var(--map-editor-button)", lineHeight: 1.5, fontSize: 13, whiteSpace: "pre-wrap" }}>{message.text}</div>)}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid var(--map-editor-line)", display: "flex", gap: 8 }}>
              <textarea value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Tanyakan kondisi project Vendrith..." rows={2} style={{ flex: 1, resize: "none", padding: 10, borderRadius: 8, border: "1px solid var(--map-editor-border)", background: "var(--map-editor-button)", color: "#fff" }} />
              <button type="button" onClick={() => send()} disabled={!prompt.trim()} style={{ alignSelf: "stretch", padding: "0 16px" }}>Kirim</button>
            </div>
          </div>
          <aside style={{ border: "1px solid var(--map-editor-border)", borderRadius: 12, background: "var(--map-editor-panel)", padding: 14, height: "fit-content" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>TANYAKAN TENTANG PROJECT</div>
            <div style={{ display: "grid", gap: 7 }}>{suggestions.map(item => <button key={item} type="button" onClick={() => send(item)} style={{ textAlign: "left", padding: 9, borderRadius: 8, border: "1px solid var(--map-editor-border)", background: "var(--map-editor-button)", color: "#fff", fontSize: 11 }}>{item}</button>)}</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--map-editor-line)", fontSize: 10, lineHeight: 1.5, color: "#64748b" }}>Guardrail: AI membaca bukti project dan menjelaskan kondisi. Perubahan/mutasi tetap memerlukan approval.</div>
          </aside>
        </div>
        <div style={{ padding: "10px 12px", border: "1px solid #854d0e", borderRadius: 8, background: "rgba(120,80,10,.12)", fontSize: 11, color: "#cbd5e1" }}><strong>Runtime note:</strong> tampilan percakapan dan project-intelligence flow sudah disiapkan. Provider model eksternal masih menjadi langkah runtime berikutnya; jawaban di atas saat ini berasal dari snapshot project yang terverifikasi, bukan klaim bahwa model eksternal sudah terhubung.</div>
      </section>
    </main>
  );
}
