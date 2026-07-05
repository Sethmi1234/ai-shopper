"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

const staticCategories = [
  { name: "Beauty", slug: "beauty", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Fragrances", slug: "fragrances", img: "https://images.unsplash.com/photo-1588776814546-1ffbb3c29edf?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Furniture", slug: "furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Accessories", slug: "womens-bags", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Electronics", slug: "laptops", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Apparel", slug: "mens-shirts", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400&h=400" },
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

export default function CategoryListingPage() {
  const { data: apiCategories, isLoading } = useCategories();

  const allCategories = (() => {
    let categories = [...staticCategories];

    if (apiCategories && Array.isArray(apiCategories)) {
      const apiMapped = apiCategories
        .map((cat: any, index: number) => {
          const raw = typeof cat === "string" ? cat : cat.slug || cat.name || "";
          const name = raw
            .split("-")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
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
              (staticCat) => staticCat.name.toLowerCase() === apiCat.name.toLowerCase()
            )
        );

      categories = [...staticCategories, ...apiMapped.slice(0, 8)];
    }

    return categories;
  })();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Shop by interest</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">All Categories</h1>
          <p className="mt-3 text-sm text-gray-400 max-w-md">
            Browse every category available in our store in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-black" size={36} />
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Loading categories…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {allCategories.map((category, index) => (
              <Link
                key={`${category.name}-${index}`}
                href={`/dashboard/category/${(category as any).slug || category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={category.img}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <p className="text-center text-sm font-black uppercase tracking-widest text-gray-800 group-hover:text-black transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
