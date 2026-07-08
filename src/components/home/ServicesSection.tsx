"use client";

import { useState } from "react";
import {
  Truck,
  RefreshCcw,
  ShieldCheck,
  Headphones,
  Zap,
  Package,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  RotateCcw,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    icon: <Truck size={28} strokeWidth={1.5} />,
    title: "Free Worldwide Delivery",
    desc: "Free shipping on all orders over $50. Express delivery available in 2-4 business days to over 200 countries.",
    features: ["Orders over $50 ship free", "Express 2-4 day delivery", "Real-time tracking", "Insurance included"],
  },
  {
    icon: <RefreshCcw size={28} strokeWidth={1.5} />,
    title: "100% Hassle-Free Returns",
    desc: "Changed your mind? No problem. Return any item within 100 days for a full refund — no questions asked.",
    features: ["100-day return window", "Free return shipping", "Instant refund processing", "No restocking fees"],
  },
  {
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
    title: "Secure AI-Powered Checkout",
    desc: "Your security is our priority. Every transaction is encrypted and monitored by our AI fraud detection system.",
    features: ["256-bit SSL encryption", "AI fraud monitoring", "PCI compliant", "Zero liability protection"],
  },
  {
    icon: <Headphones size={28} strokeWidth={1.5} />,
    title: "24/7 AI & Human Support",
    desc: "Get instant answers from our AI assistant or speak with a real human. We're here whenever you need us.",
    features: ["Instant AI chat support", "Human agents available 24/7", "Multi-language support", "Average 30s response"],
  },
  {
    icon: <Zap size={28} strokeWidth={1.5} />,
    title: "Flash Shipping Program",
    desc: "Order before 3 PM and we'll ship it the same day. Our fastest delivery option gets items to you in hours.",
    features: ["Same-day dispatch", "Flash delivery in hours", "Weekend delivery available", "Real-time driver tracking"],
  },
  {
    icon: <Package size={28} strokeWidth={1.5} />,
    title: "Bulk & Wholesale Orders",
    desc: "Business customers enjoy special pricing, dedicated account managers, and priority processing on bulk orders.",
    features: ["Volume discounts up to 40%", "Dedicated account manager", "Priority processing", "Custom invoicing"],
  },
];

const stats = [
  { value: "2M+", label: "Happy Customers" },
  { value: "50K+", label: "Products Delivered Daily" },
  { value: "99.9%", label: "Uptime & Reliability" },
  { value: "4.9/5", label: "Average Customer Rating" },
];

export default function ServicesSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="services" className="bg-white border-t border-gray-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">What We Offer</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4" style={{ color: 'red' }}>
            Premium Services
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            From lightning-fast delivery to AI-powered security — every aspect of your shopping experience is designed for excellence.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div key={i} className="bg-black text-center py-8 px-4">
              <p className="text-3xl md:text-4xl font-black text-[#ccff00]">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="group bg-gray-50 hover:bg-black transition-all duration-300 p-8 cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            >
              <div className="text-black group-hover:text-[#ccff00] transition-colors duration-300 mb-5">
                {service.icon}
              </div>
              <h3 className="font-bold text-lg mb-3 uppercase tracking-wider transition-colors duration-300 group-hover:text-red-300" 
                  style={{ color: i < 3 ? 'red' : 'black' }}>
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 group-hover:text-gray-300 transition-colors duration-300">
                {service.desc}
              </p>

              {/* Expandable Features */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedIndex === i ? "max-h-60 mt-5" : "max-h-0"
                }`}
              >
                <div className="border-t border-gray-200 group-hover:border-gray-700 pt-4 space-y-2.5">
                  {service.features.map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-2.5">
                      <CheckCircle size={14} className="text-[#ccff00] shrink-0" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-300 transition-colors">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black group-hover:text-[#ccff00] transition-colors">
                {expandedIndex === i ? "Show Less" : "Learn More"}
                <ArrowRight size={12} className={`transition-transform ${expandedIndex === i ? "rotate-90" : ""}`} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 bg-gray-50 p-10 md:p-16 text-center">
          <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 text-sm">
            Contact our enterprise team for tailored solutions, bulk pricing, and dedicated support for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 bg-black text-[#ccff00] px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
            >
              Browse Products <ArrowRight size={16} />
            </Link>
            <button className="inline-flex items-center gap-2 border-2 border-black text-black px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}