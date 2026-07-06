import { callNvidiaAI } from "@/lib/ai/nvidiaClient";
import { buildPrompt } from "@/lib/ai/promptBuilder";
import {
  AiIntent,
  ApiAction,
  ShoppingAiResponse,
  ShoppingAiResponseOverrides,
} from "@/lib/ai/types";

const DEFAULT_MODEL = "mistralai/mistral-large-3-675b-instruct-2512";

const EMPTY_FILTERS: ShoppingAiResponse["filters"] = {
  category: "",
  brand: "",
  query: "",
  minPrice: null,
  maxPrice: null,
  color: "",
  purpose: "",
};

const CATEGORY_ALIASES: Record<string, string> = {
  skincare: "skin-care",
  "skin care": "skin-care",
  laptop: "laptops",
  laptops: "laptops",
  phone: "smartphones",
  phones: "smartphones",
  smartphone: "smartphones",
  smartphones: "smartphones",
  mobile: "smartphones",
  mobiles: "smartphones",
  tablet: "tablets",
  tablets: "tablets",
  shoe: "mens-shoes",
  shoes: "mens-shoes",
  shirt: "mens-shirts",
  shirts: "mens-shirts",
  dress: "womens-dresses",
  dresses: "womens-dresses",
  bag: "womens-bags",
  bags: "womens-bags",
  watch: "womens-watches",
  watches: "womens-watches",
  jewellery: "womens-jewellery",
  jewelry: "womens-jewellery",
  sunglasses: "sunglasses",
  furniture: "furniture",
  desk: "furniture",
  decor: "home-decoration",
  kitchen: "kitchen-accessories",
  grocery: "groceries",
  groceries: "groceries",
  fragrance: "fragrances",
  fragrances: "fragrances",
  sport: "sports-accessories",
  sports: "sports-accessories",
  motorcycle: "motorcycle",
  vehicle: "vehicle",
  beauty: "beauty",
  tops: "tops",
};

const BRAND_WORDS = [
  "apple",
  "samsung",
  "nike",
  "dior",
  "gucci",
  "lenovo",
  "asus",
  "oppo",
  "vivo",
  "huawei",
  "calvin",
  "klein",
];

const COLOR_WORDS = [
  "black",
  "white",
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
  "purple",
  "brown",
  "gray",
  "grey",
  "silver",
  "gold",
];

const PURPOSE_WORDS = [
  "gaming",
  "work",
  "school",
  "programming",
  "office",
  "casual",
  "sports",
  "gift",
  "travel",
];

