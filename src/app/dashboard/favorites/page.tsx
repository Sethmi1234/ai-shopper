"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Trash2, HeartOff, ChevronRight, ShoppingBag } from "lucide-react";
import useWishlist from "@/store/useWishlist";
import useCart from "@/store/useCart";
import { useState } from "react";

export default function FavoritesPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const addItem = useCart((s: any) => s.addItem);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      category: product.category,
    }, 1);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">My Favorites</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">My Favorites</h1>
              <p className="text-blue-200 text-sm sm:text-base mt-1">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearWishlist}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm font-medium hover:bg-white/20 transition-all"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Heart size={36} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start browsing products and click the heart icon to save your favorite items here.
            </p>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <ShoppingBag size={18} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <Link href={`/dashboard/products/${product.id}`} className="block">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-50">
                    <Image
                      src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeItem(product.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white shadow-sm transition-all"
                      title="Remove from favorites"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs font-medium text-blue-500 uppercase tracking-wide mb-1">
                    {product.category ? (product.category.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")) : "General"}
                  </p>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Rating */}
                  {product.rating && (
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
                      <span className="text-xs text-gray-500 ml-1">{Number(product.rating).toFixed(1)}</span>
                    </div>
                  )}

                  {/* Price + Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(product.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-all"
                      >
                        <HeartOff size={12} />
                        Remove
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
                          addedIds.has(product.id)
                            ? "bg-green-600"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                        }`}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}