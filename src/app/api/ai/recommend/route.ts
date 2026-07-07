import { NextRequest, NextResponse } from "next/server";
import { callNvidiaAI } from "@/lib/ai/nvidiaClient";
import { buildPrompt } from "@/lib/ai/promptBuilder";
import { searchProductsBySpec } from "@/services/product.service";

const MODEL = process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512";

/**
 * POST /api/ai/recommend
 *
 * Two-stage AI pipeline:
 * Stage 1: AI understands intent, extracts filters, decides if more info needed
 * Stage 2: Fetch products, then AI filters them to only show truly relevant ones
 *
 * Frontend sends: { message, conversationHistory }
 * conversationHistory: [{ role: "user"|"assistant", content: string }]
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = String(body.message || "").trim();
    const conversationHistory: Array<{ role: string; content: string }> =
      Array.isArray(body.conversationHistory) ? body.conversationHistory : [];

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // ─── Stage 1: Build conversation string for prompt ───────────────────────
    const conversationStr = conversationHistory
      .slice(-10) // keep last 10 turns for context
      .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`)
      .join("\n");

    const fullConversation = conversationStr
      ? `${conversationStr}\nCustomer: ${userMessage}`
      : `Customer: ${userMessage}`;

    const prompt = buildPrompt(fullConversation);

    // ─── Stage 1: Call AI to classify intent + extract filters ───────────────
    const aiIntent = await callNvidiaAI({
      model: MODEL,
      prompt,
      temperature: 0.4,
      maxTokens: 512,
    });

    // Validate AI response
    if (!aiIntent || aiIntent.error || aiIntent.success === false) {
      return NextResponse.json({
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

    // ─── If just a greeting / follow-up question needed → return early ────────
    if (!requiresApiCall || needsMoreInformation) {
      return NextResponse.json({
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

    // ─── Stage 2a: Fetch products from DummyJSON using extracted filters ──────
    let rawProducts: any[] = [];
    try {
      const searchResult = await searchProductsBySpec({
        category: filters.category || null,
        brand: filters.brand || null,
        query: filters.query || null,
        minPrice: typeof filters.minPrice === "number" ? filters.minPrice : null,
        maxPrice: typeof filters.maxPrice === "number" ? filters.maxPrice : null,
        color: filters.color || null,
        purpose: filters.purpose || null,
      });
      rawProducts = searchResult.products || [];
    } catch (err) {
      console.error("Product fetch error:", err);
    }

    // ─── Stage 2b: AI filters the fetched products ────────────────────────────
    let finalProducts: any[] = [];

    if (rawProducts.length > 0) {
      try {
        const { filterProductsWithAI } = await import("@/services/shoppingAssistant.service");
        
        const filterData = await filterProductsWithAI(
          rawProducts,
          intent,
          userMessage,
          filters
        );
        
        const filteredIds: number[] = filterData.filteredIds || [];

        if (filteredIds.length > 0) {
          // Preserve AI-chosen order
          finalProducts = filteredIds
            .map((id) => rawProducts.find((p) => p.id === id))
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

    // ─── Return final response ────────────────────────────────────────────────
    return NextResponse.json({
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
    console.error("AI recommend route error:", error);
    return NextResponse.json(
      { error: "Unable to process AI request." },
      { status: 500 }
    );
  }
}
