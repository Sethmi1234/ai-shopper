"use client";

import { useEffect, useRef, useState } from "react";
import { Boxes, LayoutGrid, Star, Zap } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 10 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md p-6 hover:border-white/20"
    >
      {children}
    </div>
  );
}

export default function DashboardStats() {
  const { data } = useProducts(100);
  const { data: categories } = useCategories();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const products = data?.products ?? [];
  const totalProducts = data?.total ?? products.length;
  const categoryCount = Array.isArray(categories) ? categories.length : 0;
  const avgRating = products.length
    ? products.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) /
      products.length
    : 0;

  const totalCount = useCountUp(totalProducts, 1200, inView);
  const catCount = useCountUp(categoryCount, 1000, inView);
  const ratingCount = useCountUp(Math.round(avgRating * 10), 1000, inView);

  const stats = [
    {
      icon: Boxes,
      label: "Products indexed",
      value: totalCount.toLocaleString(),
      suffix: "+",
    },
    { icon: LayoutGrid, label: "Categories covered", value: catCount, suffix: "" },
    { icon: Star, label: "Avg. rating", value: (ratingCount / 10).toFixed(1), suffix: "" },
    { icon: Zap, label: "AI response time", value: "<1", suffix: "s" },
  ];

  return (
    <div ref={sectionRef} className="mt-16 rounded-3xl bg-[#0B0F1A] p-8 md:p-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s) => (
          <TiltCard key={s.label}>
            <s.icon size={20} className="text-[#9FE8F0] mb-4" />
            <p className="text-2xl md:text-3xl font-bold text-white font-mono">
              {s.value}
              {s.suffix}
            </p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}