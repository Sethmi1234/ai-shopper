import { getProducts } from "./product.service";
import { filterProductsWithAI } from "./ai.service";
import {
  classifyUserIntent,
  routeIntent,
  getStaticResponse,
  buildSystemPrompt,
  streamAIResponse,
  IntentClassification,
  HandlerType,
} from "./aiRouter";
import {
  getOrCreateChat,
  appendMessages,
  getConversationHistory,
} from "./historyService";
import { extractCategoriesFromMessage } from "../lib/categories";

const PRODUCT_LOOKUP_TIMEOUT_MS = Number(process.env.AI_PRODUCT_LOOKUP_TIMEOUT_MS || 8_000);
const AI_STREAM_TIMEOUT_MS = Number(process.env.AI_STREAM_TIMEOUT_MS || 25_000);
const MAX_MEMORY_TURNS = 15;

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface RecommendedProduct {
  id: string;
  title: string;
  price: number;
  category?: string;
  thumbnail?: string;
  rating?: number;
  brand?: string;
  description?: string;
  reasons?: string[];
}

export interface ChatProcessInput {
  userId: string;
  userName?: string;
  message: string;
  sessionId?: string;
  conversationHistory?: ConversationTurn[];
  socketMemory?: ConversationTurn[];
  onToken: (token: string) => void;
}

export interface ChatProcessResult {
  reply: string;
  products: RecommendedProduct[];
  suggestions: string[];
  sessionId: string;
}

const SHOPPING_STOP_WORDS = new Set([
  "i", "me", "my", "a", "an", "the", "is", "are", "was", "were", "am",
  "show", "find", "search", "need", "want", "looking", "for", "some",
  "please", "can", "you", "get", "give", "recommend", "suggest",
  "best", "good", "nice", "any", "about", "products", "product", "items", "item",
  "buy", "shop", "shopping", "help", "would", "like", "something", "anything",
]);

const serializeProduct = (product: any, reasons?: string[]): RecommendedProduct => ({
  id: String(product._id || product.id),
  title: product.title,
  price: product.price,
  category: product.category,
  thumbnail: product.thumbnail,
  rating: product.rating,
  brand: product.brand,
  description: product.description ? product.description.substring(0, 140) : "",
  reasons,
});

