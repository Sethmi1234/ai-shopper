"use client";

import { ArrowRight, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";

const INITIAL_VISIBLE = 6;

const staticCategories = [
  { name: "Beauty",      img: "/cat_beauty.png" },
  { name: "Fragrances",  img: "/cat_fragrances.png" },
  { name: "Furniture",   img: "/cat_furniture.png" },
  { name: "Accessories", img: "/cat_accessories.png" },
  { name: "Electronics", img: "/cat_electronics.png" },
  { name: "Apparel",     img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=400" },
];

const extraUnsplashIds = [
  "1505740420928-5e560c06d30e",
  "1523275335684-37898b6baf30",
  "1542291026-7eec264c27ff",
  "1611186871348-b1ce696e52c9",
  "1583394838236-0c1598ce405c",
  "1491553895911-0055eca6402d",
  "1560769629-975ec94e6a86",
  "1526170375885-74d8484da3d9",
];

export default function CategoryGrid() {
  const { data: apiCategories, isLoading } = useCategories();
  const [showAll, setShowAll] = useState(false);

  // Build combined list
  let allCategories = [...staticCategories];

  if (apiCategories && Array.isArray(apiCategories)) {
    const apiMapped = apiCategories
      .map((cat: any, index: number) => {
        const raw = typeof cat === "string" ? cat : cat.name || cat.slug || "";
        const name = raw
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return {
          name,
          img: `https://images.unsplash.com/photo-${extraUnsplashIds[index % extraUnsplashIds.length]}?auto=format&fit=crop&q=80&w=400&h=400`,
        };
      })
      .filter(
        (apiCat) =>
          !staticCategories.some(
            (s) => s.name.toLowerCase() === apiCat.name.toLowerCase()
          )
      );

    allCategories = [...staticCategories, ...apiMapped.slice(0, 8)];
  }

  const visibleCategories = showAll
    ? allCategories
    : allCategories.slice(0, INITIAL_VISIBLE);

  return (
    <div className="mt-20">
      <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter">Explore Categories</h2>
        {!isLoading && allCategories.length > INITIAL_VISIBLE && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1.5 text-black font-bold uppercase text-xs tracking-wider hover:text-gray-600 transition-colors"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={16} /></>
            ) : (
              <>See All <ArrowRight size={16} /></>
            )}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-black" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
          {visibleCategories.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex flex-col gap-3 group cursor-pointer"
              style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}
            >
              <div className="w-full aspect-square overflow-hidden bg-gray-100 relative">
                <Image
                  src={c.img}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 150px, 200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              </div>
              <p className="text-sm font-bold text-black uppercase tracking-wide group-hover:text-gray-600 transition-colors">
                {c.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}