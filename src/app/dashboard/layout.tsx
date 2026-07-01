"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BotMessageSquare } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-white relative">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        
        {/* Floating Chat Bot Icon */}
        <div className="fixed right-8 bottom-8 z-50">
          <button className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 hover:bg-blue-700 transition-all flex items-center justify-center relative border border-blue-500/20">
            <BotMessageSquare size={26} />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
