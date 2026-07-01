import { Heart, Eye, ShoppingCart, Sparkles, Star, TrendingUp } from "lucide-react";
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
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all group">
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
          
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-colors">
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
          
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <Eye size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 hover:shadow-md transition-all">
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}