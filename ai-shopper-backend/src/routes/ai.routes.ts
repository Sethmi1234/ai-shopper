import express from "express";
import { classify, filterProducts, recommend, smartRecommendHandler } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";
import { aiRateLimiter, strictAiRateLimiter } from "../middleware/aiRateLimiter";

const router = express.Router();

// POST /ai/classify - Classify user message (no auth required – stateless, IP-rate-limited)
router.post("/classify", aiRateLimiter, classify);

// POST /ai/filter-products - Filter products based on AI analysis (auth required)
router.post("/filter-products", protect, strictAiRateLimiter, filterProducts);

// POST /ai/recommend - Full AI recommendation pipeline (auth required)
router.post("/recommend", protect, strictAiRateLimiter, recommend);

// POST /ai/smart-recommend - Smart recommendation with clarification (no auth required)
router.post("/smart-recommend", strictAiRateLimiter, smartRecommendHandler);

export default router;