import aiClient from "../config/ai";
import { ALLOWED_CATEGORIES } from "../lib/categories";
import { getProducts } from "./product.service";

const MODEL = process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512";

/**
 * Generic AI response handler
 */
export interface AIResponse {
  category?: string;
  confidence?: number;
  intent?: string;
  requiresApiCall?: boolean;
  needsMoreInformation?: boolean;
  missingInformation?: string[];
  filters?: any;
  reply?: string;
  confidenceScore?: number;
  filteredIds?: string[];
  reasoning?: string;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
  matches?: Array<{ id: string; score: number; reason: string }>;
  error?: string;
  success?: boolean;
  fallback?: boolean;
  products?: any[];
  categories?: string[];
  searchTerms?: string;
  budget?: { min?: number; max?: number };
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface StreamingShoppingAssistantInput {
  message: string;
  conversationHistory?: ConversationTurn[];
  onToken: (token: string) => void;
}

export interface StreamingShoppingAssistantResult {
  reply: string;
  products: Array<{
    id: string;
    title: string;
    price: number;
    category?: string;
    thumbnail?: string;
    rating?: number;
    brand?: string;
    description?: string;
  }>;
}

/**
 * Call NVIDIA AI with a prompt - with improved error handling
 */
export const callNvidiaAI = async ({
  model,
  prompt,
  temperature = 0.3,
  maxTokens = 512,
}: {
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<AIResponse> => {
  try {
    const completion = await aiClient.chat.completions.create({
      model: model || MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = completion.choices[0]?.message?.content || "";
    
    // Try to parse JSON response
    try {
      // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
      let cleaned = content.trim();
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        cleaned = jsonMatch[1].trim();
      }
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch {
      // If not JSON, return as plain text in reply
      return { reply: content };
    }
  } catch (error: any) {
    console.error("NVIDIA AI call error:", error?.message || error);
    
    // Check for specific error types
    if (error?.status === 429) {
      return { error: "Rate limit exceeded. Please wait a moment.", success: false };
    }
    if (error?.status === 401 || error?.status === 403) {
      return { error: "AI service authentication failed.", success: false };
    }
    if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
      return { error: "AI service is unreachable.", success: false };
    }
    
    return { error: "AI request failed", success: false };
  }
};

// This function is deprecated - use streamShoppingAssistantResponse from chatService.ts instead
export const streamShoppingAssistantResponse = async ({
  message,
  conversationHistory = [],
  onToken,
}: StreamingShoppingAssistantInput): Promise<StreamingShoppingAssistantResult> => {
  // This is a fallback implementation - the main implementation is in chatService.ts
  // This is kept for backward compatibility but should not be used in new code
  console.warn("streamShoppingAssistantResponse from ai.service.ts is deprecated. Use chatService instead.");
  
  try {
    const recentHistory = conversationHistory
      .filter((turn) => (
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string" &&
        turn.content.trim().length > 0
      ))
      .slice(-8);

    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful ecommerce shopping assistant for AI Shopper.

Rules:
- Keep responses concise, friendly, and useful (2-4 sentences).
- For greetings or general chat, respond warmly and ask what they are looking for. Do not invent products.
- Do not output JSON.`,
      },
      ...recentHistory.map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    let reply = "";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const stream = await aiClient.chat.completions.create(
        {
          model: MODEL,
          messages,
          temperature: 0.4,
          max_tokens: 700,
          stream: true,
        },
        {
          signal: controller.signal,
        }
      );

      for await (const chunk of stream as any) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (typeof token === "string" && token.length > 0) {
          reply += token;
          onToken(token);
        }
      }
    } catch (error) {
      console.error("AI streaming response error:", error);

      if (!reply.trim()) {
        reply = "I'm having trouble connecting to the AI service. Please try again in a few moments.";
        onToken(reply);
      }
    } finally {
      clearTimeout(timeout);
    }

    const finalReply = reply.trim() || "How can I help you find the right product today?";

    return {
      reply: finalReply,
      products: [],
    };
  } catch (error) {
    console.error("streamShoppingAssistantResponse error:", error);
    return {
      reply: "I'm having trouble connecting to the AI service. Please try again in a few moments.",
      products: [],
    };
  }
};

/**
 * Classify user message into product category
 */
export const classifyIntent = async (message: string, allowedCategories: string[]): Promise<AIResponse> => {
  const SYSTEM_PROMPT = `
You are a product intent classifier for an ecommerce shopping assistant.

Your ONLY role is to classify user messages into product categories.

Return ONLY valid JSON. No markdown. No explanation.

# CATEGORIES ALLOWED

${allowedCategories.filter((c) => c !== "general").join(", ")}

# CLASSIFICATION RULES

1. Map user message to the closest category from the allowed list
2. If food-related (food, snacks, drinks, groceries) → "groceries"
3. If phone-related (phone, mobile, smartphone) → "smartphones"
4. If computer-related (laptop, computer, notebook) → "laptops"
5. If clothing-related (shirt, clothes, tops) → "tops"
6. If fragrance-related (perfume, scent, cologne) → "fragrances"
7. If furniture-related (desk, chair, sofa, table) → "furniture"
8. If skincare-related (skin, beauty, cream, lotion) → "skin-care"
9. If eyewear-related (sunglasses, glasses, shades) → "sunglasses"
10. If timepiece-related (watch) → "watches"
11. If footwear-related (shoes, sneakers) → "mens-shoes"
12. If vehicle-related (car, auto) → "automotive"
13. If home-related (decor, decoration) → "home-decoration"
14. If lighting-related (light, lamp) → "lighting"
15. If motorcycle-related (motorcycle, bike) → "motorcycle"
16. If toy/game/child-related (toy, game, play, child, kids, baby, doll, puzzle, lego) → "automotive"
17. If unsure or unrelated to shopping → "general"

# OUTPUT FORMAT

{
  "category": "category_name",
  "confidence": 0.0-1.0
}

# CRITICAL RULES

- NEVER return a category not in the allowed list
- Confidence should be high (0.7+) when the intent is clear
- Confidence should be low (0.3-0.5) when the intent is unclear
- ALWAYS return valid JSON
`;

  const prompt = `${SYSTEM_PROMPT}

User message: ${message}`;

  const response = await callNvidiaAI({
    prompt,
    temperature: 0,
    maxTokens: 100,
  });

  if (response.error) {
    return { category: "general", confidence: 0.3 };
  }

  const category = response.category || "general";
  const validatedCategory = ALLOWED_CATEGORIES.includes(category as any)
    ? category
    : "general";

  return {
    category: validatedCategory,
    confidence: response.confidence || 0.5,
  };
};

/**
 * Filter products based on AI analysis
 */
export const filterProductsWithAI = async (
  products: any[],
  userIntent: string,
  userMessage: string,
  filters: any
): Promise<AIResponse> => {
  const productSummaries = products
    .slice(0, 30)
    .map((p: any) => ({
      id: p._id ? String(p._id) : String(p.id),
      title: p.title,
      category: p.category,
      price: p.price,
      description: p.description ? p.description.substring(0, 120) : "",
      brand: p.brand || "",
      tags: p.tags || [],
    }));

  const filtersStr = JSON.stringify(filters || {});

  const prompt = `
You are a product relevance filter for an ecommerce AI shopping assistant.

A customer said: "${userMessage}"
Their intent: "${userIntent}"
Filters extracted: ${filtersStr}

Below is a list of products fetched from the store database.
Your job: Read each product carefully and select ONLY the ones that genuinely match what the customer is asking for.

Be intelligent:
- If they asked for "instant food" or "ready-to-eat", only include snacks, instant noodles, canned food — NOT raw ingredients
- If they asked for "gaming laptop", only include laptops with gaming-related descriptions
- If they asked for "budget phone under $300", only include phones within that price
- If they asked for "casual shoes", exclude formal/dress shoes
- If they asked for "gifts for tech lovers", pick electronics, gadgets, accessories — not furniture
- Be intelligent but FORGIVING. The store's catalog is limited.
- If they ask for "instant food" but we only have Ice Cream, Juice, and Apple, select those as the closest ready-to-eat options.
- If they ask for "ingredients" but we only have Rice, Eggs, and Cooking Oil, pick those.
- ALWAYS try to find at least 1-3 products that somewhat fit the request. Only return an empty array if absolutely nothing is even remotely relevant.

Products to evaluate:
${JSON.stringify(productSummaries, null, 2)}

Return ONLY valid JSON. No markdown. No explanation.

{
  "filteredIds": ["id1", "id2", "id3"],
  "reasoning": "brief explanation of why you selected these"
}

Rules:
- filteredIds must be an array of product id strings from the list above
- Return maximum 6 products
- Return minimum 0 products (empty array if nothing fits)
- NEVER invent IDs not in the list
`;

  const aiResult = await callNvidiaAI({
    prompt,
    temperature: 0.2,
    maxTokens: 512,
  });

  if (aiResult.error || !Array.isArray(aiResult.filteredIds)) {
    return {
      filteredIds: products.slice(0, 4).map((p: any) => String(p._id || p.id)),
      fallback: true,
    };
  }

  const validIds = new Set(products.map((p: any) => String(p._id || p.id)));
  const safeIds = (aiResult.filteredIds as string[])
    .filter((id: any) => typeof id === "string" && validIds.has(id))
    .slice(0, 6);

  return {
    filteredIds: safeIds,
    reasoning: aiResult.reasoning || "",
  };
};

/**
 * Full AI recommendation pipeline (intent classification + product filtering)
 */
export const recommendProducts = async (
  message: string,
  conversationHistory: any[]
): Promise<any> => {
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

  const SYSTEM_PROMPT = `
You are an intelligent ecommerce shopping assistant. Your job is to help users find products from our catalog.

# YOUR ROLE

1. Understand the user's intent (what they want to buy)
2. Extract relevant filters (category, price range, brand, etc.)
3. Always attempt a product search with whatever information is available

# IMPORTANT: NEVER ASK FOLLOW-UP QUESTIONS

This is the home page "Ask AI" feature. Users expect immediate results.
- NEVER set needsMoreInformation to true
- NEVER list missingInformation
- Always extract what you can from the query and set requiresApiCall: true
- Make your best guess on filters even if the request is vague

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

- If the user is just greeting (hi, hello, hey) → set requiresApiCall: false and reply with a friendly greeting
- NEVER set needsMoreInformation to true — always guess and proceed
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
    return {
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
    };
  }

  const intent = aiIntent.intent || "product_search";
  const requiresApiCall = Boolean(aiIntent.requiresApiCall) && !Boolean(aiIntent.needsMoreInformation);
  const needsMoreInformation = Boolean(aiIntent.needsMoreInformation);
  const filters = aiIntent.filters || {};
  const reply = typeof aiIntent.reply === "string" && aiIntent.reply.trim()
    ? aiIntent.reply.trim()
    : "How can I help you find the right product?";

  // For the home page "Ask AI" feature: always attempt a product search.
  if (!requiresApiCall && !needsMoreInformation) {
    return {
      data: {
        intent,
        requiresApiCall: false,
        needsMoreInformation: false,
        missingInformation: [],
        filters,
        reply,
        products: [],
        confidenceScore: aiIntent.confidenceScore || 70,
      },
    };
  }

  // Fetch products from our own database using filters
  let rawProducts: any[] = [];
  try {
    const query: { page: number; limit: number; category?: string } = {
      page: 1,
      limit: 50,
    };
    if (filters.category) {
      query.category = filters.category;
    }

    const result = await getProducts(query);
    rawProducts = result.data;

    // Apply price filters in memory (DB doesn't have a price range index yet)
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
      const filteredIds: string[] = (filterData.filteredIds || []) as string[];

      if (filteredIds.length > 0) {
        finalProducts = filteredIds
          .map((id) => rawProducts.find((p: any) => String(p._id || p.id) === id))
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

  return {
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
        id: String(p._id || p.id),
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
  };
};

/**
 * Smart recommendation with clarification
 */
export const smartRecommend = async (
  prompt: string,
  conversation: string,
  allProducts: any[]
): Promise<AIResponse> => {
  const SYSTEM_PROMPT = `
You are an intelligent ecommerce shopping assistant. Your job is to help users find products from our catalog.

You have access to ALL products across ALL categories. You understand natural language deeply — intent, context, nuance, and ambiguity.

# YOUR CAPABILITIES

1. **Understand any request** — "something to eat", "gaming stuff", "gift for mom", "healthy breakfast under $20", "pet supplies", "office decor"
2. **Ask clarifying questions** when the request is ambiguous — e.g. "Did you mean food for humans or pet food?" or "What's your budget?"
3. **Search across multiple categories** — a request like "things to eat" might match groceries, kitchen accessories, etc.
4. **Consider all product attributes** — title, description, price, category, brand, rating
5. **Return scores with reasons** explaining why each product matches

# HOW TO HANDLE AMBIGUITY

If the user's request is unclear or could mean multiple things:
- Set "needsClarification" to true
- Provide a helpful question in "clarificationQuestion"
- Optionally suggest options in "clarificationOptions"
- Do NOT return products yet

# OUTPUT FORMAT

## When you can recommend products:
{
  "needsClarification": false,
  "reply": "I found these great options for you!",
  "matches": [
    {
      "id": 1,
      "score": 0.95,
      "reason": "Fresh fruit, perfect for healthy breakfast, under $20"
    },
    {
      "id": 5,
      "score": 0.88,
      "reason": "Good breakfast option, fits budget"
    }
  ]
}

## When you need more information:
{
  "needsClarification": true,
  "clarificationQuestion": "Did you mean food for humans or pet food/animal feed?",
  "clarificationOptions": ["Human food", "Pet food / Animal feed", "Both"],
  "reply": "I want to make sure I find the right products for you."
}

# RULES

- Be helpful and conversational
- Consider ALL products provided — don't ignore any
- Score products 0.0 to 1.0 based on how well they match
- Only include products with score >= 0.7 in matches
- If no products match well, return empty matches and suggest alternatives
- Return ONLY valid JSON. No markdown. No extra text.
`;

  const conversationContext = conversation
    ? `\n\nPrevious conversation context:\n${conversation}`
    : "";

  const aiPrompt = `${SYSTEM_PROMPT}

User Request:
${prompt}${conversationContext}

Available Products (ALL categories):
${JSON.stringify(
  allProducts.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    description: p.description?.substring(0, 150),
    category: p.category,
    brand: p.brand || "",
    rating: p.rating || 0,
  })),
  null,
  2
)}

Now analyze the user's request against ALL these products. 
- If the request is ambiguous, ask a clarifying question.
- If clear, return the best matching products with scores and reasons.
- Remember: you can match across ANY category, not just one.
Return ONLY valid JSON.`;

  const response = await callNvidiaAI({
    prompt: aiPrompt,
    temperature: 0.3,
    maxTokens: 4096,
  });

  if (response.error) {
    return {
      needsClarification: false,
      reply: "Here are our top-rated products. The AI recommendation engine is temporarily unavailable.",
      products: [...allProducts]
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 12),
    };
  }

  return response;
};

/**
 * Smart recommend handler - fetches products and processes recommendation
 */
export const smartRecommendWithProducts = async (
  prompt: string,
  conversation: string
): Promise<any> => {
  // Fetch all products from our own database (no DummyJSON dependency)
  const result = await getProducts({ page: 1, limit: 200 });
  const allProducts = result.data;

  if (allProducts.length === 0) {
    return {
      needsClarification: false,
      reply: "I'm having trouble accessing the product catalog right now. Please try again later.",
      products: [],
    };
  }

  const aiResult = await smartRecommend(prompt.trim(), conversation || "", allProducts);

  // Handle clarification response
  if (aiResult.needsClarification) {
    return {
      needsClarification: true,
      clarificationQuestion: aiResult.clarificationQuestion || "Could you tell me more about what you're looking for?",
      clarificationOptions: aiResult.clarificationOptions || [],
      reply: aiResult.reply || "",
      products: [],
    };
  }

  // Validate matches and map back to full product data
  const matches = aiResult.matches || [];
  const validatedMatches = matches
    .filter((m: any) => (typeof m.id === "number" || typeof m.id === "string") && m.score >= 0.7)
    .map((m: any) => ({
      id: m.id,
      score: typeof m.score === "number" ? Math.max(0, Math.min(1, m.score)) : 0.5,
      reason: typeof m.reason === "string" ? m.reason : "",
    }));

  // Map AI-selected IDs back to full product objects
  const selectedIds = new Set(validatedMatches.map((m: any) => String(m.id)));
  const matchedProducts = allProducts
    .filter((p: any) => selectedIds.has(String(p._id || p.id)))
    .map((p: any) => {
      const match = validatedMatches.find((m: any) => String(m.id) === String(p._id || p.id));
      return {
        ...p,
        id: String(p._id || p.id),
        aiScore: match?.score || 0.5,
        aiReason: match?.reason || "",
      };
    })
    .sort((a: any, b: any) => (b.aiScore || 0) - (a.aiScore || 0));

  return {
    needsClarification: false,
    reply: aiResult.reply || `Found ${matchedProducts.length} products that match your request!`,
    products: matchedProducts,
  };
};