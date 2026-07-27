interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export class AiRateLimitService {
  private buckets = new Map<string, RateLimitBucket>();
  private WINDOW_MS = Number(process.env.AI_SOCKET_RATE_LIMIT_WINDOW_MS || 60_000);
  private MAX_MESSAGES = Number(process.env.AI_SOCKET_RATE_LIMIT_MAX || 20);

  rateLimitCheck(userId: string): RateLimitResult {
    const now = Date.now();
    const existing = this.buckets.get(userId);

    if (!existing || now >= existing.resetAt) {
      this.buckets.set(userId, {
        count: 1,
        resetAt: now + this.WINDOW_MS,
      });
      return { allowed: true };
    }

    if (existing.count >= this.MAX_MESSAGES) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      };
    }

    existing.count += 1;
    this.buckets.set(userId, existing);
    return { allowed: true };
  }
}
