"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("accessToken");
      
      // If token was accidentally saved as the string "undefined" or "null", clear it
      if (token === "undefined" || token === "null" || token === "") {
        token = null;
        localStorage.removeItem("accessToken");
      }

      // Sync token to cookie so Next.js middleware can read it server-side
      if (token) {
        document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.cookie = "accessToken=; path=/; max-age=0";
      }

      // Strict client-side protection
      const isProtected = pathname.startsWith("/dashboard");
      
      if (isProtected && !token) {
        // Unauthenticated user trying to access protected route -> redirect to login
        router.replace("/login");
      } else {
        // Safe to render children
        setIsReady(true);
      }
    }
  }, [pathname, router]);

  // Prevent flashing of protected content while auth state is being verified
  if (!isReady && pathname.startsWith("/dashboard")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Securing connection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}