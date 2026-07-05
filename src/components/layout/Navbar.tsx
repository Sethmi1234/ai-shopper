"use client";

import { Heart, ShoppingCart, User, ShoppingBag, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in and get their name
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
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-[#f8f9fc] sticky top-0 z-50">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-blue-600 p-2 -ml-2"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 md:mr-0 mr-auto ml-2 md:ml-0">
          <ShoppingBag size={24} className="fill-blue-600 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">AI Shop</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <Link href="/dashboard" className="text-blue-600 relative">
            Home
            <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-600"></div>
          </Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Categories</Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Products</Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Deals</Link>
        </div>

        {/* Right Section: Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 text-gray-600">
            <button className="hidden sm:block hover:text-blue-600 transition-colors">
              <Heart size={20} />
            </button>
            <button className="hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#f8f9fc]"></span>
            </button>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
              <User size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                {username ? `Hi, ${username}` : "Logged In"}
              </span>
            </div>

            <button 
              onClick={handleLogout}
              className="hidden sm:flex hover:text-red-600 transition-colors items-center gap-1 ml-1"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden flex justify-start">
          <div 
            className="w-[80%] max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-right"
          >
            <div className="flex justify-between items-center mb-8">
              <Link href="/dashboard" className="flex items-center gap-2 text-blue-600" onClick={() => setIsMenuOpen(false)}>
                <ShoppingBag size={24} className="fill-blue-600 text-blue-600" />
                <span className="text-xl font-bold tracking-tight">AI Shop</span>
              </Link>
              <button 
                className="text-gray-500 p-2 rounded-full hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile User Profile */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-semibold">
                  {username ? `Hi, ${username}` : "Logged In"}
                </p>
                <p className="text-xs text-blue-400">Welcome back!</p>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-4 font-semibold text-lg text-gray-800 flex-1">
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-blue-600">Home</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Categories</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Products</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Deals</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>My Favorites</Link>
            </div>

            {/* Mobile Logout */}
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-gray-50 text-red-600 font-semibold rounded-xl flex items-center justify-center gap-2 mt-4 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slide-right 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </>
  );
}
