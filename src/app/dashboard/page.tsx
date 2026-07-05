'use client';

import { Hero3D } from '@/components/home/Hero3D';
import { AISearch3D } from '@/components/home/AISearch3D';
import { CategoryGrid3D } from '@/components/home/CategoryGrid3D';
import { ProductGrid3D } from '@/components/home/ProductGrid3D';

export default function DashboardPage() {
  return (
    <div className="w-full bg-background overflow-x-hidden">
      <Hero3D />
      <AISearch3D />
      <CategoryGrid3D />
      <ProductGrid3D title="Recommended For You" />
    </div>
  );
}
