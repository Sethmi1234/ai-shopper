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
} from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/store/useWishlist";

type Message = {
  role: "user" | "assistant";
  text: string;
  products?: Array<{
    id: number;
    title: string;
    price: number;
    category?: string;
    thumbnail?: string;
  }>;
};

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  text: "👋 Hi! I'm your AI shopping assistant. Ask me anything about products, like:\n\n• \"What are the best laptops under $1000?\"\n• \"Show me skincare products for dry skin\"\n• \"Recommend gifts for tech lovers\"\n• \"What's the cheapest smartphone?\"",
};

const FALLBACK_RESPONSES = [
  "Great question! I'd recommend checking out our **Products** page where you can filter by price, rating, and category to find exactly what you need.",
  "That's a good question! Head over to the **Products** section to browse our catalog with filters for price range and rating.",
  "We have a wide selection available! Use the **Products** page and apply filters to narrow down your search by category, price, or rating.",
  "I'd suggest looking at our **Products** catalog. You can sort by price or rating, and filter by category to find the perfect item.",
  "Check out the **Products** page — you can browse all items and use the filters on the left side to find products in your budget and preferred category.",
];

function getFallbackResponse(userText: string): string {
  const lower = userText.toLowerCase();

  if (lower.includes("laptop") || lower.includes("computer")) {
    return "💻 We have a great selection of laptops! Go to the **Products** page and select the 'Electronics' category filter to find laptops. You can also sort by price Low→High to find budget-friendly options.";
  }
  if (lower.includes("phone") || lower.includes("smartphone") || lower.includes("mobile")) {
    return "📱 Check out our smartphones! On the **Products** page, filter by 'Electronics' category or use the search to find the latest phones. Sort by rating to see top-rated models.";
  }
  if (lower.includes("skin") || lower.includes("beauty") || lower.includes("skincare") || lower.includes("cosmetic")) {
    return "🧴 We have beauty and skincare products! Visit the **Products** page and look for the 'Beauty' category filter. You can also sort by rating to find the most popular items.";
  }
  if (lower.includes("gift") || lower.includes("present")) {
    return "🎁 Looking for gifts? Browse the **Products** page — we have accessories, fragrances, electronics, and more! Filter by category to find the perfect gift.";
  }
  if (lower.includes("cheap") || lower.includes("affordable") || lower.includes("budget") || lower.includes("under") || lower.includes("$")) {
    return "💰 To find products within your budget, go to the **Products** page and use the price range slider filter. You can set a maximum price to see only items you can afford.";
  }
  if (lower.includes("fashion") || lower.includes("cloth") || lower.includes("shirt") || lower.includes("dress") || lower.includes("shoe")) {
    return "👕 We have fashion items! On the **Products** page, you'll find categories like 'Apparel' and 'Womens-Dresses'. Use the category filter to browse clothing and shoes.";
  }
  if (lower.includes("furniture") || lower.includes("desk") || lower.includes("chair") || lower.includes("home")) {
    return "🪑 Check out our furniture and home decor! On the **Products** page, look for the 'Furniture' and 'Home-Decoration' categories. There are some great finds there!";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "👋 Hello! How can I help you today? I can help you find products, give recommendations, or guide you through our catalog. Just ask me anything!";
  }
  if (lower.includes("how are you")) {
    return "I'm doing great, thanks for asking! 😊 I'm here to help you find amazing products. What are you looking for today?";
  }
  if (lower.includes("thank")) {
    return "You're welcome! 😊 Happy shopping! If you need anything else, just ask.";
  }

  // Default random fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleItem, isWishlisted } = useWishlist();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      // STEP 1: Classify intent using the new classify API
      const classifyRes = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const classifyData = await classifyRes.json();
      console.log("CLASSIFICATION:", classifyData);

      // STEP 2: Fetch products by category
      let products = [];
      let category = classifyData.category || "general";
      let maxPrice: number | null = null;
      let minPrice: number | null = null;

      if (category !== "general") {
        // Fetch products from the specific category
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://dummyjson.com"}/products/category/${category}`
        );
        const data = await res.json();
        products = data.products || [];

        // STEP 3: Extract price filters from user message
        const lowerText = text.toLowerCase();

        // Extract max price (e.g., "under $1000", "max 500", "below 200")
        const maxPriceMatch = lowerText.match(/(?:under|below|max|less than|cheaper than|budget)\s*[$]?\s*(\d+)/i);
        if (maxPriceMatch) {
          maxPrice = parseInt(maxPriceMatch[1], 10);
        }

        // Extract min price (e.g., "above $500", "min 200", "over 100")
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

        // STEP 4: Optional keyword filtering (A+ upgrade)
        // Extract keywords from user message for filtering
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

        // Limit to 4 products for display
        products = products.slice(0, 4);
      }

      // STEP 5: Generate AI reply based on classification
      let reply = "";

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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
          products,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const reply = getFallbackResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#ccff00] rounded-full border-2 border-black"></span>
          </button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-8 bottom-24 z-50 w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-black text-white px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ccff00]/20 flex items-center justify-center">
              <Sparkles size={18} className="text-[#ccff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">AI Shopping Assistant</p>
              <p className="text-xs text-[#ccff00]/80">Online • Ask me anything!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user"
                        ? "bg-black text-[#ccff00]"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={13} />
                  ) : (
                    <Sparkles size={13} />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-tr-sm"
                        : "bg-white text-gray-700 border border-gray-100 shadow-sm rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2 whitespace-normal">
                      {msg.products.map((product) => {
                        const wishlisted = isWishlisted(product.id);
                        return (
                          <div
                            key={product.id}
                            className="relative rounded-xl border border-gray-100 bg-gray-50 p-2 hover:border-gray-300 transition-colors"
                          >
                            <Link
                              href={`/dashboard/products/${product.id}`}
                              className="block"
                            >
                              <p className="text-xs font-bold text-gray-900 line-clamp-1 pr-6">
                                {product.title}
                              </p>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[11px] text-gray-500 line-clamp-1">
                                  {product.category || "Product"}
                                </span>
                                <span className="text-xs font-black text-black">
                                  ${product.price}
                                </span>
                              </div>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleItem({
                                  id: product.id,
                                  title: product.title,
                                  price: product.price,
                                  thumbnail: product.thumbnail,
                                  category: product.category,
                                });
                              }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                              title={wishlisted ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart
                                size={12}
                                className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                  <Sparkles size={13} />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="animate-spin text-black" size={18} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-white">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
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
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-full bg-black text-[#ccff00] flex items-center justify-center hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes slide-up {
              from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
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
