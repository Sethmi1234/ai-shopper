"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/components/ai/ChatBot";

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
        
        {/* Floating Chat Bot */}
        <ChatBot />
      </div>
    </AuthGuard>
  );
}
