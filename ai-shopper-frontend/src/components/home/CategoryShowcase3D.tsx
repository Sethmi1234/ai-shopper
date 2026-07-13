"use client";

import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import {
  Sparkles,
  Smartphone,
  Sofa,
  Shirt,
  Gem,
  Car,
  Watch,
  UtensilsCrossed,
  ShoppingBasket,
  Laptop,
  Glasses,
  LayoutGrid,
} from "lucide-react";

type CategoryStyle = { icon: any; gradient: string };

const STYLE_RULES: { test: RegExp; style: CategoryStyle }[] = [
  { test: /beauty|skin/i, style: { icon: Sparkles, gradient: "from-rose-500 to-pink-400" } },
  { test: /fragrance/i, style: { icon: Sparkles, gradient: "from-fuchsia-500 to-purple-400" } },
  { test: /furniture|decoration/i, style: { icon: Sofa, gradient: "from-amber-600 to-orange-400" } },
  { test: /grocer/i, style: { icon: ShoppingBasket, gradient: "from-emerald-500 to-green-400" } },
  { test: /kitchen/i, style: { icon: UtensilsCrossed, gradient: "from-orange-500 to-amber-400" } },
  { test: /laptop/i, style: { icon: Laptop, gradient: "from-blue-600 to-cyan-400" } },
  { test: /mobile|smartphone|tablet/i, style: { icon: Smartphone, gradient: "from-sky-600 to-blue-400" } },
  { test: /watch/i, style: { icon: Watch, gradient: "from-yellow-600 to-amber-400" } },
  { test: /sunglasses/i, style: { icon: Glasses, gradient: "from-slate-700 to-slate-500" } },
  { test: /jewellery|jewelry/i, style: { icon: Gem, gradient: "from-violet-600 to-fuchsia-400" } },
  { test: /vehicle|motorcycle/i, style: { icon: Car, gradient: "from-red-600 to-orange-500" } },
  { test: /shirt|dress|top|shoe|bag/i, style: { icon: Shirt, gradient: "from-indigo-600 to-violet-400" } },
];

const DEFAULT_STYLE: CategoryStyle = { icon: LayoutGrid, gradient: "from-slate-600 to-slate-400" };

function getStyle(name: string): CategoryStyle {
  const match = STYLE_RULES.find((r) => r.test.test(name));
  return match ? match.style : DEFAULT_STYLE;
}

function formatName(raw: string) {
  return raw
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CategoryShowcase3D() {
  const { data: categories, isLoading } = useCategories();
  const [showAll, setShowAll] = useState(false);

  const list = Array.isArray(categories) ? categories : [];
  const names = list.map((c: any) => (typeof c === "string" ? c : c.name || c.slug || ""));
  const visible = showAll ? names : names.slice(0, 8);

  if (isLoading) return null;

  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Every Category, One Store</h2>
        {names.length > 8 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            {showAll ? "Show less" : `See all ${names.length}`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" style={{ perspective: 1000 }}>
        {visible.map((raw: string, i: number) => {
          const { icon: Icon, gradient } = getStyle(raw);
          return (
            <div
              key={raw}
              className="group relative h-32 rounded-2xl cursor-pointer [transform-style:preserve-3d] transition-transform duration-300 ease-out hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-4px)]"
              style={{ animation: `catFadeIn 0.4s ease ${i * 0.05}s both` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-90`} />
              <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 text-white p-3 text-center">
                <Icon size={26} />
                <span className="text-sm font-semibold leading-tight">{formatName(raw)}</span>
              </div>
              <div className="absolute inset-0 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes catFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}