import { ProductService } from "./product.service";
import { AiService } from "./ai.service";
import { AiRouterService, IntentClassification, HandlerType } from "./aiRouter";
import { HistoryService } from "./historyService";
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

export class ChatService {
  private socketMemoryStore = new Map<string, ConversationTurn[]>();

  constructor(
    private productService: ProductService,
    private aiService: AiService,
    private aiRouterService: AiRouterService,
    private historyService: HistoryService
  ) {}

  private serializeProduct(product: any, reasons?: string[]): RecommendedProduct {
    return {
      id: String(product._id || product.id),
      title: product.title,
      price: product.price,
      category: product.category,
      thumbnail: product.thumbnail,
      rating: product.rating,
      brand: product.brand,
      description: product.description ? product.description.substring(0, 140) : "",
      reasons,
    };
  }

  private async withTimeout<T>(
    work: Promise<T>,
    timeoutMs: number,
    label: string
  ): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    });
    try {
      return await Promise.race([work, timeoutPromise]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private mergeConversationHistory(
    dbHistory: ConversationTurn[],
    clientHistory: ConversationTurn[],
    socketMemory: ConversationTurn[]
  ): ConversationTurn[] {
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
  }

  private extractSearchTerms(
    message: string,
    classification: IntentClassification
  ): string | undefined {
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
  }

  private buildProductReasons(product: any, classification: IntentClassification): string[] {
    const reasons: string[] = [];

    if (classification.budget?.max && product.price <= classification.budget.max) {
      reasons.push("Fits your budget");
    } else if (classification.budget?.min && product.price >= classification.budget.min) {
      reasons.push("Within your price range");
    }

    if (product.rating && product.rating >= 4.5) {
      reasons.push("Top rated ⭐");
    } else if (product.rating && product.rating >= 4) {
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

    if (product.discountPercentage && product.discountPercentage > 10) {
      reasons.push(`${Math.round(product.discountPercentage)}% off — great deal!`);
    }

    if (reasons.length === 0) {
      reasons.push("Matches your search");
    }

    return reasons.slice(0, 4);
  }

  private async searchProducts(
    message: string,
    classification: IntentClassification
  ): Promise<any[]> {
    const categories =
      classification.categories.length > 0
        ? classification.categories
        : extractCategoriesFromMessage(message);

    const searchTerms = this.extractSearchTerms(message, classification);
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
        const result = await this.withTimeout(
          this.productService.getProducts({
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
        const aiFilter = await this.aiService.filterProductsWithAI(
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
  }

  private async findSimilarProducts(categories: string[]): Promise<any[]> {
    if (categories.length === 0) {
      try {
        const result = await this.productService.getProducts({ page: 1, limit: 4, sort: "rating" });
        return result.data;
      } catch {
        return [];
      }
    }

    try {
      const result = await this.productService.getProducts({
        page: 1,
        limit: 4,
        category: categories[0],
        sort: "rating",
      });
      return result.data;
    } catch {
      return [];
    }
  }

  private generateSuggestions(
    handler: HandlerType,
    classification: IntentClassification,
    products: RecommendedProduct[]
  ): string[] {
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

    if (category === "laptops" || category === "gaming") {
      suggestions.push("Gaming laptops", "Business laptops", "Best battery life");
    } else if (category === "groceries") {
      suggestions.push("Healthy snacks", "Breakfast ideas", "Show more options");
    } else if (category === "skin-care" || category === "beauty") {
      suggestions.push("For dry skin", "Under $30", "Top rated skincare");
    } else if (category === "smartphones") {
      suggestions.push("Best camera phones", "Budget phones", "Compare these");
    } else if (category === "televisions") {
      suggestions.push("4K TVs", "Under $500", "Smart TVs");
    } else if (category === "headphones" || category === "audio") {
      suggestions.push("Wireless headphones", "Under $100", "Noise cancelling");
    } else if (category === "furniture") {
      suggestions.push("Office chairs", "Desks", "Living room");
    } else if (category === "fragrances") {
      suggestions.push("For men", "For women", "Under $50");
    } else if (category === "fashion" || category === "tops" || category === "womens-dresses" || category === "mens-shirts") {
      suggestions.push("Summer collection", "Under $50", "Top rated");
    } else {
      suggestions.push("Show more like these", "Best rated", "Different brand");
    }

    return suggestions.slice(0, 4);
  }

  private buildNoResultsContext(products: any[], categories: string[]): string {
    if (products.length > 0) {
      return `No exact matches were found, but here are similar products from the store that the customer might like:\n${JSON.stringify(
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
    }

    return `No matching products were found in categories: ${categories.join(", ") || "any"}. Apologize warmly, suggest adjusting budget or trying a related category, and ask one helpful clarifying question. Do NOT invent products.`;
  }

  private buildProductContext(products: any[]): string {
    return `Candidate products from the store database (ONLY recommend from this list):\n${JSON.stringify(
      products.map((p) => ({
        id: String(p._id || p.id),
        title: p.title,
        price: p.price,
        category: p.category,
        rating: p.rating,
        brand: p.brand,
        stock: p.stock,
        discountPercentage: p.discountPercentage,
        description: p.description?.substring(0, 120),
      })),
      null,
      2
    )}`;
  }

  async processChatMessage(input: ChatProcessInput): Promise<ChatProcessResult> {
    const { userId, userName, message, onToken } = input;

    const { sessionId } = await this.historyService.getOrCreateChat(userId, input.sessionId);

    const dbHistory = await this.historyService.getConversationHistory(userId, sessionId);
    const dbTurns: ConversationTurn[] = dbHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const fullHistory = this.mergeConversationHistory(
      dbTurns,
      input.conversationHistory ?? [],
      input.socketMemory ?? []
    );

    const historyForClassification = fullHistory.slice(0, -1);

    let classification: IntentClassification;
    try {
      classification = await this.aiRouterService.classifyUserIntent(message, historyForClassification);
    } catch (error) {
      console.error("Intent classification failed:", error);
      classification = {
        intent: "unknown",
        confidence: 0.3,
        categories: extractCategoriesFromMessage(message),
        requiresProductSearch: false,
      };
    }

    const handler = this.aiRouterService.routeIntent(classification);
    let reply = "";
    let rawProducts: any[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_STREAM_TIMEOUT_MS);

    try {
      const staticResponse = this.aiRouterService.getStaticResponse(handler, userName);

      if (staticResponse && handler !== "conversation" && handler !== "clarification") {
        onToken(staticResponse);
        reply = staticResponse;
      } else if (handler === "conversation" || handler === "clarification") {
        reply = await this.aiRouterService.streamAIResponse({
          systemPrompt: this.aiRouterService.buildSystemPrompt(false),
          conversationHistory: historyForClassification,
          userMessage: message,
          onToken,
          signal: controller.signal,
        });
      } else if (classification.requiresProductSearch) {
        rawProducts = await this.searchProducts(message, classification);

        let productContext: string;
        if (rawProducts.length === 0) {
          const similar = await this.findSimilarProducts(classification.categories);
          rawProducts = similar;
          productContext = this.buildNoResultsContext(similar, classification.categories);
        } else {
          productContext = this.buildProductContext(rawProducts);
        }

        reply = await this.aiRouterService.streamAIResponse({
          systemPrompt: this.aiRouterService.buildSystemPrompt(rawProducts.length > 0, productContext),
          conversationHistory: historyForClassification,
          userMessage: message,
          productContext,
          onToken,
          signal: controller.signal,
        });
      } else {
        reply = await this.aiRouterService.streamAIResponse({
          systemPrompt: this.aiRouterService.buildSystemPrompt(false),
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
      this.serializeProduct(p, this.buildProductReasons(p, classification))
    );

    const suggestions = this.generateSuggestions(handler, classification, products);

    await this.historyService.appendMessages(userId, sessionId, [
      { role: "user", content: message },
      { role: "assistant", content: finalReply },
    ]);

    return {
      reply: finalReply,
      products,
      suggestions,
      sessionId,
    };
  }

  getSocketMemory(socketId: string): ConversationTurn[] {
    return this.socketMemoryStore.get(socketId) ?? [];
  }

  appendSocketMemory(socketId: string, turns: ConversationTurn[]): void {
    const existing = this.socketMemoryStore.get(socketId) ?? [];
    const merged = [...existing, ...turns].slice(-MAX_MEMORY_TURNS);
    this.socketMemoryStore.set(socketId, merged);
  }

  clearSocketMemory(socketId: string): void {
    this.socketMemoryStore.delete(socketId);
  }

  async streamShoppingAssistantResponse({
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
  }> {
    if (!userId) {
      return {
        reply: "Please log in to use the AI assistant.",
        products: [],
      };
    }

    const result = await this.processChatMessage({
      userId,
      userName,
      message,
      sessionId,
      conversationHistory,
      socketMemory: socketId ? this.getSocketMemory(socketId) : [],
      onToken,
    });

    if (socketId) {
      this.appendSocketMemory(socketId, [
        { role: "user", content: message },
        { role: "assistant", content: result.reply },
      ]);
    }

    return result;
  }
}