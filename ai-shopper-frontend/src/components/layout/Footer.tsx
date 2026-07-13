import { Share2, Globe } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white pt-20 pb-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/dashboard" className="flex items-center gap-2 mb-6">
              <span className="text-3xl font-black tracking-tighter uppercase">AI SHOP</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Experience the future of shopping. Curated by artificial intelligence, delivered with exceptional quality and care.
            </p>
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-300">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white/10 px-4 py-3 text-sm w-full outline-none focus:bg-white/20 transition-colors placeholder:text-gray-500 border border-transparent focus:border-white/30"
                />
                <button className="bg-[#ccff00] hover:bg-[#b3e600] text-black px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="flex gap-6 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">YouTube</a>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-1">
            <h3 className="font-bold uppercase tracking-wider mb-6 text-sm">Shop</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Electronics</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Fashion</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Home & Living</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Sports</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-1">
            <h3 className="font-bold uppercase tracking-wider mb-6 text-sm">Service</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Track Order</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Returns & Refunds</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Info</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-1">
            <h3 className="font-bold uppercase tracking-wider mb-6 text-sm">Company</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About AI Shop</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Sustainability</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} AI Shop. All rights reserved.
          </p>
          <div className="flex gap-6 items-center text-gray-500 text-xs">
            <button className="hover:text-white transition-colors flex items-center gap-1.5 uppercase font-semibold">
              <Globe size={14} /> English
            </button>
            <span className="opacity-50">|</span>
            <span>USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
