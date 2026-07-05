"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const PAGE_SIZE = 8;

type SortOption = "ai-match" | "price-asc" | "price-desc" | "rating-desc";
type PriceFilter = "all" | "under-50" | "50-150" | "150-300" | "over-300";
type RatingFilter = "all" | "4plus" | "4.5plus" | "5";

function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-50 bg-white transition-colors"
      >
        {selected?.label ?? label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-gray-100 z-20 py-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-black" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductGrid() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sort, setSort] = useState<SortOption>("ai-match");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

  // Fetch a large pool so we can filter/sort client-side
  const { data, isLoading, error } = useProducts(30);

  const processed = useMemo(() => {
    if (!data?.products) return [];

    let products = [...data.products];

    // Price filter
    products = products.filter((p: any) => {
      const price = Number(p.price);
      if (priceFilter === "under-50") return price < 50;
      if (priceFilter === "50-150") return price >= 50 && price <= 150;
      if (priceFilter === "150-300") return price > 150 && price <= 300;
      if (priceFilter === "over-300") return price > 300;
      return true;
    });

    // Rating filter
    products = products.filter((p: any) => {
      const rating = Number(p.rating);
      if (ratingFilter === "4plus") return rating >= 4;
      if (ratingFilter === "4.5plus") return rating >= 4.5;
      if (ratingFilter === "5") return rating === 5;
      return true;
    });

    // Sort
    products.sort((a: any, b: any) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "rating-desc") return Number(b.rating) - Number(a.rating);
      return 0; // ai-match = original order
    });

    return products;
  }, [data, sort, priceFilter, ratingFilter]);

  const visible = processed.slice(0, visibleCount);
  const hasMore = visibleCount < processed.length;

  const handleLoadMore = () => setVisibleCount((c) => c + PAGE_SIZE);

  const reviewCount = (p: any) =>
    Array.isArray(p.reviews)
      ? p.reviews.length
      : typeof p.reviews === "number"
      ? p.reviews
      : 42;

  return (
    <div className="mt-16 md:mt-24">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter">Recommended For You</h2>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 scrollbar-hide snap-x">
          <div className="shrink-0 snap-start">
            <Dropdown<PriceFilter>
              label="Price"
              value={priceFilter}
              onChange={(v) => { setPriceFilter(v); setVisibleCount(PAGE_SIZE); }}
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
            <Dropdown<RatingFilter>
              label="Rating"
              value={ratingFilter}
              onChange={(v) => { setRatingFilter(v); setVisibleCount(PAGE_SIZE); }}
              options={[
                { label: "All Ratings", value: "all" },
                { label: "4★ & up", value: "4plus" },
                { label: "4.5★ & up", value: "4.5plus" },
                { label: "5★ only", value: "5" },
              ]}
            />
          </div>
          <div className="shrink-0 snap-start">
            <Dropdown<SortOption>
              label="Sort: AI Match"
              value={sort}
              onChange={(v) => { setSort(v); setVisibleCount(PAGE_SIZE); }}
              options={[
                { label: "Sort: AI Match", value: "ai-match" },
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
          <Loader2 className="animate-spin text-black" size={36} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 font-medium">
          Failed to load products. Please try again.
        </div>
      ) : processed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-bold">No products match your filters.</p>
          <button
            onClick={() => { setPriceFilter("all"); setRatingFilter("all"); setSort("ai-match"); }}
            className="mt-4 text-black underline text-sm uppercase tracking-wide font-bold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12">
          {visible.map((product: any, i: number) => (
            <div
              key={product.id}
              style={{ animation: `fadeInUp 0.4s ease ${(i % PAGE_SIZE) * 0.07}s both` }}
            >
              <ProductCard
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
        <div className="mt-16 flex justify-center">
          <button
            onClick={handleLoadMore}
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