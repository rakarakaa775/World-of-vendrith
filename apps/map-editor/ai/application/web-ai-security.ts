export const WEB_AI_SECURITY_POLICY = {
  windowMs: 60_000,
  maxRequestsPerUser: 20,
  maxRequestBytes: 64 * 1024,
  maxToolCallsPerRun: 12,
  maxIterationsPerRun: 4,
} as const;

interface RateLimitRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
}

export interface WebAiRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function consumeWebAiRequestBudget(
  client: RateLimitRpcClient,
  userId: string,
): Promise<WebAiRateLimitResult> {
  const { data, error } = await client.rpc(
    "consume_vendrith_web_ai_rate_limit_v1",
    { p_user_id: userId },
  );

  if (error) {
    throw new Error(`Web AI distributed rate limiter failed: ${error.message}`);
  }

  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as Record<string, unknown>).allowed !== "boolean" ||
    typeof (data as Record<string, unknown>).remaining !== "number" ||
    typeof (data as Record<string, unknown>).retryAfterSeconds !== "number"
  ) {
    throw new Error("Web AI distributed rate limiter returned an invalid response.");
  }

  return data as WebAiRateLimitResult;
}

export function requestBodyExceedsWebAiLimit(
  contentLength: string | null,
): boolean {
  if (!contentLength) return false;
  const bytes = Number(contentLength);
  return Number.isFinite(bytes) && bytes > WEB_AI_SECURITY_POLICY.maxRequestBytes;
}
