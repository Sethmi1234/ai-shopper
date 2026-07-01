"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Loader2,
  Star,
  Heart,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import { useCategories } from "@/hooks/useCategories";

function formatCategoryName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type SortOption = "default" | "price-asc" | "price-desc" | "rating-desc";
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
      <span className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-w-[160px] rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, error } = useCategoryProducts(slug);
  // Fetch all categories so we can display the real API category name for this slug
  const { data: allCategories } = useCategories();

  const [sort, setSort] = useState<SortOption>("default");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  // Resolve real category name from API (slug is exact API slug, e.g. "mens-shirts")
  const categoryName = (() => {
    if (allCategories && Array.isArray(allCategories)) {
      const match = allCategories.find((cat: any) => {
        const s = typeof cat === "string" ? cat : cat.slug || "";
        return s === slug;
      });
      if (match) {
        return typeof match === "string"
          ? formatCategoryName(match)
          : match.name || formatCategoryName(slug || "");
      }
    }
    // fallback: convert slug to readable name
    return formatCategoryName(slug || "");
  })();

  const products: any[] = useMemo(() => data?.products ?? [], [data]);

  const processed = useMemo(() => {
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
      return 0;
    });

    return filtered;
  }, [products, sort, priceFilter, ratingFilter]);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setPriceFilter("all");
    setRatingFilter("all");
    setSort("default");
  };

  const hasActiveFilters =
    priceFilter !== "all" || ratingFilter !== "all" || sort !== "default";

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-5">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/dashboard/category" className="hover:text-white transition-colors">
              Categories
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">{categoryName}</span>
          </nav>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {categoryName}
            </h1>
            <p className="text-blue-200 text-sm sm:text-base max-w-xl">
              {isLoading
                ? "Loading products…"
                : `${data?.total ?? 0} products found`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar - always visible */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-end gap-6 justify-end">
            {/* Sort by */}
            <FilterSelect<SortOption>
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                { label: "Default", value: "default" },
                { label: "Price: Low → High", value: "price-asc" },
                { label: "Price: High → Low", value: "price-desc" },
                { label: "Top Rated", value: "rating-desc" },
              ]}
            />

            {/* Price */}
            <FilterSelect<PriceFilter>
              label="Price Range"
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

            {/* Rating */}
            <FilterSelect<RatingFilter>
              label="Rating"
              value={ratingFilter}
              onChange={setRatingFilter}
              options={[
                { label: "All Ratings", value: "all" },
                { label: "4 ★ & up", value: "4plus" },
                { label: "4.5 ★ & up", value: "4.5plus" },
                { label: "5 ★ only", value: "5" },
              ]}
            />

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium mb-0.5"
              >
                Clear filters
              </button>
            )}
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
        ) : processed.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-medium text-gray-400">
              No products match your filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {processed.map((product: any, i: number) => (
              <div
                key={product.id}
                style={{
                  animation: `fadeInUp 0.4s ease ${(i % 12) * 0.05}s both`,
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm transition-all hover:scale-110"
                        >
                          <Heart
                            size={15}
                            className={
                              wishlist.has(product.id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400"
                            }
                          />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-1">
                        {formatCategoryName(product.category || slug)}
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
