import type { AiPlan, AiRequest, ApprovalState } from "../domain/types";
import { classifyApproval } from "../policies/ai-policy";
import { createReadOnlyPlan, type PlanRequestDependencies } from "./plan-request";

export interface AiResponse {
  request: AiRequest;
  approval: ApprovalState;
  plan: AiPlan;
}

export interface VendrithAiService {
  handle(request: AiRequest): Promise<AiResponse>;
}

/**
 * Application-level runtime for Vendrith Project AI.
 *
 * The service intentionally depends only on ports. UI/API callers can inject
 * GitHub, CodeGraph, documentation, asset-registry, and verification adapters
 * without coupling the AI domain to Next.js or a specific provider.
 */
export function createVendrithAiService(
  dependencies: PlanRequestDependencies,
): VendrithAiService {
  return {
    async handle(request) {
      const plan = await createReadOnlyPlan(request, dependencies);
      return {
        request,
        approval: classifyApproval(request.mode, request.prompt),
        plan,
      };
    },
  };
}
