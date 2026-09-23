"use client";

import { FormEvent, useState } from "react";
import { signInWithUsername, signUpWithUsername } from "../editor/auth";

export function AuthPanel({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") {
        await signInWithUsername(username, password);
        onSuccess();
      } else {
        const result = await signUpWithUsername(username, password);
        setMessage(result.sessionCreated
          ? "Akun berhasil dibuat. Kamu sudah masuk."
          : "Akun berhasil dibuat. Jika verifikasi email masih aktif di Supabase, matikan Email Confirmation agar login langsung.");
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
        <label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
        <button className="vandrith-auth-submit" disabled={busy}>{busy ? "Memproses..." : mode === "login" ? "Login" : "Buat Akun"}</button>
      </form>
      {message && <p className="vandrith-auth-message">{message}</p>}
    </section>
  );
}
