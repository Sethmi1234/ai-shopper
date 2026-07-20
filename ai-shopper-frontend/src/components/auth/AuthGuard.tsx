"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "../../services/auth.service";

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

    if (!token) {
      router.replace("/login");
      return;
    }

    getAuthUser()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authData");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        document.cookie = "accessToken=; path=/; max-age=0";
        router.replace("/login");
      });
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
