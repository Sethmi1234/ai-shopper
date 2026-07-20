"use client";

import { useEffect } from "react";
import AuthGuard from "../../components/auth/AuthGuard";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatBot from "../../components/ai/ChatBot";
import useCart from "../../store/useCart";
import useWishlist from "../../store/useWishlist";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const syncCartFromBackend = useCart((state) => state.syncFromBackend);
  const syncWishlistFromBackend = useWishlist((state) => state.syncFromBackend);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    syncCartFromBackend();
    syncWishlistFromBackend();
  }, [syncCartFromBackend, syncWishlistFromBackend]);

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-white relative">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        
        {/* Floating Chat Bot */}
        <ChatBot />
      </div>
    </AuthGuard>
  );
}
