export type DevelopmentActionType = "repository_write" | "database_write" | "deployment";

export interface DevelopmentActionProposal {
  id: string;
  userId: string;
  actionType: DevelopmentActionType;
  action: Record<string, unknown>;
  rationale: string;
  status: "pending" | "approved" | "rejected" | "failed";
  approvalId?: string;
  result?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevelopmentActionProposalStore {
  create(input: {
    userId: string;
    actionType: DevelopmentActionType;
    action: Record<string, unknown>;
    rationale: string;
  }): Promise<DevelopmentActionProposal>;
  getOwned(id: string, userId: string): Promise<DevelopmentActionProposal | null>;
}

export function createDevelopmentActionProposalStore(client: {
  from(table: string): any;
}): DevelopmentActionProposalStore {
  return {
    async create(input) {
      const { data, error } = await client
        .from("vendrith_development_action_proposals")
        .insert({
          user_id: input.userId,
          action_type: input.actionType,
          action: input.action,
          rationale: input.rationale,
        })
        .select("*")
        .single();
      if (error) throw error;
      return mapProposal(data);
    },
    async getOwned(id, userId) {
      const { data, error } = await client
        .from("vendrith_development_action_proposals")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProposal(data) : null;
    },
  };
}

function mapProposal(row: any): DevelopmentActionProposal {
  return {
    id: row.id,
    userId: row.user_id,
    actionType: row.action_type,
    action: row.action,
    rationale: row.rationale,
    status: row.status,
    approvalId: row.approval_id ?? undefined,
    result: row.result ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
