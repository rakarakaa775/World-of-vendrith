import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment is not configured.");
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

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    const body = await request.json() as { proposalId?: string; approve?: boolean };
    if (!body.proposalId || !/^[0-9a-fA-F-]{36}$/.test(body.proposalId)) {
      return NextResponse.json({ error: "A valid proposalId is required." }, { status: 400 });
    }
    if (body.approve !== true) {
      return NextResponse.json({
        error: "Explicit approval is required.",
        code: "DEVELOPMENT_APPROVAL_REQUIRED",
      }, { status: 403 });
    }

    const supabase = createSupabase(auth.token);
    const { data, error } = await supabase.rpc("approve_vendrith_development_action_v1", {
      p_proposal_id: body.proposalId,
    });

    if (error) {
      const message = error.message ?? "Development action approval failed.";
      const status = message.includes("not found") ? 404 : message.includes("not pending") ? 409 : 422;
      return NextResponse.json({ error: message, code: "DEVELOPMENT_APPROVAL_REJECTED" }, { status });
    }

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      approved: true,
      execution: "ready_after_approval",
      proposal: row ?? null,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Development approval request failed.",
    }, { status: 500 });
  }
}
