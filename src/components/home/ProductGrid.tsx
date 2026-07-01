"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const PAGE_SIZE = 8;

type SortOption = "ai-match" | "price-asc" | "price-desc" | "rating-desc";
type PriceFilter = "all" | "under-50" | "50-150" | "150-300" | "over-300";
type RatingFilter = "all" | "4plus" | "4.5plus" | "5";

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col text-sm text-gray-700">
      <span className="mb-2 text-sm font-medium text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-w-[180px] rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProductGrid() {
  const [sort, setSort] = useState<SortOption>("ai-match");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

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

  const processed = useMemo(() => {
    if (!products.length) return [];

    let filtered = [...products];

    // Price filter
    filtered = filtered.filter((p: any) => {
      const price = Number(p.price);
      if (priceFilter === "under-50") return price < 50;
      if (priceFilter === "50-150") return price >= 50 && price <= 150;
      if (priceFilter === "150-300") return price > 150 && price <= 300;
      if (priceFilter === "over-300") return price > 300;
      return true;
    });

    // Rating filter
    filtered = filtered.filter((p: any) => {
      const rating = Number(p.rating);
      if (ratingFilter === "4plus") return rating >= 4;
      if (ratingFilter === "4.5plus") return rating >= 4.5;
      if (ratingFilter === "5") return rating === 5;
      return true;
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "rating-desc") return Number(b.rating) - Number(a.rating);
      return 0; // ai-match = original order
    });

    return filtered;
  }, [products, sort, priceFilter, ratingFilter]);

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
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recommended for You</h2>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide snap-x">
          <div className="shrink-0 snap-start">
            <FilterSelect<PriceFilter>
              label="Price"
              value={priceFilter}
              onChange={setPriceFilter}
              options={[
                { label: "All Prices", value: "all" },
                { label: "Under $50", value: "under-50" },
                { label: "$50 – $150", value: "50-150" },
                { label: "$150 – $300", value: "150-300" },
                { label: "Over $300", value: "over-300" },
              ]}
            />
          </div>
          <div className="shrink-0 snap-start">
            <FilterSelect<RatingFilter>
              label="Rating"
              value={ratingFilter}
              onChange={setRatingFilter}
              options={[
                { label: "All Ratings", value: "all" },
                { label: "4★ & up", value: "4plus" },
                { label: "4.5★ & up", value: "4.5plus" },
                { label: "5★ only", value: "5" },
              ]}
            />
          </div>
          <div className="shrink-0 snap-start">
            <FilterSelect<SortOption>
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                { label: "Sort by: AI Match", value: "ai-match" },
                { label: "Price: Low → High", value: "price-asc" },
                { label: "Price: High → Low", value: "price-desc" },
                { label: "Top Rated", value: "rating-desc" },
              ]}
            />
          </div>
        </div>
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
      ) : processed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No products match your filters.</p>
          <button
            onClick={() => { setPriceFilter("all"); setRatingFilter("all"); setSort("ai-match"); }}
            className="mt-4 text-blue-600 underline text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processed.map((product: any, i: number) => (
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