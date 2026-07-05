"use client";

import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const categories = ["Electronics", "Accessories", "Fashion", "Beauty", "Home & Living"];

export default function Hero() {
  const [catIndex, setCatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCatIndex((prev) => (prev + 1) % categories.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[80vh] min-h-[600px] flex items-center bg-black overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
          alt="Premium Shopping"
          fill
          className="object-cover opacity-80 transition-transform duration-[20s] group-hover:scale-105"
          priority
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 sm:px-16 lg:px-24 max-w-4xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black text-white leading-[1.05] tracking-tight uppercase">
          <span className="block mb-2">Be Smart.</span>
          <span className="block">Be Connected.</span>
        </h1>

        <p className="mt-8 text-base md:text-lg text-gray-200 max-w-lg leading-relaxed font-medium">
          Experience the future of shopping. Curated by artificial intelligence, delivering exceptional quality directly to you.
        </p>

        <div className="mt-10">
          <button className="bg-[#ccff00] hover:bg-[#b3e600] text-black px-8 py-4 font-black uppercase tracking-wider text-sm transition-transform hover:-translate-y-1 min-w-[280px]">
            Discover {categories[catIndex]}
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
        <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center">
          <ArrowDown size={18} className="text-white animate-bounce" />
        </div>
      </div>
    </div>
  );
}