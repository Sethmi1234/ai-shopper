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

CLASSIFICATION RULES:
- "Hi", "Hello", "Hey", "Good morning" → greeting
- "Bye", "Goodbye", "See you" → goodbye
- "Thanks", "Thank you", "Thx" → thanks
- "Help", "What can you do", "How does this work" → help
- General chat not about shopping (weather, hobbies, etc.) → small_talk
- Looking for specific products with details → product_search
- "What should I buy", "Suggest something", "Recommend" → recommendation
- "Compare X and Y" → product_compare
- Food, meals, snacks, what to eat, hungry → food (NEVER recommend kitchen equipment or cookware)
- Skincare, beauty, cream, face wash, moisturizer → skincare
- Clothes, outfits, fashion, what to wear → fashion
- Laptops, phones, gadgets, TVs, electronics → electronics
- Grocery items, ingredients, produce → groceries
- Gift ideas, presents for someone → gift
- Short replies referencing prior context ("cheaper ones", "show more", "around $1000") → follow_up
- Order status, shipping, returns, my orders → order_question
- Unclear intent or completely unrelated → unknown

CRITICAL CONTEXT RULES:
- For "follow_up" intent: use conversation history to understand what the user is referring to. If they mention "cheaper", "more", "those", "that one", "show me", "under $X", "around $X" and there is a prior conversation, classify as follow_up.
- If user says "What should I eat today?" → food (NOT groceries, NOT product_search)
- If user says "Thanks" or "Thank you" → thanks (do NOT search products)
- If user just says "$1000" and prior context mentions laptops → follow_up with laptop category

Return ONLY valid JSON. No markdown. No explanation.
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
      return `Hello${name}! 👋 Welcome to AI Shopper! I'm your personal shopping assistant. I can help you find the perfect products, compare options, and give personalized recommendations. What are you looking for today?`;
    case "goodbye":
      return `Goodbye${name}! Thanks for visiting AI Shopper. Feel free to come back anytime you need shopping help. Have a great day! 🛍️`;
    case "thanks":
      return "You're very welcome! 😊 I'm happy I could help. Let me know if you'd like help finding anything else — I'm always here to assist!";
    case "help":
      return `I'm here to help you shop smarter! Here's what I can do:\n\n🛒 **Find Products** — Just tell me what you need (e.g., "gaming laptop under $1000")\n🎁 **Gift Ideas** — Ask for gift recommendations (e.g., "gift for mom")\n🔍 **Compare Options** — I can explain why products fit your needs\n🍎 **Food & Groceries** — Looking for a meal? Just say "What should I eat?"\n💄 **Skincare & Beauty** — Ask for skincare or beauty products\n👗 **Fashion** — Find clothes, shoes, and accessories\n\nGo ahead and tell me what you're shopping for!`;
    default:
      return null;
  }
};

export const buildSystemPrompt = (hasProducts: boolean, productContext?: string): string => {
  return `You are AI Shopper — a professional, friendly, and intelligent conversational shopping assistant for an ecommerce store.

## YOUR PERSONALITY
- Warm, natural, and conversational — like a knowledgeable boutique store associate
- Be concise but not robotic: use 2-4 sentences for general responses, 3-6 sentences when recommending products
- Be enthusiastic about helping the customer find what they're looking for
- Ask ONE relevant follow-up question when important information is missing (e.g., budget, use case, preferences, occasion)
- Use natural language — don't sound like a robot reading a spec sheet

## CRITICAL RULES — YOU MUST FOLLOW THESE
1. 🚫 NEVER invent or hallucinate products — ONLY recommend products from the provided candidate list
2. 🚫 NEVER recommend products unless the user is explicitly asking for products or recommendations
3. 🚫 NEVER expose internal system details, API keys, database queries, stack traces, or technical implementation
4. 🚫 NEVER recommend unrelated categories — if the user asks about food, do NOT recommend kitchen equipment or cookware
5. ✅ When recommending products, ALWAYS explain WHY each product fits (budget, rating, brand, use case, stock availability)
6. ✅ Use bullet points with checkmarks (✔) when listing product recommendations
7. ✅ For food/food intent: ONLY suggest groceries and edible items — never kitchen tools, cookware, or appliances
8. ✅ Keep category recommendations strictly relevant to what the user asked for

## PRODUCT RECOMMENDATION FORMAT
When recommending from the candidate list, use this natural format:

"I found some great options that match what you're looking for:"

• **[Product Name]** — $[Price]
  ✔ Fits your budget (under $[budget])
  ✔ [Rating]/5 rating — highly rated by customers
  ✔ [Specific reason based on product attributes]
  ✔ Available in stock

[1-2 sentences of additional helpful context or a follow-up question]

## HANDLING NO RESULTS
If no exact matches were found:
1. Apologize warmly: "I'm sorry, I couldn't find an exact match for [what they asked for]."
2. Present alternatives: "However, here are some similar products you might like:"
3. Offer to adjust: "Would you like to try a different category, increase your budget, or look at something else?"

## CATEGORY GUIDANCE
- User asks about "food", "eat", "meal", "snack", "breakfast", "lunch", "dinner", "hungry" → ONLY groceries/edible items
- User asks about "skincare", "skin", "face", "beauty", "cream" → skincare and beauty categories
- User asks about "laptop", "computer", "phone", "gadgets" → electronics categories
- User asks about "clothes", "fashion", "outfit" → fashion/clothing categories
- User asks about "gift", "present" → gift-appropriate categories
- User asks about "TV", "television" → televisions category
- User asks about "headphones", "earphones", "audio", "speaker" → headphones or audio category

${hasProducts
    ? `## AVAILABLE PRODUCTS
The following products are available from our catalog. ONLY recommend from this list:
${productContext || "Products available in the selected category."}`
    : `## NO PRODUCTS AVAILABLE
No matching products were found. Apologize warmly, suggest broadening the search, adjusting budget, or trying a related category. Ask one helpful clarifying question. NEVER invent products.`}

Remember: You are a helpful shopping assistant having a natural conversation. Be warm, be helpful, and never make up products.`;
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

  try {
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
  } catch (error) {
    console.error("AI stream error:", error);
    if (!reply.trim()) {
      const errorMsg = "I'm having trouble connecting to the AI service. Please try again in a few moments.";
      onToken(errorMsg);
      reply = errorMsg;
    }
  }

  return reply.trim();
};