function baseResponse(overrides: ShoppingAiResponseOverrides): ShoppingAiResponse {
  return {
    intent: "product_search",
    requiresApiCall: false,
    apiAction: "",
    needsMoreInformation: false,
    missingInformation: [],
    reply: "How can I help you find products today?",
    confidenceScore: 70,
    ...overrides,
    filters: {
      ...EMPTY_FILTERS,
      ...(overrides.filters || {}),
    },
  };
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeIntent(value: unknown): AiIntent {
  const allowed: AiIntent[] = [
    "greeting",
    "gratitude",
    "product_search",
    "recommendation",
    "app_question",
    "out_of_scope",
  ];
  return allowed.includes(value as AiIntent)
    ? (value as AiIntent)
    : "product_search";
}

function normalizeAction(value: unknown): ApiAction {
  const allowed: ApiAction[] = [
    "",
    "search_products",
    "recommended_products",
    "featured_products",
  ];
  return allowed.includes(value as ApiAction) ? (value as ApiAction) : "";
}

function normalizeCategory(value: unknown): string {
  if (typeof value !== "string") return "";
  const clean = value.toLowerCase().trim();
  return CATEGORY_ALIASES[clean] || clean.replace(/\s+/g, "-");
}

function defaultReply(
  intent: AiIntent,
  requiresApiCall: boolean,
  needsMoreInformation: boolean
) {
  if (intent === "greeting") return "Hi! What kind of product are you looking for?";
  if (intent === "gratitude") return "You're welcome. Happy shopping!";
  if (intent === "app_question") {
    return "You can browse products, search with filters, view product details, add favorites, and manage your cart.";
  }
  if (intent === "out_of_scope") {
    return "I'm here to help with shopping, products, categories, and this ecommerce app.";
  }
  if (needsMoreInformation) return "Could you share a little more detail so I can search better?";
  if (requiresApiCall) return "Let me find matching products for you.";
  return "How can I help you find products today?";
}

function normalizeAiResponse(raw: any, userMessage: string): ShoppingAiResponse {
  if (!raw || raw.success === false) return inferLocalShoppingResponse(userMessage);

  const filters = raw.filters && typeof raw.filters === "object" ? raw.filters : {};
  const intent = normalizeIntent(raw.intent);
  const needsMoreInformation = Boolean(raw.needsMoreInformation);
  const requiresApiCall = Boolean(raw.requiresApiCall) && !needsMoreInformation;
  const apiAction = requiresApiCall ? normalizeAction(raw.apiAction) : "";

  return baseResponse({
    intent,
    requiresApiCall,
    apiAction: apiAction || (requiresApiCall ? "search_products" : ""),
    needsMoreInformation,
    missingInformation: Array.isArray(raw.missingInformation)
      ? raw.missingInformation.filter((item: unknown) => typeof item === "string")
      : [],
    filters: {
      category: normalizeCategory(filters.category),
      brand: typeof filters.brand === "string" ? filters.brand.trim() : "",
      query: typeof filters.query === "string" ? filters.query.trim() : "",
      minPrice: asNumber(filters.minPrice),
      maxPrice: asNumber(filters.maxPrice),
      color: typeof filters.color === "string" ? filters.color.trim() : "",
      purpose: typeof filters.purpose === "string" ? filters.purpose.trim() : "",
    },
    reply:
      typeof raw.reply === "string" && raw.reply.trim()
        ? raw.reply.trim()
        : defaultReply(intent, requiresApiCall, needsMoreInformation),
    confidenceScore:
      typeof raw.confidenceScore === "number"
        ? Math.max(0, Math.min(100, raw.confidenceScore))
        : 70,
  });
}

function titleCase(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}

function inferLocalShoppingResponse(userMessage: string): ShoppingAiResponse {
  const text = userMessage.toLowerCase().trim();

  if (/^(hi|hello|hey|helo|hii)\b/.test(text)) {
    return baseResponse({
      intent: "greeting",
      reply: "Hi! What kind of product are you looking for today?",
      confidenceScore: 95,
    });
  }

  if (/\b(thanks|thank you|thank)\b/.test(text)) {
    return baseResponse({
      intent: "gratitude",
      reply: "You're welcome. Happy shopping!",
      confidenceScore: 95,
    });
  }

  if (/\b(quantum|homework|news|weather|recipe|story|essay)\b/.test(text)) {
    return baseResponse({
      intent: "out_of_scope",
      reply:
        "I'm here to help you discover products and answer shopping-related questions.",
      confidenceScore: 90,
    });
  }

  if (/\b(how|where|what).*\b(app|cart|wishlist|favorite|login|checkout|search|product page)\b/.test(text)) {
    return baseResponse({
      intent: "app_question",
      reply:
        "You can browse products, search by category or price, view details, add favorites, and use the cart from the dashboard.",
      confidenceScore: 90,
    });
  }

  const maxPriceMatch =
    text.match(/\b(?:under|below|less than|up to|max|maximum)\s*\$?\s*(\d{2,6})\b/) ||
    text.match(/\$\s?(\d{2,6})/);
  const minPriceMatch = text.match(/\b(?:over|above|more than|min|minimum)\s*\$?\s*(\d{2,6})\b/);
  const maxPrice = maxPriceMatch ? Number(maxPriceMatch[1]) : null;
  const minPrice = minPriceMatch ? Number(minPriceMatch[1]) : null;
  const words = text.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  const categoryWord = words.find((word) => CATEGORY_ALIASES[word]);
  const category = categoryWord ? CATEGORY_ALIASES[categoryWord] : "";
  const brandWord = words.find((word) => BRAND_WORDS.includes(word));
  const colorWord = words.find((word) => COLOR_WORDS.includes(word));
  const purposeWord = words.find((word) => PURPOSE_WORDS.includes(word));
  const isRecommendation = /\b(recommend|suggest|best|gift)\b/.test(text);
  const hasShoppingVerb = /\b(show|find|search|need|want|looking|buy|browse|products?|items?)\b/.test(text);
  const isBroadLaptopOrPhone =
    (category === "laptops" || category === "smartphones") &&
    !maxPrice &&
    !purposeWord &&
    !brandWord;

  if (isBroadLaptopOrPhone) {
    return baseResponse({
      intent: isRecommendation ? "recommendation" : "product_search",
      needsMoreInformation: true,
      missingInformation: ["budget", "purpose"],
      filters: { category },
      reply: "Sure. What's your budget, and what will you use it for?",
      confidenceScore: 90,
    });
  }

  if (category || brandWord || maxPrice || minPrice || colorWord || purposeWord || isRecommendation || hasShoppingVerb) {
    return baseResponse({
      intent: isRecommendation ? "recommendation" : "product_search",
      requiresApiCall: true,
      apiAction: isRecommendation ? "recommended_products" : "search_products",
      filters: {
        category,
        brand: brandWord ? titleCase(brandWord) : "",
        query: category ? "" : userMessage,
        minPrice,
        maxPrice,
        color: colorWord || "",
        purpose: purposeWord || "",
      },
      reply: isRecommendation
        ? "Let me find suitable products from the catalog."
        : "Let me look for matching products.",
      confidenceScore: category || maxPrice || brandWord ? 90 : 75,
    });
  }

  return baseResponse({
    intent: "product_search",
    requiresApiCall: true,
    apiAction: "search_products",
    filters: { query: userMessage },
    reply: "Let me look for matching products.",
    confidenceScore: 65,
  });
}

export const getShoppingAssistantResponse = async (params: {
  message: string;
  conversation?: string;
  model?: string;
  useNvidia?: boolean;
}): Promise<ShoppingAiResponse> => {
  const localResponse = inferLocalShoppingResponse(params.message);

  if (!params.useNvidia || localResponse.confidenceScore >= 65) {
    return localResponse;
  }

  const prompt = buildPrompt(
    [params.conversation, `Current user message: ${params.message}`]
      .filter(Boolean)
      .join("\n")
  );

  const response = await callNvidiaAI({
    model: params.model || process.env.NVIDIA_MODEL || DEFAULT_MODEL,
    prompt,
    temperature: 0.5,
    maxTokens: 1024,
  });

  return normalizeAiResponse(response, params.message);
};
