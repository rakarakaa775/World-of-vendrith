import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createDevelopmentActionProposalStore, type DevelopmentActionType } from "../../../ai";

export const runtime = "nodejs";
const MAX_RATIONALE_LENGTH = 4000;
const MAX_ACTION_BYTES = 600 * 1024;

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

export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    const body = await request.json() as {
      actionType?: DevelopmentActionType;
      action?: Record<string, unknown>;
      rationale?: string;
    };
    if (!body.actionType || !["repository_write", "database_write", "deployment"].includes(body.actionType)) {
      return NextResponse.json({ error: "Unsupported development action type." }, { status: 400 });
    }
    if (!body.action || typeof body.action !== "object" || Array.isArray(body.action)) {
      return NextResponse.json({ error: "A structured action object is required." }, { status: 400 });
    }
    const rationale = body.rationale?.trim();
    if (!rationale) return NextResponse.json({ error: "Rationale is required." }, { status: 400 });
    if (rationale.length > MAX_RATIONALE_LENGTH) return NextResponse.json({ error: "Rationale is too long." }, { status: 413 });
    if (JSON.stringify(body.action).length > MAX_ACTION_BYTES) return NextResponse.json({ error: "Action payload is too large." }, { status: 413 });

    const proposal = await createDevelopmentActionProposalStore(createSupabase(auth.token)).create({
      userId: auth.user.id,
      actionType: body.actionType,
      action: body.action,
      rationale,
    });

    return NextResponse.json({ proposal, approvalRequired: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Development proposal creation failed." }, { status: 500 });
  }
}
