import { Heart, Eye, ShoppingBag, Sparkles, Star, TrendingUp } from "lucide-react";
import Image from "next/image";

type ProductCardProps = {
  title: string;
  category: string;
  price: string;
  rating: number;
  reviews: number;
  img: string;
  badgeType?: "match" | "trending";
};

export default function ProductCard({ title, category, price, rating, reviews, img, badgeType }: ProductCardProps) {
  return (
    <div className="bg-white group cursor-pointer">
      <div className="relative h-[300px] w-full overflow-hidden bg-gray-50 mb-4">
        <Image src={img} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized={img.startsWith('http')} />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex justify-between w-[calc(100%-24px)] items-start z-10">
          {badgeType === "match" ? (
            <div className="bg-black text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-[#ccff00]" /> 98% Match
            </div>
          ) : badgeType === "trending" ? (
            <div className="bg-[#ccff00] text-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp size={12} /> Trending
            </div>
          ) : <div></div>}
          
          <button className="bg-white p-2 text-black hover:bg-[#ccff00] transition-colors shadow-sm">
            <Heart size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Hover Actions */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/50 to-transparent">
          <button className="flex-1 bg-white hover:bg-black hover:text-white text-black py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
            <ShoppingBag size={14} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="px-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{category}</p>
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1 group-hover:text-gray-600 transition-colors">{title}</h3>
        
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-black fill-black" />
          <span className="text-xs font-bold text-black">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>

        <p className="text-lg font-black text-gray-900">{price}</p>
      </div>
    </div>
  );
}