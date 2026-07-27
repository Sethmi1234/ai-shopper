import express from "express";
import { aiController } from "../container";
import { protect } from "../middleware/auth.middleware";
import { aiRateLimiter, strictAiRateLimiter } from "../middleware/aiRateLimiter";

const router = express.Router();

// POST /ai/classify - Classify user message (no auth required – stateless, IP-rate-limited)
router.post("/classify", aiRateLimiter, aiController.classify);

// POST /ai/filter-products - Filter products based on AI analysis (auth required)
router.post("/filter-products", protect, strictAiRateLimiter, aiController.filterProducts);

// POST /ai/recommend - Full AI recommendation pipeline (no auth required – uses server-side keys & public data)
router.post("/recommend", strictAiRateLimiter, aiController.recommend);

// POST /ai/smart-recommend - Smart recommendation with clarification (no auth required)
router.post("/smart-recommend", strictAiRateLimiter, aiController.smartRecommendHandler);

export default router;