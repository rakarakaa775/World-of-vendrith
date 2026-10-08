import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGitHubDevelopmentRepositoryExecutor } from "../../../../ai";

export const runtime = "nodejs";

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

    const body = await request.json() as { proposalId?: string; approvalId?: string };
    if (!body.proposalId || !/^[0-9a-fA-F-]{36}$/.test(body.proposalId)) {
      return NextResponse.json({ error: "A valid proposalId is required." }, { status: 400 });
    }
    if (!body.approvalId || !/^[0-9a-fA-F-]{36}$/.test(body.approvalId)) {
      return NextResponse.json({ error: "A valid approvalId is required." }, { status: 400 });
    }

    const supabase = createSupabase(auth.token);
    const { data: proposal, error } = await supabase
      .from("vendrith_development_action_proposals")
      .select("*")
      .eq("id", body.proposalId)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 422 });
    if (!proposal) return NextResponse.json({ error: "Development proposal not found." }, { status: 404 });
    if (proposal.status !== "approved") return NextResponse.json({ error: "Development proposal is not approved." }, { status: 409 });
    if (proposal.approval_id !== body.approvalId) return NextResponse.json({ error: "Approval binding mismatch." }, { status: 403 });

    if (proposal.action_type !== "repository_write") {
      return NextResponse.json({ error: "Only repository_write execution is connected.", code: "DEVELOPMENT_ACTION_NOT_CONNECTED" }, { status: 403 });
    }

    const executor = createGitHubDevelopmentRepositoryExecutor({
      owner: process.env.VENDRITH_GITHUB_OWNER ?? "rakarakaa775",
      repository: process.env.VENDRITH_GITHUB_REPOSITORY ?? "World-of-vendrith",
      ref: process.env.VENDRITH_GITHUB_REF ?? "feat/vendrith-ecc-v1",
    });

    let result: Record<string, unknown>;
    try {
      result = await executor.execute({
        id: proposal.id,
        userId: proposal.user_id,
        actionType: proposal.action_type,
        action: proposal.action,
        rationale: proposal.rationale,
        status: proposal.status,
        approvalId: proposal.approval_id ?? undefined,
        result: proposal.result ?? null,
        createdAt: proposal.created_at,
        updatedAt: proposal.updated_at,
      });
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : "Development execution failed.",
        code: "DEVELOPMENT_EXECUTION_FAILED",
        retryable: true,
      }, { status: 422 });
    }

    const { data: finalized, error: finalizeError } = await supabase.rpc("finalize_vendrith_development_action_v1", {
      p_proposal_id: proposal.id,
      p_approval_id: body.approvalId,
      p_status: "succeeded",
      p_result: result,
    });

    if (finalizeError) {
      return NextResponse.json({
        error: finalizeError.message,
        code: "DEVELOPMENT_EXECUTION_FINALIZE_FAILED",
        retryable: true,
        result,
      }, { status: 500 });
    }

    return NextResponse.json({
      executed: true,
      verified: true,
      proposal: Array.isArray(finalized) ? finalized[0] ?? null : finalized ?? null,
      result,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Development execution request failed." }, { status: 500 });
  }
}
