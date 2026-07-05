"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/home/Hero";
import Notices from "@/components/home/Notices";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductGrid from "@/components/home/ProductGrid";
import AISearch from "@/components/home/AISearch";
import HomeInfoSection from "@/components/home/HomeInfoSection";

export default function DashboardPage() {
  return (
    <div className="bg-white">
      <Hero />
      <Notices />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AISearch />
        <CategoryGrid />
        <ProductGrid />
      </div>
      <HomeInfoSection />
    </div>
  );
}
