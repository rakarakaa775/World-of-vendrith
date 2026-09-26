"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "../../editor/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      setMessage("Password berhasil diperbarui. Kamu bisa kembali ke login.");
      setPassword("");
      setConfirmation("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset password gagal. Gunakan link reset terbaru.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="vandrith-home">
      <section className="vandrith-home-card">
        <p className="vandrith-kicker">WORLD OF VENDRITH</p>
        <h1>Reset Password</h1>
        <p className="vandrith-subtitle">Buat password baru untuk akun Vendrith.</p>
        <form className="vandrith-auth-panel" onSubmit={submit}>
          <label>Password baru<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
          <label>Konfirmasi password<input type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
          <button className="vandrith-auth-submit" disabled={busy}>{busy ? "Menyimpan..." : "Simpan Password Baru"}</button>
          {error && <p className="vandrith-auth-message">{error}</p>}
          {message && <p className="vandrith-auth-message">{message}</p>}
          <button type="button" className="vandrith-auth-forgot" onClick={() => router.push("/")}>Kembali ke Login</button>
        </form>
      </section>
    </main>
  );
}
