import type { SupabaseClient } from "@supabase/supabase-js";

export interface RuntimeIntentReconciliationResult {
  ok: boolean;
  code?: string;
  status?: string;
  alreadyConsumed?: boolean;
  reconciled?: boolean;
  mutationId?: string;
  sequence?: number;
  stateVersion?: string;
  stateHash?: string;
  verified?: boolean;
  checkpointSaved?: boolean;
  automaticRetry?: boolean;
  result?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/**
 * Reconcile an interrupted runtime intent from its durable journal.
 * This RPC never re-executes the action; it only confirms journal evidence.
 */
export async function reconcileSupabaseRuntimeIntent(
  client: SupabaseClient,
  intentId: string,
): Promise<RuntimeIntentReconciliationResult> {
  if (!intentId.trim()) {
    return { ok: false, code: "INTENT_ID_REQUIRED" };
  }

  const response = await client.rpc("reconcile_vendrith_runtime_intent_v1", {
    p_intent_id: intentId,
  });

  if (response.error) {
    throw new Error("RUNTIME_INTENT_RECONCILIATION_ERROR: " + response.error.message);
  }

  const value: unknown = response.data;
  if (!value || typeof value !== "object" || Array.isArray(value) || typeof (value as Record<string, unknown>).ok !== "boolean") {
    throw new Error("RUNTIME_INTENT_RECONCILIATION_INVALID_RESPONSE");
  }

  return value as RuntimeIntentReconciliationResult;
}
