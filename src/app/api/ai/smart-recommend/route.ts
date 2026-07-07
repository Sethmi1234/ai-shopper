import { NextRequest, NextResponse } from "next/server";
import { callNvidiaAI } from "@/lib/ai/nvidiaClient";

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

/**
 * Fetches ALL products from the external API (DummyJSON) on the backend
 */
async function fetchAllProducts(): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dummyjson.com";
    const res = await fetch(`${baseUrl}/products?limit=200`);
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Failed to fetch products from external API:", error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    const conversation = String(body.conversation || "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    // STEP 1: Backend fetches ALL products from the external API
    console.log("Fetching all products from external API...");
    const allProducts = await fetchAllProducts();

    if (allProducts.length === 0) {
      return NextResponse.json({
        needsClarification: false,
        reply: "I'm having trouble accessing the product catalog right now. Please try again later.",
        products: [],
      });
    }

    console.log(`Fetched ${allProducts.length} products. Now sending to AI for filtering...`);

    // Build conversation context if available
    const conversationContext = conversation
      ? `\n\nPrevious conversation context:\n${conversation}`
      : "";

    // STEP 2: Build the prompt with user request and ALL available products
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

    // STEP 3: Call NVIDIA AI for intelligent understanding and filtering
    const response = await callNvidiaAI({
      model: process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512",
      prompt: aiPrompt,
      temperature: 0.3,
      maxTokens: 4096,
    });

    if (!response || response.error) {
      console.error("Smart recommend AI error:", response);
      // Fallback: return top-rated products if AI fails
      const fallbackProducts = [...allProducts]
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 12);

      return NextResponse.json({
        needsClarification: false,
        reply: "Here are our top-rated products. The AI recommendation engine is temporarily unavailable.",
        products: fallbackProducts,
      });
    }

    // Handle clarification response
    if (response.needsClarification) {
      return NextResponse.json({
        needsClarification: true,
        clarificationQuestion: typeof response.clarificationQuestion === "string"
          ? response.clarificationQuestion
          : "Could you tell me more about what you're looking for?",
        clarificationOptions: Array.isArray(response.clarificationOptions)
          ? response.clarificationOptions
          : [],
        reply: typeof response.reply === "string" ? response.reply : "",
        products: [],
      });
    }

    // STEP 4: Validate the matches and map back to FULL product data
    const matches = Array.isArray(response.matches) ? response.matches : [];
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

    console.log(`AI selected ${matchedProducts.length} products out of ${allProducts.length}`);

    // STEP 5: Return the final filtered products with full data
    return NextResponse.json({
      needsClarification: false,
      reply: typeof response.reply === "string"
        ? response.reply
        : `Found ${matchedProducts.length} products that match your request!`,
      products: matchedProducts,
    });
  } catch (error) {
    console.error("Smart recommend route error:", error);
    return NextResponse.json(
      { error: "Unable to process your request." },
      { status: 500 }
    );
  }
}