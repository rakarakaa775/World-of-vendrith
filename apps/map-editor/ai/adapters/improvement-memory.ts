import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EvaluationRecord,
  ImprovementMemory,
  ImprovementProposal,
} from "../domain/improvement";

interface EvaluationRow {
  id: string;
  task_id: string;
  strategy_id: string;
  validity: EvaluationRecord["validity"];
  verification_passed: boolean;
  novelty: EvaluationRecord["novelty"];
  difficulty_signal: EvaluationRecord["difficultySignal"];
  evidence: string[];
}

interface ProposalRow {
  id: string;
  task_id: string;
  strategy_id: string;
  rationale: string;
  evaluation_id: string;
  requires_approval: true;
}

export function createSupabaseImprovementMemory(
  client: SupabaseClient,
): ImprovementMemory {
  return {
    async recordEvaluation(record) {
      const row: EvaluationRow = {
        id: record.id,
        task_id: record.taskId,
        strategy_id: record.strategyId,
        validity: record.validity,
        verification_passed: record.verificationPassed,
        novelty: record.novelty,
        difficulty_signal: record.difficultySignal,
        evidence: record.evidence,
      };

      const { error } = await client
        .from("ai_improvement_evaluations")
        .upsert(row, { onConflict: "id" });

      if (error) throw error;
    },

    async recordProposal(proposal) {
      const row: ProposalRow = {
        id: proposal.id,
        task_id: proposal.taskId,
        strategy_id: proposal.strategyId,
        rationale: proposal.rationale,
        evaluation_id: proposal.evaluationId,
        requires_approval: true,
      };

      const { error } = await client
        .from("ai_improvement_proposals")
        .upsert(row, { onConflict: "id" });

      if (error) throw error;
    },
  };
}
