export type ShoppingAiIntent =
  | "greeting"
  | "gratitude"
  | "product_search"
  | "recommendation"
  | "app_question"
  | "out_of_scope";

export type ShoppingAiResponse = {
  intent: ShoppingAiIntent;
  requiresApiCall: boolean;
  apiAction: "" | "search_products" | "recommended_products" | "featured_products";
  needsMoreInformation: boolean;
  missingInformation: string[];
  filters: {
    category: string;
    brand: string;
    query: string;
    minPrice: number | null;
    maxPrice: number | null;
    color: string;
    purpose: string;
  };
  reply: string;
  confidenceScore: number;
};

export type AiResponse = {
  data?: ShoppingAiResponse;
  error?: string;
};

export async function requestAiStructuredOutput(
  message: string,
  options?: {
    conversation?: string;
  }
): Promise<AiResponse> {
  try {
    // Frontend sends ONLY: message and conversation (optional)
    // System prompt is built on backend - never exposed to frontend
    const res = await fetch(`/api/ai/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversation: options?.conversation,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { error: `Server error: ${res.status} ${txt}` };
    }

    const json = await res.json();
    return json as AiResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}
