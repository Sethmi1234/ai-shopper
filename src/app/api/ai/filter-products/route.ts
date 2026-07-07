import { NextRequest, NextResponse } from "next/server";
import { callNvidiaAI } from "@/lib/ai/nvidiaClient";

const MODEL = process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512";

/**
 * POST /api/ai/filter-products
 *
 * Takes a list of products and the user's intent/query.
 * AI reads all products and returns ONLY the IDs that genuinely match.
 * This is the "Stage 2" AI call that makes the chatbot intelligent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, userIntent, userMessage, filters } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ filteredIds: [] });
    }

    // Build a compact product list for the AI to reason about
    const productSummaries = products
      .slice(0, 30) // limit to 30 products to keep token count reasonable
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        description: p.description
          ? p.description.substring(0, 120)
          : "",
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
      model: MODEL,
      prompt,
      temperature: 0.2,
      maxTokens: 512,
    });

    if (!aiResult || aiResult.error || !Array.isArray(aiResult.filteredIds)) {
      // If AI filter fails, fall back to returning first 4 products
      console.warn("AI filter failed, using fallback:", aiResult?.error);
      return NextResponse.json({
        filteredIds: products.slice(0, 4).map((p: any) => p.id),
        fallback: true,
      });
    }

    // Validate: only return IDs that actually exist in the product list
    const validIds = new Set(products.map((p: any) => p.id));
    const safeIds = aiResult.filteredIds
      .filter((id: any) => typeof id === "number" && validIds.has(id))
      .slice(0, 6);

    return NextResponse.json({
      filteredIds: safeIds,
      reasoning: aiResult.reasoning || "",
    });
  } catch (error) {
    console.error("Filter products route error:", error);
    return NextResponse.json(
      { error: "Unable to filter products.", filteredIds: [] },
      { status: 500 }
    );
  }
}