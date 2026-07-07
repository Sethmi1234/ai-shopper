import { NextRequest, NextResponse } from "next/server";
import { callNvidiaAI } from "@/lib/ai/nvidiaClient";

const SYSTEM_PROMPT = `
You are an ecommerce recommendation engine.

Your task is to analyze a user's shopping request against a list of available products and select ONLY the products that best match the user's request.

# RULES

1. Consider: intent, category match, description relevance, price suitability, and overall fit
2. Score each product from 0.0 to 1.0 based on how well it satisfies the user's request
3. Only include products with a score of 0.7 or higher
4. Provide a brief reason for why each product was selected
5. Return ONLY valid JSON. No markdown. No explanation.

# OUTPUT FORMAT

{
  "matches": [
    {
      "id": 1,
      "score": 0.95,
      "reason": "Matches healthy breakfast criteria - fresh fruit, under $20"
    },
    {
      "id": 5,
      "score": 0.88,
      "reason": "Good breakfast option, fits budget"
    }
  ]
}

# CRITICAL

- Return an empty matches array if no products are suitable
- Be strict about matching - only include products that genuinely satisfy the request
- Consider price constraints mentioned in the user's request
- Consider the product description and category for relevance
- Return valid JSON only
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    const products = body.products || [];

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Build the prompt with user request and available products
    const aiPrompt = `${SYSTEM_PROMPT}

User Request:
${prompt}

Available Products:
${JSON.stringify(
  products.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    description: p.description,
    category: p.category,
  })),
  null,
  2
)}

Now analyze and return ONLY the matching products as JSON.`;

    // Call NVIDIA AI for intelligent product filtering
    const response = await callNvidiaAI({
      model: process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512",
      prompt: aiPrompt,
      temperature: 0.2, // Low temperature for consistent filtering
      maxTokens: 2048,
    });

    if (!response || response.error) {
      console.error("AI filter error:", response);
      // Fallback: return all products if AI fails
      return NextResponse.json({
        matches: products.map((p: any) => ({
          id: p.id,
          score: 0.5,
          reason: "Fallback - AI filter unavailable",
        })),
      });
    }

    // Validate the response structure
    const matches = Array.isArray(response.matches) ? response.matches : [];

    // Ensure each match has the required fields
    const validatedMatches = matches
      .filter((m: any) => typeof m.id === "number" || typeof m.id === "string")
      .map((m: any) => ({
        id: m.id,
        score: typeof m.score === "number" ? Math.max(0, Math.min(1, m.score)) : 0.5,
        reason: typeof m.reason === "string" ? m.reason : "",
      }));

    return NextResponse.json({ matches: validatedMatches });
  } catch (error) {
    console.error("Filter products route error:", error);
    return NextResponse.json(
      { error: "Unable to filter products." },
      { status: 500 }
    );
  }
}