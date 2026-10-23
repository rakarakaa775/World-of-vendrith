import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatedNpcRuntimeSpawnContract } from "../../../ai/application/npc-runtime-spawn-contract";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 64 * 1024;

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment is not configured.");
  return createClient(url, key, accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : undefined);
}

async function authenticate(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;
  const supabase = createSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return null;
  return { token, user: data.user };
}

/** Persist only the authenticated user's override; never write shared NPC seed metadata. */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ error: "NPC runtime contract payload is too large." }, { status: 413 });
    let body: { seedKey?: unknown; runtimeContract?: unknown };
    try { body = JSON.parse(raw) as typeof body; } catch { return NextResponse.json({ error: "A valid JSON payload is required." }, { status: 400 }); }
    const seedKey = typeof body.seedKey === "string" ? body.seedKey.trim() : "";
    if (!seedKey || seedKey.length > 200 || /[\u0000-\u001f]/.test(seedKey)) {
      return NextResponse.json({ error: "A valid NPC seedKey is required." }, { status: 400 });
    }
    const runtimeContract = validatedNpcRuntimeSpawnContract(body.runtimeContract);
    if (!runtimeContract) return NextResponse.json({ error: "NPC runtime contract failed validation." }, { status: 422 });

    const client = createSupabase(auth.token);
    const { data, error } = await client
      .from("npc_creator_runtime_contract_overrides")
      .upsert({ seed_key: seedKey, created_by: auth.user.id, runtime_contract: runtimeContract }, { onConflict: "seed_key,created_by" })
      .select("seed_key,updated_at")
      .single();
    if (error) {
      const status = error.code === "23503" ? 404 : error.code === "42501" ? 403 : 422;
      return NextResponse.json({ error: error.message, code: error.code ?? "NPC_CONTRACT_PERSISTENCE_FAILED" }, { status });
    }
    return NextResponse.json({ saved: true, seedKey: data.seed_key, updatedAt: data.updated_at }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "NPC runtime contract persistence failed." }, { status: 500 });
  }
}
