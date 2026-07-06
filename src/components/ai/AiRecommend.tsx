"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { searchProductsBySpec } from "@/services/product.service";
import { requestAiStructuredOutput } from "@/services/ai.service";
import ProductCard from "@/components/product/ProductCard";

type Props = {
  prompt: string;
  runKey?: number;
  compact?: boolean;
};

function reviewCount(p: { reviews?: unknown }) {
  if (Array.isArray(p.reviews)) return p.reviews.length;
  if (typeof p.reviews === "number") return p.reviews;
  return 42;
}

function aiFiltersToSpec(filters: {
  category: string;
  brand: string;
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  color: string;
  purpose: string;
}) {
  return {
    category: filters.category || null,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    brand: filters.brand || null,
    query: filters.query || null,
    color: filters.color || null,
    purpose: filters.purpose || null,
    keywords: [
      filters.brand,
      filters.query,
      filters.color,
      filters.purpose,
    ].filter(Boolean),
  };
}

export default function AiRecommend({ prompt, runKey = 0, compact = false }: Props) {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const run = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    setAiReply(null);
    setProducts([]);
    setIsLoading(true);

    try {
      // Frontend sends ONLY: message (text)
      // System prompt is built on backend - never exposed to frontend
      const aiResult = await requestAiStructuredOutput(text.trim());
      const decision = aiResult.data;

      if (aiResult.error || !decision) {
        throw new Error(aiResult.error || "AI did not return a structured response.");
      }

      if (!decision.requiresApiCall || decision.needsMoreInformation) {
        setAiReply(decision.reply);
        return;
      }

      const { searchProductsByPrompt } = await import("@/services/product.service");
      
      let result;
      const spec = aiFiltersToSpec(decision.filters);
      if (
        spec.category ||
        spec.keywords.length ||
        spec.maxPrice != null ||
        spec.minPrice != null
      ) {
        result = await searchProductsBySpec(spec);
      } else {
        result = await searchProductsByPrompt(text.trim());
      }

      const nextProducts = result.products || [];
      if (nextProducts.length === 0) {
        setError("No products matched your request. Try a different description.");
      } else {
        setAiReply(decision.reply);
        setProducts(nextProducts);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Unable to search products at this time.");
    } finally {
      setIsLoading(false);
    }
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
    if (!isLoading && !error && products.length === 0) return null;

    return (
      <div className="w-full mt-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-medium">Finding products for you...</p>
            <p className="text-xs text-gray-400">This should return quickly for keyword-based prompt search.</p>
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
                Found {products.length} product{products.length !== 1 ? "s" : ""} for you
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

        {!isLoading && !error && products.length === 0 && runKey > 0 && (
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
        Describe what you need and the system will search the product catalog by keywords and price.
      </p>

      <textarea
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        rows={3}
        className="w-full p-3 border rounded-lg mb-3"
        placeholder="e.g. Recommend gaming laptops under $1000"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => run(localPrompt)}
          disabled={isLoading || !localPrompt.trim()}
          className="px-4 py-2 rounded-full bg-blue-600 text-white disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Ask AI"}
        </button>
        <button
          onClick={() => {
            setLocalPrompt("");
            setProducts([]);
            setError(null);
            setAiReply(null);
          }}
          className="px-4 py-2 rounded-full border"
        >
          Reset
        </button>
      </div>

      {error && (
        <p className="mt-3 text-red-500">
          {error}
        </p>
      )}

      {!error && aiReply && (
        <p className="mt-3 text-sm text-gray-600">
          {aiReply}
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
