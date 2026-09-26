"use client";

import { FormEvent, useState } from "react";
import { requestPasswordReset, signInWithEmail, signUpWithEmail } from "../editor/auth";

export function AuthPanel({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "forgot") {
        await requestPasswordReset(email);
        setMessage("Jika email terdaftar, link reset password sudah dikirim. Periksa inbox dan folder spam.");
      } else if (mode === "login") {
        await signInWithEmail(email, password);
        onSuccess();
      } else {
        const result = await signUpWithEmail(email, password, displayName);
        setMessage(result.sessionCreated
          ? "Akun berhasil dibuat. Kamu sudah masuk."
          : "Akun berhasil dibuat. Jika verifikasi email aktif, periksa inbox untuk mengonfirmasi akun sebelum login.");
        if (result.sessionCreated) onSuccess();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Autentikasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="vandrith-auth-panel">
      <div className="vandrith-auth-tabs">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Buat Akun</button>
      </div>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" inputMode="email" required /></label>
        {mode === "register" && <label>Nama tampilan (opsional)<input value={displayName} onChange={e => setDisplayName(e.target.value)} autoComplete="nickname" /></label>}
        {mode !== "forgot" && <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>}
        {mode === "login" && <button type="button" className="vandrith-auth-forgot" onClick={() => { setMode("forgot"); setMessage(""); }}>Lupa password?</button>}
        <button className="vandrith-auth-submit" disabled={busy}>{busy ? "Memproses..." : mode === "forgot" ? "Kirim Link Reset" : mode === "login" ? "Login" : "Buat Akun"}</button>
      </form>
      {mode === "forgot" && <button type="button" className="vandrith-auth-forgot" onClick={() => { setMode("login"); setMessage(""); }}>← Kembali ke Login</button>}
      {message && <p className="vandrith-auth-message">{message}</p>}
    </section>
  );
}
