import { Request, Response } from "express";
import { classifyIntent, filterProductsWithAI, smartRecommend, callNvidiaAI } from "../services/ai.service";
import { ALLOWED_CATEGORIES } from "../lib/categories";

/**
 * POST /ai/classify
 * Classify user message into product category
 */
export const classify = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const result = await classifyIntent(message.trim(), ALLOWED_CATEGORIES);
    res.json(result);
  } catch (error) {
    console.error("Classify controller error:", error);
    res.status(500).json({ error: "Unable to classify intent." });
  }
};

/**
 * POST /ai/filter-products
 * Filter products based on AI analysis
 */
export const filterProducts = async (req: Request, res: Response) => {
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
    console.error("Filter products controller error:", error);
    res.status(500).json({ error: "Unable to filter products.", filteredIds: [] });
  }
};

/**
 * POST /ai/recommend
 * Full AI recommendation pipeline (intent classification + product filtering)
 */
export const recommend = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Build conversation string for prompt
    const conversationStr = Array.isArray(conversationHistory)
      ? conversationHistory
          .slice(-10)
          .map((m: any) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`)
          .join("\n")
      : "";

    const fullConversation = conversationStr
      ? `${conversationStr}\nCustomer: ${message}`
      : `Customer: ${message}`;

    // Build system prompt for AI
    const SYSTEM_PROMPT = `
You are an intelligent ecommerce shopping assistant. Your job is to help users find products from our catalog.

# YOUR ROLE

1. Understand the user's intent (what they want to buy)
2. Extract relevant filters (category, price range, brand, etc.)
3. Decide if you need more information
4. If clear, fetch and recommend products

# OUTPUT FORMAT

Return ONLY valid JSON. No markdown. No explanation.

{
  "intent": "product_search",
  "requiresApiCall": true,
  "needsMoreInformation": false,
  "missingInformation": [],
  "filters": {
    "category": "laptops",
    "minPrice": 500,
    "maxPrice": 1000,
    "brand": "Apple"
  },
  "reply": "I found some great laptops for you!",
  "confidenceScore": 85
}

# RULES

- If the user is just greeting (hi, hello) → set requiresApiCall: false
- If the request is unclear → set needsMoreInformation: true and list missingInformation
- Extract category, price range, brand, color, purpose from the message
- Be helpful and conversational in your reply
- Return ONLY valid JSON
`;

    const prompt = `${SYSTEM_PROMPT}

${fullConversation}`;

    // Call AI for intent classification
    const aiIntent = await callNvidiaAI({
      prompt,
      temperature: 0.4,
      maxTokens: 512,
    });

    if (aiIntent.error || aiIntent.success === false) {
      return res.json({
        data: {
          intent: "product_search",
          requiresApiCall: false,
          needsMoreInformation: false,
          missingInformation: [],
          filters: {},
          reply: "I'm having a moment — please try again!",
          products: [],
          confidenceScore: 0,
        },
      });
    }

    const intent = aiIntent.intent || "product_search";
    const requiresApiCall = Boolean(aiIntent.requiresApiCall) && !Boolean(aiIntent.needsMoreInformation);
    const needsMoreInformation = Boolean(aiIntent.needsMoreInformation);
    const filters = aiIntent.filters || {};
    const reply = typeof aiIntent.reply === "string" && aiIntent.reply.trim()
      ? aiIntent.reply.trim()
      : "How can I help you find the right product?";

    // If just a greeting or needs more info, return early
    if (!requiresApiCall || needsMoreInformation) {
      return res.json({
        data: {
          intent,
          requiresApiCall,
          needsMoreInformation,
          missingInformation: aiIntent.missingInformation || [],
          filters,
          reply,
          products: [],
          confidenceScore: aiIntent.confidenceScore || 70,
        },
      });
    }

    // Fetch products from DummyJSON using filters
    let rawProducts: any[] = [];
    try {
      const baseUrl = process.env.DUMMYJSON_BASE_URL || "https://dummyjson.com";
      let url = `${baseUrl}/products`;
      
      // Add category filter if present
      if (filters.category) {
        url = `${baseUrl}/products/category/${encodeURIComponent(filters.category)}`;
      }
      
      const productsRes = await fetch(url);
      const data = await productsRes.json();
      rawProducts = data.products || [];
      
      // Apply price filters
      if (filters.minPrice || filters.maxPrice) {
        rawProducts = rawProducts.filter((p: any) => {
          const price = Number(p.price);
          if (filters.minPrice && price < filters.minPrice) return false;
          if (filters.maxPrice && price > filters.maxPrice) return false;
          return true;
        });
      }
    } catch (err) {
      console.error("Product fetch error:", err);
    }

    // AI filter the products
    let finalProducts: any[] = [];
    if (rawProducts.length > 0) {
      try {
        const filterData = await filterProductsWithAI(rawProducts, intent, message, filters);
        const filteredIds: number[] = filterData.filteredIds || [];

        if (filteredIds.length > 0) {
          finalProducts = filteredIds
            .map((id) => rawProducts.find((p: any) => p.id === id))
            .filter(Boolean);
        }
      } catch (err) {
        console.error("AI filter step error:", err);
      }

      // Fallback: if AI filter returned nothing, use top 4 raw products
      if (finalProducts.length === 0) {
        finalProducts = rawProducts.slice(0, 4);
      }
    }

    // Return final response
    return res.json({
      data: {
        intent,
        requiresApiCall,
        needsMoreInformation: false,
        missingInformation: [],
        filters,
        reply: finalProducts.length === 0
          ? `${reply} Unfortunately I couldn't find matching products right now — try adjusting your search.`
          : reply,
        products: finalProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          thumbnail: p.thumbnail,
          rating: p.rating,
          brand: p.brand,
          description: p.description ? p.description.substring(0, 100) : "",
        })),
        confidenceScore: aiIntent.confidenceScore || 80,
      },
    });
  } catch (error) {
    console.error("Recommend controller error:", error);
    res.status(500).json({ error: "Unable to process AI request." });
  }
};

