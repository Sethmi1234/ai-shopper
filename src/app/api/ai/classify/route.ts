import { NextRequest, NextResponse } from "next/server";
import { callNvidiaAI } from "@/lib/ai/nvidiaClient";
import { ALLOWED_CATEGORIES } from "@/lib/categories";

const SYSTEM_PROMPT = `
You are a product intent classifier for an ecommerce shopping assistant.

Your ONLY role is to classify user messages into product categories.

Return ONLY valid JSON. No markdown. No explanation.

# CATEGORIES ALLOWED

${ALLOWED_CATEGORIES.filter((c) => c !== "general").join(", ")}

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    // Build the prompt with system instructions
    const prompt = `${SYSTEM_PROMPT}

User message: ${message}`;

    // Call NVIDIA AI for classification
    const response = await callNvidiaAI({
      model: process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512",
      prompt,
      temperature: 0, // Low temperature for consistent classification
      maxTokens: 100,
    });

    if (!response || response.error) {
      console.error("Classification error:", response);
      // Fallback to general if AI fails
      return NextResponse.json({
        category: "general",
        confidence: 0.3,
      });
    }

    // Validate the category is in allowed list
    const category = response.category || "general";
    const validatedCategory = ALLOWED_CATEGORIES.includes(category as any)
      ? category
      : "general";

    return NextResponse.json({
      category: validatedCategory,
      confidence: response.confidence || 0.5,
    });
  } catch (error) {
    console.error("Classify route error:", error);
    return NextResponse.json(
      { error: "Unable to classify intent." },
      { status: 500 }
    );
  }
}
