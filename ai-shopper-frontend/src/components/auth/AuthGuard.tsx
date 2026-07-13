"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let token = localStorage.getItem("accessToken");
    
    if (token === "undefined" || token === "null" || token === "") {
      token = null;
      localStorage.removeItem("accessToken");
    }

    console.log("AuthGuard - Token exists:", !!token);
    console.log("AuthGuard - Token value:", token);
    
    if (!token) {
      console.log("AuthGuard - No token found, redirecting to login");
      router.replace("/login");
    } else {
      console.log("AuthGuard - Token found, allowing access");
      setIsAuthenticated(true);
    }
  }, [router]);

  // Show loading state while checking authentication
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
