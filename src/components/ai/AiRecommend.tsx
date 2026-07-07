"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Sparkles, Heart, MessageCircle, Send } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useWishlist } from "@/store/useWishlist";

type Props = {
  prompt: string;
  runKey?: number;
  compact?: boolean;
};

type ClarificationState = {
  question: string;
  options: string[];
  originalPrompt: string;
  conversation: string;
};

function reviewCount(p: { reviews?: unknown }) {
  if (Array.isArray(p.reviews)) return p.reviews.length;
  if (typeof p.reviews === "number") return p.reviews;
  return 42;
}

export default function AiRecommend({ prompt, runKey = 0, compact = false }: Props) {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clarification, setClarification] = useState<ClarificationState | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string>("");
  const { toggleItem, isWishlisted } = useWishlist();

  const run = useCallback(async (text: string, conversationCtx?: string) => {
    if (!text.trim()) return;

    setError(null);
    setAiReply(null);
    setProducts([]);
    setClarification(null);
    setIsLoading(true);

    try {
      // Frontend just sends the prompt — backend fetches products, runs AI, returns results
      const res = await fetch("/api/ai/smart-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text.trim(),
          conversation: conversationCtx || conversationHistory,
        }),
      });

      const data = await res.json();
      console.log("SMART AI RESPONSE:", data);

      // Handle AI asking for clarification
      if (data.needsClarification) {
        setClarification({
          question: data.clarificationQuestion || "Could you tell me more?",
          options: data.clarificationOptions || [],
          originalPrompt: text.trim(),
          conversation: conversationCtx || conversationHistory,
        });
        setAiReply(data.reply || null);
        return;
      }

      // Handle AI returning products (full product data, already filtered)
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setAiReply(data.reply || `Found ${data.products.length} matching products!`);

        // Update conversation history
        setConversationHistory((prev) =>
          `${prev}\nUser: ${text.trim()}\nAI: ${data.reply || ""}\nFound ${data.products.length} products.`
        );
      } else {
        setError("I couldn't find any products matching your request. Try describing what you need differently.");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Unable to search products at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory]);

  // Handle clarification answer
  const handleClarificationAnswer = async (answer: string) => {
    if (!clarification) return;

    const refinedPrompt = `${clarification.originalPrompt} — ${answer}`;
    const conversationCtx = `${clarification.conversation}\nAI asked: ${clarification.question}\nUser answered: ${answer}`;

    await run(refinedPrompt, conversationCtx);
  };

  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  useEffect(() => {
    if (runKey > 0 && prompt.trim()) {
      run(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  if (compact) {
    if (!isLoading && !error && !aiReply && products.length === 0 && !clarification) return null;

    return (
      <div className="w-full mt-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-medium">AI is thinking...</p>
            <p className="text-xs text-gray-400">Fetching products and finding the best matches.</p>
          </div>
        )}

        {/* AI Reply */}
        {aiReply && !isLoading && (
          <div className="flex items-start gap-2 mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <MessageCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">{aiReply}</p>
          </div>
        )}

        {/* Clarification UI */}
        {clarification && !isLoading && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
            <p className="text-sm font-medium text-amber-800 mb-3">
              {clarification.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {clarification.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleClarificationAnswer(option)}
                  className="px-4 py-2 text-sm font-medium bg-white border border-amber-300 rounded-full hover:bg-amber-100 hover:border-amber-400 transition-colors text-amber-900"
                >
                  {option}
                </button>
              ))}
              <input
                type="text"
                placeholder="Type your answer..."
                className="clarification-input px-4 py-2 text-sm border border-amber-300 rounded-full outline-none focus:border-amber-500 flex-1 min-w-[150px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    handleClarificationAnswer((e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {!isLoading && products.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">
                AI Recommendations
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  category={p.category || "General"}
                  price={`$${p.price}`}
                  rating={p.rating || 4.5}
                  reviews={reviewCount(p)}
                  img={
                    p.thumbnail ||
                    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"
                  }
                  badgeType={i === 0 ? "match" : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && !clarification && products.length === 0 && runKey > 0 && !aiReply && (
          <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            No products matched your request. Try a different description.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">AI Product Recommendation</h3>
      <p className="text-sm text-gray-500 mb-4">
        Describe what you need naturally — the AI understands context and will find the best products.
      </p>

      <textarea
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        rows={3}
        className="w-full p-3 border rounded-lg mb-3"
        placeholder="e.g. I need something to eat, show me healthy options under $20"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => run(localPrompt)}
          disabled={isLoading || !localPrompt.trim()}
          className="px-4 py-2 rounded-full bg-blue-600 text-white disabled:opacity-50"
        >
          {isLoading ? "Thinking..." : "Ask AI"}
        </button>
        <button
          onClick={() => {
            setLocalPrompt("");
            setProducts([]);
            setError(null);
            setAiReply(null);
            setClarification(null);
          }}
          className="px-4 py-2 rounded-full border"
        >
          Reset
        </button>
      </div>

      {/* AI Reply */}
      {aiReply && !isLoading && (
        <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <MessageCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700">{aiReply}</p>
        </div>
      )}

      {/* Clarification UI */}
      {clarification && !isLoading && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
          <p className="text-sm font-medium text-amber-800 mb-3">
            {clarification.question}
          </p>
          <div className="flex flex-wrap gap-2">
            {clarification.options.map((option) => (
              <button
                key={option}
                onClick={() => handleClarificationAnswer(option)}
                className="px-4 py-2 text-sm font-medium bg-white border border-amber-300 rounded-full hover:bg-amber-100 hover:border-amber-400 transition-colors text-amber-900"
              >
                {option}
              </button>
            ))}
            <div className="flex items-center gap-2 w-full mt-2">
              <input
                type="text"
                placeholder="Type your answer..."
                className="clarification-input flex-1 px-4 py-2 text-sm border border-amber-300 rounded-full outline-none focus:border-amber-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    handleClarificationAnswer((e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(".clarification-input");
                  if (input?.value.trim()) {
                    handleClarificationAnswer(input.value.trim());
                    input.value = "";
                  }
                }}
                className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-red-500">
          {error}
        </p>
      )}

      {isLoading && (
        <div className="mt-6 flex justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={28} />
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              category={p.category || "General"}
              price={`$${p.price}`}
              rating={p.rating || 4.5}
              reviews={reviewCount(p)}
              img={
                p.thumbnail ||
                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"
              }
              badgeType={i === 0 ? "match" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}