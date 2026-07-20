import { Request, Response, NextFunction } from "express";
import {
  classifyIntent,
  filterProductsWithAI,
  recommendProducts,
  smartRecommendWithProducts,
} from "../services/ai.service";
import { ALLOWED_CATEGORIES } from "../lib/categories";

/**
 * POST /ai/classify
 * Classify user message into product category
 */
export const classify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const result = await classifyIntent(message.trim(), ALLOWED_CATEGORIES);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/filter-products
 * Filter products based on AI analysis
 */
export const filterProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { products, userIntent, userMessage, filters } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.json({ filteredIds: [] });
    }

    const result = await filterProductsWithAI(
      products,
      userIntent || "",
      userMessage || "",
      filters || {}
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/recommend
 * Full AI recommendation pipeline (intent classification + product filtering)
 */
export const recommend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const result = await recommendProducts(message, conversationHistory || []);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /ai/smart-recommend
 * Smart recommendation with clarification
 */
export const smartRecommendHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, conversation } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const result = await smartRecommendWithProducts(prompt.trim(), conversation || "");
    res.json(result);
  } catch (error) {
    next(error);
  }
};