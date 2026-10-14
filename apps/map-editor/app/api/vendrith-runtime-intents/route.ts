import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseRuntimeIntentConsumer } from "../../../ai/application/supabase-runtime-intent-executor";

export const runtime = "nodejs";

function createSupabase(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Runtime execution must fail closed when Supabase configuration is absent.
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

/**
 * Explicit runtime execution boundary.
 * Creator AI only queues an approved intent; this route is the separate
 * authenticated consumer that claims and executes that intent.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or expired authentication session." }, { status: 401 });

    const body = await request.json() as { intentId?: unknown; retry?: unknown; reconcile?: unknown };
    const intentId = typeof body.intentId === "string" ? body.intentId.trim() : "";
    if (!/^[0-9a-fA-F-]{36}$/.test(intentId)) {
      return NextResponse.json({ error: "A valid runtime intent id is required." }, { status: 400 });
    }

    const client = createSupabase(auth.token);
    const consumer = createSupabaseRuntimeIntentConsumer(client);

    // Recovery is read/reconcile-only: it confirms durable journal evidence and
    // never re-executes an interrupted action. Callers can explicitly request it
    // after a timeout/restart with { reconcile: true }.
    if (body.reconcile === true) {
      const reconciliation = await consumer.reconcile(intentId);
      if (reconciliation.ok) return NextResponse.json(reconciliation, { status: 200 });
      if (reconciliation.code === "RUNTIME_RECONCILIATION_PENDING") {
        return NextResponse.json(reconciliation, { status: 409 });
      }
      if (reconciliation.code === "INTENT_NOT_RECONCILABLE") {
        return NextResponse.json(reconciliation, { status: 409 });
      }
      return NextResponse.json(reconciliation, { status: 422 });
    }

    if (body.retry === true) {
      const retry = await client.rpc("retry_vendrith_runtime_intent_v1", { p_intent_id: intentId });
      if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
      if (retry.data?.ok !== true) return NextResponse.json(retry.data, { status: 409 });
    }

    const result = await consumer.consume(intentId);
    if (result.result?.reconciliationRequired === true) {
      // A finish RPC can fail after the mutation journal committed. Reconcile
      // only from that durable evidence; do not blindly consume/retry again.
      try {
        const reconciliation = await consumer.reconcile(intentId);
        if (reconciliation.ok) return NextResponse.json(reconciliation, { status: 200 });
        return NextResponse.json({ ...result, reconciliation }, { status: 409 });
      } catch (reconciliationError) {
        return NextResponse.json({
          ...result,
          reconciliationError: reconciliationError instanceof Error ? reconciliationError.message : String(reconciliationError),
        }, { status: 409 });
      }
    }
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
