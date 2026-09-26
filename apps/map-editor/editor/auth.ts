"use client";

import { useEffect, useState } from "react";
import { createMapEditorSupabaseClient } from "./supabase-client";

export type AuthUser = { id: string; username: string };

export async function loadCurrentAuthUser(): Promise<AuthUser | null> {
  const client = createMapEditorSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const username = typeof user.user_metadata?.username === "string"
    ? user.user_metadata.username
    : user.email?.split("@")[0] ?? "Vandrith User";
  return { id: user.id, username };
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = createMapEditorSupabaseClient();
    if (!client) { setLoading(false); return; }
    void loadCurrentAuthUser().then(setUser).finally(() => setLoading(false));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      if (!authUser) { setUser(null); return; }
      const username = typeof authUser.user_metadata?.username === "string"
        ? authUser.user_metadata.username
        : authUser.email?.split("@")[0] ?? "Vandrith User";
      setUser({ id: authUser.id, username });
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { user, loading };
}

export async function signInWithEmail(email: string, password: string) {
  const client = createMapEditorSupabaseClient();
  if (!client) throw new Error("Supabase Auth belum dikonfigurasi.");
  const { error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
  const { error: claimError } = await client.rpc("claim_vandrith_legacy_save_slots_v1");
  if (claimError) throw claimError;
}

export async function signUpWithEmail(email: string, password: string, username?: string) {
  const client = createMapEditorSupabaseClient();
  if (!client) throw new Error("Supabase Auth belum dikonfigurasi.");
  const cleanEmail = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error("Masukkan alamat email yang valid.");
  if (password.length < 8) throw new Error("Password minimal 8 karakter.");
  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { username: username?.trim() || cleanEmail.split("@")[0] } },
  });
  if (error) throw error;
  if (data.session) {
    const { error: claimError } = await client.rpc("claim_vandrith_legacy_save_slots_v1");
    if (claimError) throw claimError;
  }
  return { sessionCreated: Boolean(data.session), emailConfirmationRequired: !data.session };
}

export async function requestPasswordReset(email: string) {
  const client = createMapEditorSupabaseClient();
  if (!client) throw new Error("Supabase Auth belum dikonfigurasi.");
  const cleanEmail = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error("Masukkan alamat email yang valid.");
  const redirectTo = typeof window !== "undefined"
    ? new URL("/reset-password", window.location.origin).toString()
    : undefined;
  const { error } = await client.auth.resetPasswordForEmail(cleanEmail, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const client = createMapEditorSupabaseClient();
  if (!client) throw new Error("Supabase Auth belum dikonfigurasi.");
  if (password.length < 8) throw new Error("Password minimal 8 karakter.");
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const client = createMapEditorSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}
