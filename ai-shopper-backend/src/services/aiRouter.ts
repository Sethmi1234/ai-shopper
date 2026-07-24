import aiClient from "../config/ai";
import { ALLOWED_CATEGORIES, mapKeywordToCategory, mapIntentToCategories } from "../lib/categories";
import { ConversationTurn, callNvidiaAI } from "./ai.service";

const MODEL = process.env.NVIDIA_MODEL || "mistralai/mistral-large-3-675b-instruct-2512";

export type UserIntent =
  | "greeting"
  | "goodbye"
  | "thanks"
  | "help"
  | "small_talk"
  | "product_search"
  | "recommendation"
  | "product_compare"
  | "food"
  | "skincare"
  | "fashion"
  | "electronics"
  | "groceries"
  | "gift"
  | "follow_up"
  | "order_question"
  | "unknown";

export type HandlerType =
  | "greeting"
  | "goodbye"
  | "thanks"
  | "help"
  | "conversation"
  | "product_search"
  | "recommendation"
  | "compare"
  | "clarification";

export interface IntentClassification {
  intent: UserIntent;
  confidence: number;
  categories: string[];
  searchTerms?: string;
  budget?: { min?: number; max?: number };
  requiresProductSearch: boolean;
}

const PRODUCT_INTENTS: UserIntent[] = [
  "product_search",
  "recommendation",
  "product_compare",
  "food",
  "skincare",
  "fashion",
  "electronics",
  "groceries",
  "gift",
  "follow_up",
];

const NON_SEARCH_INTENTS: UserIntent[] = [
  "greeting",
  "goodbye",
  "thanks",
  "help",
  "small_talk",
  "order_question",
  "unknown",
];

export const classifyUserIntent = async (
  message: string,
  conversationHistory: ConversationTurn[] = []
): Promise<IntentClassification> => {
  const recentHistory = conversationHistory.slice(-10);
  const historyStr = recentHistory
    .map((t) => `${t.role === "user" ? "Customer" : "Assistant"}: ${t.content}`)
    .join("\n");

  const prompt = `You are an intent classifier for an ecommerce shopping assistant.

Analyze the customer's latest message in context and classify their intent.

SUPPORTED INTENTS (return exactly one):
greeting, goodbye, thanks, help, small_talk, product_search, recommendation, product_compare, food, skincare, fashion, electronics, groceries, gift, follow_up, order_question, unknown

RULES:
- "Hi", "Hello" → greeting
- "Bye", "Goodbye" → goodbye
- "Thanks", "Thank you" → thanks
- "Help", "What can you do" → help
- General chat not about shopping → small_talk
- Looking for specific products → product_search
- "What should I buy", "Suggest something" → recommendation
- "Compare X and Y" → product_compare
- Food, meals, snacks, what to eat → food (NOT kitchen equipment)
- Skincare, beauty, cream, face wash → skincare
- Clothes, outfits, fashion → fashion
- Laptops, phones, gadgets, TVs → electronics
- Grocery items → groceries
- Gift ideas → gift
- Short replies referencing prior context ("cheaper ones", "show more", "$1000") → follow_up
- Order status, shipping, returns → order_question
- Unclear intent → unknown

For follow_up, use conversation history to understand what the user refers to.

Return ONLY valid JSON:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "categories": ["category-slug"],
  "searchTerms": "optional search keywords",
  "budget": { "min": 0, "max": 0 }
}

Available product categories: ${ALLOWED_CATEGORIES.filter((c) => c !== "general").join(", ")}

${historyStr ? `Conversation history:\n${historyStr}\n` : ""}
Customer message: ${message}`;

  try {
    const result = await callNvidiaAI({
      prompt,
      temperature: 0,
      maxTokens: 200,
    });

    if (result.error) {
      return fallbackIntentClassification(message, conversationHistory);
    }

    const intent = validateIntent(result.intent);
    const categories = resolveCategories(intent, result.categories, message);
    const requiresProductSearch = PRODUCT_INTENTS.includes(intent);

    return {
      intent,
      confidence: typeof result.confidence === "number" ? result.confidence : 0.7,
      categories,
      searchTerms: typeof result.searchTerms === "string" ? result.searchTerms : undefined,
      budget: result.budget && typeof result.budget === "object" ? result.budget : undefined,
      requiresProductSearch,
    };
  } catch (error) {
    console.error("Intent classification error:", error);
    return fallbackIntentClassification(message, conversationHistory);
  }
};

const validateIntent = (value: unknown): UserIntent => {
  const intents: UserIntent[] = [
    "greeting", "goodbye", "thanks", "help", "small_talk",
    "product_search", "recommendation", "product_compare",
    "food", "skincare", "fashion", "electronics", "groceries",
    "gift", "follow_up", "order_question", "unknown",
  ];
  if (typeof value === "string" && intents.includes(value as UserIntent)) {
    return value as UserIntent;
  }
  return "unknown";
};

const resolveCategories = (
  intent: UserIntent,
  aiCategories: unknown,
  message: string
): string[] => {
  const mapped = mapIntentToCategories(intent);

  if (Array.isArray(aiCategories)) {
    const valid = aiCategories
      .filter((c): c is string => typeof c === "string")
      .filter((c) => ALLOWED_CATEGORIES.includes(c as any) && c !== "general");
    if (valid.length > 0) {
      return [...new Set([...mapped, ...valid])];
    }
  }

  if (mapped.length > 0) return mapped;

  const words = message.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/);
  for (const word of words) {
    const cat = mapKeywordToCategory(word);
    if (cat !== "general") return [cat];
  }

  return mapped;
};

