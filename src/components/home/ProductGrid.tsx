"use client";

import { useState } from "react";
import { Loader2, ShoppingBag, Heart, Star, TrendingUp, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";
import useCart from "@/store/useCart";
import useWishlist from "@/store/useWishlist";

const PAGE_SIZE = 8;

export default function ProductGrid() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const addItem = useCart((state) => state.addItem);
  const { toggleItem, isWishlisted } = useWishlist();

  const { data, isLoading, error } = useInfiniteQuery({
    queryKey: ["products-home", 30] as const,
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => getProducts(30, pageParam),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
  });

  const products: any[] = data?.pages?.flatMap((p) => p.products) ?? [];
  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const reviewCount = (p: any) =>
    Array.isArray(p.reviews) ? p.reviews.length : typeof p.reviews === "number" ? p.reviews : 42;

  return (
    <div className="mt-16 md:mt-24">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter">
          Recommended For You
        </h2>
        <Link
          href="/dashboard/products"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-black" size={36} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-medium">
          Failed to load products. Please try again.
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-bold">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
          {visible.map((product: any, i: number) => (
            <div
              key={product.id}
              className="bg-white group cursor-pointer"
              style={{ animation: `fadeInUp 0.4s ease ${(i % PAGE_SIZE) * 0.07}s both` }}
            >
              <Link href={`/dashboard/products/${product.id}`} className="block">
                <div className="relative h-[280px] w-full overflow-hidden bg-gray-50 mb-4">
                  <Image
                    src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex justify-between w-[calc(100%-24px)] items-start z-10">
                    {i === 0 ? (
                      <div className="bg-black text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} className="text-[#ccff00]" /> 98% Match
                      </div>
                    ) : i === 3 ? (
                      <div className="bg-[#ccff00] text-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={12} /> Trending
                      </div>
                    ) : product.discountPercentage > 15 ? (
                      <div className="bg-black text-[#ccff00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                        -{Math.round(product.discountPercentage)}% OFF
                      </div>
                    ) : <div />}

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
                      className="bg-white p-2 text-black hover:bg-[#ccff00] transition-colors shadow-sm"
                    >
                      <Heart
                        size={16}
                        strokeWidth={2}
                        className={isWishlisted(product.id) ? "fill-black" : ""}
                      />
                    </button>
                  </div>

                  {/* Hover Add to Cart */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/60 to-transparent">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          id: product.id,
                          title: product.title,
                          price: Number(product.price),
                          thumbnail: product.thumbnail,
                          category: product.category,
                        }, 1);
                      }}
                      className="flex-1 bg-white hover:bg-black hover:text-white text-black py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>

                <div className="px-1">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{product.category || "General"}</p>
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1 group-hover:text-gray-600 transition-colors">{product.title}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="text-black fill-black" />
                    <span className="text-xs font-bold text-black">{product.rating}</span>
                    <span className="text-xs text-gray-400">({reviewCount(product)})</span>
                  </div>
                  <p className="text-lg font-black text-gray-900">${product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && !error && hasMore && (
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Load More Products
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}