const withTimeout = async <T>(
  work: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
  });
  try {
    return await Promise.race([work, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const mergeConversationHistory = (
  dbHistory: ConversationTurn[],
  clientHistory: ConversationTurn[],
  socketMemory: ConversationTurn[]
): ConversationTurn[] => {
  const combined = [...dbHistory, ...clientHistory, ...socketMemory];
  const seen = new Set<string>();
  const deduped: ConversationTurn[] = [];

  for (const turn of combined) {
    const key = `${turn.role}:${turn.content}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(turn);
    }
  }

  return deduped.slice(-MAX_MEMORY_TURNS);
};

const extractSearchTerms = (
  message: string,
  classification: IntentClassification
): string | undefined => {
  if (classification.searchTerms?.trim()) {
    return classification.searchTerms.trim();
  }

  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => !SHOPPING_STOP_WORDS.has(w) && w.length > 1);

  const search = words.join(" ").trim();
  return search || undefined;
};

const buildProductReasons = (product: any, classification: IntentClassification): string[] => {
  const reasons: string[] = [];

  if (classification.budget?.max && product.price <= classification.budget.max) {
    reasons.push("Fits your budget");
  } else if (classification.budget?.min && product.price >= classification.budget.min) {
    reasons.push("Within your price range");
  }

  if (product.rating && product.rating >= 4) {
    reasons.push("High rating");
  } else if (product.rating && product.rating >= 3.5) {
    reasons.push("Well rated");
  }

  if (product.stock > 0) {
    reasons.push("Available in stock");
  }

  if (product.brand) {
    reasons.push(`${product.brand} brand`);
  }

  if (reasons.length === 0) {
    reasons.push("Matches your search");
  }

  return reasons.slice(0, 4);
};

const searchProducts = async (
  message: string,
  classification: IntentClassification
): Promise<any[]> => {
  const categories =
    classification.categories.length > 0
      ? classification.categories
      : extractCategoriesFromMessage(message);

  const searchTerms = extractSearchTerms(message, classification);
  const allProducts: any[] = [];
  const seenIds = new Set<string>();

  const queries: Array<{ category?: string; search?: string }> = [];

  if (categories.length > 0) {
    for (const category of categories.slice(0, 3)) {
      queries.push({ category, ...(searchTerms ? { search: searchTerms } : {}) });
    }
  } else if (searchTerms) {
    queries.push({ search: searchTerms });
  }

  if (queries.length === 0) return [];

  for (const query of queries) {
    try {
      const result = await withTimeout(
        getProducts({
          page: 1,
          limit: 8,
          ...query,
          sort: "rating",
        }),
        PRODUCT_LOOKUP_TIMEOUT_MS,
        "Product lookup"
      );

      for (const product of result.data) {
        const id = String(product._id || product.id);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          allProducts.push(product);
        }
      }
    } catch (error) {
      console.error("Product search error:", error);
    }
  }

  let filtered = allProducts;

  if (classification.budget?.min || classification.budget?.max) {
    filtered = allProducts.filter((p) => {
      const price = Number(p.price);
      if (classification.budget?.min && price < classification.budget.min) return false;
      if (classification.budget?.max && price > classification.budget.max) return false;
      return true;
    });
  }

  if (filtered.length === 0 && allProducts.length > 0) {
    filtered = allProducts;
  }

  if (filtered.length > 6) {
    try {
      const aiFilter = await filterProductsWithAI(
        filtered,
        classification.intent,
        message,
        classification.budget || {}
      );
      const idSet = new Set((aiFilter.filteredIds || []).map(String));
      if (idSet.size > 0) {
        filtered = filtered.filter((p) => idSet.has(String(p._id || p.id)));
      }
    } catch {
      filtered = filtered.slice(0, 6);
    }
  }

  return filtered.slice(0, 6);
};

const findSimilarProducts = async (categories: string[]): Promise<any[]> => {
  if (categories.length === 0) {
    try {
      const result = await getProducts({ page: 1, limit: 4, sort: "rating" });
      return result.data;
    } catch {
      return [];
    }
  }

  try {
    const result = await getProducts({
      page: 1,
      limit: 4,
      category: categories[0],
      sort: "rating",
    });
    return result.data;
  } catch {
    return [];
  }
};

const generateSuggestions = (
  handler: HandlerType,
  classification: IntentClassification,
  products: RecommendedProduct[]
): string[] => {
  if (handler === "greeting" || handler === "clarification") {
    return ["Show me laptops", "Skincare for dry skin", "What should I eat today?", "Gift ideas"];
  }

  if (handler === "help") {
    return ["Find a gaming laptop", "Groceries under $20", "Compare smartphones", "Gift for mom"];
  }

  if (products.length === 0) {
    return ["Try a different category", "Increase my budget", "Show top rated products", "Help me choose"];
  }

  const category = products[0]?.category;
  const suggestions: string[] = ["Compare these", "Show cheaper options"];

  if (category === "laptops") {
    suggestions.push("Gaming laptops", "Business laptops", "Best battery life");
  } else if (category === "groceries") {
    suggestions.push("Healthy snacks", "Breakfast ideas", "Show more options");
  } else if (category === "skin-care" || category === "beauty") {
    suggestions.push("For dry skin", "Under $30", "Top rated skincare");
  } else if (category === "smartphones") {
    suggestions.push("Best camera phones", "Budget phones", "Compare these");
  } else {
    suggestions.push("Show more like these", "Best rated", "Different brand");
  }

  return suggestions.slice(0, 4);
};

const buildNoResultsContext = (products: any[], categories: string[]): string => {
  if (products.length > 0) {
    return `No exact matches were found, but here are similar products from the store:\n${JSON.stringify(
      products.map((p) => ({
        id: String(p._id || p.id),
        title: p.title,
        price: p.price,
        category: p.category,
        rating: p.rating,
        brand: p.brand,
      })),
      null,
      2
    )}`;
  }

  return `No matching products were found in categories: ${categories.join(", ") || "any"}. Apologize warmly, suggest adjusting budget or trying a related category, and ask one clarifying question. Do NOT invent products.`;
};

const buildProductContext = (products: any[]): string => {
  return `Candidate products from the store database (ONLY recommend from this list):\n${JSON.stringify(
    products.map((p) => ({
      id: String(p._id || p.id),
      title: p.title,
      price: p.price,
      category: p.category,
      rating: p.rating,
      brand: p.brand,
      stock: p.stock,
      description: p.description?.substring(0, 120),
    })),
    null,
    2
  )}`;
};

export const processChatMessage = async (
  input: ChatProcessInput
): Promise<ChatProcessResult> => {
  const { userId, userName, message, onToken } = input;

  const { sessionId } = await getOrCreateChat(userId, input.sessionId);

  const dbHistory = await getConversationHistory(userId, sessionId);
  const dbTurns: ConversationTurn[] = dbHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const fullHistory = mergeConversationHistory(
    dbTurns,
    input.conversationHistory ?? [],
    input.socketMemory ?? []
  );

  const historyForClassification = fullHistory.slice(0, -1);

  let classification: IntentClassification;
  try {
    classification = await classifyUserIntent(message, historyForClassification);
  } catch (error) {
    console.error("Intent classification failed:", error);
    classification = {
      intent: "unknown",
      confidence: 0.3,
      categories: extractCategoriesFromMessage(message),
      requiresProductSearch: false,
    };
  }

  const handler = routeIntent(classification);
  let reply = "";
  let rawProducts: any[] = [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_STREAM_TIMEOUT_MS);

  try {
    const staticResponse = getStaticResponse(handler, userName);

    if (staticResponse && handler !== "conversation" && handler !== "clarification") {
      onToken(staticResponse);
      reply = staticResponse;
    } else if (handler === "conversation" || handler === "clarification") {
      reply = await streamAIResponse({
        systemPrompt: buildSystemPrompt(false),
        conversationHistory: historyForClassification,
        userMessage: message,
        onToken,
        signal: controller.signal,
      });
    } else if (classification.requiresProductSearch) {
      rawProducts = await searchProducts(message, classification);

      let productContext: string;
      if (rawProducts.length === 0) {
        const similar = await findSimilarProducts(classification.categories);
        rawProducts = similar;
        productContext = buildNoResultsContext(similar, classification.categories);
      } else {
        productContext = buildProductContext(rawProducts);
      }

      reply = await streamAIResponse({
        systemPrompt: buildSystemPrompt(rawProducts.length > 0),
        conversationHistory: historyForClassification,
        userMessage: message,
        productContext,
        onToken,
        signal: controller.signal,
      });
    } else {
      reply = await streamAIResponse({
        systemPrompt: buildSystemPrompt(false),
        conversationHistory: historyForClassification,
        userMessage: message,
        onToken,
        signal: controller.signal,
      });
    }
  } catch (error) {
    console.error("Chat processing error:", error);

    if (!reply.trim()) {
      reply =
        "I'm having trouble connecting to the AI service. Please try again in a few moments.";
      onToken(reply);
    }
  } finally {
    clearTimeout(timeout);
  }

  const finalReply = reply.trim() || "How can I help you find the right product today?";

  const products: RecommendedProduct[] = rawProducts.map((p) =>
    serializeProduct(p, buildProductReasons(p, classification))
  );

  const suggestions = generateSuggestions(handler, classification, products);

  await appendMessages(userId, sessionId, [
    { role: "user", content: message },
    { role: "assistant", content: finalReply },
  ]);

  return {
    reply: finalReply,
    products,
    suggestions,
    sessionId,
  };
};

/** In-memory session store for active socket connections */
const socketMemoryStore = new Map<string, ConversationTurn[]>();

export const getSocketMemory = (socketId: string): ConversationTurn[] => {
  return socketMemoryStore.get(socketId) ?? [];
};

export const appendSocketMemory = (
  socketId: string,
  turns: ConversationTurn[]
): void => {
  const existing = socketMemoryStore.get(socketId) ?? [];
  const merged = [...existing, ...turns].slice(-MAX_MEMORY_TURNS);
  socketMemoryStore.set(socketId, merged);
};

export const clearSocketMemory = (socketId: string): void => {
  socketMemoryStore.delete(socketId);
};

/** Backward-compatible wrapper for existing ai.service consumers */
export const streamShoppingAssistantResponse = async ({
  message,
  conversationHistory = [],
  onToken,
  userId,
  userName,
  sessionId,
  socketId,
}: {
  message: string;
  conversationHistory?: ConversationTurn[];
  onToken: (token: string) => void;
  userId?: string;
  userName?: string;
  sessionId?: string;
  socketId?: string;
}): Promise<{
  reply: string;
  products: RecommendedProduct[];
  suggestions?: string[];
  sessionId?: string;
}> => {
  if (!userId) {
    return {
      reply: "Please log in to use the AI assistant.",
      products: [],
    };
  }

  const result = await processChatMessage({
    userId,
    userName,
    message,
    sessionId,
    conversationHistory,
    socketMemory: socketId ? getSocketMemory(socketId) : [],
    onToken,
  });

  if (socketId) {
    appendSocketMemory(socketId, [
      { role: "user", content: message },
      { role: "assistant", content: result.reply },
    ]);
  }

  return result;
};
