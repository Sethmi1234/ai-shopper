"use client";

import { Heart, ShoppingCart, User, ShoppingBag, LogOut, Menu, X, Search, Globe, Truck, RotateCcw, Zap, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("authData");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData?.firstName) {
          setUsername(authData.firstName);
        } else if (authData?.username) {
          setUsername(authData.username);
        }
      } catch (e) {
        console.error("Failed to parse auth data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authData");
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <>
      <header className="w-full sticky top-0 z-50 flex flex-col bg-white border-b border-gray-100 shadow-sm">
        {/* Top Black Banner */}
        <div className="hidden md:flex bg-black text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 justify-center gap-8">
          <div className="flex items-center gap-1.5"><RotateCcw size={12} /> 100 DAYS RETURN POLICY</div>
          <div className="flex items-center gap-1.5"><Globe size={12} /> CLIMATE-NEUTRAL SHIPPING</div>
          <div className="flex items-center gap-1.5"><Zap size={12} /> FLASH SHIPPING UNTIL 3 PM</div>
          <div className="flex items-center gap-1.5"><RefreshCcw size={12} /> FREE RETURNS</div>
        </div>

        {/* Main Header (Logo, Left Links, Right Icons) */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 relative">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-black p-2 -ml-2"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Left Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-6 font-semibold text-sm text-gray-800 flex-1">
            <Link href="/dashboard" className="hover:text-black transition-colors flex items-center gap-1">
              Services <span className="text-[10px] opacity-50">▼</span>
            </Link>
            <Link href="/dashboard" className="hover:text-black transition-colors flex items-center gap-1">
              About Us <span className="text-[10px] opacity-50">▼</span>
            </Link>
            <Link href="/dashboard" className="hover:text-black transition-colors flex items-center gap-1">
              Blog <span className="text-[10px] opacity-50">▼</span>
            </Link>
          </div>

          {/* Center Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 text-black absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">AI SHOP</span>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center justify-end gap-5 flex-1">
            <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-800 mr-2 cursor-pointer">
              EN <span className="text-[10px] opacity-50">▼</span>
            </div>
            
            <button className="hidden sm:block hover:text-black transition-colors text-gray-800">
              <Heart size={20} strokeWidth={2.5} />
            </button>
            
            {username ? (
              <div className="hidden sm:flex items-center gap-2 relative group cursor-pointer text-gray-800">
                <User size={20} strokeWidth={2.5} />
                <span className="text-sm font-bold truncate max-w-[100px]">{username}</span>
                {/* Simple dropdown for logout */}
                <div className="absolute top-full right-0 mt-2 w-32 bg-white shadow-lg border border-gray-100 rounded-md py-2 hidden group-hover:block">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-1 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <button className="hidden sm:flex hover:text-black transition-colors text-gray-800">
                <User size={20} strokeWidth={2.5} />
              </button>
            )}

            <button className="hover:text-black transition-colors relative text-gray-800 flex items-center">
              <ShoppingCart size={20} strokeWidth={2.5} />
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
            </button>
          </div>
        </div>

        {/* Bottom Category Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-8 text-sm font-bold text-gray-700">
            <Link href="/dashboard" className="hover:text-black">Categories</Link>
            <Link href="/dashboard" className="hover:text-black">Brands</Link>
            <Link href="/dashboard" className="hover:text-black">Gender</Link>
            <Link href="/dashboard" className="hover:text-black">Features</Link>
            <Link href="/dashboard" className="hover:text-black">Bestsellers</Link>
            <Link href="/dashboard" className="hover:text-black">Accessories</Link>
            <Link href="/dashboard" className="text-red-500 hover:text-red-600">% Sale</Link>
          </div>
          
          {/* Search Input */}
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Search on AI Shop..." 
              className="bg-gray-50 text-sm py-2 px-4 pr-12 w-64 rounded-none outline-none border border-gray-100 focus:border-gray-300 transition-colors"
            />
            <button className="absolute right-0 top-0 bottom-0 px-3 bg-[#111] hover:bg-black text-white flex items-center justify-center transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden flex justify-start">
          <div className="w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-right">
            <div className="flex justify-between items-center mb-10">
              <span className="text-2xl font-black tracking-tighter uppercase">AI SHOP</span>
              <button 
                className="text-gray-900 p-2 rounded-full hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 font-bold text-lg text-gray-900 flex-1">
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Categories</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Brands</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Bestsellers</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Accessories</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-red-500">% Sale</Link>
            </div>

            {username && (
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-gray-50 text-red-600 font-bold flex items-center justify-center gap-2 mt-4 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={20} />
                Log Out
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
