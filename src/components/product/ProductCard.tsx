"use client";

import { MouseEvent, useState } from "react";
import { Heart, ShoppingCart, Sparkles, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useCart from "@/store/useCart";

type ProductCardProps = {
  id: number;
  title: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  img: string;
  badgeType?: "match" | "trending";
};

export default function ProductCard({ id, title, category, price, rating, reviews, img, badgeType }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s: any) => s.addItem);

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price: Number(price.replace("$", "")), thumbnail: img, category }, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link href={`/dashboard/products/${id}`} className="block group">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all">
        <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-50 mb-4">
          <Image src={img} alt={title} fill className="object-cover" unoptimized={img.startsWith('http')} />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex justify-between w-[calc(100%-24px)] items-start">
            {badgeType === "match" ? (
              <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-1 shadow-sm">
                <Sparkles size={12} className="text-blue-500" /> 98% Match
              </div>
            ) : badgeType === "trending" ? (
              <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-1 shadow-sm">
                <TrendingUp size={12} className="text-blue-500" /> Trending
              </div>
            ) : <div></div>}
            
            <button
              onClick={(e) => e.preventDefault()}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-colors"
            >
              <Heart size={16} />
            </button>
          </div>
        </div>

        <div className="px-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{title}</h3>
          <p className="text-gray-500 text-sm mb-3">{category}</p>
          
          <div className="flex items-center gap-1 mb-4">
            <Star size={14} className="text-orange-400 fill-orange-400" />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
            <span className="text-sm text-gray-400">({reviews} reviews)</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-2xl font-bold text-gray-900">{price}</p>
            
            <button
              onClick={handleAddToCart}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                added ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
              }`}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}