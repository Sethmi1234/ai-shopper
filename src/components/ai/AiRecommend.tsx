"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Heart } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useWishlist } from "@/store/useWishlist";

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

export default function AiRecommend({ prompt, runKey = 0, compact = false }: Props) {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleItem, isWishlisted } = useWishlist();

  const run = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    setAiReply(null);
    setProducts([]);
    setIsLoading(true);

    try {
      // STEP 1: Classify intent using the new classify API
      const classifyRes = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
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
          .filter((word) => word.length > 2 && !["what", "show", "find", "looking", "for", "have", "the", "a", "an", "in", "under", "cheap", "best", "recommend", "max", "min", "above", "below", "over", "less", "more", "than", "budget", "at", "least"].includes(word));

        if (keywords.length > 0) {
          products = products.filter((p: any) =>
            keywords.some((keyword) =>
              p.title?.toLowerCase().includes(keyword) ||
              p.description?.toLowerCase().includes(keyword) ||
              p.category?.toLowerCase().includes(keyword)
            )
          );
        }

        // Limit to 6 products for display
        products = products.slice(0, 6);
      }

      // STEP 5: Generate AI reply based on classification
      if (category === "general") {
        setError("I couldn't determine what category you're looking for. Try being more specific, like 'laptops under $1000' or 'skincare products'.");
      } else if (products.length === 0) {
        setError(`I searched in the ${category} category but couldn't find matching products. Try adjusting your price range or browse our full catalog.`);
      } else {
        const priceInfo = maxPrice || minPrice
          ? ` within your ${maxPrice ? `max $${maxPrice}` : `min $${minPrice}`} budget`
          : "";
        setAiReply(`Found ${products.length} product${products.length !== 1 ? "s" : ""} in ${category}${priceInfo} for you!`);
        setProducts(products);
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
