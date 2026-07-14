import rateLimit from "express-rate-limit";
import { AuthRequest } from "./auth.middleware";

// Simple per-user AI rate limiter.
// Maximum 10 AI requests per minute per authenticated user.
// Falls back to IP-based limiting.
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: AuthRequest): string => {
    // Use authenticated user ID as the key
    if (req.user?.id) {
      return `ai-user-${req.user.id}`;
    }
    // Fallback to IP (or connection remote address)
    return `ai-ip-${req.ip || req.socket?.remoteAddress || "unknown"}`;
  },
  message: {
    success: false,
    message: "Too many AI requests. Please try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Disable validation to allow custom keyGenerator patterns
  validate: false,
});

// Strict rate limiter for expensive NVIDIA API calls.
export const strictAiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req: AuthRequest): string => {
    if (req.user?.id) {
      return `ai-strict-${req.user.id}`;
    }
    return `ai-ip-${req.ip || req.socket?.remoteAddress || "unknown"}`;
  },
  message: {
    success: false,
    message: "Too many requests. Please wait before making another AI request.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});