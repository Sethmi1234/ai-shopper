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
  Clock,
  Zap,
  Tag,
  Percent,
  Timer,
  Flame,
  Gift,
} from "lucide-react";
import { getProducts } from "../../../services/product.service";
import useCart from "../../../store/useCart";
import useWishlist from "../../../store/useWishlist";

function formatCategoryName(slug: string) {
  if (!slug) return "General";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function SalesPage() {
  const { toggleItem, isWishlisted } = useWishlist();
  const addItem = useCart((state) => state.addItem);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sales-products"],
    queryFn: async () => getProducts(100),
  });

  const allProducts = useMemo(
    () => (data?.products as any[]) ?? [],
    [data]
  );

  // Products with discounts
  const discountedProducts = useMemo(
    () =>
      allProducts
        .filter((p: any) => p.discountPercentage > 0)
        .sort((a: any, b: any) => b.discountPercentage - a.discountPercentage),
    [allProducts]
  );

  // Flash deals: top 8 highest discounts
  const flashDeals = useMemo(() => discountedProducts.slice(0, 8), [discountedProducts]);

  // Big discounts: 30%+ off
  const bigDiscounts = useMemo(
    () => discountedProducts.filter((p: any) => p.discountPercentage >= 30),
    [discountedProducts]
  );

  // Category-based sale sections
  const saleCategories = useMemo(() => {
    const map = new Map<string, any[]>();
    discountedProducts.forEach((p: any) => {
      const cat = p.category || "general";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    return Array.from(map.entries())
      .map(([category, products]) => ({
        category,
        products: products.slice(0, 4),
        avgDiscount: Math.round(
          products.reduce((sum, p) => sum + p.discountPercentage, 0) / products.length
        ),
      }))
      .sort((a, b) => b.avgDiscount - a.avgDiscount);
  }, [discountedProducts]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return (price * (1 - discount / 100)).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading sales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load sales. Please try again.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-black underline text-sm font-bold">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO SALE BANNER ── */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-[200px] font-black">%</div>
          <div className="absolute bottom-10 right-10 text-[200px] font-black">%</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-black">%</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={24} className="text-yellow-300" />
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
                  Limited Time Offer
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                Mega Sale
              </h1>
              <p className="text-xl md:text-2xl font-bold mb-2">
                Up to <span className="text-yellow-300 text-3xl">{Math.round(Math.max(...discountedProducts.map((p: any) => p.discountPercentage), 0))}% OFF</span>
              </p>
              <p className="text-red-200 text-sm mb-8 max-w-lg">
                Don't miss out on incredible deals across all categories. 
                Flash shipping, free returns, and the best prices of the season.
              </p>

              {/* Countdown Timer */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-yellow-300">
                  <Timer size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">Ends in:</span>
                </div>
                <div className="flex gap-3">
                  {[
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((unit) => (
                    <div key={unit.label} className="text-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
                        <span className="text-2xl font-black tabular-nums">
                          {String(unit.value).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-red-200">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                  <Zap size={14} className="text-yellow-300" /> Flash Shipping
                </span>
                <span className="flex items-center gap-1.5 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                  <Gift size={14} className="text-yellow-300" /> Free Returns
                </span>
                <span className="flex items-center gap-1.5 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                  <Percent size={14} className="text-yellow-300" /> {discountedProducts.length} Deals Live
                </span>
              </div>
            </div>

            {/* Sale Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Products on Sale", value: discountedProducts.length, icon: Tag },
                { label: "Big Discounts 30%+", value: bigDiscounts.length, icon: Percent },
                { label: "Categories", value: saleCategories.length, icon: Sparkles },
                { label: "Flash Deals", value: flashDeals.length, icon: Zap },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10"
                >
                  <stat.icon size={20} className="mx-auto mb-2 text-yellow-300" />
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-200 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ── FLASH DEALS SECTION ── */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Flash Deals</h2>
                <p className="text-sm text-gray-500">Limited time offers - grab them before they're gone</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-red-600 font-bold text-sm">
              <Clock size={16} />
              <span>Ending soon</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashDeals.map((product: any) => {
              const originalPrice = Number(product.price);
              const discountedPrice = calculateDiscountedPrice(originalPrice, product.discountPercentage);
              return (
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.id}`}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-50">
                    <Image
                      src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-2.5 py-1 text-xs font-black flex items-center gap-1 rounded">
                        <Percent size={11} />
                        -{Math.round(product.discountPercentage)}%
                      </span>
                    </div>
                    {/* Flash Deal Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-400 text-black px-2 py-1 text-[10px] font-black flex items-center gap-1 rounded animate-pulse">
                        <Zap size={11} />
                        FLASH
                      </span>
                    </div>
                    {/* Wishlist */}
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
                      className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm transition-all hover:scale-110"
                    >
                      <Heart
                        size={15}
                        className={isWishlisted(product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      {formatCategoryName(product.category)}
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
                      {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={11}
                          className={
                            star <= Math.round(product.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200 fill-gray-200"
                          }
                        />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">
                        ({Array.isArray(product.reviews) ? product.reviews.length : 42})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-extrabold text-red-600">
                            ${discountedPrice}
                          </p>
                          <p className="text-xs text-gray-400 line-through">
                            ${originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-[10px] font-bold text-green-600">
                          You save ${(originalPrice - Number(discountedPrice)).toFixed(2)}
                        </p>
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
                              price: Number(discountedPrice),
                              thumbnail: product.thumbnail,
                              category: product.category,
                            },
                            1
                          );
                        }}
                        className="w-9 h-9 bg-red-600 flex items-center justify-center text-white hover:bg-red-700 hover:shadow-md transition-all rounded-lg"
                      >
                        <ShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── BIG DISCOUNTS SECTION (30%+) ── */}
        {bigDiscounts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Percent size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Big Discounts</h2>
                  <p className="text-sm text-gray-500">30% or more off - incredible savings</p>
                </div>
              </div>
              <span className="hidden sm:block text-sm font-bold text-green-600">
                {bigDiscounts.length} deals
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bigDiscounts.map((product: any) => {
                const originalPrice = Number(product.price);
                const discountedPrice = calculateDiscountedPrice(originalPrice, product.discountPercentage);
                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-44 bg-gray-50">
                      <Image
                        src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-600 text-white px-3 py-1.5 text-sm font-black rounded">
                          -{Math.round(product.discountPercentage)}%
                        </span>
                      </div>
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
                        className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm transition-all hover:scale-110"
                      >
                        <Heart
                          size={15}
                          className={isWishlisted(product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        {formatCategoryName(product.category)}
                      </p>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            className={
                              star <= Math.round(product.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200 fill-gray-200"
                            }
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-extrabold text-green-600">${discountedPrice}</p>
                            <p className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</p>
                          </div>
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
                                price: Number(discountedPrice),
                                thumbnail: product.thumbnail,
                                category: product.category,
                              },
                              1
                            );
                          }}
                          className="w-9 h-9 bg-green-600 flex items-center justify-center text-white hover:bg-green-700 transition-all rounded-lg"
                        >
                          <ShoppingCart size={15} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── CATEGORY SALE SECTIONS ── */}
        {saleCategories.slice(0, 4).map(({ category, products, avgDiscount }) => (
          <section key={category} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-black p-2 rounded-lg">
                  <Tag size={18} className="text-[#ccff00]" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    {formatCategoryName(category)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Up to {avgDiscount}% off • {products.length} deals
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/category/${category}`}
                className="text-xs font-bold text-black hover:text-gray-700 uppercase tracking-wider underline"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product: any) => {
                const originalPrice = Number(product.price);
                const discountedPrice = calculateDiscountedPrice(originalPrice, product.discountPercentage);
                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 bg-gray-50">
                      <Image
                        src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-black text-[#ccff00] px-2 py-0.5 text-[10px] font-black rounded">
                          -{Math.round(product.discountPercentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-extrabold text-gray-900">${discountedPrice}</p>
                        <p className="text-[10px] text-gray-400 line-through">${originalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* ── ALL DISCOUNTED PRODUCTS ── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Tag size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">All Deals</h2>
                <p className="text-sm text-gray-500">Every discounted product in one place</p>
              </div>
            </div>
            <span className="hidden sm:block text-sm font-bold text-gray-500">
              {discountedProducts.length} products
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {discountedProducts.map((product: any) => {
              const originalPrice = Number(product.price);
              const discountedPrice = calculateDiscountedPrice(originalPrice, product.discountPercentage);
              return (
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.id}`}
                  className="group bg-white rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden"
                >
                  <div className="relative h-36 bg-gray-50">
                    <Image
                      src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-1.5 py-0.5 text-[9px] font-black rounded">
                        -{Math.round(product.discountPercentage)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-extrabold text-red-600">${discountedPrice}</p>
                      <p className="text-[10px] text-gray-400 line-through">${originalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] text-gray-400">{Number(product.rating).toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}