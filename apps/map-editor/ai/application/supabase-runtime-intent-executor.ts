import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RuntimeAction } from "../domain/runtime";
import type { RuntimeAiRequest } from "../domain/runtime";
import { createSupabaseRuntimeWorldAdapter } from "./supabase-runtime-world-adapter";
import { createSupabaseRuntimeEngine } from "./supabase-runtime-engine";
import { createRuntimeIntentConsumer, type RuntimeIntentExecutor, type RuntimeIntentRecord, type RuntimeIntentExecutionResult } from "./runtime-intent-consumer";

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
  const record = value as Record<string, unknown>;
  return "{" + Object.keys(record).sort().map(key => JSON.stringify(key) + ":" + stableJson(record[key])).join(",") + "}";
}

function stateHash(state: unknown): string {
  return createHash("sha256").update(stableJson(state)).digest("hex");
}

function firstRow<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

/**
 * Canonical approved-intent executor.
 *
 * It deliberately reuses the existing Supabase runtime engine/bridge instead
 * of creating a second mutation authority. The approved action is executed
 * against the authoritative map snapshot, verified, then committed to the
 * existing runtime mutation journal under a world lease.
 */
export function createSupabaseRuntimeIntentExecutor(
  client: SupabaseClient,
): RuntimeIntentExecutor {
  return {
    async execute({ intent, request, action }: {
      intent: RuntimeIntentRecord;
      request: RuntimeAiRequest;
      action: RuntimeAction;
    }): Promise<RuntimeIntentExecutionResult> {
      const worldId = request.observation.state.worldId;
      const leaseToken = randomUUID();

      const leaseResponse = await client.rpc("acquire_world_runtime_lease_v1", {
        p_world_id: worldId,
        p_lease_token: leaseToken,
        p_duration_seconds: 15,
      });
      if (leaseResponse.error) {
        return { ok: false, result: { code: "RUNTIME_LEASE_ERROR", detail: leaseResponse.error.message } };
      }
      const lease = firstRow(leaseResponse.data as unknown as Record<string, unknown>[] | Record<string, unknown> | null);
      if (lease?.acquired !== true) {
        return { ok: false, result: { code: "RUNTIME_LEASE_UNAVAILABLE", detail: "Runtime authority lease could not be acquired." } };
      }

      const adapter = createSupabaseRuntimeWorldAdapter(client);
      const engine = await createSupabaseRuntimeEngine(adapter, intent.contextId);
      if (!engine) {
        return { ok: false, result: { code: "RUNTIME_WORLD_UNAVAILABLE", detail: "Authoritative runtime world could not be loaded." } };
      }

      const before = engine.bridge.snapshot();
      const observation = await engine.bridge.ports.observation.observe(request);
      if (observation.state.stateVersion !== before.state.stateVersion) {
        return { ok: false, result: { code: "RUNTIME_STALE_OBSERVATION", detail: "Runtime observation changed before execution." } };
      }

      const execution = await engine.bridge.ports.action.execute(action, observation);
      if (!execution.ok) {
        return { ok: false, result: { code: "RUNTIME_ACTION_REJECTED", actionId: action.id, detail: execution.detail ?? "Runtime action was rejected." } };
      }

      const verification = await engine.bridge.ports.verification.verify(action, execution);
      if (!verification.ok) {
        return { ok: false, result: { code: "RUNTIME_VERIFICATION_FAILED", actionId: action.id, verification } };
      }

      const after = engine.bridge.snapshot();
      const mutationId = "runtime-intent:" + intent.intentId;
      const mutation = {
        mutation_id: mutationId,
        mutation_type: "ai_runtime_intent",
        mutation: {
          context: { worldId },
          intentId: intent.intentId,
          proposalId: intent.proposalId,
          action,
          expectedStateVersion: before.state.stateVersion,
          stateVersion: after.state.stateVersion,
          state: after,
        },
        domain_event: {
          type: "runtime.intent.executed",
          worldId,
          mutationId,
          intentId: intent.intentId,
          proposalId: intent.proposalId,
          stateVersion: after.state.stateVersion,
        },
        state_version: after.state.stateVersion,
        state_hash: stateHash(after),
        tick: after.state.clock.tick,
      };

      const append = await client.rpc("append_world_runtime_mutation_batch_v1", {
        p_world_id: worldId,
        p_mutations: [mutation],
        p_lease_token: leaseToken,
      });
      if (append.error) {
        return { ok: false, result: { code: "RUNTIME_JOURNAL_ERROR", actionId: action.id, detail: append.error.message } };
      }

      const journalRow = firstRow(append.data as unknown as Record<string, unknown>[] | Record<string, unknown> | null);
      const sequence = Number(journalRow?.sequence);
      if (!Number.isInteger(sequence) || sequence < 0) {
        return { ok: false, result: { code: "RUNTIME_JOURNAL_INVALID", actionId: action.id, detail: "Runtime journal did not return a valid sequence." } };
      }

      const checkpoint = await client.rpc("save_world_runtime_checkpoint_v1", {
        p_world_id: worldId,
        p_sequence: sequence,
        p_tick: after.state.clock.tick,
        p_state_version: after.state.stateVersion,
        p_state_hash: String(journalRow?.state_hash ?? mutation.state_hash),
        p_state: after.state,
        p_lease_token: leaseToken,
      });

      if (checkpoint.error) {
        return {
          ok: false,
          result: {
            code: "RUNTIME_CHECKPOINT_ERROR",
            actionId: action.id,
            mutationId,
            sequence,
            detail: checkpoint.error.message,
            retryable: true,
          },
        };
      }

      return {
        ok: true,
        result: {
          actionId: action.id,
          mutationId,
          sequence,
          stateVersion: after.state.stateVersion,
          stateHash: String(journalRow?.state_hash ?? mutation.state_hash),
          verified: true,
          checkpointSaved: true,
        },
      };
    },
  };
}


export function createSupabaseRuntimeIntentConsumer(client: SupabaseClient) {
  return createRuntimeIntentConsumer(client, createSupabaseRuntimeIntentExecutor(client));
}
