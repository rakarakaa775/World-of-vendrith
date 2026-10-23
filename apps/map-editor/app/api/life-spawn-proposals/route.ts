import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PersistentWebAiSessionStore } from "../../../ai/application/persistent-ai-session";
import { resolveAuthoritativeMap } from "../../../editor/map-authoritative-resolver";
import { buildLifeSpawnReference } from "../../../editor/life-spawn-reference";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 32 * 1024;
const validMapId = /^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,127}$/;

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment is not configured.");
  return createClient(url, key, accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : undefined);
}

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await createSupabase().auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return null;
  return { token, user: data.user };
}

/** Create a persisted, approval-gated Life spawn proposal; never mutate runtime here. */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Silakan login terlebih dahulu dengan akun terautentikasi." }, { status: 401 });
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ error: "Payload proposal terlalu besar." }, { status: 413 });
    let body: { mapId?: unknown; life?: unknown; x?: unknown; y?: unknown };
    try { body = JSON.parse(raw) as typeof body; } catch { return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 }); }
    if (typeof body.mapId !== "string" || !validMapId.test(body.mapId)) return NextResponse.json({ error: "ID map otoritatif tidak valid." }, { status: 400 });
    if (!Number.isInteger(body.x) || !Number.isInteger(body.y) || (body.x as number) < 0 || (body.y as number) < 0) {
      return NextResponse.json({ error: "Koordinat spawn harus berupa tile integer non-negatif." }, { status: 400 });
    }

    const client = createSupabase(auth.token);
    const resolved = await resolveAuthoritativeMap(client, body.mapId, "playable");
    const x = body.x as number;
    const y = body.y as number;
    if (x >= resolved.document.width || y >= resolved.document.height) return NextResponse.json({ error: "Koordinat spawn berada di luar batas map otoritatif." }, { status: 422 });
    const worldId = resolved.row.world_id ?? resolved.document.id;
    const lifeReference = buildLifeSpawnReference(body.life, { worldId, x, y });
    const sessionStore = new PersistentWebAiSessionStore(client, auth.user.id);
    const session = await sessionStore.createSession("Generate Life · Spawn approval", { type: "playable", id: resolved.document.id });
    const runtimeAction = {
      id: `spawn-life-${lifeReference.lifeId}`,
      intelligence: "life",
      type: "life.spawn",
      payload: { mapId: resolved.document.id, lifeReference },
      risk: "game-rule",
      reason: `Spawn Life ${lifeReference.displayName} pada map otoritatif ${resolved.document.id} di tile (${x}, ${y}).`,
    };
    const action = { operation: "create", mapId: resolved.document.id, runtimeAction, lifeReference };
    const { data: proposal, error } = await client.from("vendrith_creator_action_proposals").insert({
      user_id: auth.user.id,
      session_id: session.id,
      context_type: "playable",
      context_id: resolved.document.id,
      map_id: resolved.document.id,
      operation: "create",
      action,
      rationale: `Generate Life proposal; authoritative map version ${resolved.version}. Spawn remains pending until explicit approval and runtime execution.`,
    }).select("id").single();
    if (error || !proposal) return NextResponse.json({ error: error?.message ?? "Proposal gagal disimpan." }, { status: 422 });
    return NextResponse.json({ proposalId: proposal.id, sessionId: session.id, mapId: resolved.document.id, worldId, mapVersion: resolved.version, status: "pending_approval" }, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Life spawn proposal gagal dibuat.";
    const status = detail.includes("IDENTITY_ERROR") || detail.includes("MAP_IDENTITY_ERROR") ? 422 : 500;
    return NextResponse.json({ error: detail }, { status });
  }
}
