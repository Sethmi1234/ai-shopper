"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Trash2, HeartOff, ShoppingBag, ArrowLeft } from "lucide-react";
import useWishlist from "../../../store/useWishlist";
import useCart from "../../../store/useCart";

export default function FavoritesPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const addItem = useCart((s: any) => s.addItem);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set([0]));
  const [isClearing, setIsClearing] = useState(false);

  // Initialize addedIds with a dummy value so initial render works
  const [initialized, setInitialized] = useState(false);

  const handleAddToCart = async (product: any) => {
    try {
      await addItem({
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
    } catch (err) {
      console.warn("Failed to add to cart", err);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      await removeItem(id);
    } catch (err) {
      console.warn("Failed to remove item", err);
    }
  };

  const handleClearWishlist = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await clearWishlist();
    } catch (err) {
      console.warn("Failed to clear wishlist", err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-[#ccff00] transition-colors text-xs font-bold uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Your collection</p>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">My Favourites</h1>
              <p className="text-gray-400 mt-2 text-sm">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearWishlist}
                disabled={isClearing}
                className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border border-gray-600 text-gray-300 hover:border-white hover:text-white transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} /> {isClearing ? "Clearing..." : "Clear All"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center bg-black">
              <Heart size={36} className="text-[#ccff00]" />
            </div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-3">No favourites yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
              Start browsing products and click the heart icon to save your favourite items here.
            </p>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 bg-black text-[#ccff00] px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
            >
              <ShoppingBag size={18} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
            {items.map((product: any) => (
              <div
                key={product.id}
                className="bg-white group cursor-pointer"
              >
                <Link href={`/dashboard/products/${product.id}`} className="block">
                  <div className="relative h-[280px] overflow-hidden bg-gray-50 mb-4">
                    <Image
                      src={product.thumbnail || "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400&h=400"}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemoveItem(product.id); }}
                      className="absolute top-3 right-3 bg-white p-2 text-black hover:bg-black hover:text-[#ccff00] transition-colors shadow-sm"
                      title="Remove from favourites"
                    >
                      <HeartOff size={15} />
                    </button>

                    {/* Hover Add to Cart */}
                    <div className="absolute bottom-0 left-0 w-full p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/60 to-transparent">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                          addedIds.has(product.id)
                            ? "bg-[#ccff00] text-black"
                            : "bg-white hover:bg-black hover:text-white text-black"
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {addedIds.has(product.id) ? "Added!" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="px-1">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                    {product.category
                      ? product.category.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                      : "General"}
                  </p>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={11}
                          className={
                            star <= Math.round(product.rating)
                              ? "text-black fill-black"
                              : "text-gray-200 fill-gray-200"
                          }
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{Number(product.rating).toFixed(1)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-black text-gray-900">${Number(product.price).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemoveItem(product.id)}
                      className="text-xs text-gray-400 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                    >
                      Remove
                    </button>
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