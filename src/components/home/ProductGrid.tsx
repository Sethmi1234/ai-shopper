"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const PAGE_SIZE = 8;

export default function ProductGrid() {
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

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  const reviewCount = (p: any) =>
    Array.isArray(p.reviews)
      ? p.reviews.length
      : typeof p.reviews === "number"
      ? p.reviews
      : 42;

  return (
    <div className="mt-16 md:mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recommended for You</h2>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={36} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-medium">
          Failed to load products. Please try again.
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any, i: number) => (
            <div
              key={product.id}
              style={{ animation: `fadeInUp 0.4s ease ${(i % PAGE_SIZE) * 0.07}s both` }}
            >
              <ProductCard
                id={product.id}
                title={product.title}
                category={product.category || "General"}
                price={`$${product.price}`}
                rating={product.rating || 4.5}
                reviews={reviewCount(product)}
                img={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                badgeType={i === 0 ? "match" : i === 3 ? "trending" : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && !error && hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isFetchingNextPage ? "Loading more..." : "Load More Recommendations"}
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
