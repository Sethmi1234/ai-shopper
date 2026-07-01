"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

const staticCategories = [
  { name: "Beauty", slug: "beauty", img: "/cat_beauty.png" },
  { name: "Fragrances", slug: "fragrances", img: "/cat_fragrances.png" },
  { name: "Furniture", slug: "furniture", img: "/cat_furniture.png" },
  { name: "Accessories", slug: "womens-bags", img: "/cat_accessories.png" },
  { name: "Electronics", slug: "laptops", img: "/cat_electronics.png" },
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
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200 mb-3">Shop by interest</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">All Categories</h1>
            <p className="mt-3 text-sm sm:text-base text-blue-100">
              Browse every category available in the dashboard in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <p className="text-gray-500">Loading categories…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
            {allCategories.map((category, index) => (
              <Link
                key={`${category.name}-${index}`}
                href={`/dashboard/category/${(category as any).slug || category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-blue-200 sm:h-20 sm:w-20">
                  <Image
                    src={category.img}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                  />
                </div>
                <p className="text-center text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600">
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
