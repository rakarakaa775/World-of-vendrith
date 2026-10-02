import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EvaluationRecord,
  ImprovementHistory,
  ImprovementMemory,
  ImprovementProposal,
  ImprovementTask,
} from "../domain/improvement";

interface EvaluationRow {
  id: string; task_id: string; strategy_id: string;
  validity: EvaluationRecord["validity"]; verification_passed: boolean;
  novelty: EvaluationRecord["novelty"]; difficulty_signal: EvaluationRecord["difficultySignal"];
  evidence: string[];
}
interface ProposalRow {
  id: string; task_id: string; strategy_id: string;
  strategy_description: string | null; strategy_steps: string[];
  rationale: string; evaluation_id: string; requires_approval: true;
}

function mapProposal(row: ProposalRow): ImprovementProposal {
  return { id: row.id, taskId: row.task_id, strategyId: row.strategy_id,
    strategyDescription: row.strategy_description ?? undefined, strategySteps: row.strategy_steps ?? [],
    rationale: row.rationale, evaluationId: row.evaluation_id, requiresApproval: true };
}
function mapEvaluation(row: EvaluationRow): EvaluationRecord {
  return { id: row.id, taskId: row.task_id, strategyId: row.strategy_id,
    validity: row.validity, verificationPassed: row.verification_passed, novelty: row.novelty,
    difficultySignal: row.difficulty_signal, evidence: row.evidence ?? [] };
}
function safeLimit(limit = 10) { return Math.max(1, Math.min(limit, 50)); }

export function createSupabaseImprovementMemory(client: SupabaseClient): ImprovementMemory {
  const loadHistory = async (evaluations: EvaluationRow[]): Promise<ImprovementHistory[]> => {
    const ids = evaluations.map((row) => row.id);
    if (!ids.length) return [];
    const { data: proposals, error } = await client.from("ai_improvement_proposals")
      .select("id,task_id,strategy_id,strategy_description,strategy_steps,rationale,evaluation_id,requires_approval")
      .in("evaluation_id", ids);
    if (error) throw error;
    const proposalByEvaluation = new Map<string, ImprovementProposal>(
      (proposals ?? []).map((row) => [row.evaluation_id, mapProposal(row as ProposalRow)]),
    );
    return evaluations.map((row) => ({ evaluation: mapEvaluation(row), proposal: proposalByEvaluation.get(row.id) }));
  };

  const loadEvaluations = async (taskId: string | undefined, limit: number) => {
    let query = client.from("ai_improvement_evaluations")
      .select("id,task_id,strategy_id,validity,verification_passed,novelty,difficulty_signal,evidence,created_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (taskId) query = query.eq("task_id", taskId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as EvaluationRow[];
  };

  return {
    async recordEvaluation(record) {
      const { error } = await client.from("ai_improvement_evaluations").upsert({
        id: record.id, task_id: record.taskId, strategy_id: record.strategyId,
        validity: record.validity, verification_passed: record.verificationPassed,
        novelty: record.novelty, difficulty_signal: record.difficultySignal, evidence: record.evidence,
      }, { onConflict: "id" });
      if (error) throw error;
    },
    async recordProposal(proposal) {
      const { error } = await client.from("ai_improvement_proposals").upsert({
        id: proposal.id, task_id: proposal.taskId, strategy_id: proposal.strategyId,
        strategy_description: proposal.strategyDescription ?? null, strategy_steps: proposal.strategySteps ?? [],
        rationale: proposal.rationale, evaluation_id: proposal.evaluationId, requires_approval: true,
      }, { onConflict: "id" });
      if (error) throw error;
    },
    async listRecent(limit = 10) {
      return loadHistory(await loadEvaluations(undefined, safeLimit(limit)));
    },
    async findRelated(task, query = {}) {
      return loadHistory(await loadEvaluations(task.id, safeLimit(query.limit)));
    },
  };
}