/**
 * POST /ai/smart-recommend
 * Smart recommendation with clarification
 */
export const smartRecommendHandler = async (req: Request, res: Response) => {
  try {
    const { prompt, conversation } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Fetch all products from DummyJSON
    const baseUrl = process.env.DUMMYJSON_BASE_URL || "https://dummyjson.com";
    const productsRes = await fetch(`${baseUrl}/products?limit=200`);
    const productsData = await productsRes.json();
    const allProducts = productsData.products || [];

    if (allProducts.length === 0) {
      return res.json({
        needsClarification: false,
        reply: "I'm having trouble accessing the product catalog right now. Please try again later.",
        products: [],
      });
    }

    const result = await smartRecommend(prompt.trim(), conversation || "", allProducts);

    // Handle clarification response
    if (result.needsClarification) {
      return res.json({
        needsClarification: true,
        clarificationQuestion: result.clarificationQuestion || "Could you tell me more about what you're looking for?",
        clarificationOptions: result.clarificationOptions || [],
        reply: result.reply || "",
        products: [],
      });
    }

    // Validate matches and map back to full product data
    const matches = result.matches || [];
    const validatedMatches = matches
      .filter((m: any) => (typeof m.id === "number" || typeof m.id === "string") && m.score >= 0.7)
      .map((m: any) => ({
        id: m.id,
        score: typeof m.score === "number" ? Math.max(0, Math.min(1, m.score)) : 0.5,
        reason: typeof m.reason === "string" ? m.reason : "",
      }));

    // Map AI-selected IDs back to full product objects
    const selectedIds = new Set(validatedMatches.map((m: any) => m.id));
    const matchedProducts = allProducts
      .filter((p: any) => selectedIds.has(p.id))
      .map((p: any) => {
        const match = validatedMatches.find((m: any) => m.id === p.id);
        return {
          ...p,
          aiScore: match?.score || 0.5,
          aiReason: match?.reason || "",
        };
      })
      .sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0));

    res.json({
      needsClarification: false,
      reply: result.reply || `Found ${matchedProducts.length} products that match your request!`,
      products: matchedProducts,
    });
  } catch (error) {
    console.error("Smart recommend controller error:", error);
    res.status(500).json({ error: "Unable to process your request." });
  }
};
