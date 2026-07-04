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

export default function AiRecommend({ prompt, runKey = 0, compact = false }: Props) {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const run = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    setProducts([]);
    setIsLoading(true);

    try {
      // Step 1: Use NVIDIA AI to extract structured search spec from natural language
      const systemPrompt = `You are a product search assistant. Given a user's natural language request, extract the following as valid JSON (no markdown, no backticks, just raw JSON):
{
  "category": "best matching category slug or null",
  "keywords": ["array", "of", "relevant", "search", "keywords"],
  "maxPrice": null or number
}
Available categories: beauty, fragrances, furniture, womens-bags, laptops, smartphones, mobile-accessories, home-decoration, kitchen-accessories, mens-shirts, mens-shoes, womens-dresses, womens-watches, womens-jewellery, sunglasses, tablets, groceries, sports-accessories, motorcycle, vehicle, skin-care, tops.

If the user asks for something like "gaming laptops under $1000", extract category "laptops", keywords ["gaming", "laptop"], maxPrice 1000.
If "Skincare for dry skin", extract category "skin-care", keywords ["skincare", "dry", "skin"], maxPrice null.
If "Gifts for tech lovers", extract category "mobile-accessories", keywords ["tech", "gadgets"], maxPrice null.`;

      let spec: { category?: string | null; keywords?: string[] | null; maxPrice?: number | null } | null = null;
      
      // Try NVIDIA first
      const aiResult = await requestAiStructuredOutput(text.trim(), systemPrompt);
      
      if (aiResult.data?.choices?.[0]?.message?.content) {
        try {
          const content = aiResult.data.choices[0].message.content.trim();
          // Remove any markdown code block wrapping
          const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
          const parsed = JSON.parse(cleaned);
          spec = {
            category: parsed.category || null,
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : null,
            maxPrice: typeof parsed.maxPrice === "number" ? parsed.maxPrice : null,
          };
        } catch {
          // Fall through to DummyJSON parsing if AI JSON is malformed
        }
      }

      // Step 2: Search DummyJSON using extracted spec, or fallback to prompt-based search
      const { searchProductsByPrompt } = await import("@/services/product.service");
      
      let result;
      if (spec && (spec.category || spec.keywords?.length || spec.maxPrice != null)) {
        result = await searchProductsBySpec(spec);
      } else {
        result = await searchProductsByPrompt(text.trim());
      }

      const nextProducts = result.products || [];
      if (nextProducts.length === 0) {
        setError("No products matched your request. Try a different description.");
      } else {
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
