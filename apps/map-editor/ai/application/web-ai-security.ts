export const WEB_AI_SECURITY_POLICY = {
  windowMs: 60_000,
  maxRequestsPerUser: 20,
  maxRequestBytes: 64 * 1024,
  maxToolCallsPerRun: 12,
  maxIterationsPerRun: 4,
} as const;

interface RateBucket {
  windowStartedAt: number;
  count: number;
}

const buckets = new Map<string, RateBucket>();

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStartedAt >= WEB_AI_SECURITY_POLICY.windowMs) {
      buckets.delete(key);
    }
  }
}

export interface WebAiRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function consumeWebAiRequestBudget(
  userId: string,
  now = Date.now(),
): WebAiRateLimitResult {
  pruneExpiredBuckets(now);

  const current = buckets.get(userId);
  if (!current || now - current.windowStartedAt >= WEB_AI_SECURITY_POLICY.windowMs) {
    buckets.set(userId, { windowStartedAt: now, count: 1 });
    return {
      allowed: true,
      remaining: WEB_AI_SECURITY_POLICY.maxRequestsPerUser - 1,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= WEB_AI_SECURITY_POLICY.maxRequestsPerUser) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil(
          (WEB_AI_SECURITY_POLICY.windowMs -
            (now - current.windowStartedAt)) /
            1000,
        ),
      ),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: WEB_AI_SECURITY_POLICY.maxRequestsPerUser - current.count,
    retryAfterSeconds: 0,
  };
}

export function requestBodyExceedsWebAiLimit(
  contentLength: string | null,
): boolean {
  if (!contentLength) return false;
  const bytes = Number(contentLength);
  return Number.isFinite(bytes) && bytes > WEB_AI_SECURITY_POLICY.maxRequestBytes;
}