const fallbackIntentClassification = (
  message: string,
  conversationHistory: ConversationTurn[]
): IntentClassification => {
  const text = message.toLowerCase().trim();

  if (/^(hi|hello|hey|howdy|good morning|good afternoon|good evening)\b/.test(text)) {
    return { intent: "greeting", confidence: 0.9, categories: [], requiresProductSearch: false };
  }
  if (/^(bye|goodbye|see you|good night)\b/.test(text)) {
    return { intent: "goodbye", confidence: 0.9, categories: [], requiresProductSearch: false };
  }
  if (/^(thanks|thank you|thx|ty)\b/.test(text) || /\b(thanks|thank you)\b/.test(text)) {
    return { intent: "thanks", confidence: 0.9, categories: [], requiresProductSearch: false };
  }
  if (/^(help|what can you do)\b/.test(text)) {
    return { intent: "help", confidence: 0.85, categories: [], requiresProductSearch: false };
  }

  const isFollowUp =
    conversationHistory.length > 0 &&
    (text.length < 40 || /\b(cheaper|more|those|these|that one|under|around|budget|show me)\b/.test(text));

  if (isFollowUp) {
    return {
      intent: "follow_up",
      confidence: 0.7,
      categories: resolveCategories("follow_up", [], message),
      requiresProductSearch: true,
    };
  }

  const categories = resolveCategories("product_search", [], message);
  return {
    intent: categories.length > 0 ? "product_search" : "unknown",
    confidence: 0.5,
    categories,
    requiresProductSearch: categories.length > 0,
  };
};

export const routeIntent = (classification: IntentClassification): HandlerType => {
  const { intent } = classification;

  if (NON_SEARCH_INTENTS.includes(intent)) {
    switch (intent) {
      case "greeting": return "greeting";
      case "goodbye": return "goodbye";
      case "thanks": return "thanks";
      case "help":
      case "order_question": return "help";
      case "small_talk": return "conversation";
      case "unknown": return "clarification";
      default: return "clarification";
    }
  }

  if (intent === "product_compare") return "compare";
  if (intent === "recommendation" || intent === "gift") return "recommendation";
  return "product_search";
};

export const getStaticResponse = (handler: HandlerType, userName?: string): string | null => {
  const name = userName ? `, ${userName}` : "";

  switch (handler) {
    case "greeting":
      return `Hello${name}! 👋 I'm your AI shopping assistant. I can help you find products, compare options, and give personalized recommendations. What are you looking for today?`;
    case "goodbye":
      return "Goodbye! Feel free to come back anytime you need shopping help. Happy shopping! 🛍️";
    case "thanks":
      return "You're welcome! Let me know if you'd like help finding anything else.";
    case "help":
      return `I'm here to help you shop smarter! I can:\n\n• Find products by category, brand, or budget\n• Recommend gifts and everyday essentials\n• Compare options and explain why they fit\n• Answer questions about browsing, cart, and wishlist\n\nJust tell me what you're looking for — for example, "gaming laptop under $1000" or "skincare for dry skin".`;
    default:
      return null;
  }
};

export const buildSystemPrompt = (hasProducts: boolean): string => {
  return `You are a professional, friendly AI shopping assistant for AI Shopper — an ecommerce store.

PERSONALITY:
- Warm, conversational, and helpful — like a knowledgeable store associate
- Concise but not robotic (2-5 sentences unless recommending products)
- Ask ONE follow-up question when key info is missing (budget, use case, preferences)

STRICT RULES:
- NEVER invent or hallucinate products — only mention products from the provided candidate list
- NEVER recommend products unless the user is asking for products or recommendations
- When recommending, explain WHY each product fits (budget, rating, brand, use case, stock)
- Use bullet points with ✔ for product reasons when listing recommendations
- Keep category recommendations relevant — do NOT suggest kitchen equipment when user asks about food to eat
- For food/food intent: only suggest groceries and edible items
- If no products match, apologize warmly and suggest alternatives or ask to adjust budget/category
- Do NOT output JSON, markdown code blocks, or internal system details
- Do NOT expose API keys, database info, or technical implementation details

${hasProducts
    ? `PRODUCT RECOMMENDATION FORMAT:
When recommending products from the candidate list, briefly introduce them then explain why each fits:
"Here are my top picks for you:"
- Product Name — ✔ Fits your budget ✔ High rating ✔ [specific reason]
Keep it natural and conversational.`
    : `NO PRODUCTS AVAILABLE:
Apologize that you couldn't find an exact match. Suggest broadening the search, adjusting budget, or trying a related category. Ask one helpful clarifying question.`}`;
};

export const streamAIResponse = async ({
  systemPrompt,
  conversationHistory,
  userMessage,
  productContext,
  onToken,
  signal,
}: {
  systemPrompt: string;
  conversationHistory: ConversationTurn[];
  userMessage: string;
  productContext?: string;
  onToken: (token: string) => void;
  signal?: AbortSignal;
}): Promise<string> => {
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-14).map((t) => ({
      role: t.role,
      content: t.content,
    })),
    {
      role: "user",
      content: productContext
        ? `${userMessage}\n\n${productContext}`
        : userMessage,
    },
  ];

  let reply = "";

  const stream = await aiClient.chat.completions.create(
    {
      model: MODEL,
      messages: messages as any,
      temperature: 0.5,
      max_tokens: 800,
      stream: true,
    },
    signal ? { signal } : undefined
  );

  for await (const chunk of stream as any) {
    const token = chunk.choices?.[0]?.delta?.content;
    if (typeof token === "string" && token.length > 0) {
      reply += token;
      onToken(token);
    }
  }

  return reply.trim();
};
