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
      // STEP 1: Classify intent using the AI classify API
      const classifyRes = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      const classifyData = await classifyRes.json();
      console.log("CLASSIFICATION:", classifyData);

      // STEP 2: Fetch products by category
      let fetchedProducts: any[] = [];
      let category = classifyData.category || "general";

      if (category !== "general") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://dummyjson.com"}/products/category/${category}`
        );
        const data = await res.json();
        fetchedProducts = data.products || [];

        // STEP 3: Send ALL candidate products + user prompt to AI for intelligent filtering
        // This replaces the old regex price extraction and keyword filtering
        const filterRes = await fetch("/api/ai/filter-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text.trim(),
            products: fetchedProducts,
          }),
        });

        const filterData = await filterRes.json();
        console.log("AI FILTER RESULT:", filterData);

        // STEP 4: Filter products based on AI scores (only keep score >= 0.7)
        if (filterData.matches && Array.isArray(filterData.matches)) {
          const selectedIds = new Set(
            filterData.matches
              .filter((m: any) => m.score >= 0.7)
              .map((m: any) => m.id)
          );

          fetchedProducts = fetchedProducts.filter((p: any) =>
            selectedIds.has(p.id)
          );
        }
      }

      // STEP 5: Generate AI reply based on results
      if (category === "general") {
        setError("I couldn't determine what category you're looking for. Try being more specific, like 'laptops under $1000' or 'skincare products'.");
      } else if (fetchedProducts.length === 0) {
        setError(`I searched in the ${category} category but couldn't find matching products. Try adjusting your description or browse our full catalog.`);
      } else {
        setAiReply(`Found ${fetchedProducts.length} product${fetchedProducts.length !== 1 ? "s" : ""} in ${category} that match your request!`);
        setProducts(fetchedProducts);
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
            <p className="text-xs text-gray-400">AI is analyzing products to find the best matches.</p>
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
        Describe what you need and the AI will intelligently find the best matching products.
      </p>

      <textarea
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        rows={3}
        className="w-full p-3 border rounded-lg mb-3"
        placeholder="e.g. Recommend healthy breakfast food under $20"
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