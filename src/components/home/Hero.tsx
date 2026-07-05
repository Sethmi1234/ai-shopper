"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  ArrowRight,
  Smartphone,
  Shirt,
  Sofa,
  ShoppingBasket,
  Gem,
  Car,
} from "lucide-react";

const ORBIT_ITEMS = [
  { icon: Smartphone, label: "Electronics", angle: 0 },
  { icon: Shirt, label: "Fashion", angle: 60 },
  { icon: Sofa, label: "Home", angle: 120 },
  { icon: ShoppingBasket, label: "Groceries", angle: 180 },
  { icon: Gem, label: "Jewellery", angle: 240 },
  { icon: Car, label: "Vehicles", angle: 300 },
];

export default function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -12, y: px * 12 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div className="relative overflow-hidden bg-[#0B0F1A] w-full px-6 md:px-12 py-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-14">
      {/* Ambient glow */}
      <div className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-[#7C5CFC]/25 rounded-full blur-[100px]" />
      <div className="absolute -bottom-32 -right-10 w-[420px] h-[420px] bg-[#34D9E8]/20 rounded-full blur-[100px]" />

      {/* Left content */}
      <div className="relative z-10 max-w-xl text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#9FE8F0] text-xs font-mono tracking-wide mb-6">
          <Sparkles size={14} /> ONE AI. EVERY CATEGORY.
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight">
          Shop everything.
          <br />
          <span className="bg-gradient-to-r from-[#7C5CFC] to-[#34D9E8] bg-clip-text text-transparent">
            Curated by AI.
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-md mx-auto md:mx-0">
          From skincare to smartphones, sneakers to sofas — describe what you
          need and our assistant finds it across every category, instantly.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <button className="group bg-white text-[#0B0F1A] px-7 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform shadow-[0_0_30px_rgba(124,92,252,0.35)]">
            Explore All Categories
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border border-white/15 text-white px-7 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
            <Search size={18} /> Try AI Search
          </button>
        </div>
      </div>

      {/* Right: 3D orbit scene */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 hidden md:block w-[380px] h-[380px]"
        style={{ perspective: 900 }}
      >
        <div
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.15s ease-out",
          }}
          className="relative w-full h-full"
        >
          {/* Core orb */}
          <div className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#34D9E8] shadow-[0_0_60px_rgba(124,92,252,0.6)] animate-orb-pulse flex items-center justify-center">
            <Sparkles size={32} className="text-white" />
          </div>

          {/* Guide rings */}
          <div className="absolute inset-0 m-auto w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute inset-0 m-auto w-80 h-80 rounded-full border border-white/5" />

          {/* Orbiting category tiles */}
          <div className="absolute inset-0 animate-orbit-spin" style={{ transformStyle: "preserve-3d" }}>
            {ORBIT_ITEMS.map(({ icon: Icon, label, angle }) => (
              <div
                key={label}
                className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8"
                style={{ transform: `rotate(${angle}deg) translateX(140px)` }}
              >
                <div className="w-full h-full animate-orbit-counter-spin">
                  <div className="w-full h-full rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1 shadow-lg">
                    <Icon size={18} className="text-[#9FE8F0]" />
                    <span className="text-[9px] text-slate-300 font-mono">{label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(124,92,252,0.5); }
          50% { transform: scale(1.06); box-shadow: 0 0 90px rgba(124,92,252,0.75); }
        }
        .animate-orb-pulse { animation: orb-pulse 3.5s ease-in-out infinite; }

        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orbit-spin { animation: orbit-spin 26s linear infinite; }

        @keyframes orbit-counter-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-orbit-counter-spin { animation: orbit-counter-spin 26s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-orb-pulse, .animate-orbit-spin, .animate-orbit-counter-spin { animation: none; }
        }
      `}</style>
    </div>
  );
}