import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RuntimeEntity } from "../domain/runtime";
import type { GameWorldState } from "../domain/runtime";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";

export interface RuntimeRecoveryCheckpoint {
  sequence: number;
  tick: number;
  stateVersion: string;
  stateHash: string;
  state: unknown;
}

export interface RuntimeRecoveryMutation {
  sequence: number;
  mutation: Record<string, unknown>;
  stateVersion: string;
  stateHash: string;
}

export interface RuntimeRecoveryResult {
  snapshot: RuntimeWorldSnapshot;
  sequence: number;
  stateHash: string;
  replayedSequences: number[];
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
  const record = value as Record<string, unknown>;
  return "{" + Object.keys(record).sort().map(key => JSON.stringify(key) + ":" + stableJson(record[key])).join(",") + "}";
}

export function runtimeStateHash(snapshot: RuntimeWorldSnapshot): string {
  return createHash("sha256").update(stableJson(snapshot)).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function snapshotFromStoredState(value: unknown): RuntimeWorldSnapshot | undefined {
  if (!isRecord(value)) return undefined;
  if (isRecord(value.state) && Array.isArray(value.entities)) {
    return {
      state: value.state as unknown as GameWorldState,
      entities: value.entities as RuntimeEntity[],
    };
  }
  if (typeof value.worldId === "string" && isRecord(value.clock)) {
    return {
      state: value as unknown as GameWorldState,
      entities: [],
    };
  }
  return undefined;
}

export function applyRuntimeRecoveryRecords(
  checkpoint: RuntimeRecoveryCheckpoint | null,
  mutations: RuntimeRecoveryMutation[],
  fallbackSnapshot?: RuntimeWorldSnapshot,
): RuntimeRecoveryResult {
  let snapshot = checkpoint ? snapshotFromStoredState(checkpoint.state) : fallbackSnapshot;
  if (!snapshot) {
    throw new Error("RUNTIME_RECOVERY_BASE_MISSING");
  }

  if (checkpoint) {
    if (checkpoint.sequence < 0 || !Number.isInteger(checkpoint.sequence)) {
      throw new Error("RUNTIME_RECOVERY_CHECKPOINT_SEQUENCE_INVALID");
    }
    if (checkpoint.stateVersion !== snapshot.state.stateVersion) {
      throw new Error("RUNTIME_RECOVERY_CHECKPOINT_STATE_VERSION_MISMATCH");
    }
    if (checkpoint.tick !== snapshot.state.clock.tick) {
      throw new Error("RUNTIME_RECOVERY_CHECKPOINT_TICK_MISMATCH");
    }
    const checkpointHash = runtimeStateHash(snapshot);
    if (snapshot.entities.length > 0 && checkpoint.stateHash !== checkpointHash) {
      throw new Error("RUNTIME_RECOVERY_CHECKPOINT_HASH_MISMATCH");
    }
  }

  let expectedSequence = checkpoint?.sequence ?? 0;
  const replayedSequences: number[] = [];

  for (const row of mutations) {
    if (!Number.isInteger(row.sequence) || row.sequence !== expectedSequence + 1) {
      throw new Error("RUNTIME_RECOVERY_SEQUENCE_GAP");
    }
    const stored = isRecord(row.mutation.state) ? row.mutation.state : undefined;
    const next = snapshotFromStoredState(stored);
    if (!next) throw new Error("RUNTIME_RECOVERY_MUTATION_STATE_MISSING");
    if (row.stateVersion !== next.state.stateVersion) {
      throw new Error("RUNTIME_RECOVERY_MUTATION_STATE_VERSION_MISMATCH");
    }
    if (row.stateHash !== runtimeStateHash(next)) {
      throw new Error("RUNTIME_RECOVERY_MUTATION_HASH_MISMATCH");
    }
    snapshot = next;
    expectedSequence = row.sequence;
    replayedSequences.push(row.sequence);
  }

  return {
    snapshot,
    sequence: expectedSequence,
    stateHash: runtimeStateHash(snapshot),
    replayedSequences,
  };
}

export async function recoverWorldFromSupabase(
  client: SupabaseClient,
  worldId: string,
  fallbackSnapshot?: RuntimeWorldSnapshot,
): Promise<RuntimeRecoveryResult> {
  const checkpointResponse = await client.rpc("read_latest_world_runtime_checkpoint_v1", { p_world_id: worldId });
  if (checkpointResponse.error) throw new Error(`RUNTIME_RECOVERY_CHECKPOINT_READ_ERROR: ${checkpointResponse.error.message}`);

  const checkpointRow = Array.isArray(checkpointResponse.data)
    ? checkpointResponse.data[0]
    : checkpointResponse.data;
  const checkpoint = checkpointRow
    ? {
        sequence: Number(checkpointRow.sequence),
        tick: Number(checkpointRow.tick),
        stateVersion: String(checkpointRow.state_version),
        stateHash: String(checkpointRow.state_hash),
        state: checkpointRow.state,
      }
    : null;

  const mutationResponse = await client.rpc("read_world_runtime_mutations_v1", {
    p_world_id: worldId,
    p_after_sequence: checkpoint?.sequence ?? 0,
  });
  if (mutationResponse.error) throw new Error(`RUNTIME_RECOVERY_MUTATION_READ_ERROR: ${mutationResponse.error.message}`);

  const mutations = (mutationResponse.data ?? []).map((row: Record<string, unknown>) => ({
    sequence: Number(row.sequence),
    mutation: (isRecord(row.mutation) ? row.mutation : {}),
    stateVersion: String(row.state_version),
    stateHash: String(row.state_hash),
  }));

  return applyRuntimeRecoveryRecords(checkpoint, mutations, fallbackSnapshot);
}
