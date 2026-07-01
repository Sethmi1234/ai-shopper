"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Star,
  Heart,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const PAGE_SIZE = 12;

function formatCategoryName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProductsPage() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(PAGE_SIZE);

  const products = useMemo(
    () => (data?.pages as any[])?.flatMap((page) => page.products) ?? [],
    [data]
  );

  const totalProducts = useMemo(
    () => (data?.pages as any[])?.[0]?.total ?? 0,
    [data]
  );

  const hasMore = Boolean(hasNextPage && products.length < totalProducts);

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              All Products
            </h1>
            <p className="text-blue-200 text-sm sm:text-base">
              {isLoading
                ? "Loading products…"
                : `${totalProducts} products available`}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-400 text-sm">Loading products…</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">
              Failed to load products. Please try again.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-blue-600 underline text-sm"
            >
              Go back home
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-medium text-gray-400">
              No products available.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product: any, i: number) => (
                <div
                  key={product.id}
                  style={{
                    animation: `fadeInUp 0.4s ease ${(i % PAGE_SIZE) * 0.05}s both`,
                  }}
                >
                  <Link href={`/dashboard/products/${product.id}`} className="block group">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                      {/* Image */}
                      <div className="relative h-56 bg-gray-50">
                        <Image
                          src={
                            product.thumbnail ||
                            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"
                          }
                          alt={product.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          {i === 0 ? (
                            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-1 shadow-sm">
                              <Sparkles size={11} className="text-blue-500" />
                              Best Seller
                            </span>
                          ) : product.discountPercentage > 15 ? (
                            <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                              -{Math.round(product.discountPercentage)}%
                            </span>
                          ) : i === 2 ? (
                            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-1 shadow-sm">
                              <TrendingUp size={11} className="text-blue-500" />
                              Trending
                            </span>
                          ) : (
                            <div />
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-1">
                          {formatCategoryName(product.category || "general")}
                        </p>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
                          {product.title}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                star <= Math.round(product.rating)
                                  ? "text-orange-400 fill-orange-400"
                                  : "text-gray-200 fill-gray-200"
                              }
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            {Number(product.rating).toFixed(1)} (
                            {Array.isArray(product.reviews)
                              ? product.reviews.length
                              : 42}
                            )
                          </span>
                        </div>

                        {/* Price + Cart */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-extrabold text-gray-900">
                              ${Number(product.price).toFixed(2)}
                            </p>
                            {product.discountPercentage > 0 && (
                              <p className="text-xs text-gray-400 line-through">
                                $
                                {(
                                  product.price /
                                  (1 - product.discountPercentage / 100)
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => e.preventDefault()}
                            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 hover:shadow-md transition-all"
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isFetchingNextPage ? "Loading more..." : "Load More Products"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}