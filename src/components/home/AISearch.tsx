"use client";

import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { searchProductsBySpec } from "@/services/product.service";
import { requestAiStructuredOutput } from "@/services/ai.service";
import Image from "next/image";
import Link from "next/link";
import useCart from "@/store/useCart";
import useWishlist from "@/store/useWishlist";
import { ShoppingBag, Heart, Star } from "lucide-react";

const SUGGESTIONS = ["Skincare for dry skin", "Gifts for tech lovers", "Minimalist desk setup"];

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

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const addItem = useCart((state) => state.addItem);
  const { toggleItem, isWishlisted } = useWishlist();

  const run = async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    setAiReply(null);
    setProducts([]);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const aiResult = await requestAiStructuredOutput(text.trim());
      const decision = aiResult.data;

      if (aiResult.error || !decision) {
        throw new Error(aiResult.error || "AI did not return a structured response.");
      }

      if (!decision.requiresApiCall || decision.needsMoreInformation) {
        setAiReply(decision.reply);
        return;
      }

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
        const { searchProductsByPrompt } = await import("@/services/product.service");
        result = await searchProductsByPrompt(text.trim());
      }

      const found = result.products || [];
      if (found.length === 0) {
        setError("No products matched your request. Try a different description.");
      } else {
        setAiReply(decision.reply);
        setProducts(found);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || "Unable to search products at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    run(s);
  };

  const reviewCount = (p: any) =>
    Array.isArray(p.reviews) ? p.reviews.length : typeof p.reviews === "number" ? p.reviews : 42;

  return (
    <div className="relative -mt-6 md:-mt-12 max-w-5xl mx-auto z-20 px-4 sm:px-0 mb-12">
      <div className="bg-white p-6 md:p-10 shadow-2xl border border-gray-100 flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-6 text-center">
          What are you looking for today?
        </h2>

        <div className="w-full relative flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
          <div className="hidden sm:block absolute left-6 text-black z-10">
            <Sparkles size={20} />
          </div>
          <input
            className="w-full pl-5 sm:pl-16 pr-5 sm:pr-44 py-4 sm:py-5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black transition-colors text-black placeholder-gray-400 text-base md:text-lg font-medium rounded-none"
            placeholder="Describe the product you need..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(query)}
          />
          <button
            onClick={() => run(query)}
            disabled={isLoading || !query.trim()}
            className="w-full sm:w-auto sm:absolute right-2 top-1/2 sm:-translate-y-1/2 bg-[#ccff00] hover:bg-[#b3e600] disabled:opacity-50 text-black px-8 py-3.5 sm:py-3 font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><span className="sm:hidden"><Sparkles size={18} /></span>Ask AI <ArrowRight size={18} /></>}
          </button>
        </div>

        <div className="flex items-center gap-3 mt-6 text-xs text-gray-500 w-full overflow-x-auto pb-2 scrollbar-hide snap-x uppercase font-bold tracking-widest">
          <span className="text-black mr-1 shrink-0 snap-start">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="bg-gray-100 hover:bg-black hover:text-white text-gray-700 px-4 py-2 transition-colors whitespace-nowrap shrink-0 snap-start"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="bg-white border border-gray-100 shadow-lg mt-2 p-10 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={36} />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">AI is finding products for you...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-white border border-gray-100 shadow-lg mt-2 p-8 text-center">
          <p className="text-red-500 font-bold">{error}</p>
          <button
            onClick={() => { setError(null); setAiReply(null); setHasSearched(false); }}
            className="mt-4 text-xs font-black uppercase tracking-widest text-black underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && aiReply && products.length === 0 && (
        <div className="bg-white border border-gray-100 shadow-lg mt-2 p-8 text-center">
          <p className="text-gray-700 font-bold">{aiReply}</p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="bg-white border border-gray-100 shadow-lg mt-2 p-6 md:p-8">
          {aiReply && (
            <p className="text-sm font-semibold text-gray-600 mb-4">{aiReply}</p>
          )}
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <Sparkles size={18} className="text-black" />
            <h3 className="text-lg font-black text-black uppercase tracking-tighter">
              AI found {products.length} product{products.length !== 1 ? "s" : ""} for you
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <div key={p.id} className="bg-white group cursor-pointer">
                <Link href={`/dashboard/products/${p.id}`} className="block">
                  <div className="relative h-[240px] w-full overflow-hidden bg-gray-50 mb-3">
                    <Image
                      src={p.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {i === 0 && (
                      <div className="absolute top-3 left-3 bg-black text-[#ccff00] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} /> Best Match
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem({ id: p.id, title: p.title, price: Number(p.price), thumbnail: p.thumbnail, category: p.category, rating: Number(p.rating) }); }}
                      className="absolute top-3 right-3 bg-white p-2 text-black hover:bg-[#ccff00] transition-colors shadow-sm"
                    >
                      <Heart size={14} className={isWishlisted(p.id) ? "fill-black" : ""} />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full p-3 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/60 to-transparent">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem({ id: p.id, title: p.title, price: Number(p.price), thumbnail: p.thumbnail, category: p.category }, 1); }}
                        className="flex-1 bg-white hover:bg-black hover:text-white text-black py-2.5 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={13} /> Add to Cart
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{p.category || "General"}</p>
                  <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{p.title}</h4>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={11} className="text-black fill-black" />
                    <span className="text-xs font-bold text-black">{p.rating}</span>
                    <span className="text-xs text-gray-400">({reviewCount(p)})</span>
                  </div>
                  <p className="font-black text-gray-900">${p.price}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
