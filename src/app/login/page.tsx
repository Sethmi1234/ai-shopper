"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/mutations/useLogin";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShoppingBag, ArrowRight, Eye, EyeOff, User, Lock } from "lucide-react";

export default function LoginPage() {
  const { mutate, isPending, data, error } = useLogin();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 border border-[#ccff00]/30 rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-[#ccff00]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#ccff00]/10 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full h-full px-14 py-16">
          {/* Top Logo */}
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#ccff00] flex items-center justify-center">
                <ShoppingBag size={20} className="text-black" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-white">AI SHOP</span>
            </Link>
          </div>

          {/* Center Content */}
          <div className="flex flex-col">
            <div className="mb-10">
              <div className="w-16 h-16 bg-[#ccff00]/10 flex items-center justify-center mb-8">
                <Sparkles size={32} className="text-[#ccff00]" />
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                Smart Shopping
                <br />
                <span className="text-[#ccff00]">Starts Here</span>
              </h2>
              <p className="text-gray-400 text-base max-w-md leading-relaxed">
                Sign in to unlock AI-powered recommendations, personalized deals, and a seamless shopping experience tailored just for you.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-black text-[#ccff00]">10K+</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Products</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#ccff00]">5K+</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Sellers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#ccff00]">50K+</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Customers</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-6 text-xs text-gray-600 font-semibold uppercase tracking-wider">
            <span>AI-Powered</span>
            <span className="w-1 h-1 bg-[#ccff00] rounded-full" />
            <span>24/7 Support</span>
            <span className="w-1 h-1 bg-[#ccff00] rounded-full" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Right - Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-white to-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <ShoppingBag size={18} className="text-[#ccff00]" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-black">AI SHOP</span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to your account to continue shopping.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 outline-none focus:border-black transition-colors text-gray-900 placeholder-gray-400 text-sm font-medium"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-11 pr-11 py-3.5 bg-white border border-gray-200 outline-none focus:border-black transition-colors text-gray-900 placeholder-gray-400 text-sm font-medium"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 text-black focus:ring-black focus:ring-offset-0"
                />
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors font-medium">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-black font-bold uppercase tracking-wider transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-black hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-[#ccff00] font-black uppercase tracking-widest text-sm transition flex items-center justify-center gap-2 group"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-[#ccff00]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Success Message */}
          {data && (
            <div className="mt-6 p-4 bg-[#ccff00]/10 border border-[#ccff00]/30">
              <p className="text-black text-sm font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ccff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Login successful! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm font-bold flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                Invalid username or password. Please try again.
              </p>
            </div>
          )}

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-black font-black uppercase tracking-wider hover:text-gray-600 transition-colors text-xs"
            >
              Sign Up <ArrowRight size={12} className="inline" />
            </button>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-5 bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Demo Credentials</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-bold text-black">Username:</span> emilys</p>
              <p><span className="font-bold text-black">Password:</span> emilyspass</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}