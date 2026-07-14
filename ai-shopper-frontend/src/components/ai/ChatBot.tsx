"use client";

import { useState, useRef, useEffect } from "react";
import {
  BotMessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  Heart,
  ShoppingCart,
  ChevronRight,
  RefreshCw,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useWishlist as useWishlistQuery, useAddWishlistItem, useRemoveWishlistItem } from "../../hooks/useWishlist";
import { useCart as useCartQuery, useAddCartItem } from "../../hooks/useCart";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

type Product = {
  id: number;
  title: string;
  price: number;
  category?: string;
  thumbnail?: string;
  rating?: number;
  brand?: string;
  description?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  isFollowUp?: boolean; // AI asked a clarifying question
  isLoading?: boolean;
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const WELCOME: Message = {
  role: "assistant",
  text: "👋 Hi! I'm your AI shopping assistant.\n\nI can help you find the perfect products. Just tell me what you're looking for and I'll ask a few quick questions to get the best results for you!\n\nTry: \"I want a laptop\", \"Show me skincare for dry skin\", or \"I'm looking for food\"",
};

const QUICK_PROMPTS = [
  "Show me laptops",
  "Skincare for dry skin",
  "Gifts for tech lovers",
  "Food to eat now",
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"thinking" | "searching" | "filtering">("thinking");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // React Query hooks for wishlist
  const { data: wishlistData } = useWishlistQuery();
  const addWishlistMutation = useAddWishlistItem();
  const removeWishlistMutation = useRemoveWishlistItem();
  
  // React Query hooks for cart
  const addCartMutation = useAddCartItem();
  
  // Helper functions
  const isWishlisted = (id: number) => {
    const items = wishlistData?.products || (wishlistData as any)?.items || [];
    return items.some((item: any) => item.productId === String(id)) || false;
  };
  
  const toggleItem = (item: any) => {
    const wishlistItem = {
      productId: String(item.id),
      title: item.title,
      price: item.price,
      thumbnail: item.thumbnail,
      category: item.category,
      rating: item.rating,
    };
    
    if (isWishlisted(item.id)) {
      // Find the wishlist item ID and remove it
      const items = wishlistData?.products || (wishlistData as any)?.items || [];
      const existingItem = items.find((i: any) => i.productId === String(item.id));
      if (existingItem) {
        removeWishlistMutation.mutate(existingItem.id);
      }
    } else {
      addWishlistMutation.mutate(wishlistItem);
    }
  };
  
  const addToCart = (item: any) => {
    addCartMutation.mutate({
      productId: String(item.id),
      quantity: 1,
      price: item.price,
      title: item.title,
      thumbnail: item.thumbnail,
      category: item.category,
    });
  };

  // Fallback response for general queries
  const getFallbackResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
      return "Hello! 👋 How can I help you find products today?";
    }
    if (lowerText.includes("thank")) {
      return "You're welcome! Let me know if you need anything else.";
    }
    if (lowerText.includes("help")) {
      return "I can help you find products! Try asking for specific items like 'laptops', 'skincare', 'food', or 'gifts'. You can also mention price ranges like 'under $100'.";
    }
    
    return "I'm not sure what you're looking for. Could you be more specific? Try mentioning a product category like 'laptops', 'phones', 'skincare', or 'food'.";
  };

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const resetChat = () => {
    setMessages([WELCOME]);
    setConversationHistory([]);
    setInput("");
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;

    setInput("");

    // Add user message to UI
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    // Add to conversation history for AI context
    const updatedHistory: ConversationTurn[] = [
      ...conversationHistory,
      { role: "user", content: text },
    ];
    setConversationHistory(updatedHistory);

    setIsLoading(true);
    setLoadingStage("thinking");

    try {
      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-6) // Keep last few turns
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n");

      // ── Stage 1: Call classify via backend (through Next.js proxy) ──
      // classify is a public endpoint (no auth required)
      const classifyResponse = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!classifyResponse.ok) {
        const errText = await classifyResponse.text();
        console.error(`Classify error ${classifyResponse.status}:`, errText);
        throw Object.assign(new Error("Request failed"), { status: classifyResponse.status });
      }

      const classifyData = await classifyResponse.json();
      
      // ── Stage 2: Fetch products from DummyJSON based on classification ──
      let products: Product[] = [];
      let category = classifyData.category || "general";
      let maxPrice: number | null = null;
      let minPrice: number | null = null;
      let reply = "";
      let isFollowUp = false;

      if (category !== "general") {
        setLoadingStage("searching");

        // Fetch products from DummyJSON
        const baseUrl = process.env.NEXT_PUBLIC_DUMMYJSON_URL || "https://dummyjson.com";
        const productsRes = await fetch(`${baseUrl}/products/category/${category}`);
        const data = await productsRes.json();
        products = data.products || [];

        // Extract price filters from user message
        const lowerText = text.toLowerCase();
        const maxPriceMatch = lowerText.match(/(?:under|below|max|less than|cheaper than|budget)\s*[$]?\s*(\d+)/i);
        if (maxPriceMatch) {
          maxPrice = parseInt(maxPriceMatch[1], 10);
        }

        const minPriceMatch = lowerText.match(/(?:above|over|min|more than|at least)\s*[$]?\s*(\d+)/i);
        if (minPriceMatch) {
          minPrice = parseInt(minPriceMatch[1], 10);
        }

        // Apply price filters
        if (maxPrice !== null) {
          products = products.filter((p: any) => p.price <= maxPrice!);
        }
        if (minPrice !== null) {
          products = products.filter((p: any) => p.price >= minPrice!);
        }

        // Keyword filtering
        const keywords = text
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 2 && !["what", "show", "find", "looking", "for", "have", "the", "a", "an", "in", "under", "cheap", "best", "max", "min", "above", "below", "over", "less", "more", "than", "budget", "at", "least"].includes(word));

        if (keywords.length > 0) {
          products = products.filter((p: any) =>
            keywords.some((keyword) =>
              p.title?.toLowerCase().includes(keyword) ||
              p.description?.toLowerCase().includes(keyword) ||
              p.category?.toLowerCase().includes(keyword)
            )
          );
        }

        setLoadingStage("filtering");
        await new Promise((r) => setTimeout(r, 300));
      }

      // Generate AI reply based on classification
      if (category === "general") {
        reply = getFallbackResponse(text);
      } else if (products.length === 0) {
        reply = `I searched in the ${category} category but couldn't find matching products. Try adjusting your price range or browse our full catalog.`;
      } else {
        const priceInfo = maxPrice || minPrice
          ? ` within your ${maxPrice ? `max $${maxPrice}` : `min $${minPrice}`} budget`
          : "";
        reply = `I found ${products.length} product${products.length !== 1 ? "s" : ""} in ${category}${priceInfo} for you!`;
      }

      const assistantMsg: Message = {
        role: "assistant",
        text: reply,
        products: products.length > 0 ? products.slice(0, 6) : undefined,
        isFollowUp,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update conversation history with AI reply
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err: any) {
      console.error("ChatBot error:", err);

      // Handle specific HTTP error codes
      // err.status: from custom errors thrown with fetch (our Object.assign pattern)
      // err.response.status: from axios errors
      const status = err?.status ?? err?.response?.status;

      let errorText = "Sorry, I'm having trouble connecting. Please make sure the backend server is running and try again.";
      if (status === 429) {
        errorText = "You're sending messages too fast! Please wait a moment before trying again. ⏳";
      } else if (status === 401) {
        errorText = "Please log in to use the AI assistant.";
      } else if (status >= 500) {
        errorText = "The AI service is temporarily unavailable. Please try again in a moment.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: errorText,
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingStage("thinking");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─── Loading indicator label ─────────────────────────────────────────── */
  const loadingLabel =
    loadingStage === "thinking"
      ? "AI is thinking..."
      : loadingStage === "searching"
      ? "Searching products..."
      : "AI is filtering results...";

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Floating Button */}
      <div className="fixed right-8 bottom-8 z-50">
        {isOpen ? (
          <button
            onClick={() => setIsOpen(false)}
            className="bg-black text-[#ccff00] p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-900 transition-all flex items-center justify-center"
          >
            <X size={26} />
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black text-[#ccff00] p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-900 transition-all flex items-center justify-center relative border border-[#ccff00]/20"
          >
            <BotMessageSquare size={26} />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#ccff00] rounded-full border-2 border-black animate-pulse" />
          </button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-8 bottom-24 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up"
          style={{ height: "560px" }}
        >
          {/* Header */}
          <div className="bg-black text-white px-5 py-3.5 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#ccff00]/20 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-[#ccff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">AI Shopping Assistant</p>
              <p className="text-[11px] text-[#ccff00]/70">
                {isLoading ? loadingLabel : "Online • Ask me anything!"}
              </p>
            </div>
            <button
              onClick={resetChat}
              title="Clear chat"
              className="text-gray-400 hover:text-[#ccff00] transition-colors p-1"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">

            {/* Quick prompt chips — only show at start */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 hover:border-black hover:text-black transition-colors font-medium"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "user"
                      ? "bg-black text-[#ccff00]"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {msg.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>

                <div className="max-w-[88%] flex flex-col gap-2">
                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-tr-sm"
                        : msg.isFollowUp
                        ? "bg-[#ccff00]/10 border border-[#ccff00]/40 text-gray-800 rounded-tl-sm"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                    {msg.isFollowUp && (
                      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        ↳ AI needs more info
                      </p>
                    )}
                  </div>

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                        AI-filtered results ({msg.products.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {msg.products.map((product) => {
                          const wishlisted = isWishlisted(product.id);
                          return (
                            <div
                              key={product.id}
                              className="relative bg-white border border-gray-100 group cursor-pointer"
                            >
                              <Link href={`/dashboard/products/${product.id}`} className="block">
                                {/* Thumbnail */}
                                <div className="relative h-[140px] w-full bg-gray-50 mb-2 overflow-hidden">
                                  {product.thumbnail ? (
                                    <Image
                                      src={product.thumbnail}
                                      alt={product.title}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200" />
                                  )}

                                  {/* Favorite Button */}
                                  <div className="absolute top-1.5 right-1.5 z-10">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleItem({
                                          id: product.id,
                                          title: product.title,
                                          price: Number(product.price),
                                          thumbnail: product.thumbnail,
                                          category: product.category,
                                          rating: Number(product.rating),
                                        });
                                      }}
                                      className="bg-white p-1.5 text-black hover:bg-[#ccff00] transition-colors shadow-sm"
                                    >
                                      <Heart
                                        size={12}
                                        strokeWidth={2}
                                        className={wishlisted ? "fill-black" : ""}
                                      />
                                    </button>
                                  </div>

                                  {/* Hover Add to Cart */}
                                  <div className="absolute bottom-0 left-0 w-full p-2 flex gap-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/60 to-transparent">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addToCart({
                                          productId: String(product.id),
                                          title: product.title,
                                          price: Number(product.price),
                                          thumbnail: product.thumbnail,
                                          category: product.category,
                                          quantity: 1,
                                        });
                                      }}
                                      className="flex-1 bg-white hover:bg-black hover:text-white text-black py-2 text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                                    >
                                      <ShoppingCart size={10} /> Add
                                    </button>
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="px-1.5 pb-2">
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5 truncate">
                                    {product.category || "General"}
                                  </p>
                                  <p className="text-[11px] font-bold text-gray-900 line-clamp-1 leading-snug">
                                    {product.title}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs font-black text-black">
                                      ${Number(product.price).toFixed(2)}
                                    </span>
                                    {product.rating && (
                                      <div className="flex items-center gap-0.5">
                                        <Star size={8} className="text-black fill-black" />
                                        <span className="text-[9px] font-bold text-black">{Number(product.rating).toFixed(1)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>

                      {/* View all link */}
                      <Link
                        href="/dashboard/products"
                        className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors px-1 pt-1"
                      >
                        Browse all products <ChevronRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                  <Sparkles size={13} />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                  <Loader2 className="animate-spin text-black shrink-0" size={15} />
                  <span className="text-xs text-gray-500 font-medium">{loadingLabel}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-white shrink-0">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about products..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-black text-[#ccff00] flex items-center justify-center hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-300 mt-1.5 font-medium">
              Powered by Mistral AI · NVIDIA NIM
            </p>
          </div>

          <style jsx>{`
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(20px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-slide-up {
              animation: slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
