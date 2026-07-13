import express from "express";
import { classify, filterProducts, recommend, smartRecommendHandler } from "../controllers/ai.controller";

const router = express.Router();

// POST /ai/classify - Classify user message into product category
router.post("/classify", classify);

// POST /ai/filter-products - Filter products based on AI analysis
router.post("/filter-products", filterProducts);

// POST /ai/recommend - Full AI recommendation pipeline
router.post("/recommend", recommend);

// POST /ai/smart-recommend - Smart recommendation with clarification
router.post("/smart-recommend", smartRecommendHandler);

export default router;
