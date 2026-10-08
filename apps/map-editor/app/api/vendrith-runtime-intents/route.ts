import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseRuntimeIntentConsumer } from "../../../ai/application/supabase-runtime-intent-executor";

export const runtime = "nodejs";

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ojtmfokjcirvjvhnbnos.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?? "sb_publishable_DIe0amy6Q4qVXV6srZTCRQ_DHe6NANN";
  return createClient(
    url,
    key,
    accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : undefined,
  );
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

/**
 * Explicit runtime execution boundary.
 * Creator AI only queues an approved intent; this route is the separate
 * authenticated consumer that claims and executes that intent.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    const body = await request.json() as { intentId?: unknown };
    const intentId = typeof body.intentId === "string" ? body.intentId.trim() : "";
    if (!/^[0-9a-fA-F-]{36}$/.test(intentId)) {
      return NextResponse.json({ error: "A valid runtime intent id is required." }, { status: 400 });
    }

    const result = await createSupabaseRuntimeIntentConsumer(createSupabase(auth.token)).consume(intentId);
    if (result.ok) return NextResponse.json(result, { status: 200 });
    if (result.status === "rejected") return NextResponse.json(result, { status: 422 });
    return NextResponse.json(result, { status: 409 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Runtime intent execution failed." },
      { status: 500 },
    );
  }
}
