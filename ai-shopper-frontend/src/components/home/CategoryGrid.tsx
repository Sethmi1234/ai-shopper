"use client";

import { ArrowRight, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";

const INITIAL_VISIBLE = 6;

const staticCategories: { name: string; img: string; slug: string }[] = [
  { name: "Beauty",      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&h=400", slug: "beauty" },
  { name: "Fragrances",  img: "https://images.unsplash.com/photo-1588776814546-1ffbb3c29edf?auto=format&fit=crop&q=80&w=400&h=400", slug: "fragrances" },
  { name: "Furniture",   img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400&h=400", slug: "furniture" },
  { name: "Accessories", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400&h=400", slug: "mobile-accessories" },
  { name: "Electronics", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400&h=400", slug: "laptops" },
  { name: "Apparel",     img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=400", slug: "tops" },
];

const extraUnsplashIds = [
  "1522335789203-aabd1fc54bc9", // beauty
  "1541643600914-78b084683601", // fragrances
  "1555041469-a586c61ea9bc",   // furniture
  "1566150905458-1bf1fc113f0d", // accessories
  "1498050108023-c5249f4df085", // electronics
  "1523381210434-271e8be1f52b", // apparel
  "1505740420928-5e560c06d30e", // sports
  "1616486338812-3d6dc9e7c3b3", // home decoration
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
        const slug = typeof cat === "string" ? cat : cat.slug || raw;
        return {
          name,
          slug,
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
            <Link
              key={`${c.name}-${i}`}
              href={`/dashboard/category/${c.slug}`}
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
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              </div>
              <p className="text-sm font-bold text-black uppercase tracking-wide group-hover:text-gray-600 transition-colors">
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