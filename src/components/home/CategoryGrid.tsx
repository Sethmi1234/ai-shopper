"use client";

import { ArrowRight, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";

const INITIAL_VISIBLE = 6;

const staticCategories = [
  { name: "Beauty",      slug: "beauty",      img: "/cat_beauty.png" },
  { name: "Fragrances", slug: "fragrances",  img: "/cat_fragrances.png" },
  { name: "Furniture",  slug: "furniture",   img: "/cat_furniture.png" },
  { name: "Accessories",slug: "womens-bags", img: "/cat_accessories.png" },
  { name: "Electronics",slug: "laptops",     img: "/cat_electronics.png" },
  { name: "Apparel",    slug: "mens-shirts", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=400" },
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
        const raw = typeof cat === "string" ? cat : cat.slug || cat.name || "";
        const name = raw
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return {
          name,
          slug: raw,
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
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Explore Categories</h2>
        {!isLoading && allCategories.length > INITIAL_VISIBLE && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1.5 text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm"
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
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {visibleCategories.map((c, i) => (
            <Link
              key={`${c.name}-${i}`}
              href={`/dashboard/category/${(c as any).slug || c.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex flex-col items-center gap-2 sm:gap-3 group"
              style={{ animation: `fadeInUp 0.35s ease ${i * 0.04}s both` }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 shadow-sm border-2 border-gray-100 group-hover:shadow-lg group-hover:border-blue-200 group-hover:scale-110 transition-all duration-300 relative">
                <Image
                  src={c.img}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  className="object-cover"
                />
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors leading-tight">
                {c.name}
              </p>
            </Link>
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