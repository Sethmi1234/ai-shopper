"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Star,
  Heart,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useProducts } from "../../../hooks/useProducts";
import { useCategories } from "../../../hooks/useCategories";
import { getProducts } from "../../../services/product.service";
import ProductCard from "../../../components/product/ProductCard";
import useCart from "../../../store/useCart";
import useWishlist from "../../../store/useWishlist";

const PAGE_SIZE = 12;

const staticCategories = [
  { slug: "beauty", name: "Beauty" },
  { slug: "fragrances", name: "Fragrances" },
  { slug: "furniture", name: "Furniture" },
  { slug: "womens-bags", name: "Accessories" },
  { slug: "laptops", name: "Electronics" },
  { slug: "mens-shirts", name: "Apparel" },
];

type SortOption = "default" | "price-asc" | "price-desc" | "rating-desc";
type RatingFilter = "all" | "4plus" | "4.5plus" | "5";

function normalizeCategorySlug(value: unknown) {
  const raw =
    typeof value === "string"
      ? value
      : value == null
      ? ""
      : typeof value === "number"
      ? String(value)
      : typeof value === "object" && "slug" in value && typeof (value as any).slug === "string"
      ? (value as any).slug
      : String(value);

  return raw.trim().toLowerCase();
}

function formatCategoryName(slug: unknown) {
  const value = normalizeCategorySlug(slug);
  if (!value) return "General";

  return value
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProductsPage() {
  const [sort, setSort] = useState<SortOption>("default");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const { toggleItem, isWishlisted } = useWishlist();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(PAGE_SIZE);

  const addItem = useCart((state) => state.addItem);
  const { data: categoryData } = useCategories();

  const {
    data: allProductsData,
    isLoading: isAllProductsLoading,
    error: allProductsError,
  } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => getProducts(1000),
  });

  const products = useMemo(
    () => (data?.pages as any[])?.flatMap((page) => page.products) ?? [],
    [data]
  );

  const allProducts = useMemo(
    () => (allProductsData?.products as any[]) ?? [],
    [allProductsData]
  );

  const filteredSource = useMemo(
    () => (selectedCategory ? allProducts : products),
    [selectedCategory, allProducts, products]
  );

  const categories = useMemo(() => {
    const apiCategories = Array.isArray(categoryData)
      ? categoryData
          .map((item: any) => {
            const slug = normalizeCategorySlug(item);
            if (!slug) return null;

            const name =
              typeof item === "object" && item !== null && typeof item.name === "string"
                ? item.name
                : formatCategoryName(slug);

            return { slug, name };
          })
          .filter((item): item is { slug: string; name: string } => Boolean(item))
      : [];

    const merged = [
      ...staticCategories,
      ...apiCategories.filter(
        (apiCat) =>
          !staticCategories.some(
            (staticCat) => normalizeCategorySlug(staticCat.slug) === apiCat.slug
          )
      ),
    ];

    const productCategorySlugs = new Set<string>();
    allProducts.forEach((product: any) => {
      const slug = normalizeCategorySlug(product.category || "");
      if (slug) productCategorySlugs.add(slug);
    });

    productCategorySlugs.forEach((slug) => {
      if (!merged.some((cat) => cat.slug === slug)) {
        merged.push({ slug, name: formatCategoryName(slug) });
      }
    });

    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryData, allProducts]);

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5);

  const priceBounds = useMemo(() => {
    if (!filteredSource.length) {
      return { min: 0, max: 0 };
    }

    const prices = filteredSource.map((product: any) => Number(product.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      min: Number.isFinite(min) ? Math.floor(min) : 0,
      max: Number.isFinite(max) ? Math.ceil(max) : 0,
    };
  }, [products]);

  useEffect(() => {
    if (priceBounds.max > 0 && maxPrice === 0) {
      setMaxPrice(priceBounds.max);
    }
  }, [priceBounds.max, maxPrice]);

  const totalProducts = useMemo(
    () => (data?.pages as any[])?.[0]?.total ?? 0,
    [data]
  );

  const productsByCategory = useMemo(() => {
    const map = new Map<string, any[]>();

    categories.forEach((category) => {
      map.set(category.slug, []);
    });

    allProducts.forEach((product) => {
      const categorySlug = normalizeCategorySlug(product.category || "general");
      if (!categorySlug) return;
      if (!map.has(categorySlug)) {
        map.set(categorySlug, []);
      }
      map.get(categorySlug)?.push(product);
    });

    return map;
  }, [allProducts, categories]);

  const categoriesToRender = useMemo(() => {
    if (!selectedCategory) return categories;
    return categories.filter((c) => normalizeCategorySlug(c.slug) === selectedCategory);
  }, [selectedCategory, categories]);

  const processed = useMemo(() => {
    if (!filteredSource.length) return [];

    let filtered = [...filteredSource];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p: any) =>
        normalizeCategorySlug(p.category) === selectedCategory
      );
    }

    // Price filter by maximum value
    if (priceBounds.min !== priceBounds.max) {
      filtered = filtered.filter((p: any) => {
        const price = Number(p.price);
        return price <= maxPrice;
      });
    }

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
  }, [products, sort, ratingFilter, selectedCategory, maxPrice, priceBounds]);

  const hasMore = Boolean(hasNextPage && products.length < totalProducts);


  const clearFilters = () => {
    setSelectedCategory("");
    setRatingFilter("all");
    setSort("default");
    setMaxPrice(priceBounds.max);
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    maxPrice < priceBounds.max ||
    ratingFilter !== "all" ||
    sort !== "default";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Explore our collection</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              All Products
            </h1>
            <p className="text-gray-400 text-sm">
              {isLoading
                ? "Loading products…"
                : `${totalProducts} products available`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Sidebar Filters ── */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 text-base">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X size={12} />
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </p>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="text-xs text-black hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {displayedCategories.map((category) => {
                    const normalizedSlug = normalizeCategorySlug(category.slug);
                    const isActive = selectedCategory === normalizedSlug;
                    return (
                      <button
                        key={category.slug}
                        onClick={() => {
                          setSelectedCategory((prev) =>
                            prev === normalizedSlug ? "" : normalizedSlug
                          );
                        }}
                        className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2 transition-all text-sm font-medium ${
                          isActive
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-black hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`inline-flex h-3.5 w-3.5 rounded-full border ${
                            isActive
                              ? "border-black bg-black"
                              : "border-gray-300 bg-white"
                          }`}
                        />
                        {category.name}
                      </button>
                      );
                    })}
                </div>
                {categories.length > 5 && (
                  <button
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    className="mt-3 text-xs font-semibold text-black hover:text-gray-700"
                  >
                    {showAllCategories ? "Show less" : `Show more (${categories.length - 5})`}
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price range
                  </p>
                  <span className="text-xs text-gray-500">
                    up to ${maxPrice}
                  </span>
                </div>

                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={maxPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setMaxPrice(value);
                  }}
                  className="w-full accent-black"
                />
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Rating */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Rating
                </p>
                <div className="space-y-2">
                  {(
                    [
                      { label: "All Ratings", value: "all" },
                      { label: "4 ★ & up", value: "4plus" },
                      { label: "4.5 ★ & up", value: "4.5plus" },
                      { label: "5 ★ only", value: "5" },
                    ] as { label: string; value: RatingFilter }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRatingFilter(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        ratingFilter === opt.value
                          ? "bg-black text-white border border-black"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Sort by
                </p>
                <div className="space-y-2">
                  {(
                    [
                      { label: "Default", value: "default" },
                      { label: "Price: Low → High", value: "price-asc" },
                      { label: "Price: High → Low", value: "price-desc" },
                      { label: "Top Rated", value: "rating-desc" },
                    ] as { label: string; value: SortOption }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        sort === opt.value
                          ? "bg-black text-white border border-black"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Products Grid ── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="animate-spin text-black" size={40} />
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading products…</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 font-medium">Failed to load products. Please try again.</p>
                <Link href="/dashboard" className="mt-4 inline-block text-black underline text-sm font-bold">
                  Go back home
                </Link>
              </div>
            ) : processed.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-xl font-black text-gray-900 uppercase tracking-tight">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-black underline text-sm font-bold uppercase tracking-widest"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {processed.map((product: any, i: number) => (
                    <div
                      key={product.id}
                      style={{
                        animation: `fadeInUp 0.4s ease ${(i % PAGE_SIZE) * 0.05}s both`,
                      }}
                    >
                      <Link href={`/dashboard/products/${product.id}`} className="block group">
                        <div className="bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                          {/* Image */}
                          <div className="relative h-48 bg-gray-50">
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
                                <span className="bg-black px-2.5 py-1 text-[10px] font-black text-[#ccff00] flex items-center gap-1 uppercase tracking-wider">
                                  <Sparkles size={11} />
                                  Best Seller
                                </span>
                              ) : product.discountPercentage > 15 ? (
                                <span className="bg-black text-[#ccff00] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                                  -{Math.round(product.discountPercentage)}% OFF
                                </span>
                              ) : i === 2 ? (
                                <span className="bg-[#ccff00] text-black px-2.5 py-1 text-[10px] font-black flex items-center gap-1 uppercase tracking-wider">
                                  <TrendingUp size={11} />
                                  Trending
                                </span>
                              ) : (
                                <div />
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleItem({
                                    id: product.id,
                                    title: product.title,
                                    price: Number(product.price),
                                    thumbnail: product.thumbnail,
                                    category: product.category,
                                    rating: Number(product.rating),
                                  });
                                }}
                                className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm transition-all hover:scale-110"
                              >
                                <Heart
                                  size={15}
                                  className={
                                    isWishlisted(product.id)
                                      ? "text-red-500 fill-red-500"
                                      : "text-gray-400"
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
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
                                      ? "text-black fill-black"
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
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addItem(
                                    {
                                      id: product.id,
                                      title: product.title,
                                      price: Number(product.price),
                                      thumbnail: product.thumbnail,
                                      category: product.category,
                                    },
                                    1
                                  );
                                }}
                                className="w-9 h-9 bg-black flex items-center justify-center text-[#ccff00] hover:bg-gray-800 hover:shadow-md transition-all"
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
                      className="px-10 py-4 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isFetchingNextPage ? "Loading more..." : "Load More Products"}
                    </button>
                  </div>
                )}

                {/* Products by category section removed per user request */}
              </>
            )}
          </div>
        </div>
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