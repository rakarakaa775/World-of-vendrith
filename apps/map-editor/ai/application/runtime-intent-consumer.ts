import type { SupabaseClient } from "@supabase/supabase-js";
import type { RuntimeAction, RuntimeAiRequest } from "../domain/runtime";
import { resolveAuthoritativeMap } from "../../editor/map-authoritative-resolver";

export interface RuntimeIntentRecord {
  intentId: string; proposalId: string;
  contextType: "world" | "region" | "playable"; contextId: string;
  runtimeSurface: "engine" | "game"; action: Record<string, unknown>;
}
export interface RuntimeIntentExecutionResult { ok: boolean; result: Record<string, unknown>; }
export interface RuntimeIntentExecutor {
  execute(input: { intent: RuntimeIntentRecord; request: RuntimeAiRequest; action: RuntimeAction }): Promise<RuntimeIntentExecutionResult>;
}
function asRuntimeAction(value: unknown): RuntimeAction | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const c = value as Record<string, unknown>;
  if (typeof c.id !== "string" || typeof c.intelligence !== "string" || typeof c.type !== "string" || !c.payload || typeof c.payload !== "object" || typeof c.risk !== "string" || typeof c.reason !== "string") return null;
  if (!["world","npc","dialogue","event","life"].includes(c.intelligence as string)) return null;
  if (!["safe","game-rule","high-risk"].includes(c.risk as string)) return null;
  return c as unknown as RuntimeAction;
}
function contextMapType(type: RuntimeIntentRecord["contextType"]) { return type === "world" ? "world" : type === "region" ? "region" : "playable"; }

/** Consumes an approved intent only through an injected authoritative runtime executor. */
export function createRuntimeIntentConsumer(client: SupabaseClient, executor: RuntimeIntentExecutor) {
  return {
    async consume(intentId: string) {
      const claimed = await client.rpc("claim_vendrith_runtime_intent_v1", { p_intent_id: intentId });
      if (claimed.error) throw new Error("RUNTIME_INTENT_CLAIM_ERROR: " + claimed.error.message);
      if (claimed.data?.ok !== true) return claimed.data;
      const d = claimed.data as Record<string, unknown>;
      const intent: RuntimeIntentRecord = {
        intentId: String(d.intent_id), proposalId: String(d.proposal_id),
        contextType: d.context_type as RuntimeIntentRecord["contextType"], contextId: String(d.context_id),
        runtimeSurface: d.runtime_surface as RuntimeIntentRecord["runtimeSurface"], action: d.action as Record<string, unknown>,
      };
      const finish = async (status: "consumed" | "rejected" | "failed", result: Record<string, unknown>) =>
        client.rpc("finish_vendrith_runtime_intent_v1", { p_intent_id: intent.intentId, p_status: status, p_result: result });
      try {
        const resolved = await resolveAuthoritativeMap(client, intent.contextId, contextMapType(intent.contextType));
        const action = asRuntimeAction(intent.action.runtimeAction);
        if (!action) {
          const result = { code: "RUNTIME_ACTION_REQUIRED", detail: "Approved creator proposal does not contain a canonical runtimeAction.", authoritativeMapVersion: resolved.version };
          await finish("rejected", result); return { ok: false, status: "rejected", result };
        }
        const request: RuntimeAiRequest = {
          id: "runtime-intent:" + intent.intentId, surface: intent.runtimeSurface, intelligence: action.intelligence,
          observation: { id: "runtime-intent:" + intent.intentId + ":observation:" + resolved.version, surface: intent.runtimeSurface, intelligence: action.intelligence,
            state: { worldId: resolved.row.world_id ?? resolved.document.id, clock: { tick: 0, day: 0, hour: 0, minute: 0, season: "unknown" }, activeEventIds: [], stateVersion: "authoritative-map:" + resolved.version }, facts: [] },
          goal: action.reason,
        };
        const execution = await executor.execute({ intent, request, action });
        const status = execution.ok ? "consumed" : "failed";
        await finish(status, execution.result);
        return { ok: execution.ok, status, result: execution.result };
      } catch (error) {
        const result = { code: "RUNTIME_INTENT_EXECUTION_ERROR", detail: error instanceof Error ? error.message : String(error) };
        await finish("failed", result); return { ok: false, status: "failed", result };
      }
    },
  };
}