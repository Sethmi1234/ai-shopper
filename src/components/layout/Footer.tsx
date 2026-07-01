import { ShoppingBag, Share2, Globe } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 mb-4">
              <ShoppingBag size={24} className="fill-blue-600 text-blue-600" />
              <span className="text-xl font-bold tracking-tight">AI Shop</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your intelligent shopping companion. Effortless discovery, powered by AI.
            </p>
          </div>

          {/* Explore */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">New Arrivals</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Categories</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Deals</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Stay Updated</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-100/80 px-4 py-2.5 rounded-l-lg text-sm w-full outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2.5 rounded-r-lg text-sm font-medium shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © 2024 AI Shop. Powered by AI.
          </p>
          <div className="flex gap-4 text-gray-400">
            <button className="hover:text-gray-600 transition-colors"><Share2 size={16} /></button>
            <button className="hover:text-gray-600 transition-colors"><Globe size={16} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
