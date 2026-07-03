"use client";

import { Search, Heart, ShoppingCart, User, ShoppingBag, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useWishlist from "@/store/useWishlist";
import useCart from "@/store/useCart";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wishlistCount = useWishlist((s) => s.items.length);
  const cartCount = useCart((s: any) => s.items.reduce((sum: number, item: any) => sum + item.quantity, 0));

  useEffect(() => {
    // Check if user is logged in and get their name & image
    const storedAuth = localStorage.getItem("authData");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData?.firstName) {
          setUsername(authData.firstName);
        } else if (authData?.username) {
          setUsername(authData.username);
        }
        if (authData?.image) {
          setUserImage(authData.image);
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
          <Link href="/dashboard" className={`relative ${pathname === "/dashboard" ? "text-blue-600" : "hover:text-blue-600 transition-colors"}`}>
            Home
            {pathname === "/dashboard" && <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-600"></div>}
          </Link>
          <Link href="/dashboard/category" className={`relative ${pathname === "/dashboard/category" ? "text-blue-600" : "hover:text-blue-600 transition-colors"}`}>
            Categories
            {pathname === "/dashboard/category" && <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-600"></div>}
          </Link>
          <Link href="/dashboard/products" className={`relative ${pathname === "/dashboard/products" ? "text-blue-600" : "hover:text-blue-600 transition-colors"}`}>
            Products
            {pathname === "/dashboard/products" && <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-600"></div>}
          </Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Deals</Link>
        </div>

        {/* Right Section: Search & Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-gray-100/80 px-4 py-2.5 rounded-full min-w-[240px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all border border-transparent focus-within:border-gray-200">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-gray-600">
            <Link href="/dashboard/favorites" className="hidden sm:block hover:text-blue-600 transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] text-[10px] font-bold bg-blue-600 text-white rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/dashboard/cart" className="hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 min-w-[18px] h-4 rounded-full bg-blue-600 text-[10px] text-white font-semibold flex items-center justify-center px-1">
                {cartCount}
              </span>
            </Link>
            
            <Link
              href="/dashboard/profile"
              className="hidden sm:flex items-center gap-2 px-1.5 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                {userImage ? (
                  <Image src={userImage} alt={username || "User"} width={28} height={28} className="object-cover w-full h-full" unoptimized />
                ) : (
                  username?.charAt(0).toUpperCase() || <User size={14} />
                )}
              </div>
              <span className="text-sm font-semibold text-gray-700 pr-1">
                {username || "Profile"}
              </span>
            </Link>

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
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden shrink-0">
                {userImage ? (
                  <Image src={userImage} alt={username || "User"} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div>
                <p className="text-sm text-blue-600 font-semibold">
                  {username ? `Hi, ${username}` : "Logged In"}
                </p>
                <p className="text-xs text-blue-400">Welcome back!</p>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="flex items-center gap-2 bg-gray-100/80 px-4 py-3 rounded-xl mb-8">
              <Search size={18} className="text-gray-400" />
              <input
                placeholder="Search products..."
                className="w-full bg-transparent outline-none text-sm text-gray-700"
              />
            </div>

        {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-4 font-semibold text-lg text-gray-800 flex-1">
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={pathname === "/dashboard" ? "text-blue-600" : ""}>Home</Link>
              <Link href="/dashboard/category" onClick={() => setIsMenuOpen(false)} className={pathname === "/dashboard/category" ? "text-blue-600" : ""}>Categories</Link>
              <Link href="/dashboard/products" onClick={() => setIsMenuOpen(false)} className={pathname === "/dashboard/products" ? "text-blue-600" : ""}>Products</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={pathname === "/dashboard" ? "text-blue-600" : ""}>Deals</Link>
              <Link href="/dashboard/favorites" onClick={() => setIsMenuOpen(false)} className={pathname === "/dashboard/favorites" ? "text-blue-600" : ""}>My Favorites</Link>
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
