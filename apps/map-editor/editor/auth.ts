"use client";

import { useEffect, useState } from "react";
import { createMapEditorSupabaseClient } from "./supabase-client";

export type AuthUser = { id: string; username: string };

function authEmail(username: string) {
  return `${username.trim().toLowerCase()}@vandrith.local`;
}

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

export async function signInWithUsername(username: string, password: string) {
  const client = createMapEditorSupabaseClient();
  if (!client) throw new Error("Supabase Auth belum dikonfigurasi.");
  const { error } = await client.auth.signInWithPassword({ email: authEmail(username), password });
  if (error) throw error;
  const { error: claimError } = await client.rpc("claim_vandrith_legacy_save_slots_v1");
  if (claimError) throw claimError;
}

export async function signUpWithUsername(username: string, password: string) {
  const client = createMapEditorSupabaseClient();
  if (!client) throw new Error("Supabase Auth belum dikonfigurasi.");
  const clean = username.trim();
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(clean)) throw new Error("Username 3-32 karakter: huruf, angka, dan underscore.");
  if (password.length < 6) throw new Error("Password minimal 6 karakter.");
  const { data, error } = await client.auth.signUp({
    email: authEmail(clean),
    password,
    options: { data: { username: clean } },
  });
  if (error) throw error;
  if (data.session) {
    const { error: claimError } = await client.rpc("claim_vandrith_legacy_save_slots_v1");
    if (claimError) throw claimError;
  }
  return { sessionCreated: Boolean(data.session) };
}

export async function signOut() {
  const client = createMapEditorSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}
