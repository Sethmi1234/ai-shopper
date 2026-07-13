import aiClient from "../config/ai";

const MODEL = process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512";

/**
 * Generic AI response handler
 */
interface AIResponse {
  category?: string;
  confidence?: number;
  intent?: string;
  requiresApiCall?: boolean;
  needsMoreInformation?: boolean;
  missingInformation?: string[];
  filters?: any;
  reply?: string;
  confidenceScore?: number;
  filteredIds?: number[];
  reasoning?: string;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
  matches?: Array<{ id: number; score: number; reason: string }>;
  error?: string;
  success?: boolean;
}

/**
 * Call NVIDIA AI with a prompt
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
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      // If not JSON, return as plain text in reply
      return { reply: content };
    }
  } catch (error) {
    console.error("NVIDIA AI call error:", error);
    return { error: "AI request failed", success: false };
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
  const validatedCategory = allowedCategories.includes(category as any)
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
      id: p.id,
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
  "filteredIds": [1, 2, 3],
  "reasoning": "brief explanation of why you selected these"
}

Rules:
- filteredIds must be an array of product IDs (numbers) from the list above
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
      filteredIds: products.slice(0, 4).map((p: any) => p.id),
      fallback: true,
    };
  }

  const validIds = new Set(products.map((p: any) => p.id));
  const safeIds = aiResult.filteredIds
    .filter((id: any) => typeof id === "number" && validIds.has(id))
    .slice(0, 6);

  return {
    filteredIds: safeIds,
    reasoning: aiResult.reasoning || "",
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
