"use client";

import Hero from "@/components/home/Hero";
import Notices from "@/components/home/Notices";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductGrid from "@/components/home/ProductGrid";
import AISearch from "@/components/home/AISearch";
import HomeInfoSection from "@/components/home/HomeInfoSection";
import ServicesSection from "@/components/home/ServicesSection";
import AboutSection from "@/components/home/AboutSection";
import BlogSection from "@/components/home/BlogSection";

export default function DashboardPage() {
  return (
    <div className="bg-white">
      <Hero />
      <Notices />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AISearch />
        <div id="categories">
          <CategoryGrid />
        </div>
        <div id="products">
          <ProductGrid />
        </div>
      </div>
      <HomeInfoSection />
      <ServicesSection />
      <AboutSection />
      <BlogSection />
    </div>
  );
}
