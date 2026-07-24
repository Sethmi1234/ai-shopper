interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

const buckets = new Map<string, RateLimitBucket>();

const WINDOW_MS = Number(process.env.AI_SOCKET_RATE_LIMIT_WINDOW_MS || 60_000);
const MAX_MESSAGES = Number(process.env.AI_SOCKET_RATE_LIMIT_MAX || 20);

export const rateLimitCheck = (userId: string): RateLimitResult => {
  const now = Date.now();
  const existing = buckets.get(userId);

  if (!existing || now >= existing.resetAt) {
    buckets.set(userId, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (existing.count >= MAX_MESSAGES) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  buckets.set(userId, existing);
  return { allowed: true };
};
